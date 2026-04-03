import { notFound } from "next/navigation";

import { AttendanceSessionClient } from "@/components/app/attendance-session-client";
import { getAttendanceSession, getTeacherHomeData } from "@/lib/services/mobile-app";

export default async function TeacherHomeRosterPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string; course?: string }>;
}) {
  const [{ day, course }, session, home] = await Promise.all([
    searchParams,
    getAttendanceSession("demo"),
    getTeacherHomeData(),
  ]);

  if (!session) {
    notFound();
  }

  const selectedSchedule =
    home.daySchedules.find((item) => item.dayKey === day) ??
    home.daySchedules.find((item) => item.dayKey === home.defaultDayKey);

  if (!selectedSchedule) {
    notFound();
  }

  const displayMeta =
    course === "substitute" && selectedSchedule.substituteCourse
      ? {
          pageTitle: "学生名单",
          dateLabel: selectedSchedule.dateLabel,
          courseTitle: selectedSchedule.substituteCourse.title,
          courseInfo: selectedSchedule.substituteCourse.description,
        }
      : {
          pageTitle: "学生名单",
          dateLabel: selectedSchedule.dateLabel,
          courseTitle: selectedSchedule.primaryCourse.title,
          courseInfo: `${selectedSchedule.primaryCourse.campus} | ${selectedSchedule.primaryCourse.locationTrail} | ${selectedSchedule.primaryCourse.time}`,
        };

  const rosterNotice =
    course === "substitute" && selectedSchedule.substituteCourse
      ? `${selectedSchedule.substituteCourse.title} 当前不在点名时间，可先查看学生名单。`
      : `${selectedSchedule.primaryCourse.title} 当前不在点名时间，可先查看学生名单。`;

  return (
    <AttendanceSessionClient
      session={session}
      mode="roster"
      displayMeta={displayMeta}
      rosterNotice={rosterNotice}
      tabActive="home"
      backHref="/teacher/home"
      backLabel="返回主页"
    />
  );
}
