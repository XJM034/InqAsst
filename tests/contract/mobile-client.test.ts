const { browserRequestJson } = vi.hoisted(() => ({
  browserRequestJson: vi.fn(),
}));

vi.mock("@/lib/services/http-client", () => ({
  browserRequestJson,
}));

vi.mock("@/lib/services/auth-session", () => ({
  clearClientSessionCookies: vi.fn(),
  readClientCampusOptions: vi.fn(() => []),
  resolveHomeHref: vi.fn(() => "/teacher/home"),
  setClientSessionCookies: vi.fn(),
}));

import { RollCallTeacherBatchConflictError } from "@/lib/roll-call-teacher-batch";
import { ApiRequestError } from "@/lib/services/http-core";
import {
  addAdminCourseSettingsTemporaryCourse,
  addExistingStudentToCourse,
  clearRollCallTeacher,
  createExternalTeacher,
  createStudent,
  createTeacherTemporaryStudent,
  fetchAdminCampusClassesClient,
  fetchAdminMeProfileClient,
  fetchAdminTeachersClient,
  fetchRollCallTeacherOptionsClient,
  fetchAdminTimeSettingsSessionsClient,
  fetchAdminAttendanceRoster,
  resetAdminCampusActualTime,
  searchAdminCampusStudents,
  sendLoginCode,
  setRollCallTeacher,
  setRollCallTeacherBatch,
  setRollCallTeacherMergeGroup,
  submitAdminAttendance,
  submitTeacherAttendance,
  submitTeacherAttendanceGroup,
  switchAdminCampus,
  updateStudent,
  updateAdminCampusActualTime,
  updateAdminCampusRollCallRule,
  updateAdminCourseSessionTimeSetting,
} from "@/lib/services/mobile-client";

