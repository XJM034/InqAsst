import type {
  AdminClassAttendanceData,
  AdminControlData,
  AdminCourseTeachersData,
  AdminCourseRosterData,
  AdminCourseSettingsData,
  AdminCourseStudentFormData,
  AdminCourseStudentImportData,
  AdminEmergencyData,
  AdminExternalTeacherData,
  AdminHomeData,
  AdminTeacherSelectionData,
  AdminTeacherSettingCourse,
  AdminTimePickerData,
  AdminTimeSettingDetailData,
  AdminTimeSettingsData,
  AdminUnarrivedData,
  AttendanceSession,
  MockLoginAccount,
  RoleOption,
  TeacherHomeData,
  TeacherProfile,
} from "@/lib/domain/types";

export const mockLoginAccounts: MockLoginAccount[] = [
  {
    phone: "13800000000",
    role: "teacher",
    label: "老师端",
    homeHref: "/teacher/home",
  },
  {
    phone: "18140044660",
    role: "admin",
    label: "管理端",
    homeHref: "/admin/home",
  },
];

export const roleOptions: RoleOption[] = [
  {
    role: "teacher",
    label: "老师端",
    description: "查看今日课程、代课任务，并在规定时间窗口内完成点名。",
    href: "/teacher/home",
  },
  {
    role: "admin",
    label: "管理端",
    description: "查看点名总控、未到学生和现场应急设置入口。",
    href: "/admin/home",
  },
];

export const teacherHomeData: TeacherHomeData = {
  greeting: "李老师，下午好",
  defaultDayKey: "wed",
  weekCalendar: [
    { key: "mon", label: "一" },
    { key: "tue", label: "二", hasClass: true },
    { key: "wed", label: "三", active: true, caption: "今天", hasClass: true },
    { key: "thu", label: "四", hasClass: true },
    { key: "fri", label: "五" },
  ],
  daySchedules: [
    {
      dayKey: "tue",
      dateLabel: "周二课程 · 当前不在点名时间",
      primaryCourse: {
        campus: "嘉祥成华小学",
        title: "足球 U8班",
        time: "16:00 - 17:30",
        locationTrail: "操场A区",
        actionHref: "/teacher/attendance/demo",
        rosterHref: "/teacher/home/roster?day=tue&course=primary",
        actionLabel: "开始点名",
        attendanceWindowState: "inactive",
      },
    },
    {
      dayKey: "wed",
      dateLabel: "2026-02-05 (周三) · 当前 16:40",
      primaryCourse: {
        campus: "嘉祥成华小学",
        title: "乐高竞赛班 5-6",
        time: "16:30 - 17:30",
        locationTrail: "科技楼 > 2层 > 205教室",
        actionHref: "/teacher/attendance/demo",
        rosterHref: "/teacher/home/roster?day=wed&course=primary",
        actionLabel: "开始点名",
        attendanceWindowState: "active",
      },
      substituteCourse: {
        badge: "代课",
        title: "创意美术A班",
        description: "嘉祥成华小学 | 美术楼>3层>301教室 | 16:00-17:30",
        expectedLabel: "应到 18",
        actionLabel: "开始点名",
        actionHref: "/teacher/attendance/demo?day=wed&course=substitute",
        rosterHref: "/teacher/home/roster?day=wed&course=substitute",
        attendanceWindowState: "active",
      },
    },
    {
      dayKey: "thu",
      dateLabel: "周四课程 · 当前不在点名时间",
      primaryCourse: {
        campus: "嘉祥成华小学",
        title: "无人机飞行A班",
        time: "17:40 - 18:40",
        locationTrail: "实验楼 > 4层 > 402教室",
        actionHref: "/teacher/attendance/demo",
        rosterHref: "/teacher/home/roster?day=thu&course=primary",
        actionLabel: "开始点名",
        attendanceWindowState: "inactive",
      },
    },
  ],
  tomorrowTrip: "锦江校区 · 16:30 无人机飞行 A班",
};

