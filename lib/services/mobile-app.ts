import { normalizeAdminCampus } from "@/lib/admin-campus";
import { buildAdminEmergencyCourseHref } from "@/lib/admin-route-hrefs";
import {
  USER_CAMPUS_OPTIONS_COOKIE,
  parseStoredCampusOptions,
  readCookieValue,
} from "@/lib/services/auth-session";
import type {
  AdminCourseTeachersData,
  AdminEmergencyCourse,
  AdminEmergencyData,
  AdminEmergencyDayKey,
  AdminRollCallTeacherBatchData,
  AdminTeacherSelectionData,
} from "@/lib/domain/types";
import {
  mapAdminClassAttendanceData,
  mapAdminControlData,
  mapAdminCourseRosterData,
  mapAdminCourseTeachersRelationData,
  mapAdminCourseSettingsData,
  mapAdminHomeData,
  mapAdminTimePicker,
  mapAdminTimeSettingDetail,
  mapAdminTimeSettingsData,
  mapAdminProfile,
  mapAdminUnarrivedData,
  mapAttendanceGroup,
  mapAttendanceSession,
  mapTeacherHomeData,
  mapTeacherProfile,
} from "@/lib/services/mobile-adapters";
import {
  fetchAdminAbsentStudents,
  fetchAdminCampusClasses,
  fetchAdminEmergencyWeekly,
  fetchAdminCourseLatestAttendance,
  fetchAdminCourseSettingsOverview,
  fetchAdminCourseStudentDetail,
  fetchAdminCourseStudents,
  fetchAdminHomeSummary,
  fetchAdminMeProfile,
  fetchAdminRollCallOverview,
  fetchAdminTimeSettingsSessions,
  fetchAdminTeacherSettingsOverview,
  fetchRollCallTeacher,
  fetchRollCallTeacherBatchOptions,
  fetchRollCallTeacherOptions,
  fetchCourseDetail,
  fetchCourseLatestAttendance,
  fetchCourseStudents,
  fetchMeProfile,
  fetchTeacherAttendanceGroup,
  fetchTeacherHome,
  fetchTeacherTodaySessions,
} from "@/lib/services/mobile-api";
import type {
  AdminEmergencyWeeklyResponseDto,
  MeDto,
  RollCallOverviewRowDto,
  RollCallTeacherOptionDto,
} from "@/lib/services/mobile-schema";
import { ApiRequestError } from "@/lib/services/http-core";
import { formatTeacherLabel, normalizePhoneForDisplay } from "@/lib/utils/phone";

const ADMIN_ROLL_CALL_DEBUG_PREFIX = "[AdminRollCallDebug]";

function debugAdminRollCall(event: string, payload?: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof payload === "undefined") {
    console.log(`${ADMIN_ROLL_CALL_DEBUG_PREFIX} ${event}`);
    return;
  }

  console.log(`${ADMIN_ROLL_CALL_DEBUG_PREFIX} ${event}`, payload);
}

function isStudentFormNotFoundError(error: unknown) {
  if (!(error instanceof ApiRequestError)) {
    return false;
  }

  const message = error.message.trim().toLowerCase();
  return (
    message === "course not found" ||
    message === "student not found" ||
    message === "student is not in course roster" ||
    message === "forbidden"
  );
}

async function buildCourseDetailMap(courseIds: number[]) {
  const uniqueCourseIds = [...new Set(courseIds)];
  const detailEntries = await Promise.all(
    uniqueCourseIds.map(async (courseId) => [courseId, await fetchCourseDetail(courseId)] as const),
  );

  return new Map(detailEntries);
}

function normalizeTeacherOptionPage<T extends { teacherId: number }>(
  response:
    | T[]
    | {
        items?: T[] | null;
        totalElements?: number;
        totalPages?: number;
        page?: number;
        size?: number;
      }
    | null
    | undefined,
) {
  if (Array.isArray(response)) {
    return {
      items: response,
      totalElements: response.length,
      totalPages: response.length > 0 ? 1 : 0,
      page: 0,
      size: response.length,
    };
  }

  if (!response || typeof response !== "object") {
    return {
      items: [] as T[],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 0,
    };
  }

  return {
    items: Array.isArray(response.items) ? response.items : [],
    totalElements: typeof response.totalElements === "number" ? response.totalElements : 0,
    totalPages: typeof response.totalPages === "number" ? response.totalPages : 0,
    page: typeof response.page === "number" ? response.page : 0,
    size: typeof response.size === "number" ? response.size : 0,
  };
}

function normalizeBatchTeacherOptionPage<T extends { teacherId: number }>(response: unknown) {
  if (!response || typeof response !== "object") {
    return {
      items: [] as T[],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 0,
    };
  }

  const normalized = response as Partial<{
    items: T[] | null;
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  }>;

  return {
    items: Array.isArray(normalized.items) ? normalized.items : [],
    totalElements: typeof normalized.totalElements === "number" ? normalized.totalElements : 0,
    totalPages: typeof normalized.totalPages === "number" ? normalized.totalPages : 0,
    page: typeof normalized.page === "number" ? normalized.page : 0,
    size: typeof normalized.size === "number" ? normalized.size : 0,
  };
}

function buildBatchTeacherOptionsUnavailableMessage() {
  return "共享开发环境暂未返回批量互换候选数据，请先继续使用单课更换老师";
}

function formatTimeRange(startAt: string, endAt: string) {
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  } as const;

  return `${new Date(startAt).toLocaleTimeString("zh-CN", options)}-${new Date(endAt).toLocaleTimeString("zh-CN", options)}`;
}

function doSessionTimesOverlap(
  leftStartAt: string,
  leftEndAt: string,
  rightStartAt: string,
  rightEndAt: string,
) {
  return (
    new Date(leftStartAt).getTime() < new Date(rightEndAt).getTime() &&
    new Date(rightStartAt).getTime() < new Date(leftEndAt).getTime()
  );
}

