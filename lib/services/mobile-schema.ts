export type LocalTimeDto = {
  hour?: number;
  minute?: number;
  second?: number;
  nano?: number;
};

export type RollCallWindowDto = {
  id: number;
  weekday: number;
  windowStart?: LocalTimeDto | null;
  windowEnd?: LocalTimeDto | null;
  startOffsetMinutes?: number | null;
  endOffsetMinutes?: number | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
};

export type CourseSessionDto = {
  id: number;
  startAt: string;
  endAt: string;
  substitute?: boolean;
};

export type CourseWeekItemDto = {
  id: number;
  name: string;
  location?: string | null;
  campusId?: number;
  campusName?: string | null;
  sessionsInWeek: CourseSessionDto[];
  hasAttendanceRecord?: boolean;
};

export type TeacherHomeDto = {
  weekStart: string;
  weekCourses: CourseWeekItemDto[];
  campusRollCallWindows: RollCallWindowDto[];
};

export type TeacherTodaySessionDto = {
  courseId: number;
  courseName: string;
  location?: string | null;
  campusName?: string | null;
  sessionId: number;
  sessionStartAt: string;
  sessionEndAt: string;
  effectiveRollCallStartAt?: string | null;
  effectiveRollCallEndAt?: string | null;
  rollCallWindowSource?: string | null;
  scheduleAdjusted?: boolean;
  scheduleAdjustmentType?: string | null;
  scheduleSourceWeekday?: number | null;
  scheduleSourceDate?: string | null;
  rollCallCompleted: boolean;
  substitute?: boolean;
  rollCallGroupId?: number | string | null;
  rollCallGroupName?: string | null;
  rollCallGroupSize?: number | null;
  rollCallGroupCanSubmit?: boolean | null;
};

export type TeacherAttendanceGroupSessionDto = {
  courseId: number;
  courseName: string;
  courseSessionId: number;
  location?: string | null;
  sessionStartAt: string;
  sessionEndAt: string;
  rollCallCompleted?: boolean;
  latest?: AttendanceLatestDto | null;
  students: CourseStudentRowDto[];
};

export type TeacherAttendanceGroupDto = {
  groupId: number | string;
  groupName?: string | null;
  campusName?: string | null;
  sessionDate?: string | null;
  sessionStartAt?: string | null;
  sessionEndAt?: string | null;
  rollCallStartAt?: string | null;
  rollCallDeadlineAt?: string | null;
  attendanceWindowActive?: boolean | null;
  canSubmit?: boolean | null;
  submitDisabledReason?: string | null;
  sessions: TeacherAttendanceGroupSessionDto[];
};

export type TeacherAttendanceGroupSubmitRequestDto = {
  items: Array<{
    courseSessionId: number;
    studentId: number;
    status: number;
  }>;
};

export type MeDto = {
  id: number;
  phone: string;
  username?: string | null;
  role?: string | null;
  campusId?: number | null;
  campusName?: string | null;
  name?: string | null;
  teacherId?: number | null;
  adminUserId?: number | null;
  campusOptions?: LoginCampusOptionDto[] | null;
};

export type LoginCampusOptionDto = {
  campusId: number;
  campusName?: string | null;
  adminUserId: number;
  adminName: string;
};

export type LoginResponseDto = {
  id?: number | null;
  phone: string;
  username?: string | null;
  token?: string | null;
  role?: string | null;
  campusId?: number | null;
  campusName?: string | null;
  name?: string | null;
  teacherId?: number | null;
  adminUserId?: number | null;
  selectionRequired?: boolean;
  selectionToken?: string | null;
  campusOptions?: LoginCampusOptionDto[] | null;
};

export type CourseTeacherRefDto = {
  teacherId: number;
  role?: string | null;
  name?: string | null;
};

export type CourseDetailDto = {
  id: number;
  name: string;
  location?: string | null;
  campusId?: number | null;
  campusName?: string | null;
  status?: string | null;
  remark?: string | null;
  sessions: CourseSessionDto[];
  teachers: CourseTeacherRefDto[];
};

export type CourseLocationDto = {
  courseId: number;
  location?: string | null;
};