export const attendanceSession: AttendanceSession = {
  id: "demo",
  pageTitle: "点名",
  dateLabel: "2026-02-05 (周四) · 当前 16:40",
  courseTitle: "乐高竞赛班5-6",
  courseInfo: "嘉祥成华小学 | 科技楼205 | 16:30-17:30",
  deadlineHint: "点名窗口 15:50 - 16:10 · 超时不得提交",
  tapHint: "黄色为校区管理员修改，请老师注意是否属实，不属实请及时报备",
  submitLabel: "确认提交",
  students: [
    {
      id: "stu-01",
      name: "李景行",
      homeroomClass: "5年级3班",
      status: "present",
      managerUpdated: true,
      overrideLabel: "修改为·已到",
    },
    {
      id: "stu-02",
      name: "刘雨桐",
      homeroomClass: "6年级2班",
      status: "leave",
      managerUpdated: true,
      overrideLabel: "修改为·请假",
    },
    {
      id: "stu-03",
      name: "李四",
      homeroomClass: "5年级5班",
      status: "present",
    },
    {
      id: "stu-04",
      name: "孙七",
      homeroomClass: "5年级4班",
      status: "present",
    },
    {
      id: "stu-05",
      name: "赵六",
      homeroomClass: "6年级3班",
      status: "absent",
    },
    {
      id: "stu-06",
      name: "周八",
      homeroomClass: "5年级1班",
      status: "absent",
    },
    { id: "stu-07", name: "王小满", homeroomClass: "5年级2班", status: "present" },
    { id: "stu-08", name: "张书宁", homeroomClass: "5年级2班", status: "present" },
    { id: "stu-09", name: "陈沐安", homeroomClass: "5年级4班", status: "present" },
    { id: "stu-10", name: "周以辰", homeroomClass: "5年级3班", status: "present" },
    { id: "stu-11", name: "李思远", homeroomClass: "6年级1班", status: "present" },
    { id: "stu-12", name: "何嘉朗", homeroomClass: "6年级1班", status: "present" },
    { id: "stu-13", name: "韩可心", homeroomClass: "6年级2班", status: "present" },
    { id: "stu-14", name: "杨昊然", homeroomClass: "6年级2班", status: "present" },
    { id: "stu-15", name: "吴梓涵", homeroomClass: "6年级3班", status: "present" },
    { id: "stu-16", name: "苏雨诺", homeroomClass: "5年级1班", status: "present" },
    { id: "stu-17", name: "张奕晨", homeroomClass: "5年级1班", status: "present" },
    { id: "stu-18", name: "郑若希", homeroomClass: "5年级2班", status: "present" },
    { id: "stu-19", name: "彭知言", homeroomClass: "5年级3班", status: "present" },
    { id: "stu-20", name: "熊梓玥", homeroomClass: "5年级4班", status: "present" },
    { id: "stu-21", name: "赖昕冉", homeroomClass: "5年级5班", status: "present" },
    { id: "stu-22", name: "乔子墨", homeroomClass: "6年级1班", status: "present" },
    { id: "stu-23", name: "段宇辰", homeroomClass: "6年级2班", status: "present" },
    { id: "stu-24", name: "郭予安", homeroomClass: "6年级3班", status: "present" },
    { id: "stu-25", name: "唐一凡", homeroomClass: "5年级5班", status: "present" },
  ],
};

export const teacherProfile: TeacherProfile = {
  name: "李老师",
  phone: "13800000000",
  roleLabel: "外部老师",
};

export const adminProfile = {
  name: "张管理",
  phone: "138****5678",
  roleLabel: "嘉祥成华小学 - 管理老师",
};