function getWeekStartFromDate(value: string) {
  const shanghaiDate = new Date(
    new Date(value).toLocaleString("en-US", { timeZone: "Asia/Shanghai" }),
  );
  const day = shanghaiDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  shanghaiDate.setDate(shanghaiDate.getDate() + mondayOffset);
  const y = shanghaiDate.getFullYear();
  const m = String(shanghaiDate.getMonth() + 1).padStart(2, "0");
  const d = String(shanghaiDate.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function resolveAdminEmergencyDayKeyFromDate(value: string): AdminEmergencyDayKey {
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const shanghaiDate = new Date(
    new Date(value).toLocaleString("en-US", { timeZone: "Asia/Shanghai" }),
  );
  return dayKeys[shanghaiDate.getDay()] ?? "mon";
}

const ADMIN_EMERGENCY_DAY_LABELS: Record<AdminEmergencyDayKey, string> = {
  mon: "周一",
  tue: "周二",
  wed: "周三",
  thu: "周四",
  fri: "周五",
  sat: "周六",
  sun: "周日",
};

function resolveAdminEmergencyDayLabelFromDate(value: string) {
  return ADMIN_EMERGENCY_DAY_LABELS[resolveAdminEmergencyDayKeyFromDate(value)] ?? "周一";
}

function getShanghaiDateString(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

function getTeacherIdsFromOverviewRow(row: {
  defaultTeacherId?: number | null;
  rollCallTeacherId?: number | null;
}) {
  return [
    ...new Set(
      [row.defaultTeacherId, row.rollCallTeacherId].filter(
        (value): value is number => typeof value === "number",
      ),
    ),
  ];
}

function getEffectiveTeacherIdFromOverviewRow(row: {
  defaultTeacherId?: number | null;
  rollCallTeacherId?: number | null;
}) {
  if (typeof row.rollCallTeacherId === "number") {
    return row.rollCallTeacherId;
  }
  return typeof row.defaultTeacherId === "number" ? row.defaultTeacherId : null;
}

function buildTeacherDailyCourseSummaryMap(
  rows: Awaited<ReturnType<typeof fetchAdminTeacherSettingsOverview>>,
  targetDate?: string,
) {
  if (!targetDate) {
    return new Map<string, string>();
  }

  const teacherCourses = new Map<
    string,
    Array<{
      key: string;
      sessionStartAt: string;
      summary: string;
    }>
  >();

  for (const row of [...rows].sort((left, right) => left.sessionStartAt.localeCompare(right.sessionStartAt))) {
    if (getShanghaiDateString(row.sessionStartAt) !== targetDate) {
      continue;
    }

    const teacherId = getEffectiveTeacherIdFromOverviewRow(row);
    if (teacherId === null) {
      continue;
    }

    const courseSummary = `${row.courseName} ${formatTimeRange(row.sessionStartAt, row.sessionEndAt)}`;

    {
      const currentCourses = teacherCourses.get(String(teacherId)) ?? [];
      const courseKey = `${row.courseId}:${row.sessionId}`;

      if (!currentCourses.some((course) => course.key === courseKey)) {
        currentCourses.push({
          key: courseKey,
          sessionStartAt: row.sessionStartAt,
          summary: courseSummary,
        });
        teacherCourses.set(String(teacherId), currentCourses);
      }
    }
  }

  return new Map(
    [...teacherCourses.entries()].map(([teacherId, courses]) => [
      teacherId,
      courses
        .sort((left, right) => left.sessionStartAt.localeCompare(right.sessionStartAt))
        .map((course) => course.summary)
        .join(" · "),
    ]),
  );
}

function buildTeacherSwapTargetsById(
  rows: Awaited<ReturnType<typeof fetchAdminTeacherSettingsOverview>>,
  options: {
    courseId: number;
    courseSessionId: number;
    sessionDate?: string;
    overlapStartAt?: string | null;
    overlapEndAt?: string | null;
  },
) {
  const targetsByTeacherId = new Map<
    string,
    Array<{
      courseId: string;
      courseSessionId: string;
      courseTitle: string;
      dayLabel?: string;
      sessionTimeLabel: string;
      currentTeacherLabel: string;
    }>
  >();

  for (const row of rows) {
    if (row.courseId === options.courseId && row.sessionId === options.courseSessionId) {
      continue;
    }

    if (options.sessionDate && getShanghaiDateString(row.sessionStartAt) !== options.sessionDate) {
      continue;
    }

    if (
      options.overlapStartAt &&
      options.overlapEndAt &&
      !doSessionTimesOverlap(
        options.overlapStartAt,
        options.overlapEndAt,
        row.sessionStartAt,
        row.sessionEndAt,
      )
    ) {
      continue;
    }

    for (const teacherId of getTeacherIdsFromOverviewRow(row)) {
      const currentTargets = targetsByTeacherId.get(String(teacherId)) ?? [];
      const targetKey = `${row.courseId}:${row.sessionId}`;

      if (!currentTargets.some((target) => `${target.courseId}:${target.courseSessionId}` === targetKey)) {
        currentTargets.push({
          courseId: String(row.courseId),
          courseSessionId: String(row.sessionId),
          courseTitle: row.courseName,
          dayLabel: resolveAdminEmergencyDayLabelFromDate(row.sessionStartAt),
          sessionTimeLabel: formatTimeRange(row.sessionStartAt, row.sessionEndAt),
          currentTeacherLabel: row.rollCallTeacherName ?? row.defaultTeacherName ?? "待分配老师",
        });
        targetsByTeacherId.set(String(teacherId), currentTargets);
      }
    }
  }

  return targetsByTeacherId;
}

function normalizeFallbackTeacherSelection(
  campus: string,
  data: AdminTeacherSelectionData,
) {
  const currentTeacherLabel =
    data.teachers.find((teacher) => teacher.selected)?.label ??
    data.defaultTeacherLabel ??
    "待分配老师";

  void campus;

  return {
    ...data,
    currentTeacherLabel,
  };
}

function paginateTeacherSelectionData(
  data: AdminTeacherSelectionData | null,
  q?: string,
  page = 0,
  size = 20,
) {
  if (!data) {
    return null;
  }

  const normalizedQuery = q?.trim().toLowerCase() ?? "";
  const filteredTeachers = normalizedQuery
    ? data.teachers.filter((teacher) =>
        `${teacher.label} ${teacher.note ?? ""}`.toLowerCase().includes(normalizedQuery),
      )
    : data.teachers;
  const start = page * size;
  const items = filteredTeachers.slice(start, start + size);
  const totalElements = filteredTeachers.length;
  const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / size);

  return {
    ...data,
    teacherQuery: q?.trim() ?? "",
    currentPage: page,
    pageSize: size,
    totalElements,
    totalPages,
    hasNextPage: page + 1 < totalPages,
    teachers: items,
  };
}

function buildSessionTeacherStateMapFromEmergencyWeekly(
  response: Awaited<ReturnType<typeof fetchAllAdminEmergencyWeeklyPages>>,
) {
  const items = Array.isArray(response.courses.items) ? response.courses.items : [];

  return new Map(
    items
      .map((item) => [
        `${item.courseId}:${item.sessionId ?? ""}`,
        {
          label: formatTeacherLabel(
            item.currentTeacherName ?? item.defaultTeacherName,
            item.currentTeacherPhone ?? item.defaultTeacherPhone,
          ),
          temporary: Boolean(item.temporaryTeacherAssigned && item.currentTeacherName),
        },
      ] as const)
      .filter((entry) => entry[1].label),
  );
}

function normalizeAdminEmergencyWeeklyResponse(
  response: Awaited<ReturnType<typeof fetchAdminEmergencyWeekly>> | null | undefined,
  fallback: {
    weekStart: string;
    dayKey?: AdminEmergencyDayKey;
    size: number;
  },
): Awaited<ReturnType<typeof fetchAdminEmergencyWeekly>> {
  const courses =
    response?.courses && typeof response.courses === "object" ? response.courses : null;
  const items = Array.isArray(courses?.items) ? courses.items : [];

  return {
    weekStart: response?.weekStart ?? fallback.weekStart,
    selectedDayKey: response?.selectedDayKey ?? fallback.dayKey ?? "mon",
    featuredDateLabel: response?.featuredDateLabel ?? "",
    featuredCourse: response?.featuredCourse ?? null,
    days: Array.isArray(response?.days) ? response.days : [],
    courses: {
      items,
      totalElements:
        typeof courses?.totalElements === "number" ? courses.totalElements : items.length,
      totalPages: typeof courses?.totalPages === "number" ? courses.totalPages : 0,
      page: typeof courses?.page === "number" ? courses.page : 0,
      size: typeof courses?.size === "number" ? courses.size : fallback.size,
    },
  };
}

function getWeekStart() {
  const now = new Date();
  const shanghaiNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }),
  );
  const day = shanghaiNow.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  shanghaiNow.setDate(shanghaiNow.getDate() + mondayOffset);
  const y = shanghaiNow.getFullYear();
  const m = String(shanghaiNow.getMonth() + 1).padStart(2, "0");
  const d = String(shanghaiNow.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getShanghaiTodayDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
  }).format(new Date());
}

