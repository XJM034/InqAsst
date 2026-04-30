import { AdminTimePickerClient } from "./client";
import { SearchParamsSuspense } from "@/components/app/search-params-suspense";
import { ADMIN_TIME_SETTING_STATIC_PARAMS } from "@/lib/admin-route-hrefs";

export function generateStaticParams() {
  return ADMIN_TIME_SETTING_STATIC_PARAMS.map((courseSessionId) => ({ courseSessionId }));
}

export default function AdminTimePickerPage() {
  return (
    <SearchParamsSuspense>
      <AdminTimePickerClient />
    </SearchParamsSuspense>
  );
}
