import { AdminExternalTeacherClient } from "./client";
import { SearchParamsSuspense } from "@/components/app/search-params-suspense";

export function generateStaticParams() {
  return [{ courseId: "_" }];
}

export default function AdminExternalTeacherPage() {
  return (
    <SearchParamsSuspense>
      <AdminExternalTeacherClient />
    </SearchParamsSuspense>
  );
}
