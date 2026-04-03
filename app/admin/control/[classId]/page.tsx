import { notFound } from "next/navigation";

import { AdminClassAttendanceClient } from "@/components/app/admin-class-attendance-client";
import { getAdminClassAttendanceData } from "@/lib/services/mobile-app";

export default async function AdminClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const data = await getAdminClassAttendanceData(classId);

  if (!data) {
    notFound();
  }

  return <AdminClassAttendanceClient data={data} />;
}
