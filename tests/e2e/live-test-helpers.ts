import { expect, type APIRequestContext } from "@playwright/test";

type ApiPayload<T> = {
  code?: number;
  data?: T;
};

type AdminEmergencyWeeklyCourse = {
  courseId: number;
  courseName: string;
  sessionId: number;
  defaultTeacherName?: string | null;
  currentTeacherName?: string | null;
};

type AdminEmergencyWeeklyDay = {
  key: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  label: string;
};

type AdminEmergencyWeeklyPayload = {
  selectedDayKey: AdminEmergencyWeeklyDay["key"];
  days: AdminEmergencyWeeklyDay[];
  courses: {
    items: AdminEmergencyWeeklyCourse[];
    totalPages: number;
    page: number;
  };
};

type RollCallTeacherPayload = {
  defaultTeacherName?: string | null;
  currentTeacherName?: string | null;
};

type RollCallTeacherOption = {
  teacherName: string;
  selected?: boolean;
};

type PagedRows<T> = {
  items: T[];
};

function getShanghaiWeekStart() {
  const shanghaiNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }),
  );
  const day = shanghaiNow.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  shanghaiNow.setDate(shanghaiNow.getDate() + mondayOffset);
  const year = shanghaiNow.getFullYear();
  const month = String(shanghaiNow.getMonth() + 1).padStart(2, "0");
  const date = String(shanghaiNow.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
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

export async function resolveAdminTeacherManagementContext(
  request: APIRequestContext,
  baseURL: string,
  token: string,
) {
  const weeklyPayload = await fetchAuthedJson<AdminEmergencyWeeklyPayload>(
    request,
    baseURL,
    token,
    `/api/admin/emergency/weekly?weekStart=${getShanghaiWeekStart()}&page=0&size=20`,
  );
  expect(weeklyPayload.code).toBe(0);

  const weeklyRow = weeklyPayload.data?.courses.items.find(
    (item) => Boolean(item.courseId) && Boolean(item.sessionId),
  );
  if (!weeklyRow) {
    return null;
  }

  const teacherPayload = await fetchAuthedJson<RollCallTeacherPayload>(
    request,
    baseURL,
    token,
    `/api/admin/course-sessions/${weeklyRow.sessionId}/roll-call-teacher`,
  );
  expect(teacherPayload.code).toBe(0);

  const optionsPayload = await fetchAuthedJson<PagedRows<RollCallTeacherOption>>(
    request,
    baseURL,
    token,
    `/api/admin/course-sessions/${weeklyRow.sessionId}/roll-call-teacher/options?teacherType=ALL&page=0&size=20`,
  );
  expect(optionsPayload.code).toBe(0);

  const optionItems = optionsPayload.data?.items ?? [];
  const alternativeTeacher =
    optionItems.find((item) => !item.selected)?.teacherName ??
    optionItems[0]?.teacherName ??
    null;

  return {
    courseId: String(weeklyRow.courseId),
    courseSessionId: String(weeklyRow.sessionId),
    courseName: weeklyRow.courseName,
    currentTeacherLabel:
      teacherPayload.data?.currentTeacherName ??
      weeklyRow.currentTeacherName ??
      weeklyRow.defaultTeacherName ??
      "待分配老师",
    targetTeacherLabel: alternativeTeacher,
    optionTeacherLabel: optionItems[0]?.teacherName ?? null,
    selectedDayKey: weeklyPayload.data?.selectedDayKey ?? "mon",
    alternateDayLabel:
      weeklyPayload.data?.days.find((day) => day.key !== weeklyPayload.data?.selectedDayKey)
        ?.label ?? null,
    searchTerm: weeklyRow.courseName.slice(0, 2),
    weeklyTotalPages: weeklyPayload.data?.courses.totalPages ?? 1,
    hasNextPage:
      (weeklyPayload.data?.courses.page ?? 0) + 1 <
      (weeklyPayload.data?.courses.totalPages ?? 0),
  };
}
