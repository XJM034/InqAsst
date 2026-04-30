export type Role = "teacher" | "admin";

export type AttendanceStatus = "unmarked" | "present" | "absent" | "leave";

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

export type TeacherHomeCourseCard = {
  campus?: string;
  kind?: "substitute" | "other" | "merge";
  badge?: string;
  title: string;
  time?: string;
  referenceSessionStartAt?: string;
  referenceSessionEndAt?: string;
  rollCallStartAt?: string;
  rollCallDeadlineAt?: string;
  locationTrail?: string;
  description?: string;
  expectedLabel?: string;
  actionHref: string;
  rosterHref: string;
  actionLabel: string;
  attendanceWindowState: "active" | "inactive";
};

export type TeacherHomePrimaryCourse = TeacherHomeCourseCard;

export type TeacherHomeSecondaryCourse = TeacherHomeCourseCard;

export type TeacherHomeDaySchedule = {
  dayKey: string;
  dateLabel: string;
  primaryCourse: TeacherHomePrimaryCourse;
  substituteCourse?: TeacherHomeSecondaryCourse;
};

export type TeacherHomeData = {
  greeting: string;
  defaultDayKey: string;
  weekCalendar: WeekCalendarItem[];
  daySchedules: TeacherHomeDaySchedule[];
  noClassMessage?: string;
};

export type AttendanceStudent = {
  id: string;
  externalStudentId?: string;
  name: string;
  homeroomClass: string;
  homeroomClassId?: number;
  status: AttendanceStatus;
  managerUpdated?: boolean;
  overrideLabel?: string;
};

export type TemporaryStudentHomeroomClass = {
  id: number;
  name: string;
};

export type TeacherTemporaryStudentConfig = {
  homeroomClasses: TemporaryStudentHomeroomClass[];
  disabledReason?: string;
};

export type AttendanceSession = {
  id: string;
  courseId?: string;
  courseSessionId?: string;
  pageTitle: string;
  campusLabel?: string;
  dateLabel: string;
  sessionTimeLabel?: string;
  referenceSessionStartAt?: string;
  referenceSessionEndAt?: string;
  rollCallStartAt?: string;
  rollCallDeadlineAt?: string;
  courseTitle: string;
  courseInfo: string;
  deadlineHint: string;
  tapHint: string;
  submitLabel: string;
  submitDisabled?: boolean;
  submitDisabledReason?: string;
  attendanceWindowActive?: boolean;
  hasSubmittedToday?: boolean;
  latestAttendanceRecordId?: string;
  latestSubmittedAt?: string;
  draftNotice?: string;
  temporaryStudent?: TeacherTemporaryStudentConfig;
  students: AttendanceStudent[];
};

export type AttendanceGroupStudent = AttendanceStudent & {
  courseSessionId: string;
  courseTitle: string;
};

export type AttendanceGroupClass = {
  courseId: string;
  courseSessionId: string;
  title: string;
  meta: string;
  temporaryStudent?: TeacherTemporaryStudentConfig;
  students: AttendanceGroupStudent[];
};

export type AttendanceGroup = {
  id: string;
  pageTitle: string;
  campusLabel?: string;
  dateLabel: string;
  sessionTimeLabel?: string;
  title: string;
  info: string;
  submitLabel: string;
  submitDisabled?: boolean;
  submitDisabledReason?: string;
  attendanceWindowActive?: boolean;
  classes: AttendanceGroupClass[];
};

export type TeacherProfile = {
  name: string;
  phone: string;
  roleLabel: string;
};

export type AdminCampusOption = {
  id: string;
  label: string;
  shortLabel: string;
  adminUserId?: number;
};

export type AdminProfile = {
  name: string;
  phone: string;
  roleLabel: string;
  activeCampusId?: string;
  campusOptions: AdminCampusOption[];
};

export type AdminAction = {
  href: string;
  title: string;
  description: string;
};

export type AdminHomeData = {
  campusLabel: string;
  title: string;
  ruleDateLabel: string;
  effectiveRules: Array<{
    label: string;
    value: string;
    meta?: string;
    tone: "neutral" | "warning" | "success";
  }>;
  heroDescription: string;
  heroPrimaryHref: string;
  entryCards: Array<{
    href: string;
    title: string;
    description: string;
    badge: string;
    icon: "clock" | "users";
    iconTone: "success" | "info";
    badgeTone: "success" | "info" | "neutral";
  }>;
};

