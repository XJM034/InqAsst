import type {
  AdminControlData,
  AdminClassAttendanceData,
  AdminClassAttendanceStudent,
  AdminCourseRosterData,
  AdminCourseSettingsData,
  AdminCourseTeachersData,
  AdminHomeData,
  AdminProfile,
  AdminTimePickerData,
  AdminTimeSettingDetailData,
  AdminTimeSettingsData,
  AdminUnarrivedData,
  AttendanceGroup,
  AttendanceGroupStudent,
  AttendanceSession,
  AttendanceStatus,
  AttendanceStudent,
  TeacherTemporaryStudentConfig,
  TeacherHomeData,
  TeacherProfile,
} from "@/lib/domain/types";
import type { StoredCampusOption } from "@/lib/services/auth-session";
import type {
  AbsentStudentRowDto,
  AdminCourseSettingsCourseDto,
  AdminHomeSummaryDto,
  AdminCourseSettingsOverviewDto,
  AttendanceLatestDto,
  CourseSessionTimeSettingDto,
  CourseDetailDto,
  CourseStudentRowDto,
  CourseWeekItemDto,
  HomeroomClassListItemDto,
  MeDto,
  RollCallOverviewRowDto,
  TeacherSettingOverviewRowDto,
  RollCallWindowDto,
  TeacherEntityDto,
  TeacherHomeDto,
  TeacherAttendanceGroupDto,
  TeacherTodaySessionDto,
  AttendanceSubmitRequestDto,
  TeacherAttendanceGroupSubmitRequestDto,
} from "@/lib/services/mobile-schema";
import {
  appendQueryHref,
  buildAdminControlClassHref,
  buildAdminCourseRosterHref,
  buildAdminCourseSettingsEditHref,
  buildAdminCourseStudentEditHref,
  buildAdminCourseStudentImportHref,
  buildAdminCourseStudentNewHref,
  buildAdminTimeSettingsHref,
  buildAdminTimeSettingDetailHref,
  buildAdminTimeSettingPickerHref,
} from "@/lib/admin-route-hrefs";
import { formatAdminAttendanceDateLabel } from "@/lib/admin-attendance-header";
import { normalizePhoneForDisplay } from "@/lib/utils/phone";

const SHANGHAI_TZ = "Asia/Shanghai";
const WEEKDAY_LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

type DayCourseSession = {
  courseId: number;
  courseName: string;
  location: string;
  campusName?: string | null;
  startAt: string;
  endAt: string;
  sessionId: number;
  rollCallCompleted: boolean;
  isSubstitute: boolean;
  effectiveRollCallStartAt?: string;
  effectiveRollCallEndAt?: string;
  rollCallWindowSource?: string;
  rollCallGroup?: {
    id: string;
    name?: string;
    size: number;
    canSubmit: boolean;
  };
};

type TeacherHomeSessionState = {
  isSubstitute: boolean;
};

function toShanghaiDate(value: string | Date) {
  return new Date(
    new Date(value).toLocaleString("en-US", { timeZone: SHANGHAI_TZ }),
  );
}

function getShanghaiDayKey(value: string | Date) {
  return DAY_KEYS[toShanghaiDate(value).getDay()] ?? "mon";
}

function formatDateLabel(date: Date) {
  const month = date.toLocaleDateString("zh-CN", {
    month: "numeric",
    timeZone: SHANGHAI_TZ,
  });
  const day = date.toLocaleDateString("zh-CN", {
    day: "numeric",
    timeZone: SHANGHAI_TZ,
  });
  const weekday = WEEKDAY_LABELS[date.getDay()];

  return `${month}${day} · ${weekday}`;
}

function formatShortDateLabel(date: Date) {
  const month = date.toLocaleDateString("zh-CN", {
    month: "numeric",
    timeZone: SHANGHAI_TZ,
  });
  const day = date.toLocaleDateString("zh-CN", {
    day: "numeric",
    timeZone: SHANGHAI_TZ,
  });

  return `${month}/${day}`;
}

function formatRuleDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00+08:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getMonth() + 1}/${date.getDate()} ${WEEKDAY_LABELS[date.getDay()]}`;
}

function addShanghaiDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00+08:00`);
  date.setDate(date.getDate() + days);
  const year = date.toLocaleDateString("en-CA", {
    year: "numeric",
    timeZone: SHANGHAI_TZ,
  });
  const month = date.toLocaleDateString("en-CA", {
    month: "2-digit",
    timeZone: SHANGHAI_TZ,
  });
  const day = date.toLocaleDateString("en-CA", {
    day: "2-digit",
    timeZone: SHANGHAI_TZ,
  });
  return `${year}-${month}-${day}`;
}

function getShanghaiWeekStartDate(value: string) {
  const date = new Date(`${value}T00:00:00+08:00`);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addShanghaiDays(value, mondayOffset);
}

function buildDefaultDayRuleLabel(value?: string | null) {
  const normalized = value?.trim();

  if (!normalized) {
    return "默认（今日）";
  }

  const date = new Date(`${normalized}T00:00:00+08:00`);
  if (Number.isNaN(date.getTime())) {
    return "默认（今日）";
  }

  return `默认（${WEEKDAY_LABELS[date.getDay()]}）`;
}

function parseOffsetRulePart(value: string) {
  const normalized = value.trim();

  if (normalized === "开课时") {
    return 0;
  }

  const match = normalized.match(/^开课(前|后)\s*(\d+)\s*分钟$/);
  if (!match) {
    return null;
  }

  const minutes = Number(match[2]);
  return match[1] === "前" ? -minutes : minutes;
}

function formatHomeRollCallTimeRange(value: string | null | undefined) {
  const normalized = value?.trim();

  if (!normalized) {
    return "";
  }

  const [rawStartOffset, rawEndOffset] = normalized.split(/\s*-\s*/);
  if (
    rawStartOffset &&
    rawEndOffset &&
    parseOffsetRulePart(rawStartOffset) !== null &&
    parseOffsetRulePart(rawEndOffset) !== null
  ) {
    return "";
  }

  return normalized;
}

function formatTimeLabel(value: string) {
  return new Date(value).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: SHANGHAI_TZ,
  });
}

function formatTimeRange(startAt: string, endAt: string) {
  return `${formatTimeLabel(startAt)}-${formatTimeLabel(endAt)}`;
}

function formatClockText(value?: string | null) {
  if (!value) {
    return "--:--";
  }

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    return value.slice(0, 5);
  }

  return formatTimeLabel(value);
}

function formatClockRange(start?: string | null, end?: string | null) {
  return `${formatClockText(start)}-${formatClockText(end)}`;
}

function formatOffsetLabel(offsetMinutes?: number | null) {
  if (offsetMinutes === null || typeof offsetMinutes === "undefined") {
    return "未设置";
  }

  if (offsetMinutes === 0) {
    return "开课时";
  }

  const absoluteMinutes = Math.abs(offsetMinutes);
  return offsetMinutes < 0
    ? `开课前 ${absoluteMinutes} 分钟`
    : `开课后 ${absoluteMinutes} 分钟`;
}

function formatOffsetRangeLabel(
  startOffsetMinutes?: number | null,
  endOffsetMinutes?: number | null,
) {
  if (
    startOffsetMinutes === null ||
    typeof startOffsetMinutes === "undefined" ||
    endOffsetMinutes === null ||
    typeof endOffsetMinutes === "undefined"
  ) {
    return "按校区规则执行";
  }

  return `${formatOffsetLabel(startOffsetMinutes)} - ${formatOffsetLabel(endOffsetMinutes)}`;
}

function toLocalTimeString(value?: RollCallWindowDto["windowEnd"] | null) {
  if (!value) {
    return null;
  }

  const hour = String(value.hour ?? 0).padStart(2, "0");
  const minute = String(value.minute ?? 0).padStart(2, "0");

  return `${hour}:${minute}:00`;
}

function getGreeting(name: string) {
  const trimmedName = name.trim();
  const displayName =
    !trimmedName || trimmedName === "老师"
      ? "老师"
      : trimmedName.endsWith("老师")
        ? trimmedName
        : `${trimmedName}老师`;

  const hourPart = new Intl.DateTimeFormat("zh-CN", {
    hour: "numeric",
    hour12: false,
    timeZone: SHANGHAI_TZ,
  })
    .formatToParts(new Date())
    .find((part) => part.type === "hour")?.value;
  const hour = Number(hourPart ?? "0");

  if (hour < 12) {
    return `${displayName}早上好`;
  }

  if (hour < 18) {
    return `${displayName}下午好`;
  }

  return `${displayName}晚上好`;
}

