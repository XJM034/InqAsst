import { ApiRequestError } from "@/lib/services/http-core";

const {
  browserRequestJson,
  clearClientSessionCookies,
  readClientCampusOptions,
  resolveHomeHref,
  setClientSessionCookies,
} = vi.hoisted(() => ({
  browserRequestJson: vi.fn(),
  clearClientSessionCookies: vi.fn(),
  readClientCampusOptions: vi.fn(),
  resolveHomeHref: vi.fn(),
  setClientSessionCookies: vi.fn(),
}));

vi.mock("@/lib/services/http-client", () => ({
  browserRequestJson,
}));

vi.mock("@/lib/services/auth-session", () => ({
  clearClientSessionCookies,
  readClientCampusOptions,
  resolveHomeHref,
  setClientSessionCookies,
}));

import {
  addAdminCourseSettingsTemporaryCourse,
  addExistingStudentToCourse,
  createExternalTeacher,
  createStudent,
  createTeacherTemporaryStudent,
  fetchAdminAttendanceRoster,
  fetchAdminCampusClassesClient,
  fetchAdminMeProfileClient,
  fetchAdminHomeSummaryClient,
  fetchAdminTeachersClient,
  fetchRollCallTeacherOptionsClient,
  fetchAdminTimeSettingsSessionsClient,
  loginWithCode,
  logoutCurrentUser,
  searchAdminCampusStudents,
  selectCampusAfterLogin,
  sendLoginCode,
  switchAdminCampus,
  updateStudent,
} from "@/lib/services/mobile-client";

