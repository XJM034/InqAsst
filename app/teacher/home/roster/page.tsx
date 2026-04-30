import { notFound } from "next/navigation";
import { Suspense } from "react";

import { TeacherAttendanceRouteClient } from "@/components/app/teacher-attendance-route-client";
import { getAttendanceSession, getTeacherHomeData } from "@/lib/services/mobile-app";

export default async function TeacherHomeRosterPage() {
  const [session, home] = await Promise.all([
    getAttendanceSession("demo"),
    getTeacherHomeData(),
  ]);

  if (!session) {
    notFound();
  }

  return (
    <Suspense>
      <TeacherAttendanceRouteClient session={session} home={home} mode="roster" />
    </Suspense>
  );
}