function toAttendanceStatus(status?: number | string | null): AttendanceStatus {
  if (status === null || typeof status === "undefined") {
    return "unmarked";
  }

  if (typeof status === "number") {
    if (status === 0) {
      return "absent";
    }

    if (status === 1) {
      return "leave";
    }

    return "present";
  }

  const normalized = status.toUpperCase();

  if (normalized === "UNMARKED") {
    return "unmarked";
  }

  if (normalized === "1" || normalized === "LEAVE") {
    return "leave";
  }

  if (normalized === "0" || normalized === "ABSENT") {
    return "absent";
  }

  return "present";
}

export function toApiAttendanceStatus(status: AttendanceStatus) {
  if (status === "absent") {
    return 0 as const;
  }

  if (status === "leave") {
    return 1 as const;
  }

  return 2 as const;
}

function buildStatusMap(latest: AttendanceLatestDto | null | undefined) {
  if (!latest?.items?.length) {
    return new Map<number, AttendanceStatus>();
  }

  return new Map(
    latest.items.map((item) => [item.studentId, toAttendanceStatus(item.status)]),
  );
}

function buildCourseStudents(
  students: CourseStudentRowDto[],
  latest?: AttendanceLatestDto | null,
  options?: {
    useLatestOnlyToday?: boolean;
    defaultToPresent?: boolean;
  },
) {
  const latestStatusMap = buildStatusMap(latest);
  const shouldUseLatest = options?.useLatestOnlyToday ? Boolean(latest?.hasSubmittedToday) : true;

  return students.map<AttendanceStudent>((student) => {
    const hasLatestStatus = latestStatusMap.has(student.studentId);
    const latestStatus = latestStatusMap.get(student.studentId);
    const resolvedStatus = shouldUseLatest
      ? hasLatestStatus
        ? latestStatus ?? "unmarked"
        : "unmarked"
      : toAttendanceStatus(student.lastAttendanceStatus);

    return {
      id: String(student.studentId),
      externalStudentId: student.externalStudentId ?? undefined,
      name: student.studentName,
      homeroomClass: student.homeroomClassName,
      homeroomClassId: student.homeroomClassId,
      status:
        options?.defaultToPresent && resolvedStatus === "unmarked"
          ? "present"
          : resolvedStatus,
    };
  });
}

function normalizeHomeroomClasses(
  homeroomClasses?: HomeroomClassListItemDto[] | null,
) {
  const classes = new Map<number, string>();
  const items = Array.isArray(homeroomClasses) ? homeroomClasses : [];

  for (const homeroomClass of items) {
    if (typeof homeroomClass.id !== "number" || !homeroomClass.name?.trim()) {
      continue;
    }

    classes.set(homeroomClass.id, homeroomClass.name.trim());
  }

  return [...classes.entries()].map(([id, name]) => ({ id, name }));
}

function buildRosterHomeroomClasses(students: CourseStudentRowDto[]) {
  const classes = new Map<number, string>();
  const items = Array.isArray(students) ? students : [];

  for (const student of items) {
    if (typeof student.homeroomClassId !== "number" || !student.homeroomClassName?.trim()) {
      continue;
    }

    classes.set(student.homeroomClassId, student.homeroomClassName.trim());
  }

  return [...classes.entries()].map(([id, name]) => ({ id, name }));
}

function buildTemporaryStudentConfig(options: {
  homeroomClasses?: HomeroomClassListItemDto[] | null;
  rosterStudents: CourseStudentRowDto[];
}): TeacherTemporaryStudentConfig {
  const homeroomClasses = normalizeHomeroomClasses(options.homeroomClasses);
  const fallbackClasses = buildRosterHomeroomClasses(options.rosterStudents);
  const resolvedClasses = homeroomClasses.length > 0 ? homeroomClasses : fallbackClasses;

  return {
    homeroomClasses: resolvedClasses,
    disabledReason:
      resolvedClasses.length > 0
        ? undefined
        : "当前没有可选行政班，暂时无法补录临时学生。",
  };
}

export function mapAdminAttendanceRoster(
  students: CourseStudentRowDto[],
  latest?: AttendanceLatestDto | null,
): AdminClassAttendanceStudent[] {
  return buildCourseStudents(students, latest, {
    useLatestOnlyToday: true,
    defaultToPresent: false,
  }).map<AdminClassAttendanceStudent>((student) => ({
    id: student.id,
    name: student.name,
    homeroomClass: student.homeroomClass,
    homeroomClassId: student.homeroomClassId,
    status: student.status,
    managerUpdated: student.managerUpdated,
    overrideLabel: student.overrideLabel,
  }));
}

function getTeacherName(detail: CourseDetailDto) {
  const preferredTeacher =
    detail.teachers.find((teacher) => teacher.role === "ROLL_CALL") ??
    detail.teachers.find((teacher) => teacher.role === "PRIMARY") ??
    detail.teachers[0];

  return preferredTeacher?.name ?? "待分配老师";
}

function getResolvedTeacherName(payload: {
  rollCallTeacherName?: string | null;
  defaultTeacherName?: string | null;
  fallbackDetail?: CourseDetailDto;
}) {
  return (
    payload.rollCallTeacherName ??
    payload.defaultTeacherName ??
    (payload.fallbackDetail ? getTeacherName(payload.fallbackDetail) : null) ??
    "待分配老师"
  );
}

function buildWeekCalendar(home: TeacherHomeDto, daySessionsByKey: Map<string, DayCourseSession[]>) {
  const weekStart = new Date(`${home.weekStart}T00:00:00+08:00`);
  const shanghaiToday = new Date().toLocaleDateString("en-CA", {
    timeZone: SHANGHAI_TZ,
  });

  // Weekend makeup classes also need a selectable day entry on teacher home.
  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + offset);
    const key = DAY_KEYS[date.getDay()];
    const isToday =
      date.toLocaleDateString("en-CA", {
        timeZone: SHANGHAI_TZ,
      }) === shanghaiToday;

    return {
      key,
      label: WEEKDAY_LABELS[date.getDay()].replace("周", ""),
      caption: isToday ? "今日" : formatShortDateLabel(date),
      active: offset === 0,
      hasClass: daySessionsByKey.has(key),
    };
  });
}

function isWindowEffective(window: RollCallWindowDto, date: Date) {
  const dateString = date.toLocaleDateString("en-CA", { timeZone: SHANGHAI_TZ });

  if (window.effectiveFrom && dateString < window.effectiveFrom) {
    return false;
  }

  if (window.effectiveTo && dateString > window.effectiveTo) {
    return false;
  }

  return true;
}

function findWindowForDate(windows: RollCallWindowDto[], date: Date) {
  const weekday = date.getDay() === 0 ? 7 : date.getDay();

  return windows.find((window) => window.weekday === weekday && isWindowEffective(window, date));
}

function resolveWindowRangeForSession(window: RollCallWindowDto | undefined, sessionStartAt: string) {
  if (!window) {
    return null;
  }

  if (
    typeof window.startOffsetMinutes === "number" &&
    typeof window.endOffsetMinutes === "number"
  ) {
    const startDate = new Date(sessionStartAt);
    const windowStartAt = new Date(startDate.getTime() + window.startOffsetMinutes * 60_000);
    const windowEndAt = new Date(startDate.getTime() + window.endOffsetMinutes * 60_000);

    return {
      startAt: windowStartAt.toISOString(),
      endAt: windowEndAt.toISOString(),
      startOffsetMinutes: window.startOffsetMinutes,
      endOffsetMinutes: window.endOffsetMinutes,
    };
  }

  const windowStart = toLocalTimeString(window.windowStart);
  const windowEnd = toLocalTimeString(window.windowEnd);
  if (!windowStart || !windowEnd) {
    return null;
  }

  const sessionDate = sessionStartAt.slice(0, 10);
  return {
    startAt: `${sessionDate}T${windowStart}+08:00`,
    endAt: `${sessionDate}T${windowEnd}+08:00`,
    startOffsetMinutes: undefined,
    endOffsetMinutes: undefined,
  };
}

function resolveEffectiveWindowRangeForTeacherSession(session: {
  effectiveRollCallStartAt?: string | null;
  effectiveRollCallEndAt?: string | null;
}) {
  if (!session.effectiveRollCallStartAt || !session.effectiveRollCallEndAt) {
    return null;
  }

  return {
    startAt: session.effectiveRollCallStartAt,
    endAt: session.effectiveRollCallEndAt,
    startOffsetMinutes: undefined,
    endOffsetMinutes: undefined,
  };
}