export const adminHomeData: AdminHomeData = {
  title: "管理设置",
  ruleDateLabel: "周二 · 3/24",
  effectiveRules: [
    { label: "实际上课", value: "15:50 - 17:20", tone: "neutral" },
    { label: "点名时间", value: "15:45 - 15:55", tone: "warning" },
    { label: "今日代课", value: "1 班级 · 1 老师", tone: "success" },
  ],
  heroDescription:
    "凌晨 12 点自动同步选修课系统信息；当日有临时代课时，在这里快速调整并查看当前负责老师。",
  heroPrimaryHref: "/admin/emergency",
  heroSecondaryHref: "/admin/course-teachers",
  entryCards: [
    {
      href: "/admin/course-settings",
      title: "课程设置",
      badge: "8 节生效",
      tone: "success",
    },
    {
      href: "/admin/time-settings",
      title: "时间设置",
      badge: "默认",
      tone: "info",
    },
  ],
};

export const adminCourseTeachersData: AdminCourseTeachersData = {
  title: "查看课程老师",
  searchPlaceholder: "搜索老师姓名 / 手机号",
  days: [
    { key: "mon", label: "周一" },
    { key: "tue", label: "周二" },
    { key: "wed", label: "周三" },
    { key: "thu", label: "周四" },
    { key: "fri", label: "周五" },
  ],
  defaultDayKey: "wed",
  teachers: [
    {
      id: "course-teacher-01",
      dayKey: "wed",
      label: "赵鹏 · 13800991200",
      note: "乐高竞赛班5-6 · 科技楼205 · 16:00-17:30 · 默认负责",
    },
    {
      id: "course-teacher-02",
      dayKey: "tue",
      label: "王强 · 18140044661",
      note: "足球U8班 · 操场A区 · 16:00-17:30 · 默认负责",
    },
    {
      id: "course-teacher-03",
      dayKey: "wed",
      label: "张文 · 13800224455",
      note: "创意美术A班 · 美术教室301 · 16:00-17:30 · 默认负责",
    },
    {
      id: "course-teacher-04",
      dayKey: "thu",
      label: "周林 · 18140044670",
      note: "无人机飞行A班 · 实验楼402 · 17:40-18:40 · 默认负责",
    },
    {
      id: "course-teacher-05",
      dayKey: "wed",
      label: "陈静 · 18140044665",
      note: "机器人快闪班 · 科技楼301 · 17:40-18:20 · 临时新增课程老师",
      tone: "substitute",
    },
    {
      id: "course-teacher-06",
      dayKey: "mon",
      label: "许然 · 18140044668",
      note: "少儿编程B班 · 科技楼201 · 15:50-17:00 · 默认负责",
    },
    {
      id: "course-teacher-07",
      dayKey: "fri",
      label: "何青 · 18140044672",
      note: "创客实验班 · 创客教室101 · 16:30-17:30 · 默认负责",
    },
  ],
};

export const adminControlData: AdminControlData = {
  dateLabel: "今天 2026-02-05 (周四) · 当前 16:40",
  finishedCount: 8,
  unfinishedCount: 3,
  classes: [
    {
      id: "class-01",
      name: "足球 U8班",
      teacher: "王强 18140044661",
      progressLabel: "等待老师点名",
      completion: 0,
      state: "pending",
      href: "/admin/control/class-01",
    },
    {
      id: "class-02",
      name: "围棋高级班",
      teacher: "刘明 18140044662",
      progressLabel: "已确认 15/15",
      completion: 100,
      state: "done",
      href: "/admin/control/class-02",
    },
    {
      id: "class-03",
      name: "乐高竞赛班5-6",
      teacher: "赵鹏 18140044664",
      progressLabel: "已确认 12/30",
      completion: 40,
      state: "partial",
      href: "/admin/control/class-03",
    },
    {
      id: "class-04",
      name: "编程启蒙B班",
      teacher: "陈静 18140044665",
      progressLabel: "已确认 18/20",
      completion: 90,
      state: "done",
      href: "/admin/control/class-04",
    },
  ],
};

