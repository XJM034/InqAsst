import { ApiRequestError } from "@/lib/services/http-core";

const {
  cookies,
  fetchAdminAbsentStudents,
  fetchAdminCampusClasses,
  fetchAdminCourseLatestAttendance,
  fetchAdminCourseSettingsOverview,
  fetchAdminCourseStudentDetail,
  fetchAdminCourseStudents,
  fetchAdminEmergencyWeekly,
  fetchAdminHomeSummary,
  fetchAdminMeProfile,
  fetchAdminRollCallOverview,
  fetchAdminTeacherSettingsOverview,
  fetchAdminTimeSettingsSessions,
  fetchCourseDetail,
  fetchCourseLatestAttendance,
  fetchCourseStudents,
  fetchMeProfile,
  fetchRollCallTeacher,
  fetchRollCallTeacherBatchOptions,
  fetchRollCallTeacherOptions,
  fetchTeacherHome,
  fetchTeacherTodaySessions,
  hasServerAuthToken,
} = vi.hoisted(() => ({
  cookies: vi.fn(),
  fetchAdminAbsentStudents: vi.fn(),
  fetchAdminCampusClasses: vi.fn(),
  fetchAdminCourseLatestAttendance: vi.fn(),
  fetchAdminCourseSettingsOverview: vi.fn(),
  fetchAdminCourseStudentDetail: vi.fn(),
  fetchAdminCourseStudents: vi.fn(),
  fetchAdminEmergencyWeekly: vi.fn(),
  fetchAdminHomeSummary: vi.fn(),
  fetchAdminMeProfile: vi.fn(),
  fetchAdminRollCallOverview: vi.fn(),
  fetchAdminTeacherSettingsOverview: vi.fn(),
  fetchAdminTimeSettingsSessions: vi.fn(),
  fetchCourseDetail: vi.fn(),
  fetchCourseLatestAttendance: vi.fn(),
  fetchCourseStudents: vi.fn(),
  fetchMeProfile: vi.fn(),
  fetchRollCallTeacher: vi.fn(),
  fetchRollCallTeacherBatchOptions: vi.fn(),
  fetchRollCallTeacherOptions: vi.fn(),
  fetchTeacherHome: vi.fn(),
  fetchTeacherTodaySessions: vi.fn(),
  hasServerAuthToken: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies,
}));

vi.mock("@/lib/services/http-server", () => ({
  hasServerAuthToken,
}));

vi.mock("@/lib/services/mobile-api", () => ({
  fetchAdminAbsentStudents,
  fetchAdminCampusClasses,
  fetchAdminCourseLatestAttendance,
  fetchAdminCourseSettingsOverview,
  fetchAdminCourseStudentDetail,
  fetchAdminCourseStudents,
  fetchAdminEmergencyWeekly,
  fetchAdminHomeSummary,
  fetchAdminMeProfile,
  fetchAdminRollCallOverview,
  fetchAdminTeacherSettingsOverview,
  fetchAdminTimeSettingsSessions,
  fetchCourseDetail,
  fetchCourseLatestAttendance,
  fetchCourseStudents,
  fetchMeProfile,
  fetchRollCallTeacher,
  fetchRollCallTeacherBatchOptions,
  fetchRollCallTeacherOptions,
  fetchTeacherHome,
  fetchTeacherTodaySessions,
}));

import {
  getAdminControlData,
  getAdminCourseStudentForm,
  getAdminEmergencyWeeklyData,
  getAdminHomeData,
  getAdminRollCallTeacherBatchData,
  getAdminTimeSettingDetail,
  getAdminTimeSettingsData,
  getAdminTeacherSettingCourse,
  getAdminTeacherSelection,
  getAdminUnarrivedData,
} from "@/lib/services/mobile-app";

