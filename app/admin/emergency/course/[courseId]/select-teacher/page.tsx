import { AdminTeacherSelectionClient } from "./client";
import { SearchParamsSuspense } from "@/components/app/search-params-suspense";

export function generateStaticParams() {
  return [{ courseId: "_" }];
}

export default function AdminTeacherSelectionPage() {
  return (
    <SearchParamsSuspense>
      <AdminTeacherSelectionClient />
    </SearchParamsSuspense>
  );
}
