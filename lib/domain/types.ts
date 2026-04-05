export type Role = "teacher" | "admin";

export type AttendanceStatus = "present" | "absent" | "leave";

export type TimeWindowState = "upcoming" | "active" | "late";

export type RoleOption = {
  role: Role;
  label: string;
  description: string;
  href: string;
};

export type MockLoginAccount = {
  phone: string;
  role: Role;
  label: string;
  homeHref: string;
};

export type SummaryMetric = {
  label: string;
  value: string;
};

export type WeekCalendarItem = {
  key: string;
  label: string;
  caption?: string;
  active?: boolean;
  hasClass?: boolean;
};

export type TeacherHomePrimaryCourse = {
  campus: string;
  title: string;
  time: string;
  locationTrail: string;
  actionHref: string;
  rosterHref: string;
  actionLabel: string;
  attendanceWindowState: "active" | "inactive";
};

export type TeacherHomeDaySchedule = {
  dayKey: string;
  dateLabel: string;
  primaryCourse: TeacherHomePrimaryCourse;
  substituteCourse?: {
    badge: string;
    title: string;
    description: string;
    expectedLabel: string;
    actionLabel: string;
    actionHref: string;
    rosterHref: string;
    attendanceWindowState: "active" | "inactive";
  };
};

export type TeacherHomeData = {
  greeting: string;
  defaultDayKey: string;
  weekCalendar: WeekCalendarItem[];
  daySchedules: TeacherHomeDaySchedule[];
  tomorrowTrip: string;
};

export type AttendanceStudent = {
  id: string;
  name: string;
  homeroomClass: string;
  status: AttendanceStatus;
  managerUpdated?: boolean;
  overrideLabel?: string;
};

export type AttendanceSession = {
  id: string;
  pageTitle: string;
  dateLabel: string;
  courseTitle: string;
  courseInfo: string;
  deadlineHint: string;
  tapHint: string;
  submitLabel: string;
  students: AttendanceStudent[];
};

export type TeacherProfile = {
  name: string;
  phone: string;
  roleLabel: string;
};

export type AdminAction = {
  href: string;
  title: string;
  description: string;
};

export type AdminHomeData = {
  title: string;
  ruleDateLabel: string;
  effectiveRules: Array<{
    label: string;
    value: string;
    tone: "neutral" | "warning" | "success";
  }>;
  heroDescription: string;
  heroPrimaryHref: string;
  heroSecondaryHref: string;
  entryCards: Array<{
    href: string;
    title: string;
    badge: string;
    tone: "success" | "info" | "neutral";
  }>;
};

export type AdminCourseTeachersData = {
  title: string;
  searchPlaceholder: string;
  days: Array<{
    key: string;
    label: string;
  }>;
  defaultDayKey: string;
  teachers: Array<{
    id: string;
    dayKey: string;
    label: string;
    note: string;
    tone?: "default" | "substitute";
  }>;
};

export type AdminClassStatus = {
  id: string;
  name: string;
  teacher: string;
  progressLabel: string;
  completion: number;
  state: "pending" | "partial" | "done";
  href: string;
};

export type AdminControlData = {
  dateLabel: string;
  finishedCount: number;
  unfinishedCount: number;
  classes: AdminClassStatus[];
};

export type AdminClassAttendanceStudent = {
  id: string;
  name: string;
  homeroomClass: string;
  status: AttendanceStatus;
  managerUpdated?: boolean;
  overrideLabel?: string;
};

export type AdminClassAttendanceData = {
  classId: string;
  title: string;
  students: AdminClassAttendanceStudent[];
};

export type AdminUnarrivedGroupStudent = {
  id: string;
  name: string;
  course: string;
  status: AttendanceStatus;
  managerUpdated?: boolean;
  overrideLabel?: string;
};

export type AdminUnarrivedGroup = {
  id: string;
  label: string;
  students: AdminUnarrivedGroupStudent[];
};

export type AdminUnarrivedData = {
  dateLabel: string;
  totals: {
    expected: number;
    present: number;
    leave: number;
    absent: number;
  };
  groups: AdminUnarrivedGroup[];
};

export type AdminEmergencyDay = {
  label: string;
  active?: boolean;
};

export type AdminEmergencyCourse = {
  id: string;
  title: string;
  meta: string;
  href: string;
};

export type AdminEmergencyData = {
  days: AdminEmergencyDay[];
  featuredDateLabel: string;
  featuredCourse: AdminEmergencyCourse;
  allCourses: AdminEmergencyCourse[];
};

export type AdminTeacherSettingsData = AdminEmergencyData;

export type AdminTeacherSettingCourse = {
  id: string;
  title: string;
  meta: string;
  currentTeacherLabel: string;
  currentTeacherMode: "temporary" | "default";
  defaultTeacherLabel?: string;
};

export type AdminTeacherSelectionData = {
  courseId: string;
  courseTitle: string;
  courseMeta: string;
  defaultTeacherLabel: string;
  teachers: Array<{
    id: string;
    label: string;
    note?: string;
    selected?: boolean;
  }>;
};

export type AdminExternalTeacherData = {
  courseId: string;
  courseTitle: string;
  courseMeta: string;
};

export type AdminTimeSettingsData = {
  days: AdminEmergencyDay[];
  actualClassTime: string;
  attendanceWindow: string;
  actualHref: string;
  attendanceHref: string;
};

export type AdminTimeSettingDetailData = {
  title: string;
  subtitle: string;
  currentRange: string;
  helperText: string;
  defaultLogicText: string;
  pickerHref: string;
  saveLabel: string;
  resetLabel: string;
};

export type AdminTimePickerData = {
  title: string;
  badge: string;
  contextTitle: string;
  contextSubtitle: string;
  currentRange: string;
  primaryLabel: string;
  secondaryLabel: string;
  confirmLabel: string;
};

export type AdminCourseRuleMode = {
  id: string;
  label: string;
  active?: boolean;
};

export type AdminCourseSettingsCourse = {
  id: string;
  title: string;
  meta: string;
  badgeLabel: string;
  badgeTone: "today" | "temporary";
  rosterHref: string;
  secondaryActionLabel: string;
  secondaryActionTone: "outline" | "accent";
};

export type AdminCourseSettingsData = {
  title: string;
  ruleTitle: string;
  modes: AdminCourseRuleMode[];
  searchPlaceholder: string;
  sectionTitle: string;
  temporaryActionLabel: string;
  saveLabel: string;
  courses: AdminCourseSettingsCourse[];
};

export type AdminCourseRosterStudent = {
  id: string;
  name: string;
  studentCode: string;
  homeroomClass: string;
  highlighted?: boolean;
  editHref: string;
};

export type AdminCourseRosterData = {
  courseId: string;
  title: string;
  badge: string;
  courseTitle: string;
  courseMeta: string;
  searchPlaceholder: string;
  addHref: string;
  importHref: string;
  students: AdminCourseRosterStudent[];
};

export type AdminCourseStudentFormData = {
  courseId: string;
  title: string;
  badge: string;
  courseTitle: string;
  courseContext?: string;
  submitLabel: string;
  nameValue: string;
  namePlaceholder?: string;
  studentCodeValue: string;
  studentCodePlaceholder?: string;
  homeroomClassValue: string;
  homeroomClassPlaceholder?: string;
};

export type AdminCourseStudentImportData = {
  courseId: string;
  title: string;
  badge: string;
  courseTitle: string;
  fields: string[];
  downloadLabel: string;
  uploadLabel: string;
};
