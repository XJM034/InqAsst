import { unwrapEnvelope, type ApiEnvelope } from "@/lib/services/http-core";
import { serverRequestJson } from "@/lib/services/http-server";
import type {
  AbsentStudentRowDto,
  AdminEmergencyDayKeyDto,
  AdminEmergencyWeeklyResponseDto,
  CampusStudentSearchItemDto,
  AdminHomeSummaryDto,
  AdminCourseSettingsOverviewDto,
  AttendanceLatestDto,
  AttendanceSessionStatusDto,
  CourseSessionTimeSettingDto,
  CourseDetailDto,
  CourseStudentRowDto,
  CourseWeekItemDto,
  ExternalTeacherRequestDto,
  ExistingStudentEnrollRequestDto,
  HomeroomClassListItemDto,
  MeDto,
  PagedRowsDto,
  RollCallOverviewRowDto,
  TeacherSettingOverviewRowDto,
  RollCallTeacherDto,
  RollCallTeacherBatchOptionsRequestDto,
  RollCallTeacherBatchOptionsResponseDto,
  RollCallTeacherMergeGroupRequestDto,
  RollCallTeacherMergeGroupResponseDto,
  RollCallTeacherBatchUpdateRequestDto,
  RollCallTeacherBatchUpdateResponseDto,
  RollCallTeacherOptionDto,
  RollCallTeacherType,
  RollCallWindowDto,
  StudentDetailDto,
  StudentUpsertRequestDto,
  TeacherEntityDto,
  TeacherAttendanceGroupDto,
  TeacherHomeDto,
  TeacherAttendanceGroupSubmitRequestDto,
  TeacherTodaySessionDto,
} from "@/lib/services/mobile-schema";

const NO_STORE = { cache: "no-store" as const, auth: true };

function unwrapAuthedEnvelope<T>(payload: ApiEnvelope<T>) {
  try {
    return unwrapEnvelope(payload);
  } catch (error) {
    throw error;
  }
}

