import {
  buildTeacherAttendanceEntryPrompt,
  buildTeacherRosterHref,
  resolveTeacherAttendanceEntryState,
  resolveTeacherAttendanceTabDecision,
} from "@/lib/teacher-attendance-entry";

describe("teacher attendance entry prompts", () => {
  it("builds the homepage prompt before the roll-call window starts", () => {
    expect(
      buildTeacherAttendanceEntryPrompt(
        {
          source: "home",
          attendanceWindowActive: false,
          actionHref: "/teacher/attendance/session?courseId=101&courseSessionId=1001",
          rosterHref: "/teacher/home/roster?courseId=101&courseSessionId=1001",
          rollCallStartAt: "2026-04-22T15:35:00+08:00",
          referenceSessionStartAt: "2026-04-22T15:40:00+08:00",
          referenceSessionEndAt: "2026-04-22T16:40:00+08:00",
        },
        new Date("2026-04-22T15:20:00+08:00"),
      ),
    ).toEqual({
      title: "点名未开始",
      description: "15:35 开始点名，是否查看学生名单？",
      confirmHref: "/teacher/home/roster?courseId=101&courseSessionId=1001",
      confirmLabel: "查看学生名单",
    });
  });

  it("builds the attendance-page prompt before the roll-call window starts", () => {
    expect(
      buildTeacherAttendanceEntryPrompt(
        {
          source: "attendance",
          attendanceWindowActive: false,
          actionHref: "/teacher/attendance/session?courseId=101&courseSessionId=1001",
          rosterHref: "/teacher/home/roster?courseId=101&courseSessionId=1001",
          rollCallStartAt: "2026-04-22T15:35:00+08:00",
          referenceSessionStartAt: "2026-04-22T15:40:00+08:00",
          referenceSessionEndAt: "2026-04-22T16:40:00+08:00",
        },
        new Date("2026-04-22T15:20:00+08:00"),
      ),
    ).toEqual({
      title: "尚未开始点名",
      description: "15:35 开始点名，是否查看学生名单？",
      confirmHref: "/teacher/home/roster?courseId=101&courseSessionId=1001",
      confirmLabel: "查看学生名单",
    });
  });

  it("builds the started prompt once attendance is active", () => {
    expect(
      buildTeacherAttendanceEntryPrompt(
        {
          source: "home",
          attendanceWindowActive: true,
          actionHref: "/teacher/attendance/session?courseId=101&courseSessionId=1001",
          rosterHref: "/teacher/home/roster?courseId=101&courseSessionId=1001",
          rollCallStartAt: "2026-04-22T15:35:00+08:00",
          referenceSessionStartAt: "2026-04-22T15:40:00+08:00",
          referenceSessionEndAt: "2026-04-22T16:40:00+08:00",
        },
        new Date("2026-04-22T15:46:00+08:00"),
      ),
    ).toEqual({
      title: "当前已开始点名",
      description: "已上课 6 min，是否进入点名页？",
      confirmHref: "/teacher/attendance/session?courseId=101&courseSessionId=1001",
      confirmLabel: "进入点名页",
    });
  });

  it("keeps attendance accessible during class after the roll-call window ends", () => {
    expect(
      buildTeacherAttendanceEntryPrompt(
        {
          source: "home",
          attendanceWindowActive: false,
          actionHref: "/teacher/attendance/session?courseId=101&courseSessionId=1001",
          rosterHref: "/teacher/home/roster?courseId=101&courseSessionId=1001",
          rollCallStartAt: "2026-04-22T15:35:00+08:00",
          referenceSessionStartAt: "2026-04-22T15:40:00+08:00",
          referenceSessionEndAt: "2026-04-22T16:40:00+08:00",
        },
        new Date("2026-04-22T16:20:00+08:00"),
      ),
    ).toEqual({
      title: "当前已开始上课",
      description: "已上课 40 min，是否进入点名页查看点名情况？",
      confirmHref: "/teacher/attendance/session?courseId=101&courseSessionId=1001",
      confirmLabel: "进入点名页",
    });
  });

  it("falls back to a closed-window prompt after class ends", () => {
    expect(
      buildTeacherAttendanceEntryPrompt(
        {
          source: "attendance",
          attendanceWindowActive: false,
          actionHref: "/teacher/attendance/session?courseId=101&courseSessionId=1001",
          rosterHref: "/teacher/home/roster?courseId=101&courseSessionId=1001",
          rollCallStartAt: "2026-04-22T15:35:00+08:00",
          referenceSessionStartAt: "2026-04-22T15:40:00+08:00",
          referenceSessionEndAt: "2026-04-22T16:40:00+08:00",
        },
        new Date("2026-04-22T16:50:00+08:00"),
      ),
    ).toEqual({
      title: "当前不在点名时间",
      description: "本节课点名时间已结束，是否查看学生名单？",
      confirmHref: "/teacher/home/roster?courseId=101&courseSessionId=1001",
      confirmLabel: "查看学生名单",
    });
  });

  it("builds roster hrefs with course session context", () => {
    expect(buildTeacherRosterHref("101", "1001")).toBe(
      "/teacher/home/roster?courseId=101&courseSessionId=1001",
    );
  });

  it("routes the attendance tab straight to a prompt instead of the session page before roll call", () => {
    expect(
      resolveTeacherAttendanceTabDecision(
        {
          title: "数学",
          actionHref: "/teacher/attendance/session?courseId=101&courseSessionId=1001",
          rosterHref: "/teacher/home/roster?courseId=101&courseSessionId=1001",
          actionLabel: "查看学生名单",
          attendanceWindowState: "inactive",
          rollCallStartAt: "2026-04-22T15:35:00+08:00",
          referenceSessionStartAt: "2026-04-22T15:40:00+08:00",
          referenceSessionEndAt: "2026-04-22T16:40:00+08:00",
        },
        new Date("2026-04-22T15:20:00+08:00"),
      ),
    ).toEqual({
      kind: "prompt",
      prompt: {
        title: "尚未开始点名",
        description: "15:35 开始点名，是否查看学生名单？",
        confirmHref: "/teacher/home/roster?courseId=101&courseSessionId=1001",
        confirmLabel: "查看学生名单",
      },
    });
  });

  it("routes the attendance tab straight into the session page while class is still in progress", () => {
    expect(
      resolveTeacherAttendanceTabDecision(
        {
          title: "数学",
          actionHref: "/teacher/attendance/session?courseId=101&courseSessionId=1001",
          rosterHref: "/teacher/home/roster?courseId=101&courseSessionId=1001",
          actionLabel: "查看点名情况",
          attendanceWindowState: "inactive",
          rollCallStartAt: "2026-04-22T15:35:00+08:00",
          referenceSessionStartAt: "2026-04-22T15:40:00+08:00",
          referenceSessionEndAt: "2026-04-22T16:40:00+08:00",
        },
        new Date("2026-04-22T16:20:00+08:00"),
      ),
    ).toEqual({
      kind: "redirect",
      href: "/teacher/attendance/session?courseId=101&courseSessionId=1001",
    });
  });

  it("routes the attendance tab straight into the session page during the roll-call window", () => {
    expect(
      resolveTeacherAttendanceTabDecision({
        title: "数学",
        actionHref: "/teacher/attendance/session?courseId=101&courseSessionId=1001",
        rosterHref: "/teacher/home/roster?courseId=101&courseSessionId=1001",
        actionLabel: "开始点名",
        attendanceWindowState: "active",
        referenceSessionStartAt: "2026-04-22T15:40:00+08:00",
        referenceSessionEndAt: "2026-04-22T16:40:00+08:00",
      }),
    ).toEqual({
      kind: "redirect",
      href: "/teacher/attendance/session?courseId=101&courseSessionId=1001",
    });
  });

  it("treats a started-but-not-finished class as attendance-accessible even after submission", () => {
    expect(
      resolveTeacherAttendanceEntryState(
        {
          attendanceWindowActive: false,
          rollCallStartAt: "2026-04-22T15:35:00+08:00",
          referenceSessionStartAt: "2026-04-22T15:40:00+08:00",
          referenceSessionEndAt: "2026-04-22T16:40:00+08:00",
        },
        new Date("2026-04-22T16:10:00+08:00"),
      ),
    ).toBe("attendance");
  });
});