function getWeekdayLabel(weekday: number) {
  if (weekday === 7) {
    return "周日";
  }

  return WEEKDAY_LABELS[weekday] ?? `周${weekday}`;
}

function getWeekdayKey(weekday: number) {
  if (weekday === 7) {
    return "sun";
  }

  return DAY_KEYS[weekday] ?? "tue";
}

function buildCourseHref(basePath: string, session: DayCourseSession) {
  if (session.rollCallGroup) {
    return appendQueryHref("/teacher/attendance/group", {
      groupId: session.rollCallGroup.id,
    });
  }

  return appendQueryHref(basePath, {
    courseId: session.courseId,
    courseSessionId: session.sessionId,
  });
}

function getRollCallGroupMeta(session: TeacherTodaySessionDto) {
  if (session.rollCallGroupId === null || typeof session.rollCallGroupId === "undefined") {
    return undefined;
  }

  const groupId = String(session.rollCallGroupId).trim();
  if (!groupId) {
    return undefined;
  }

  return {
    id: groupId,
    name: session.rollCallGroupName?.trim() || undefined,
    size: Math.max(2, session.rollCallGroupSize ?? 2),
    canSubmit: session.rollCallGroupCanSubmit !== false,
  };
}

function toDayCourseSession(session: TeacherTodaySessionDto): DayCourseSession {
  return {
    courseId: session.courseId,
    courseName: session.courseName,
    location: session.location ?? "上课地点待定",
    campusName: session.campusName ?? null,
    startAt: session.sessionStartAt,
    endAt: session.sessionEndAt,
    sessionId: session.sessionId,
    rollCallCompleted: session.rollCallCompleted,
    isSubstitute: Boolean(session.substitute),
    effectiveRollCallStartAt: session.effectiveRollCallStartAt ?? undefined,
    effectiveRollCallEndAt: session.effectiveRollCallEndAt ?? undefined,
    rollCallWindowSource: session.rollCallWindowSource ?? undefined,
    rollCallGroup: getRollCallGroupMeta(session),
  };
}

function buildDaySessions(
  courses: CourseWeekItemDto[],
  todaySessions: TeacherTodaySessionDto[],
) {
  const todaySessionMap = new Map(
    todaySessions.map((item) => [
      item.sessionId,
      {
        ...item,
      },
    ]),
  );
  const sessionsByDay = new Map<string, DayCourseSession[]>();

  for (const course of courses) {
    for (const session of course.sessionsInWeek) {
      const key = getShanghaiDayKey(session.startAt);
      const daySessions = sessionsByDay.get(key) ?? [];
      const todaySession = todaySessionMap.get(session.id);

      daySessions.push(
        todaySession
          ? toDayCourseSession(todaySession)
          : {
              courseId: course.id,
              courseName: course.name,
              location: course.location ?? "上课地点待定",
              campusName: course.campusName ?? null,
              startAt: session.startAt,
              endAt: session.endAt,
              sessionId: session.id,
              rollCallCompleted: false,
              isSubstitute: Boolean(session.substitute),
            },
      );
      sessionsByDay.set(key, daySessions);
    }
  }

  for (const sessions of sessionsByDay.values()) {
    sessions.sort((left, right) => left.startAt.localeCompare(right.startAt));
  }

  return sessionsByDay;
}

function buildTodayOverrideSessions(todaySessions: TeacherTodaySessionDto[]) {
  const sessions = [...todaySessions]
    .sort((left, right) => left.sessionStartAt.localeCompare(right.sessionStartAt))
    .map<DayCourseSession>(toDayCourseSession);
  const mergedSessions: DayCourseSession[] = [];
  const seenGroupIds = new Set<string>();

  for (const session of sessions) {
    const group = session.rollCallGroup;
    if (!group) {
      mergedSessions.push(session);
      continue;
    }

    if (seenGroupIds.has(group.id)) {
      continue;
    }

    const groupSessions = sessions.filter((item) => item.rollCallGroup?.id === group.id);
    const groupSize = Math.max(group.size, groupSessions.length);
    const groupTitle = group.name ?? `合班点名（${groupSize} 个班级）`;
    seenGroupIds.add(group.id);
    mergedSessions.push({
      ...session,
      courseName: groupTitle,
      location:
        groupSessions.length > 1
          ? `${groupSessions.length} 个班级同组点名`
          : session.location,
      rollCallCompleted: groupSessions.every((item) => item.rollCallCompleted),
      isSubstitute: true,
      rollCallGroup: {
        ...group,
        size: groupSize,
      },
    });
  }

  return mergedSessions;
}

function buildTeacherHomeAction(
  session: DayCourseSession,
  windows: RollCallWindowDto[],
  now: Date,
) {
  const sessionDate = new Date(session.startAt);
  const isToday =
    sessionDate.toLocaleDateString("en-CA", { timeZone: SHANGHAI_TZ }) ===
    now.toLocaleDateString("en-CA", { timeZone: SHANGHAI_TZ });
  const resolvedWindow =
    resolveEffectiveWindowRangeForTeacherSession(session) ??
    (() => {
      const window = findWindowForDate(windows, sessionDate);
      return resolveWindowRangeForSession(window, session.startAt);
    })();
  const isWindowActive = resolvedWindow
    ? now.getTime() >= new Date(resolvedWindow.startAt).getTime() &&
      now.getTime() <= new Date(resolvedWindow.endAt).getTime()
    : false;
  const sessionStartAt = new Date(session.startAt);
  const sessionEndAt = new Date(session.endAt);
  const sessionInProgress =
    isToday &&
    now.getTime() >= sessionStartAt.getTime() &&
    now.getTime() <= sessionEndAt.getTime();
  const attendanceActive = isToday && isWindowActive;
  const canViewAttendance = attendanceActive || sessionInProgress;

  return {
    actionLabel: canViewAttendance
      ? session.rollCallCompleted || !attendanceActive
        ? "查看点名情况"
        : "开始点名"
      : "查看学生名单",
    attendanceWindowState: attendanceActive ? ("active" as const) : ("inactive" as const),
    rollCallStartAt: resolvedWindow?.startAt,
    rollCallDeadlineAt: resolvedWindow?.endAt,
    referenceSessionStartAt: session.startAt,
    referenceSessionEndAt: session.endAt,
  };
}

export function buildAttendanceSubmitRequest(
  students: Array<Pick<AttendanceStudent, "id" | "status">>,
  courseSessionId?: string,
): AttendanceSubmitRequestDto {
  return {
    courseSessionId: courseSessionId ? Number(courseSessionId) : undefined,
    items: students.map((student) => ({
      studentId: Number(student.id),
      status: toApiAttendanceStatus(student.status),
    })),
  };
}

export function buildAttendanceGroupSubmitRequest(
  students: Array<Pick<AttendanceGroupStudent, "courseSessionId" | "id" | "status">>,
): TeacherAttendanceGroupSubmitRequestDto {
  return {
    items: students.map((student) => ({
      courseSessionId: Number(student.courseSessionId),
      studentId: Number(student.id),
      status: toApiAttendanceStatus(student.status),
    })),
  };
}

