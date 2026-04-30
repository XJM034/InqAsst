import {
  AUTH_TOKEN_COOKIE,
  clearClientSessionCookies,
  readCookieValue,
} from "@/lib/services/auth-session";
import { API_BASE_URL } from "@/lib/services/api-config";
import {
  AUTH_EXPIRED_MESSAGE,
  dispatchAuthExpired,
  isAuthExpiredMessage,
  isAuthExpiredStatus,
} from "@/lib/services/auth-expiry";
import { ApiRequestError, requestJson, type ApiRequestOptions } from "@/lib/services/http-core";

const isServer = typeof window === "undefined";

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//.test(value);
}

async function resolveServerRequestPath(path: string) {
  if (isAbsoluteUrl(path)) {
    return path;
  }

  if (API_BASE_URL) {
    return path;
  }

  if (!isServer) {
    return path;
  }

  try {
    const { headers } = await import("next/headers");
    const headerStore = await headers();
    const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
    const protocol =
      headerStore.get("x-forwarded-proto") ??
      (host?.includes("localhost") || host?.includes("127.0.0.1") ? "http" : "https");
    const origin = headerStore.get("origin") ?? (host ? `${protocol}://${host}` : null);
    return origin ? new URL(path, origin).toString() : `http://127.0.0.1:3000${path}`;
  } catch {
    return path;
  }
}

export async function hasServerAuthToken() {
  if (isServer) {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      return Boolean(cookieStore.get(AUTH_TOKEN_COOKIE)?.value);
    } catch {
      return false;
    }
  }
  return Boolean(readCookieValue(document.cookie, AUTH_TOKEN_COOKIE));
}

export async function serverRequestJson<T>(
  path: string,
  options: ApiRequestOptions & { auth?: boolean } = {},
) {
  let token: string | null | undefined = null;

  if (options.auth) {
    if (isServer) {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value ?? null;
      } catch {
        token = null;
      }
    } else {
      token = readCookieValue(document.cookie, AUTH_TOKEN_COOKIE);
    }
  }

  const requestPath = await resolveServerRequestPath(path);

  try {
    return await requestJson<T>(requestPath, {
      ...options,
      token,
    });
  } catch (error) {
    if (
      !isServer &&
      options.auth &&
      error instanceof ApiRequestError &&
      (isAuthExpiredStatus(error.status, error.code) || isAuthExpiredMessage(error.message))
    ) {
      clearClientSessionCookies();
      dispatchAuthExpired({
        message: AUTH_EXPIRED_MESSAGE,
      });
    }

    throw error;
  }
}