describe("mobile-client contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    browserRequestJson.mockResolvedValue({
      code: 0,
      message: "OK",
      data: {},
    });
  });

  it("calls auth endpoints with the expected request shapes", async () => {
    browserRequestJson
      .mockResolvedValueOnce({
        code: 0,
        message: "OK",
        data: {},
      })
      .mockResolvedValueOnce({
        code: 0,
        message: "OK",
        data: {
          phone: "13800138000",
          token: "dm_token",
          role: "ADMIN",
          campusName: "南山校区",
          adminUserId: 61,
        },
      });

    await sendLoginCode("13800138000");
    await switchAdminCampus(61);

    expect(browserRequestJson).toHaveBeenNthCalledWith(1, "/api/auth/send-code", {
      method: "POST",
      body: { phone: "13800138000" },
    });
    expect(browserRequestJson).toHaveBeenNthCalledWith(2, "/api/auth/switch-campus", {
      method: "POST",
      auth: true,
      body: { adminUserId: 61 },
    });
  });

  it("submits teacher and admin attendance with normalized payloads", async () => {
    const students = [
      { id: "1", status: "unmarked" as const },
      { id: "2", status: "leave" as const },
    ];

    await submitTeacherAttendance({
      courseId: "101",
      courseSessionId: "3001",
      students: students.map((student) => ({
        ...student,
        name: "学生",
        homeroomClass: "一班",
      })),
    });
    await submitAdminAttendance({
      courseId: "102",
      courseSessionId: "3002",
      students: students.map((student) => ({
        ...student,
        name: "学生",
        homeroomClass: "一班",
      })),
    });
    await submitTeacherAttendanceGroup({
      groupId: "g-900",
      students: [
        {
          id: "1",
          courseSessionId: "3001",
          courseTitle: "机器人",
          name: "学生",
          homeroomClass: "一班",
          status: "absent",
        },
        {
          id: "2",
          courseSessionId: "3002",
          courseTitle: "创意美术",
          name: "学生",
          homeroomClass: "一班",
          status: "present",
        },
      ],
    });

    expect(browserRequestJson).toHaveBeenNthCalledWith(
      1,
      "/api/courses/101/attendance",
      expect.objectContaining({
        method: "POST",
        auth: true,
        body: {
          courseSessionId: 3001,
          items: [
            { studentId: 1, status: 2 },
            { studentId: 2, status: 1 },
          ],
        },
      }),
    );
    expect(browserRequestJson).toHaveBeenNthCalledWith(
      2,
      "/api/admin/courses/102/attendance",
      expect.objectContaining({
        method: "POST",
        auth: true,
        body: {
          courseSessionId: 3002,
          items: [
            { studentId: 1, status: 2 },
            { studentId: 2, status: 1 },
          ],
        },
      }),
    );
    expect(browserRequestJson).toHaveBeenNthCalledWith(
      3,
      "/api/teacher/attendance/groups/g-900",
      expect.objectContaining({
        method: "POST",
        auth: true,
        body: {
          items: [
            { courseSessionId: 3001, studentId: 1, status: 0 },
            { courseSessionId: 3002, studentId: 2, status: 2 },
          ],
        },
      }),
    );
  });

  it("uses the expected time-setting endpoints and payload variants", async () => {
    await updateAdminCampusActualTime({
      campusId: "22",
      targetDate: "2026-04-14",
      startTime: "08:05",
      endTime: "09:05",
    });
    await updateAdminCourseSessionTimeSetting({
      courseSessionId: "3001",
      kind: "roll-call",
      startOffsetMinutes: -15,
      endOffsetMinutes: 10,
    });
    await updateAdminCampusRollCallRule({
      campusId: "22",
      beforeStartMinutes: 10,
      afterStartMinutes: 15,
    });
    await resetAdminCampusActualTime({
      campusId: "22",
      targetDate: "2026-04-14",
    });

    expect(browserRequestJson).toHaveBeenNthCalledWith(
      1,
      "/api/admin/campuses/22/actual-time",
      expect.objectContaining({
        method: "PUT",
        auth: true,
        body: {
          targetDate: "2026-04-14",
          startTime: "08:05",
          endTime: "09:05",
        },
      }),
    );
    expect(browserRequestJson).toHaveBeenNthCalledWith(
      2,
      "/api/admin/course-sessions/3001/roll-call-time",
      expect.objectContaining({
        method: "PUT",
        auth: true,
        body: {
          startOffsetMinutes: -15,
          endOffsetMinutes: 10,
        },
      }),
    );
    expect(browserRequestJson).toHaveBeenNthCalledWith(
      3,
      "/api/admin/campuses/22/roll-call-rule",
      expect.objectContaining({
        method: "PUT",
        auth: true,
        body: {
          beforeStartMinutes: 10,
          afterStartMinutes: 15,
        },
      }),
    );
    expect(browserRequestJson).toHaveBeenNthCalledWith(
      4,
      "/api/admin/campuses/22/actual-time?targetDate=2026-04-14",
      expect.objectContaining({
        method: "DELETE",
        auth: true,
      }),
    );
  });

  it("uses the expected teacher assignment endpoints for reusable candidates and new external teachers", async () => {
    await setRollCallTeacher("3001", 88);
    await clearRollCallTeacher("3001");
    await setRollCallTeacherBatch({
      sessionDate: "2026-04-22",
      assignments: [
        { courseSessionId: 3001, teacherId: 88 },
        { courseSessionId: 3002, teacherId: 89 },
      ],
    });
    await setRollCallTeacherMergeGroup({
      sessionDate: "2026-04-22",
      sourceCourseSessionId: 3001,
      targetTeacherId: 88,
      mergeCourseSessionIds: [3003, 3004],
    });
    await createExternalTeacher("3001", { name: "外部老师", phone: "13800138000" });

    expect(browserRequestJson).toHaveBeenNthCalledWith(
      1,
      "/api/admin/course-sessions/3001/roll-call-teacher",
      expect.objectContaining({
        method: "PUT",
        auth: true,
        body: { teacherId: 88 },
      }),
    );
    expect(browserRequestJson).toHaveBeenNthCalledWith(
      2,
      "/api/admin/course-sessions/3001/roll-call-teacher",
      expect.objectContaining({
        method: "DELETE",
        auth: true,
      }),
    );
    expect(browserRequestJson).toHaveBeenNthCalledWith(
      3,
      "/api/admin/roll-call-teacher/batch",
      expect.objectContaining({
        method: "PUT",
        auth: true,
        body: {
          sessionDate: "2026-04-22",
          assignments: [
            { courseSessionId: 3001, teacherId: 88 },
            { courseSessionId: 3002, teacherId: 89 },
          ],
        },
      }),
    );
    expect(browserRequestJson).toHaveBeenNthCalledWith(
      4,
      "/api/admin/roll-call-teacher/merge-group",
      expect.objectContaining({
        method: "PUT",
        auth: true,
        body: {
          sessionDate: "2026-04-22",
          sourceCourseSessionId: 3001,
          targetTeacherId: 88,
          mergeCourseSessionIds: [3003, 3004],
        },
      }),
    );
    expect(browserRequestJson).toHaveBeenNthCalledWith(
      5,
      "/api/admin/course-sessions/3001/roll-call-teacher/external",
      expect.objectContaining({
        method: "POST",
        auth: true,
        body: { name: "外部老师", phone: "13800138000" },
      }),
    );
  });

  it("surfaces structured batch teacher conflicts as a dedicated error", async () => {
    browserRequestJson.mockRejectedValueOnce(
      new ApiRequestError("batch teacher conflict", 409, 40901, {
        conflicts: [
          {
            courseSessionId: 3001,
            teacherId: 88,
            teacherName: "何伟",
            conflictDate: "2026-04-22",
            conflictTimeRange: "16:45-17:45",
            conflictSource: "OUTSIDE_GROUP",
          },
        ],
      }),
    );

    await expect(
      setRollCallTeacherBatch({
        sessionDate: "2026-04-22",
        assignments: [{ courseSessionId: 3001, teacherId: 88 }],
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<RollCallTeacherBatchConflictError>>({
        name: "RollCallTeacherBatchConflictError",
        conflicts: [
          expect.objectContaining({
            courseSessionId: "3001",
            teacherId: "88",
            teacherName: "何伟",
            conflictSource: "outside-group",
          }),
        ],
      }),
    );
  });

  it("uses the expected student create and update endpoints", async () => {
    await createTeacherTemporaryStudent(
      "101",
      {
        name: "临时学生",
        homeroomClassId: 10,
      },
      { courseSessionId: "3001" },
    );
    await createStudent("101", {
      name: "王一诺",
      homeroomClassId: 10,
    });
    await updateStudent("101", "7", {
      name: "王一诺",
      homeroomClassId: 11,
    });

    expect(browserRequestJson).toHaveBeenNthCalledWith(
      1,
      "/api/courses/101/students?courseSessionId=3001",
      expect.objectContaining({
        method: "POST",
        auth: true,
        body: {
          name: "临时学生",
          homeroomClassId: 10,
        },
      }),
    );
    expect(browserRequestJson).toHaveBeenNthCalledWith(
      2,
      "/api/admin/courses/101/students",
      expect.objectContaining({
        method: "POST",
        auth: true,
        body: {
          name: "王一诺",
          homeroomClassId: 10,
        },
      }),
    );
    expect(browserRequestJson).toHaveBeenNthCalledWith(
      3,
      "/api/admin/courses/101/students/7",
      expect.objectContaining({
        method: "PUT",
        auth: true,
        body: {
          name: "王一诺",
          homeroomClassId: 11,
        },
      }),
    );
  });

  it("uses the expected campus student search and existing-student endpoints", async () => {
    await searchAdminCampusStudents(22, "王一", 10);
    await addExistingStudentToCourse("101", { studentId: 7 });

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
      expect.objectContaining({
        method: "POST",
        auth: true,
        body: {
          studentId: 7,
        },
      }),
    );
  });

  it("uses the expected request shape for blank temporary course creation", async () => {
    await addAdminCourseSettingsTemporaryCourse({
      date: "2026-04-21",
      courseName: "篮球加练",
      sessionStartAt: "2026-04-21T18:00:00+08:00",
      sessionEndAt: "2026-04-21T19:30:00+08:00",
      location: "操场",
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
          name: "赵小明",
          homeroomClassId: 10,
        },
      ],
    });

    expect(browserRequestJson).toHaveBeenCalledWith(
      "/api/admin/course-settings/temporary-courses",
      expect.objectContaining({
        method: "POST",
        auth: true,
        body: {
          date: "2026-04-21",
          courseName: "篮球加练",
          sessionStartAt: "2026-04-21T18:00:00+08:00",
          sessionEndAt: "2026-04-21T19:30:00+08:00",
          location: "操场",
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
              name: "赵小明",
              homeroomClassId: 10,
            },
          ],
        },
      }),
    );
  });

  it("uses the expected blank-course setup endpoints", async () => {
    await fetchAdminMeProfileClient();
    await fetchAdminTeachersClient();
    await fetchAdminTimeSettingsSessionsClient({
      date: "2026-04-21",
      courseId: 101,
    });
    await fetchAdminCampusClassesClient(22);

    expect(browserRequestJson).toHaveBeenNthCalledWith(1, "/api/admin/me", {
      method: "GET",
      auth: true,
    });
    expect(browserRequestJson).toHaveBeenNthCalledWith(2, "/api/admin/teachers", {
      method: "GET",
      auth: true,
    });
    expect(browserRequestJson).toHaveBeenNthCalledWith(
      3,
      "/api/admin/time-settings/sessions?date=2026-04-21&courseId=101",
      {
        method: "GET",
        auth: true,
      },
    );
    expect(browserRequestJson).toHaveBeenNthCalledWith(
      4,
      "/api/admin/campuses/22/classes",
      {
        method: "GET",
        auth: true,
      },
    );
  });

  it("uses the expected roll-call teacher search endpoint", async () => {
    await fetchRollCallTeacherOptionsClient("3446", {
      teacherType: "INTERNAL",
      q: "13800138000",
      page: 0,
      size: 20,
    });

    expect(browserRequestJson).toHaveBeenCalledWith(
      "/api/admin/course-sessions/3446/roll-call-teacher/options?teacherType=INTERNAL&q=13800138000&page=0&size=20",
      {
        method: "GET",
        auth: true,
      },
    );
  });

  it("loads unarrived roster context with the expected admin endpoints", async () => {
    browserRequestJson
      .mockResolvedValueOnce({
        code: 0,
        message: "OK",
        data: [],
      })
      .mockResolvedValueOnce({
        code: 0,
        message: "OK",
        data: {
          hasSubmittedToday: false,
          items: [],
        },
      });

    await fetchAdminAttendanceRoster({
      courseId: "101",
      courseSessionId: "3001",
    });

    expect(browserRequestJson).toHaveBeenNthCalledWith(
      1,
      "/api/admin/courses/101/students?courseSessionId=3001",
      expect.objectContaining({
        auth: true,
      }),
    );
    expect(browserRequestJson).toHaveBeenNthCalledWith(
      2,
      "/api/admin/courses/101/attendance/latest?courseSessionId=3001",
      expect.objectContaining({
        auth: true,
      }),
    );
  });
});
