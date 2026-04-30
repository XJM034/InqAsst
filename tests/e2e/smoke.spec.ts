import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

import {
  buildAdminCourseStudentEditHref,
  buildAdminCourseStudentNewHref,
  buildAdminEmergencyCourseHref,
  buildAdminExternalTeacherHref,
  buildAdminSelectTeacherHref,
} from "../../lib/admin-route-hrefs";
import { resolveAdminTeacherManagementContext } from "./live-test-helpers";

const teacherPhone = process.env.E2E_TEACHER_PHONE;
const teacherExpectedName = process.env.E2E_TEACHER_EXPECTED_NAME;
const teacherExpectedCampus = process.env.E2E_TEACHER_EXPECTED_CAMPUS;
const adminPhone = process.env.E2E_ADMIN_PHONE;
const adminCampusName = process.env.E2E_ADMIN_CAMPUS_NAME ?? "成都高新云芯学校";
const adminExpectedName = process.env.E2E_ADMIN_EXPECTED_NAME;
const adminExpectedCampus = process.env.E2E_ADMIN_EXPECTED_CAMPUS;
const multiCampusAdminPhone = process.env.E2E_MULTI_CAMPUS_ADMIN_PHONE;
const multiCampusAdminCampusName =
  process.env.E2E_MULTI_CAMPUS_ADMIN_CAMPUS_NAME ?? "成都高新云芯学校";
const multiCampusAdminExpectedName = process.env.E2E_MULTI_CAMPUS_ADMIN_EXPECTED_NAME;
const multiCampusAdminExpectedCampus = process.env.E2E_MULTI_CAMPUS_ADMIN_EXPECTED_CAMPUS;
const loginCode = process.env.E2E_LOGIN_CODE ?? "8888";
const defaultBaseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const liveLoginTimeoutMs = 60_000;
const liveRouteTimeoutMs = 30_000;

function escapeForRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isEmergencyWeeklyRequest(urlString: string) {
  return new URL(urlString).pathname === "/api/admin/emergency/weekly";
}

function isRollCallTeacherRequest(urlString: string) {
  return new URL(urlString).pathname.includes("/roll-call-teacher");
}