function getShanghaiTimeText(value = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(value);
}

function normalizeClockText(value?: string | null) {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) {
    return null;
  }

  const hour = match[1].padStart(2, "0");
  const minute = match[2];
  const second = match[3] ?? "00";
  return `${hour}:${minute}:${second}`;
}

function isAdminRollCallPollingWindowActive(
  settings: Awaited<ReturnType<typeof fetchAdminTimeSettingsSessions>>,
  now = new Date(),
) {
  const today = getShanghaiTodayDate();
  const currentTime = getShanghaiTimeText(now);

  return settings.some((setting) => {
    if (setting.sessionDate !== today) {
      return false;
    }

    const startTime = normalizeClockText(setting.rollCallStartTime);
    const endTime = normalizeClockText(setting.rollCallEndTime);

    if (!startTime || !endTime) {
      return false;
    }

    return currentTime >= startTime && currentTime <= endTime;
  });
}

function getShanghaiCurrentWeekStartDate() {
  return getWeekStart();
}

function isIsoDate(value: string | null | undefined): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function addDays(date: string, days: number) {
  const base = new Date(`${date}T00:00:00+08:00`);
  base.setDate(base.getDate() + days);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
  }).format(base);
}

function normalizeAdminTimeSettingsTargetDate(targetDate?: string | null) {
  const todayDate = getShanghaiTodayDate();
  const weekStart = getShanghaiCurrentWeekStartDate();
  const weekEnd = addDays(weekStart, 6);
  if (!isIsoDate(targetDate)) {
    return todayDate;
  }
  const safeTargetDate = targetDate;
  if (safeTargetDate < weekStart || safeTargetDate > weekEnd) {
    return todayDate;
  }
  return safeTargetDate;
}

function resolveAdminTimeSettingKey(value: string) {
  return value === "class-time" || value === "attendance-window" ? value : null;
}

function getPrimaryAdminTimeSetting(settings: Awaited<ReturnType<typeof fetchAdminTimeSettingsSessions>>) {
  return settings[0] ?? null;
}

function buildAdminEmergencyCoursePayload(
  item: {
    courseId: number;
    sessionId: number;
    courseName: string;
    sessionDate?: string;
    sessionStartAt?: string;
    sessionEndAt?: string;
    sessionTimeLabel: string;
    location?: string | null;
    defaultTeacherId?: number | null;
    defaultTeacherName?: string | null;
    defaultTeacherPhone?: string | null;
    currentTeacherId?: number | null;
    currentTeacherName?: string | null;
    currentTeacherPhone?: string | null;
    currentTeacherExternal?: boolean;
    teacherChanged?: boolean;
    temporaryTeacherAssigned?: boolean;
  },
) : AdminEmergencyCourse {
  const teacherName =
    item.currentTeacherName ?? item.defaultTeacherName ?? "待分配老师";
  const teacherPhone = item.currentTeacherPhone ?? item.defaultTeacherPhone;
  const meta = [item.location || "地点待定", item.sessionTimeLabel, teacherName, teacherPhone]
    .filter(Boolean)
    .join(" · ");

  return {
    courseId: String(item.courseId),
    sessionId: String(item.sessionId),
    title: item.courseName,
    meta,
    href: buildAdminEmergencyCourseHref(item.courseId, {
      courseSessionId: item.sessionId,
    }),
    sessionDate: item.sessionDate,
    sessionStartAt: item.sessionStartAt,
    sessionEndAt: item.sessionEndAt,
    locationLabel: item.location || "地点待定",
    sessionTimeLabel: item.sessionTimeLabel,
    currentTeacherId:
      typeof item.currentTeacherId === "number" ? String(item.currentTeacherId) : undefined,
    currentTeacherName: item.currentTeacherName ?? item.defaultTeacherName ?? "待分配老师",
    currentTeacherPhone: item.currentTeacherPhone ?? item.defaultTeacherPhone,
    currentTeacherExternal: item.currentTeacherExternal,
    defaultTeacherId:
      typeof item.defaultTeacherId === "number" ? String(item.defaultTeacherId) : undefined,
    defaultTeacherName: item.defaultTeacherName ?? item.currentTeacherName ?? "待分配老师",
    defaultTeacherPhone: item.defaultTeacherPhone ?? item.currentTeacherPhone,
    teacherChanged: item.teacherChanged,
    temporaryTeacherAssigned: item.temporaryTeacherAssigned,
  };
}

function sortTeacherSelectionItems(
  teachers: NonNullable<AdminTeacherSelectionData["teachers"]>,
) {
  return [...teachers]
    .map((teacher, index) => ({ teacher, index }))
    .sort((left, right) => {
      const leftPriority = left.teacher.selected ? 0 : left.teacher.source === "internal" ? 1 : 2;
      const rightPriority =
        right.teacher.selected ? 0 : right.teacher.source === "internal" ? 1 : 2;

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return left.index - right.index;
    })
    .map(({ teacher }) => teacher);
}

function mapTeacherSelectionOption(
  teacher: {
    teacherId: number;
    teacherName: string;
    phone?: string | null;
    externalTeacher?: boolean;
    selected?: boolean;
    defaultTeacher?: boolean;
  },
) {
  return {
    id: String(teacher.teacherId),
    label: formatTeacherLabel(teacher.teacherName, teacher.phone),
    name: teacher.teacherName,
    phone: teacher.phone,
    note: undefined,
    selected: teacher.selected,
    source: teacher.externalTeacher ? ("external" as const) : ("internal" as const),
    manual: Boolean(teacher.externalTeacher),
    badges: [
      teacher.externalTeacher ? "系统外老师" : "系统老师",
      ...(teacher.selected ? ["当前代课"] : []),
    ],
  };
}

function resolveBatchInitialTargetTeacherId(
  course: AdminEmergencyCourse,
  teacherOptions: Array<{
    id: string;
    selected?: boolean;
    defaultTeacher?: boolean;
  }>,
) {
  const selectedInternalTeacher = teacherOptions.find((teacher) => teacher.selected);
  const defaultTeacher = teacherOptions.find((teacher) => teacher.defaultTeacher);

  if (course.currentTeacherId && !course.currentTeacherExternal) {
    return course.currentTeacherId;
  }

  if (selectedInternalTeacher?.id) {
    return selectedInternalTeacher.id;
  }

  if (course.defaultTeacherId) {
    return course.defaultTeacherId;
  }

  if (defaultTeacher?.id) {
    return defaultTeacher.id;
  }

  return teacherOptions[0]?.id;
}