export const adminClassAttendanceData: Record<string, AdminClassAttendanceData> = {
  "class-01": {
    classId: "class-01",
    title: "足球 U8班 班级名单",
    students: [
      { id: "class-01-01", name: "张三", homeroomClass: "5年级2班", status: "present" },
      {
        id: "class-01-02",
        name: "李四",
        homeroomClass: "5年级5班",
        status: "leave",
        managerUpdated: true,
        overrideLabel: "修改为·请假",
      },
      {
        id: "class-01-03",
        name: "王五",
        homeroomClass: "6年级1班",
        status: "absent",
        managerUpdated: true,
        overrideLabel: "修改为·未到",
      },
      { id: "class-01-04", name: "陈思远", homeroomClass: "5年级1班", status: "present" },
      { id: "class-01-05", name: "赵思琪", homeroomClass: "5年级3班", status: "absent" },
    ],
  },
  "class-02": {
    classId: "class-02",
    title: "围棋高级班 班级名单",
    students: [
      { id: "class-02-01", name: "周星宇", homeroomClass: "6年级2班", status: "present" },
      { id: "class-02-02", name: "何予安", homeroomClass: "6年级1班", status: "present" },
      { id: "class-02-03", name: "黎书言", homeroomClass: "5年级4班", status: "present" },
      { id: "class-02-04", name: "郑若希", homeroomClass: "5年级2班", status: "present" },
      { id: "class-02-05", name: "段宇辰", homeroomClass: "6年级2班", status: "present" },
    ],
  },
  "class-03": {
    classId: "class-03",
    title: "乐高竞赛班5-6 班级名单",
    students: [
      { id: "class-03-01", name: "张三", homeroomClass: "5年级2班", status: "present" },
      {
        id: "class-03-02",
        name: "李四",
        homeroomClass: "5年级5班",
        status: "leave",
        managerUpdated: true,
        overrideLabel: "修改为·请假",
      },
      {
        id: "class-03-03",
        name: "王五",
        homeroomClass: "6年级1班",
        status: "absent",
        managerUpdated: true,
        overrideLabel: "修改为·未到",
      },
      { id: "class-03-04", name: "林子言", homeroomClass: "5年级3班", status: "present" },
      { id: "class-03-05", name: "王一诺", homeroomClass: "5年级3班", status: "present" },
      { id: "class-03-06", name: "郭予安", homeroomClass: "6年级3班", status: "present" },
      { id: "class-03-07", name: "苏雨诺", homeroomClass: "5年级1班", status: "present" },
      { id: "class-03-08", name: "熊梓玥", homeroomClass: "5年级4班", status: "present" },
      { id: "class-03-09", name: "乔子墨", homeroomClass: "6年级1班", status: "leave" },
      { id: "class-03-10", name: "唐一凡", homeroomClass: "5年级5班", status: "absent" },
    ],
  },
  "class-04": {
    classId: "class-04",
    title: "编程启蒙B班 班级名单",
    students: [
      { id: "class-04-01", name: "何嘉朗", homeroomClass: "6年级1班", status: "present" },
      { id: "class-04-02", name: "刘雨桐", homeroomClass: "6年级2班", status: "present" },
      { id: "class-04-03", name: "陈沐安", homeroomClass: "5年级4班", status: "present" },
      { id: "class-04-04", name: "张书宁", homeroomClass: "5年级2班", status: "present" },
      { id: "class-04-05", name: "李思远", homeroomClass: "6年级1班", status: "absent" },
    ],
  },
};

export const adminUnarrivedData: AdminUnarrivedData = {
  dateLabel: "今天 2026-02-05 (周四) · 当前 16:40",
  totals: {
    expected: 6,
    present: 0,
    leave: 0,
    absent: 6,
  },
  groups: [
    {
      id: "group-5-3",
      label: "5年级3班",
      students: [
        { id: "absent-01", name: "李景行", course: "乐高竞赛班5-6" },
        { id: "absent-02", name: "张明轩", course: "足球 U8班" },
        { id: "absent-03", name: "陈思远", course: "创意美术A班" },
      ],
    },
    {
      id: "group-6-1",
      label: "6年级1班",
      students: [
        { id: "absent-04", name: "王子涵", course: "乐高竞赛班5-6" },
        { id: "absent-05", name: "刘雨桐", course: "足球 U8班" },
        { id: "absent-06", name: "赵思琪", course: "创意美术A班" },
      ],
    },
  ],
};

