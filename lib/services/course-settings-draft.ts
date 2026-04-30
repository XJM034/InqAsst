import type {
  AdminCourseRosterData,
  AdminCourseSettingsData,
  AdminCourseStudentFormData,
  AdminExternalTeacherData,
  AdminTeacherSelectionData,
} from "@/lib/domain/types";

const DAY_OPTIONS = [
  { key: "mon", label: "周一" },
  { key: "tue", label: "周二" },
  { key: "wed", label: "周三" },
  { key: "thu", label: "周四" },
  { key: "fri", label: "周五" },
  { key: "sat", label: "周六" },
  { key: "sun", label: "周日" },
] as const;

type CourseSettingsDraftState = {
  version: 1;
  ruleMode: CourseSettingsRuleMode;
  alternateDayKey: CourseSettingsDayKey;
  liveCourseLocationOverrides: Record<string, string>;
  draftCourses: DraftCourse[];
  externalTeachers: DraftTeacher[];
};

const EMPTY_DRAFT_STATE: CourseSettingsDraftState = {
  version: 1,
  ruleMode: "default",
  alternateDayKey: "mon",
  liveCourseLocationOverrides: {},
  draftCourses: [],
  externalTeachers: [],
};

export type CourseSettingsRuleMode = "default" | "alternate";
export type CourseSettingsDayKey = (typeof DAY_OPTIONS)[number]["key"];
export type DraftCourseKind = "temporary" | "makeup";
export type DraftTeacherSource = "internal" | "external";

export type DraftTeacher = {
  id: string;
  name: string;
  phone?: string | null;
  source: DraftTeacherSource;
  manual?: boolean;
};

export type DraftStudent = {
  id: string;
  name: string;
  studentCode: string;
  homeroomClass: string;
  homeroomClassId?: number | null;
  highlighted?: boolean;
};

export type DraftCourse = {
  id: string;
  kind: DraftCourseKind;
  title: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  teacher: DraftTeacher | null;
  students: DraftStudent[];
};

export type CourseEditorData = {
  id: string;
  mode: "live" | "draft";
  kind: DraftCourseKind | "live";
  title: string;
  badge: string;
  intro: string;
  courseTitle: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  teacherLabel: string;
  teacherBadges: string[];
  studentCount: number;
  rosterHref: string;
  saveLabel: string;
  allowTeacherEdit: boolean;
  allowStudentEdit: boolean;
  courseSessionId?: string;
};

function splitTimeLabel(timeLabel?: string) {
  if (!timeLabel) {
    return {
      timeStart: "",
      timeEnd: "",
    };
  }

  const [timeStart = "", timeEnd = ""] = timeLabel.split("-");
  return {
    timeStart,
    timeEnd,
  };
}

function findLiveCourse(
  baseData: AdminCourseSettingsData,
  courseId: string,
  courseSessionId?: string,
) {
  const preferredId = courseSessionId ? `${courseId}:${courseSessionId}` : courseId;

  return (
    baseData.courses.find((course) => course.id === preferredId) ??
    baseData.courses.find(
      (course) =>
        course.courseId === courseId &&
        (!courseSessionId || course.sessionId === courseSessionId),
    ) ??
    baseData.courses.find((course) => course.courseId === courseId) ??
    null
  );
}

export function isDraftCourseId(_courseId: string) {
  return false;
}

export function isDraftStudentId(_studentId: string) {
  return false;
}

export function getCourseSettingsDayOptions() {
  return DAY_OPTIONS;
}

export function getDefaultHomeroomClasses() {
  return [] as Array<{ id: number; name: string }>;
}

export function getCourseSettingsDraftState(_campus: string) {
  return { ...EMPTY_DRAFT_STATE };
}

export function createCourseDraft(_campus: string, _kind: DraftCourseKind = "temporary") {
  throw new Error("课程设置已移除本地草稿功能，请使用真实后端接口。");
}

export function updateCourseRuleMode(_campus: string, _ruleMode: CourseSettingsRuleMode) {}

export function updateAlternateDayKey(_campus: string, _dayKey: CourseSettingsDayKey) {}

export function getDraftCourseById(_campus: string, _courseId: string) {
  return null;
}

export function updateDraftCourse(
  _campus: string,
  _courseId: string,
  _updates: Partial<Omit<DraftCourse, "id" | "kind" | "students">> & {
    students?: DraftStudent[];
  },
) {}

export function rememberExternalTeacher(_campus: string, _teacher: DraftTeacher) {}

export function setDraftCourseTeacher(
  _campus: string,
  _courseId: string,
  _teacher: DraftTeacher,
) {}

export function getCampusExternalTeachers(_campus: string) {
  return [] as DraftTeacher[];
}

export function upsertDraftCourseStudent(
  _campus: string,
  _courseId: string,
  _studentId: string,
  _payload: {
    name: string;
    studentCode: string;
    homeroomClass: string;
    homeroomClassId?: number | null;
  },
) {}

export function applyCourseSettingsDraft(
  _campus: string,
  baseData: AdminCourseSettingsData,
) {
  return baseData;
}

export function buildDraftCourseRosterData(
  _campus: string,
  _courseId: string,
): AdminCourseRosterData | null {
  return null;
}

export function buildDraftStudentFormData(
  _campus: string,
  _courseId: string,
  _studentId = "new",
): AdminCourseStudentFormData | null {
  return null;
}

export function buildCourseEditorData(
  _campus: string,
  baseData: AdminCourseSettingsData,
  courseId: string,
  courseSessionId?: string,
): CourseEditorData | null {
  const course = findLiveCourse(baseData, courseId, courseSessionId);
  if (!course) {
    return null;
  }

  const { timeStart, timeEnd } = splitTimeLabel(course.timeLabel);

  return {
    id: course.id,
    mode: "live",
    kind: "live",
    title: "编辑课程信息",
    badge: course.badgeLabel,
    intro: "当前页面只保留真实接口能力，不再提供本地草稿或浏览器内测试数据。",
    courseTitle: course.title,
    timeStart,
    timeEnd,
    location: course.locationLabel ?? "",
    teacherLabel: course.teacherLabel ?? "待分配老师",
    teacherBadges: [],
    studentCount: course.studentCount ?? 0,
    rosterHref: course.rosterHref,
    saveLabel: "保存课程信息",
    allowTeacherEdit: true,
    allowStudentEdit: true,
    courseSessionId: courseSessionId ?? course.sessionId,
  };
}

export function buildDraftTeacherSelection(
  _campus: string,
  _courseId: string,
): AdminTeacherSelectionData | null {
  return null;
}

export function mergeTeacherSelectionWithDraftRegistry(
  _campus: string,
  data: AdminTeacherSelectionData,
) {
  return data;
}

export function buildDraftExternalTeacherForm(
  _campus: string,
  _courseId: string,
): AdminExternalTeacherData | null {
  return null;
}
