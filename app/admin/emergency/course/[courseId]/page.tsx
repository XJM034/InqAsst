import { AdminTeacherCourseClient } from "./client";
import { SearchParamsSuspense } from "@/components/app/search-params-suspense";

export function generateStaticParams() {
  return [{ courseId: "_" }];
}

export default function AdminTeacherCoursePage() {
  return (
    <SearchParamsSuspense>
      <AdminTeacherCourseClient />
    </SearchParamsSuspense>
  );
}
