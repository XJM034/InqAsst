import { redirect } from "next/navigation";

export default async function LegacyTeacherAttendanceRosterPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string; course?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params.day) {
    query.set("day", params.day);
  }

  if (params.course) {
    query.set("course", params.course);
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  redirect(`/teacher/home/roster${suffix}`);
}
