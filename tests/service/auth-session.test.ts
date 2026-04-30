/**
 * @vitest-environment jsdom
 */

import {
  AUTH_TOKEN_COOKIE,
  USER_ADMIN_ID_COOKIE,
  USER_CAMPUS_OPTIONS_COOKIE,
  clearClientSessionCookies,
  parseStoredCampusOptions,
  readCookieValue,
  resolveHomeHref,
  setClientSessionCookies,
} from "@/lib/services/auth-session";

describe("auth-session helpers", () => {
  beforeEach(() => {
    document.cookie = `${AUTH_TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax`;
    document.cookie = `${USER_ADMIN_ID_COOKIE}=; path=/; max-age=0; samesite=lax`;
    document.cookie = `${USER_CAMPUS_OPTIONS_COOKIE}=; path=/; max-age=0; samesite=lax`;
  });

  it("parses stored campus options defensively", () => {
    expect(parseStoredCampusOptions("not-json")).toEqual([]);
    expect(
      parseStoredCampusOptions(
        JSON.stringify([
          {
            campusId: 22,
            campusName: "南山校区",
            adminUserId: 61,
            adminName: "张老师",
          },
        ]),
      ),
    ).toEqual([
      {
        campusId: "22",
        campusName: "南山校区",
        adminUserId: 61,
        adminName: "张老师",
      },
    ]);
  });

  it("writes and clears client session cookies", () => {
    setClientSessionCookies({
      token: "token-123",
      role: "ADMIN",
      name: "张老师",
      campusName: "南山校区",
      adminUserId: 61,
      campusOptions: [
        {
          campusId: "22",
          campusName: "南山校区",
          adminUserId: 61,
          adminName: "张老师",
        },
      ],
    });

    expect(readCookieValue(document.cookie, AUTH_TOKEN_COOKIE)).toBe("token-123");
    expect(readCookieValue(document.cookie, USER_ADMIN_ID_COOKIE)).toBe("61");
    expect(
      parseStoredCampusOptions(readCookieValue(document.cookie, USER_CAMPUS_OPTIONS_COOKIE)),
    ).toEqual([
      {
        campusId: "22",
        campusName: "南山校区",
        adminUserId: 61,
        adminName: "张老师",
      },
    ]);

    clearClientSessionCookies();

    expect(readCookieValue(document.cookie, AUTH_TOKEN_COOKIE)).toBeNull();
    expect(readCookieValue(document.cookie, USER_ADMIN_ID_COOKIE)).toBeNull();
    expect(readCookieValue(document.cookie, USER_CAMPUS_OPTIONS_COOKIE)).toBeNull();
  });

  it("resolves home href by role", () => {
    expect(resolveHomeHref("ADMIN")).toBe("/admin/home");
    expect(resolveHomeHref("teacher")).toBe("/teacher/home");
    expect(resolveHomeHref(null)).toBe("/teacher/home");
  });
});
