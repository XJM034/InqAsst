import { TeacherHomeClient } from "@/components/app/teacher-home-client";
import { getTeacherHomeData } from "@/lib/services/mobile-app";

export default async function TeacherHomePage() {
  const home = await getTeacherHomeData();

  return <TeacherHomeClient home={home} />;
}