export function mapAttendanceGroup(payload: TeacherAttendanceGroupDto): AttendanceGroup {
  const sortedSessions = [...payload.sessions].sort((left, right) =>
    left.sessionStartAt.localeCompare(right.sessionStartAt) ||
    left.courseName.localeCompare(right.courseName, "zh-CN"),
  );
  const firstSession = sortedSessions[0];
  const referenceStartAt = payload.sessionStartAt ?? firstSession?.sessionStartAt;
  const referenceEndAt = payload.sessionEndAt ?? firstSession?.sessionEndAt;
  const sessionDate = payload.sessionDate
    ? new Date(`${payload.sessionDate}T00:00:00+08:00`)
    : referenceStartAt
      ? new Date(referenceStartAt)
      : new Date();
  const canSubmit = payload.canSubmit !== false;
  const submitDisabled =
    !canSubmit ||
    Boolean(payload.submitDisabledReason) ||
    payload.attendanceWindowActive === false;
  const submitDisabledReason =
    payload.submitDisabledReason ??
    (!canSubmit
      ? "当前老师只能查看该合班点名情况，不能提交点名。"
      : payload.attendanceWindowActive === false
        ? "当前不在合班点名时间内"
        : undefined);

  return {
    id: String(payload.groupId),
    pageTitle: "合班点名",
    campusLabel: payload.campusName ?? undefined,
    dateLabel: formatDateLabel(sessionDate),
    sessionTimeLabel:
      referenceStartAt && referenceEndAt ? formatTimeRange(referenceStartAt, referenceEndAt) : undefined,
    title: payload.groupName?.trim() || `合班点名（${sortedSessions.length} 个班级）`,
    info: [
      payload.campusName,
      referenceStartAt && referenceEndAt ? formatTimeRange(referenceStartAt, referenceEndAt) : null,
      `${sortedSessions.length} 个班级`,
    ]
      .filter(Boolean)
      .join(" | "),
    submitLabel: sortedSessions.every((session) => session.rollCallCompleted)
      ? "重新提交合班点名"
      : "提交合班点名",
    submitDisabled,
    submitDisabledReason,
    attendanceWindowActive: payload.attendanceWindowActive ?? undefined,
    classes: sortedSessions.map((session) => {
      const students = buildCourseStudents(session.students, session.latest, {
        useLatestOnlyToday: true,
        defaultToPresent: true,
      }).map<AttendanceGroupStudent>((student) => ({
        ...student,
        courseSessionId: String(session.courseSessionId),
        courseTitle: session.courseName,
      }));

      return {
        courseId: String(session.courseId),
        courseSessionId: String(session.courseSessionId),
        title: session.courseName,
        meta: [
          session.location ?? "上课地点待定",
          formatTimeRange(session.sessionStartAt, session.sessionEndAt),
        ].join(" · "),
        temporaryStudent: buildTemporaryStudentConfig({
          rosterStudents: session.students,
        }),
        students,
      };
    }),
  };
}

export function mapTeacherProfile(me: MeDto): TeacherProfile {
  return {
    name: me.name ?? me.username ?? "老师",
    phone: me.phone,
    roleLabel: me.campusName ? `${me.campusName} - 老师` : "老师",
  };
}

export function mapAdminProfile(
  me: MeDto,
  storedCampusOptions: StoredCampusOption[] = [],
): AdminProfile {
  const currentCampusId = me.campusId ? String(me.campusId) : undefined;
  const currentCampusLabel = me.campusName ?? "当前校区";
  const fallbackCurrentOption = currentCampusId
    ? {
        id: currentCampusId,
        label: currentCampusLabel,
        shortLabel: currentCampusLabel.slice(0, 2),
        adminUserId: me.adminUserId ?? undefined,
      }
    : null;
  const apiCampusOptions =
    me.campusOptions?.map((item) => ({
      id: String(item.campusId),
      label: item.campusName ?? `校区 ${item.campusId}`,
      shortLabel: (item.campusName ?? `校区 ${item.campusId}`).slice(0, 2),
      adminUserId: item.adminUserId,
    })) ?? [];
  const cookieCampusOptions = storedCampusOptions.map((item) => ({
    id: item.campusId,
    label: item.campusName ?? `校区 ${item.campusId}`,
    shortLabel: (item.campusName ?? `校区 ${item.campusId}`).slice(0, 2),
    adminUserId: item.adminUserId,
  }));
  const campusOptions = apiCampusOptions.length > 0 ? apiCampusOptions : cookieCampusOptions;
  const mergedCampusOptions = fallbackCurrentOption
    ? [
        fallbackCurrentOption,
        ...campusOptions.filter((item) => item.id !== fallbackCurrentOption.id),
      ]
    : campusOptions;

  return {
    name: me.name ?? me.username ?? "管理员",
    phone: me.phone,
    roleLabel: `${me.campusName ?? "当前校区"} - 管理老师`,
    activeCampusId: currentCampusId ?? mergedCampusOptions[0]?.id,
    campusOptions: mergedCampusOptions,
  };
}
export function mapTeacherHomeData(payload: {
  me: MeDto;
  home: TeacherHomeDto;
  todaySessions: TeacherTodaySessionDto[];
  sessionTeacherStates?: Map<number, TeacherHomeSessionState>;
}): TeacherHomeData {
  const daySessionsByKey = buildDaySessions(payload.home.weekCourses, payload.todaySessions);
  const now = toShanghaiDate(new Date());
  const todayDayKey = getShanghaiDayKey(now);
  const todayOverrideSessions = buildTodayOverrideSessions(payload.todaySessions);
  if (todayOverrideSessions.length > 0) {
    daySessionsByKey.set(todayDayKey, todayOverrideSessions);
  } else {
    daySessionsByKey.delete(todayDayKey);
  }
  const weekCalendar = buildWeekCalendar(payload.home, daySessionsByKey);
  const defaultDayKey =
    weekCalendar.find((item) => item.key === todayDayKey)?.key ??
    weekCalendar.find((item) => item.hasClass)?.key ??
    "mon";

  const daySchedules = Array.from(daySessionsByKey.entries()).map(([dayKey, sessions]) => {
    const sessionEntries = sessions.map((session, index) => ({
      session,
      index,
      isSubstitute:
        session.isSubstitute ||
        (payload.sessionTeacherStates?.get(session.sessionId)?.isSubstitute ?? false),
    }));
    // 业务口径：代课/合班才是当前老师更需要处理的任务，首页优先展示它们。
    // 原始课程保留为次要卡；如果当天唯一一节课就是代课，只保留这一张代课卡。
    const isPriorityTeacherTask = (entry: (typeof sessionEntries)[number]) =>
      entry.isSubstitute || Boolean(entry.session.rollCallGroup);
    const primaryEntry =
      sessionEntries.find(isPriorityTeacherTask) ?? sessionEntries[0];
    const primary = primaryEntry.session;
    const primaryDate = new Date(primary.startAt);
    const primaryAction = buildTeacherHomeAction(
      primary,
      payload.home.campusRollCallWindows,
      now,
    );
    const secondaryEntry =
      sessionEntries.find(
        (entry) =>
          entry.session.sessionId !== primary.sessionId && isPriorityTeacherTask(entry),
      ) ??
      sessionEntries.find((entry) => entry.session.sessionId !== primary.sessionId);
    const secondary = secondaryEntry?.session;
    const secondaryAction = secondary
      ? buildTeacherHomeAction(secondary, payload.home.campusRollCallWindows, now)
      : null;

    return {
      dayKey,
      dateLabel: formatDateLabel(primaryDate),
      primaryCourse: {
        campus: primary.campusName ?? undefined,
        kind: primary.rollCallGroup
          ? ("merge" as const)
          : primaryEntry.isSubstitute
            ? ("substitute" as const)
            : undefined,
        badge: primary.rollCallGroup
          ? "合班"
          : primaryEntry.isSubstitute
            ? "代课"
            : undefined,
        title: primary.courseName,
        time: formatTimeRange(primary.startAt, primary.endAt),
        referenceSessionStartAt: primaryAction.referenceSessionStartAt,
        referenceSessionEndAt: primaryAction.referenceSessionEndAt,
        rollCallStartAt: primaryAction.rollCallStartAt,
        rollCallDeadlineAt: primaryAction.rollCallDeadlineAt,
        locationTrail: primary.location,
        expectedLabel: primary.rollCallGroup
          ? `${primary.rollCallGroup.size} 个班级`
          : primaryEntry.isSubstitute
          ? `代课${primary.rollCallCompleted ? "已完成" : "待完成"}`
          : undefined,
        actionHref: buildCourseHref("/teacher/attendance/session", primary),
        rosterHref: buildCourseHref("/teacher/home/roster", primary),
        actionLabel: primary.rollCallGroup
          ? primary.rollCallGroup.canSubmit && primaryAction.actionLabel === "开始点名"
            ? "开始合班点名"
            : "查看合班情况"
          : primaryAction.actionLabel,
        attendanceWindowState: primaryAction.attendanceWindowState,
      },
      substituteCourse:
        secondary && secondaryAction
          ? {
              kind: secondaryEntry?.isSubstitute
                ? secondary.rollCallGroup
                  ? ("merge" as const)
                  : ("substitute" as const)
                : secondary.rollCallGroup
                  ? ("merge" as const)
                  : ("other" as const),
              badge: secondary.rollCallGroup
                ? "合班"
                : secondaryEntry?.isSubstitute
                  ? "代课"
                  : "原定课",
              campus: secondary.campusName ?? undefined,
              title: secondary.courseName,
              time: formatTimeRange(secondary.startAt, secondary.endAt),
              referenceSessionStartAt: secondaryAction.referenceSessionStartAt,
              referenceSessionEndAt: secondaryAction.referenceSessionEndAt,
              rollCallStartAt: secondaryAction.rollCallStartAt,
              rollCallDeadlineAt: secondaryAction.rollCallDeadlineAt,
              locationTrail: secondary.location,
              expectedLabel: secondary.rollCallGroup
                ? `${secondary.rollCallGroup.size} 个班级`
                : secondaryEntry?.isSubstitute
                ? `代课${secondary.rollCallCompleted ? "已完成" : "待完成"}`
                : `第${(secondaryEntry?.index ?? 0) + 1}节`,
              actionLabel: secondary.rollCallGroup
                ? secondary.rollCallGroup.canSubmit && secondaryAction.actionLabel === "开始点名"
                  ? "开始合班点名"
                  : "查看合班情况"
                : secondaryAction.actionLabel,
              actionHref: buildCourseHref("/teacher/attendance/session", secondary),
              rosterHref: buildCourseHref("/teacher/home/roster", secondary),
              attendanceWindowState: secondaryAction.attendanceWindowState,
        }
          : undefined,
    };
  });

  return {
    greeting: getGreeting(payload.me.name ?? payload.me.username ?? "老师"),
    defaultDayKey,
    weekCalendar,
    daySchedules,
    noClassMessage:
      daySchedules.length === 0 ? "老师今天无课，首页其他功能仍可正常使用。" : undefined,
  };
}