function buildEmergencyCoursesPage(
  items: AdminEmergencyCourse[],
  page?: number,
  size?: number,
) {
  const totalElements = items.length;
  const resolvedPage = page ?? 0;
  const resolvedSize = size ?? (totalElements || 20);
  const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / resolvedSize);
  const start = page === undefined && size === undefined ? 0 : resolvedPage * resolvedSize;
  const visibleItems =
    page === undefined && size === undefined ? items : items.slice(start, start + resolvedSize);

  return {
    items: visibleItems,
    page: resolvedPage,
    size: resolvedSize,
    totalPages,
    totalElements,
    hasNextPage: resolvedPage + 1 < totalPages,
    hasPrevPage: resolvedPage > 0,
  };
}

async function fetchAllAdminEmergencyWeeklyPages(options?: {
  weekStart?: string;
  dayKey?: AdminEmergencyDayKey;
  q?: string;
  size?: number;
}) {
  const requestOptions = {
    weekStart: options?.weekStart ?? getWeekStart(),
    dayKey: options?.dayKey,
    q: options?.q,
    size: options?.size ?? 20,
  };
  const firstPage = normalizeAdminEmergencyWeeklyResponse(
    await fetchAdminEmergencyWeekly({
      ...requestOptions,
      page: 0,
    }),
    requestOptions,
  );
  const remainingPages =
    firstPage.courses.totalPages > 1
      ? await Promise.all(
          Array.from({ length: firstPage.courses.totalPages - 1 }, (_, index) =>
            fetchAdminEmergencyWeekly({
              ...requestOptions,
              page: index + 1,
            }).then((response) =>
              normalizeAdminEmergencyWeeklyResponse(response, requestOptions),
            ),
          ),
        )
      : [];
  const validRemainingPages = remainingPages.filter(isAdminEmergencyWeeklyResponse);

  return {
    ...firstPage,
    courses: {
      ...firstPage.courses,
      items: [firstPage, ...validRemainingPages].flatMap((page) => page.courses.items),
      page: 0,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAdminEmergencyWeeklyResponse(
  value: unknown,
): value is AdminEmergencyWeeklyResponseDto {
  if (!isRecord(value)) {
    return false;
  }

  const courses = value.courses;

  return (
    isRecord(courses) &&
    Array.isArray(courses.items) &&
    typeof courses.totalPages === "number" &&
    typeof courses.totalElements === "number"
  );
}

function buildEmptyAdminEmergencyWeeklyResponse(options: {
  weekStart: string;
  dayKey?: AdminEmergencyDayKey;
  size: number;
}): AdminEmergencyWeeklyResponseDto {
  return {
    weekStart: options.weekStart,
    selectedDayKey: options.dayKey ?? resolveAdminEmergencyDayKeyFromDate(getShanghaiTodayDate()),
    featuredDateLabel: "",
    featuredCourse: null,
    days: [],
    courses: {
      items: [],
      page: 0,
      size: options.size,
      totalPages: 0,
      totalElements: 0,
    },
  };
}

function normalizeAdminProfileForControl(value: unknown): MeDto {
  return isRecord(value)
    ? (value as MeDto)
    : {
        id: 0,
        phone: "",
        campusName: "当前校区",
      };
}

function normalizeRollCallOverviewRows(value: unknown): RollCallOverviewRowDto[] {
  return Array.isArray(value) ? value : [];
}

function mapAdminEmergencyWeeklyResponse(
  response: Awaited<ReturnType<typeof fetchAllAdminEmergencyWeeklyPages>>,
  options?: {
    page?: number;
    size?: number;
  },
): AdminEmergencyData {
  const items = Array.isArray(response.courses.items) ? response.courses.items : [];
  const featuredCourses = items
    .filter((item) => item.temporaryTeacherAssigned)
    .map((item) => buildAdminEmergencyCoursePayload(item));
  const regularCourses = items
    .filter((item) => !item.temporaryTeacherAssigned)
    .map((item) => buildAdminEmergencyCoursePayload(item));

  return {
    days: response.days.map((day) => ({
      key: day.key,
      label: day.label,
      date: day.date,
      courseCount: day.courseCount,
      changedCourseCount: day.changedCourseCount,
      active: day.active,
    })),
    selectedDayKey: response.selectedDayKey,
    featuredDateLabel: response.featuredDateLabel,
    featuredCourses,
    courses: buildEmergencyCoursesPage(regularCourses, options?.page, options?.size),
  };
}

function mapAdminCourseTeachersWeeklyResponse(
  response: Awaited<ReturnType<typeof fetchAdminEmergencyWeekly>>,
): AdminCourseTeachersData {
  return {
    title: "查看课程老师",
    searchPlaceholder: "搜索老师姓名 / 手机号",
    days: response.days.map((day) => ({
      key: day.key,
      label: day.label,
      courseCount: day.courseCount,
      active: day.active,
    })),
    defaultDayKey: response.selectedDayKey,
    selectedDayKey: response.selectedDayKey,
    teachers: response.courses.items.map((item) => {
      const teacherName = item.currentTeacherName ?? item.defaultTeacherName ?? "待分配老师";
      const teacherPhone = normalizePhoneForDisplay(
        item.currentTeacherPhone ?? item.defaultTeacherPhone,
      );
      const teacherLabel = formatTeacherLabel(
        teacherName,
        item.currentTeacherPhone ?? item.defaultTeacherPhone,
      );
      const statusLabel = item.temporaryTeacherAssigned ? "代课老师" : "默认负责";
      const locationLabel = item.location || "地点待定";

      return {
        id: `${item.courseId}:${item.sessionId}`,
        dayKey: item.dayKey,
        label: teacherLabel || "待分配老师",
        note: [item.courseName, locationLabel, statusLabel].filter(Boolean).join(" · "),
        teacherName,
        teacherPhone,
        courseLabel: item.courseName,
        locationLabel,
        statusLabel,
        tone: item.temporaryTeacherAssigned ? ("substitute" as const) : ("default" as const),
      };
    }),
    teachersPage: {
      page: response.courses.page,
      size: response.courses.size,
      totalPages: response.courses.totalPages,
      totalElements: response.courses.totalElements,
      hasNextPage: response.courses.page + 1 < response.courses.totalPages,
      hasPrevPage: response.courses.page > 0,
    },
  };
}

async function getStoredCampusOptionsFromCookies() {
  if (typeof window !== "undefined") {
    return parseStoredCampusOptions(readCookieValue(document.cookie, USER_CAMPUS_OPTIONS_COOKIE));
  }
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return parseStoredCampusOptions(cookieStore.get(USER_CAMPUS_OPTIONS_COOKIE)?.value ?? null);
  } catch {
    return [];
  }
}

export async function getTeacherHomeData() {
  const [me, home, todaySessions] = await Promise.all([
    fetchMeProfile(),
    fetchTeacherHome(),
    fetchTeacherTodaySessions(),
  ]);

  // Teacher home must rely on teacher-visible session fields only.
  // Do not call admin-only roll-call-teacher APIs from the teacher homepage.
  return mapTeacherHomeData({
    me,
    home,
    todaySessions,
  });
}

export async function getAttendanceSession(courseId?: string, courseSessionId?: string) {
  if (!courseId || Number.isNaN(Number(courseId))) {
    return null;
  }

  const numericCourseId = Number(courseId);
  const numericSessionId =
    courseSessionId && !Number.isNaN(Number(courseSessionId))
      ? Number(courseSessionId)
      : undefined;
  const [me, home, todaySessions, course, students, latest] = await Promise.all([
    fetchMeProfile(),
    fetchTeacherHome(),
    fetchTeacherTodaySessions(),
    fetchCourseDetail(numericCourseId),
    fetchCourseStudents(numericCourseId, {
      courseSessionId: numericSessionId,
    }),
    fetchCourseLatestAttendance(numericCourseId, numericSessionId),
  ]);
  const homeroomClasses = course.campusId
    ? await fetchAdminCampusClasses(course.campusId)
        .then((items) => (Array.isArray(items) ? items : []))
        .catch(() => [])
    : [];
  const selectedSessionId = numericSessionId ?? latest?.courseSessionId ?? undefined;
  const todaySession =
    todaySessions.find((session) => session.sessionId === selectedSessionId) ??
    todaySessions.find((session) => session.courseId === numericCourseId);

  return mapAttendanceSession({
    courseId: numericCourseId,
    courseSessionId: selectedSessionId,
    course,
    campusName: course.campusName,
    students,
    latest,
    rollCallWindows: home.campusRollCallWindows,
    todaySession,
    homeroomClasses,
  });
}

export async function getAttendanceGroup(groupId?: string) {
  const normalizedGroupId = groupId?.trim();

  if (!normalizedGroupId) {
    return null;
  }

  const group = await fetchTeacherAttendanceGroup(normalizedGroupId);
  if (!group || !Array.isArray(group.sessions)) {
    return null;
  }

  return mapAttendanceGroup(group);
}

export async function getTeacherProfile() {
  return mapTeacherProfile(await fetchMeProfile());
}

export async function getAdminHomeData(campus?: string) {
  void campus;
  const todayDate = getShanghaiTodayDate();

  const [me, summary] = await Promise.all([
    fetchAdminMeProfile(),
    fetchAdminHomeSummary(todayDate),
  ]);

  const safeMe = me ?? {
    id: 0,
    campusName: null,
  };

  const safeSummary = summary ?? {
    date: todayDate,
    distinctCoursesWithSessionsToday: 0,
    sessionCountToday: 0,
    pendingRollCallSessions: 0,
    actualClassTimeRange: null,
    rollCallTimeRange: null,
    todaySubstituteCourseCount: 0,
    todaySubstituteTeacherCount: 0,
    rollCallWindowRuleCount: 0,
    rollCallRulesSummary: "",
  };

  const mapped = mapAdminHomeData({
    me: safeMe,
    summary: safeSummary,
  });

  return mapped;
}

export async function getAdminProfile(campus?: string) {
  void campus;

  return mapAdminProfile(await fetchAdminMeProfile(), await getStoredCampusOptionsFromCookies());
}

export async function getAdminCourseTeachersData(options?: {
  weekStart?: string;
  dayKey?: AdminEmergencyDayKey;
  q?: string;
  page?: number;
  size?: number;
}) {
  return mapAdminCourseTeachersWeeklyResponse(
    await fetchAdminEmergencyWeekly({
      weekStart: options?.weekStart ?? getWeekStart(),
      dayKey: options?.dayKey,
      q: options?.q,
      page: options?.page,
      size: options?.size,
    }),
  );
}

export async function getAdminControlData(campus?: string) {
  const campusKey = normalizeAdminCampus(campus);
  const todayDate = getShanghaiTodayDate();

  void campusKey;

  const [me, overview, todayEmergencyWeekly, timeSettings] = await Promise.all([
    fetchAdminMeProfile(),
    fetchAdminRollCallOverview(),
    fetchAllAdminEmergencyWeeklyPages({
      weekStart: getWeekStart(),
      dayKey: resolveAdminEmergencyDayKeyFromDate(todayDate),
      size: 100,
    }),
    Promise.resolve()
      .then(() =>
        fetchAdminTimeSettingsSessions({
          date: todayDate,
        }),
      )
      .catch(() => []),
  ]);
  const teacherStatesBySessionKey =
    buildSessionTeacherStateMapFromEmergencyWeekly(todayEmergencyWeekly);
  const pollingEnabled = isAdminRollCallPollingWindowActive(timeSettings);

  return mapAdminControlData({
    me: normalizeAdminProfileForControl(me),
    overview: normalizeRollCallOverviewRows(overview),
    courseDetailsById: new Map(),
    pollingEnabled,
    teacherStatesBySessionKey,
  });
}

export async function getAdminClassStatus(classId: string, campus?: string) {
  const controlData = await getAdminControlData(campus);

  return controlData.classes.find((item) => item.id === classId) ?? null;
}

export async function getAdminClassAttendanceData(
  classId: string,
  _campus?: string,
  courseSessionId?: string,
) {
  if (!classId || Number.isNaN(Number(classId))) {
    return null;
  }

  const numericCourseId = Number(classId);
  const numericSessionId =
    courseSessionId && !Number.isNaN(Number(courseSessionId))
      ? Number(courseSessionId)
      : undefined;
  const [course, students, latest] = await Promise.all([
    fetchCourseDetail(numericCourseId),
    fetchAdminCourseStudents(numericCourseId, {
      courseSessionId: numericSessionId,
    }),
    fetchAdminCourseLatestAttendance(numericCourseId, numericSessionId),
  ]);

  return mapAdminClassAttendanceData({
    courseId: numericCourseId,
    courseSessionId: numericSessionId ?? latest?.courseSessionId ?? undefined,
    course,
    students,
    latest,
  });
}

export async function getAdminUnarrivedData(campus?: string) {
  normalizeAdminCampus(campus);

  const [me, rows] = await Promise.all([fetchAdminMeProfile(), fetchAdminAbsentStudents()]);

  return mapAdminUnarrivedData({
    me,
    rows,
    courseContexts: new Map(),
    teacherStatesBySessionKey: new Map(),
  });
}

export async function getAdminEmergencyData() {
  return getAdminEmergencyWeeklyData();
}

export async function getAdminEmergencyWeeklyData(options?: {
  weekStart?: string;
  dayKey?: AdminEmergencyDayKey;
  q?: string;
  page?: number;
  size?: number;
}) {
  const normalizedQuery = options?.q?.trim() ?? "";
  const response = await fetchAllAdminEmergencyWeeklyPages({
    weekStart: options?.weekStart,
    dayKey: options?.dayKey,
    q: normalizedQuery || undefined,
    size: options?.size,
  });

  return mapAdminEmergencyWeeklyResponse(
    response,
    {
      page: options?.page,
      size: options?.size,
    },
  );
}

export async function getAdminRollCallTeacherBatchData(
  courses: AdminEmergencyCourse[],
  options?: {
    sessionDate?: string;
    q?: string;
    page?: number;
    size?: number;
  },
): Promise<AdminRollCallTeacherBatchData | null> {
  if (courses.length < 2) {
    return null;
  }

  const numericSessionIds = courses
    .map((course) => Number(course.sessionId))
    .filter((value) => Number.isFinite(value));
  const sessionDate = options?.sessionDate ?? courses[0]?.sessionDate;

  if (!sessionDate || numericSessionIds.length < 2) {
    return null;
  }

  const response = await fetchRollCallTeacherBatchOptions({
    sessionDate,
    courseSessionIds: numericSessionIds,
    q: options?.q?.trim() || undefined,
    page: options?.page ?? 0,
    size: options?.size ?? 100,
  });
  if (!response || !Array.isArray(response.items)) {
    throw new Error(buildBatchTeacherOptionsUnavailableMessage());
  }

  const teacherGroups = new Map(
    response.items.map((item) => [
      String(item.courseSessionId),
      normalizeBatchTeacherOptionPage<RollCallTeacherOptionDto>(item.teachers),
    ] as const),
  );

  return {
    sessionDate,
    courseCount: courses.length,
    courses: courses.map((course) => {
      const teacherPage = teacherGroups.get(course.sessionId) ??
        normalizeBatchTeacherOptionPage<RollCallTeacherOptionDto>(null);
      const teacherOptions = teacherPage.items
        .filter((teacher) => !teacher.externalTeacher)
        .map((teacher) => ({
          id: String(teacher.teacherId),
          label: formatTeacherLabel(teacher.teacherName, teacher.phone),
          name: teacher.teacherName,
          phone: teacher.phone,
          note: teacher.defaultTeacher
            ? "默认老师"
            : teacher.selected
              ? "当前点名老师"
              : "系统内老师",
          defaultTeacher: teacher.defaultTeacher,
          selected: teacher.selected,
        }));
      const defaultTeacherLabel =
        formatTeacherLabel(course.defaultTeacherName, course.defaultTeacherPhone) || "待分配老师";
      const currentTeacherLabel =
        formatTeacherLabel(
          course.currentTeacherName ?? course.defaultTeacherName,
          course.currentTeacherPhone ?? course.defaultTeacherPhone,
        ) || "待分配老师";

      return {
        courseId: course.courseId,
        sessionId: course.sessionId,
        courseTitle: course.title,
        courseMeta: course.meta,
        sessionDate,
        sessionTimeLabel: course.sessionTimeLabel ?? "时间待定",
        locationLabel: course.locationLabel ?? "地点待定",
        currentTeacherLabel,
        defaultTeacherLabel,
        currentTeacherId: course.currentTeacherId,
        currentTeacherExternal: course.currentTeacherExternal,
        defaultTeacherId: course.defaultTeacherId,
        temporaryTeacherAssigned: course.temporaryTeacherAssigned,
        initialTargetTeacherId: resolveBatchInitialTargetTeacherId(course, teacherOptions),
        teacherOptions,
      };
    }),
  };
}

export async function getAdminCourseSettingsData(campus?: string) {
  normalizeAdminCampus(campus);
  const overview = await fetchAdminCourseSettingsOverview();

  return mapAdminCourseSettingsData({
    overview,
  });
}

export async function getAdminCourseRoster(
  courseId: string,
  courseSessionId?: string,
  campus?: string,
) {
  normalizeAdminCampus(campus);

  if (!courseId || Number.isNaN(Number(courseId))) {
    return null;
  }

  const numericCourseId = Number(courseId);
  const numericCourseSessionId =
    courseSessionId && !Number.isNaN(Number(courseSessionId))
      ? Number(courseSessionId)
      : undefined;
  const [course, students, overview] = await Promise.all([
    fetchCourseDetail(numericCourseId),
    fetchAdminCourseStudents(numericCourseId, {
      courseSessionId: numericCourseSessionId,
    }),
    fetchAdminCourseSettingsOverview(),
  ]);
  // Course roster pages must follow today's effective course context.
  // When "按其它行课日行课" is enabled, today executes another weekday's full schedule,
  // so the roster/time/teacher summary should come from today's effective overview rather
  // than the raw weekly session stored on the course detail.
  const effectiveCourseContext =
    overview.courses.find(
      (item) =>
        item.courseId === numericCourseId &&
        (numericCourseSessionId ? item.sessionId === numericCourseSessionId : true),
    ) ??
    overview.courses.find((item) => item.courseId === numericCourseId) ??
    null;

  return mapAdminCourseRosterData({
    courseId: numericCourseId,
    courseSessionId: numericCourseSessionId,
    course,
    students,
    effectiveCourseContext,
  });
}

export async function getAdminCourseStudentForm(
  courseId: string,
  studentId = "new",
  courseSessionId?: string,
  campus?: string,
) {
  normalizeAdminCampus(campus);

  if (!courseId || Number.isNaN(Number(courseId))) {
    return null;
  }

  try {
    const numericCourseId = Number(courseId);
    const numericCourseSessionId =
      courseSessionId && !Number.isNaN(Number(courseSessionId))
        ? Number(courseSessionId)
        : undefined;
    const course = await fetchCourseDetail(numericCourseId);
    const campusId = course.campusId;
    const homeroomClasses = campusId
      ? await fetchAdminCampusClasses(campusId)
      : [];
    // Student form context must also follow today's effective course result.
    // If today has been switched to another weekday, the visible time/context should
    // use the effective overview for today instead of the raw course detail session.
    const effectiveCourseContext = numericCourseSessionId
      ? (await fetchAdminCourseSettingsOverview()).courses.find(
          (item) =>
            item.courseId === numericCourseId && item.sessionId === numericCourseSessionId,
        ) ?? null
      : null;
    const courseContext = effectiveCourseContext
      ? `${formatTimeRange(
          effectiveCourseContext.sessionStartAt,
          effectiveCourseContext.sessionEndAt,
        )} · ${effectiveCourseContext.location?.trim() || course.location || "地点待定"} · ${
          effectiveCourseContext.effectiveTeacherName?.trim() ||
          course.teachers[0]?.name ||
          "待分配老师"
        } · ${effectiveCourseContext.studentCount} 人`
      : course.location ?? "地点待定";

    if (studentId === "new") {
      return {
        courseId,
        courseCampusId: campusId ?? null,
        title: "新增学生",
        badge: "新建",
        courseTitle: course.name,
        courseContext,
        submitLabel: "保存学生",
        nameValue: "",
        studentIdValue: "",
        homeroomClassId: null,
        homeroomClasses: homeroomClasses.map((item) => ({
          id: item.id,
          name: item.name,
        })),
        homeroomClassValue: "",
      };
    }

    if (Number.isNaN(Number(studentId))) {
      return null;
    }

    const student = await fetchAdminCourseStudentDetail(numericCourseId, Number(studentId));

    return {
      courseId,
      studentId,
      courseCampusId: campusId ?? null,
      title: "编辑学生",
      badge: "编辑",
      courseTitle: course.name,
      courseContext,
      submitLabel: "保存修改",
      nameValue: student.studentName ?? "",
      studentIdValue: String(student.studentId),
      homeroomClassId: student.homeroomClassId ?? null,
      homeroomClasses: homeroomClasses.map((item) => ({
        id: item.id,
        name: item.name,
      })),
      homeroomClassValue: student.homeroomClassName ?? "",
    };
  } catch (error) {
    if (isStudentFormNotFoundError(error)) {
      return null;
    }

    throw error;
  }
}

export async function getAdminCourseStudentImport(courseId: string, campus?: string) {
  normalizeAdminCampus(campus);

  if (!courseId || Number.isNaN(Number(courseId))) {
    return null;
  }

  const course = await fetchCourseDetail(Number(courseId));

  return {
    courseId,
    title: "批量导入学生",
    badge: "导入页",
    courseTitle: course.name,
    fields: ["学生 ID", "姓名", "行政班"],
    downloadLabel: "下载模板",
    uploadLabel: "上传学生名单",
  };
}

export async function getAdminTeacherSettingCourse(
  courseId: string,
  courseSessionId?: string,
) {
  if (
    !courseId ||
    Number.isNaN(Number(courseId)) ||
    !courseSessionId ||
    Number.isNaN(Number(courseSessionId))
  ) {
    return null;
  }

  const loadLiveData = async () => {
    const [course, rollCallTeacher, teacherOptionsResponse] = await Promise.all([
      fetchCourseDetail(Number(courseId)),
      fetchRollCallTeacher(Number(courseSessionId)),
      fetchRollCallTeacherOptions(Number(courseSessionId)),
    ]);
    const teacherOptions = normalizeTeacherOptionPage(teacherOptionsResponse).items;
    const isTemporary = rollCallTeacher.temporaryTeacherAssigned;
    const normalizedCurrentTeacherLabel = formatTeacherLabel(
      rollCallTeacher.currentTeacherName,
      rollCallTeacher.currentTeacherPhone,
    );
    const defaultTeacherOption =
      teacherOptions.find((teacher) => teacher.defaultTeacher) ??
      teacherOptions.find(
        (teacher) =>
          teacher.teacherId ===
          (rollCallTeacher.defaultTeacherId ?? rollCallTeacher.currentTeacherId),
      ) ??
      null;
    const normalizedDefaultTeacherLabel = formatTeacherLabel(
      defaultTeacherOption?.teacherName ??
        rollCallTeacher.defaultTeacherName ??
        rollCallTeacher.currentTeacherName,
      defaultTeacherOption?.phone ??
        rollCallTeacher.defaultTeacherPhone ??
        (rollCallTeacher.defaultTeacherName === rollCallTeacher.currentTeacherName
          ? rollCallTeacher.currentTeacherPhone
          : null),
    );
    const swapRestoreTarget = rollCallTeacher.swapRestoreTarget
      ? {
          courseId:
            typeof rollCallTeacher.swapRestoreTarget.courseId === "number"
              ? String(rollCallTeacher.swapRestoreTarget.courseId)
              : undefined,
          courseSessionId:
            typeof rollCallTeacher.swapRestoreTarget.courseSessionId === "number"
              ? String(rollCallTeacher.swapRestoreTarget.courseSessionId)
              : undefined,
          courseTitle:
            rollCallTeacher.swapRestoreTarget.courseName?.trim() || "待确认课程",
          courseMeta:
            rollCallTeacher.swapRestoreTarget.sessionStartAt &&
            rollCallTeacher.swapRestoreTarget.sessionEndAt
              ? formatTimeRange(
                  rollCallTeacher.swapRestoreTarget.sessionStartAt,
                  rollCallTeacher.swapRestoreTarget.sessionEndAt,
                )
              : "",
          currentTeacherLabel: formatTeacherLabel(
            rollCallTeacher.swapRestoreTarget.currentTeacherName,
            rollCallTeacher.swapRestoreTarget.currentTeacherPhone,
          ),
          defaultTeacherLabel: formatTeacherLabel(
            rollCallTeacher.swapRestoreTarget.defaultTeacherName,
            rollCallTeacher.swapRestoreTarget.defaultTeacherPhone,
          ),
        }
      : undefined;

    return {
      id: courseId,
      title: course.name,
      meta: [
        course.location ?? "上课地点待定",
        normalizedDefaultTeacherLabel || normalizedCurrentTeacherLabel,
      ]
        .filter(Boolean)
        .join(" · "),
      currentTeacherLabel: normalizedCurrentTeacherLabel,
      currentTeacherMode: isTemporary ? ("temporary" as const) : ("default" as const),
      swapRestoreTarget,
      ...((normalizedDefaultTeacherLabel || normalizedCurrentTeacherLabel)
        ? {
            defaultTeacherLabel:
              normalizedDefaultTeacherLabel ||
              normalizedCurrentTeacherLabel ||
              "待分配老师",
          }
        : {}),
    };
  };

  return loadLiveData();
}

export async function getAdminTeacherSelection(
  courseId: string,
  courseSessionId?: string,
  options?: {
    teacherType?: "INTERNAL" | "EXTERNAL" | "ALL";
    q?: string;
    page?: number;
    size?: number;
    campus?: string;
  },
) {
  normalizeAdminCampus(options?.campus);

  if (
    !courseId ||
    Number.isNaN(Number(courseId)) ||
    !courseSessionId ||
    Number.isNaN(Number(courseSessionId))
  ) {
    return null;
  }

  const numericCourseId = Number(courseId);
  const numericCourseSessionId = Number(courseSessionId);
  const teacherType = options?.teacherType ?? "ALL";
  const page = options?.page ?? 0;
  const size = options?.size ?? 20;
  const teacherQuery = options?.q?.trim() ?? "";
  const [course, teacherResponse, rollCallTeacher, overview] = await Promise.all([
    fetchCourseDetail(numericCourseId),
    fetchRollCallTeacherOptions(numericCourseSessionId, {
      teacherType,
      q: teacherQuery,
      page,
      size,
    }),
    fetchRollCallTeacher(numericCourseSessionId),
    Promise.resolve()
      .then(() => fetchAdminCourseSettingsOverview())
      .catch(() => null),
  ]);
  if (!course || !Array.isArray(course.sessions) || !rollCallTeacher) {
    return null;
  }

  const teacherPage = normalizeTeacherOptionPage(teacherResponse);
  const defaultTeacher = teacherPage.items.find((teacher) => teacher.defaultTeacher);
  const selectedSession =
    course.sessions.find((session) => session.id === numericCourseSessionId) ??
    course.sessions[0];
  const effectiveOverviewCourse =
    overview?.courses.find(
      (item) => item.courseId === numericCourseId && item.sessionId === numericCourseSessionId,
    ) ??
    overview?.courses.find((item) => item.courseId === numericCourseId) ??
    null;
  const effectiveSessionStartAt =
    effectiveOverviewCourse?.sessionStartAt ?? selectedSession?.startAt ?? null;
  const effectiveSessionEndAt =
    effectiveOverviewCourse?.sessionEndAt ?? selectedSession?.endAt ?? null;
  const overlapBaseStartAt =
    effectiveSessionStartAt ?? null;
  const overlapBaseEndAt =
    effectiveSessionEndAt ?? null;
  const effectiveSessionDate = effectiveSessionStartAt
    ? getShanghaiDateString(effectiveSessionStartAt)
    : undefined;
  const teacherSettingsOverviewRows = effectiveSessionStartAt
    ? await Promise.resolve()
        .then(() => fetchAdminTeacherSettingsOverview(getWeekStartFromDate(effectiveSessionStartAt)))
        .then((response) => (Array.isArray(response) ? response : []))
        .catch(() => [])
    : [];
  const teacherDailyCourseSummaryById = buildTeacherDailyCourseSummaryMap(
    teacherSettingsOverviewRows,
    effectiveSessionDate,
  );
  const swapTargetsByTeacherId = buildTeacherSwapTargetsById(teacherSettingsOverviewRows, {
    courseId: numericCourseId,
    courseSessionId: numericCourseSessionId,
    sessionDate: effectiveSessionDate,
    overlapStartAt: overlapBaseStartAt,
    overlapEndAt: overlapBaseEndAt,
  });

  const normalizedDefaultTeacherLabel = defaultTeacher
    ? formatTeacherLabel(defaultTeacher.teacherName, defaultTeacher.phone)
    : "";
  const fallbackDefaultTeacherLabel =
    rollCallTeacher.defaultTeacherName || rollCallTeacher.defaultTeacherPhone
      ? formatTeacherLabel(
          rollCallTeacher.defaultTeacherName,
          rollCallTeacher.defaultTeacherPhone,
        )
      : "";
  const currentTeacherLabel = formatTeacherLabel(
    rollCallTeacher.currentTeacherName ?? rollCallTeacher.defaultTeacherName,
    rollCallTeacher.currentTeacherPhone ?? rollCallTeacher.defaultTeacherPhone,
  );
  const effectiveSessionTimeLabel =
    effectiveSessionStartAt && effectiveSessionEndAt
      ? formatTimeRange(effectiveSessionStartAt, effectiveSessionEndAt)
      : selectedSession
        ? formatTimeRange(selectedSession.startAt, selectedSession.endAt)
        : null;
  const effectiveCourseLocation =
    effectiveOverviewCourse?.location?.trim() || course.location || "上课地点待定";
  const effectiveCurrentTeacherId =
    rollCallTeacher.currentTeacherId ?? rollCallTeacher.defaultTeacherId;
  const normalizedTeachers = sortTeacherSelectionItems(
    teacherPage.items.map((teacher) => {
      const swapTargets = teacher.externalTeacher
        ? []
        : (swapTargetsByTeacherId.get(String(teacher.teacherId)) ?? []);
      const mappedTeacher = mapTeacherSelectionOption(teacher);
      const dailyCourseSummary =
        teacherDailyCourseSummaryById.get(String(teacher.teacherId)) ?? "";

      return {
        ...mappedTeacher,
        note: dailyCourseSummary || undefined,
        badges: [
          ...(mappedTeacher.badges ?? []),
          ...(swapTargets.length > 0 ? ["可互换"] : []),
          ...(swapTargets.length > 0 ? ["可合班"] : []),
        ],
        swapTargets,
      };
    }),
  );

  const selectionData = {
    courseId,
    courseTitle: course.name,
    courseMeta: [
      effectiveCourseLocation,
      effectiveSessionTimeLabel,
      defaultTeacher?.teacherName ?? null,
    ]
      .filter(Boolean)
      .join(" · "),
    sessionDate: effectiveSessionDate,
    currentTeacherId:
      typeof effectiveCurrentTeacherId === "number"
        ? String(effectiveCurrentTeacherId)
        : undefined,
    currentTeacherSource:
      typeof effectiveCurrentTeacherId === "number"
        ? rollCallTeacher.currentTeacherExternal
          ? ("external" as const)
          : ("internal" as const)
        : undefined,
    currentTeacherLabel,
    defaultTeacherLabel:
      normalizedDefaultTeacherLabel || fallbackDefaultTeacherLabel || currentTeacherLabel,
    teacherType,
    teacherQuery,
    currentPage: teacherPage.page,
    pageSize: teacherPage.size,
    totalPages: teacherPage.totalPages,
    totalElements: teacherPage.totalElements,
    hasNextPage: teacherPage.page + 1 < teacherPage.totalPages,
    teachers: normalizedTeachers,
  };
  return selectionData;
}

export async function getAdminExternalTeacherForm(
  courseId: string,
  courseSessionId?: string,
  campus?: string,
) {
  normalizeAdminCampus(campus);

  if (!courseId || Number.isNaN(Number(courseId))) {
    return null;
  }

  const numericCourseSessionId =
    courseSessionId && !Number.isNaN(Number(courseSessionId)) ? Number(courseSessionId) : null;
  const [course, rollCallTeacher] = await Promise.all([
    fetchCourseDetail(Number(courseId)),
    numericCourseSessionId ? fetchRollCallTeacher(numericCourseSessionId) : Promise.resolve(null),
  ]);
  const selectedSession = numericCourseSessionId
    ? course.sessions.find((session) => session.id === numericCourseSessionId) ?? course.sessions[0]
    : course.sessions[0];

  return {
    courseId,
    courseTitle: course.name,
    courseMeta: [
      course.location ?? "上课地点待定",
      selectedSession ? formatTimeRange(selectedSession.startAt, selectedSession.endAt) : null,
      rollCallTeacher?.defaultTeacherName ?? null,
    ]
      .filter(Boolean)
      .join(" · "),
    currentTeacherLabel: formatTeacherLabel(
      rollCallTeacher?.currentTeacherName ?? rollCallTeacher?.defaultTeacherName,
      rollCallTeacher?.currentTeacherPhone ?? rollCallTeacher?.defaultTeacherPhone,
    ),
  };
}

export async function getAdminTimeSettingsData(targetDate?: string | null) {
  const resolvedTargetDate = normalizeAdminTimeSettingsTargetDate(targetDate);
  // 业务固定：同校区同一天的课程上课时间一致。
  // 前端这里只取第一条课节作为页面展示锚点；
  // 真正保存时，后端会根据这个锚点课节反查“当天当前校区”的全部课节并批量更新。
  const settings = await fetchAdminTimeSettingsSessions({
      date: resolvedTargetDate,
    });
  const mapped = mapAdminTimeSettingsData(settings, {
    targetDate: resolvedTargetDate,
    todayDate: getShanghaiTodayDate(),
    weekStart: getShanghaiCurrentWeekStartDate(),
  });

  debugAdminRollCall("app.getAdminTimeSettingsData", {
    targetDate: resolvedTargetDate,
    count: settings.length,
    firstSetting: settings[0],
    mappedCards: mapped.cards,
  });

  return mapped;
}

export async function getAdminTimeSettingDetail(settingKey: string, targetDate?: string | null) {
  const resolvedSettingKey = resolveAdminTimeSettingKey(settingKey);
  if (!resolvedSettingKey) {
    return null;
  }

  const resolvedTargetDate = normalizeAdminTimeSettingsTargetDate(targetDate);
  const todayDate = getShanghaiTodayDate();

  const primarySetting = getPrimaryAdminTimeSetting(
    await fetchAdminTimeSettingsSessions({
      date: resolvedTargetDate,
    }),
  );
  if (!primarySetting) {
    return null;
  }

  const mapped = mapAdminTimeSettingDetail(resolvedSettingKey, primarySetting, {
    targetDate: resolvedTargetDate,
    todayDate,
  });
  debugAdminRollCall("app.getAdminTimeSettingDetail", {
    settingKey,
    resolvedSettingKey,
    targetDate: resolvedTargetDate,
    primarySetting,
    mapped,
  });
  return mapped;
}

export async function getAdminTimePicker(settingKey: string, targetDate?: string | null) {
  const resolvedSettingKey = resolveAdminTimeSettingKey(settingKey);
  if (!resolvedSettingKey) {
    return null;
  }

  const resolvedTargetDate = normalizeAdminTimeSettingsTargetDate(targetDate);
  const todayDate = getShanghaiTodayDate();

  const primarySetting = getPrimaryAdminTimeSetting(
    await fetchAdminTimeSettingsSessions({
      date: resolvedTargetDate,
    }),
  );
  if (!primarySetting) {
    return null;
  }

  return mapAdminTimePicker({
    settingKey: resolvedSettingKey,
    setting: primarySetting,
    targetDate: resolvedTargetDate,
    todayDate,
  });
}
