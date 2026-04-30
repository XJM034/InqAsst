import {
  buildElapsedSinceSessionStartLabel,
  formatAttendanceClockLabel,
} from "@/lib/admin-attendance-header";
import type { TeacherHomeCourseCard } from "@/lib/domain/types";

type TeacherAttendanceEntryPromptSource = "home" | "attendance";

type TeacherAttendanceTimingContext = {
  attendanceWindowActive?: boolean;
  rollCallStartAt?: string;
  referenceSessionStartAt?: string;
  referenceSessionEndAt?: string;
};

type TeacherAttendanceEntryPromptInput = TeacherAttendanceTimingContext & {
  source: TeacherAttendanceEntryPromptSource;
  actionHref: string;
  rosterHref: string;
};

export type TeacherAttendanceEntryPrompt = {
  title: string;
  description: string;
  confirmHref: string;
  confirmLabel: string;
};

export type TeacherAttendanceTabDecision =
  | {
      kind: "no-class";
      href: "/teacher/attendance/no-class";
    }
  | {
      kind: "redirect";
      href: string;
    }
  | {
      kind: "prompt";
      prompt: TeacherAttendanceEntryPrompt;
    };

export type TeacherAttendanceEntryState = "attendance" | "before-roll-call" | "after-class";

function parseDate(value?: string) {
  if (!value) {
    return null;
  }

  const next = new Date(value);
  if (Number.isNaN(next.getTime())) {
    return null;
  }

  return next;
}

function hasRollCallStarted(rollCallStartAt?: string, now = new Date()) {
  const startAt = parseDate(rollCallStartAt);
  if (!startAt) {
    return false;
  }

  return startAt.getTime() <= now.getTime();
}

function hasSessionStarted(referenceSessionStartAt?: string, now = new Date()) {
  const sessionStartAt = parseDate(referenceSessionStartAt);
  if (!sessionStartAt) {
    return false;
  }

  return sessionStartAt.getTime() <= now.getTime();
}

function hasSessionEnded(referenceSessionEndAt?: string, now = new Date()) {
  const sessionEndAt = parseDate(referenceSessionEndAt);
  if (!sessionEndAt) {
    return false;
  }

  return sessionEndAt.getTime() < now.getTime();
}

export function resolveTeacherAttendanceEntryState(
  input: TeacherAttendanceTimingContext,
  now = new Date(),
): TeacherAttendanceEntryState {
  const sessionStarted = hasSessionStarted(input.referenceSessionStartAt, now);
  const sessionEnded = hasSessionEnded(input.referenceSessionEndAt, now);

  if (input.attendanceWindowActive || (sessionStarted && !sessionEnded)) {
    return "attendance";
  }

  if (!hasRollCallStarted(input.rollCallStartAt, now)) {
    return "before-roll-call";
  }

  return "after-class";
}

export function buildTeacherCourseHref(
  basePath: string,
  courseId?: string,
  courseSessionId?: string,
) {
  if (!courseId) {
    return basePath;
  }

  const searchParams = new URLSearchParams({ courseId });
  if (courseSessionId) {
    searchParams.set("courseSessionId", courseSessionId);
  }

  return `${basePath}?${searchParams.toString()}`;
}

export function buildTeacherRosterHref(courseId?: string, courseSessionId?: string) {
  return buildTeacherCourseHref("/teacher/home/roster", courseId, courseSessionId);
}

export function buildTeacherAttendanceSessionHref(courseId?: string, courseSessionId?: string) {
  return buildTeacherCourseHref("/teacher/attendance/session", courseId, courseSessionId);
}

export function buildTeacherAttendanceEntryPrompt(
  input: TeacherAttendanceEntryPromptInput,
  now = new Date(),
): TeacherAttendanceEntryPrompt {
  const state = resolveTeacherAttendanceEntryState(input, now);

  if (state === "attendance") {
    const elapsedLabel = buildElapsedSinceSessionStartLabel(input.referenceSessionStartAt, now);

    return {
      title: input.attendanceWindowActive ? "当前已开始点名" : "当前已开始上课",
      description: input.attendanceWindowActive
        ? elapsedLabel
          ? `${elapsedLabel}，是否进入点名页？`
          : "是否进入点名页？"
        : elapsedLabel
          ? `${elapsedLabel}，是否进入点名页查看点名情况？`
          : "是否进入点名页查看点名情况？",
      confirmHref: input.actionHref,
      confirmLabel: "进入点名页",
    };
  }

  if (state === "before-roll-call") {
    const startLabel = formatAttendanceClockLabel(input.rollCallStartAt);

    return {
      title: input.source === "attendance" ? "尚未开始点名" : "点名未开始",
      description: startLabel
        ? `${startLabel} 开始点名，是否查看学生名单？`
        : "是否查看学生名单？",
      confirmHref: input.rosterHref,
      confirmLabel: "查看学生名单",
    };
  }

  return {
    title: "当前不在点名时间",
    description: "本节课点名时间已结束，是否查看学生名单？",
    confirmHref: input.rosterHref,
    confirmLabel: "查看学生名单",
  };
}

export function resolveTeacherAttendanceTabDecision(
  course: TeacherHomeCourseCard | null,
  now = new Date(),
): TeacherAttendanceTabDecision {
  if (!course) {
    return {
      kind: "no-class",
      href: "/teacher/attendance/no-class",
    };
  }

  if (
    resolveTeacherAttendanceEntryState(
      {
        attendanceWindowActive: course.attendanceWindowState === "active",
        rollCallStartAt: course.rollCallStartAt,
        referenceSessionStartAt: course.referenceSessionStartAt,
        referenceSessionEndAt: course.referenceSessionEndAt,
      },
      now,
    ) === "attendance"
  ) {
    return {
      kind: "redirect",
      href: course.actionHref,
    };
  }

  return {
    kind: "prompt",
    prompt: buildTeacherAttendanceEntryPrompt(
      {
        source: "attendance",
        attendanceWindowActive: false,
        actionHref: course.actionHref,
        rosterHref: course.rosterHref,
        rollCallStartAt: course.rollCallStartAt,
        referenceSessionStartAt: course.referenceSessionStartAt,
        referenceSessionEndAt: course.referenceSessionEndAt,
      },
      now,
    ),
  };
}