export type CourseLocationUpdateRequestDto = {
  location: string;
};

export type CourseStudentRowDto = {
  studentId: number;
  externalStudentId?: string | null;
  studentName: string;
  homeroomClassId: number;
  homeroomClassName: string;
  lastAttendanceStatus?: number | null;
};

export type AttendanceItemDto = {
  studentId: number;
  status?: number | null;
};

export type AttendanceLatestDto = {
  attendanceRecordId?: number;
  courseSessionId?: number | null;
  submittedAt?: string | null;
  hasSubmittedToday?: boolean;
  items: AttendanceItemDto[];
};

export type AttendanceSessionStatusDto = {
  attendanceRecordId?: number | null;
  courseSessionId?: number | null;
  submittedAt?: string | null;
  hasSubmittedToday?: boolean;
  expectedCount: number;
  presentCount: number;
  leaveCount: number;
  absentCount: number;
  unmarkedCount: number;
};

export type AdminHomeSummaryDto = {
  date: string;
  distinctCoursesWithSessionsToday: number;
  sessionCountToday: number;
  pendingRollCallSessions: number;
  actualClassTimeRange?: string | null;
  rollCallTimeRange?: string | null;
  todaySubstituteCourseCount?: number;
  todaySubstituteTeacherCount?: number;
  rollCallWindowRuleCount: number;
  rollCallRulesSummary?: string | null;
};

export type RollCallOverviewRowDto = {
  courseId: number;
  courseName: string;
  sessionId?: number | null;
  sessionStartAt: string;
  sessionEndAt: string;
  scheduleAdjusted?: boolean;
  scheduleAdjustmentType?: string | null;
  scheduleSourceWeekday?: number | null;
  scheduleSourceDate?: string | null;
  rollCallCompleted: boolean;
  shouldAttendCount: number;
  presentCount: number;
  leaveCount: number;
  absentCount: number;
  progressPercent: number;
  rollCallTeacherName?: string | null;
  rollCallTeacherPhone?: string | null;
  rollCallGroupId?: number | string | null;
  rollCallGroupName?: string | null;
  rollCallGroupSize?: number | null;
  rollCallGroupCourseNames?: string[] | null;
};

export type TeacherSettingOverviewRowDto = {
  courseId: number;
  courseName: string;
  sessionId: number;
  sessionStartAt: string;
  sessionEndAt: string;
  defaultTeacherId?: number | null;
  defaultTeacherName?: string | null;
  rollCallTeacherId?: number | null;
  rollCallTeacherName?: string | null;
  temporaryTeacherAssigned: boolean;
};

export type AdminEmergencyDayKeyDto =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export type AdminEmergencyWeeklyDayDto = {
  key: AdminEmergencyDayKeyDto;
  label: string;
  date: string;
  courseCount: number;
  changedCourseCount: number;
  active: boolean;
};

export type AdminEmergencyWeeklyCourseDto = {
  courseId: number;
  sessionId: number;
  courseName: string;
  dayKey: AdminEmergencyDayKeyDto;
  dayLabel: string;
  sessionDate: string;
  sessionStartAt: string;
  sessionEndAt: string;
  sessionTimeLabel: string;
  location?: string | null;
  defaultTeacherId?: number | null;
  defaultTeacherName?: string | null;
  defaultTeacherPhone?: string | null;
  currentTeacherId?: number | null;
  currentTeacherName?: string | null;
  currentTeacherPhone?: string | null;
  currentTeacherExternal: boolean;
  temporaryTeacherAssigned: boolean;
  teacherChanged: boolean;
};

export type AdminEmergencyWeeklyResponseDto = {
  weekStart: string;
  selectedDayKey: AdminEmergencyDayKeyDto;
  featuredDateLabel: string;
  featuredCourse: AdminEmergencyWeeklyCourseDto | null;
  days: AdminEmergencyWeeklyDayDto[];
  courses: PagedRowsDto<AdminEmergencyWeeklyCourseDto>;
};

