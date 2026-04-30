"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import type { AttendanceSession, TeacherHomeData } from "@/lib/domain/types";
import { AttendanceSessionClient } from "@/components/app/attendance-session-client";

type TeacherAttendanceRouteClientProps = {
  session: AttendanceSession;
  home: TeacherHomeData;
  mode?: "attendance" | "roster";
};

export function TeacherAttendanceRouteClient({
  session,
  home,
  mode = "attendance",
}: TeacherAttendanceRouteClientProps) {
  const searchParams = useSearchParams();
  const day = searchParams.get("day") ?? undefined;
  const course = searchParams.get("course") ?? undefined;

  const selectedSchedule = useMemo(
    () =>
      home.daySchedules.find((item) => item.dayKey === day) ??
      home.daySchedules.find((item) => item.dayKey === home.defaultDayKey),
    [day, home.daySchedules, home.defaultDayKey],
  );

  const displayMeta = useMemo(() => {
    if (!selectedSchedule) {
      return undefined;
    }

    if (course === "substitute" && selectedSchedule.substituteCourse) {
      return {
        pageTitle: mode === "roster" ? "学生名单" : "点名",
        dateLabel: selectedSchedule.dateLabel,
        courseTitle: selectedSchedule.substituteCourse.title,
        courseInfo: selectedSchedule.substituteCourse.description,
      };
    }

    if (mode === "roster") {
      return {
        pageTitle: "学生名单",
        dateLabel: selectedSchedule.dateLabel,
        courseTitle: selectedSchedule.primaryCourse.title,
        courseInfo: `${selectedSchedule.primaryCourse.campus} | ${selectedSchedule.primaryCourse.locationTrail} | ${selectedSchedule.primaryCourse.time}`,
      };
    }

    return undefined;
  }, [course, mode, selectedSchedule]);

  const rosterNotice =
    mode === "roster" && selectedSchedule
      ? course === "substitute" && selectedSchedule.substituteCourse
        ? `${selectedSchedule.substituteCourse.title} 当前不在点名时间，可先查看学生名单。`
        : `${selectedSchedule.primaryCourse.title} 当前不在点名时间，可先查看学生名单。`
      : undefined;

  return (
    <AttendanceSessionClient
      session={session}
      mode={mode}
      displayMeta={displayMeta}
      rosterNotice={rosterNotice}
      tabActive={mode === "roster" ? "home" : "attendance"}
      backHref="/teacher/home"
      backLabel={mode === "roster" ? "返回主页" : "返回主页"}
    />
  );
}
