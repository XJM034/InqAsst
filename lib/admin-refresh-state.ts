import type { AdminCourseTeachersData, AdminEmergencyData } from "@/lib/domain/types";

export function buildEmergencyRefreshFailureData(
  data: AdminEmergencyData,
): AdminEmergencyData {
  return {
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
  };
}

export function buildCourseTeachersRefreshFailureData(
  data: AdminCourseTeachersData,
): AdminCourseTeachersData {
  return {
    ...data,
    teachers: [],
    teachersPage: {
      page: 0,
      size: data.teachersPage?.size ?? 20,
      totalPages: 0,
      totalElements: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
}
