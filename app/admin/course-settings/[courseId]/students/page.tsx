import { AdminCourseRosterClientPage } from "./client";

export function generateStaticParams() {
  return [{ courseId: "_" }];
}

export default function AdminCourseRosterPage() {
  return <AdminCourseRosterClientPage />;
}
