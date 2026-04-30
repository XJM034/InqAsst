import type { AttendanceGroupStudent, AttendanceStudent } from "@/lib/domain/types";
import {
  clearClientSessionCookies,
  readClientCampusOptions,
  resolveHomeHref,
  setClientSessionCookies,
  type StoredCampusOption,
} from "@/lib/services/auth-session";
import { browserRequestJson } from "@/lib/services/http-client";
import { ApiRequestError, type ApiEnvelope } from "@/lib/services/http-core";
import {
  buildAttendanceGroupSubmitRequest,
  buildAttendanceSubmitRequest,
  mapAdminAttendanceRoster,
} from "@/lib/services/mobile-adapters";
import {
  RollCallTeacherBatchConflictError,
  extractRollCallTeacherBatchConflicts,
  summarizeRollCallTeacherBatchConflicts,
} from "@/lib/roll-call-teacher-batch";
import { normalizeRollCallTeacherConflictMessage } from "@/lib/roll-call-teacher-conflict";
import type {
  AdminCourseSettingsBlankStudentRequestDto,
  AdminCourseSettingsBlankTeacherRequestDto,
  AdminHomeSummaryDto,
  AdminCourseSettingsOverviewDto,
  AdminCourseSettingsTemporaryCourseOptionDto,
  AdminCourseSettingsTemporaryCourseRequestDto,
  CampusStudentSearchItemDto,
  CourseSessionTimeSettingDto,
  CourseLocationDto,
  CourseLocationUpdateRequestDto,
  HomeroomClassListItemDto,
  LoginCampusOptionDto,
  LoginResponseDto,
  AttendanceLatestDto,
  AttendanceSessionStatusDto,
  CourseStudentRowDto,
  ExistingStudentEnrollRequestDto,
  MeDto,
  PagedRowsDto,
  RollCallTeacherOptionDto,
  RollCallTeacherMergeGroupRequestDto,
  RollCallTeacherMergeGroupResponseDto,
  RollCallTeacherBatchUpdateRequestDto,
  RollCallTeacherBatchUpdateResponseDto,
  RollCallTeacherDto,
  StudentDetailDto,
  StudentUpsertRequestDto,
  TeacherEntityDto,
  ExternalTeacherRequestDto,
} from "@/lib/services/mobile-schema";

export type LoginCampusOption = LoginCampusOptionDto;

type LiveLoginResult = {
  mode: "live";
  homeHref: string;
};

type LoginSelectionResult = {
  mode: "selection";
  selectionToken: string;
  campusOptions: LoginCampusOptionDto[];
};

export type LoginResult = LiveLoginResult | LoginSelectionResult;

const ADMIN_ROLL_CALL_DEBUG_PREFIX = "[AdminRollCallDebug]";

function debugAdminRollCall(event: string, payload?: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof payload === "undefined") {
    console.log(`${ADMIN_ROLL_CALL_DEBUG_PREFIX} ${event}`);
    return;
  }

  console.log(`${ADMIN_ROLL_CALL_DEBUG_PREFIX} ${event}`, payload);
}

function readPublicApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "";
}

function isLocalApiBaseUrl(value: string) {
  return /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(value);
}

function buildLocalApiUnavailableMessage() {
  const baseUrl = readPublicApiBaseUrl();

  if (!baseUrl) {
    return "本地后端联调失败，请确认本地后端服务已启动";
  }

  return `本地后端联调失败，请确认 ${baseUrl} 已启动，并可打开 /swagger-ui/index.html`;
}

function buildSharedDevUnavailableMessage() {
  return "共享开发环境暂时无响应，请稍后重试";
}

function normalizeApiMessage(message?: string | null) {
  if (!message) {
    return "登录失败，请稍后重试";
  }

  const normalizedRollCallTeacherConflictMessage =
    normalizeRollCallTeacherConflictMessage(message);
  if (normalizedRollCallTeacherConflictMessage) {
    return normalizedRollCallTeacherConflictMessage;
  }

  const normalized = message.trim().toLowerCase();
  const publicApiBaseUrl = readPublicApiBaseUrl();
  const messageMap: Record<string, string> = {
    "invalid verification code": "验证码错误",
    "code expired or not sent": "验证码已过期或未发送",
    "account not found": "未找到对应账号",
    "phone matches both teacher and admin accounts":
      "该手机号同时匹配老师和管理员账号，请联系后端核对数据",
    "multiple teacher accounts found for this phone":
      "该手机号匹配到多个老师账号，请联系后端处理",
    "selection token expired": "校区选择已过期，请重新登录",
    "selected admin account not found for this phone": "所选校区账号无效，请重新登录",
  };

  if (normalized === "missing or invalid authorization header") {
    return "登录状态已失效，请重新登录";
  }

  if (
    normalized === "fetch failed" ||
    normalized.startsWith("request timed out after ") ||
    normalized === "request failed with status 500" ||
    normalized === "request failed with status 502" ||
    normalized === "request failed with status 503" ||
    normalized === "request failed with status 504"
  ) {
    return publicApiBaseUrl && isLocalApiBaseUrl(publicApiBaseUrl)
      ? buildLocalApiUnavailableMessage()
      : buildSharedDevUnavailableMessage();
  }

  return messageMap[normalized] ?? message;
}

