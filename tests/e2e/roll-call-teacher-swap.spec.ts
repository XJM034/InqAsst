import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const ADMIN_PHONE = "18808050940";
const LOGIN_CODE = process.env.E2E_LOGIN_CODE ?? "8888";
const CAMPUS_NAME = process.env.E2E_ADMIN_CAMPUS_NAME ?? "成都高新云芯学校";
const COURSE_ID = "4035";
const COURSE_SESSION_ID = "3345";
const CAMPUS_ID = "144";
const SELECT_PATH = `/admin/emergency/course/_/select-teacher?courseId=${COURSE_ID}&courseSessionId=${COURSE_SESSION_ID}&campus=${CAMPUS_ID}`;
const COURSE_PATH = `/admin/emergency/course/_?courseId=${COURSE_ID}&courseSessionId=${COURSE_SESSION_ID}&campus=${CAMPUS_ID}`;
const defaultBaseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

type ApiPayload<T> = {
  code?: number;
  message?: string;
  data?: T;
};

type RollCallTeacherDto = {
  courseId?: number | null;
  courseName?: string | null;
  sessionStartAt?: string | null;
  sessionEndAt?: string | null;
  defaultTeacherId?: number | null;
  currentTeacherId?: number | null;
  currentTeacherName?: string | null;
  currentTeacherPhone?: string | null;
};

type RollCallTeacherOption = {
  teacherId: number;
  teacherName?: string | null;
  phone?: string | null;
};

type PagedRows<T> = {
  items: T[];
};

type TeacherSettingsOverviewRow = {
  courseId: number;
  sessionId: number;
  sessionStartAt: string;
  sessionEndAt: string;
  defaultTeacherId?: number | null;
  rollCallTeacherId?: number | null;
};

type SwapContext = {
  sourceSessionId: string;
  targetSessionId: string;
  originalTeacherId: number;
  swappedTeacherId: number;
  originalTeacherLabel: string;
  swappedTeacherLabel: string;
  swappedTeacherName: string;
};

function formatTeacherLabel(name?: string | null, phone?: string | null) {
  return [name, phone].filter(Boolean).join(" · ");
}

function getWeekStart(dateTime: string) {
  const date = new Date(`${dateTime}+08:00`);
  const day = date.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + mondayOffset);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${dayOfMonth}`;
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

async function putAuthedJson<T>(
  request: APIRequestContext,
  baseURL: string,
  token: string,
  path: string,
  body: unknown,
) {
  const response = await request.put(`${baseURL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: body,
  });

  expect(response.ok()).toBeTruthy();
  return (await response.json()) as ApiPayload<T>;
}

async function getAuthToken(page: Page) {
  const cookies = await page.context().cookies();
  const token = cookies.find((cookie) => cookie.name === "inqasst_token")?.value;
  expect(token, "登录后应写入 inqasst_token cookie").toBeTruthy();
  return token!;
}

async function finishCampusSelectionIfNeeded(page: Page, campusName?: string) {
  const entryButtons = page.getByRole("button", { name: /进入/ });
  const isVisible = await entryButtons.first().isVisible({ timeout: 5_000 }).catch(() => false);

  if (!isVisible) {
    return;
  }

  if (campusName) {
    const preferredCampusButton = page
      .getByRole("button", {
        name: new RegExp(`${campusName}.*进入`),
      })
      .first();
    const hasPreferredCampus = await preferredCampusButton
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (hasPreferredCampus) {
      await preferredCampusButton.click();
      return;
    }
  }

  await entryButtons.first().click();
}