export type AdminCourseSettingsCourseDto = {
  courseId: number;
  sessionId: number;
  courseName: string;
  location?: string | null;
  sessionStartAt: string;
  sessionEndAt: string;
  effectiveTeacherId?: number | null;
  effectiveTeacherName?: string | null;
  temporaryTeacherAssigned: boolean;
  scheduleAdjusted?: boolean;
  scheduleAdjustmentType?: string | null;
  scheduleSourceWeekday?: number | null;
  scheduleSourceDate?: string | null;
  studentCount: number;
  courseStatus: string;
  actionType: string;
  actionEnabled: boolean;
};

export type AdminCourseSettingsOverviewDto = {
  date: string;
  defaultWeekday: number;
  currentRuleMode: string;
  alternateWeekday?: number | null;
  alternateRuleEnabled: boolean;
  temporaryCourseActionEnabled: boolean;
  saveEnabled: boolean;
  effectiveCourseCount: number;
  courses: AdminCourseSettingsCourseDto[];
};

export type AdminCourseSettingsTemporaryCourseOptionDto = {
  courseId: number;
  sessionId: number;
  courseName: string;
  sessionDate: string;
  location?: string | null;
  sessionStartAt: string;
  sessionEndAt: string;
  effectiveTeacherName?: string | null;
  studentCount: number;
};

export type AdminCourseSettingsBlankTeacherRequestDto =
  | {
      source: "INTERNAL";
      teacherId: number;
    }
  | {
      source: "EXTERNAL";
      name: string;
      phone: string;
    };

export type AdminCourseSettingsBlankStudentRequestDto =
  | {
      source: "INTERNAL";
      studentId: number;
    }
  | {
      source: "EXTERNAL";
      name: string;
      homeroomClassId: number;
    };

export type AdminCourseSettingsTemporaryCourseRequestDto =
  | {
      date?: string;
      sessionId: number;
    }
  | {
      date?: string;
      courseName: string;
      sessionStartAt: string;
      sessionEndAt: string;
      location?: string | null;
      teacher?: AdminCourseSettingsBlankTeacherRequestDto;
      students: AdminCourseSettingsBlankStudentRequestDto[];
    };

export type AbsentStudentRowDto = {
  courseSessionId: number;
  sessionStartAt: string;
  sessionEndAt: string;
  scheduleAdjusted?: boolean;
  scheduleAdjustmentType?: string | null;
  scheduleSourceWeekday?: number | null;
  scheduleSourceDate?: string | null;
  studentId: number;
  studentName: string;
  homeroomClassId?: number | null;
  homeroomClassName?: string | null;
  courseId: number;
  courseName: string;
  teacherNames?: string | null;
  status?: 0 | 1 | 2 | null;
  managerUpdated?: boolean | null;
  attendanceSubmittedAt?: string | null;
};

export type TeacherEntityDto = {
  id: number;
  campusId?: number | null;
  name: string;
  phone?: string | null;
};

export type HomeroomClassListItemDto = {
  id: number;
  name: string;
  homeroomTeacherId?: number | null;
};

