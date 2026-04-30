export const AUTH_EXPIRED_EVENT = "inqasst:auth-expired";
export const AUTH_EXPIRED_TITLE = "登录失效";
export const AUTH_EXPIRED_MESSAGE = "登录失效，请重新登录";

type AuthExpiredDetail = {
  message?: string;
};

export function isAuthExpiredStatus(status?: number, code?: number) {
  return status === 401 || code === 40101;
}

export function isAuthExpiredMessage(message?: string | null) {
  if (!message) {
    return false;
  }

  const normalized = message.trim().toLowerCase();
  return (
    normalized === AUTH_EXPIRED_MESSAGE.toLowerCase() ||
    normalized === "登录状态已失效，请重新登录" ||
    normalized === "invalid token" ||
    normalized === "missing or invalid authorization header" ||
    normalized === "selection token expired" ||
    normalized.includes("token expired")
  );
}

export function normalizeAuthExpiredDisplayMessage(
  message?: string | null,
  fallback?: string,
) {
  if (isAuthExpiredMessage(message)) {
    return AUTH_EXPIRED_MESSAGE;
  }

  if (message?.trim()) {
    return message;
  }

  return fallback ?? AUTH_EXPIRED_MESSAGE;
}

export function resolveAuthExpiredPrimaryAction(message?: string | null) {
  if (isAuthExpiredMessage(message)) {
    return "relogin" as const;
  }

  return "reload" as const;
}

export function dispatchAuthExpired(detail?: AuthExpiredDetail) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<AuthExpiredDetail>(AUTH_EXPIRED_EVENT, {
      detail,
    }),
  );
}