describe("mobile-app student form loaders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookies.mockResolvedValue({
      get: vi.fn(() => undefined),
    });
    hasServerAuthToken.mockResolvedValue(true);
    fetchCourseDetail.mockResolvedValue({
      id: 101,
      name: "Robot AI",
      campusId: 22,
      location: "Default Room",
      sessions: [],
      teachers: [],
    });
    fetchAdminCampusClasses.mockResolvedValue([
      { id: 10, name: "Class 5-1" },
      { id: 11, name: "Class 5-2" },
    ]);
    fetchAdminTimeSettingsSessions.mockResolvedValue([]);
  });

  it("passes the Shanghai current date when loading admin home data", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17T16:30:00.000Z"));

    try {
      fetchAdminMeProfile.mockResolvedValue({
        id: 61,
        campusName: "Main Campus",
      });
      fetchAdminHomeSummary.mockResolvedValue({
        date: "2026-04-18",
        distinctCoursesWithSessionsToday: 1,
        sessionCountToday: 1,
        pendingRollCallSessions: 0,
        actualClassTimeRange: "08:00 - 10:00",
        rollCallTimeRange: "07:50-08:10",
        todaySubstituteCourseCount: 0,
        todaySubstituteTeacherCount: 0,
        rollCallWindowRuleCount: 1,
        rollCallRulesSummary: "Window ready",
      });

      await getAdminHomeData();

      expect(fetchAdminHomeSummary).toHaveBeenCalledWith("2026-04-18");
    } finally {
      vi.useRealTimers();
    }
  });

  it("falls back to an empty summary when admin home summary is null", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17T16:30:00.000Z"));

    try {
      fetchAdminMeProfile.mockResolvedValue({
        id: 61,
        campusName: "Main Campus",
      });
      fetchAdminHomeSummary.mockResolvedValue(null as never);

      await expect(getAdminHomeData()).resolves.toMatchObject({
        campusLabel: "Main Campus",
        effectiveRules: expect.arrayContaining([
          expect.objectContaining({
            label: "实际上课",
            value: "暂无实际上课",
          }),
          expect.objectContaining({
            label: "点名时间",
            value: "待配置",
          }),
        ]),
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("falls back to a default campus label when admin me profile is null", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17T16:30:00.000Z"));

    try {
      fetchAdminMeProfile.mockResolvedValue(null as never);
      fetchAdminHomeSummary.mockResolvedValue({
        date: "2026-04-18",
        distinctCoursesWithSessionsToday: 1,
        sessionCountToday: 1,
        pendingRollCallSessions: 0,
        actualClassTimeRange: "08:00 - 10:00",
        rollCallTimeRange: "07:50-08:10",
        todaySubstituteCourseCount: 0,
        todaySubstituteTeacherCount: 0,
        rollCallWindowRuleCount: 1,
        rollCallRulesSummary: "Window ready",
      });

      await expect(getAdminHomeData()).resolves.toMatchObject({
        campusLabel: "当前校区",
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("builds the create form from live course and class data", async () => {
    await expect(getAdminCourseStudentForm("101", "new")).resolves.toEqual(
      expect.objectContaining({
        courseId: "101",
        courseCampusId: 22,
        courseTitle: "Robot AI",
        courseContext: "Default Room",
        title: "新增学生",
        badge: "新建",
        submitLabel: "保存学生",
        nameValue: "",
        studentIdValue: "",
        homeroomClassId: null,
        homeroomClasses: [
          { id: 10, name: "Class 5-1" },
          { id: 11, name: "Class 5-2" },
        ],
        homeroomClassValue: "",
      }),
    );

    expect(fetchCourseDetail).toHaveBeenCalledWith(101);
    expect(fetchAdminCampusClasses).toHaveBeenCalledWith(22);
    expect(fetchAdminCourseStudentDetail).not.toHaveBeenCalled();
  });

  it("uses today's effective overview context when the selected course session has been schedule-adjusted", async () => {
    fetchCourseDetail.mockResolvedValue({
      id: 101,
      name: "Robot AI",
      campusId: 22,
      location: "Tuesday Room",
      sessions: [
        {
          id: 3001,
          startAt: "2026-04-15T16:00:00+08:00",
          endAt: "2026-04-15T17:00:00+08:00",
        },
      ],
      teachers: [{ teacherId: 7, name: "Tuesday Teacher" }],
    });
    fetchAdminCourseSettingsOverview.mockResolvedValue({
      date: "2026-04-15",
      defaultWeekday: 2,
      currentRuleMode: "ALTERNATE_DAY",
      alternateWeekday: 4,
      alternateRuleEnabled: true,
      temporaryCourseActionEnabled: true,
      saveEnabled: true,
      effectiveCourseCount: 1,
      courses: [
        {
          courseId: 101,
          sessionId: 3001,
          courseName: "Robot AI",
          location: "Thursday Room",
          sessionStartAt: "2026-04-15T18:00:00+08:00",
          sessionEndAt: "2026-04-15T19:00:00+08:00",
          effectiveTeacherId: 9,
          effectiveTeacherName: "Thursday Teacher",
          temporaryTeacherAssigned: false,
          scheduleAdjusted: true,
          scheduleAdjustmentType: "ALTERNATE_DAY",
          scheduleSourceWeekday: 4,
          scheduleSourceDate: "2026-04-17",
          studentCount: 28,
          courseStatus: "TODAY_ACTIVE",
          actionType: "REMOVE_FROM_TODAY",
          actionEnabled: true,
        },
      ],
    });

    const form = await getAdminCourseStudentForm("101", "new", "3001");

    expect(form).toEqual(expect.objectContaining({ courseId: "101", courseTitle: "Robot AI" }));
    expect(form?.courseContext).toContain("18:00-19:00");
    expect(form?.courseContext).toContain("Thursday Room");
    expect(form?.courseContext).toContain("Thursday Teacher");
    expect(form?.courseContext).toContain("28");
    expect(fetchAdminCourseSettingsOverview).toHaveBeenCalledTimes(1);
  });

  it("builds the edit form from live student detail data", async () => {
    fetchAdminCourseStudentDetail.mockResolvedValue({
      studentId: 7,
      externalStudentId: "STU-05231",
      studentName: "Student Seven",
      homeroomClassId: 10,
      homeroomClassName: "Class 10",
      enrolledInCourse: true,
    });

    await expect(getAdminCourseStudentForm("101", "7")).resolves.toEqual(
      expect.objectContaining({
        courseId: "101",
        studentId: "7",
        courseCampusId: 22,
        courseTitle: "Robot AI",
        courseContext: "Default Room",
        title: "编辑学生",
        badge: "编辑",
        submitLabel: "保存修改",
        nameValue: "Student Seven",
        studentIdValue: "7",
        homeroomClassId: 10,
        homeroomClasses: [
          { id: 10, name: "Class 5-1" },
          { id: 11, name: "Class 5-2" },
        ],
        homeroomClassValue: "Class 10",
      }),
    );

    expect(fetchAdminCourseStudentDetail).toHaveBeenCalledWith(101, 7);
  });

  it("returns null when the backend says the student is not in the course roster", async () => {
    fetchAdminCourseStudentDetail.mockRejectedValue(
      new ApiRequestError("student is not in course roster", 400),
    );

    await expect(getAdminCourseStudentForm("101", "7")).resolves.toBeNull();
  });

  it("returns null when the backend rejects the course or student access", async () => {
    fetchCourseDetail.mockRejectedValueOnce(new ApiRequestError("forbidden", 403));
    await expect(getAdminCourseStudentForm("101", "new")).resolves.toBeNull();

    fetchCourseDetail.mockResolvedValue({
      id: 101,
      name: "Robot AI",
      campusId: 22,
      location: "Default Room",
      sessions: [],
      teachers: [],
    });
    fetchAdminCourseStudentDetail.mockRejectedValueOnce(
      new ApiRequestError("student not found", 404),
    );

    await expect(getAdminCourseStudentForm("101", "8")).resolves.toBeNull();
  });

  it("builds admin control data without per-course detail fan-out", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-14T08:00:00.000Z"));

    try {
      fetchAdminMeProfile.mockResolvedValue({
        id: 61,
        campusName: "Main Campus",
      });
      fetchAdminRollCallOverview.mockResolvedValue([
        {
          courseId: 101,
          courseName: "Robot AI",
          sessionId: 3001,
          sessionStartAt: "2026-04-14T16:00:00+08:00",
          sessionEndAt: "2026-04-14T17:00:00+08:00",
          rollCallCompleted: false,
          shouldAttendCount: 12,
          presentCount: 8,
          leaveCount: 1,
          absentCount: 3,
          progressPercent: 75,
        },
      ]);
      fetchAdminEmergencyWeekly.mockResolvedValue({
        weekStart: "2026-04-13",
        selectedDayKey: "tue",
        featuredDateLabel: "4/14 周二",
        featuredCourse: null,
        days: [],
        courses: {
          items: [
            {
              courseId: 101,
              courseName: "Robot AI",
              dayKey: "tue",
              dayLabel: "周二",
              sessionDate: "2026-04-14",
              sessionId: 3001,
              sessionStartAt: "2026-04-14T16:00:00+08:00",
              sessionEndAt: "2026-04-14T17:00:00+08:00",
              sessionTimeLabel: "16:00-17:00",
              defaultTeacherId: 88,
              defaultTeacherName: "Teacher Kelly",
              defaultTeacherPhone: "13800138000",
              currentTeacherId: 88,
              currentTeacherName: "Teacher Kelly",
              currentTeacherPhone: "13800138000",
              currentTeacherExternal: false,
              temporaryTeacherAssigned: false,
              teacherChanged: false,
            },
          ],
          totalElements: 1,
          totalPages: 1,
          page: 0,
          size: 100,
        },
      });
      fetchAdminTimeSettingsSessions.mockResolvedValue([
        {
          courseSessionId: 3001,
          courseId: 101,
          courseName: "Robot AI",
          campusId: 22,
          sessionDate: "2026-04-14",
          weekday: 2,
          scheduledStartAt: "2026-04-14T16:00:00+08:00",
          scheduledEndAt: "2026-04-14T17:00:00+08:00",
          rollCallStartTime: "15:55:00",
          rollCallEndTime: "16:05:00",
          actualCustomized: false,
          rollCallCustomized: false,
        },
      ]);

      const data = await getAdminControlData();

      expect(data.pollingEnabled).toBe(true);
      expect(data.classes[0]).toEqual(
        expect.objectContaining({
          id: "101",
          name: "Robot AI",
          teacher: "Teacher Kelly · 13800138000",
          completion: 75,
        }),
      );
      expect(fetchAdminEmergencyWeekly).toHaveBeenCalledWith({
        weekStart: "2026-04-13",
        dayKey: "tue",
        size: 100,
        page: 0,
      });
      expect(fetchAdminTimeSettingsSessions).toHaveBeenCalledWith({
        date: "2026-04-14",
      });
      expect(fetchAdminTeacherSettingsOverview).not.toHaveBeenCalled();
      expect(fetchCourseDetail).not.toHaveBeenCalled();
      expect(fetchRollCallTeacher).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("disables admin control polling outside the roll-call time window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-14T08:20:00.000Z"));

    try {
      fetchAdminMeProfile.mockResolvedValue({
        id: 61,
        campusName: "Main Campus",
      });
      fetchAdminRollCallOverview.mockResolvedValue([]);
      fetchAdminEmergencyWeekly.mockResolvedValue({
        weekStart: "2026-04-13",
        selectedDayKey: "tue",
        featuredDateLabel: "4/14 鍛ㄤ簩",
        featuredCourse: null,
        days: [],
        courses: {
          items: [],
          totalElements: 0,
          totalPages: 0,
          page: 0,
          size: 100,
        },
      });
      fetchAdminTimeSettingsSessions.mockResolvedValue([
        {
          courseSessionId: 3001,
          courseId: 101,
          courseName: "Robot AI",
          campusId: 22,
          sessionDate: "2026-04-14",
          weekday: 2,
          scheduledStartAt: "2026-04-14T16:00:00+08:00",
          scheduledEndAt: "2026-04-14T17:00:00+08:00",
          rollCallStartTime: "15:55:00",
          rollCallEndTime: "16:05:00",
          actualCustomized: false,
          rollCallCustomized: false,
        },
      ]);

      const data = await getAdminControlData();

      expect(data.pollingEnabled).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps admin control usable when emergency weekly returns null data", async () => {
    fetchAdminMeProfile.mockResolvedValue({
      id: 61,
      campusName: "Main Campus",
    });
    fetchAdminRollCallOverview.mockResolvedValue([
      {
        courseId: 101,
        courseName: "Robot AI",
        sessionId: 3001,
        sessionStartAt: "2026-04-14T16:00:00+08:00",
        sessionEndAt: "2026-04-14T17:00:00+08:00",
        rollCallCompleted: false,
        shouldAttendCount: 12,
        presentCount: 8,
        leaveCount: 1,
        absentCount: 3,
        progressPercent: 75,
      },
    ]);
    fetchAdminEmergencyWeekly.mockResolvedValue(null);

    const data = await getAdminControlData();

    expect(data.classes[0]).toEqual(
      expect.objectContaining({
        id: "101",
        name: "Robot AI",
        teacher: "待分配老师",
      }),
    );
  });

  it("builds unarrived data without preloading every course roster", async () => {
    fetchAdminMeProfile.mockResolvedValue({
      id: 61,
      campusName: "Main Campus",
    });
    fetchAdminAbsentStudents.mockResolvedValue([
      {
        courseSessionId: 3001,
        sessionStartAt: "2026-04-14T16:00:00+08:00",
        sessionEndAt: "2026-04-14T17:00:00+08:00",
        studentId: 7,
        studentName: "Student Seven",
        homeroomClassId: 10,
        homeroomClassName: "Class 10",
        courseId: 101,
        courseName: "Robot AI",
        teacherNames: "Teacher Kelly",
        status: 0,
        attendanceSubmittedAt: null,
      },
    ]);

    const data = await getAdminUnarrivedData();

    expect(data.groups[0]).toEqual(
      expect.objectContaining({
        id: "class:10",
        label: "Class 10",
        meta: "",
        students: [
          expect.objectContaining({
            id: "7:101:3001",
            studentId: "7",
            courseId: "101",
            courseSessionId: "3001",
            courseName: "Robot AI",
            note: "Robot AI",
          }),
        ],
      }),
    );
    expect(fetchCourseDetail).not.toHaveBeenCalled();
    expect(fetchAdminCourseStudents).not.toHaveBeenCalled();
    expect(fetchAdminCourseLatestAttendance).not.toHaveBeenCalled();
    expect(fetchRollCallTeacher).not.toHaveBeenCalled();
  });

  it("builds emergency weekly data from the aggregate endpoint without detail fan-out", async () => {
    fetchAdminEmergencyWeekly.mockImplementation(async ({ page }) => ({
      weekStart: "2026-04-13",
      selectedDayKey: "wed",
      featuredDateLabel: "Today emergency schedule - 4.16",
      featuredCourse: null,
      days: [
        {
          key: "mon",
          label: "Mon",
          date: "2026-04-13",
          courseCount: 4,
          changedCourseCount: 1,
          active: false,
        },
        {
          key: "wed",
          label: "Wed",
          date: "2026-04-15",
          courseCount: 6,
          changedCourseCount: 2,
          active: true,
        },
      ],
      courses: {
        items:
          page === 0
            ? [
                {
                  courseId: 101,
                  sessionId: 3001,
                  courseName: "Robot AI",
                  dayKey: "wed",
                  dayLabel: "Wed",
                  sessionDate: "2026-04-16",
                  sessionStartAt: "2026-04-16T16:00:00+08:00",
                  sessionEndAt: "2026-04-16T17:00:00+08:00",
                  sessionTimeLabel: "16:00-17:00",
                  location: "Room 205",
                  defaultTeacherId: 88,
                  defaultTeacherName: "Teacher Li",
                  defaultTeacherPhone: "13800138000",
                  currentTeacherId: 89,
                  currentTeacherName: "Teacher Wang",
                  currentTeacherPhone: "13900139000",
                  currentTeacherExternal: false,
                  temporaryTeacherAssigned: true,
                  teacherChanged: true,
                },
                {
                  courseId: 102,
                  sessionId: 3002,
                  courseName: "Creative Art",
                  dayKey: "wed",
                  dayLabel: "Wed",
                  sessionDate: "2026-04-16",
                  sessionStartAt: "2026-04-16T17:00:00+08:00",
                  sessionEndAt: "2026-04-16T18:00:00+08:00",
                  sessionTimeLabel: "17:00-18:00",
                  location: "Room 101",
                  defaultTeacherId: 90,
                  defaultTeacherName: "Teacher Chen",
                  defaultTeacherPhone: "13700137000",
                  currentTeacherId: 90,
                  currentTeacherName: "Teacher Chen",
                  currentTeacherPhone: "13700137000",
                  currentTeacherExternal: false,
                  temporaryTeacherAssigned: false,
                  teacherChanged: false,
                },
              ]
            : [
                {
                  courseId: 103,
                  sessionId: 3003,
                  courseName: "Basketball",
                  dayKey: "wed",
                  dayLabel: "Wed",
                  sessionDate: "2026-04-16",
                  sessionStartAt: "2026-04-16T18:00:00+08:00",
                  sessionEndAt: "2026-04-16T19:00:00+08:00",
                  sessionTimeLabel: "18:00-19:00",
                  location: "Court A",
                  defaultTeacherId: 91,
                  defaultTeacherName: "Teacher Sun",
                  defaultTeacherPhone: "13600136000",
                  currentTeacherId: 92,
                  currentTeacherName: "Coach Zhao",
                  currentTeacherPhone: "13500135000",
                  currentTeacherExternal: true,
                  temporaryTeacherAssigned: true,
                  teacherChanged: true,
                },
                {
                  courseId: 104,
                  sessionId: 3004,
                  courseName: "Choir",
                  dayKey: "wed",
                  dayLabel: "Wed",
                  sessionDate: "2026-04-16",
                  sessionStartAt: "2026-04-16T19:00:00+08:00",
                  sessionEndAt: "2026-04-16T20:00:00+08:00",
                  sessionTimeLabel: "19:00-20:00",
                  location: "Music Hall",
                  defaultTeacherId: 93,
                  defaultTeacherName: "Teacher Qian",
                  defaultTeacherPhone: "13400134000",
                  currentTeacherId: 93,
                  currentTeacherName: "Teacher Qian",
                  currentTeacherPhone: "13400134000",
                  currentTeacherExternal: false,
                  temporaryTeacherAssigned: false,
                  teacherChanged: false,
                },
              ],
        totalElements: 4,
        totalPages: 2,
        page: page ?? 0,
        size: 20,
      },
    }));

    const data = await getAdminEmergencyWeeklyData({
      weekStart: "2026-04-13",
      dayKey: "wed",
      q: "robot",
      page: 0,
      size: 1,
    });

    expect(data.days).toEqual([
      {
        key: "mon",
        label: "Mon",
        date: "2026-04-13",
        courseCount: 4,
        changedCourseCount: 1,
        active: false,
      },
      {
        key: "wed",
        label: "Wed",
        date: "2026-04-15",
        courseCount: 6,
        changedCourseCount: 2,
        active: true,
      },
    ]);
    expect(data.selectedDayKey).toBe("wed");
    expect(data.featuredDateLabel).toBe("Today emergency schedule - 4.16");
    expect(data.featuredCourses).toEqual([
      expect.objectContaining({
        courseId: "101",
        sessionId: "3001",
        title: "Robot AI",
        href: "/admin/emergency/course/_?courseId=101&courseSessionId=3001",
        teacherChanged: true,
        temporaryTeacherAssigned: true,
      }),
      expect.objectContaining({
        courseId: "103",
        sessionId: "3003",
        title: "Basketball",
        href: "/admin/emergency/course/_?courseId=103&courseSessionId=3003",
        teacherChanged: true,
        temporaryTeacherAssigned: true,
      }),
    ]);
    expect(data.featuredCourses[0]?.meta).toContain("16:00-17:00");
    expect(data.featuredCourses[0]?.meta).toContain("13900139000");
    expect(data.featuredCourses[0]).toEqual(
      expect.objectContaining({
        currentTeacherName: "Teacher Wang",
        currentTeacherPhone: "13900139000",
        defaultTeacherName: "Teacher Li",
        defaultTeacherPhone: "13800138000",
        locationLabel: "Room 205",
        sessionTimeLabel: "16:00-17:00",
      }),
    );
    expect(data.courses).toEqual(
      expect.objectContaining({
        page: 0,
        size: 1,
        totalPages: 2,
        totalElements: 2,
        hasNextPage: true,
        hasPrevPage: false,
      }),
    );
    expect(data.courses.items).toEqual([
      expect.objectContaining({
        courseId: "102",
        sessionId: "3002",
        title: "Creative Art",
        href: "/admin/emergency/course/_?courseId=102&courseSessionId=3002",
        teacherChanged: false,
        temporaryTeacherAssigned: false,
      }),
    ]);
    expect(data.courses.items[0]?.meta).toContain("17:00-18:00");
    expect(data.courses.items[0]?.meta).toContain("13700137000");

    expect(fetchAdminEmergencyWeekly).toHaveBeenNthCalledWith(1, {
      weekStart: "2026-04-13",
      dayKey: "wed",
      q: "robot",
      page: 0,
      size: 1,
    });
    expect(fetchAdminEmergencyWeekly).toHaveBeenNthCalledWith(2, {
      weekStart: "2026-04-13",
      dayKey: "wed",
      q: "robot",
      page: 1,
      size: 1,
    });
    expect(fetchCourseDetail).not.toHaveBeenCalled();
    expect(fetchRollCallTeacher).not.toHaveBeenCalled();
  });

  it("preserves saturday day keys from the aggregate emergency endpoint", async () => {
    fetchAdminEmergencyWeekly.mockResolvedValue({
      weekStart: "2026-04-13",
      selectedDayKey: "sat",
      featuredDateLabel: "Weekend emergency schedule - 4.18",
      featuredCourse: null,
      days: [
        {
          key: "sat",
          label: "Sat",
          date: "2026-04-18",
          courseCount: 2,
          changedCourseCount: 1,
          active: true,
        },
        {
          key: "sun",
          label: "Sun",
          date: "2026-04-19",
          courseCount: 1,
          changedCourseCount: 0,
          active: false,
        },
      ],
      courses: {
        items: [
          {
            courseId: 201,
            sessionId: 3201,
            courseName: "Weekend Robot",
            dayKey: "sat",
            dayLabel: "Sat",
            sessionDate: "2026-04-18",
            sessionStartAt: "2026-04-18T09:00:00+08:00",
            sessionEndAt: "2026-04-18T10:30:00+08:00",
            sessionTimeLabel: "09:00-10:30",
            location: "Weekend Lab",
            defaultTeacherId: 88,
            defaultTeacherName: "Teacher Li",
            defaultTeacherPhone: "13800138000",
            currentTeacherId: 88,
            currentTeacherName: "Teacher Li",
            currentTeacherPhone: "13800138000",
            currentTeacherExternal: false,
            temporaryTeacherAssigned: false,
            teacherChanged: false,
          },
        ],
        totalElements: 1,
        totalPages: 1,
        page: 0,
        size: 20,
      },
    });

    const data = await getAdminEmergencyWeeklyData({
      weekStart: "2026-04-13",
      dayKey: "sat",
      page: 0,
      size: 20,
    });

    expect(data.selectedDayKey).toBe("sat");
    expect(data.days).toEqual([
      expect.objectContaining({ key: "sat", active: true }),
      expect.objectContaining({ key: "sun", active: false }),
    ]);
    expect(data.courses.items[0]).toEqual(
      expect.objectContaining({
        courseId: "201",
        sessionId: "3201",
        title: "Weekend Robot",
      }),
    );
  });

  it("loads teacher selection with ALL candidates and prioritizes selected then external teachers", async () => {
    fetchCourseDetail.mockResolvedValue({
      id: 101,
      name: "Robot AI",
      campusId: 22,
      location: "Room 205",
      sessions: [
        {
          id: 3001,
          startAt: "2026-04-16T16:00:00+08:00",
          endAt: "2026-04-16T17:00:00+08:00",
        },
      ],
      teachers: [],
    });
    fetchRollCallTeacher.mockResolvedValue({
      defaultTeacherId: 88,
      defaultTeacherName: "Teacher Li",
      defaultTeacherPhone: "13800138000",
      currentTeacherId: 99,
      currentTeacherName: "Coach Zhao",
      currentTeacherPhone: "13500135000",
      currentTeacherExternal: true,
      temporaryTeacherAssigned: true,
    });
    fetchRollCallTeacherOptions.mockResolvedValue({
      items: [
        {
          teacherId: 88,
          teacherName: "Teacher Li",
          phone: "13800138000",
          defaultTeacher: true,
          selected: false,
          externalTeacher: false,
        },
        {
          teacherId: 99,
          teacherName: "Coach Zhao",
          phone: "13500135000",
          defaultTeacher: false,
          selected: true,
          externalTeacher: true,
        },
        {
          teacherId: 77,
          teacherName: "External Wang",
          phone: "13600136000",
          defaultTeacher: false,
          selected: false,
          externalTeacher: true,
        },
      ],
      totalElements: 3,
      totalPages: 1,
      page: 0,
      size: 20,
    });

    const data = await getAdminTeacherSelection("101", "3001");

    expect(fetchRollCallTeacherOptions).toHaveBeenCalledWith(3001, {
      teacherType: "ALL",
      q: "",
      page: 0,
      size: 20,
    });
    expect(data?.teacherType).toBe("ALL");
    expect(data?.currentTeacherLabel).toBe("Coach Zhao · 13500135000");
    expect(data?.defaultTeacherLabel).toBe("Teacher Li · 13800138000");
    expect(data?.teachers.map((teacher) => teacher.id)).toEqual(["99", "88", "77"]);
    expect(data?.teachers[0]).toEqual(
      expect.objectContaining({
        id: "99",
        source: "external",
        manual: true,
        badges: ["系统外老师", "当前代课"],
      }),
    );
    expect(data?.teachers[1]).toEqual(
      expect.objectContaining({
        id: "88",
        source: "internal",
        manual: false,
        badges: ["系统老师"],
      }),
    );
    expect(data?.teachers[2]).toEqual(
      expect.objectContaining({
        id: "77",
        source: "external",
        manual: true,
        badges: ["系统外老师"],
      }),
    );
  });

  it("keeps the real default teacher label even when the filtered options do not include the default teacher", async () => {
    fetchCourseDetail.mockResolvedValue({
      id: 101,
      name: "Robot AI",
      campusId: 22,
      location: "Room 205",
      sessions: [
        {
          id: 3001,
          startAt: "2026-04-16T16:00:00+08:00",
          endAt: "2026-04-16T17:00:00+08:00",
        },
      ],
      teachers: [],
    });
    fetchRollCallTeacher.mockResolvedValue({
      defaultTeacherId: 88,
      defaultTeacherName: "Teacher Li",
      defaultTeacherPhone: "13800138000",
      currentTeacherId: 99,
      currentTeacherName: "Coach Zhao",
      currentTeacherPhone: "13500135000",
      currentTeacherExternal: true,
      temporaryTeacherAssigned: true,
    });
    fetchRollCallTeacherOptions.mockResolvedValue({
      items: [
        {
          teacherId: 99,
          teacherName: "Coach Zhao",
          phone: "13500135000",
          defaultTeacher: false,
          selected: true,
          externalTeacher: true,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      page: 0,
      size: 20,
    });

    const data = await getAdminTeacherSelection("101", "3001", {
      q: "zhao",
    });

    expect(data?.currentTeacherLabel).toBe("Coach Zhao · 13500135000");
    expect(data?.defaultTeacherLabel).toBe("Teacher Li · 13800138000");
  });

  it("marks overlapping same-slot internal teachers as swappable in the normal selection flow", async () => {
    fetchCourseDetail.mockResolvedValue({
      id: 101,
      name: "Robot AI",
      campusId: 22,
      location: "Room 205",
      sessions: [
        {
          id: 3001,
          startAt: "2026-04-16T16:00:00+08:00",
          endAt: "2026-04-16T17:00:00+08:00",
        },
      ],
      teachers: [],
    });
    fetchRollCallTeacher.mockResolvedValue({
      defaultTeacherId: 88,
      defaultTeacherName: "Teacher Li",
      defaultTeacherPhone: "13800138000",
      currentTeacherId: 88,
      currentTeacherName: "Teacher Li",
      currentTeacherPhone: "13800138000",
      currentTeacherExternal: false,
      temporaryTeacherAssigned: false,
    });
    fetchRollCallTeacherOptions.mockResolvedValue({
      items: [
        {
          teacherId: 88,
          teacherName: "Teacher Li",
          phone: "13800138000",
          defaultTeacher: true,
          selected: true,
          externalTeacher: false,
        },
        {
          teacherId: 90,
          teacherName: "Teacher Chen",
          phone: "13700137000",
          defaultTeacher: false,
          selected: false,
          externalTeacher: false,
        },
        {
          teacherId: 91,
          teacherName: "Teacher Sun",
          phone: "13600136000",
          defaultTeacher: false,
          selected: false,
          externalTeacher: false,
        },
      ],
      totalElements: 3,
      totalPages: 1,
      page: 0,
      size: 20,
    });
    fetchAdminTeacherSettingsOverview.mockResolvedValue([
      {
        courseId: 101,
        courseName: "Robot AI",
        sessionId: 3001,
        sessionStartAt: "2026-04-16T16:00:00+08:00",
        sessionEndAt: "2026-04-16T17:00:00+08:00",
        defaultTeacherId: 88,
        defaultTeacherName: "Teacher Li",
        rollCallTeacherId: 88,
        rollCallTeacherName: "Teacher Li",
        temporaryTeacherAssigned: false,
      },
      {
        courseId: 102,
        courseName: "Creative Art",
        sessionId: 3002,
        sessionStartAt: "2026-04-16T16:30:00+08:00",
        sessionEndAt: "2026-04-16T17:30:00+08:00",
        defaultTeacherId: 90,
        defaultTeacherName: "Teacher Chen",
        rollCallTeacherId: 90,
        rollCallTeacherName: "Teacher Chen",
        temporaryTeacherAssigned: false,
      },
      {
        courseId: 103,
        courseName: "Basketball",
        sessionId: 3003,
        sessionStartAt: "2026-04-16T18:00:00+08:00",
        sessionEndAt: "2026-04-16T19:00:00+08:00",
        defaultTeacherId: 91,
        defaultTeacherName: "Teacher Sun",
        rollCallTeacherId: 91,
        rollCallTeacherName: "Teacher Sun",
        temporaryTeacherAssigned: false,
      },
    ]);

    const data = await getAdminTeacherSelection("101", "3001");
    const swappableTeacher = data?.teachers.find((teacher) => teacher.id === "90");
    const regularTeacher = data?.teachers.find((teacher) => teacher.id === "91");

    expect(fetchAdminTeacherSettingsOverview).toHaveBeenCalledWith("2026-04-13");
    expect(data?.sessionDate).toBe("2026-04-16");
    expect(data?.currentTeacherId).toBe("88");
    expect(data?.currentTeacherSource).toBe("internal");
    expect(swappableTeacher).toEqual(
      expect.objectContaining({
        id: "90",
        badges: ["系统老师", "可互换", "可合班"],
        note: "Creative Art 16:30-17:30",
        swapTargets: [
          expect.objectContaining({
            courseSessionId: "3002",
            courseTitle: "Creative Art",
            dayLabel: "周四",
            sessionTimeLabel: "16:30-17:30",
          }),
        ],
      }),
    );
    expect(regularTeacher?.swapTargets).toEqual([]);
  });

  it("uses today's effective session timing when deciding whether a teacher is swappable", async () => {
    fetchCourseDetail.mockResolvedValue({
      id: 4853,
      name: "【赛】无人机第一视角竞速",
      campusId: 22,
      location: "综合楼6楼舞蹈教室1",
      sessions: [
        {
          id: 4164,
          startAt: "2026-04-24T13:55:00+08:00",
          endAt: "2026-04-24T18:35:00+08:00",
        },
      ],
      teachers: [],
    });
    fetchAdminCourseSettingsOverview.mockResolvedValue({
      date: "2026-04-22",
      defaultWeekday: 3,
      currentRuleMode: "DEFAULT",
      alternateWeekday: 0,
      alternateRuleEnabled: false,
      temporaryCourseActionEnabled: true,
      saveEnabled: true,
      effectiveCourseCount: 2,
      courses: [
        {
          courseId: 4853,
          sessionId: 4164,
          courseName: "【赛】无人机第一视角竞速",
          location: "综合楼6楼舞蹈教室1",
          sessionStartAt: "2026-04-22T13:55:00+08:00",
          sessionEndAt: "2026-04-22T18:35:00+08:00",
          effectiveTeacherId: 701,
          effectiveTeacherName: "胡锡沛",
          temporaryTeacherAssigned: false,
          scheduleAdjusted: true,
          scheduleAdjustmentType: "TEMPORARY",
          studentCount: 12,
          courseStatus: "TODAY_ACTIVE",
          actionType: "REMOVE_FROM_TODAY",
          actionEnabled: true,
        },
      ],
    });
    fetchRollCallTeacher.mockResolvedValue({
      defaultTeacherId: 701,
      defaultTeacherName: "胡锡沛",
      defaultTeacherPhone: "18040394198",
      currentTeacherId: 701,
      currentTeacherName: "胡锡沛",
      currentTeacherPhone: "18040394198",
      currentTeacherExternal: false,
      temporaryTeacherAssigned: false,
    });
    fetchRollCallTeacherOptions.mockResolvedValue({
      items: [
        {
          teacherId: 701,
          teacherName: "胡锡沛",
          phone: "18040394198",
          defaultTeacher: true,
          selected: true,
          externalTeacher: false,
        },
        {
          teacherId: 702,
          teacherName: "李佳佳",
          phone: "17721864995",
          defaultTeacher: false,
          selected: false,
          externalTeacher: false,
        },
      ],
      totalElements: 2,
      totalPages: 1,
      page: 0,
      size: 20,
    });
    fetchAdminTeacherSettingsOverview.mockResolvedValue([
      {
        courseId: 4853,
        courseName: "【赛】无人机第一视角竞速",
        sessionId: 4164,
        sessionStartAt: "2026-04-22T13:55:00+08:00",
        sessionEndAt: "2026-04-22T18:35:00+08:00",
        defaultTeacherId: 701,
        defaultTeacherName: "胡锡沛",
        rollCallTeacherId: 701,
        rollCallTeacherName: "胡锡沛",
        temporaryTeacherAssigned: false,
      },
      {
        courseId: 4900,
        courseName: "AI人工智能",
        sessionId: 4165,
        sessionStartAt: "2026-04-22T13:55:00+08:00",
        sessionEndAt: "2026-04-22T18:35:00+08:00",
        defaultTeacherId: 702,
        defaultTeacherName: "李佳佳",
        rollCallTeacherId: 702,
        rollCallTeacherName: "李佳佳",
        temporaryTeacherAssigned: false,
      },
      {
        courseId: 4910,
        courseName: "古典舞",
        sessionId: 4166,
        sessionStartAt: "2026-04-24T10:00:00+08:00",
        sessionEndAt: "2026-04-24T11:00:00+08:00",
        defaultTeacherId: 702,
        defaultTeacherName: "李佳佳",
        rollCallTeacherId: 702,
        rollCallTeacherName: "李佳佳",
        temporaryTeacherAssigned: false,
      },
    ]);

    const data = await getAdminTeacherSelection("4853", "4164");
    const swappableTeacher = data?.teachers.find((teacher) => teacher.id === "702");

    expect(fetchAdminTeacherSettingsOverview).toHaveBeenCalledWith("2026-04-20");
    expect(data?.courseMeta).toContain("13:55-18:35");
    expect(data?.sessionDate).toBe("2026-04-22");
    expect(swappableTeacher).toEqual(
      expect.objectContaining({
        id: "702",
        badges: ["系统老师", "可互换", "可合班"],
        note: "AI人工智能 13:55-18:35",
        swapTargets: [
          expect.objectContaining({
            courseSessionId: "4165",
            courseTitle: "AI人工智能",
            dayLabel: "周三",
            sessionTimeLabel: "13:55-18:35",
          }),
        ],
      }),
    );
  });

  it("builds batch teacher reassignment data with internal options and restore-default fallback", async () => {
    fetchRollCallTeacherBatchOptions.mockResolvedValue({
      sessionDate: "2026-04-22",
      items: [
        {
          courseSessionId: 3001,
          teachers: {
            items: [
              {
                teacherId: 88,
                teacherName: "Teacher Li",
                phone: "13800138000",
                defaultTeacher: true,
                selected: false,
                externalTeacher: false,
              },
              {
                teacherId: 89,
                teacherName: "Teacher Wang",
                phone: "13900139000",
                defaultTeacher: false,
                selected: true,
                externalTeacher: false,
              },
            ],
            totalElements: 2,
            totalPages: 1,
            page: 0,
            size: 100,
          },
        },
        {
          courseSessionId: 3002,
          teachers: {
            items: [
              {
                teacherId: 90,
                teacherName: "Teacher Chen",
                phone: "13700137000",
                defaultTeacher: true,
                selected: false,
                externalTeacher: false,
              },
              {
                teacherId: 91,
                teacherName: "Teacher Sun",
                phone: "13600136000",
                defaultTeacher: false,
                selected: false,
                externalTeacher: false,
              },
            ],
            totalElements: 2,
            totalPages: 1,
            page: 0,
            size: 100,
          },
        },
      ],
    });

    const data = await getAdminRollCallTeacherBatchData([
      {
        courseId: "101",
        sessionId: "3001",
        title: "Robot AI",
        meta: "Room 205 · 16:00-17:00 · Teacher Wang",
        href: "/admin/emergency/course/_?courseId=101&courseSessionId=3001",
        sessionDate: "2026-04-22",
        sessionTimeLabel: "16:00-17:00",
        locationLabel: "Room 205",
        currentTeacherId: "89",
        currentTeacherName: "Teacher Wang",
        currentTeacherPhone: "13900139000",
        currentTeacherExternal: false,
        defaultTeacherId: "88",
        defaultTeacherName: "Teacher Li",
        defaultTeacherPhone: "13800138000",
        temporaryTeacherAssigned: true,
      },
      {
        courseId: "102",
        sessionId: "3002",
        title: "Creative Art",
        meta: "Room 101 · 17:00-18:00 · 外部老师",
        href: "/admin/emergency/course/_?courseId=102&courseSessionId=3002",
        sessionDate: "2026-04-22",
        sessionTimeLabel: "17:00-18:00",
        locationLabel: "Room 101",
        currentTeacherName: "Coach Zhao",
        currentTeacherPhone: "13500135000",
        currentTeacherExternal: true,
        defaultTeacherId: "90",
        defaultTeacherName: "Teacher Chen",
        defaultTeacherPhone: "13700137000",
        temporaryTeacherAssigned: true,
      },
    ]);

    expect(fetchRollCallTeacherBatchOptions).toHaveBeenCalledWith({
      sessionDate: "2026-04-22",
      courseSessionIds: [3001, 3002],
      q: undefined,
      page: 0,
      size: 100,
    });
    expect(data).toEqual(
      expect.objectContaining({
        sessionDate: "2026-04-22",
        courseCount: 2,
        courses: [
          expect.objectContaining({
            sessionId: "3001",
            currentTeacherLabel: "Teacher Wang · 13900139000",
            defaultTeacherLabel: "Teacher Li · 13800138000",
            initialTargetTeacherId: "89",
            teacherOptions: [
              expect.objectContaining({
                id: "88",
                note: "默认老师",
              }),
              expect.objectContaining({
                id: "89",
                note: "当前点名老师",
              }),
            ],
          }),
          expect.objectContaining({
            sessionId: "3002",
            currentTeacherLabel: "Coach Zhao · 13500135000",
            defaultTeacherLabel: "Teacher Chen · 13700137000",
            initialTargetTeacherId: "90",
            teacherOptions: [
              expect.objectContaining({
                id: "90",
                note: "默认老师",
              }),
              expect.objectContaining({
                id: "91",
                note: "系统内老师",
              }),
            ],
          }),
        ],
      }),
    );
  });

  it("shows a friendly error when batch teacher options are unavailable", async () => {
    fetchRollCallTeacherBatchOptions.mockResolvedValue(null);

    await expect(
      getAdminRollCallTeacherBatchData([
        {
          courseId: "101",
          sessionId: "3001",
          title: "Robot AI",
          meta: "Room 205 · 16:00-17:00 · Teacher Wang",
          href: "/admin/emergency/course/_?courseId=101&courseSessionId=3001",
          sessionDate: "2026-04-22",
          sessionTimeLabel: "16:00-17:00",
          locationLabel: "Room 205",
          currentTeacherId: "89",
          currentTeacherName: "Teacher Wang",
          currentTeacherPhone: "13900139000",
          currentTeacherExternal: false,
          defaultTeacherId: "88",
          defaultTeacherName: "Teacher Li",
          defaultTeacherPhone: "13800138000",
          temporaryTeacherAssigned: true,
        },
        {
          courseId: "102",
          sessionId: "3002",
          title: "Creative Art",
          meta: "Room 101 · 17:00-18:00 · Teacher Chen",
          href: "/admin/emergency/course/_?courseId=102&courseSessionId=3002",
          sessionDate: "2026-04-22",
          sessionTimeLabel: "17:00-18:00",
          locationLabel: "Room 101",
          currentTeacherId: "90",
          currentTeacherName: "Teacher Chen",
          currentTeacherPhone: "13700137000",
          currentTeacherExternal: false,
          defaultTeacherId: "90",
          defaultTeacherName: "Teacher Chen",
          defaultTeacherPhone: "13700137000",
          temporaryTeacherAssigned: false,
        },
      ]),
    ).rejects.toThrow("共享开发环境暂未返回批量互换候选数据，请先继续使用单课更换老师");
  });

  it("loads admin time settings for the selected in-week target date", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-22T01:00:00.000Z"));

    try {
      fetchAdminTimeSettingsSessions.mockResolvedValue([
        {
          courseSessionId: 3001,
          courseId: 101,
          courseName: "数学",
          campusId: 22,
          sessionDate: "2026-04-24",
          weekday: 5,
          scheduledStartAt: "2026-04-24T08:00:00+08:00",
          scheduledEndAt: "2026-04-24T09:00:00+08:00",
          actualStartTime: "08:00",
          actualEndTime: "09:00",
          rollCallStartTime: "07:55",
          rollCallEndTime: "08:05",
          defaultRollCallStartTime: "07:55",
          defaultRollCallEndTime: "08:05",
          defaultRollCallStartOffsetMinutes: -5,
          defaultRollCallEndOffsetMinutes: 5,
          actualCustomized: false,
          rollCallCustomized: true,
        },
      ]);

      await getAdminTimeSettingsData("2026-04-24");

      expect(fetchAdminTimeSettingsSessions).toHaveBeenCalledWith({
        date: "2026-04-24",
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps past in-week admin time-setting detail requests viewable", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-22T01:00:00.000Z"));

    try {
      fetchAdminTimeSettingsSessions.mockResolvedValue([
        {
          courseSessionId: 3001,
          courseId: 101,
          courseName: "数学",
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
          rollCallCustomized: true,
        },
      ]);

      await getAdminTimeSettingDetail("attendance-window", "2026-04-21");

      expect(fetchAdminTimeSettingsSessions).toHaveBeenCalledWith({
        date: "2026-04-21",
      });
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("mobile-app teacher setting course", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchCourseDetail.mockResolvedValue({
      id: 4078,
      name: "管弦乐团",
      campusId: 144,
      location: "上课地点待定",
      sessions: [
        {
          id: 3269,
          startAt: "2026-04-23T12:40:00+08:00",
          endAt: "2026-04-23T13:50:00+08:00",
        },
      ],
      teachers: [],
    });
    fetchRollCallTeacherOptions.mockResolvedValue({
      items: [
        {
          teacherId: 2616,
          teacherName: "赵星森",
          phone: "13778098407",
          defaultTeacher: true,
          selected: false,
          externalTeacher: false,
        },
        {
          teacherId: 2626,
          teacherName: "高鑫宇",
          phone: "18982201358",
          defaultTeacher: false,
          selected: true,
          externalTeacher: false,
        },
      ],
      totalElements: 2,
      totalPages: 1,
      page: 0,
      size: 20,
    });
  });

  it("maps swap restore target for teacher setting course", async () => {
    fetchRollCallTeacher.mockResolvedValue({
      defaultTeacherId: 2616,
      defaultTeacherName: "赵星森",
      defaultTeacherPhone: "13778098407",
      currentTeacherId: 2626,
      currentTeacherName: "高鑫宇",
      currentTeacherPhone: "18982201358",
      temporaryTeacherAssigned: true,
      swapRestoreTarget: {
        courseId: 4080,
        courseSessionId: 4541,
        courseName: "管弦乐团",
        sessionStartAt: "2026-04-23T12:40:00+08:00",
        sessionEndAt: "2026-04-23T13:50:00+08:00",
        currentTeacherId: 2616,
        currentTeacherName: "赵星森",
        currentTeacherPhone: "13778098407",
        defaultTeacherId: 2626,
        defaultTeacherName: "高鑫宇",
        defaultTeacherPhone: "18982201358",
      },
    });

    const data = await getAdminTeacherSettingCourse("4078", "3269");

    expect(data?.currentTeacherMode).toBe("temporary");
    expect(data?.swapRestoreTarget).toEqual({
      courseId: "4080",
      courseSessionId: "4541",
      courseTitle: "管弦乐团",
      courseMeta: "12:40-13:50",
      currentTeacherLabel: "赵星森 · 13778098407",
      defaultTeacherLabel: "高鑫宇 · 18982201358",
    });
  });
});
