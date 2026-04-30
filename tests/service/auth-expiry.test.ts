import {
  AUTH_EXPIRED_MESSAGE,
  isAuthExpiredMessage,
  normalizeAuthExpiredDisplayMessage,
  resolveAuthExpiredPrimaryAction,
} from "@/lib/services/auth-expiry";

describe("auth-expiry helpers", () => {
  it("treats token expiry signals as auth-expired", () => {
    expect(isAuthExpiredMessage("token expired")).toBe(true);
    expect(isAuthExpiredMessage("missing or invalid authorization header")).toBe(true);
    expect(isAuthExpiredMessage(AUTH_EXPIRED_MESSAGE)).toBe(true);
  });

  it("normalizes auth-expired text to the login-expired prompt", () => {
    expect(normalizeAuthExpiredDisplayMessage("token expired")).toBe(AUTH_EXPIRED_MESSAGE);
    expect(normalizeAuthExpiredDisplayMessage("登录状态已失效，请重新登录")).toBe(
      AUTH_EXPIRED_MESSAGE,
    );
  });

  it("keeps non-auth errors reloadable", () => {
    expect(normalizeAuthExpiredDisplayMessage("首页加载失败，请稍后重试")).toBe(
      "首页加载失败，请稍后重试",
    );
    expect(resolveAuthExpiredPrimaryAction("首页加载失败，请稍后重试")).toBe("reload");
    expect(resolveAuthExpiredPrimaryAction("token expired")).toBe("relogin");
  });
});
