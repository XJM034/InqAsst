import { notFound } from "next/navigation";

import { AdminClassAttendanceClient } from "@/components/app/admin-class-attendance-client";
import { adminClassAttendanceData } from "@/lib/mocks/mobile-data";
import { getAdminClassAttendanceData } from "@/lib/services/mobile-app";

export function generateStaticParams() {
  return Object.keys(adminClassAttendanceData).map((classId) => ({ classId }));
}

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