export const adminEmergencyData: AdminEmergencyData = {
  days: [
    { label: "周一" },
    { label: "周二", active: true },
    { label: "周三" },
    { label: "周四" },
    { label: "周五" },
  ],
  featuredDateLabel: "今日代课课程 - 3.24",
  featuredCourse: {
    id: "featured-course",
    title: "乐高竞赛班5-6",
    meta: "科技楼205 · 李明 · 13800135678",
    href: "/admin/emergency/course/featured-course",
  },
  allCourses: [
    {
      id: "course-01",
      title: "创意美术A班",
      meta: "美术教室301 · 张文 · 18140044668",
      href: "/admin/emergency/course/course-01",
    },
    {
      id: "course-02",
      title: "无人机飞行A班",
      meta: "实验楼402 · 周林 · 18140044670",
      href: "/admin/emergency/course/course-02",
    },
  ],
};

export const adminCourseSettingsData: AdminCourseSettingsData = {
  title: "课程与班级设置",
  ruleTitle: "当天规则",
  modes: [
    { id: "default", label: "默认（周二）", active: true },
    { id: "alternate", label: "按照其他行课日行课" },
  ],
  searchPlaceholder: "搜索课程名 / 上课地点",
  sectionTitle: "今日生效课程",
  temporaryActionLabel: "临时新增课程",
  saveLabel: "保存课程设置",
  courses: [
    {
      id: "featured-course",
      title: "乐高竞赛班5-6",
      meta: "16:00-17:30 · 科技楼205 · 赵鹏 · 25 人",
      badgeLabel: "今日行课",
      badgeTone: "today",
      rosterHref: "/admin/course-settings/featured-course/students",
      secondaryActionLabel: "移出今日行课",
      secondaryActionTone: "outline",
    },
    {
      id: "course-01",
      title: "足球U8班",
      meta: "16:00-17:30 · 操场A区 · 王强 · 20 人",
      badgeLabel: "今日行课",
      badgeTone: "today",
      rosterHref: "/admin/course-settings/course-01/students",
      secondaryActionLabel: "移出今日行课",
      secondaryActionTone: "outline",
    },
    {
      id: "course-03",
      title: "机器人快闪班",
      meta: "17:40-18:20 · 科技楼301 · 陈静 · 12 人",
      badgeLabel: "临时新增",
      badgeTone: "temporary",
      rosterHref: "/admin/course-settings/course-03/students",
      secondaryActionLabel: "保留到今日行课",
      secondaryActionTone: "accent",
    },
  ],
};

