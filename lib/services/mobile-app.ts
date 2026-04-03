import {
  adminClassAttendanceData,
  adminControlData,
  adminCourseRosters,
  adminCourseSettingsData,
  adminCourseTeachersData,
  adminCourseStudentForms,
  adminCourseStudentImports,
  adminEmergencyData,
  adminExternalTeacherForms,
  adminHomeData,
  adminProfile,
  adminTeacherSelections,
  adminTeacherSettingCourses,
  adminTimePickerData,
  adminTimeSettingDetails,
  adminTimeSettingsData,
  adminUnarrivedData,
  attendanceSession,
  mockLoginAccounts,
  roleOptions,
  teacherHomeData,
  teacherProfile,
} from "@/lib/mocks/mobile-data";

export async function getRoleOptions() {
  return roleOptions;
}

export function resolveLoginDestination(phone: string) {
  const normalized = phone.replace(/\D/g, "");
  const matchedAccount = mockLoginAccounts.find((item) => item.phone === normalized);

  if (matchedAccount) {
    return matchedAccount.homeHref;
  }

  if (normalized.length !== 11) {
    return null;
  }

  return normalized.startsWith("181") ? "/admin/home" : "/teacher/home";
}

export async function getTeacherHomeData() {
  return teacherHomeData;
}

export async function getAttendanceSession(sessionId: string) {
  if (sessionId !== attendanceSession.id) {
    return null;
  }

  return attendanceSession;
}

export async function getTeacherProfile() {
  return teacherProfile;
}

export async function getAdminHomeData() {
  return adminHomeData;
}

export async function getAdminProfile() {
  return adminProfile;
}

export async function getAdminCourseTeachersData() {
  return adminCourseTeachersData;
}

export async function getAdminControlData() {
  return adminControlData;
}

export async function getAdminClassStatus(classId: string) {
  return adminControlData.classes.find((item) => item.id === classId) ?? null;
}

export async function getAdminClassAttendanceData(classId: string) {
  return adminClassAttendanceData[classId] ?? null;
}

export async function getAdminUnarrivedData() {
  return adminUnarrivedData;
}

export async function getAdminEmergencyData() {
  return adminEmergencyData;
}

export async function getAdminCourseSettingsData() {
  return adminCourseSettingsData;
}

export async function getAdminCourseRoster(courseId: string) {
  return adminCourseRosters[courseId] ?? null;
}

export async function getAdminCourseStudentForm(courseId: string, studentId = "new") {
  return adminCourseStudentForms[`${courseId}:${studentId}`] ?? null;
}

export async function getAdminCourseStudentImport(courseId: string) {
  return adminCourseStudentImports[courseId] ?? null;
}

export async function getAdminTeacherSettingCourse(courseId: string) {
  return adminTeacherSettingCourses[courseId] ?? null;
}

export async function getAdminTeacherSelection(courseId: string) {
  return adminTeacherSelections[courseId] ?? null;
}

export async function getAdminExternalTeacherForm(courseId: string) {
  return adminExternalTeacherForms[courseId] ?? null;
}

export async function getAdminTimeSettingsData() {
  return adminTimeSettingsData;
}

export async function getAdminTimeSettingDetail(key: string) {
  return adminTimeSettingDetails[key] ?? null;
}

export async function getAdminTimePicker(key: string) {
  return adminTimePickerData[key] ?? null;
}