function normalizeStudentUpsertMessage(message?: string | null) {
  const normalized = message?.trim().toLowerCase();

  switch (normalized) {
    case "name is required":
      return "请输入学生姓名";
    case "homeroomclassid is required":
      return "请选择行政班";
    case "external student id already exists":
      return "外部学生ID已存在，请更换后再试";
    case "studentid is required":
      return "请选择已有学生";
    case "homeroom campus mismatch":
      return "所选行政班不属于当前校区，请重新选择";
    case "student is not in course roster":
      return "该学生不在当前课程名单中，无法编辑";
    case "student not found":
      return "未找到该学生";
    case "course not found":
      return "未找到当前课程";
    case "forbidden":
      return "当前账号无权操作这条学生记录";
    case "request failed with status 403":
      return "当前老师账号暂不能补录临时学生，请联系管理员处理";
    case "request failed with status 404":
      return "教师端临时学生创建接口暂不可用，请联系管理员补录";
    case "server internal error":
    case "request failed with status 500":
      return "临时学生补录接口暂时异常，请联系管理员或后端同学确认教师端新增学生接口";
    default:
      return message ?? "保存失败，请稍后重试";
  }
}

function normalizeStudentUpsertError(error: unknown) {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return new Error(normalizeStudentUpsertMessage(error.message));
  }

  return new Error("保存失败，请稍后重试");
}

function normalizeStudentSearchError(error: unknown) {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return new Error(normalizeApiMessage(error.message) ?? "搜索学生失败，请稍后重试");
  }

  return new Error("搜索学生失败，请稍后重试");
}

function normalizeCourseLocationMessage(message?: string | null) {
  const normalized = message?.trim().toLowerCase();

  switch (normalized) {
    case "location is required":
      return "请填写上课地点";
    case "location too long":
      return "上课地点不能超过 200 个字符";
    case "course not found":
      return "未找到当前课程";
    case "forbidden":
      return "当前账号无权修改这门课程";
    default:
      return message ?? "保存失败，请稍后重试";
  }
}

function normalizeCourseLocationError(error: unknown) {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return new Error(normalizeCourseLocationMessage(error.message));
  }

  return new Error("保存失败，请稍后重试");
}

function normalizeTemporaryCourseMessage(message?: string | null) {
  const normalized = message?.trim().toLowerCase();

  if (!normalized) {
    return message ?? "新增失败，请稍后重试";
  }

  if (
    normalized === "must not be null" ||
    normalized === "cannot be null" ||
    normalized === "不能为null"
  ) {
    return "空白课程字段未被后端完整接收，请联系后端确认新增契约";
  }

  switch (normalized) {
    case "sessionid is required":
      return "请选择已有课程，或改用空白课程方式新增";
    case "course name is required":
    case "coursename is required":
      return "请填写课程名称";
    case "session start time is required":
    case "sessionstartat is required":
      return "请选择开始时间";
    case "session end time is required":
    case "sessionendat is required":
      return "请选择结束时间";
    case "session end time must be after start time":
    case "session time range is invalid":
      return "结束时间必须晚于开始时间";
    case "students is required":
    case "students cannot be empty":
    case "at least one student is required":
      return "请至少添加 1 名学生";
    case "student name is required":
    case "external student name is required":
      return "请输入系统外学生姓名";
    case "homeroomclassid is required":
    case "student homeroomclassid is required":
    case "external student homeroomclassid is required":
      return "请选择系统外学生的行政班";
    case "teacherid is required":
    case "teacher is required":
      return "请至少添加 1 名老师";
    case "teacher name is required":
    case "external teacher name is required":
      return "请输入系统外老师姓名";
    case "teacher phone is required":
    case "external teacher phone is required":
      return "请输入系统外老师手机号";
    case "blank course date must be today":
      return "空白课程只能创建今天的课程";
    case "external teacher phone belongs to internal teacher":
      return "该手机号老师已在系统内，请改用系统内老师";
    case "location too long":
      return "上课地点不能超过 200 个字符";
    case "teacher name too long":
      return "老师姓名不能超过 50 个字符";
    default:
      return message ?? "新增失败，请稍后重试";
  }
}