export const adminCourseRosters: Record<string, AdminCourseRosterData> = {
  "featured-course": {
    courseId: "featured-course",
    title: "学生名单",
    badge: "名单页",
    courseTitle: "乐高竞赛班5-6",
    courseMeta: "16:00-17:30 · 科技楼205 · 赵鹏 · 25 人",
    searchPlaceholder: "搜索学生姓名 / 学生ID / 行政班",
    addHref: "/admin/course-settings/featured-course/students/new",
    importHref: "/admin/course-settings/featured-course/students/import",
    students: [
      {
        id: "stu-05231",
        name: "王一诺",
        studentCode: "STU-05231",
        homeroomClass: "五年级3班",
        highlighted: true,
        editHref: "/admin/course-settings/featured-course/students/stu-05231/edit",
      },
      {
        id: "tmp-0002",
        name: "林子言",
        studentCode: "TMP-0002",
        homeroomClass: "五年级3班",
        editHref: "/admin/course-settings/featured-course/students/tmp-0002/edit",
      },
    ],
  },
  "course-01": {
    courseId: "course-01",
    title: "学生名单",
    badge: "名单页",
    courseTitle: "足球U8班",
    courseMeta: "16:00-17:30 · 操场A区 · 王强 · 20 人",
    searchPlaceholder: "搜索学生姓名 / 学生ID / 行政班",
    addHref: "/admin/course-settings/course-01/students/new",
    importHref: "/admin/course-settings/course-01/students/import",
    students: [
      {
        id: "stu-03118",
        name: "张明轩",
        studentCode: "STU-03118",
        homeroomClass: "五年级1班",
        highlighted: true,
        editHref: "/admin/course-settings/course-01/students/stu-03118/edit",
      },
      {
        id: "stu-03121",
        name: "刘雨桐",
        studentCode: "STU-03121",
        homeroomClass: "六年级2班",
        editHref: "/admin/course-settings/course-01/students/stu-03121/edit",
      },
    ],
  },
  "course-03": {
    courseId: "course-03",
    title: "学生名单",
    badge: "名单页",
    courseTitle: "机器人快闪班",
    courseMeta: "17:40-18:20 · 科技楼301 · 陈静 · 12 人",
    searchPlaceholder: "搜索学生姓名 / 学生ID / 行政班",
    addHref: "/admin/course-settings/course-03/students/new",
    importHref: "/admin/course-settings/course-03/students/import",
    students: [
      {
        id: "tmp-1001",
        name: "陈思远",
        studentCode: "TMP-1001",
        homeroomClass: "六年级1班",
        highlighted: true,
        editHref: "/admin/course-settings/course-03/students/tmp-1001/edit",
      },
      {
        id: "tmp-1002",
        name: "赵思琪",
        studentCode: "TMP-1002",
        homeroomClass: "六年级1班",
        editHref: "/admin/course-settings/course-03/students/tmp-1002/edit",
      },
    ],
  },
};

export const adminCourseStudentForms: Record<string, AdminCourseStudentFormData> = {
  "featured-course:new": {
    courseId: "featured-course",
    title: "新增学生",
    badge: "表单页",
    courseTitle: "乐高竞赛班5-6",
    submitLabel: "保存并加入名单",
    nameValue: "",
    namePlaceholder: "请输入学生姓名",
    studentCodeValue: "",
    studentCodePlaceholder: "请输入学生ID",
    homeroomClassValue: "",
    homeroomClassPlaceholder: "请输入行政班",
  },
  "featured-course:tmp-0002": {
    courseId: "featured-course",
    title: "编辑学生",
    badge: "编辑页",
    courseTitle: "乐高竞赛班5-6",
    courseContext: "当前属于 乐高竞赛班5-6 · TMP-0002",
    submitLabel: "保存学生信息",
    nameValue: "林子言",
    studentCodeValue: "TMP-0002",
    homeroomClassValue: "五年级3班",
  },
  "featured-course:stu-05231": {
    courseId: "featured-course",
    title: "编辑学生",
    badge: "编辑页",
    courseTitle: "乐高竞赛班5-6",
    courseContext: "当前属于 乐高竞赛班5-6 · STU-05231",
    submitLabel: "保存学生信息",
    nameValue: "王一诺",
    studentCodeValue: "STU-05231",
    homeroomClassValue: "五年级3班",
  },
  "course-01:new": {
    courseId: "course-01",
    title: "新增学生",
    badge: "表单页",
    courseTitle: "足球U8班",
    submitLabel: "保存并加入名单",
    nameValue: "",
    namePlaceholder: "请输入学生姓名",
    studentCodeValue: "",
    studentCodePlaceholder: "请输入学生ID",
    homeroomClassValue: "",
    homeroomClassPlaceholder: "请输入行政班",
  },
  "course-01:stu-03118": {
    courseId: "course-01",
    title: "编辑学生",
    badge: "编辑页",
    courseTitle: "足球U8班",
    courseContext: "当前属于 足球U8班 · STU-03118",
    submitLabel: "保存学生信息",
    nameValue: "张明轩",
    studentCodeValue: "STU-03118",
    homeroomClassValue: "五年级1班",
  },
  "course-01:stu-03121": {
    courseId: "course-01",
    title: "编辑学生",
    badge: "编辑页",
    courseTitle: "足球U8班",
    courseContext: "当前属于 足球U8班 · STU-03121",
    submitLabel: "保存学生信息",
    nameValue: "刘雨桐",
    studentCodeValue: "STU-03121",
    homeroomClassValue: "六年级2班",
  },
  "course-03:new": {
    courseId: "course-03",
    title: "新增学生",
    badge: "表单页",
    courseTitle: "机器人快闪班",
    submitLabel: "保存并加入名单",
    nameValue: "",
    namePlaceholder: "请输入学生姓名",
    studentCodeValue: "",
    studentCodePlaceholder: "请输入学生ID",
    homeroomClassValue: "",
    homeroomClassPlaceholder: "请输入行政班",
  },
  "course-03:tmp-1001": {
    courseId: "course-03",
    title: "编辑学生",
    badge: "编辑页",
    courseTitle: "机器人快闪班",
    courseContext: "当前属于 机器人快闪班 · TMP-1001",
    submitLabel: "保存学生信息",
    nameValue: "陈思远",
    studentCodeValue: "TMP-1001",
    homeroomClassValue: "六年级1班",
  },
  "course-03:tmp-1002": {
    courseId: "course-03",
    title: "编辑学生",
    badge: "编辑页",
    courseTitle: "机器人快闪班",
    courseContext: "当前属于 机器人快闪班 · TMP-1002",
    submitLabel: "保存学生信息",
    nameValue: "赵思琪",
    studentCodeValue: "TMP-1002",
    homeroomClassValue: "六年级1班",
  },
};