export type PagedRowsDto<T> = {
  items: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

// NOTE: The swagger currently omits `status`, but latest-attendance responses clearly return it.
// We include it here so the frontend can submit the same semantic data it reads back.
export type AttendanceSubmitItemDto = {
  studentId: number;
  status: 0 | 1 | 2;
};

export type AttendanceSubmitRequestDto = {
  courseSessionId?: number;
  items: AttendanceSubmitItemDto[];
};

export type CourseSessionTimeSettingDto = {
  courseSessionId: number;
  courseId: number;
  courseName: string;
  campusId: number;
  sessionDate: string;
  weekday: number;
  scheduledStartAt: string;
  scheduledEndAt: string;
  scheduledStartTime?: string | null;
  scheduledEndTime?: string | null;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  rollCallStartTime?: string | null;
  rollCallEndTime?: string | null;
  rollCallStartOffsetMinutes?: number | null;
  rollCallEndOffsetMinutes?: number | null;
  defaultRollCallStartTime?: string | null;
  defaultRollCallEndTime?: string | null;
  defaultRollCallStartOffsetMinutes?: number | null;
  defaultRollCallEndOffsetMinutes?: number | null;
  actualCustomized: boolean;
  rollCallCustomized: boolean;
};

export type StudentDetailDto = {
  studentId: number;
  externalStudentId?: string | null;
  studentName: string;
  homeroomClassId?: number | null;
  homeroomClassName?: string | null;
  enrolledInCourse?: boolean;
};

export type CampusStudentSearchItemDto = {
  studentId: number;
  name: string;
  homeroomClassId?: number | null;
  homeroomClassName?: string | null;
};

export type ExistingStudentEnrollRequestDto = {
  studentId: number;
};

export type StudentUpsertRequestDto = {
  externalStudentId?: string;
  name: string;
  homeroomClassId: number;
};

export type RollCallTeacherDto = {
  defaultTeacherId?: number | null;
  defaultTeacherName?: string | null;
  defaultTeacherPhone?: string | null;
  currentTeacherId?: number | null;
  currentTeacherName?: string | null;
  currentTeacherPhone?: string | null;
  currentTeacherCampusId?: number | null;
  currentTeacherExternal?: boolean;
  temporaryTeacherAssigned?: boolean;
  swapRestoreTarget?: {
    courseSessionId?: number | null;
    courseId?: number | null;
    courseName?: string | null;
    sessionStartAt?: string | null;
    sessionEndAt?: string | null;
    currentTeacherId?: number | null;
    currentTeacherName?: string | null;
    currentTeacherPhone?: string | null;
    defaultTeacherId?: number | null;
    defaultTeacherName?: string | null;
    defaultTeacherPhone?: string | null;
  } | null;
};

export type RollCallTeacherType = "INTERNAL" | "EXTERNAL" | "ALL";

export type RollCallTeacherOptionDto = {
  teacherId: number;
  teacherName: string;
  phone?: string | null;
  campusId?: number | null;
  externalTeacher?: boolean;
  selected?: boolean;
  defaultTeacher?: boolean;
};

export type RollCallTeacherBatchOptionsRequestDto = {
  sessionDate: string;
  courseSessionIds: number[];
  q?: string;
  page?: number;
  size?: number;
};

export type RollCallTeacherBatchOptionGroupDto = {
  courseSessionId: number;
  teachers: PagedRowsDto<RollCallTeacherOptionDto>;
};

export type RollCallTeacherBatchOptionsResponseDto = {
  sessionDate: string;
  items: RollCallTeacherBatchOptionGroupDto[];
};

export type RollCallTeacherBatchAssignmentRequestDto = {
  courseSessionId: number;
  teacherId: number;
};

export type RollCallTeacherBatchUpdateRequestDto = {
  sessionDate: string;
  assignments: RollCallTeacherBatchAssignmentRequestDto[];
};

export type RollCallTeacherBatchResultDto = RollCallTeacherDto & {
  courseSessionId: number;
};

export type RollCallTeacherBatchUpdateResponseDto = {
  sessionDate: string;
  items: RollCallTeacherBatchResultDto[];
};

export type RollCallTeacherMergeGroupRequestDto = {
  sessionDate: string;
  sourceCourseSessionId: number;
  targetTeacherId: number;
  mergeCourseSessionIds: number[];
};

export type RollCallTeacherMergeGroupResponseDto = {
  sessionDate: string;
  groupId?: number | string | null;
  sourceCourseSessionId: number;
  targetTeacherId: number;
  mergeCourseSessionIds: number[];
};

export type RollCallTeacherBatchConflictSourceDto =
  | "GROUP"
  | "OUTSIDE_GROUP"
  | "group"
  | "outside-group"
  | "组内"
  | "组外";

export type RollCallTeacherBatchConflictDto = {
  courseSessionId: number;
  teacherId: number;
  teacherName: string;
  conflictDate: string;
  conflictTimeRange: string;
  conflictSource: RollCallTeacherBatchConflictSourceDto;
};

export type RollCallTeacherBatchConflictResponseDto = {
  conflicts: RollCallTeacherBatchConflictDto[];
};

export type ExternalTeacherRequestDto = {
  name: string;
  phone?: string | null;
};