export function mapAttendanceSession(payload: {
  courseId: number;
  courseSessionId?: number;
  course: CourseDetailDto;
  campusName?: string | null;
  students: CourseStudentRowDto[];
  latest?: AttendanceLatestDto | null;
  rollCallWindows?: RollCallWindowDto[];
  todaySession?: TeacherTodaySessionDto;
  homeroomClasses?: HomeroomClassListItemDto[] | null;
}): AttendanceSession {
  const courseCampusName = payload.course.campusName ?? payload.campusName ?? undefined;
  const selectedSession =
    payload.course.sessions.find((session) => session.id === payload.courseSessionId) ??
    payload.course.sessions[0];
  const effectiveSessionStartAt =
    payload.todaySession?.sessionStartAt ?? selectedSession?.startAt;
  const effectiveSessionEndAt =
    payload.todaySession?.sessionEndAt ?? selectedSession?.endAt;
  const sessionDate = effectiveSessionStartAt ? new Date(effectiveSessionStartAt) : new Date();
  const currentWindow = effectiveSessionStartAt
    ? findWindowForDate(payload.rollCallWindows ?? [], sessionDate)
    : undefined;
  const resolvedWindow =
    resolveEffectiveWindowRangeForTeacherSession({
      effectiveRollCallStartAt: payload.todaySession?.effectiveRollCallStartAt,
      effectiveRollCallEndAt: payload.todaySession?.effectiveRollCallEndAt,
    }) ??
    (effectiveSessionStartAt
      ? resolveWindowRangeForSession(currentWindow, effectiveSessionStartAt)
      : null);
  const now = new Date();
  const attendanceWindowActive = resolvedWindow
    ? now.getTime() >= new Date(resolvedWindow.startAt).getTime() &&
      now.getTime() <= new Date(resolvedWindow.endAt).getTime()
    : false;
  const submitDisabled = !attendanceWindowActive;
  const submitDisabledReason = resolvedWindow
    ? `点名窗口 ${formatTimeLabel(resolvedWindow.startAt)} - ${formatTimeLabel(resolvedWindow.endAt)}，${
        attendanceWindowActive
          ? "当前可提交"
          : now.getTime() < new Date(resolvedWindow.startAt).getTime()
            ? "未到开始时间"
            : "超时不得提交"
      }`
    : "当前不在点名时间，可先核对学生名单。";

  // 业务口径：
  // 1. 教师端只能在“已到/未到”之间切换；
  // 2. 请假状态可以展示，但不允许老师直接改动；
  // 3. 未点名学生进入教师端时默认按“已到”展示，避免老师页面出现第三种可切换状态。
  return {
    id: String(payload.courseSessionId ?? payload.courseId),
    courseId: String(payload.courseId),
    courseSessionId: payload.courseSessionId ? String(payload.courseSessionId) : undefined,
    pageTitle: "点名",
    campusLabel: courseCampusName,
    dateLabel: formatDateLabel(sessionDate),
    sessionTimeLabel:
      effectiveSessionStartAt && effectiveSessionEndAt
        ? formatTimeRange(effectiveSessionStartAt, effectiveSessionEndAt)
        : undefined,
    referenceSessionStartAt: effectiveSessionStartAt ?? undefined,
    referenceSessionEndAt: effectiveSessionEndAt ?? undefined,
    rollCallStartAt: resolvedWindow?.startAt ?? undefined,
    rollCallDeadlineAt: resolvedWindow?.endAt ?? undefined,
    courseTitle: payload.course.name,
    courseInfo: [
      courseCampusName,
      payload.course.location ?? "上课地点待定",
      effectiveSessionStartAt && effectiveSessionEndAt
        ? formatTimeRange(effectiveSessionStartAt, effectiveSessionEndAt)
        : "待排课",
    ]
      .filter((item) => item && String(item).trim().length > 0)
      .join(" | "),
    deadlineHint: submitDisabledReason,
    tapHint:
      "提交点名后管理员会同步学生请假或更改其他情况（标记为黄色学生卡片），请确认更改的学生信息是否符合实际出勤情况，若不符合请及时告知管理员！",
    submitLabel: payload.latest?.hasSubmittedToday ? "重新提交点名" : "提交点名",
    submitDisabled,
    submitDisabledReason,
    attendanceWindowActive,
    hasSubmittedToday: Boolean(payload.latest?.hasSubmittedToday),
    latestAttendanceRecordId:
      typeof payload.latest?.attendanceRecordId === "number"
        ? String(payload.latest.attendanceRecordId)
        : undefined,
    latestSubmittedAt: payload.latest?.submittedAt ?? undefined,
    draftNotice: payload.latest?.hasSubmittedToday
      ? undefined
      : "当前页面展示的是老师端草稿，确认提交后才会同步到管理端。",
    temporaryStudent: buildTemporaryStudentConfig({
      homeroomClasses: payload.homeroomClasses,
      rosterStudents: payload.students,
    }),
    students: buildCourseStudents(payload.students, payload.latest, {
      useLatestOnlyToday: true,
      defaultToPresent: true,
    }),
  };
}

export function mapAdminHomeData(payload: {
  me: MeDto;
  summary: AdminHomeSummaryDto;
}): AdminHomeData {
  const actualClassTimeRange = payload.summary.actualClassTimeRange?.trim();
  const rollCallTimeRange = formatHomeRollCallTimeRange(payload.summary.rollCallTimeRange);
  const configuredTimeRuleCount =
    Number(Boolean(actualClassTimeRange)) + Number(Boolean(rollCallTimeRange));
  const todaySubstituteCourseCount = payload.summary.todaySubstituteCourseCount ?? 0;
  const todaySubstituteTeacherCount = payload.summary.todaySubstituteTeacherCount ?? 0;
  const todaySubstituteSummary =
    todaySubstituteCourseCount === 0 && todaySubstituteTeacherCount === 0
      ? "今日无代课"
      : `${todaySubstituteCourseCount} 班级 · ${todaySubstituteTeacherCount} 老师`;
  const heroDescription =
    todaySubstituteCourseCount === 0 && todaySubstituteTeacherCount === 0
      ? "默认老师会按选修课系统自动同步，需要时可在这里查看并调整今天各课程的点名老师。"
      : "进入后可查看今天各课程的点名老师，也可处理临时代课调整。";
  const courseSettingsDescription =
    payload.summary.sessionCountToday > 0
      ? "查看今日生效课程，继续调整课程信息和课程名单。"
      : "当前还没有今日生效课程，可先补充今天的课程安排。";
  const timeSettingsDescription =
    configuredTimeRuleCount > 0
      ? "统一今天的实际上课与点名时间，保持老师端入口口径一致。"
      : "先补时间规则，再让老师端点名入口稳定按今天的安排展示。";

  return {
    campusLabel: payload.me.campusName ?? "当前校区",
    title: "管理设置",
    ruleDateLabel: formatRuleDateLabel(payload.summary.date),
    effectiveRules: [
      {
        label: "实际上课",
        value: actualClassTimeRange || "暂无实际上课",
        tone: "neutral",
      },
      {
        label: "点名时间",
        value: rollCallTimeRange || "待配置",
        tone: "warning",
      },
      {
        label: "今日代课",
        value: todaySubstituteSummary,
        tone: "success",
      },
    ],
    heroDescription,
    heroPrimaryHref: "/admin/emergency",
    entryCards: [
      {
        href: "/admin/course-settings",
        title: "课程设置",
        description: courseSettingsDescription,
        badge:
          payload.summary.sessionCountToday > 0
            ? `${payload.summary.sessionCountToday} 节生效`
            : "暂无生效",
        icon: "users",
        iconTone: "success",
        badgeTone: "success",
      },
      {
        href: "/admin/time-settings",
        title: "时间设置",
        description: timeSettingsDescription,
        badge: configuredTimeRuleCount > 0 ? "点名时间已生效" : "点名时间待配置",
        icon: "clock",
        iconTone: "info",
        badgeTone: configuredTimeRuleCount > 0 ? "info" : "neutral",
      },
    ],
  };
}