function normalizeTemporaryCourseError(error: unknown) {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return new Error(normalizeTemporaryCourseMessage(error.message));
  }

  return new Error("新增失败，请稍后重试");
}

function normalizeExternalTeacherMessage(message?: string | null) {
  const normalized = message?.trim().toLowerCase();

  switch (normalized) {
    case "teacher name is required":
    case "external teacher name is required":
      return "请输入系统外老师姓名";
    case "teacher phone is required":
    case "external teacher phone is required":
      return "请输入系统外老师手机号";
    case "external teacher phone belongs to internal teacher":
      return "该手机号老师已在系统内，请改用系统内老师";
    case "teacher name too long":
      return "老师姓名不能超过 50 个字符";
    default:
      return message ?? "保存失败，请稍后重试";
  }
}

function normalizeExternalTeacherError(error: unknown) {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return new Error(normalizeExternalTeacherMessage(error.message));
  }

  return new Error("保存失败，请稍后重试");
}

function normalizeLookupError(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return new Error(normalizeApiMessage(error.message) ?? fallbackMessage);
  }

  return new Error(fallbackMessage);
}

function normalizeLoginError(error: unknown) {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return new Error(normalizeApiMessage(error.message));
  }

  return new Error("登录失败，请稍后重试");
}

function unwrapApiData<T>(payload: ApiEnvelope<T>) {
  if (typeof payload.code === "number" && payload.code !== 0) {
    throw new Error(normalizeApiMessage(payload.message));
  }

  return payload.data;
}

function toStoredCampusOptions(options?: LoginCampusOptionDto[] | null) {
  return (
    options?.map<StoredCampusOption>((option) => ({
      campusId: String(option.campusId),
      campusName: option.campusName,
      adminUserId: option.adminUserId,
      adminName: option.adminName,
    })) ?? []
  );
}

function buildLiveLoginResult(
  response: LoginResponseDto,
  options?: {
    campusOptions?: StoredCampusOption[] | null;
    adminUserId?: number | null;
  },
): LiveLoginResult {
  if (!response.token) {
    throw new Error("登录成功但未返回 token");
  }

  setClientSessionCookies({
    token: response.token,
    role: response.role,
    name: response.name,
    campusName: response.campusName,
    adminUserId: response.adminUserId ?? options?.adminUserId ?? null,
    campusOptions:
      options?.campusOptions ??
      (response.campusOptions ? toStoredCampusOptions(response.campusOptions) : null),
  });

  return {
    mode: "live" as const,
    homeHref: resolveHomeHref(response.role),
  };
}

function buildSelectionResult(response: LoginResponseDto): LoginSelectionResult {
  if (!response.selectionToken || !response.campusOptions?.length) {
    throw new Error("校区选择信息不完整，请稍后重试");
  }

  return {
    mode: "selection",
    selectionToken: response.selectionToken,
    campusOptions: response.campusOptions,
  };
}

export async function sendLoginCode(phone: string) {
  try {
    const payload = await browserRequestJson<ApiEnvelope<null>>("/api/auth/send-code", {
      method: "POST",
      body: { phone },
    });

    if (typeof payload.code === "number" && payload.code !== 0) {
      throw new Error(normalizeApiMessage(payload.message));
    }

    return payload.message ?? "验证码已发送";
  } catch (error) {
    throw normalizeLoginError(error);
  }
}

export async function loginWithCode(phone: string, code: string) {
  try {
    const payload = await browserRequestJson<ApiEnvelope<LoginResponseDto>>("/api/auth/login", {
      method: "POST",
      body: { phone, code },
    });
    const response = unwrapApiData(payload);

    if (response.selectionRequired) {
      return buildSelectionResult(response);
    }

    return buildLiveLoginResult(response);
  } catch (error) {
    throw normalizeLoginError(error);
  }
}

export async function selectCampusAfterLogin(
  selectionToken: string,
  adminUserId: number,
  campusOptions: LoginCampusOptionDto[],
) {
  try {
    const payload = await browserRequestJson<ApiEnvelope<LoginResponseDto>>(
      "/api/auth/select-campus",
      {
        method: "POST",
        body: {
          selectionToken,
          adminUserId,
        },
      },
    );
    const response = unwrapApiData(payload);

    return buildLiveLoginResult(response, {
      adminUserId,
      campusOptions: toStoredCampusOptions(campusOptions),
    });
  } catch (error) {
    throw normalizeLoginError(error);
  }
}

