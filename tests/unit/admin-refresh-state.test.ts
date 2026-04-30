import type { AdminCourseTeachersData, AdminEmergencyData } from "@/lib/domain/types";
import {
  buildCourseTeachersRefreshFailureData,
  buildEmergencyRefreshFailureData,
} from "@/lib/admin-refresh-state";

describe("admin refresh failure state helpers", () => {
  it("hides stale emergency courses while preserving the active day tabs", () => {
    const data: AdminEmergencyData = {
      days: [
        { key: "mon", label: "周一", active: false },
        { key: "wed", label: "周三", active: true },
      ],
      selectedDayKey: "wed",
      featuredDateLabel: "今日代课课程 - 4.22",
      featuredCourses: [
        {
          id: "featured-1",
          courseId: "100",
          sessionId: "200",
          title: "AI人工智能",
          meta: "旧代课卡",
          href: "/admin/emergency/course/_?courseId=100&courseSessionId=200",
        },
      ],
      courses: {
        items: [
          {
            id: "course-1",
            courseId: "101",
            sessionId: "201",
            title: "旧课程",
            meta: "旧列表项",
            href: "/admin/emergency/course/_?courseId=101&courseSessionId=201",
          },
        ],
        page: 2,
        size: 20,
        totalPages: 5,
        totalElements: 91,
        hasNextPage: true,
        hasPrevPage: true,
      },
    };

    expect(buildEmergencyRefreshFailureData(data)).toEqual({
      ...data,
      featuredCourses: [],
      courses: {
        ...data.courses,
        items: [],
        page: 0,
        totalPages: 0,
        totalElements: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  });

  it("hides stale course-teacher rows while preserving the selected day", () => {
    const data: AdminCourseTeachersData = {
      title: "查看课程老师",
      searchPlaceholder: "搜索老师姓名 / 手机号",
      days: [{ key: "wed", label: "周三", active: true }],
      defaultDayKey: "wed",
      selectedDayKey: "wed",
      teachers: [
        {
          id: "teacher-1",
          dayKey: "wed",
          label: "李益慧",
          note: "AI人工智能 · 综合楼4楼微机室3",
        },
      ],
      teachersPage: {
        page: 1,
        size: 20,
        totalPages: 3,
        totalElements: 37,
        hasNextPage: true,
        hasPrevPage: true,
      },
    };

    expect(buildCourseTeachersRefreshFailureData(data)).toEqual({
      ...data,
      teachers: [],
      teachersPage: {
        page: 0,
        size: 20,
        totalPages: 0,
        totalElements: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  });
});
