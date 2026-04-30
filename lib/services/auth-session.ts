export const AUTH_TOKEN_COOKIE = "inqasst_token";
export const USER_ROLE_COOKIE = "inqasst_role";
export const USER_NAME_COOKIE = "inqasst_name";
export const USER_CAMPUS_COOKIE = "inqasst_campus";
export const USER_ADMIN_ID_COOKIE = "inqasst_admin_user_id";
export const USER_CAMPUS_OPTIONS_COOKIE = "inqasst_campus_options";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export type StoredCampusOption = {
  campusId: string;
  campusName?: string | null;
  adminUserId: number;
  adminName?: string | null;
};

export function readCookieValue(cookieString: string, name: string) {
  const prefix = `${name}=`;

  for (const segment of cookieString.split(";")) {
    const value = segment.trim();

    if (value.startsWith(prefix)) {
      return decodeURIComponent(value.slice(prefix.length));
    }
  }

  return null;
}

function writeClientCookie(name: string, value: string, maxAge = SESSION_MAX_AGE_SECONDS) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

function clearClientCookie(name: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

function writeOptionalClientCookie(name: string, value?: string | null) {
  if (value) {
    writeClientCookie(name, value);
    return;
  }

  clearClientCookie(name);
}

export function parseStoredCampusOptions(value?: string | null) {
  if (!value) {
    return [] as StoredCampusOption[];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [] as StoredCampusOption[];
    }

    return parsed.flatMap((item) => {
      if (
        !item ||
        typeof item !== "object" ||
        typeof item.adminUserId !== "number" ||
        (!("campusId" in item) && !("campusName" in item))
      ) {
        return [];
      }

      const campusId =
        typeof item.campusId === "number" || typeof item.campusId === "string"
          ? String(item.campusId)
          : "";

      if (!campusId) {
        return [];
      }

      return [
        {
          campusId,
          campusName:
            typeof item.campusName === "string" ? item.campusName : null,
          adminUserId: item.adminUserId,
          adminName: typeof item.adminName === "string" ? item.adminName : null,
        } satisfies StoredCampusOption,
      ];
    });
  } catch {
    return [] as StoredCampusOption[];
  }
}

export function readClientCampusOptions() {
  if (typeof document === "undefined") {
    return [] as StoredCampusOption[];
  }

  return parseStoredCampusOptions(
    readCookieValue(document.cookie, USER_CAMPUS_OPTIONS_COOKIE),
  );
}

export function readClientAdminUserId() {
  if (typeof document === "undefined") {
    return null;
  }

  const value = readCookieValue(document.cookie, USER_ADMIN_ID_COOKIE);

  if (!value) {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export function setClientSessionCookies(session: {
  token: string;
  role?: string | null;
  name?: string | null;
  campusName?: string | null;
  adminUserId?: number | null;
  campusOptions?: StoredCampusOption[] | null;
}) {
  const serializedCampusOptions = session.campusOptions?.length
    ? JSON.stringify(session.campusOptions)
    : null;

  writeClientCookie(AUTH_TOKEN_COOKIE, session.token);
  writeOptionalClientCookie(USER_ROLE_COOKIE, session.role);
  writeOptionalClientCookie(USER_NAME_COOKIE, session.name);
  writeOptionalClientCookie(USER_CAMPUS_COOKIE, session.campusName);
  writeOptionalClientCookie(
    USER_ADMIN_ID_COOKIE,
    session.adminUserId ? String(session.adminUserId) : null,
  );
  // Multi-campus admin accounts can exceed browser cookie limits, so only keep a small fallback copy.
  writeOptionalClientCookie(
    USER_CAMPUS_OPTIONS_COOKIE,
    serializedCampusOptions && serializedCampusOptions.length <= 3000
      ? serializedCampusOptions
      : null,
  );
}

export function clearClientSessionCookies() {
  clearClientCookie(AUTH_TOKEN_COOKIE);
  clearClientCookie(USER_ROLE_COOKIE);
  clearClientCookie(USER_NAME_COOKIE);
  clearClientCookie(USER_CAMPUS_COOKIE);
  clearClientCookie(USER_ADMIN_ID_COOKIE);
  clearClientCookie(USER_CAMPUS_OPTIONS_COOKIE);
}

export function resolveHomeHref(role?: string | null) {
  if (!role) {
    return "/teacher/home";
  }

  return role.toUpperCase().includes("ADMIN") ? "/admin/home" : "/teacher/home";
}