export async function switchAdminCampus(adminUserId: number) {
  try {
    const payload = await browserRequestJson<ApiEnvelope<LoginResponseDto>>(
      "/api/auth/switch-campus",
      {
        method: "POST",
        auth: true,
        body: {
          adminUserId,
        },
      },
    );
    const response = unwrapApiData(payload);

    return buildLiveLoginResult(response, {
      adminUserId,
      campusOptions: readClientCampusOptions(),
    });
  } catch (error) {
    throw normalizeLoginError(error);
  }
}

export async function logoutCurrentUser() {
  try {
    await browserRequestJson<ApiEnvelope<null>>("/api/auth/logout", {
      method: "POST",
      auth: true,
    });
  } finally {
    clearClientSessionCookies();
  }
}

export async function submitTeacherAttendance(payload: {
  courseId: string;
  courseSessionId?: string;
  students: AttendanceStudent[];
}) {
  const body = buildAttendanceSubmitRequest(payload.students, payload.courseSessionId);

  await browserRequestJson<ApiEnvelope<Record<string, never>>>(
    `/api/courses/${payload.courseId}/attendance`,
    {
      method: "POST",
      auth: true,
      body,
    },
  );
}

export async function submitTeacherAttendanceGroup(payload: {
  groupId: string;
  students: AttendanceGroupStudent[];
}) {
  const body = buildAttendanceGroupSubmitRequest(payload.students);

  await browserRequestJson<ApiEnvelope<Record<string, never>>>(
    `/api/teacher/attendance/groups/${payload.groupId}`,
    {
      method: "POST",
      auth: true,
      body,
    },
  );
}

export async function createTeacherTemporaryStudent(
  courseId: string,
  body: StudentUpsertRequestDto,
  options?: { courseSessionId?: string | null },
) {
  try {
    const query = new URLSearchParams();
    if (options?.courseSessionId) {
      query.set("courseSessionId", options.courseSessionId);
    }
    const suffix = query.toString() ? `?${query.toString()}` : "";
    const response = await browserRequestJson<ApiEnvelope<StudentDetailDto>>(
      `/api/courses/${courseId}/students${suffix}`,
      { method: "POST", auth: true, body },
    );
    return unwrapApiData(response);
  } catch (error) {
    throw normalizeStudentUpsertError(error);
  }
}

export async function fetchTeacherAttendanceStatus(payload: {
  courseId: string;
  courseSessionId?: string;
}) {
  const response = await browserRequestJson<ApiEnvelope<AttendanceSessionStatusDto>>(
    `/api/courses/${payload.courseId}/attendance/status?${new URLSearchParams(
      payload.courseSessionId
        ? { courseSessionId: payload.courseSessionId }
        : {},
    ).toString()}`,
    {
      method: "GET",
      auth: true,
    },
  );

  return unwrapApiData(response);
}

export async function fetchAdminAttendanceRoster(payload: {
  courseId: string;
  courseSessionId?: string;
}) {
  const query = new URLSearchParams(
    payload.courseSessionId ? { courseSessionId: payload.courseSessionId } : {},
  ).toString();
  const suffix = query ? `?${query}` : "";

  const [studentsResponse, latestResponse] = await Promise.all([
    browserRequestJson<ApiEnvelope<CourseStudentRowDto[]>>(
      `/api/admin/courses/${payload.courseId}/students${suffix}`,
      {
        auth: true,
      },
    ),
    browserRequestJson<ApiEnvelope<AttendanceLatestDto>>(
      `/api/admin/courses/${payload.courseId}/attendance/latest${suffix}`,
      {
        auth: true,
      },
    ),
  ]);

  return mapAdminAttendanceRoster(
    unwrapApiData(studentsResponse),
    unwrapApiData(latestResponse),
  );
}

export async function fetchTeacherLatestAttendance(payload: {
  courseId: string;
  courseSessionId?: string;
}) {
  const response = await browserRequestJson<ApiEnvelope<AttendanceLatestDto | null>>(
    `/api/courses/${payload.courseId}/attendance/latest?${new URLSearchParams(
      payload.courseSessionId
        ? { courseSessionId: payload.courseSessionId }
        : {},
    ).toString()}`,
    {
      method: "GET",
      auth: true,
    },
  );

  return unwrapApiData(response);
}