export function mapAdminTimeSettingsData(
  settings: CourseSessionTimeSettingDto[],
  options?: {
    targetDate?: string;
    todayDate?: string;
    weekStart?: string;
  },
): AdminTimeSettingsData {
  const primary = settings[0];
  const targetDate = options?.targetDate ?? primary?.sessionDate ?? "";
  const todayDate = options?.todayDate ?? targetDate;
  const weekStart = options?.weekStart ?? (targetDate ? getShanghaiWeekStartDate(targetDate) : todayDate);
  const activeDayKey =
    targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate)
      ? getShanghaiDayKey(`${targetDate}T00:00:00+08:00`)
      : primary
        ? getWeekdayKey(primary.weekday)
        : "tue";
  const editable = !targetDate || targetDate >= todayDate;
  const hasConfigurableCourse = Boolean(primary);
  const actualRange = primary
    ? formatClockRange(primary.actualStartTime, primary.actualEndTime)
    : "未排课";
  const rollCallRange = primary
    ? formatClockRange(primary.rollCallStartTime, primary.rollCallEndTime)
    : "未排课";

  return {
    title: "时间设置",
    targetDate,
    days: [
      { key: "mon", label: "周一" },
      { key: "tue", label: "周二" },
      { key: "wed", label: "周三" },
      { key: "thu", label: "周四" },
      { key: "fri", label: "周五" },
      { key: "sat", label: "周六" },
      { key: "sun", label: "周日" },
    ].map((day, index) => {
      const offset = day.key === "sun" ? 6 : index;
      const date = addShanghaiDays(weekStart, offset);
      const readonly = Boolean(todayDate) && date < todayDate;
      return {
        ...day,
        date,
        active: day.key === activeDayKey,
        readonly,
        href: buildAdminTimeSettingsHref(date),
      };
    }),
    defaultDayKey: activeDayKey,
    searchPlaceholder: "搜索时间规则 / 点名窗口",
    cards: [
      {
        id: "class-time",
        title: "设置实际上课时间",
        currentLabel: `当前：${actualRange}`,
        href: hasConfigurableCourse && editable
          ? buildAdminTimeSettingDetailHref("class-time", targetDate)
          : undefined,
      },
      {
        id: "attendance-window",
        title: "设置点名时间",
        currentLabel: `当前：${rollCallRange}`,
        href: hasConfigurableCourse && editable
          ? buildAdminTimeSettingDetailHref("attendance-window", targetDate)
          : undefined,
      },
    ],
  };
}

export function mapAdminTimeSettingDetail(
  settingKey: "class-time" | "attendance-window",
  setting: CourseSessionTimeSettingDto,
  options?: {
    targetDate?: string;
    todayDate?: string;
  },
): AdminTimeSettingDetailData {
  const courseSessionId = String(setting.courseSessionId);
  const campusId = String(setting.campusId);
  const targetDate = options?.targetDate ?? setting.sessionDate;
  const todayDate = options?.todayDate ?? targetDate;
  const editable = !targetDate || targetDate >= todayDate;
  const weekdayLabel = getWeekdayLabel(setting.weekday);
  const actualRange = formatClockRange(setting.actualStartTime, setting.actualEndTime);
  const rollCallRange = formatClockRange(setting.rollCallStartTime, setting.rollCallEndTime);
  const actualStartText = formatClockText(setting.actualStartTime);
  const actualEndText = formatClockText(setting.actualEndTime);
  const rollCallStartText = formatClockText(setting.rollCallStartTime);
  const rollCallEndText = formatClockText(setting.rollCallEndTime);
  const defaultRollCallRange = formatClockRange(
    setting.defaultRollCallStartTime,
    setting.defaultRollCallEndTime,
  );
  const beforeMinutes = Math.max(0, -(setting.defaultRollCallStartOffsetMinutes ?? 0));
  const afterMinutes = Math.max(0, setting.defaultRollCallEndOffsetMinutes ?? 0);

  if (settingKey === "class-time") {
    return {
      courseSessionId,
      settingKey,
      campusId,
      targetDate,
      kind: "actual",
      title: "设置实际上课时间",
      introTitle: "设置实际上课时间",
      introPrimaryText: `参考${weekdayLabel}默认规则，可按当天业务临时调整`,
      introSecondaryText: "实际开始或结束时间变更后，点名时间应同步联动调整。",
      sectionTitle: "实际上课时间范围",
      currentRange: actualRange,
      referenceStartTime: actualStartText,
      startTime: actualStartText,
      endTime: actualEndText,
      pickerHref: buildAdminTimeSettingPickerHref("class-time", targetDate),
      highlightText: `当前${weekdayLabel}默认带出：${actualRange}。`,
      resetLabel: "恢复默认上课时间",
      saveLabel: "保存并生效",
      editable,
    };
  }

  return {
    courseSessionId,
    settingKey,
    campusId,
    targetDate,
    kind: "roll-call",
    title: "设置点名时间",
    introTitle: "设置点名时间",
    introPrimaryText: `参考实际上课时间 ${actualRange}`,
    introSecondaryText: "老师仅可在该时间窗口内完成点名",
    sectionTitle: "点名时间范围",
    currentRange: rollCallRange,
    referenceStartTime: actualStartText,
    startTime: rollCallStartText,
    endTime: rollCallEndText,
    defaultBeforeStartMinutes: beforeMinutes,
    defaultAfterStartMinutes: afterMinutes,
    pickerHref: buildAdminTimeSettingPickerHref("attendance-window", targetDate),
    highlightText:
      beforeMinutes === afterMinutes
        ? `默认点名时间为上课前后 ${beforeMinutes} 分钟（${defaultRollCallRange || rollCallRange}）`
        : `默认点名时间为上课前 ${beforeMinutes} 分钟、上课后 ${afterMinutes} 分钟（${defaultRollCallRange || rollCallRange}）`,
    resetLabel: "恢复默认点名时间",
    saveLabel: "保存并生效",
    editable,
  };
}

export function mapAdminTimePicker(payload: {
  settingKey: "class-time" | "attendance-window";
  setting: CourseSessionTimeSettingDto;
  targetDate?: string;
  todayDate?: string;
}): AdminTimePickerData {
  const isActual = payload.settingKey === "class-time";
  const actualRange = formatClockRange(payload.setting.actualStartTime, payload.setting.actualEndTime);
  const rollCallRange = formatClockRange(
    payload.setting.rollCallStartTime,
    payload.setting.rollCallEndTime,
  );
  const targetDate = payload.targetDate ?? payload.setting.sessionDate;
  const todayDate = payload.todayDate ?? targetDate;
  const editable = !targetDate || targetDate >= todayDate;
  const weekdayLabel = getWeekdayLabel(payload.setting.weekday);

  return {
    settingKey: payload.settingKey,
    courseSessionId: String(payload.setting.courseSessionId),
    campusId: String(payload.setting.campusId),
    targetDate,
    kind: isActual ? "actual" : "roll-call",
    title: isActual ? "设置实际上课时间" : "设置点名时间",
    badge: "时间选择",
    backHref: buildAdminTimeSettingDetailHref(
      payload.settingKey,
      targetDate,
    ),
    introTitle: `${weekdayLabel}${isActual ? "实际上课时间设置" : "点名时间设置"}`,
    introSubtitle: isActual
      ? `当前上课时间 ${actualRange}`
      : `参考实际上课时间 ${actualRange}`,
    currentRange: isActual ? actualRange : rollCallRange,
    referenceStartTime: formatClockText(payload.setting.actualStartTime),
    startTime: isActual
      ? formatClockText(payload.setting.actualStartTime)
      : formatClockText(payload.setting.rollCallStartTime),
    endTime: isActual
      ? formatClockText(payload.setting.actualEndTime)
      : formatClockText(payload.setting.rollCallEndTime),
    cancelLabel: "取消",
    confirmLabel: "确认时间",
    editable,
  };
}

