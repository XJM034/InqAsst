const SHANGHAI_TZ = "Asia/Shanghai";
const WEEKDAY_LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

type AttendanceHeaderData = {
  campusLabel: string;
  dateLabel: string;
  referenceSessionStartAt?: string;
};

type TeacherAttendanceHeaderData = {
  campusLabel?: string;
  courseTitle?: string;
  dateLabel?: string;
  referenceSessionStartAt?: string;
  sessionTimeLabel?: string;
  rollCallDeadlineAt?: string;
};

function toShanghaiDate(value: string | Date) {
  return new Date(
    new Date(value).toLocaleString("en-US", {
      timeZone: SHANGHAI_TZ,
    }),
  );
}

function trimToMinute(date: Date) {
  const next = new Date(date);
  next.setSeconds(0, 0);
  return next;
}

function formatRelativeMinutesLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}

function getSessionDiffMinutes(referenceSessionStartAt?: string, now = new Date()) {
  if (!referenceSessionStartAt) {
    return null;
  }

  const sessionStartAt = trimToMinute(toShanghaiDate(referenceSessionStartAt));
  if (Number.isNaN(sessionStartAt.getTime())) {
    return null;
  }

  const currentTime = trimToMinute(toShanghaiDate(now));
  return Math.round((sessionStartAt.getTime() - currentTime.getTime()) / 60000);
}

export function formatAttendanceClockLabel(value?: string) {
  if (!value) {
    return "";
  }

  return toShanghaiDate(value).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: SHANGHAI_TZ,
  });
}

export function buildAttendanceStartedWarning(referenceSessionStartAt?: string, now = new Date()) {
  const elapsedLabel = buildElapsedSinceSessionStartLabel(referenceSessionStartAt, now);

  if (!elapsedLabel) {
    return "";
  }

  return `${elapsedLabel}，请及时确认学生点名情况`;
}

export function buildElapsedSinceSessionStartLabel(
  referenceSessionStartAt?: string,
  now = new Date(),
) {
  const diffMinutes = getSessionDiffMinutes(referenceSessionStartAt, now);

  if (diffMinutes === null || diffMinutes > 0) {
    return "";
  }

  return `已上课 ${Math.abs(diffMinutes)} min`;
}

export function formatAdminAttendanceDateLabel(value: string | Date) {
  const date = toShanghaiDate(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}（${
    WEEKDAY_LABELS[date.getDay()] ?? ""
  }）`;
}

export function buildAdminAttendanceSessionTimingLabel(
  referenceSessionStartAt?: string,
  now = new Date(),
) {
  const diffMinutes = getSessionDiffMinutes(referenceSessionStartAt, now);

  if (diffMinutes === null) {
    return "";
  }

  if (diffMinutes > 0) {
    return `${formatRelativeMinutesLabel(diffMinutes)}后行课`;
  }

  return buildAttendanceStartedWarning(referenceSessionStartAt, now);
}

export function buildAdminAttendanceSubtitle(data: AttendanceHeaderData, now = new Date()) {
  const timingLabel = buildAdminAttendanceSessionTimingLabel(data.referenceSessionStartAt, now);

  return [data.campusLabel, data.dateLabel, timingLabel].filter(Boolean).join(" · ");
}

export function buildTeacherAttendanceSubtitle(
  data: TeacherAttendanceHeaderData,
  now = new Date(),
) {
  const resolvedDateLabel =
    data.referenceSessionStartAt && formatAdminAttendanceDateLabel(data.referenceSessionStartAt)
      ? formatAdminAttendanceDateLabel(data.referenceSessionStartAt)
      : (data.dateLabel ?? "");
  const startedWarning = buildAttendanceStartedWarning(data.referenceSessionStartAt, now);
  const deadlineLabel = data.rollCallDeadlineAt
    ? `请于 ${formatAttendanceClockLabel(data.rollCallDeadlineAt)} 前完成点名`
    : "";

  return [
    resolvedDateLabel,
    data.campusLabel,
    data.courseTitle,
    data.sessionTimeLabel,
    startedWarning,
    deadlineLabel,
  ]
    .filter(Boolean)
    .join(" · ");
}