export async function submitAdminAttendance(payload: {
  courseId: string;
  courseSessionId?: string;
  students: AttendanceStudent[];
}) {
  const body = buildAttendanceSubmitRequest(payload.students, payload.courseSessionId);

  await browserRequestJson<ApiEnvelope<Record<string, never>>>(
    `/api/admin/courses/${payload.courseId}/attendance`,
    {
      method: "POST",
      auth: true,
      body,
    },
  );
}

export async function updateAdminCourseSessionTimeSetting(payload: {
  courseSessionId: string;
  kind: "actual" | "roll-call";
} & (
  | {
      kind: "actual";
      startTime: string;
      endTime: string;
    }
  | {
      kind: "roll-call";
      startOffsetMinutes: number;
      endOffsetMinutes: number;
    }
)) {
  const url = `/api/admin/course-sessions/${payload.courseSessionId}/${payload.kind === "actual" ? "actual-time" : "roll-call-time"}`;
  debugAdminRollCall("client.updateAdminCourseSessionTimeSetting.request", {
    url,
    payload,
  });

  const response = await browserRequestJson<ApiEnvelope<CourseSessionTimeSettingDto>>(
    url,
    {
      method: "PUT",
      auth: true,
      body:
        payload.kind === "actual"
          ? {
              startTime: payload.startTime,
              endTime: payload.endTime,
            }
          : {
              startOffsetMinutes: payload.startOffsetMinutes,
              endOffsetMinutes: payload.endOffsetMinutes,
            },
    },
  );

  const data = unwrapApiData(response);
  debugAdminRollCall("client.updateAdminCourseSessionTimeSetting.response", {
    url,
    data,
  });
  return data;
}

export async function updateAdminCampusActualTime(payload: {
  campusId: string;
  targetDate: string;
  startTime: string;
  endTime: string;
}) {
  const response = await browserRequestJson<ApiEnvelope<CourseSessionTimeSettingDto>>(
    `/api/admin/campuses/${payload.campusId}/actual-time`,
    {
      method: "PUT",
      auth: true,
      body: {
        targetDate: payload.targetDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
      },
    },
  );

  return unwrapApiData(response);
}

export async function updateAdminCampusRollCallRule(payload: {
  campusId: string;
  beforeStartMinutes: number;
  afterStartMinutes: number;
}) {
  const response = await browserRequestJson<
    ApiEnvelope<{
      campusId: number;
      beforeStartMinutes: number;
      afterStartMinutes: number;
    }>
  >(`/api/admin/campuses/${payload.campusId}/roll-call-rule`, {
    method: "PUT",
    auth: true,
    body: {
      beforeStartMinutes: payload.beforeStartMinutes,
      afterStartMinutes: payload.afterStartMinutes,
    },
  });

  return unwrapApiData(response);
}

export async function resetAdminCourseSessionTimeSetting(payload: {
  courseSessionId: string;
  kind: "actual" | "roll-call";
}) {
  const url = `/api/admin/course-sessions/${payload.courseSessionId}/${payload.kind === "actual" ? "actual-time" : "roll-call-time"}`;
  debugAdminRollCall("client.resetAdminCourseSessionTimeSetting.request", {
    url,
    payload,
  });

  const response = await browserRequestJson<ApiEnvelope<CourseSessionTimeSettingDto>>(
    url,
    {
      method: "DELETE",
      auth: true,
    },
  );

  const data = unwrapApiData(response);
  debugAdminRollCall("client.resetAdminCourseSessionTimeSetting.response", {
    url,
    data,
  });
  return data;
}

export async function resetAdminCampusActualTime(payload: {
  campusId: string;
  targetDate: string;
}) {
  const response = await browserRequestJson<ApiEnvelope<CourseSessionTimeSettingDto>>(
    `/api/admin/campuses/${payload.campusId}/actual-time?${new URLSearchParams({
      targetDate: payload.targetDate,
    }).toString()}`,
    {
      method: "DELETE",
      auth: true,
    },
  );

  return unwrapApiData(response);
}

export async function fetchAdminMeProfileClient() {
  try {
    const response = await browserRequestJson<ApiEnvelope<MeDto>>("/api/admin/me", {
      method: "GET",
      auth: true,
    });
    return unwrapApiData(response);
  } catch (error) {
    throw normalizeLookupError(error, "当前管理员信息加载失败，请稍后重试");
  }
}

