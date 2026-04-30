const STATIC_EXPORT_PARAM = "_";

type QueryValue = string | number | null | undefined;
export const ADMIN_TIME_SETTING_KEYS = ["class-time", "attendance-window"] as const;
export type AdminTimeSettingKey = (typeof ADMIN_TIME_SETTING_KEYS)[number];
export const ADMIN_TIME_SETTING_STATIC_PARAMS = [
  STATIC_EXPORT_PARAM,
  ...ADMIN_TIME_SETTING_KEYS,
] as const;

function buildQueryHref(pathname: string, query: Record<string, QueryValue>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    params.set(key, String(value));
  }

  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function appendQueryHref(href: string, query: Record<string, QueryValue>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    params.set(key, String(value));
  }

  const queryString = params.toString();
  if (!queryString) {
    return href;
  }

  return `${href}${href.includes("?") ? "&" : "?"}${queryString}`;
}

export function resolveStaticExportParam(
  pathParam: string | undefined,
  searchParam: string | null | undefined,
) {
  const normalizedSearchParam = searchParam?.trim();
  if (normalizedSearchParam) {
    return normalizedSearchParam;
  }

  if (pathParam && pathParam !== STATIC_EXPORT_PARAM) {
    return pathParam;
  }

  return "";
}

export function buildAdminControlClassHref(
  classId: string | number,
  options: {
    courseSessionId?: string | number | null;
  } = {},
) {
  return buildQueryHref(`/admin/control/${STATIC_EXPORT_PARAM}`, {
    classId,
    courseSessionId: options.courseSessionId,
  });
}

export function buildAdminCourseSettingsEditHref(
  courseId: string | number,
  options: {
    courseSessionId?: string | number;
    returnTo?: string;
  } = {},
) {
  return buildQueryHref(`/admin/course-settings/${STATIC_EXPORT_PARAM}/edit`, {
    courseId,
    courseSessionId: options.courseSessionId,
    returnTo: options.returnTo,
  });
}

export function buildAdminCourseRosterHref(
  courseId: string | number,
  options: {
    courseSessionId?: string | number;
  } = {},
) {
  return buildQueryHref(`/admin/course-settings/${STATIC_EXPORT_PARAM}/students`, {
    courseId,
    courseSessionId: options.courseSessionId,
  });
}

export function buildAdminCourseStudentNewHref(
  courseId: string | number,
  options: {
    courseSessionId?: string | number;
  } = {},
) {
  return buildQueryHref(`/admin/course-settings/${STATIC_EXPORT_PARAM}/students/new`, {
    courseId,
    courseSessionId: options.courseSessionId,
  });
}

export function buildAdminCourseStudentImportHref(
  courseId: string | number,
  options: {
    courseSessionId?: string | number;
  } = {},
) {
  return buildQueryHref(`/admin/course-settings/${STATIC_EXPORT_PARAM}/students/import`, {
    courseId,
    courseSessionId: options.courseSessionId,
  });
}

export function buildAdminCourseStudentEditHref(
  courseId: string | number,
  studentId: string | number,
  options: {
    courseSessionId?: string | number;
  } = {},
) {
  return buildQueryHref(
    `/admin/course-settings/${STATIC_EXPORT_PARAM}/students/${STATIC_EXPORT_PARAM}/edit`,
    {
      courseId,
      studentId,
      courseSessionId: options.courseSessionId,
    },
  );
}

export function buildAdminEmergencyCourseHref(
  courseId: string | number,
  options: {
    courseSessionId?: string | number;
  } = {},
) {
  return buildQueryHref(`/admin/emergency/course/${STATIC_EXPORT_PARAM}`, {
    courseId,
    courseSessionId: options.courseSessionId,
  });
}

export function buildAdminSelectTeacherHref(
  courseId: string | number,
  options: {
    courseSessionId?: string | number;
    returnHref?: string;
    returnTo?: string;
    q?: string;
  } = {},
) {
  return buildQueryHref(`/admin/emergency/course/${STATIC_EXPORT_PARAM}/select-teacher`, {
    courseId,
    courseSessionId: options.courseSessionId,
    returnHref: options.returnHref,
    returnTo: options.returnTo,
    q: options.q,
  });
}

export function buildAdminExternalTeacherHref(
  courseId: string | number,
  options: {
    courseSessionId?: string | number;
    returnHref?: string;
    prefillName?: string;
    prefillPhone?: string;
  } = {},
) {
  return buildQueryHref(`/admin/emergency/course/${STATIC_EXPORT_PARAM}/external-teacher`, {
    courseId,
    courseSessionId: options.courseSessionId,
    returnHref: options.returnHref,
    prefillName: options.prefillName,
    prefillPhone: options.prefillPhone,
  });
}

export function buildAdminTimeSettingsHref(targetDate?: string) {
  return buildQueryHref("/admin/time-settings", {
    targetDate,
  });
}

export function buildAdminTimeSettingDetailHref(
  settingKey: AdminTimeSettingKey,
  targetDate?: string,
) {
  return buildQueryHref(`/admin/time-settings/${STATIC_EXPORT_PARAM}`, {
    courseSessionId: settingKey,
    targetDate,
  });
}

export function buildAdminTimeSettingPickerHref(
  settingKey: AdminTimeSettingKey,
  targetDate?: string,
) {
  return buildQueryHref(`/admin/time-settings/${STATIC_EXPORT_PARAM}/picker`, {
    courseSessionId: settingKey,
    targetDate,
  });
}
