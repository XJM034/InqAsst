import { notFound } from "next/navigation";

import { AttendanceSessionClient } from "@/components/app/attendance-session-client";
import { getAttendanceSession, getTeacherHomeData } from "@/lib/services/mobile-app";

export default async function TeacherAttendanceDemoPage({
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

  const displayMeta =
    selectedSchedule && course === "substitute" && selectedSchedule.substituteCourse
      ? {
          pageTitle: "点名",
          dateLabel: selectedSchedule.dateLabel,
          courseTitle: selectedSchedule.substituteCourse.title,
          courseInfo: selectedSchedule.substituteCourse.description,
        }
      : undefined;

  return <AttendanceSessionClient session={session} displayMeta={displayMeta} />;
}