export async function fetchAdminHomeSummaryClient(date?: string) {
  try {
    const query = new URLSearchParams(
      Object.entries({ date }).reduce<Record<string, string>>((result, [key, value]) => {
        if (value) {
          result[key] = value;
        }
        return result;
      }, {}),
    ).toString();
    const suffix = query ? `?${query}` : "";
    const response = await browserRequestJson<ApiEnvelope<AdminHomeSummaryDto>>(
      `/api/admin/home/summary${suffix}`,
      {
        method: "GET",
        auth: true,
      },
    );
    const data = unwrapApiData(response);
    debugAdminRollCall("client.fetchAdminHomeSummaryClient.response", {
      date,
      data,
    });
    return data;
  } catch (error) {
    throw normalizeLookupError(error, "首页时间摘要加载失败，请稍后重试");
  }
}

export async function fetchAdminTeachersClient() {
  try {
    const response = await browserRequestJson<ApiEnvelope<TeacherEntityDto[]>>(
      "/api/admin/teachers",
      {
        method: "GET",
        auth: true,
      },
    );
    return unwrapApiData(response);
  } catch (error) {
    throw normalizeLookupError(error, "系统内老师列表加载失败，请稍后重试");
  }
}

export async function fetchRollCallTeacherOptionsClient(
  courseSessionId: string,
  options?: {
    teacherType?: "INTERNAL" | "EXTERNAL" | "ALL";
    q?: string;
    page?: number;
    size?: number;
  },
) {
  try {
    const query = new URLSearchParams({
      ...(options?.teacherType ? { teacherType: options.teacherType } : {}),
      ...(options?.q ? { q: options.q } : {}),
      ...(typeof options?.page === "number" ? { page: String(options.page) } : {}),
      ...(typeof options?.size === "number" ? { size: String(options.size) } : {}),
    }).toString();
    const suffix = query ? `?${query}` : "";
    const response = await browserRequestJson<ApiEnvelope<PagedRowsDto<RollCallTeacherOptionDto>>>(
      `/api/admin/course-sessions/${courseSessionId}/roll-call-teacher/options${suffix}`,
      {
        method: "GET",
        auth: true,
      },
    );
    return unwrapApiData(response);
  } catch (error) {
    throw normalizeLookupError(error, "老师候选列表加载失败，请稍后重试");
  }
}

export async function fetchAdminCampusClassesClient(campusId: number) {
  try {
    const response = await browserRequestJson<ApiEnvelope<HomeroomClassListItemDto[]>>(
      `/api/admin/campuses/${campusId}/classes`,
      {
        method: "GET",
        auth: true,
      },
    );
    return unwrapApiData(response);
  } catch (error) {
    throw normalizeLookupError(error, "行政班列表加载失败，请稍后重试");
  }
}

export async function fetchAdminTimeSettingsSessionsClient(options?: {
  date?: string;
  courseId?: number;
}) {
  try {
    const query = new URLSearchParams(
      Object.entries({
        date: options?.date,
        courseId:
          typeof options?.courseId === "number" ? String(options.courseId) : undefined,
      }).reduce<Record<string, string>>((result, [key, value]) => {
        if (value) {
          result[key] = value;
        }
        return result;
      }, {}),
    ).toString();
    const suffix = query ? `?${query}` : "";
    const response = await browserRequestJson<ApiEnvelope<CourseSessionTimeSettingDto[]>>(
      `/api/admin/time-settings/sessions${suffix}`,
      {
        method: "GET",
        auth: true,
      },
    );
    const data = unwrapApiData(response);
    debugAdminRollCall("client.fetchAdminTimeSettingsSessionsClient.response", {
      options,
      firstItem: data[0],
      count: data.length,
    });
    return data;
  } catch (error) {
    throw normalizeLookupError(error, "时间设置加载失败，请稍后重试");
  }
}

export async function createStudent(courseId: string, body: StudentUpsertRequestDto) {
  try {
    const response = await browserRequestJson<ApiEnvelope<StudentDetailDto>>(
      `/api/admin/courses/${courseId}/students`,
      { method: "POST", auth: true, body },
    );
    return unwrapApiData(response);
  } catch (error) {
    throw normalizeStudentUpsertError(error);
  }
}

export async function addExistingStudentToCourse(
  courseId: string,
  body: ExistingStudentEnrollRequestDto,
) {
  try {
    const response = await browserRequestJson<ApiEnvelope<StudentDetailDto>>(
      `/api/admin/courses/${courseId}/students/existing`,
      { method: "POST", auth: true, body },
    );
    return unwrapApiData(response);
  } catch (error) {
    throw normalizeStudentUpsertError(error);
  }
}