function getWeekStart() {
  const now = new Date();
  const shanghaiNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
  const day = shanghaiNow.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  shanghaiNow.setDate(shanghaiNow.getDate() + mondayOffset);
  const y = shanghaiNow.getFullYear();
  const m = String(shanghaiNow.getMonth() + 1).padStart(2, "0");
  const d = String(shanghaiNow.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildQueryString(
  params: Record<string, string | number | null | undefined>,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === null || typeof value === "undefined" || value === "") {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function fetchMeProfile() {
  const payload = await serverRequestJson<ApiEnvelope<MeDto>>("/api/me", NO_STORE);
  return unwrapAuthedEnvelope(payload);
}

export async function searchAdminCampusStudents(
  campusId: number,
  q: string,
  limit = 10,
) {
  const payload = await serverRequestJson<ApiEnvelope<CampusStudentSearchItemDto[]>>(
    `/api/admin/campuses/${campusId}/students/search${buildQueryString({
      q,
      limit,
    })}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchAdminMeProfile() {
  const payload = await serverRequestJson<ApiEnvelope<MeDto>>("/api/admin/me", NO_STORE);
  return unwrapAuthedEnvelope(payload);
}

export async function fetchTeacherHome() {
  const payload = await serverRequestJson<ApiEnvelope<TeacherHomeDto>>(
    `/api/teacher/home${buildQueryString({ weekStart: getWeekStart() })}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchTeacherTodaySessions() {
  const payload = await serverRequestJson<ApiEnvelope<TeacherTodaySessionDto[]>>(
    "/api/teacher/courses/today",
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchTeacherAttendanceGroup(groupId: string | number) {
  const payload = await serverRequestJson<ApiEnvelope<TeacherAttendanceGroupDto>>(
    `/api/teacher/attendance/groups/${groupId}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchCourseWeek() {
  const payload = await serverRequestJson<ApiEnvelope<CourseWeekItemDto[]>>(
    `/api/courses/week${buildQueryString({ weekStart: getWeekStart() })}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchCourseDetail(courseId: number) {
  const payload = await serverRequestJson<ApiEnvelope<CourseDetailDto>>(
    `/api/courses/${courseId}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchCourseStudents(
  courseId: number,
  options?: {
    courseSessionId?: number;
    filter?: string;
  },
) {
  const payload = await serverRequestJson<ApiEnvelope<CourseStudentRowDto[]>>(
    `/api/courses/${courseId}/students${buildQueryString({
      courseSessionId: options?.courseSessionId,
      filter: options?.filter,
    })}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchCourseLatestAttendance(
  courseId: number,
  courseSessionId?: number,
) {
  const payload = await serverRequestJson<ApiEnvelope<AttendanceLatestDto | null>>(
    `/api/courses/${courseId}/attendance/latest${buildQueryString({
      courseSessionId,
    })}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchCourseAttendanceStatus(
  courseId: number,
  courseSessionId?: number,
) {
  const payload = await serverRequestJson<ApiEnvelope<AttendanceSessionStatusDto>>(
    `/api/courses/${courseId}/attendance/status${buildQueryString({
      courseSessionId,
    })}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function submitTeacherAttendanceGroup(
  groupId: string | number,
  body: TeacherAttendanceGroupSubmitRequestDto,
) {
  const payload = await serverRequestJson<ApiEnvelope<TeacherAttendanceGroupDto>>(
    `/api/teacher/attendance/groups/${groupId}`,
    { ...NO_STORE, method: "POST", body },
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchCourseRollCallWindows(courseId: number) {
  const payload = await serverRequestJson<ApiEnvelope<RollCallWindowDto[]>>(
    `/api/courses/${courseId}/roll-call-windows`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchAdminHomeSummary(date?: string) {
  const payload = await serverRequestJson<ApiEnvelope<AdminHomeSummaryDto>>(
    `/api/admin/home/summary${buildQueryString({ date })}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchAdminRollCallOverview(date?: string) {
  const payload = await serverRequestJson<ApiEnvelope<RollCallOverviewRowDto[]>>(
    `/api/admin/roll-call/overview${buildQueryString({ date })}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchAdminEmergencyWeekly(options?: {
  weekStart?: string;
  dayKey?: AdminEmergencyDayKeyDto;
  q?: string;
  page?: number;
  size?: number;
}) {
  const payload = await serverRequestJson<ApiEnvelope<AdminEmergencyWeeklyResponseDto>>(
    `/api/admin/emergency/weekly${buildQueryString({
      weekStart: options?.weekStart ?? getWeekStart(),
      dayKey: options?.dayKey,
      q: options?.q,
      page: options?.page,
      size: options?.size,
    })}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchAdminTeacherSettingsOverview(weekStart?: string) {
  const payload = await serverRequestJson<ApiEnvelope<TeacherSettingOverviewRowDto[]>>(
    `/api/admin/teacher-settings/overview${buildQueryString({ weekStart })}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchAdminCourseSettingsOverview(date?: string) {
  const payload = await serverRequestJson<ApiEnvelope<AdminCourseSettingsOverviewDto>>(
    `/api/admin/course-settings/overview${buildQueryString({ date })}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchAdminAbsentStudents(options?: {
  date?: string;
  courseId?: number;
  courseSessionId?: number;
  q?: string;
}) {
  const payload = await serverRequestJson<ApiEnvelope<AbsentStudentRowDto[]>>(
    `/api/admin/absent-students${buildQueryString({
      date: options?.date,
      courseId: options?.courseId,
      courseSessionId: options?.courseSessionId,
      q: options?.q,
    })}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchAdminTeachers() {
  const payload = await serverRequestJson<ApiEnvelope<TeacherEntityDto[]>>(
    "/api/admin/teachers",
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchAdminCourseStudents(
  courseId: number,
  options?: {
    courseSessionId?: number;
    filter?: string;
  },
) {
  const payload = await serverRequestJson<ApiEnvelope<CourseStudentRowDto[]>>(
    `/api/admin/courses/${courseId}/students${buildQueryString({
      courseSessionId: options?.courseSessionId,
      filter: options?.filter,
    })}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchAdminCourseLatestAttendance(
  courseId: number,
  courseSessionId?: number,
) {
  const payload = await serverRequestJson<ApiEnvelope<AttendanceLatestDto | null>>(
    `/api/admin/courses/${courseId}/attendance/latest${buildQueryString({
      courseSessionId,
    })}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchAdminStudents(page = 0, size = 100) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  const payload = await serverRequestJson<ApiEnvelope<PagedRowsDto<{ id: number; homeroomClassId?: number | null; name: string; externalStudentId?: string | null }>>>(
    `/api/admin/students?${params.toString()}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchAdminCampusClasses(campusId: number) {
  const payload = await serverRequestJson<ApiEnvelope<HomeroomClassListItemDto[]>>(
    `/api/admin/campuses/${campusId}/classes`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchAdminRollCallWindows(campusId: number) {
  const payload = await serverRequestJson<ApiEnvelope<RollCallWindowDto[]>>(
    `/api/admin/campuses/${campusId}/roll-call-windows`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchAdminTimeSettingsSessions(options?: {
  date?: string;
  courseId?: number;
}) {
  const payload = await serverRequestJson<ApiEnvelope<CourseSessionTimeSettingDto[]>>(
    `/api/admin/time-settings/sessions${buildQueryString({
      date: options?.date,
      courseId: options?.courseId,
    })}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchAdminCourseSessionTimeSettings(courseSessionId: number) {
  const payload = await serverRequestJson<ApiEnvelope<CourseSessionTimeSettingDto>>(
    `/api/admin/course-sessions/${courseSessionId}/time-settings`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchAdminCourseStudentDetail(courseId: number, studentId: number) {
  const payload = await serverRequestJson<ApiEnvelope<StudentDetailDto>>(
    `/api/admin/courses/${courseId}/students/${studentId}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function createAdminCourseStudent(courseId: number, body: StudentUpsertRequestDto) {
  const payload = await serverRequestJson<ApiEnvelope<StudentDetailDto>>(
    `/api/admin/courses/${courseId}/students`,
    { ...NO_STORE, method: "POST", body },
  );
  return unwrapAuthedEnvelope(payload);
}

export async function addExistingAdminCourseStudent(
  courseId: number,
  body: ExistingStudentEnrollRequestDto,
) {
  const payload = await serverRequestJson<ApiEnvelope<StudentDetailDto>>(
    `/api/admin/courses/${courseId}/students/existing`,
    { ...NO_STORE, method: "POST", body },
  );
  return unwrapAuthedEnvelope(payload);
}

export async function updateAdminCourseStudent(
  courseId: number,
  studentId: number,
  body: StudentUpsertRequestDto,
) {
  const payload = await serverRequestJson<ApiEnvelope<StudentDetailDto>>(
    `/api/admin/courses/${courseId}/students/${studentId}`,
    { ...NO_STORE, method: "PUT", body },
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchRollCallTeacher(courseSessionId: number) {
  const payload = await serverRequestJson<ApiEnvelope<RollCallTeacherDto>>(
    `/api/admin/course-sessions/${courseSessionId}/roll-call-teacher`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchRollCallTeacherOptions(
  courseSessionId: number,
  options?: {
    teacherType?: RollCallTeacherType;
    q?: string;
    page?: number;
    size?: number;
  },
) {
  const payload = await serverRequestJson<ApiEnvelope<PagedRowsDto<RollCallTeacherOptionDto>>>(
    `/api/admin/course-sessions/${courseSessionId}/roll-call-teacher/options${buildQueryString({
      teacherType: options?.teacherType,
      q: options?.q,
      page: options?.page,
      size: options?.size,
    })}`,
    NO_STORE,
  );
  return unwrapAuthedEnvelope(payload);
}

export async function fetchRollCallTeacherBatchOptions(
  body: RollCallTeacherBatchOptionsRequestDto,
) {
  const payload = await serverRequestJson<ApiEnvelope<RollCallTeacherBatchOptionsResponseDto>>(
    "/api/admin/roll-call-teacher/batch/options",
    { ...NO_STORE, method: "POST", body },
  );
  return unwrapAuthedEnvelope(payload);
}

export async function updateRollCallTeacher(
  courseSessionId: number,
  teacherId: number,
) {
  const payload = await serverRequestJson<ApiEnvelope<RollCallTeacherDto>>(
    `/api/admin/course-sessions/${courseSessionId}/roll-call-teacher`,
    { ...NO_STORE, method: "PUT", body: { teacherId } },
  );
  return unwrapAuthedEnvelope(payload);
}

export async function updateRollCallTeacherBatch(
  body: RollCallTeacherBatchUpdateRequestDto,
) {
  const payload = await serverRequestJson<ApiEnvelope<RollCallTeacherBatchUpdateResponseDto>>(
    "/api/admin/roll-call-teacher/batch",
    { ...NO_STORE, method: "PUT", body },
  );
  return unwrapAuthedEnvelope(payload);
}

export async function updateRollCallTeacherMergeGroup(
  body: RollCallTeacherMergeGroupRequestDto,
) {
  const payload = await serverRequestJson<ApiEnvelope<RollCallTeacherMergeGroupResponseDto>>(
    "/api/admin/roll-call-teacher/merge-group",
    { ...NO_STORE, method: "PUT", body },
  );
  return unwrapAuthedEnvelope(payload);
}

export async function resetRollCallTeacher(courseSessionId: number) {
  const payload = await serverRequestJson<ApiEnvelope<RollCallTeacherDto>>(
    `/api/admin/course-sessions/${courseSessionId}/roll-call-teacher`,
    { ...NO_STORE, method: "DELETE" },
  );
  return unwrapAuthedEnvelope(payload);
}

export async function createExternalRollCallTeacher(
  courseSessionId: number,
  body: ExternalTeacherRequestDto,
) {
  const payload = await serverRequestJson<ApiEnvelope<RollCallTeacherDto>>(
    `/api/admin/course-sessions/${courseSessionId}/roll-call-teacher/external`,
    { ...NO_STORE, method: "POST", body },
  );
  return unwrapAuthedEnvelope(payload);
}
