const { redirect, serverRequestJson } = vi.hoisted(() => ({
  redirect: vi.fn(),
  serverRequestJson: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("@/lib/services/http-server", () => ({
  hasServerAuthToken: vi.fn(),
  serverRequestJson,
}));

import { ApiRequestError, unwrapEnvelope } from "@/lib/services/http-core";
import {
  addExistingAdminCourseStudent,
  createAdminCourseStudent,
  fetchAdminAbsentStudents,
  fetchAdminEmergencyWeekly,
  fetchAdminCourseStudentDetail,
  fetchAdminCourseLatestAttendance,
  fetchAdminCourseSessionTimeSettings,
  fetchRollCallTeacherBatchOptions,
  searchAdminCampusStudents,
  fetchAdminTimeSettingsSessions,
  fetchCourseStudents,
  fetchTeacherHome,
  fetchTeacherAttendanceGroup,
  submitTeacherAttendanceGroup,
  updateRollCallTeacherBatch,
  updateRollCallTeacherMergeGroup,
  updateAdminCourseStudent,
} from "@/lib/services/mobile-api";

describe("mobile-api contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-14T09:00:00+08:00"));
    serverRequestJson.mockResolvedValue({
      code: 0,
      message: "OK",
      data: [],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses the expected no-store server request defaults", async () => {
    await fetchTeacherHome();

    expect(serverRequestJson).toHaveBeenCalledWith(
      "/api/teacher/home?weekStart=2026-04-13",
      {
        cache: "no-store",
        auth: true,
      },
    );
  });

  it("builds course query strings for student roster requests", async () => {
    await fetchCourseStudents(101, {
      courseSessionId: 3001,
      filter: "小明",
    });

    expect(serverRequestJson).toHaveBeenCalledWith(
      "/api/courses/101/students?courseSessionId=3001&filter=%E5%B0%8F%E6%98%8E",
      {
        cache: "no-store",
        auth: true,
      },
    );
  });

  it("uses the expected grouped teacher attendance endpoints", async () => {
    await fetchTeacherAttendanceGroup("g-900");
    await submitTeacherAttendanceGroup("g-900", {
      items: [
        { courseSessionId: 3001, studentId: 1, status: 0 },
        { courseSessionId: 3002, studentId: 2, status: 2 },
      ],
    });

    expect(serverRequestJson).toHaveBeenNthCalledWith(
      1,
      "/api/teacher/attendance/groups/g-900",
      {
        cache: "no-store",
        auth: true,
      },
    );
    expect(serverRequestJson).toHaveBeenNthCalledWith(
      2,
      "/api/teacher/attendance/groups/g-900",
      {
        cache: "no-store",
        auth: true,
        method: "POST",
        body: {
          items: [
            { courseSessionId: 3001, studentId: 1, status: 0 },
            { courseSessionId: 3002, studentId: 2, status: 2 },
          ],
        },
      },
    );
  });

  it("builds admin absent-student query strings with only defined fields", async () => {
    await fetchAdminAbsentStudents({
      date: "2026-04-14",
      courseId: 101,
      courseSessionId: 3001,
      q: "一班",
    });

    expect(serverRequestJson).toHaveBeenCalledWith(
      "/api/admin/absent-students?date=2026-04-14&courseId=101&courseSessionId=3001&q=%E4%B8%80%E7%8F%AD",
      {
        cache: "no-store",
        auth: true,
      },
    );
  });

  it("builds admin emergency weekly query strings with aggregate pagination params", async () => {
    await fetchAdminEmergencyWeekly({
      weekStart: "2026-04-13",
      dayKey: "tue",
      q: "liu",
      page: 1,
      size: 20,
    });

    expect(serverRequestJson).toHaveBeenCalledWith(
      "/api/admin/emergency/weekly?weekStart=2026-04-13&dayKey=tue&q=liu&page=1&size=20",
      {
        cache: "no-store",
        auth: true,
      },
    );
  });

  it("uses the expected batch teacher option and save request shapes", async () => {
    await fetchRollCallTeacherBatchOptions({
      sessionDate: "2026-04-22",
      courseSessionIds: [3001, 3002, 3003],
      q: "li",
      page: 0,
      size: 50,
    });
    await updateRollCallTeacherBatch({
      sessionDate: "2026-04-22",
      assignments: [
        { courseSessionId: 3001, teacherId: 88 },
        { courseSessionId: 3002, teacherId: 89 },
      ],
    });
    await updateRollCallTeacherMergeGroup({
      sessionDate: "2026-04-22",
      sourceCourseSessionId: 3001,
      targetTeacherId: 88,
      mergeCourseSessionIds: [3003, 3004],
    });

    expect(serverRequestJson).toHaveBeenNthCalledWith(
      1,
      "/api/admin/roll-call-teacher/batch/options",
      {
        cache: "no-store",
        auth: true,
        method: "POST",
        body: {
          sessionDate: "2026-04-22",
          courseSessionIds: [3001, 3002, 3003],
          q: "li",
          page: 0,
          size: 50,
        },
      },
    );
    expect(serverRequestJson).toHaveBeenNthCalledWith(
      2,
      "/api/admin/roll-call-teacher/batch",
      {
        cache: "no-store",
        auth: true,
        method: "PUT",
        body: {
          sessionDate: "2026-04-22",
          assignments: [
            { courseSessionId: 3001, teacherId: 88 },
            { courseSessionId: 3002, teacherId: 89 },
          ],
        },
      },
    );
    expect(serverRequestJson).toHaveBeenNthCalledWith(
      3,
      "/api/admin/roll-call-teacher/merge-group",
      {
        cache: "no-store",
        auth: true,
        method: "PUT",
        body: {
          sessionDate: "2026-04-22",
          sourceCourseSessionId: 3001,
          targetTeacherId: 88,
          mergeCourseSessionIds: [3003, 3004],
        },
      },
    );
  });

  it("builds admin time-setting query strings", async () => {
    await fetchAdminTimeSettingsSessions({
      date: "2026-04-14",
      courseId: 101,
    });
    await fetchAdminCourseSessionTimeSettings(3001);
    await fetchAdminCourseLatestAttendance(101);

    expect(serverRequestJson).toHaveBeenNthCalledWith(
      1,
      "/api/admin/time-settings/sessions?date=2026-04-14&courseId=101",
      {
        cache: "no-store",
        auth: true,
      },
    );
    expect(serverRequestJson).toHaveBeenNthCalledWith(
      2,
      "/api/admin/course-sessions/3001/time-settings",
      {
        cache: "no-store",
        auth: true,
      },
    );
    expect(serverRequestJson).toHaveBeenNthCalledWith(
      3,
      "/api/admin/courses/101/attendance/latest",
      {
        cache: "no-store",
        auth: true,
      },
    );
  });

  it("uses the expected student detail and upsert request shapes", async () => {
    await fetchAdminCourseStudentDetail(101, 7);
    await createAdminCourseStudent(101, {
      name: "王一诺",
      homeroomClassId: 10,
    });
    await updateAdminCourseStudent(101, 7, {
      name: "王一诺",
      homeroomClassId: 11,
    });

    expect(serverRequestJson).toHaveBeenNthCalledWith(
      1,
      "/api/admin/courses/101/students/7",
      {
        cache: "no-store",
        auth: true,
      },
    );
    expect(serverRequestJson).toHaveBeenNthCalledWith(
      2,
      "/api/admin/courses/101/students",
      {
        cache: "no-store",
        auth: true,
        method: "POST",
        body: {
          name: "王一诺",
          homeroomClassId: 10,
        },
      },
    );
    expect(serverRequestJson).toHaveBeenNthCalledWith(
      3,
      "/api/admin/courses/101/students/7",
      {
        cache: "no-store",
        auth: true,
        method: "PUT",
        body: {
          name: "王一诺",
          homeroomClassId: 11,
        },
      },
    );
  });

  it("uses the expected campus student search and existing-student server request shapes", async () => {
    await searchAdminCampusStudents(22, "王一", 10);
    await addExistingAdminCourseStudent(101, { studentId: 7 });

    expect(serverRequestJson).toHaveBeenNthCalledWith(
      1,
      "/api/admin/campuses/22/students/search?q=%E7%8E%8B%E4%B8%80&limit=10",
      {
        cache: "no-store",
        auth: true,
      },
    );
    expect(serverRequestJson).toHaveBeenNthCalledWith(
      2,
      "/api/admin/courses/101/students/existing",
      {
        cache: "no-store",
        auth: true,
        method: "POST",
        body: {
          studentId: 7,
        },
      },
    );
  });

  it("unwraps envelopes and raises API request errors for coded failures", () => {
    expect(unwrapEnvelope({ code: 0, message: "OK", data: { ok: true } })).toEqual({
      ok: true,
    });

    expect(() =>
      unwrapEnvelope({
        code: 40101,
        message: "token expired",
        data: null,
      }),
    ).toThrow(ApiRequestError);
  });
});
