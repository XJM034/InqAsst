import { AdminCourseStudentCreateClient } from "./client";

export function generateStaticParams() {
  return [{ courseId: "_" }];
}

export default function AdminCourseStudentCreatePage() {
  return <AdminCourseStudentCreateClient />;
}
