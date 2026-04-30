import type {
  AbsentStudentRowDto,
  AdminCourseSettingsOverviewDto,
  AdminHomeSummaryDto,
  CourseDetailDto,
  CourseSessionTimeSettingDto,
  CourseStudentRowDto,
  MeDto,
  TeacherAttendanceGroupDto,
  TeacherHomeDto,
  TeacherTodaySessionDto,
} from "@/lib/services/mobile-schema";
import {
  buildAttendanceGroupSubmitRequest,
  buildAttendanceSubmitRequest,
  mapAdminControlData,
  mapAdminCourseSettingsData,
  mapAdminHomeData,
  mapAdminClassAttendanceData,
  mapAdminCourseRosterData,
  mapAdminCourseTeachersRelationData,
  mapAdminTimeSettingDetail,
  mapAdminTimeSettingsData,
  mapAdminUnarrivedData,
  mapAttendanceGroup,
  mapAttendanceSession,
  mapTeacherHomeData,
  toApiAttendanceStatus,
} from "@/lib/services/mobile-adapters";

describe("mobile-adapters service mappers", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("maps UI attendance states back to API codes", () => {
    expect(toApiAttendanceStatus("absent")).toBe(0);
    expect(toApiAttendanceStatus("leave")).toBe(1);
    expect(toApiAttendanceStatus("present")).toBe(2);
    expect(toApiAttendanceStatus("unmarked")).toBe(2);
  });

  it("builds attendance submit payloads without coercing teacher draft state to absent", () => {
    expect(
      buildAttendanceSubmitRequest(
        [
          { id: "1", status: "unmarked" },
          { id: "2", status: "leave" },
        ],
        "3001",
      ),
    ).toEqual({
      courseSessionId: 3001,
      items: [
        { studentId: 1, status: 2 },
        { studentId: 2, status: 1 },
      ],
    });
  });

  it("builds grouped attendance submit payloads with course-session scope", () => {
    expect(
      buildAttendanceGroupSubmitRequest([
        {
          id: "1",
          courseSessionId: "3001",
          courseTitle: "机器人",
          name: "王一诺",
          homeroomClass: "五年级3班",
          status: "absent",
        },
        {
          id: "2",
          courseSessionId: "3002",
          courseTitle: "创意美术",
          name: "陈小北",
          homeroomClass: "五年级4班",
          status: "leave",
        },
      ]),
    ).toEqual({
      items: [
        { courseSessionId: 3001, studentId: 1, status: 0 },
        { courseSessionId: 3002, studentId: 2, status: 1 },
      ],
    });
  });

  it("defaults teacher attendance unmarked students to present in the view model", () => {
    const session = mapAttendanceSession({
      courseId: 101,
      courseSessionId: 3001,
      course: {
        id: 101,
        name: "数学",
        location: "A101",
        campusId: 22,
        sessions: [
          {
            id: 3001,
            startAt: "2026-04-14T09:00:00+08:00",
            endAt: "2026-04-14T10:00:00+08:00",
          },
        ],
        teachers: [],
      },
      campusName: "南山校区",
      students: [
        {
          studentId: 1,
          studentName: "王一诺",
          homeroomClassId: 10,
          homeroomClassName: "五年级3班",
          lastAttendanceStatus: null,
        },
      ],
      latest: {
        hasSubmittedToday: false,
        items: [],
      },
      homeroomClasses: [
        { id: 10, name: "五年级3班" },
        { id: 12, name: "五年级5班" },
      ],
    });

    expect(session.tapHint).toBe(
      "提交点名后管理员会同步学生请假或更改其他情况（标记为黄色学生卡片），请确认更改的学生信息是否符合实际出勤情况，若不符合请及时告知管理员！",
    );
    expect(session.draftNotice).toBe(
      "当前页面展示的是老师端草稿，确认提交后才会同步到管理端。",
    );
    expect(session.campusLabel).toBe("南山校区");
    expect(session.sessionTimeLabel).toBe("09:00-10:00");
    expect(session.referenceSessionStartAt).toBe("2026-04-14T09:00:00+08:00");
    expect(session.rollCallStartAt).toBeUndefined();
    expect(session.rollCallDeadlineAt).toBeUndefined();
    expect(session.temporaryStudent?.homeroomClasses).toEqual([
      { id: 10, name: "五年级3班" },
      { id: 12, name: "五年级5班" },
    ]);
    expect(session.students[0]?.status).toBe("present");
  });

  it("uses the course campus on teacher attendance instead of the teacher account campus", () => {
    const session = mapAttendanceSession({
      courseId: 101,
      courseSessionId: 3001,
      course: {
        id: 101,
        name: "Badminton",
        location: "Court",
        campusId: 144,
        campusName: "Course Campus",
        sessions: [
          {
            id: 3001,
            startAt: "2026-04-14T09:00:00+08:00",
            endAt: "2026-04-14T10:00:00+08:00",
          },
        ],
        teachers: [],
      },
      campusName: "Teacher Account Campus",
      students: [],
      latest: {
        hasSubmittedToday: false,
        items: [],
      },
    });

    expect(session.campusLabel).toBe("Course Campus");
    expect(session.courseInfo).toContain("Course Campus");
    expect(session.courseInfo).not.toContain("Teacher Account Campus");
  });

  it("falls back to roster homeroom classes when the teacher temporary-student class lookup is unavailable", () => {
    const session = mapAttendanceSession({
      courseId: 101,
      courseSessionId: 3001,
      course: {
        id: 101,
        name: "数学",
        location: "A101",
        campusId: 22,
        sessions: [
          {
            id: 3001,
            startAt: "2026-04-14T09:00:00+08:00",
            endAt: "2026-04-14T10:00:00+08:00",
          },
        ],
        teachers: [],
      },
      campusName: "南山校区",
      students: [
        {
          studentId: 1,
          studentName: "王一诺",
          homeroomClassId: 10,
          homeroomClassName: "五年级3班",
        },
      ],
      latest: {
        hasSubmittedToday: false,
        items: [],
      },
      homeroomClasses: null,
    });

    expect(session.temporaryStudent?.homeroomClasses).toEqual([
      { id: 10, name: "五年级3班" },
    ]);
    expect(session.temporaryStudent?.disabledReason).toBeUndefined();
  });

  it("maps grouped teacher attendance by course session and disables viewer-only submit", () => {
    const groupDto: TeacherAttendanceGroupDto = {
      groupId: "g-900",
      groupName: "周二科创合班",
      campusName: "南山校区",
      sessionDate: "2026-04-14",
      sessionStartAt: "2026-04-14T09:00:00+08:00",
      sessionEndAt: "2026-04-14T10:00:00+08:00",
      canSubmit: false,
      sessions: [
        {
          courseId: 101,
          courseName: "机器人",
          courseSessionId: 3001,
          location: "A101",
          sessionStartAt: "2026-04-14T09:00:00+08:00",
          sessionEndAt: "2026-04-14T10:00:00+08:00",
          students: [
            {
              studentId: 1,
              studentName: "王一诺",
              homeroomClassId: 10,
              homeroomClassName: "五年级3班",
            },
          ],
          latest: {
            hasSubmittedToday: false,
            items: [],
          },
        },
        {
          courseId: 102,
          courseName: "创意美术",
          courseSessionId: 3002,
          location: "A102",
          sessionStartAt: "2026-04-14T09:00:00+08:00",
          sessionEndAt: "2026-04-14T10:00:00+08:00",
          students: [
            {
              studentId: 2,
              studentName: "陈小北",
              homeroomClassId: 11,
              homeroomClassName: "五年级4班",
            },
          ],
          latest: {
            hasSubmittedToday: true,
            items: [{ studentId: 2, status: 0 }],
          },
        },
      ],
    };

    const group = mapAttendanceGroup(groupDto);

    expect(group).toMatchObject({
      id: "g-900",
      pageTitle: "合班点名",
      title: "周二科创合班",
      info: "南山校区 | 09:00-10:00 | 2 个班级",
      submitDisabled: true,
      submitDisabledReason: "当前老师只能查看该合班点名情况，不能提交点名。",
    });
    expect(group.classes).toHaveLength(2);
    expect(
      group.classes.find((item) => item.title === "机器人")?.temporaryStudent?.homeroomClasses,
    ).toEqual([
      { id: 10, name: "五年级3班" },
    ]);
    expect(group.classes.flatMap((item) => item.students)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          courseSessionId: "3001",
          courseTitle: "机器人",
          status: "present",
        }),
        expect.objectContaining({
          courseSessionId: "3002",
          courseTitle: "创意美术",
          status: "absent",
        }),
      ]),
    );
  });

  it("uses today-session effective roll-call window on the teacher attendance page", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-14T07:38:00.000Z"));

    const session = mapAttendanceSession({
      courseId: 101,
      courseSessionId: 3001,
      course: {
        id: 101,
        name: "数学",
        location: "A101",
        campusId: 22,
        sessions: [
          {
            id: 3001,
            startAt: "2026-04-14T09:00:00+08:00",
            endAt: "2026-04-14T10:00:00+08:00",
          },
        ],
        teachers: [],
      },
      campusName: "南山校区",
      students: [
        {
          studentId: 1,
          studentName: "王一诺",
          homeroomClassId: 10,
          homeroomClassName: "五年级1班",
          lastAttendanceStatus: null,
        },
      ],
      latest: {
        hasSubmittedToday: false,
        items: [],
      },
      todaySession: {
        courseId: 101,
        courseName: "数学",
        location: "A101",
        sessionId: 3001,
        sessionStartAt: "2026-04-14T15:40:00+08:00",
        sessionEndAt: "2026-04-14T16:40:00+08:00",
        effectiveRollCallStartAt: "2026-04-14T15:35:00+08:00",
        effectiveRollCallEndAt: "2026-04-14T15:45:00+08:00",
        rollCallWindowSource: "DEFAULT_AROUND_ACTUAL_START",
        rollCallCompleted: false,
      },
    });

    expect(session.courseInfo).toContain("15:40-16:40");
    expect(session.attendanceWindowActive).toBe(true);
    expect(session.submitDisabled).toBe(false);
    expect(session.deadlineHint).toContain("15:35");
    expect(session.deadlineHint).toContain("15:45");
    expect(session.campusLabel).toBe("南山校区");
    expect(session.sessionTimeLabel).toBe("15:40-16:40");
    expect(session.referenceSessionStartAt).toBe("2026-04-14T15:40:00+08:00");
    expect(session.referenceSessionEndAt).toBe("2026-04-14T16:40:00+08:00");
    expect(session.rollCallStartAt).toBe("2026-04-14T15:35:00+08:00");
    expect(session.rollCallDeadlineAt).toBe("2026-04-14T15:45:00+08:00");
  });

  it("keeps untouched admin students unmarked when the latest same-day record is partial", () => {
    const data = mapAdminClassAttendanceData({
      courseId: 101,
      courseSessionId: 3001,
      course: {
        id: 101,
        name: "数学",
        location: "A101",
        campusId: 22,
        sessions: [
          {
            id: 3001,
            startAt: "2026-04-17T16:00:00+08:00",
            endAt: "2026-04-17T17:00:00+08:00",
          },
        ],
        teachers: [],
      },
      students: [
        {
          studentId: 1,
          studentName: "王一诺",
          homeroomClassId: 10,
          homeroomClassName: "五年级2班",
          lastAttendanceStatus: null,
        },
        {
          studentId: 2,
          studentName: "李思远",
          homeroomClassId: 10,
          homeroomClassName: "五年级2班",
          lastAttendanceStatus: 2,
        },
      ],
      latest: {
        attendanceRecordId: 9001,
        courseSessionId: 3001,
        submittedAt: "2026-04-17T16:05:00+08:00",
        hasSubmittedToday: true,
        items: [
          {
            studentId: 1,
            status: 1,
          },
        ],
      },
    });

    expect(data.students.map((student) => student.status)).toEqual(["leave", "unmarked"]);
  });

  it("maps teacher home data from live schedule payloads", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-14T01:05:00.000Z"));

    const me: MeDto = {
      id: 1,
      phone: "13800138000",
      name: "张老师",
      campusName: "南山校区",
    };
    const home: TeacherHomeDto = {
      weekStart: "2026-04-13",
      campusRollCallWindows: [
        {
          id: 1,
          weekday: 2,
          startOffsetMinutes: -15,
          endOffsetMinutes: 15,
        },
      ],
      weekCourses: [
        {
          id: 101,
          name: "数学",
          location: "A101",
          campusName: "温江校区",
          sessionsInWeek: [
            {
              id: 1001,
              startAt: "2026-04-14T09:00:00+08:00",
              endAt: "2026-04-14T10:00:00+08:00",
            },
            {
              id: 1002,
              startAt: "2026-04-15T09:00:00+08:00",
              endAt: "2026-04-15T10:00:00+08:00",
            },
          ],
        },
      ],
    };
    const todaySessions: TeacherTodaySessionDto[] = [
      {
        courseId: 101,
        courseName: "数学",
        location: "A101",
        campusName: "温江校区",
        sessionId: 1001,
        sessionStartAt: "2026-04-14T09:00:00+08:00",
        sessionEndAt: "2026-04-14T10:00:00+08:00",
        rollCallCompleted: false,
      },
    ];

    const data = mapTeacherHomeData({ me, home, todaySessions });

    expect(data.greeting).toBe("张老师早上好");
    expect(data.daySchedules[0]?.primaryCourse.campus).toBe("温江校区");
    expect(data.defaultDayKey).toBe("tue");
    expect(data.daySchedules[0]?.primaryCourse.actionLabel).toBe("开始点名");
    expect(data.daySchedules[0]?.primaryCourse.referenceSessionStartAt).toBe(
      "2026-04-14T09:00:00+08:00",
    );
    expect(data.daySchedules[0]?.primaryCourse.referenceSessionEndAt).toBe(
      "2026-04-14T10:00:00+08:00",
    );
    expect(data.daySchedules[0]?.primaryCourse.rollCallStartAt).toBe(
      "2026-04-14T00:45:00.000Z",
    );
    expect(data.daySchedules[0]?.primaryCourse.rollCallDeadlineAt).toBe(
      "2026-04-14T01:15:00.000Z",
    );
    expect(data.daySchedules[0]?.primaryCourse.actionHref).toContain(
      "/teacher/attendance/session?courseId=101&courseSessionId=1001",
    );
  });

  it("activates teacher-home attendance from effective roll-call window when campus rules are absent", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-14T07:38:00.000Z"));

    const me: MeDto = {
      id: 1,
      phone: "13800138000",
      name: "张老师",
      campusName: "南山校区",
    };
    const home: TeacherHomeDto = {
      weekStart: "2026-04-13",
      campusRollCallWindows: [],
      weekCourses: [
        {
          id: 101,
          name: "数学",
          location: "A101",
          sessionsInWeek: [
            {
              id: 1001,
              startAt: "2026-04-14T09:00:00+08:00",
              endAt: "2026-04-14T10:00:00+08:00",
            },
          ],
        },
      ],
    };
    const todaySessions: TeacherTodaySessionDto[] = [
      {
        courseId: 101,
        courseName: "数学",
        location: "A101",
        sessionId: 1001,
        sessionStartAt: "2026-04-14T15:40:00+08:00",
        sessionEndAt: "2026-04-14T16:40:00+08:00",
        effectiveRollCallStartAt: "2026-04-14T15:35:00+08:00",
        effectiveRollCallEndAt: "2026-04-14T15:45:00+08:00",
        rollCallWindowSource: "DEFAULT_AROUND_ACTUAL_START",
        rollCallCompleted: false,
      },
    ];

    const data = mapTeacherHomeData({ me, home, todaySessions });

    expect(data.daySchedules[0]?.primaryCourse.actionLabel).toBe("开始点名");
    expect(data.daySchedules[0]?.primaryCourse.attendanceWindowState).toBe("active");
    expect(data.daySchedules[0]?.primaryCourse.referenceSessionStartAt).toBe(
      "2026-04-14T15:40:00+08:00",
    );
    expect(data.daySchedules[0]?.primaryCourse.referenceSessionEndAt).toBe(
      "2026-04-14T16:40:00+08:00",
    );
    expect(data.daySchedules[0]?.primaryCourse.rollCallStartAt).toBe(
      "2026-04-14T15:35:00+08:00",
    );
    expect(data.daySchedules[0]?.primaryCourse.rollCallDeadlineAt).toBe(
      "2026-04-14T15:45:00+08:00",
    );
  });

  it("keeps teacher-home attendance entry available during class even after the roll-call window ends", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-14T08:10:00.000Z"));

    const me: MeDto = {
      id: 1,
      phone: "13800138000",
      name: "张老师",
      campusName: "南山校区",
    };
    const home: TeacherHomeDto = {
      weekStart: "2026-04-13",
      campusRollCallWindows: [],
      weekCourses: [
        {
          id: 101,
          name: "数学",
          location: "A101",
          sessionsInWeek: [
            {
              id: 1001,
              startAt: "2026-04-14T15:40:00+08:00",
              endAt: "2026-04-14T16:40:00+08:00",
            },
          ],
        },
      ],
    };
    const todaySessions: TeacherTodaySessionDto[] = [
      {
        courseId: 101,
        courseName: "数学",
        location: "A101",
        sessionId: 1001,
        sessionStartAt: "2026-04-14T15:40:00+08:00",
        sessionEndAt: "2026-04-14T16:40:00+08:00",
        effectiveRollCallStartAt: "2026-04-14T15:35:00+08:00",
        effectiveRollCallEndAt: "2026-04-14T15:45:00+08:00",
        rollCallWindowSource: "DEFAULT_AROUND_ACTUAL_START",
        rollCallCompleted: false,
      },
    ];

    const data = mapTeacherHomeData({ me, home, todaySessions });

    expect(data.daySchedules[0]?.primaryCourse.actionLabel).toBe("查看点名情况");
    expect(data.daySchedules[0]?.primaryCourse.attendanceWindowState).toBe("inactive");
  });

  it("keeps teacher-home attendance entry available during class after roll call has been submitted", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-14T07:38:00.000Z"));

    const me: MeDto = {
      id: 1,
      phone: "13800138000",
      name: "张老师",
      campusName: "南山校区",
    };
    const home: TeacherHomeDto = {
      weekStart: "2026-04-13",
      campusRollCallWindows: [],
      weekCourses: [
        {
          id: 101,
          name: "数学",
          location: "A101",
          sessionsInWeek: [
            {
              id: 1001,
              startAt: "2026-04-14T15:40:00+08:00",
              endAt: "2026-04-14T16:40:00+08:00",
            },
          ],
        },
      ],
    };
    const todaySessions: TeacherTodaySessionDto[] = [
      {
        courseId: 101,
        courseName: "数学",
        location: "A101",
        sessionId: 1001,
        sessionStartAt: "2026-04-14T15:40:00+08:00",
        sessionEndAt: "2026-04-14T16:40:00+08:00",
        effectiveRollCallStartAt: "2026-04-14T15:35:00+08:00",
        effectiveRollCallEndAt: "2026-04-14T15:45:00+08:00",
        rollCallWindowSource: "DEFAULT_AROUND_ACTUAL_START",
        rollCallCompleted: true,
      },
    ];

    const data = mapTeacherHomeData({ me, home, todaySessions });

    expect(data.daySchedules[0]?.primaryCourse.actionLabel).toBe("查看点名情况");
    expect(data.daySchedules[0]?.primaryCourse.attendanceWindowState).toBe("active");
  });

  it("collapses teacher-home same group sessions into one merged roll-call task", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-14T01:05:00.000Z"));

    const me: MeDto = {
      id: 1,
      phone: "13800138000",
      name: "张老师",
      campusName: "南山校区",
    };
    const home: TeacherHomeDto = {
      weekStart: "2026-04-13",
      campusRollCallWindows: [],
      weekCourses: [],
    };
    const todaySessions: TeacherTodaySessionDto[] = [
      {
        courseId: 101,
        courseName: "机器人",
        location: "A101",
        sessionId: 1001,
        sessionStartAt: "2026-04-14T09:00:00+08:00",
        sessionEndAt: "2026-04-14T10:00:00+08:00",
        effectiveRollCallStartAt: "2026-04-14T08:50:00+08:00",
        effectiveRollCallEndAt: "2026-04-14T09:10:00+08:00",
        rollCallCompleted: false,
        rollCallGroupId: "g-900",
        rollCallGroupSize: 2,
        rollCallGroupCanSubmit: true,
      },
      {
        courseId: 102,
        courseName: "创意美术",
        location: "A102",
        sessionId: 1002,
        sessionStartAt: "2026-04-14T09:00:00+08:00",
        sessionEndAt: "2026-04-14T10:00:00+08:00",
        effectiveRollCallStartAt: "2026-04-14T08:50:00+08:00",
        effectiveRollCallEndAt: "2026-04-14T09:10:00+08:00",
        rollCallCompleted: false,
        rollCallGroupId: "g-900",
        rollCallGroupSize: 2,
        rollCallGroupCanSubmit: true,
      },
    ];

    const data = mapTeacherHomeData({ me, home, todaySessions });

    expect(data.daySchedules[0]?.primaryCourse).toEqual(
      expect.objectContaining({
        kind: "merge",
        badge: "合班",
        title: "合班点名（2 个班级）",
        expectedLabel: "2 个班级",
        actionHref: "/teacher/attendance/group?groupId=g-900",
        actionLabel: "开始合班点名",
      }),
    );
    expect(data.daySchedules[0]?.substituteCourse).toBeUndefined();
  });

  it("prioritizes merged roll-call tasks before original teacher courses on teacher home", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-14T01:05:00.000Z"));

    const me: MeDto = {
      id: 1,
      phone: "13800138000",
      name: "张老师",
      campusName: "南山校区",
    };
    const home: TeacherHomeDto = {
      weekStart: "2026-04-13",
      campusRollCallWindows: [],
      weekCourses: [],
    };
    const todaySessions: TeacherTodaySessionDto[] = [
      {
        courseId: 100,
        courseName: "原始科学课",
        location: "B101",
        sessionId: 1000,
        sessionStartAt: "2026-04-14T08:00:00+08:00",
        sessionEndAt: "2026-04-14T09:00:00+08:00",
        rollCallCompleted: false,
      },
      {
        courseId: 101,
        courseName: "机器人",
        location: "A101",
        sessionId: 1001,
        sessionStartAt: "2026-04-14T09:00:00+08:00",
        sessionEndAt: "2026-04-14T10:00:00+08:00",
        rollCallCompleted: false,
        rollCallGroupId: "g-900",
        rollCallGroupSize: 2,
        rollCallGroupCanSubmit: true,
      },
      {
        courseId: 102,
        courseName: "创意美术",
        location: "A102",
        sessionId: 1002,
        sessionStartAt: "2026-04-14T09:00:00+08:00",
        sessionEndAt: "2026-04-14T10:00:00+08:00",
        rollCallCompleted: false,
        rollCallGroupId: "g-900",
        rollCallGroupSize: 2,
        rollCallGroupCanSubmit: true,
      },
    ];

    const data = mapTeacherHomeData({ me, home, todaySessions });

    expect(data.daySchedules[0]?.primaryCourse).toEqual(
      expect.objectContaining({
        kind: "merge",
        badge: "合班",
        title: "合班点名（2 个班级）",
      }),
    );
    expect(data.daySchedules[0]?.substituteCourse).toEqual(
      expect.objectContaining({
        kind: "other",
        badge: "原定课",
        title: "原始科学课",
      }),
    );
  });

  it("prioritizes changed-teacher substitute courses on teacher home", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-14T01:05:00.000Z"));

    const me: MeDto = {
      id: 1,
      phone: "13800138000",
      name: "张老师",
      campusName: "南山校区",
    };
    const home: TeacherHomeDto = {
      weekStart: "2026-04-13",
      campusRollCallWindows: [
        {
          id: 1,
          weekday: 2,
          startOffsetMinutes: -15,
          endOffsetMinutes: 15,
        },
      ],
      weekCourses: [
        {
          id: 101,
          name: "数学",
          location: "A101",
          sessionsInWeek: [
            {
              id: 1001,
              startAt: "2026-04-14T09:00:00+08:00",
              endAt: "2026-04-14T10:00:00+08:00",
            },
          ],
        },
        {
          id: 202,
          name: "创意美术A班",
          location: "美术楼301",
          sessionsInWeek: [
            {
              id: 2002,
              startAt: "2026-04-14T10:20:00+08:00",
              endAt: "2026-04-14T11:20:00+08:00",
            },
          ],
        },
      ],
    };
    const todaySessions: TeacherTodaySessionDto[] = [
      {
        courseId: 101,
        courseName: "数学",
        location: "A101",
        sessionId: 1001,
        sessionStartAt: "2026-04-14T09:00:00+08:00",
        sessionEndAt: "2026-04-14T10:00:00+08:00",
        rollCallCompleted: false,
      },
      {
        courseId: 202,
        courseName: "创意美术A班",
        location: "美术楼301",
        sessionId: 2002,
        sessionStartAt: "2026-04-14T10:20:00+08:00",
        sessionEndAt: "2026-04-14T11:20:00+08:00",
        rollCallCompleted: false,
      },
    ];

    const data = mapTeacherHomeData({
      me,
      home,
      todaySessions,
      sessionTeacherStates: new Map([[2002, { isSubstitute: true }]]),
    });

    expect(data.daySchedules[0]?.primaryCourse).toEqual(
      expect.objectContaining({
        kind: "substitute",
        badge: "代课",
        title: "创意美术A班",
      }),
    );
    expect(data.daySchedules[0]?.substituteCourse).toEqual(
      expect.objectContaining({
        kind: "other",
        badge: "原定课",
        title: "数学",
      }),
    );
  });

  it("includes Saturday sessions in the teacher home week calendar", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-18T01:05:00.000Z"));

    const me: MeDto = {
      id: 1,
      phone: "17882248513",
      name: "李老师",
      campusName: "南山校区",
    };
    const home: TeacherHomeDto = {
      weekStart: "2026-04-13",
      campusRollCallWindows: [
        {
          id: 1,
          weekday: 6,
          startOffsetMinutes: -15,
          endOffsetMinutes: 15,
        },
      ],
      weekCourses: [
        {
          id: 301,
          name: "周六补课",
          location: "B201",
          sessionsInWeek: [
            {
              id: 3001,
              startAt: "2026-04-18T09:00:00+08:00",
              endAt: "2026-04-18T10:00:00+08:00",
            },
          ],
        },
      ],
    };
    const todaySessions: TeacherTodaySessionDto[] = [
      {
        courseId: 301,
        courseName: "周六补课",
        location: "B201",
        sessionId: 3001,
        sessionStartAt: "2026-04-18T09:00:00+08:00",
        sessionEndAt: "2026-04-18T10:00:00+08:00",
        rollCallCompleted: false,
      },
    ];

    const data = mapTeacherHomeData({ me, home, todaySessions });

    expect(data.weekCalendar).toHaveLength(7);
    expect(data.weekCalendar.find((item) => item.key === "sat")).toEqual(
      expect.objectContaining({
        key: "sat",
        hasClass: true,
      }),
    );
    expect(data.defaultDayKey).toBe("sat");
    expect(data.daySchedules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dayKey: "sat",
          primaryCourse: expect.objectContaining({
            title: "周六补课",
          }),
        }),
      ]),
    );
  });

  it("projects todaySessions onto the actual Shanghai today even when the source week session belongs to another weekday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-18T01:05:00.000Z"));

    const data = mapTeacherHomeData({
      me: {
        id: 1,
        phone: "13800138000",
        name: "张老师",
        campusName: "南山校区",
      },
      home: {
        weekStart: "2026-04-13",
        campusRollCallWindows: [],
        weekCourses: [
          {
            id: 401,
            name: "原周四课程",
            location: "B201",
            sessionsInWeek: [
              {
                id: 4001,
                startAt: "2026-04-16T09:00:00+08:00",
                endAt: "2026-04-16T10:00:00+08:00",
              },
            ],
          },
        ],
      },
      todaySessions: [
        {
          courseId: 401,
          courseName: "今天生效课程",
          location: "B201",
          sessionId: 4001,
          sessionStartAt: "2026-04-18T09:00:00+08:00",
          sessionEndAt: "2026-04-18T10:00:00+08:00",
          rollCallCompleted: false,
        },
      ],
    });

    expect(data.defaultDayKey).toBe("sat");
    expect(data.weekCalendar.find((item) => item.key === "sat")).toEqual(
      expect.objectContaining({
        key: "sat",
        hasClass: true,
      }),
    );
    expect(data.daySchedules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dayKey: "sat",
          primaryCourse: expect.objectContaining({
            title: "今天生效课程",
            time: "09:00-10:00",
          }),
        }),
      ]),
    );
  });

  it("keeps only one substitute-style card when the only class is a substitute session", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-14T01:05:00.000Z"));

    const me: MeDto = {
      id: 1,
      phone: "13800138000",
      name: "张老师",
      campusName: "南山校区",
    };
    const home: TeacherHomeDto = {
      weekStart: "2026-04-13",
      campusRollCallWindows: [],
      weekCourses: [
        {
          id: 202,
          name: "创意美术A班",
          location: "美术楼301",
          sessionsInWeek: [
            {
              id: 2002,
              startAt: "2026-04-14T10:20:00+08:00",
              endAt: "2026-04-14T11:20:00+08:00",
            },
          ],
        },
      ],
    };
    const todaySessions: TeacherTodaySessionDto[] = [
      {
        courseId: 202,
        courseName: "创意美术A班",
        location: "美术楼301",
        sessionId: 2002,
        sessionStartAt: "2026-04-14T10:20:00+08:00",
        sessionEndAt: "2026-04-14T11:20:00+08:00",
        rollCallCompleted: false,
      },
    ];

    const data = mapTeacherHomeData({
      me,
      home,
      todaySessions,
      sessionTeacherStates: new Map([[2002, { isSubstitute: true }]]),
    });

    expect(data.daySchedules[0]?.primaryCourse).toEqual(
      expect.objectContaining({
        kind: "substitute",
        badge: "代课",
        expectedLabel: "代课待完成",
        title: "创意美术A班",
      }),
    );
    expect(data.daySchedules[0]?.substituteCourse).toBeUndefined();
  });

  it.skip("maps admin home data into the target home screen semantics", () => {
    const me: MeDto = {
      id: 61,
      phone: "13800138000",
      name: "管理员",
      campusName: "嘉祥成华小学",
    };
    const summary: AdminHomeSummaryDto = {
      date: "2026-04-14",
      sessionCountToday: 8,
      pendingRollCallSessions: 1,
      actualClassTimeRange: "15:50 - 17:20",
      rollCallTimeRange: "15:45 - 15:55",
      todaySubstituteCourseCount: 1,
      todaySubstituteTeacherCount: 1,
      rollCallWindowRuleCount: 2,
      rollCallRulesSummary: "默认",
    };

    expect(mapAdminHomeData({ me, summary })).toEqual({
      campusLabel: "嘉祥成华小学",
      title: "管理设置",
      ruleDateLabel: "4/14 周二",
      effectiveRules: [
        { label: "实际上课", value: "15:50 - 17:20", tone: "neutral" },
        { label: "点名时间", value: "15:45 - 15:55", tone: "warning" },
        { label: "今日代课", value: "1 班级 · 1 老师", tone: "success" },
      ],
      heroDescription: "进入后可查看今天各课程的点名老师，也可处理临时代课调整。",
      heroPrimaryHref: "/admin/emergency",
      entryCards: [
        {
          href: "/admin/course-settings",
          title: "课程设置",
          description: "查看今日生效课程，继续调整课程信息和课程名单。",
          badge: "8 节生效",
          icon: "users",
          iconTone: "success",
          badgeTone: "success",
        },
        {
          href: "/admin/time-settings",
          title: "时间设置",
          description: "统一今天的实际上课与点名时间，保持老师端入口口径一致。",
          badge: "点名时间已生效",
          icon: "clock",
          iconTone: "info",
          badgeTone: "info",
        },
      ],
    });
  });

  it("summarizes time setting rules from homepage ranges", () => {
    const me: MeDto = {
      id: 61,
      phone: "13800138000",
      campusName: "Test Campus",
    };
    const baseSummary: AdminHomeSummaryDto = {
      date: "2026-04-14",
      distinctCoursesWithSessionsToday: 4,
      sessionCountToday: 8,
      pendingRollCallSessions: 1,
      todaySubstituteCourseCount: 0,
      todaySubstituteTeacherCount: 0,
      rollCallWindowRuleCount: 7,
      rollCallRulesSummary: "已配置7条规则",
    };

    expect(
      mapAdminHomeData({
        me,
        summary: {
          ...baseSummary,
          actualClassTimeRange: "15:50 - 17:20",
          rollCallTimeRange: "15:45 - 15:55",
        },
      }).entryCards[1],
    ).toMatchObject({
      href: "/admin/time-settings",
      badge: "点名时间已生效",
      badgeTone: "info",
    });

    expect(
      mapAdminHomeData({
        me,
        summary: {
          ...baseSummary,
          actualClassTimeRange: "15:50 - 17:20",
          rollCallTimeRange: null,
        },
      }).entryCards[1],
    ).toMatchObject({
      href: "/admin/time-settings",
      badge: "点名时间已生效",
      badgeTone: "info",
    });

    expect(
      mapAdminHomeData({
        me,
        summary: {
          ...baseSummary,
          actualClassTimeRange: null,
          rollCallTimeRange: null,
        },
      }).entryCards[1],
    ).toMatchObject({
      href: "/admin/time-settings",
      badge: "点名时间待配置",
      badgeTone: "neutral",
    });
  });

  it("treats submitted roll calls as finished even when absences remain", () => {
    const me: MeDto = {
      id: 61,
      phone: "13800138000",
      campusName: "嘉祥成华小学",
    };

    const data = mapAdminControlData({
      me,
      overview: [
        {
          courseId: 101,
          courseName: "乐高机器人 AI",
          sessionId: 3001,
          sessionStartAt: "2026-04-14T16:00:00+08:00",
          sessionEndAt: "2026-04-14T17:00:00+08:00",
          rollCallCompleted: true,
          shouldAttendCount: 12,
          presentCount: 8,
          leaveCount: 1,
          absentCount: 3,
          progressPercent: 75,
        },
        {
          courseId: 102,
          courseName: "创意美术A班",
          sessionId: 3002,
          sessionStartAt: "2026-04-14T16:00:00+08:00",
          sessionEndAt: "2026-04-14T17:00:00+08:00",
          rollCallCompleted: false,
          shouldAttendCount: 15,
          presentCount: 5,
          leaveCount: 0,
          absentCount: 10,
          progressPercent: 33,
        },
      ],
      courseDetailsById: new Map<number, CourseDetailDto>(),
      teacherStatesBySessionKey: new Map([
        ["101:3001", { label: "王老师 · 13800138000", temporary: false }],
        ["102:3002", { label: "李老师 · 13700137000", temporary: false }],
      ]),
    });

    expect(data.dateLabel).toBe("2026/4/14（周二）");
    expect(data.referenceSessionStartAt).toBe("2026-04-14T16:00:00+08:00");
    expect(data.finishedCount).toBe(1);
    expect(data.unfinishedCount).toBe(1);
    expect(data.classes[0]).toEqual(
      expect.objectContaining({
        id: "101",
        href: "/admin/control/_?classId=101&courseSessionId=3001",
        teacher: "王老师 · 13800138000",
        progressLabel: "8/12 已到",
        state: "done",
      }),
    );
    expect(data.classes[1]).toEqual(
      expect.objectContaining({
        id: "102",
        state: "partial",
      }),
    );
  });

  it("aggregates admin control rows that belong to the same merged roll-call group", () => {
    const me: MeDto = {
      id: 61,
      phone: "13800138000",
      campusName: "嘉祥成华小学",
    };

    const data = mapAdminControlData({
      me,
      overview: [
        {
          courseId: 101,
          courseName: "机器人",
          sessionId: 3001,
          sessionStartAt: "2026-04-14T16:00:00+08:00",
          sessionEndAt: "2026-04-14T17:00:00+08:00",
          rollCallCompleted: false,
          shouldAttendCount: 10,
          presentCount: 5,
          leaveCount: 0,
          absentCount: 1,
          progressPercent: 50,
          rollCallTeacherName: "王老师",
          rollCallTeacherPhone: "13800138000",
          rollCallGroupId: "g-900",
          rollCallGroupSize: 2,
        },
        {
          courseId: 102,
          courseName: "创意美术",
          sessionId: 3002,
          sessionStartAt: "2026-04-14T16:00:00+08:00",
          sessionEndAt: "2026-04-14T17:00:00+08:00",
          rollCallCompleted: false,
          shouldAttendCount: 10,
          presentCount: 10,
          leaveCount: 0,
          absentCount: 0,
          progressPercent: 100,
          rollCallGroupId: "g-900",
          rollCallGroupSize: 2,
        },
      ],
      courseDetailsById: new Map<number, CourseDetailDto>(),
    });

    expect(data.classes).toHaveLength(1);
    expect(data.classes[0]).toEqual(
      expect.objectContaining({
        id: "group:g-900",
        kind: "merge",
        badge: "合班",
        name: "合班点名 · 机器人、创意美术",
        teacher: "王老师 · 13800138000",
        groupSize: 2,
        progressLabel: "15/20 已到",
        completion: 75,
        absentCount: 1,
      }),
    );
    expect(data.unfinishedCount).toBe(1);
  });

  it("maps admin course settings from live today-course data instead of teacher settings semantics", () => {
    const overview: AdminCourseSettingsOverviewDto = {
      date: "2026-04-14",
      defaultWeekday: 2,
      currentRuleMode: "DEFAULT_DAY",
      alternateRuleEnabled: false,
      temporaryCourseActionEnabled: false,
      saveEnabled: true,
      effectiveCourseCount: 1,
      courses: [
        {
          courseId: 101,
          sessionId: 3001,
          courseName: "乐高竞赛班5-6",
          location: "科技楼205",
          sessionStartAt: "2026-04-14T16:00:00+08:00",
          sessionEndAt: "2026-04-14T17:30:00+08:00",
          effectiveTeacherId: 7,
          effectiveTeacherName: "赵鹏",
          temporaryTeacherAssigned: false,
          studentCount: 25,
          courseStatus: "TODAY_ACTIVE",
          actionType: "REMOVE_FROM_TODAY",
          actionEnabled: false,
        },
      ],
    };

    const mapped = mapAdminCourseSettingsData({
      overview,
    });
    expect(mapped.title).toEqual(expect.any(String));
    expect(mapped.effectiveCourseCount).toBe(1);
    expect(mapped.effectiveCourseCountLabel).toBe("共 1 节");
    expect(mapped.saveLabel).toEqual(expect.any(String));
    expect(mapped.saveDescription).toEqual(expect.any(String));
    expect(mapped.sectionTitle).toBe("今日生效课程（1 节）");
    expect(mapped.modes).toEqual([
      { id: "default", label: expect.any(String), active: true },
      {
        id: "alternate",
        label: expect.any(String),
        active: false,
        disabled: true,
        href: "/admin/course-settings/alternate-day",
      },
    ]);
    expect(mapped.courses).toEqual([
      {
        id: "101:3001",
        courseId: "101",
        sessionId: "3001",
        title: "乐高竞赛班5-6",
        meta: "16:00-17:30 · 科技楼205 · 赵鹏 · 25 人",
        badgeLabel: "今日行课",
        badgeTone: "today",
        editHref: "/admin/course-settings/_/edit?courseId=101&courseSessionId=3001",
        timeLabel: "16:00-17:30",
        locationLabel: "科技楼205",
        teacherLabel: "赵鹏",
        studentCount: 25,
        sourceType: "live",
        canRemoveFromToday: false,
        rosterHref: "/admin/course-settings/_/students?courseId=101&courseSessionId=3001",
        secondaryActionLabel: "编辑课程信息",
        secondaryActionTone: "outline",
        secondaryActionHref: "/admin/course-settings/_/edit?courseId=101&courseSessionId=3001",
        secondaryActionDisabled: false,
        secondaryActionKind: "edit",
      },
    ]);
  });

  it("maps admin course roster with today-course context when session info is available", () => {
    const course: CourseDetailDto = {
      id: 101,
      name: "乐高竞赛班5-6",
      location: "科技楼205",
      campusId: 22,
      sessions: [
        {
          id: 3001,
          startAt: "2026-04-14T16:00:00+08:00",
          endAt: "2026-04-14T17:30:00+08:00",
        },
      ],
      teachers: [
        {
          teacherId: 7,
          role: "PRIMARY",
          name: "默认老师",
        },
      ],
    };
    const students: CourseStudentRowDto[] = [
      {
        studentId: 7001,
        externalStudentId: "STU-05231",
        studentName: "王一诺",
        homeroomClassId: 10,
        homeroomClassName: "五年级3班",
      },
    ];

    expect(
      mapAdminCourseRosterData({
        courseId: 101,
        courseSessionId: 3001,
        course,
        students,
        effectiveCourseContext: {
          courseId: 101,
          sessionId: 3001,
          courseName: "乐高竞赛班5-6",
          location: "科技楼205",
          sessionStartAt: "2026-04-14T16:00:00+08:00",
          sessionEndAt: "2026-04-14T17:30:00+08:00",
          effectiveTeacherId: 7,
          effectiveTeacherName: "赵鹏",
          temporaryTeacherAssigned: false,
          studentCount: 25,
          courseStatus: "TODAY_ACTIVE",
          actionType: "REMOVE_FROM_TODAY",
          actionEnabled: false,
        },
      }),
    ).toEqual({
      courseId: "101",
      title: "学生名单",
      badge: "名单页",
      courseTitle: "乐高竞赛班5-6",
      courseMeta: "16:00-17:30 · 科技楼205 · 赵鹏 · 25 人",
      searchPlaceholder: "搜索学生姓名 / 学生ID / 行政班",
      addHref: "/admin/course-settings/_/students/new?courseId=101&courseSessionId=3001",
      importHref: "/admin/course-settings/_/students/import?courseId=101&courseSessionId=3001",
      students: [
        {
          id: "7001",
          name: "王一诺",
          studentCode: "7001",
          homeroomClass: "五年级3班",
          editHref:
            "/admin/course-settings/_/students/_/edit?courseId=101&studentId=7001&courseSessionId=3001",
        },
      ],
    });
  });

  it("maps admin course teachers from course-teacher relations instead of teacher entities", () => {
    const courseDetailsById = new Map<number, CourseDetailDto>([
      [
        101,
        {
          id: 101,
          name: "乐高竞赛班5-6",
          location: "科技楼205",
          campusId: 22,
          sessions: [],
          teachers: [],
        },
      ],
      [
        102,
        {
          id: 102,
          name: "机器人快闪班",
          location: "科技楼301",
          campusId: 22,
          sessions: [],
          teachers: [],
        },
      ],
    ]);

    expect(
      mapAdminCourseTeachersRelationData({
        overview: [
          {
            courseId: 101,
            courseName: "乐高竞赛班5-6",
            sessionId: 3001,
            sessionStartAt: "2026-04-16T16:00:00+08:00",
            sessionEndAt: "2026-04-16T17:30:00+08:00",
            defaultTeacherId: 7,
            defaultTeacherName: "赵鹏",
            rollCallTeacherId: 7,
            rollCallTeacherName: "赵鹏",
            temporaryTeacherAssigned: false,
          },
          {
            courseId: 102,
            courseName: "机器人快闪班",
            sessionId: 3002,
            sessionStartAt: "2026-04-16T17:40:00+08:00",
            sessionEndAt: "2026-04-16T18:20:00+08:00",
            defaultTeacherId: 8,
            defaultTeacherName: "陈静",
            rollCallTeacherId: 8,
            rollCallTeacherName: "陈静",
            temporaryTeacherAssigned: true,
          },
        ],
        courseDetailsById,
      }),
    ).toEqual({
      title: "查看课程老师",
      searchPlaceholder: "搜索老师姓名 / 手机号",
      days: [{ key: "thu", label: "周四" }],
      defaultDayKey: "thu",
      teachers: [
        {
          id: "101:3001",
          dayKey: "thu",
          label: "赵鹏",
          note: "乐高竞赛班5-6 · 科技楼205 · 默认负责",
          teacherName: "赵鹏",
          courseLabel: "乐高竞赛班5-6",
          locationLabel: "科技楼205",
          statusLabel: "默认负责",
          tone: "default",
        },
        {
          id: "102:3002",
          dayKey: "thu",
          label: "陈静",
          note: "机器人快闪班 · 科技楼301 · 代课老师",
          teacherName: "陈静",
          courseLabel: "机器人快闪班",
          locationLabel: "科技楼301",
          statusLabel: "代课老师",
          tone: "substitute",
        },
      ],
    });
  });

  it("prefers today's Shanghai weekday as the default course-teachers tab when it exists", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17T10:00:00+08:00"));

    const courseDetailsById = new Map<number, CourseDetailDto>([
      [
        101,
        {
          id: 101,
          name: "乐高竞赛班5-6",
          location: "科技楼205",
          campusId: 22,
          sessions: [],
          teachers: [],
        },
      ],
      [
        102,
        {
          id: 102,
          name: "机器人快闪班",
          location: "科技楼301",
          campusId: 22,
          sessions: [],
          teachers: [],
        },
      ],
    ]);

    expect(
      mapAdminCourseTeachersRelationData({
        overview: [
          {
            courseId: 101,
            courseName: "乐高竞赛班5-6",
            sessionId: 3001,
            sessionStartAt: "2026-04-16T16:00:00+08:00",
            sessionEndAt: "2026-04-16T17:30:00+08:00",
            defaultTeacherId: 7,
            defaultTeacherName: "赵鹏",
            rollCallTeacherId: 7,
            rollCallTeacherName: "赵鹏",
            temporaryTeacherAssigned: false,
          },
          {
            courseId: 102,
            courseName: "机器人快闪班",
            sessionId: 3002,
            sessionStartAt: "2026-04-17T17:40:00+08:00",
            sessionEndAt: "2026-04-17T18:20:00+08:00",
            defaultTeacherId: 8,
            defaultTeacherName: "陈静",
            rollCallTeacherId: 8,
            rollCallTeacherName: "陈静",
            temporaryTeacherAssigned: true,
          },
        ],
        courseDetailsById,
      }).defaultDayKey,
    ).toBe("fri");
  });

  it("falls back to 待配置 when admin home roll call time is still an offset-rule draft", () => {
    const me: MeDto = {
      id: 62,
      phone: "13800138001",
      name: "管理员",
      campusName: "成都高新云芯学校",
    };
    const summary: AdminHomeSummaryDto = {
      date: "2026-04-16",
      sessionCountToday: 1,
      pendingRollCallSessions: 1,
      actualClassTimeRange: "08:00 - 07:00",
      rollCallTimeRange: "开课前 10 分钟 - 开课后 10 分钟",
      todaySubstituteCourseCount: 0,
      todaySubstituteTeacherCount: 0,
      rollCallWindowRuleCount: 7,
      rollCallRulesSummary: "已配置 7 条星期规则",
    };

    expect(mapAdminHomeData({ me, summary }).effectiveRules[1]).toEqual({
      label: "点名时间",
      value: "待配置",
      tone: "warning",
    });
  });

  it("shows a no-substitute message when both substitute counts are zero", () => {
    const me: MeDto = {
      id: 63,
      phone: "13800138002",
      name: "管理员",
      campusName: "成都高新云芯学校",
    };
    const summary: AdminHomeSummaryDto = {
      date: "2026-04-16",
      sessionCountToday: 1,
      pendingRollCallSessions: 0,
      actualClassTimeRange: "08:00 - 09:00",
      rollCallTimeRange: "07:50 - 08:10",
      todaySubstituteCourseCount: 0,
      todaySubstituteTeacherCount: 0,
      rollCallWindowRuleCount: 1,
      rollCallRulesSummary: "默认",
    };

    expect(mapAdminHomeData({ me, summary }).effectiveRules[2]).toEqual({
      label: "今日代课",
      value: "今日无代课",
      tone: "success",
    });
    expect(mapAdminHomeData({ me, summary }).heroDescription).toBe(
      "默认老师会按选修课系统自动同步，需要时可在这里查看并调整今天各课程的点名老师。",
    );
  });

  it("keeps compact roll-call time ranges on the admin home page", () => {
    const me: MeDto = {
      id: 64,
      phone: "18808050940",
      name: "王雅宁",
      campusName: "成都市温江区嘉祥外国语学校",
    };
    const summary: AdminHomeSummaryDto = {
      date: "2026-04-22",
      distinctCoursesWithSessionsToday: 78,
      sessionCountToday: 78,
      pendingRollCallSessions: 78,
      actualClassTimeRange: "15:55 - 17:25",
      rollCallTimeRange: "13:50-16:00",
      todaySubstituteCourseCount: 0,
      todaySubstituteTeacherCount: 0,
      rollCallWindowRuleCount: 7,
      rollCallRulesSummary: "已配置 7 条星期规则",
    };

    expect(mapAdminHomeData({ me, summary }).effectiveRules[1]).toEqual({
      label: "点名时间",
      value: "13:50-16:00",
      tone: "warning",
    });
  });

  it.skip("maps unarrived rows into grouped UI data", () => {
    const me: MeDto = {
      id: 2,
      phone: "13900139000",
      campusName: "南山校区",
    };
    const rows: AbsentStudentRowDto[] = [
      {
        courseSessionId: 3001,
        sessionStartAt: "2026-04-14T08:00:00+08:00",
        sessionEndAt: "2026-04-14T09:00:00+08:00",
        studentId: 1,
        studentName: "小明",
        homeroomClassId: 7,
        homeroomClassName: "一班",
        courseId: 101,
        courseName: "数学",
        teacherNames: "王老师",
        status: 0,
        attendanceSubmittedAt: "2026-04-14T08:30:00+08:00",
      },
    ];

    const data = mapAdminUnarrivedData({
      me,
      rows,
      courseContexts: new Map([
        [
          "101:3001",
          {
            roster: [
              {
                id: "1",
                name: "小明",
                homeroomClass: "一班",
                homeroomClassId: 7,
                status: "leave",
                managerUpdated: true,
              },
            ],
          },
        ],
      ]),
    });

    expect(data.campusLabel).toBe("南山校区");
    expect(data.groups).toHaveLength(1);
    expect(data.groups[0]?.meta).toContain("王老师");
    expect(data.groups[0]?.students[0]).toEqual(
      expect.objectContaining({
        name: "小明",
        homeroomClass: "一班",
        status: "leave",
        managerUpdated: true,
      }),
    );
    expect(data.totals.absent).toBe(1);
    expect(data.totals.expected).toBe(1);
  });

  it.skip("maps time setting sessions into list cards", () => {
    const settings: CourseSessionTimeSettingDto[] = [
      {
        courseSessionId: 3001,
        courseId: 101,
        courseName: "数学",
        campusId: 22,
        sessionDate: "2026-04-14",
        weekday: 2,
        scheduledStartAt: "2026-04-14T08:00:00+08:00",
        scheduledEndAt: "2026-04-14T09:00:00+08:00",
        actualStartTime: "08:05",
        actualEndTime: "09:02",
        rollCallStartTime: "07:50",
        rollCallEndTime: "08:10",
        actualCustomized: true,
        rollCallCustomized: false,
      },
    ];

    expect(
      mapAdminTimeSettingsData(settings, {
        targetDate: "2026-04-14",
        todayDate: "2026-04-14",
        weekStart: "2026-04-13",
      }),
    ).toMatchObject({
      dateLabel: "4月14日 · 周二",
      sessions: [
        {
          id: "3001",
          courseSessionId: "3001",
          courseTitle: "数学",
          sessionMeta: "周二 · 08:00-09:00",
          actualRange: "08:05-09:02",
          rollCallRange: "07:50-08:10",
          actualCustomized: true,
          rollCallCustomized: false,
          detailHref: "/admin/time-settings/3001",
        },
      ],
    });
  });

  it("maps time setting sessions into baseline rule cards", () => {
    const settings: CourseSessionTimeSettingDto[] = [
      {
        courseSessionId: 3001,
        courseId: 101,
        courseName: "数学",
        campusId: 22,
        sessionDate: "2026-04-14",
        weekday: 2,
        scheduledStartAt: "2026-04-14T08:00:00+08:00",
        scheduledEndAt: "2026-04-14T09:00:00+08:00",
        actualStartTime: "08:05",
        actualEndTime: "09:02",
        rollCallStartTime: "07:50",
        rollCallEndTime: "08:10",
        defaultRollCallStartTime: "07:50",
        defaultRollCallEndTime: "08:10",
        defaultRollCallStartOffsetMinutes: -15,
        defaultRollCallEndOffsetMinutes: 5,
        actualCustomized: true,
        rollCallCustomized: false,
      },
    ];

    expect(
      mapAdminTimeSettingsData(settings, {
        targetDate: "2026-04-14",
        todayDate: "2026-04-14",
        weekStart: "2026-04-13",
      }),
    ).toMatchObject({
      title: "时间设置",
      days: [
        { key: "mon", label: "周一", active: false },
        { key: "tue", label: "周二", active: true },
        { key: "wed", label: "周三", active: false },
        { key: "thu", label: "周四", active: false },
        { key: "fri", label: "周五", active: false },
        { key: "sat", label: "周六", active: false },
        { key: "sun", label: "周日", active: false },
      ],
      defaultDayKey: "tue",
      searchPlaceholder: "搜索时间规则 / 点名窗口",
      cards: [
        {
          id: "class-time",
          title: "设置实际上课时间",
          currentLabel: "当前：08:05-09:02",
          href: "/admin/time-settings/_?courseSessionId=class-time&targetDate=2026-04-14",
        },
        {
          id: "attendance-window",
          title: "设置点名时间",
          currentLabel: "当前：07:50-08:10",
          href: "/admin/time-settings/_?courseSessionId=attendance-window&targetDate=2026-04-14",
        },
      ],
    });
  });

  it("shows 未排课 instead of 待设置 when the selected day has no sessions", () => {
    expect(
      mapAdminTimeSettingsData([], {
        targetDate: "2026-04-21",
        todayDate: "2026-04-23",
        weekStart: "2026-04-20",
      }),
    ).toMatchObject({
      targetDate: "2026-04-21",
      days: expect.arrayContaining([
        expect.objectContaining({
          key: "tue",
          active: true,
          readonly: true,
          href: "/admin/time-settings?targetDate=2026-04-21",
        }),
        expect.objectContaining({
          key: "thu",
          readonly: false,
          href: "/admin/time-settings?targetDate=2026-04-23",
        }),
      ]),
      cards: [
        {
          id: "class-time",
          title: "设置实际上课时间",
          currentLabel: "当前：未排课",
        },
        {
          id: "attendance-window",
          title: "设置点名时间",
          currentLabel: "当前：未排课",
        },
      ],
    });
  });

  it("keeps past in-week time-setting cards viewable but not clickable", () => {
    const settings: CourseSessionTimeSettingDto[] = [
      {
        courseSessionId: 3001,
        courseId: 101,
        courseName: "数学",
        campusId: 22,
        sessionDate: "2026-04-21",
        weekday: 2,
        scheduledStartAt: "2026-04-21T08:00:00+08:00",
        scheduledEndAt: "2026-04-21T09:00:00+08:00",
        actualStartTime: "08:05",
        actualEndTime: "09:02",
        rollCallStartTime: "07:50",
        rollCallEndTime: "08:10",
        defaultRollCallStartTime: "07:50",
        defaultRollCallEndTime: "08:10",
        defaultRollCallStartOffsetMinutes: -15,
        defaultRollCallEndOffsetMinutes: 5,
        actualCustomized: true,
        rollCallCustomized: false,
      },
    ];

    const data = mapAdminTimeSettingsData(settings, {
      targetDate: "2026-04-21",
      todayDate: "2026-04-23",
      weekStart: "2026-04-20",
    });

    expect(data).toMatchObject({
      targetDate: "2026-04-21",
      days: expect.arrayContaining([
        expect.objectContaining({
          key: "tue",
          active: true,
          readonly: true,
          href: "/admin/time-settings?targetDate=2026-04-21",
        }),
      ]),
      cards: [
        {
          id: "class-time",
          title: "设置实际上课时间",
          currentLabel: "当前：08:05-09:02",
        },
        {
          id: "attendance-window",
          title: "设置点名时间",
          currentLabel: "当前：07:50-08:10",
        },
      ],
    });

    expect(data.cards[0]?.href).toBeUndefined();
    expect(data.cards[1]?.href).toBeUndefined();
  });

  it("marks past time-setting detail as read-only", () => {
    const setting: CourseSessionTimeSettingDto = {
      courseSessionId: 3001,
      courseId: 101,
      courseName: "鏁板",
      campusId: 22,
      sessionDate: "2026-04-21",
      weekday: 2,
      scheduledStartAt: "2026-04-21T08:00:00+08:00",
      scheduledEndAt: "2026-04-21T09:00:00+08:00",
      actualStartTime: "08:00",
      actualEndTime: "09:00",
      rollCallStartTime: "07:55",
      rollCallEndTime: "08:05",
      defaultRollCallStartTime: "07:55",
      defaultRollCallEndTime: "08:05",
      defaultRollCallStartOffsetMinutes: -5,
      defaultRollCallEndOffsetMinutes: 5,
      actualCustomized: false,
      rollCallCustomized: false,
    };

    expect(
      mapAdminTimeSettingDetail("attendance-window", setting, {
        targetDate: "2026-04-21",
        todayDate: "2026-04-23",
      }),
    ).toEqual(
      expect.objectContaining({
        targetDate: "2026-04-21",
        editable: false,
      }),
    );
  });

  it("formats the attendance-window highlight copy with the default range", () => {
    const setting: CourseSessionTimeSettingDto = {
      courseSessionId: 3001,
      courseId: 101,
      courseName: "数学",
      campusId: 22,
      sessionDate: "2026-04-14",
      weekday: 2,
      scheduledStartAt: "2026-04-14T16:00:00+08:00",
      scheduledEndAt: "2026-04-14T17:30:00+08:00",
      actualStartTime: "16:00",
      actualEndTime: "17:30",
      rollCallStartTime: "15:55",
      rollCallEndTime: "16:05",
      defaultRollCallStartTime: "15:55",
      defaultRollCallEndTime: "16:05",
      defaultRollCallStartOffsetMinutes: -5,
      defaultRollCallEndOffsetMinutes: 5,
      actualCustomized: false,
      rollCallCustomized: false,
    };

    expect(mapAdminTimeSettingDetail("attendance-window", setting)).toEqual(
      expect.objectContaining({
        highlightText: "默认点名时间为上课前后 5 分钟（15:55-16:05）",
      }),
    );
  });

  it("maps unarrived rows into homeroom-class groups for the baseline page", () => {
    const me: MeDto = {
      id: 2,
      phone: "13900139000",
      campusName: "南山校区",
    };
    const rows: AbsentStudentRowDto[] = [
      {
        courseSessionId: 3001,
        sessionStartAt: "2026-04-14T08:00:00+08:00",
        sessionEndAt: "2026-04-14T09:00:00+08:00",
        studentId: 1,
        studentName: "小明",
        homeroomClassId: 7,
        homeroomClassName: "一班",
        courseId: 101,
        courseName: "数学",
        teacherNames: "王老师",
        status: 0,
        attendanceSubmittedAt: "2026-04-14T08:30:00+08:00",
      },
    ];

    const data = mapAdminUnarrivedData({
      me,
      rows,
      courseContexts: new Map([
        [
          "101:3001",
          {
            roster: [
              {
                id: "1",
                name: "小明",
                homeroomClass: "一班",
                homeroomClassId: 7,
                status: "leave",
                managerUpdated: true,
              },
            ],
          },
        ],
      ]),
    });

    expect(data.campusLabel).toBe("南山校区");
    expect(data.dateLabel).toBe("2026/4/14（周二）");
    expect(data.referenceSessionStartAt).toBe("2026-04-14T08:00:00+08:00");
    expect(data.groups).toHaveLength(1);
    expect(data.groups[0]).toEqual(
      expect.objectContaining({
        label: "一班",
        meta: "",
      }),
    );
    expect(data.groups[0]?.students[0]).toEqual(
      expect.objectContaining({
        name: "小明",
        homeroomClass: "一班",
        courseId: "101",
        courseSessionId: "3001",
        courseName: "数学",
        note: "数学",
        status: "leave",
        managerUpdated: true,
      }),
    );
    expect(data.groups[0]?.students[0]?.id).toBe("1:101:3001");
    expect(data.groups[0]?.students[0]?.studentId).toBe("1");
    expect(data.totals.absent).toBe(1);
    expect(data.totals.expected).toBe(1);
  });

  it("keeps admin-adjusted present students visible in unarrived management", () => {
    const data = mapAdminUnarrivedData({
      me: {
        id: 2,
        phone: "13900139000",
        campusName: "南山校区",
      },
      rows: [
        {
          courseSessionId: 3001,
          sessionStartAt: "2026-04-14T08:00:00+08:00",
          sessionEndAt: "2026-04-14T09:00:00+08:00",
          studentId: 1,
          studentName: "小明",
          homeroomClassId: 7,
          homeroomClassName: "一班",
          courseId: 101,
          courseName: "数学",
          teacherNames: "王老师",
          status: 2,
          managerUpdated: true,
          attendanceSubmittedAt: "2026-04-14T08:40:00+08:00",
        },
      ],
      courseContexts: new Map(),
    });

    expect(data.groups).toHaveLength(1);
    expect(data.groups[0]?.students[0]).toEqual(
      expect.objectContaining({
        name: "小明",
        status: "present",
        managerUpdated: true,
      }),
    );
    expect(data.totals.present).toBe(1);
    expect(data.totals.expected).toBe(1);
  });

  it("keeps same-student multi-session rows distinct inside a homeroom group", () => {
    const data = mapAdminUnarrivedData({
      me: {
        id: 2,
        phone: "13900139000",
        campusName: "南山校区",
      },
      rows: [
        {
          courseSessionId: 3001,
          sessionStartAt: "2026-04-14T08:00:00+08:00",
          sessionEndAt: "2026-04-14T09:00:00+08:00",
          studentId: 1,
          studentName: "小明",
          homeroomClassId: 7,
          homeroomClassName: "一班",
          courseId: 101,
          courseName: "数学",
          teacherNames: "王老师",
          status: 0,
          attendanceSubmittedAt: "2026-04-14T08:30:00+08:00",
        },
        {
          courseSessionId: 3002,
          sessionStartAt: "2026-04-14T10:00:00+08:00",
          sessionEndAt: "2026-04-14T11:00:00+08:00",
          studentId: 1,
          studentName: "小明",
          homeroomClassId: 7,
          homeroomClassName: "一班",
          courseId: 102,
          courseName: "语文",
          teacherNames: "李老师",
          status: 1,
          attendanceSubmittedAt: "2026-04-14T10:30:00+08:00",
        },
      ],
      courseContexts: new Map([
        [
          "101:3001",
          {
            roster: [
              {
                id: "1",
                name: "小明",
                homeroomClass: "一班",
                homeroomClassId: 7,
                status: "absent",
              },
            ],
          },
        ],
        [
          "102:3002",
          {
            roster: [
              {
                id: "1",
                name: "小明",
                homeroomClass: "一班",
                homeroomClassId: 7,
                status: "leave",
              },
            ],
          },
        ],
      ]),
    });

    expect(data.groups).toHaveLength(1);
    expect(data.groups[0]?.students.map((student) => student.id)).toEqual([
      "1:101:3001",
      "1:102:3002",
    ]);
    expect(data.groups[0]?.students.map((student) => student.studentId)).toEqual(["1", "1"]);
    expect(data.groups[0]?.students.map((student) => student.status)).toEqual(["absent", "leave"]);
  });
});
