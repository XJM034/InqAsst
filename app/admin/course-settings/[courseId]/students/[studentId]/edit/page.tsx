import { AdminCourseStudentEditClient } from "./client";

export function generateStaticParams() {
  return [{ courseId: "_", studentId: "_" }];
}

export default function AdminCourseStudentEditPage() {
  return <AdminCourseStudentEditClient />;
}
