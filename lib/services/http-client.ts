import { AUTH_TOKEN_COOKIE, readCookieValue } from "@/lib/services/auth-session";
import { clearClientSessionCookies } from "@/lib/services/auth-session";
import {
  AUTH_EXPIRED_MESSAGE,
  dispatchAuthExpired,
  isAuthExpiredMessage,
  isAuthExpiredStatus,
} from "@/lib/services/auth-expiry";
import { requestJson, type ApiRequestOptions } from "@/lib/services/http-core";
import { ApiRequestError } from "@/lib/services/http-core";

function getClientToken() {
  if (typeof document === "undefined") {
    return null;
  }

  return readCookieValue(document.cookie, AUTH_TOKEN_COOKIE);
}

export async function browserRequestJson<T>(
  path: string,
  options: ApiRequestOptions & { auth?: boolean } = {},
) {
  const token = options.auth ? getClientToken() : null;

  try {
    return await requestJson<T>(path, {
      ...options,
      token,
    });
  } catch (error) {
    if (
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