export function mapAdminControlData(payload: {
  me: MeDto;
  overview: RollCallOverviewRowDto[];
  courseDetailsById: Map<number, CourseDetailDto>;
  pollingEnabled?: boolean;
  teacherStatesBySessionKey?: Map<string, { label: string; temporary: boolean }>;
}): AdminControlData {
  const referenceSessionStartAt = payload.overview
    .map((item) => item.sessionStartAt)
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right))[0];
  const groupedOverview = new Map<string, RollCallOverviewRowDto[]>();
  for (const item of payload.overview) {
    const groupId =
      item.rollCallGroupId === null || typeof item.rollCallGroupId === "undefined"
        ? ""
        : String(item.rollCallGroupId).trim();
    const key = groupId ? `group:${groupId}` : `session:${item.courseId}:${item.sessionId ?? ""}`;
    groupedOverview.set(key, [...(groupedOverview.get(key) ?? []), item]);
  }
  const overviewGroups = Array.from(groupedOverview.entries()).map(([key, rows]) => ({
    key,
    rows,
    isGroup: key.startsWith("group:"),
  }));
  const finishedCount = overviewGroups.filter((item) =>
    item.rows.every((row) => row.rollCallCompleted),
  ).length;
  const totals = payload.overview.reduce(
    (summary, item) => {
      summary.shouldAttend += item.shouldAttendCount;
      summary.present += item.presentCount;
      summary.leave += item.leaveCount;
      summary.absent += item.absentCount;
      return summary;
    },
    {
      shouldAttend: 0,
      present: 0,
      leave: 0,
      absent: 0,
    },
  );

  return {
    campusLabel: payload.me.campusName ?? "当前校区",
    dateLabel: formatAdminAttendanceDateLabel(
      referenceSessionStartAt ? new Date(referenceSessionStartAt) : new Date(),
    ),
    referenceSessionStartAt,
    pollingEnabled: Boolean(payload.pollingEnabled),
    finishedCount,
    unfinishedCount: overviewGroups.length - finishedCount,
    totals,
    classes: overviewGroups.map(({ key, rows, isGroup }) => {
      const item = rows[0]!;
      const groupId = key.replace(/^group:/, "");
      const detail = payload.courseDetailsById.get(item.courseId);
      const shouldAttendCount = rows.reduce((sum, row) => sum + row.shouldAttendCount, 0);
      const presentCount = rows.reduce((sum, row) => sum + row.presentCount, 0);
      const leaveCount = rows.reduce((sum, row) => sum + row.leaveCount, 0);
      const absentCount = rows.reduce((sum, row) => sum + row.absentCount, 0);
      const weightedProgress = shouldAttendCount
        ? Math.round(
            rows.reduce(
              (sum, row) => sum + row.progressPercent * row.shouldAttendCount,
              0,
            ) / shouldAttendCount,
          )
        : 0;
      const progressLabel = `${presentCount}/${shouldAttendCount} 已到`;
      const state =
        rows.every((row) => row.rollCallCompleted)
          ? ("done" as const)
          : weightedProgress > 0
            ? ("partial" as const)
            : ("pending" as const);
      const groupCourseNames = rows.map((row) => row.courseName);
      const groupSize = isGroup
        ? Math.max(
            rows.length,
            rows
              .map((row) => row.rollCallGroupSize ?? 0)
              .sort((left, right) => right - left)[0] ?? 0,
          )
        : undefined;
      const teacherFromRow =
        item?.rollCallTeacherName || item?.rollCallTeacherPhone
          ? [
              item.rollCallTeacherName,
              normalizePhoneForDisplay(item.rollCallTeacherPhone),
            ]
              .filter(Boolean)
              .join(" · ")
          : "";
      const teacher =
        teacherFromRow ||
        payload.teacherStatesBySessionKey?.get(`${item.courseId}:${item.sessionId ?? ""}`)
          ?.label ||
        (detail ? getTeacherName(detail) : "待分配老师");

      return {
        id: isGroup ? `group:${groupId}` : String(item.courseId),
        name: isGroup
          ? item?.rollCallGroupName?.trim() || `合班点名 · ${groupCourseNames.join("、")}`
          : item.courseName,
        teacher,
        kind: isGroup ? ("merge" as const) : ("course" as const),
        badge: isGroup ? "合班" : undefined,
        description: isGroup
          ? `${groupSize ?? rows.length} 个班级 · ${groupCourseNames.join("、")}`
          : undefined,
        groupSize,
        progressLabel,
        completion: weightedProgress,
        state,
        shouldAttendCount,
        presentCount,
        leaveCount,
        absentCount,
        href: buildAdminControlClassHref(item.courseId, {
          courseSessionId: item.sessionId,
        }),
      };
    }),
  };
}

export function mapAdminClassAttendanceData(payload: {
  courseId: number;
  courseSessionId?: number;
  course: CourseDetailDto;
  students: CourseStudentRowDto[];
  latest?: AttendanceLatestDto | null;
}): AdminClassAttendanceData {
  return {
    classId: String(payload.courseId),
    courseId: String(payload.courseId),
    courseSessionId: payload.courseSessionId ? String(payload.courseSessionId) : undefined,
    title: payload.course.name,
    students: mapAdminAttendanceRoster(payload.students, payload.latest),
  };
}

export function mapAdminUnarrivedData(payload: {
  me: MeDto;
  rows: AbsentStudentRowDto[];
  courseContexts: Map<
    string,
    {
      latest?: AttendanceLatestDto | null;
      roster: AdminClassAttendanceStudent[];
    }
  >;
  teacherStatesBySessionKey?: Map<string, { label: string; temporary: boolean }>;
}): AdminUnarrivedData {
  const grouped = new Map<string, AdminUnarrivedData["groups"][number]>();
  const referenceSessionStartAt = payload.rows
    .map((row) => row.sessionStartAt)
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right))[0];

  for (const row of payload.rows) {
    const sessionKey = `${row.courseId}:${row.courseSessionId}`;
    const rosterStudentId = String(row.studentId);
    const itemId = `${row.studentId}:${row.courseId}:${row.courseSessionId}`;
    const groupLabel = row.homeroomClassName ?? "未分班";
    const groupKey = row.homeroomClassId ? `class:${row.homeroomClassId}` : `class:${groupLabel}`;
    const context = payload.courseContexts.get(sessionKey);
    const group =
      grouped.get(groupKey) ??
      {
        id: groupKey,
        label: groupLabel,
        meta: "",
        students: [],
      };

    const sourceStudent = context?.roster.find((student) => student.id === rosterStudentId) ?? null;

    group.students.push({
      id: itemId,
      studentId: rosterStudentId,
      name: row.studentName,
      courseId: String(row.courseId),
      courseSessionId: String(row.courseSessionId),
      courseName: row.courseName,
      homeroomClassId: row.homeroomClassId ?? sourceStudent?.homeroomClassId,
      homeroomClass: groupLabel,
      note: row.courseName,
      status: sourceStudent?.status ?? toAttendanceStatus(row.status),
      managerUpdated: row.managerUpdated ?? sourceStudent?.managerUpdated,
      overrideLabel: sourceStudent?.overrideLabel,
    });

    grouped.set(groupKey, group);
  }

  const totals = payload.rows.reduce(
    (summary, row) => {
      if (row.status === null || typeof row.status === "undefined") {
        summary.unmarked += 1;
      } else if (row.status === 1) {
        summary.leave += 1;
      } else if (row.status === 2) {
        summary.present += 1;
      } else {
        summary.absent += 1;
      }
      return summary;
    },
    {
      expected: payload.rows.length,
      present: 0,
      unmarked: 0,
      leave: 0,
      absent: 0,
    },
  );
  totals.expected = payload.rows.length;

  return {
    campusLabel: payload.me.campusName ?? "当前校区",
    dateLabel: formatAdminAttendanceDateLabel(
      referenceSessionStartAt ? new Date(referenceSessionStartAt) : new Date(),
    ),
    referenceSessionStartAt,
    totals,
    groups: Array.from(grouped.values())
      .map((group) => ({
        ...group,
        students: group.students.sort((left, right) => left.name.localeCompare(right.name, "zh-CN")),
      }))
      .sort((left, right) => left.label.localeCompare(right.label, "zh-CN")),
  };
}