export type AdminCourseTeachersData = {
  title: string;
  searchPlaceholder: string;
  days: Array<{
    key: string;
    label: string;
    courseCount?: number;
    active?: boolean;
  }>;
  defaultDayKey: string;
  selectedDayKey?: AdminEmergencyDayKey;
  teachers: Array<{
    id: string;
    dayKey: string;
    label: string;
    note: string;
    teacherName?: string;
    teacherPhone?: string | null;
    courseLabel?: string;
    locationLabel?: string;
    statusLabel?: string;
    tone?: "default" | "substitute";
  }>;
  teachersPage?: {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export type AdminClassStatus = {
  id: string;
  name: string;
  teacher: string;
  kind?: "course" | "merge";
  badge?: string;
  description?: string;
  groupSize?: number;
  progressLabel: string;
  completion: number;
  state: "pending" | "partial" | "done";
  shouldAttendCount: number;
  presentCount: number;
  leaveCount: number;
  absentCount: number;
  href: string;
};

export type AdminControlData = {
  campusLabel: string;
  dateLabel: string;
  referenceSessionStartAt?: string;
  pollingEnabled: boolean;
  finishedCount: number;
  unfinishedCount: number;
  totals: {
    shouldAttend: number;
    present: number;
    leave: number;
    absent: number;
  };
  classes: AdminClassStatus[];
};

export type AdminClassAttendanceStudent = {
  id: string;
  name: string;
  homeroomClass: string;
  homeroomClassId?: number;
  status: AttendanceStatus;
  managerUpdated?: boolean;
  overrideLabel?: string;
};

export type AdminClassAttendanceData = {
  classId: string;
  courseId?: string;
  courseSessionId?: string;
  title: string;
  students: AdminClassAttendanceStudent[];
};

export type AdminUnarrivedGroupStudent = {
  id: string;
  studentId: string;
  name: string;
  courseId?: string;
  courseSessionId?: string;
  courseName?: string;
  homeroomClassId?: number;
  homeroomClass: string;
  note: string;
  status: AttendanceStatus;
  managerUpdated?: boolean;
  overrideLabel?: string;
};

export type AdminUnarrivedGroup = {
  id: string;
  courseId?: string;
  courseSessionId?: string;
  label: string;
  meta: string;
  students: AdminUnarrivedGroupStudent[];
  roster?: AdminClassAttendanceStudent[];
};

export type AdminUnarrivedData = {
  campusLabel: string;
  dateLabel: string;
  referenceSessionStartAt?: string;
  totals: {
    expected: number;
    present: number;
    unmarked: number;
    leave: number;
    absent: number;
  };
  groups: AdminUnarrivedGroup[];
};

export type AdminEmergencyDayKey =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export type AdminEmergencyDay = {
  key: AdminEmergencyDayKey;
  label: string;
  date?: string;
  courseCount?: number;
  changedCourseCount?: number;
  active?: boolean;
};

export type AdminEmergencyCourse = {
  courseId: string;
  sessionId: string;
  title: string;
  meta: string;
  href: string;
  sessionDate?: string;
  sessionStartAt?: string;
  sessionEndAt?: string;
  locationLabel?: string;
  sessionTimeLabel?: string;
  currentTeacherId?: string;
  currentTeacherName?: string;
  currentTeacherPhone?: string | null;
  currentTeacherExternal?: boolean;
  defaultTeacherId?: string;
  defaultTeacherName?: string;
  defaultTeacherPhone?: string | null;
  teacherChanged?: boolean;
  temporaryTeacherAssigned?: boolean;
};

export type AdminEmergencyData = {
  days: AdminEmergencyDay[];
  selectedDayKey: AdminEmergencyDayKey;
  featuredDateLabel: string;
  featuredCourses: AdminEmergencyCourse[];
  courses: {
    items: AdminEmergencyCourse[];
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
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
  sessionDate?: string;
  currentTeacherId?: string;
  currentTeacherSource?: "internal" | "external";
  currentTeacherLabel?: string;
  defaultTeacherLabel: string;
  teacherType?: "INTERNAL" | "EXTERNAL" | "ALL";
  teacherQuery?: string;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
  totalElements?: number;
  hasNextPage?: boolean;
  teachers: Array<{
    id: string;
    label: string;
    name?: string;
    phone?: string | null;
    note?: string;
    selected?: boolean;
    source?: "internal" | "external";
    manual?: boolean;
    badges?: string[];
    swapTargets?: Array<{
      courseId: string;
      courseSessionId: string;
      courseTitle: string;
      dayLabel?: string;
      sessionTimeLabel: string;
      locationLabel?: string;
      currentTeacherLabel: string;
    }>;
  }>;
};

export type AdminRollCallTeacherBatchConflictSource = "group" | "outside-group";

export type AdminRollCallTeacherBatchConflict = {
  courseSessionId: string;
  teacherId: string;
  teacherName: string;
  conflictDate: string;
  conflictTimeRange: string;
  conflictSource: AdminRollCallTeacherBatchConflictSource;
  message: string;
};

export type AdminRollCallTeacherBatchTeacherOption = {
  id: string;
  label: string;
  name?: string;
  phone?: string | null;
  note?: string;
  defaultTeacher?: boolean;
  selected?: boolean;
};

export type AdminRollCallTeacherBatchCourse = {
  courseId: string;
  sessionId: string;
  courseTitle: string;
  courseMeta: string;
  sessionDate: string;
  sessionTimeLabel: string;
  locationLabel: string;
  currentTeacherLabel: string;
  defaultTeacherLabel: string;
  currentTeacherId?: string;
  currentTeacherExternal?: boolean;
  defaultTeacherId?: string;
  temporaryTeacherAssigned?: boolean;
  initialTargetTeacherId?: string;
  teacherOptions: AdminRollCallTeacherBatchTeacherOption[];
};

export type AdminRollCallTeacherBatchData = {
  sessionDate: string;
  courseCount: number;
  courses: AdminRollCallTeacherBatchCourse[];
};

export type AdminExternalTeacherData = {
  courseId: string;
  courseTitle: string;
  courseMeta: string;
  currentTeacherLabel?: string;
};

export type AdminTimeSettingsData = {
  title: string;
  targetDate: string;
  days: Array<{
    key: string;
    label: string;
    date: string;
    active?: boolean;
    readonly?: boolean;
    href?: string;
  }>;
  defaultDayKey: string;
  searchPlaceholder: string;
  cards: Array<{
    id: "class-time" | "attendance-window";
    title: string;
    currentLabel: string;
    href?: string;
  }>;
};

export type AdminTimeSettingDetailData = {
  courseSessionId: string;
  settingKey: "class-time" | "attendance-window";
  campusId: string;
  targetDate: string;
  kind: "actual" | "roll-call";
  title: string;
  introTitle: string;
  introPrimaryText: string;
  introSecondaryText: string;
  sectionTitle: string;
  currentRange: string;
  referenceStartTime?: string;
  startTime: string;
  endTime: string;
  defaultBeforeStartMinutes?: number;
  defaultAfterStartMinutes?: number;
  pickerHref: string;
  highlightText: string;
  resetLabel: string;
  saveLabel: string;
  editable: boolean;
};

export type AdminTimePickerData = {
  settingKey: "class-time" | "attendance-window";
  courseSessionId: string;
  campusId: string;
  targetDate: string;
  kind: "actual" | "roll-call";
  title: string;
  badge: string;
  backHref: string;
  introTitle: string;
  introSubtitle: string;
  currentRange: string;
  referenceStartTime?: string;
  startTime: string;
  endTime: string;
  cancelLabel: string;
  confirmLabel: string;
  editable: boolean;
};

export type AdminCourseRuleMode = {
  id: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  href?: string;
};

export type AdminCourseSettingsCourse = {
  id: string;
  courseId: string;
  sessionId: string;
  title: string;
  meta: string;
  badgeLabel: string;
  badgeTone: "today" | "temporary";
  rosterHref: string;
  editHref?: string;
  timeLabel?: string;
  locationLabel?: string;
  teacherLabel?: string;
  studentCount?: number;
  sourceType?: "live" | "temporary" | "makeup";
  canRemoveFromToday?: boolean;
  secondaryActionLabel: string;
  secondaryActionTone: "outline" | "accent";
  secondaryActionHref?: string;
  secondaryActionDisabled?: boolean;
  secondaryActionKind?: "remove" | "edit";
};

export type AdminCourseSettingsData = {
  title: string;
  effectiveCourseCount: number;
  effectiveCourseCountLabel: string;
  ruleTitle: string;
  modes: AdminCourseRuleMode[];
  searchPlaceholder: string;
  sectionTitle: string;
  temporaryActionLabel: string;
  temporaryActionHref?: string;
  temporaryActionDisabled?: boolean;
  saveLabel: string;
  saveDisabled?: boolean;
  saveDescription?: string;
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
  studentId?: string;
  courseCampusId?: number | null;
  title: string;
  badge: string;
  courseTitle: string;
  courseContext?: string;
  submitLabel: string;
  nameValue: string;
  namePlaceholder?: string;
  studentIdValue: string;
  studentIdPlaceholder?: string;
  homeroomClassId?: number | null;
  homeroomClasses?: Array<{
    id: number;
    name: string;
  }>;
  homeroomClassValue: string;
  homeroomClassPlaceholder?: string;
  localDraft?: boolean;
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