export const adminCourseStudentImports: Record<string, AdminCourseStudentImportData> = {
  "featured-course": {
    courseId: "featured-course",
    title: "批量导入学生",
    badge: "导入页",
    courseTitle: "乐高竞赛班5-6",
    fields: ["学生 ID", "姓名", "行政班"],
    downloadLabel: "下载模板",
    uploadLabel: "上传学生名单",
  },
  "course-01": {
    courseId: "course-01",
    title: "批量导入学生",
    badge: "导入页",
    courseTitle: "足球U8班",
    fields: ["学生 ID", "姓名", "行政班"],
    downloadLabel: "下载模板",
    uploadLabel: "上传学生名单",
  },
  "course-03": {
    courseId: "course-03",
    title: "批量导入学生",
    badge: "导入页",
    courseTitle: "机器人快闪班",
    fields: ["学生 ID", "姓名", "行政班"],
    downloadLabel: "下载模板",
    uploadLabel: "上传学生名单",
  },
};

export const adminTeacherSettingCourses: Record<string, AdminTeacherSettingCourse> = {
  "featured-course": {
    id: "featured-course",
    title: "乐高竞赛班5-6",
    meta: "科技楼205 · 赵鹏 · 18130033003",
    currentTeacherLabel: "李明 · 13800135678",
    currentTeacherMode: "temporary",
    defaultTeacherLabel: "赵鹏 · 13800991200",
  },
  "course-01": {
    id: "course-01",
    title: "创意美术A班",
    meta: "美术教室301 · 张文 · 18140044668",
    currentTeacherLabel: "默认：张文 · 13800224455",
    currentTeacherMode: "default",
  },
  "course-02": {
    id: "course-02",
    title: "无人机飞行A班",
    meta: "实验楼402 · 周林 · 18140044670",
    currentTeacherLabel: "周林 · 18140044670",
    currentTeacherMode: "temporary",
    defaultTeacherLabel: "赵鹏 · 13800991200",
  },
};

