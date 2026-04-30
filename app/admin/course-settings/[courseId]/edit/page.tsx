import { SearchParamsSuspense } from "@/components/app/search-params-suspense";

import { AdminCourseEditClient } from "./client";

export function generateStaticParams() {
  return [{ courseId: "_" }];
}

export default function AdminCourseEditPage() {
  return (
    <SearchParamsSuspense>
      <AdminCourseEditClient />
    </SearchParamsSuspense>
  );
}