function decodeCookieValue(value?: string) {
  if (!value) {
    return value;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function expectPathPrefix(page: Page, prefix: string, timeout = liveRouteTimeoutMs) {
  await expect
    .poll(() => new URL(page.url()).pathname, { timeout })
    .toMatch(new RegExp(`^${escapeForRegex(prefix)}`));
}

async function expectWeekendDayTabs(page: Page) {
  await expect(page.locator("body")).toContainText(/(?:周)?六/);
  await expect(page.locator("body")).toContainText(/(?:周)?日/);
}

type ApiPayload<T> = {
  code?: number;
  data?: T;
};

type AdminRollCallOverviewRow = {
  courseId: number;
};

type AdminCourseStudentRow = {
  studentId: number;
};

type IdentityPayload = {
  role?: string;
  name?: string | null;
  campusName?: string | null;
};

function capturePageErrors(page: Page) {
  const errors: string[] = [];

  page.on("pageerror", (error) => {
    errors.push(error.message);
  });

  return errors;
}

async function finishCampusSelectionIfNeeded(page: Page, campusName?: string) {
  const entryButtons = page.getByRole("button", { name: /进入/ });
  const isVisible = await entryButtons.first().isVisible({ timeout: 5_000 }).catch(() => false);

  if (isVisible) {
    if (campusName) {
      const preferredCampusButton = page
        .getByRole("button", {
          name: new RegExp(`${escapeForRegex(campusName)}.*进入`),
        })
        .first();
      const hasPreferredCampus = await preferredCampusButton
        .isVisible({ timeout: 5_000 })
        .catch(() => false);

      if (hasPreferredCampus) {
        await preferredCampusButton.scrollIntoViewIfNeeded().catch(() => undefined);
        await preferredCampusButton.click();
        return;
      }
    }

    await entryButtons.first().click();
  }
}

async function assertTokenIdentity(
  page: Page,
  request: APIRequestContext,
  baseURL: string,
  expectedRole: "TEACHER" | "ADMIN",
) {
  const token = await getAuthToken(page);

  const payload = await fetchAuthedJson<{ role?: string }>(
    request,
    baseURL,
    token,
    "/api/test/token",
  );
  expect(payload.code).toBe(0);
  expect(payload.data?.role).toBe(expectedRole);

  return token;
}

async function getAuthToken(page: Page) {
  const cookies = await page.context().cookies();
  const token = cookies.find((cookie) => cookie.name === "inqasst_token")?.value;

  expect(token, "登录后应写入 inqasst_token cookie").toBeTruthy();
  return token!;
}

async function expectIdentityCookies(
  page: Page,
  expectedRole: "TEACHER" | "ADMIN",
  expectedName?: string,
  expectedCampus?: string,
) {
  const cookies = await page.context().cookies();
  const roleCookie = cookies.find((cookie) => cookie.name === "inqasst_role")?.value;
  const nameCookie = decodeCookieValue(
    cookies.find((cookie) => cookie.name === "inqasst_name")?.value,
  );
  const campusCookie = decodeCookieValue(
    cookies.find((cookie) => cookie.name === "inqasst_campus")?.value,
  );

  expect(roleCookie).toBe(expectedRole);
  if (expectedName) {
    expect(nameCookie).toBe(expectedName);
  }
  if (expectedCampus) {
    expect(campusCookie).toBe(expectedCampus);
  }
}

async function fetchAuthedJson<T>(
  request: APIRequestContext,
  baseURL: string,
  token: string,
  path: string,
) {
  const response = await request.get(`${baseURL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  expect(response.ok()).toBeTruthy();
  return (await response.json()) as ApiPayload<T>;
}

async function assertIdentitySnapshot(
  page: Page,
  request: APIRequestContext,
  baseURL: string,
  expectedRole: "TEACHER" | "ADMIN",
  expectedName?: string,
  expectedCampus?: string,
) {
  await expectIdentityCookies(page, expectedRole, expectedName, expectedCampus);

  const token = await getAuthToken(page);
  const identityPath = expectedRole === "ADMIN" ? "/api/admin/me" : "/api/me";
  const payload = await fetchAuthedJson<IdentityPayload>(request, baseURL, token, identityPath);

  expect(payload.code).toBe(0);
  expect(payload.data?.role).toBe(expectedRole);

  if (expectedName) {
    expect(payload.data?.name).toBe(expectedName);
  }
  if (expectedCampus) {
    expect(payload.data?.campusName).toBe(expectedCampus);
  }

  const profilePath = expectedRole === "ADMIN" ? "/admin/me" : "/teacher/me";
  await page.goto(profilePath);
  if (expectedName) {
    await expect(page.locator("body")).toContainText(expectedName);
  }
  if (expectedCampus) {
    await expect(page.locator("body")).toContainText(expectedCampus);
  }
}

async function resolveAdminStudentFormContext(
  request: APIRequestContext,
  baseURL: string,
  token: string,
) {
  const overviewPayload = await fetchAuthedJson<AdminRollCallOverviewRow[]>(
    request,
    baseURL,
    token,
    "/api/admin/roll-call/overview",
  );
  expect(overviewPayload.code).toBe(0);

  const courseId = overviewPayload.data?.[0]?.courseId;
  expect(courseId, "管理员账号当天应至少存在一门课程供学生页 smoke 使用").toBeTruthy();

  const studentsPayload = await fetchAuthedJson<AdminCourseStudentRow[]>(
    request,
    baseURL,
    token,
    `/api/admin/courses/${courseId}/students`,
  );
  expect(studentsPayload.code).toBe(0);

  return {
    courseId: String(courseId),
    studentId: studentsPayload.data?.[0]?.studentId
      ? String(studentsPayload.data[0].studentId)
      : null,
  };
}

async function loginThroughUi(
  page: Page,
  phone: string,
  expectedPathPrefix: string,
  campusName?: string,
) {
  await page.goto("/login");
  await page.getByLabel("手机号").fill(phone);
  await page.getByLabel("验证码").fill(loginCode);
  await page.getByRole("button", { name: "登录" }).click();

  const loginResult = await Promise.race([
    page
      .waitForURL((url) => url.pathname.startsWith(expectedPathPrefix), {
        timeout: liveLoginTimeoutMs,
      })
      .then(() => "url" as const)
      .catch(() => null),
    page
      .getByRole("button", { name: /进入/ })
      .first()
      .waitFor({
        state: "visible",
        timeout: liveLoginTimeoutMs,
      })
      .then(() => "campus" as const)
      .catch(() => null),
  ]);

  if (loginResult === "campus") {
    await finishCampusSelectionIfNeeded(page, campusName);
    await expectPathPrefix(page, expectedPathPrefix, liveLoginTimeoutMs);
    return;
  }

  if (loginResult !== "url") {
    throw new Error("登录后未进入目标页面，也未出现校区选择弹窗");
  }
}

async function openTeacherPrimaryFlow(page: Page) {
  const primaryActionButton = page
    .getByRole("button", { name: /开始点名|查看学生名单/ })
    .first();
  const hasPrimaryAction = await primaryActionButton
    .isVisible({ timeout: 5_000 })
    .catch(() => false);

  if (!hasPrimaryAction) {
    const hasNoClassState = await page
      .locator("body")
      .filter({ hasText: "今天暂无排课" })
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (!hasNoClassState) {
      throw new Error("教师首页既没有主操作按钮，也没有无课提示");
    }

    await page.getByRole("link", { name: "点名" }).click();
    await expectPathPrefix(page, "/teacher/attendance");
    return;
  }

  await primaryActionButton.click();

  const teacherFlowResult = await Promise.race([
    page
      .waitForURL(
        (url) =>
          url.pathname.startsWith("/teacher/attendance/session") ||
          url.pathname.startsWith("/teacher/attendance/demo") ||
          url.pathname.startsWith("/teacher/home/roster"),
        {
          timeout: 20_000,
        },
      )
      .then(() => "url" as const)
      .catch(() => null),
    page
      .getByRole("dialog")
      .waitFor({
        state: "visible",
        timeout: 20_000,
      })
      .then(() => "dialog" as const)
      .catch(() => null),
  ]);

  if (teacherFlowResult === "dialog") {
    const goRoster = await page
      .getByRole("link", { name: "查看学生名单" })
      .isVisible()
      .catch(() => false);

    if (goRoster) {
      await page.getByRole("link", { name: "查看学生名单" }).click();
      await expectPathPrefix(page, "/teacher/home/roster");
      return;
    }

    await page.getByRole("link", { name: "进入点名页" }).click();
    await expect(page).toHaveURL(/\/teacher\/attendance\/session|\/teacher\/attendance\/demo/);
    return;
  }

  if (teacherFlowResult !== "url") {
    throw new Error("教师首页主操作未跳转到点名页或学生名单页");
  }
}

test("login page renders without page errors", async ({ page }) => {
  const pageErrors = capturePageErrors(page);

  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "到了么" })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("teacher smoke covers login, token validation, and attendance entry", async ({
  page,
  request,
}, testInfo) => {
  test.skip(!teacherPhone, "E2E_TEACHER_PHONE 未设置，跳过教师 live smoke。");
  test.setTimeout(90_000);

  const pageErrors = capturePageErrors(page);
  const baseURL = String(testInfo.project.use.baseURL ?? defaultBaseURL);

  await loginThroughUi(page, teacherPhone!, "/teacher");
  await assertTokenIdentity(page, request, baseURL, "TEACHER");

  await expect(page).toHaveURL(/\/teacher\/home/);
  await expect(page.locator("body")).toContainText(/本周排课|今天暂无排课|明日行程|今日代课课程/, {
    timeout: 15_000,
  });

  await expectWeekendDayTabs(page);

  await openTeacherPrimaryFlow(page);
  await expect(page.locator("body")).toContainText(/点名|学生名单|名单|提交|无课/, {
    timeout: 15_000,
  });

  await assertIdentitySnapshot(
    page,
    request,
    baseURL,
    "TEACHER",
    teacherExpectedName,
    teacherExpectedCampus,
  );
  expect(pageErrors).toEqual([]);
});

test("admin smoke covers login, token validation, and read-only admin routes", async ({
  page,
  request,
}, testInfo) => {
  test.skip(!adminPhone, "E2E_ADMIN_PHONE 未设置，跳过管理员 live smoke。");
  test.setTimeout(150_000);

  const pageErrors = capturePageErrors(page);
  const baseURL = String(testInfo.project.use.baseURL ?? defaultBaseURL);

  await loginThroughUi(page, adminPhone!, "/admin", adminCampusName);
  const token = await assertTokenIdentity(page, request, baseURL, "ADMIN");

  await expect(page).toHaveURL(/\/admin\/home/);
  await expect(page.locator("body")).toContainText(/今日生效规则|老师设置|常用入口/, {
    timeout: 15_000,
  });

  await page.goto("/admin/control");
  await expect(page.locator("body")).toContainText(/总控|点名|班级/);

  await page.goto("/admin/unarrived");
  await expect(page.locator("body")).toContainText(/未到学生|异常|搜索/);

  await page.goto("/admin/time-settings");
  await expect(page.locator("body")).toContainText(/时间设置|实际上课时间|点名时间/);

  await expectWeekendDayTabs(page);

  await page.goto("/admin/course-teachers");
  await expect(page.locator("body")).toContainText(/查看课程老师|当前还没有老师安排|课程/);

  await expectWeekendDayTabs(page);

  const emergencyWeeklyRequests: string[] = [];
  const emergencyTeacherDetailRequests: string[] = [];
  page.on("request", (requestEvent) => {
    const requestUrl = requestEvent.url();
    if (isEmergencyWeeklyRequest(requestUrl)) {
      emergencyWeeklyRequests.push(requestUrl);
    }
    if (isRollCallTeacherRequest(requestUrl)) {
      emergencyTeacherDetailRequests.push(requestUrl);
    }
  });

  await page.goto("/admin/emergency");
  await expect(page.locator("body")).toContainText(
    /老师设置|今日代课老师|全部课程|未找到匹配的课程|课程/,
  );
  await expect
    .poll(() => emergencyWeeklyRequests.length, { timeout: 15_000 })
    .toBeGreaterThan(0);

  await expectWeekendDayTabs(page);

  const teacherContext = await resolveAdminTeacherManagementContext(request, baseURL, token);

  if (teacherContext) {
    await expect
      .poll(() => emergencyWeeklyRequests.length, { timeout: 15_000 })
      .toBe(teacherContext.weeklyTotalPages);
    let expectedEmergencyRequestCount = emergencyWeeklyRequests.length;

    if (teacherContext.hasNextPage) {
      await page.getByRole("button", { name: "下一页" }).click();
      await expect
        .poll(() => emergencyWeeklyRequests.length, { timeout: 15_000 })
        .toBe(expectedEmergencyRequestCount);
    }

    if (teacherContext.alternateDayLabel) {
      const switchDayResponse = page.waitForResponse(
        (response) => {
          if (!isEmergencyWeeklyRequest(response.url())) {
            return false;
          }
          const url = new URL(response.url());
          return url.searchParams.get("dayKey") !== null && url.searchParams.get("page") === "0";
        },
        {
          timeout: 15_000,
        },
      );
      await page.getByRole("button", { name: teacherContext.alternateDayLabel }).click();
      await switchDayResponse;
      await expect
        .poll(() => emergencyWeeklyRequests.length, { timeout: 15_000 })
        .toBeGreaterThan(expectedEmergencyRequestCount);
      expectedEmergencyRequestCount = emergencyWeeklyRequests.length;
    }

    if (teacherContext.searchTerm) {
      const searchResponse = page.waitForResponse(
        (response) =>
          isEmergencyWeeklyRequest(response.url()) &&
          new URL(response.url()).searchParams.get("q") === teacherContext.searchTerm,
        {
          timeout: 15_000,
        },
      );
      await page
        .getByPlaceholder("搜索课程名 / 默认负责老师")
        .fill(teacherContext.searchTerm);
      await searchResponse;
      await expect
        .poll(() => emergencyWeeklyRequests.length, { timeout: 15_000 })
        .toBeGreaterThan(expectedEmergencyRequestCount);
      expectedEmergencyRequestCount = emergencyWeeklyRequests.length;
    }

    expect(emergencyTeacherDetailRequests).toEqual([]);

    await page.goto("/admin/course-settings");
    await expect(page.locator("body")).toContainText(/课程设置|今日生效课程|编辑课程信息|当前还没有今日生效课程/);
    const editCourseLink = page.getByRole("link", { name: "编辑课程信息" }).first();
    const hasEditableCourse = await editCourseLink.isVisible({ timeout: 5_000 }).catch(() => false);
    if (hasEditableCourse) {
      await editCourseLink.click();
      await expect(page.locator("body")).toContainText(/编辑课程信息|上课地点|保存课程信息|移出今日行课/);
    }

    await page.goto(
      buildAdminEmergencyCourseHref(teacherContext.courseId, {
        courseSessionId: teacherContext.courseSessionId,
      }),
    );
    await expect(page.locator("body")).toContainText(
      new RegExp(
        `${escapeForRegex(teacherContext.courseName)}|${escapeForRegex(teacherContext.currentTeacherLabel)}|更换点名老师`,
      ),
    );

    await page.goto(
      buildAdminSelectTeacherHref(teacherContext.courseId, {
        courseSessionId: teacherContext.courseSessionId,
      }),
    );
    await expect(page.locator("body")).toContainText(/更换点名老师|可选老师列表|录入系统外老师|系统外老师/);

    await page.goto(
      buildAdminExternalTeacherHref(teacherContext.courseId, {
        courseSessionId: teacherContext.courseSessionId,
      }),
    );
    await expect(page.locator("body")).toContainText(/老师姓名|手机号|保存并选择/);
  }

  const { courseId, studentId } = await resolveAdminStudentFormContext(request, baseURL, token);

  await page.goto(buildAdminCourseStudentNewHref(courseId));
  await expect(page.locator("body")).toContainText(/新增学生|学生信息|保存学生/);
  await expect(page.locator("body")).toContainText(/学生ID|行政班/);

  if (studentId) {
    await page.goto(buildAdminCourseStudentEditHref(courseId, studentId));
    await expect(page.locator("body")).toContainText(/编辑学生|保存修改/);
    await expect(page.locator("body")).toContainText(/学生ID|行政班/);
  }

  await assertIdentitySnapshot(
    page,
    request,
    baseURL,
    "ADMIN",
    adminExpectedName,
    adminExpectedCampus,
  );
  expect(pageErrors).toEqual([]);
});

test("multi-campus admin login can complete campus selection when configured", async ({
  page,
  request,
}, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL ?? defaultBaseURL);
  test.skip(
    !multiCampusAdminPhone,
    "E2E_MULTI_CAMPUS_ADMIN_PHONE 未设置，跳过多校区管理员 smoke。",
  );
  test.setTimeout(120_000);

  await loginThroughUi(
    page,
    multiCampusAdminPhone!,
    "/admin",
    multiCampusAdminCampusName,
  );
  await expect(page).toHaveURL(/\/admin\/home/);
  await assertIdentitySnapshot(
    page,
    request,
    baseURL,
    "ADMIN",
    multiCampusAdminExpectedName,
    multiCampusAdminExpectedCampus,
  );
});