async function loginAdmin(page: Page) {
  await page.goto("/login");
  await page.locator("input").nth(0).fill(ADMIN_PHONE);
  await page.locator("input").nth(1).fill(LOGIN_CODE);
  await page.getByRole("button", { name: "登录" }).click();

  const loginResult = await Promise.race([
    page
      .waitForURL((url) => url.pathname.startsWith("/admin"), { timeout: 60_000 })
      .then(() => "url" as const)
      .catch(() => null),
    page
      .getByRole("button", { name: /进入/ })
      .first()
      .waitFor({ state: "visible", timeout: 60_000 })
      .then(() => "campus" as const)
      .catch(() => null),
  ]);

  if (loginResult === "campus") {
    await finishCampusSelectionIfNeeded(page, CAMPUS_NAME);
    await expect(page).toHaveURL(/\/admin\//, { timeout: 60_000 });
    return;
  }

  expect(loginResult).toBe("url");
}

async function waitForTeacherLabel(
  request: APIRequestContext,
  baseURL: string,
  token: string,
  courseSessionId: string,
  expectedLabel: string,
) {
  await expect
    .poll(async () => {
      const payload = await fetchAuthedJson<RollCallTeacherDto>(
        request,
        baseURL,
        token,
        `/api/admin/course-sessions/${courseSessionId}/roll-call-teacher`,
      );

      return formatTeacherLabel(
        payload.data?.currentTeacherName,
        payload.data?.currentTeacherPhone,
      );
    }, { timeout: 30_000, intervals: [1_000, 1_500, 2_000] })
    .toBe(expectedLabel);
}

async function resolveSwapContext(
  request: APIRequestContext,
  baseURL: string,
  token: string,
) {
  const rollPayload = await fetchAuthedJson<RollCallTeacherDto>(
    request,
    baseURL,
    token,
    `/api/admin/course-sessions/${COURSE_SESSION_ID}/roll-call-teacher`,
  );
  const originalTeacherLabel = formatTeacherLabel(
    rollPayload.data?.currentTeacherName,
    rollPayload.data?.currentTeacherPhone,
  );
  const originalTeacherId = rollPayload.data?.currentTeacherId;
  const sourceSessionStartAt = rollPayload.data?.sessionStartAt;
  const sourceSessionEndAt = rollPayload.data?.sessionEndAt;

  expect(originalTeacherLabel).toBeTruthy();
  expect(originalTeacherId).toBeTruthy();
  expect(sourceSessionStartAt).toBeTruthy();
  expect(sourceSessionEndAt).toBeTruthy();

  const optionsPayload = await fetchAuthedJson<PagedRows<RollCallTeacherOption>>(
    request,
    baseURL,
    token,
    `/api/admin/course-sessions/${COURSE_SESSION_ID}/roll-call-teacher/options?teacherType=ALL&page=0&size=50&q=%E9%AB%98%E9%91%AB`,
  );
  const candidate = optionsPayload.data?.items?.[0];
  expect(candidate?.teacherId).toBeTruthy();
  expect(candidate?.teacherName).toBeTruthy();

  const swappedTeacherLabel = formatTeacherLabel(candidate?.teacherName, candidate?.phone);
  expect(swappedTeacherLabel).toBeTruthy();

  const overviewPayload = await fetchAuthedJson<TeacherSettingsOverviewRow[]>(
    request,
    baseURL,
    token,
    `/api/admin/teacher-settings/overview?weekStart=${getWeekStart(sourceSessionStartAt!)}`,
  );
  const targetSession = (overviewPayload.data ?? []).find((row) => {
    if (row.sessionId === Number(COURSE_SESSION_ID)) {
      return false;
    }

    const ownsTeacher =
      row.defaultTeacherId === candidate?.teacherId || row.rollCallTeacherId === candidate?.teacherId;

    return (
      ownsTeacher &&
      row.sessionStartAt === sourceSessionStartAt &&
      row.sessionEndAt === sourceSessionEndAt
    );
  });

  expect(targetSession?.sessionId).toBeTruthy();

  return {
    sourceSessionId: COURSE_SESSION_ID,
    targetSessionId: String(targetSession!.sessionId),
    originalTeacherId: originalTeacherId!,
    swappedTeacherId: candidate!.teacherId,
    originalTeacherLabel,
    swappedTeacherLabel,
    swappedTeacherName: candidate!.teacherName!,
  } satisfies SwapContext;
}

async function restoreSwapViaApi(
  request: APIRequestContext,
  baseURL: string,
  token: string,
  context: SwapContext,
) {
  await putAuthedJson(
    request,
    baseURL,
    token,
    "/api/admin/roll-call-teacher/batch",
    {
      sessionDate: "2026-04-23",
      assignments: [
        {
          courseSessionId: Number(context.sourceSessionId),
          teacherId: context.originalTeacherId,
        },
        {
          courseSessionId: Number(context.targetSessionId),
          teacherId: context.swappedTeacherId,
        },
      ],
    },
  );
}

async function selectTeacherByLabel(page: Page, label: string) {
  const teacherButton = page
    .getByRole("button")
    .filter({ hasText: label })
    .first();
  await expect(teacherButton).toBeVisible({ timeout: 15_000 });
  await teacherButton.click();
}

test("admin can swap roll-call teachers and swap back through the UI", async ({
  page,
  request,
}, testInfo) => {
  test.setTimeout(180_000);

  const baseURL = String(testInfo.project.use.baseURL ?? defaultBaseURL);
  let swapContext: SwapContext | null = null;
  let swapApplied = false;

  await loginAdmin(page);
  const token = await getAuthToken(page);
  swapContext = await resolveSwapContext(request, baseURL, token);

  try {
    await page.goto(SELECT_PATH);
    await expect(page.locator("input").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("body")).toContainText(swapContext.originalTeacherLabel, {
      timeout: 20_000,
    });
    await page.locator("input").first().fill(swapContext.swappedTeacherName);
    await selectTeacherByLabel(page, swapContext.swappedTeacherLabel);
    await expect(page.locator("[role='dialog']")).toContainText("确认互换当日点名课程");
    await page.getByRole("button", { name: "确认互换" }).click();

    await page.waitForURL((url) => url.pathname.startsWith("/admin/emergency/course"), {
      timeout: 30_000,
    });
    await expect(page).toHaveURL(
      new RegExp(`${COURSE_PATH.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
    );
    await waitForTeacherLabel(
      request,
      baseURL,
      token,
      swapContext.sourceSessionId,
      swapContext.swappedTeacherLabel,
    );
    await waitForTeacherLabel(
      request,
      baseURL,
      token,
      swapContext.targetSessionId,
      swapContext.originalTeacherLabel,
    );
    await expect(page.locator("body")).toContainText(swapContext.swappedTeacherLabel);
    swapApplied = true;

    await page.goto(SELECT_PATH);
    await expect(page.locator("input").first()).toBeVisible({ timeout: 20_000 });
    await page.locator("input").first().fill(swapContext.originalTeacherLabel.split(" · ")[0]);
    await selectTeacherByLabel(page, swapContext.originalTeacherLabel);
    await expect(page.locator("[role='dialog']")).toContainText("确认互换当日点名课程");
    await page.getByRole("button", { name: "确认互换" }).click();

    await page.waitForURL((url) => url.pathname.startsWith("/admin/emergency/course"), {
      timeout: 30_000,
    });
    await waitForTeacherLabel(
      request,
      baseURL,
      token,
      swapContext.sourceSessionId,
      swapContext.originalTeacherLabel,
    );
    await waitForTeacherLabel(
      request,
      baseURL,
      token,
      swapContext.targetSessionId,
      swapContext.swappedTeacherLabel,
    );
    await expect(page.locator("body")).toContainText(swapContext.originalTeacherLabel);
    swapApplied = false;
  } finally {
    if (swapContext) {
      const sourcePayload = await fetchAuthedJson<RollCallTeacherDto>(
        request,
        baseURL,
        token,
        `/api/admin/course-sessions/${swapContext.sourceSessionId}/roll-call-teacher`,
      );
      const currentSourceTeacherLabel = formatTeacherLabel(
        sourcePayload.data?.currentTeacherName,
        sourcePayload.data?.currentTeacherPhone,
      );

      if (currentSourceTeacherLabel === swapContext.swappedTeacherLabel) {
        await restoreSwapViaApi(request, baseURL, token, swapContext);
        await waitForTeacherLabel(
          request,
          baseURL,
          token,
          swapContext.sourceSessionId,
          swapContext.originalTeacherLabel,
        );
      }
    }
  }
});