export async function searchAdminCampusStudents(
  campusId: number,
  q: string,
  limit = 10,
) {
  try {
    const query = new URLSearchParams({
      q,
      limit: String(limit),
    }).toString();
    const response = await browserRequestJson<ApiEnvelope<CampusStudentSearchItemDto[]>>(
      `/api/admin/campuses/${campusId}/students/search?${query}`,
      {
        method: "GET",
        auth: true,
      },
    );
    return unwrapApiData(response);
  } catch (error) {
    throw normalizeStudentSearchError(error);
  }
}

export async function fetchAdminStudentsPage(page = 0, size = 100) {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  }).toString();
  const response = await browserRequestJson<
    ApiEnvelope<
      PagedRowsDto<{
        id: number;
        homeroomClassId?: number | null;
        name: string;
        externalStudentId?: string | null;
      }>
    >
  >(`/api/admin/students?${query}`, {
    method: "GET",
    auth: true,
  });

  return unwrapApiData(response);
}

export async function updateStudent(
  courseId: string,
  studentId: string,
  body: StudentUpsertRequestDto,
) {
  try {
    const response = await browserRequestJson<ApiEnvelope<StudentDetailDto>>(
      `/api/admin/courses/${courseId}/students/${studentId}`,
      { method: "PUT", auth: true, body },
    );
    return unwrapApiData(response);
  } catch (error) {
    throw normalizeStudentUpsertError(error);
  }
}

export async function updateAdminCourseLocation(
  courseId: string,
  body: CourseLocationUpdateRequestDto,
) {
  try {
    const response = await browserRequestJson<ApiEnvelope<CourseLocationDto>>(
      `/api/admin/courses/${courseId}/location`,
      { method: "PUT", auth: true, body },
    );
    return unwrapApiData(response);
  } catch (error) {
    throw normalizeCourseLocationError(error);
  }
}

export async function fetchAdminCourseSettingsOverviewClient(date?: string) {
  const query = new URLSearchParams(date ? { date } : {}).toString();
  const suffix = query ? `?${query}` : "";
  const response = await browserRequestJson<ApiEnvelope<AdminCourseSettingsOverviewDto>>(
    `/api/admin/course-settings/overview${suffix}`,
    { method: "GET", auth: true },
  );
  return unwrapApiData(response);
}

export async function updateAdminCourseSettingsRule(payload: {
  date?: string;
  ruleMode: "DEFAULT_DAY" | "ALTERNATE_DAY";
  alternateWeekday?: number;
}) {
  const response = await browserRequestJson<ApiEnvelope<AdminCourseSettingsOverviewDto>>(
    "/api/admin/course-settings/rule",
    {
      method: "PUT",
      auth: true,
      body: {
        date: payload.date,
        ruleMode: payload.ruleMode,
        alternateWeekday: payload.alternateWeekday,
      },
    },
  );
  return unwrapApiData(response);
}

export async function fetchAdminCourseSettingsTemporaryOptions(date?: string) {
  const query = new URLSearchParams(date ? { date } : {}).toString();
  const suffix = query ? `?${query}` : "";
  const response = await browserRequestJson<ApiEnvelope<AdminCourseSettingsTemporaryCourseOptionDto[]>>(
    `/api/admin/course-settings/temporary-course-options${suffix}`,
    { method: "GET", auth: true },
  );
  return unwrapApiData(response);
}

export async function addAdminCourseSettingsTemporaryCourse(
  payload: (
    | {
        date?: string;
        sessionId: string;
      }
    | {
        date?: string;
        courseName: string;
        sessionStartAt: string;
        sessionEndAt: string;
        location?: string;
        teacher?: AdminCourseSettingsBlankTeacherRequestDto;
        students: AdminCourseSettingsBlankStudentRequestDto[];
      }
  ),
) {
  try {
    const body: AdminCourseSettingsTemporaryCourseRequestDto =
      "sessionId" in payload
        ? {
            date: payload.date,
            sessionId: Number(payload.sessionId),
          }
        : {
            date: payload.date,
            courseName: payload.courseName,
            sessionStartAt: payload.sessionStartAt,
            sessionEndAt: payload.sessionEndAt,
            location: payload.location,
            teacher: payload.teacher,
            students: payload.students,
          };
    const response = await browserRequestJson<ApiEnvelope<AdminCourseSettingsOverviewDto>>(
      "/api/admin/course-settings/temporary-courses",
      {
        method: "POST",
        auth: true,
        body,
      },
    );
    return unwrapApiData(response);
  } catch (error) {
    throw normalizeTemporaryCourseError(error);
  }
}