export function mapAdminCourseTeachersData(teachers: TeacherEntityDto[]): AdminCourseTeachersData {
  return {
    title: "课程老师",
    searchPlaceholder: "搜索老师姓名或手机号",
    days: [{ key: "all", label: "全部" }],
    defaultDayKey: "all",
    teachers: teachers.map((teacher) => {
      const teacherPhone = normalizePhoneForDisplay(teacher.phone);

      return {
        id: String(teacher.id),
        dayKey: "all",
        label: teacher.name,
        note: teacherPhone ? `手机号 ${teacherPhone}` : "后端未返回手机号",
        teacherName: teacher.name,
        teacherPhone,
      };
    }),
  };
}

export function mapAdminCourseTeachersRelationData(payload: {
  overview: TeacherSettingOverviewRowDto[];
  courseDetailsById: Map<number, CourseDetailDto>;
}): AdminCourseTeachersData {
  const dayOrder = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const dayLabelMap = new Map([
    ["mon", "周一"],
    ["tue", "周二"],
    ["wed", "周三"],
    ["thu", "周四"],
    ["fri", "周五"],
    ["sat", "周六"],
    ["sun", "周日"],
  ]);
  const toDayKey = (value: string) => {
    const weekday = toShanghaiDate(value).getDay();
    return DAY_KEYS[weekday] ?? "mon";
  };
  const rows = [...payload.overview].sort((left, right) =>
    left.sessionStartAt.localeCompare(right.sessionStartAt),
  );
  const dayKeys = Array.from(new Set(rows.map((item) => toDayKey(item.sessionStartAt))));
  const todayDayKey = DAY_KEYS[toShanghaiDate(new Date()).getDay()] ?? "mon";
  const defaultDayKey = dayKeys.includes(todayDayKey) ? todayDayKey : (dayKeys[0] ?? "mon");

  return {
    title: "查看课程老师",
    searchPlaceholder: "搜索老师姓名 / 手机号",
    days: dayKeys.map((key) => ({
      key,
      label: dayLabelMap.get(key) ?? key,
    })),
    defaultDayKey,
    teachers: rows.map((item) => {
      const detail = payload.courseDetailsById.get(item.courseId);
      const locationLabel = detail?.location ?? "地点待定";
      const teacherLabel = item.rollCallTeacherName ?? item.defaultTeacherName ?? "待分配老师";
      const statusLabel = item.temporaryTeacherAssigned ? "代课老师" : "默认负责";

      return {
        id: `${item.courseId}:${item.sessionId}`,
        dayKey: toDayKey(item.sessionStartAt),
        label: teacherLabel,
        note: `${item.courseName} · ${locationLabel} · ${statusLabel}`,
        teacherName: teacherLabel,
        courseLabel: item.courseName,
        locationLabel,
        statusLabel,
        tone: item.temporaryTeacherAssigned ? ("substitute" as const) : ("default" as const),
      };
    }),
  };
}

export function mapAdminCourseSettingsData(payload: {
  overview: AdminCourseSettingsOverviewDto;
}): AdminCourseSettingsData {
  const courses = [...payload.overview.courses]
    .sort((left, right) => left.sessionStartAt.localeCompare(right.sessionStartAt))
    .map((item) => {
      const locationLabel = item.location?.trim() || "地点待定";
      const teacherLabel = item.effectiveTeacherName?.trim() || "待分配老师";
      const badgeTone =
        item.courseStatus === "TEMPORARY_ADDED" ? ("temporary" as const) : ("today" as const);
      const badgeLabel = item.courseStatus === "TEMPORARY_ADDED" ? "临时新增" : "今日行课";
      const timeLabel = formatClockRange(item.sessionStartAt, item.sessionEndAt);
      const editHref = buildAdminCourseSettingsEditHref(item.courseId, {
        courseSessionId: item.sessionId ?? undefined,
      });

      return {
        id: `${item.courseId}:${item.sessionId ?? item.courseId}`,
        courseId: String(item.courseId),
        sessionId: String(item.sessionId ?? item.courseId),
        title: item.courseName,
        meta: `${timeLabel} · ${locationLabel} · ${teacherLabel} · ${item.studentCount} 人`,
        badgeTone,
        badgeLabel,
        editHref,
        timeLabel,
        locationLabel,
        teacherLabel,
        studentCount: item.studentCount,
        sourceType: "live" as const,
        canRemoveFromToday: item.actionEnabled,
        rosterHref: buildAdminCourseRosterHref(item.courseId, {
          courseSessionId: item.sessionId ?? undefined,
        }),
        secondaryActionTone: "outline" as const,
        secondaryActionLabel: "编辑课程信息",
        secondaryActionHref: editHref,
        secondaryActionDisabled: false,
        secondaryActionKind: "edit" as const,
      };
    });
  const effectiveCourseCount =
    typeof payload.overview.effectiveCourseCount === "number"
      ? payload.overview.effectiveCourseCount
      : courses.length;
  const effectiveCourseCountLabel =
    effectiveCourseCount > 0 ? `共 ${effectiveCourseCount} 节` : "暂无生效课程";

  const alternateWeekday = payload.overview.alternateWeekday;

  return {
    title: "课程设置",
    effectiveCourseCount,
    effectiveCourseCountLabel,
    ruleTitle: "当天规则",
    modes: [
      {
        id: "default",
        label: buildDefaultDayRuleLabel(payload.overview.date),
        active: payload.overview.currentRuleMode === "DEFAULT_DAY",
      },
      {
        id: "alternate",
        label:
          alternateWeekday && payload.overview.currentRuleMode === "ALTERNATE_DAY"
            ? `按照${getWeekdayLabel(alternateWeekday)}行课`
            : "按照其他行课日行课",
        active: payload.overview.currentRuleMode === "ALTERNATE_DAY",
        disabled: !payload.overview.alternateRuleEnabled,
        href: "/admin/course-settings/alternate-day",
      },
    ],
    searchPlaceholder: "搜索课程名 / 上课地点",
    sectionTitle:
      effectiveCourseCount > 0 ? `今日生效课程（${effectiveCourseCount} 节）` : "今日生效课程",
    temporaryActionLabel: "临时新增课程",
    temporaryActionHref: "/admin/course-settings/new-course",
    temporaryActionDisabled: !payload.overview.temporaryCourseActionEnabled,
    saveLabel: "同步最新课程设置",
    saveDisabled: !payload.overview.saveEnabled,
    saveDescription: `当前共 ${effectiveCourseCount} 节生效课程，规则切换、临时新增和移出操作会实时同步到接口。`,
    courses,
  };
}

export function mapAdminCourseRosterData(payload: {
  courseId: number;
  courseSessionId?: number;
  course: CourseDetailDto;
  students: CourseStudentRowDto[];
  effectiveCourseContext?: AdminCourseSettingsCourseDto | null;
}): AdminCourseRosterData {
  const selectedSession =
    payload.effectiveCourseContext ??
    payload.course.sessions.find((session) => session.id === payload.courseSessionId) ??
    payload.course.sessions[0] ??
    null;
  const courseTimeRange = selectedSession
    ? formatClockRange(
        "sessionStartAt" in selectedSession ? selectedSession.sessionStartAt : selectedSession.startAt,
        "sessionEndAt" in selectedSession ? selectedSession.sessionEndAt : selectedSession.endAt,
      )
    : "时间待确认";
  const teacherLabel =
    payload.effectiveCourseContext?.effectiveTeacherName?.trim() ||
    getTeacherName(payload.course);
  const studentCount = payload.effectiveCourseContext?.studentCount ?? payload.students.length;
  const locationLabel =
    payload.effectiveCourseContext?.location?.trim() ||
    payload.course.location ||
    "地点待定";

  return {
    courseId: String(payload.courseId),
    title: "学生名单",
    badge: "名单页",
    courseTitle: payload.course.name,
    courseMeta: `${courseTimeRange} · ${locationLabel} · ${teacherLabel} · ${studentCount} 人`,
    searchPlaceholder: "搜索学生姓名 / 学生ID / 行政班",
    addHref: buildAdminCourseStudentNewHref(payload.courseId, {
      courseSessionId: payload.courseSessionId,
    }),
    importHref: buildAdminCourseStudentImportHref(payload.courseId, {
      courseSessionId: payload.courseSessionId,
    }),
    students: payload.students.map((student) => ({
      id: String(student.studentId),
      name: student.studentName,
      studentCode: String(student.studentId),
      homeroomClass: student.homeroomClassName,
      editHref: buildAdminCourseStudentEditHref(payload.courseId, student.studentId, {
        courseSessionId: payload.courseSessionId,
      }),
    })),
  };
}