export const adminTeacherSelections: Record<string, AdminTeacherSelectionData> = {
  "featured-course": {
    courseId: "featured-course",
    courseTitle: "乐高竞赛班5-6",
    courseMeta: "科技楼205 · 16:00-17:30 · 赵鹏",
    defaultTeacherLabel: "默认：赵鹏 · 13800991200",
    teachers: [
      { id: "teacher-01", label: "王琳 · 13800664332", note: "系统老师" },
      { id: "teacher-02", label: "李明 · 13800135678", note: "当前代课", selected: true },
      { id: "teacher-03", label: "陈老师 · 13800553112", note: "系统老师" },
    ],
  },
  "course-01": {
    courseId: "course-01",
    courseTitle: "创意美术A班",
    courseMeta: "美术教室301 · 16:00-17:30 · 张文",
    defaultTeacherLabel: "默认：张文 · 13800224455",
    teachers: [
      { id: "teacher-04", label: "张文 · 13800224455", note: "默认老师", selected: true },
      { id: "teacher-05", label: "李明 · 13800135678", note: "系统老师" },
      { id: "teacher-06", label: "王琳 · 13800664332", note: "系统老师" },
    ],
  },
  "course-02": {
    courseId: "course-02",
    courseTitle: "无人机飞行A班",
    courseMeta: "实验楼402 · 17:40-18:40 · 周林",
    defaultTeacherLabel: "默认：周林 · 18140044670",
    teachers: [
      { id: "teacher-07", label: "周林 · 18140044670", note: "默认老师", selected: true },
      { id: "teacher-08", label: "陈老师 · 13800553112", note: "系统老师" },
    ],
  },
};

export const adminExternalTeacherForms: Record<string, AdminExternalTeacherData> = {
  "featured-course": {
    courseId: "featured-course",
    courseTitle: "乐高竞赛班5-6",
    courseMeta: "科技楼205 · 16:00-17:30 · 赵鹏",
  },
  "course-01": {
    courseId: "course-01",
    courseTitle: "创意美术A班",
    courseMeta: "美术教室301 · 16:00-17:30 · 张文",
  },
  "course-02": {
    courseId: "course-02",
    courseTitle: "无人机飞行A班",
    courseMeta: "实验楼402 · 17:40-18:40 · 周林",
  },
};

export const adminTimeSettingsData: AdminTimeSettingsData = {
  days: [
    { label: "周一" },
    { label: "周二", active: true },
    { label: "周三" },
    { label: "周四" },
    { label: "周五" },
  ],
  actualClassTime: "15:50 - 17:20",
  attendanceWindow: "15:45 - 15:55",
  actualHref: "/admin/time-settings/class-time",
  attendanceHref: "/admin/time-settings/attendance-window",
};

export const adminTimeSettingDetails: Record<string, AdminTimeSettingDetailData> = {
  "class-time": {
    title: "设置实际上课时间",
    subtitle: "参考周二默认规则，可按当天业务临时调整",
    currentRange: "15:50 - 17:20",
    helperText: "实际开始或结束时间变更后，点名时间应同步联动调整。",
    defaultLogicText: "当前周二默认带出：15:50 - 17:20。",
    pickerHref: "/admin/time-settings/class-time/picker",
    saveLabel: "保存上课时间",
    resetLabel: "恢复默认上课时间",
  },
  "attendance-window": {
    title: "设置点名时间",
    subtitle: "参考实际上课时间 15:50 - 17:20",
    currentRange: "15:45 - 15:55",
    helperText: "老师仅可在该时间窗口内完成点名",
    defaultLogicText: "默认带出逻辑：15:50 的前后 5 分钟，对应时间范围 15:45 - 15:55。",
    pickerHref: "/admin/time-settings/attendance-window/picker",
    saveLabel: "保存点名时间",
    resetLabel: "恢复默认点名时间",
  },
};

export const adminTimePickerData: Record<string, AdminTimePickerData> = {
  "class-time": {
    title: "设置实际上课时间",
    badge: "时间选择",
    contextTitle: "周二实际上课时间设置",
    contextSubtitle: "当前上课时间 15:50 - 17:20",
    currentRange: "15:50 - 17:20",
    primaryLabel: "开始时间",
    secondaryLabel: "结束时间",
    confirmLabel: "确认时间",
  },
  "attendance-window": {
    title: "设置点名时间",
    badge: "时间选择",
    contextTitle: "周二点名时间设置",
    contextSubtitle: "参考实际上课时间 15:50 - 17:20",
    currentRange: "15:45 - 15:55",
    primaryLabel: "开始时间",
    secondaryLabel: "结束时间",
    confirmLabel: "确认时间",
  },
};