export async function removeAdminCourseSettingsEffectiveCourse(payload: {
  date?: string;
  sessionId: string;
}) {
  const query = new URLSearchParams(payload.date ? { date: payload.date } : {}).toString();
  const suffix = query ? `?${query}` : "";
  const response = await browserRequestJson<ApiEnvelope<AdminCourseSettingsOverviewDto>>(
    `/api/admin/course-settings/effective-courses/${payload.sessionId}${suffix}`,
    {
      method: "DELETE",
      auth: true,
    },
  );
  return unwrapApiData(response);
}

export async function setRollCallTeacher(courseSessionId: string, teacherId: number) {
  const response = await browserRequestJson<ApiEnvelope<RollCallTeacherDto>>(
    `/api/admin/course-sessions/${courseSessionId}/roll-call-teacher`,
    { method: "PUT", auth: true, body: { teacherId } },
  );
  return unwrapApiData(response);
}

export async function clearRollCallTeacher(courseSessionId: string) {
  const response = await browserRequestJson<ApiEnvelope<RollCallTeacherDto>>(
    `/api/admin/course-sessions/${courseSessionId}/roll-call-teacher`,
    { method: "DELETE", auth: true },
  );
  return unwrapApiData(response);
}

export async function setRollCallTeacherBatch(
  body: RollCallTeacherBatchUpdateRequestDto,
) {
  try {
    const response = await browserRequestJson<ApiEnvelope<RollCallTeacherBatchUpdateResponseDto>>(
      "/api/admin/roll-call-teacher/batch",
      { method: "PUT", auth: true, body },
    );
    const conflicts = extractRollCallTeacherBatchConflicts(response);
    if (conflicts.length > 0) {
      throw new RollCallTeacherBatchConflictError(
        summarizeRollCallTeacherBatchConflicts(conflicts),
        conflicts,
      );
    }

    if (typeof response.code === "number" && response.code !== 0) {
      throw new Error(normalizeApiMessage(response.message));
    }

    return response.data;
  } catch (error) {
    if (error instanceof RollCallTeacherBatchConflictError) {
      throw error;
    }

    if (error instanceof ApiRequestError) {
      const conflicts = extractRollCallTeacherBatchConflicts(error.payload);
      if (conflicts.length > 0) {
        throw new RollCallTeacherBatchConflictError(
          summarizeRollCallTeacherBatchConflicts(conflicts),
          conflicts,
        );
      }

      throw new Error(normalizeApiMessage(error.message) ?? "批量更换老师失败，请稍后重试");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("批量更换老师失败，请稍后重试");
  }
}

export async function setRollCallTeacherMergeGroup(
  body: RollCallTeacherMergeGroupRequestDto,
) {
  try {
    const response = await browserRequestJson<ApiEnvelope<RollCallTeacherMergeGroupResponseDto>>(
      "/api/admin/roll-call-teacher/merge-group",
      { method: "PUT", auth: true, body },
    );
    const conflicts = extractRollCallTeacherBatchConflicts(response);
    if (conflicts.length > 0) {
      throw new RollCallTeacherBatchConflictError(
        summarizeRollCallTeacherBatchConflicts(conflicts),
        conflicts,
      );
    }

    if (typeof response.code === "number" && response.code !== 0) {
      throw new Error(normalizeApiMessage(response.message));
    }

    return response.data;
  } catch (error) {
    if (error instanceof RollCallTeacherBatchConflictError) {
      throw error;
    }

    if (error instanceof ApiRequestError) {
      const conflicts = extractRollCallTeacherBatchConflicts(error.payload);
      if (conflicts.length > 0) {
        throw new RollCallTeacherBatchConflictError(
          summarizeRollCallTeacherBatchConflicts(conflicts),
          conflicts,
        );
      }

      throw new Error(normalizeApiMessage(error.message) ?? "创建合班失败，请稍后重试");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("创建合班失败，请稍后重试");
  }
}

export async function createExternalTeacher(
  courseSessionId: string,
  body: ExternalTeacherRequestDto,
) {
  try {
    const response = await browserRequestJson<ApiEnvelope<RollCallTeacherDto>>(
      `/api/admin/course-sessions/${courseSessionId}/roll-call-teacher/external`,
      { method: "POST", auth: true, body },
    );
    return unwrapApiData(response);
  } catch (error) {
    throw normalizeExternalTeacherError(error);
  }
}
