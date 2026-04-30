import { AdminClassDetailClient } from "./client";
import { SearchParamsSuspense } from "@/components/app/search-params-suspense";

export function generateStaticParams() {
  return [{ classId: "_" }];
}

export default function AdminClassDetailPage() {
  return (
    <SearchParamsSuspense>
      <AdminClassDetailClient />
    </SearchParamsSuspense>
  );
}