describe("mobile-client service behaviors", () => {
  const originalPublicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_BASE_URL = originalPublicApiBaseUrl;
    readClientCampusOptions.mockReturnValue([
      {
        campusId: "22",
        campusName: "鍗楀北鏍″尯",
        adminUserId: 61,
        adminName: "寮犺€佸笀",
      },
    ]);
    resolveHomeHref.mockImplementation((role?: string | null) =>
      role?.toUpperCase().includes("ADMIN") ? "/admin/home" : "/teacher/home",
    );
  });

  it("returns campus selection result without writing cookies", async () => {
    browserRequestJson.mockResolvedValue({
      code: 0,
      message: "OK",
      data: {
        phone: "13800138000",
        role: "ADMIN",
        selectionRequired: true,
        selectionToken: "sel_123",
        campusOptions: [
          {
            campusId: 1,
            campusName: "楂樻柊鏍″尯",
            adminUserId: 47,
            adminName: "鏉庤€佸笀",
          },
        ],
      },
    });

    await expect(loginWithCode("13800138000", "123456")).resolves.toEqual({
      mode: "selection",
      selectionToken: "sel_123",
      campusOptions: [
        {
          campusId: 1,
          campusName: "楂樻柊鏍″尯",
          adminUserId: 47,
          adminName: "鏉庤€佸笀",
        },
      ],
    });
    expect(setClientSessionCookies).not.toHaveBeenCalled();
  });

  it("stores a live login session and resolves the home href", async () => {
    browserRequestJson.mockResolvedValue({
      code: 0,
      message: "OK",
      data: {
        phone: "13800138000",
        token: "dm_token",
        role: "ADMIN",
        campusName: "鍗楀北鏍″尯",
        name: "寮犺€佸笀",
        adminUserId: 61,
        selectionRequired: false,
      },
    });

    await expect(loginWithCode("13800138000", "123456")).resolves.toEqual({
      mode: "live",
      homeHref: "/admin/home",
    });
    expect(setClientSessionCookies).toHaveBeenCalledWith(
      expect.objectContaining({
        token: "dm_token",
        role: "ADMIN",
        campusName: "鍗楀北鏍″尯",
        adminUserId: 61,
      }),
    );
    expect(resolveHomeHref).toHaveBeenCalledWith("ADMIN");
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = originalPublicApiBaseUrl;
  });

  it("normalizes known business error messages", async () => {
    browserRequestJson.mockResolvedValue({
      code: 1,
      message: "invalid verification code",
      data: null,
    });

    await expect(loginWithCode("13800138000", "000000")).rejects.toThrow("验证码错误");
  });

  it("normalizes auth server errors returned inside success envelopes", async () => {
    browserRequestJson.mockResolvedValue({
      code: 1,
      message: "Server internal error",
      data: null,
    });

    await expect(sendLoginCode("13800138000")).rejects.toThrow(
      "认证接口暂时异常，请稍后重试；如果多次出现，请联系后端确认登录验证码接口",
    );
  });

  it("maps local proxy 500s to a local backend startup hint", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://127.0.0.1:8080";
    browserRequestJson.mockRejectedValue(
      new ApiRequestError("Request failed with status 500", 500),
    );

    await expect(loginWithCode("18181459960", "8888")).rejects.toThrow(
      "本地后端联调失败，请确认 http://127.0.0.1:8080 已启动，并可打开 /swagger-ui/index.html",
    );
  });

  it("maps shared-dev 500s to a shared-dev availability hint", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "";
    browserRequestJson.mockRejectedValue(
      new ApiRequestError("Request failed with status 500", 500),
    );

    await expect(loginWithCode("18181459960", "8888")).rejects.toThrow(
      "共享开发环境暂时无响应，请稍后重试",
    );
  });

  it("uses the selected campus data when finishing a campus selection login", async () => {
    browserRequestJson.mockResolvedValue({
      code: 0,
      message: "OK",
      data: {
        phone: "13800138000",
        token: "dm_token",
        role: "ADMIN",
        campusName: "楂樻柊鏍″尯",
        name: "鏉庤€佸笀",
        adminUserId: 47,
      },
    });

    const campusOptions = [
      {
        campusId: 1,
        campusName: "楂樻柊鏍″尯",
        adminUserId: 47,
        adminName: "鏉庤€佸笀",
      },
    ];

    await expect(selectCampusAfterLogin("sel_123", 47, campusOptions)).resolves.toEqual({
      mode: "live",
      homeHref: "/admin/home",
    });
    expect(setClientSessionCookies).toHaveBeenCalledWith(
      expect.objectContaining({
        campusOptions: [
          {
            campusId: "1",
            campusName: "楂樻柊鏍″尯",
            adminUserId: 47,
            adminName: "鏉庤€佸笀",
          },
        ],
      }),
    );
  });

  it("replaces the login session when switching campus", async () => {
    browserRequestJson.mockResolvedValue({
      code: 0,
      message: "OK",
      data: {
        phone: "13800138000",
        token: "dm_token_new",
        role: "ADMIN",
        campusName: "鍗楀北鏍″尯",
        name: "寮犺€佸笀",
        adminUserId: 61,
      },
    });

    await expect(switchAdminCampus(61)).resolves.toEqual({
      mode: "live",
      homeHref: "/admin/home",
    });
    expect(setClientSessionCookies).toHaveBeenCalledWith(
      expect.objectContaining({
        token: "dm_token_new",
        campusOptions: [
          {
            campusId: "22",
            campusName: "鍗楀北鏍″尯",
            adminUserId: 61,
            adminName: "寮犺€佸笀",
          },
        ],
      }),
    );
  });

  it("always clears local session cookies on logout", async () => {
    browserRequestJson.mockRejectedValue(
      new ApiRequestError("Request failed with status 500", 500),
    );

    await expect(logoutCurrentUser()).rejects.toThrow("Request failed with status 500");
    expect(clearClientSessionCookies).toHaveBeenCalledTimes(1);
  });

  it("creates and updates students with the expected live request payloads", async () => {
    browserRequestJson
      .mockResolvedValueOnce({
        code: 0,
        message: "OK",
        data: {
          studentId: 7,
          externalStudentId: "STU-05231",
          studentName: "王一诺",
          homeroomClassId: 10,
          homeroomClassName: "五年级1班",
          enrolledInCourse: true,
        },
      })
      .mockResolvedValueOnce({
        code: 0,
        message: "OK",
        data: {
          studentId: 8,
          studentName: "临时学生",
          homeroomClassId: 10,
          homeroomClassName: "五年级1班",
          enrolledInCourse: true,
        },
      })
      .mockResolvedValueOnce({
        code: 0,
        message: "OK",
        data: {
          studentId: 7,
          externalStudentId: "STU-05231",
          studentName: "王一诺",
          homeroomClassId: 11,
          homeroomClassName: "五年级2班",
          enrolledInCourse: true,
        },
      });

    await expect(
      createStudent("101", {
        name: "王一诺",
        homeroomClassId: 10,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        studentId: 7,
        homeroomClassId: 10,
      }),
    );
    await expect(
      createTeacherTemporaryStudent(
        "101",
        {
          name: "临时学生",
          homeroomClassId: 10,
        },
        { courseSessionId: "3001" },
      ),
    ).resolves.toEqual(
      expect.objectContaining({
        studentId: 8,
        homeroomClassId: 10,
      }),
    );
    await expect(
      updateStudent("101", "7", {
        name: "王一诺",
        homeroomClassId: 11,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        studentId: 7,
        homeroomClassId: 11,
      }),
    );

    expect(browserRequestJson).toHaveBeenNthCalledWith(
      1,
      "/api/admin/courses/101/students",
      {
        method: "POST",
        auth: true,
        body: {
          name: "王一诺",
          homeroomClassId: 10,
        },
      },
    );
    expect(browserRequestJson).toHaveBeenNthCalledWith(
      2,
      "/api/courses/101/students?courseSessionId=3001",
      {
        method: "POST",
        auth: true,
        body: {
          name: "临时学生",
          homeroomClassId: 10,
        },
      },
    );
    expect(browserRequestJson).toHaveBeenNthCalledWith(
      3,
      "/api/admin/courses/101/students/7",
      {
        method: "PUT",
        auth: true,
        body: {
          name: "王一诺",
          homeroomClassId: 11,
        },
      },
    );
  });

  it("searches campus students and enrolls existing students with the expected requests", async () => {
    browserRequestJson
      .mockResolvedValueOnce({
        code: 0,
        message: "OK",
        data: [
          {
            studentId: 7,
            name: "王一诺",
            homeroomClassId: 10,
            homeroomClassName: "五年级1班",
          },
        ],
      })
      .mockResolvedValueOnce({
        code: 0,
        message: "OK",
        data: {
          studentId: 7,
          externalStudentId: "STU-05231",
          studentName: "王一诺",
          homeroomClassId: 10,
          homeroomClassName: "五年级1班",
          enrolledInCourse: true,
        },
      });

    await expect(searchAdminCampusStudents(22, "王一", 10)).resolves.toEqual([
      {
        studentId: 7,
        name: "王一诺",
        homeroomClassId: 10,
        homeroomClassName: "五年级1班",
      },
    ]);
    await expect(addExistingStudentToCourse("101", { studentId: 7 })).resolves.toEqual(
      expect.objectContaining({
        studentId: 7,
        enrolledInCourse: true,
      }),
    );

    expect(browserRequestJson).toHaveBeenNthCalledWith(
      1,
      "/api/admin/campuses/22/students/search?q=%E7%8E%8B%E4%B8%80&limit=10",
      {
        method: "GET",
        auth: true,
      },
    );
    expect(browserRequestJson).toHaveBeenNthCalledWith(
      2,
      "/api/admin/courses/101/students/existing",
      {
        method: "POST",
        auth: true,
        body: {
          studentId: 7,
        },
      },
    );
  });

  it("creates a blank temporary course with the expected request body", async () => {
    browserRequestJson.mockResolvedValue({
      code: 0,
      message: "OK",
      data: {
        effectiveCourseCount: 1,
        courses: [],
      },
    });

    await addAdminCourseSettingsTemporaryCourse({
      date: "2026-04-21",
      courseName: "绡悆鍔犵粌",
      sessionStartAt: "2026-04-21T18:00:00+08:00",
      sessionEndAt: "2026-04-21T19:30:00+08:00",
      location: "鎿嶅満",
      teacher: {
        source: "INTERNAL",
        teacherId: 88,
      },
      students: [
        {
          source: "INTERNAL",
          studentId: 7,
        },
        {
          source: "EXTERNAL",
          name: "赵小星",
          homeroomClassId: 10,
        },
      ],
    });

    expect(browserRequestJson).toHaveBeenCalledWith(
      "/api/admin/course-settings/temporary-courses",
      {
        method: "POST",
        auth: true,
        body: {
          date: "2026-04-21",
          courseName: "绡悆鍔犵粌",
          sessionStartAt: "2026-04-21T18:00:00+08:00",
          sessionEndAt: "2026-04-21T19:30:00+08:00",
          location: "鎿嶅満",
          teacher: {
            source: "INTERNAL",
            teacherId: 88,
          },
          students: [
            {
              source: "INTERNAL",
              studentId: 7,
            },
            {
              source: "EXTERNAL",
              name: "赵小星",
              homeroomClassId: 10,
            },
          ],
        },
      },
    );
  });

  it("loads blank-course setup context with the expected endpoints", async () => {
    browserRequestJson
      .mockResolvedValueOnce({
        code: 0,
        message: "OK",
        data: {
          id: 61,
          role: "ADMIN",
          campusId: 22,
          campusName: "鍗楀北鏍″尯",
        },
      })
      .mockResolvedValueOnce({
        code: 0,
        message: "OK",
        data: {
          date: "2026-04-21",
          distinctCoursesWithSessionsToday: 1,
          sessionCountToday: 1,
          pendingRollCallSessions: 0,
          actualClassTimeRange: "18:00 - 19:30",
          rollCallTimeRange: "17:45-18:10",
          rollCallWindowRuleCount: 1,
        },
      })
      .mockResolvedValueOnce({
        code: 0,
        message: "OK",
        data: [
          {
            id: 88,
            name: "鐜嬭€佸笀",
            phone: "13800138000",
          },
        ],
      })
      .mockResolvedValueOnce({
        code: 0,
        message: "OK",
        data: [
          {
            courseSessionId: 3001,
            courseId: 101,
            courseName: "篮球课",
            campusId: 22,
            sessionDate: "2026-04-21",
            weekday: 2,
            scheduledStartAt: "2026-04-21T18:00:00+08:00",
            scheduledEndAt: "2026-04-21T19:30:00+08:00",
            actualStartTime: "18:00",
            actualEndTime: "19:30",
            rollCallStartTime: "17:45",
            rollCallEndTime: "18:10",
            actualCustomized: true,
            rollCallCustomized: true,
          },
        ],
      })
      .mockResolvedValueOnce({
        code: 0,
        message: "OK",
        data: [
          {
            id: 10,
            name: "五年级1班",
          },
        ],
      });

    await expect(fetchAdminMeProfileClient()).resolves.toEqual(
      expect.objectContaining({
        campusId: 22,
      }),
    );
    await expect(fetchAdminHomeSummaryClient("2026-04-21")).resolves.toEqual(
      expect.objectContaining({
        actualClassTimeRange: "18:00 - 19:30",
      }),
    );
    await expect(fetchAdminTeachersClient()).resolves.toEqual([
      expect.objectContaining({
        id: 88,
      }),
    ]);
    await expect(
      fetchAdminTimeSettingsSessionsClient({
        date: "2026-04-21",
      }),
    ).resolves.toEqual([
      expect.objectContaining({
        courseSessionId: 3001,
      }),
    ]);
    await expect(fetchAdminCampusClassesClient(22)).resolves.toEqual([
      expect.objectContaining({
        id: 10,
      }),
    ]);

    expect(browserRequestJson).toHaveBeenNthCalledWith(2, "/api/admin/home/summary?date=2026-04-21", {
      method: "GET",
      auth: true,
    });
  });

  it("normalizes backend student upsert errors for direct page display", async () => {
    browserRequestJson
      .mockRejectedValueOnce(new ApiRequestError("external student id already exists", 400))
      .mockRejectedValueOnce(new ApiRequestError("homeroom campus mismatch", 400))
      .mockRejectedValueOnce(new ApiRequestError("student is not in course roster", 400))
      .mockRejectedValueOnce(new ApiRequestError("studentId is required", 400));

    await expect(
      createStudent("101", {
        externalStudentId: "STU-05231",
        name: "王一诺",
        homeroomClassId: 10,
      }),
    ).rejects.toThrow("外部学生ID已存在，请更换后再试");

    await expect(
      updateStudent("101", "7", {
        name: "王一诺",
        homeroomClassId: 11,
      }),
    ).rejects.toThrow("所选行政班不属于当前校区，请重新选择");

    await expect(
      updateStudent("101", "8", {
        name: "王一诺",
        homeroomClassId: 11,
      }),
    ).rejects.toThrow("该学生不在当前课程名单中，无法编辑");

    await expect(addExistingStudentToCourse("101", { studentId: Number.NaN })).rejects.toThrow(
      "请选择已有学生",
    );
  });

  it("normalizes teacher temporary-student server failures for direct page display", async () => {
    browserRequestJson.mockRejectedValueOnce(new ApiRequestError("Server internal error", 500));

    await expect(
      createTeacherTemporaryStudent(
        "101",
        {
          name: "临时学生",
          homeroomClassId: 10,
        },
        { courseSessionId: "3001" },
      ),
    ).rejects.toThrow("临时学生补录接口暂时异常，请联系管理员或后端同学确认教师端新增学生接口");

    expect(browserRequestJson).toHaveBeenCalledWith(
      "/api/courses/101/students?courseSessionId=3001",
      {
        method: "POST",
        auth: true,
        body: {
          name: "临时学生",
          homeroomClassId: 10,
        },
      },
    );
  });

  it("normalizes blank temporary course validation errors", async () => {
    browserRequestJson
      .mockRejectedValueOnce(new ApiRequestError("course name is required", 400))
      .mockRejectedValueOnce(new ApiRequestError("students cannot be empty", 400))
      .mockRejectedValueOnce(new ApiRequestError("teacher is required", 400))
      .mockRejectedValueOnce(new ApiRequestError("external teacher phone is required", 400))
      .mockRejectedValueOnce(
        new ApiRequestError("external teacher phone belongs to internal teacher", 400),
      );

    await expect(
      addAdminCourseSettingsTemporaryCourse({
        date: "2026-04-21",
        courseName: "",
        sessionStartAt: "2026-04-21T18:00:00+08:00",
        sessionEndAt: "2026-04-21T19:30:00+08:00",
        students: [],
      }),
    ).rejects.toThrow("请填写课程名称");

    await expect(
      addAdminCourseSettingsTemporaryCourse({
        date: "2026-04-21",
        courseName: "篮球加练",
        sessionStartAt: "2026-04-21T18:00:00+08:00",
        sessionEndAt: "2026-04-21T19:30:00+08:00",
        students: [],
      }),
    ).rejects.toThrow("请至少添加 1 名学生");

    await expect(
      addAdminCourseSettingsTemporaryCourse({
        date: "2026-04-21",
        courseName: "篮球加练",
        sessionStartAt: "2026-04-21T18:00:00+08:00",
        sessionEndAt: "2026-04-21T19:30:00+08:00",
        students: [
          {
            source: "INTERNAL",
            studentId: 7,
          },
        ],
      }),
    ).rejects.toThrow("请至少添加 1 名老师");

    await expect(
      addAdminCourseSettingsTemporaryCourse({
        date: "2026-04-21",
        courseName: "篮球加练",
        sessionStartAt: "2026-04-21T18:00:00+08:00",
        sessionEndAt: "2026-04-21T19:30:00+08:00",
        teacher: {
          source: "EXTERNAL",
          name: "王三",
          phone: "",
        },
        students: [
          {
            source: "INTERNAL",
            studentId: 7,
          },
        ],
      }),
    ).rejects.toThrow("请输入系统外老师手机号");

    await expect(
      addAdminCourseSettingsTemporaryCourse({
        date: "2026-04-21",
        courseName: "篮球加练",
        sessionStartAt: "2026-04-21T18:00:00+08:00",
        sessionEndAt: "2026-04-21T19:30:00+08:00",
        teacher: {
          source: "EXTERNAL",
          name: "王三",
          phone: "13800138000",
        },
        students: [
          {
            source: "INTERNAL",
            studentId: 7,
          },
        ],
      }),
    ).rejects.toThrow("该手机号老师已在系统内，请改用系统内老师");
  });

  it("normalizes external teacher validation errors", async () => {
    browserRequestJson
      .mockRejectedValueOnce(new ApiRequestError("external teacher name is required", 400))
      .mockRejectedValueOnce(new ApiRequestError("external teacher phone is required", 400))
      .mockRejectedValueOnce(
        new ApiRequestError("external teacher phone belongs to internal teacher", 400),
      );

    await expect(
      createExternalTeacher("3001", {
        name: "",
        phone: "13800138000",
      }),
    ).rejects.toThrow("请输入系统外老师姓名");

    await expect(
      createExternalTeacher("3001", {
        name: "王三",
        phone: "",
      }),
    ).rejects.toThrow("请输入系统外老师手机号");

    await expect(
      createExternalTeacher("3001", {
        name: "王三",
        phone: "13800138000",
      }),
    ).rejects.toThrow("该手机号老师已在系统内，请改用系统内老师");
  });

  it("loads internal teacher options for the current course session", async () => {
    browserRequestJson.mockResolvedValue({
      code: 0,
      message: "OK",
      data: {
        items: [
          {
            teacherId: 88,
            teacherName: "赵老师",
            phone: "13800138000",
          },
        ],
        totalElements: 1,
        totalPages: 1,
        page: 0,
        size: 20,
      },
    });

    await expect(
      fetchRollCallTeacherOptionsClient("3446", {
        teacherType: "INTERNAL",
        q: "13800138000",
        page: 0,
        size: 20,
      }),
    ).resolves.toEqual({
      items: [
        {
          teacherId: 88,
          teacherName: "赵老师",
          phone: "13800138000",
        },
      ],
      totalElements: 1,
      totalPages: 1,
      page: 0,
      size: 20,
    });

    expect(browserRequestJson).toHaveBeenLastCalledWith(
      "/api/admin/course-sessions/3446/roll-call-teacher/options?teacherType=INTERNAL&q=13800138000&page=0&size=20",
      {
        method: "GET",
        auth: true,
      },
    );
  });

  it("hydrates the admin attendance roster from students and latest attendance", async () => {
    browserRequestJson
      .mockResolvedValueOnce({
        code: 0,
        message: "OK",
        data: [
          {
            studentId: 7,
            externalStudentId: "STU-05231",
            studentName: "王一诺",
            homeroomClassId: 10,
            homeroomClassName: "五年级1班",
            lastAttendanceStatus: 2,
          },
        ],
      })
      .mockResolvedValueOnce({
        code: 0,
        message: "OK",
        data: {
          hasSubmittedToday: true,
          items: [{ studentId: 7, status: 1 }],
        },
      });

    await expect(
      fetchAdminAttendanceRoster({
        courseId: "101",
        courseSessionId: "3001",
      }),
    ).resolves.toEqual([
      {
        id: "7",
        name: "王一诺",
        homeroomClass: "五年级1班",
        homeroomClassId: 10,
        status: "leave",
        managerUpdated: undefined,
        overrideLabel: undefined,
      },
    ]);

    expect(browserRequestJson).toHaveBeenNthCalledWith(
      1,
      "/api/admin/courses/101/students?courseSessionId=3001",
      {
        auth: true,
      },
    );
    expect(browserRequestJson).toHaveBeenNthCalledWith(
      2,
      "/api/admin/courses/101/attendance/latest?courseSessionId=3001",
      {
        auth: true,
      },
    );
  });
});
