"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { PageLoading } from "@/components/app/page-loading";
import { SearchParamsSuspense } from "@/components/app/search-params-suspense";
import { navigateTo } from "@/lib/static-navigation";

export default function LegacyTeacherAttendanceRosterPage() {
  return (
    <SearchParamsSuspense>
      <LegacyTeacherAttendanceRosterPageInner />
    </SearchParamsSuspense>
  );
}

function LegacyTeacherAttendanceRosterPageInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = new URLSearchParams();
    const keys = ["day", "course", "courseId", "sessionId", "courseSessionId"] as const;

    for (const key of keys) {
      const value = searchParams.get(key);
      if (value) {
        query.set(key, value);
      }
    }

    const suffix = query.toString() ? `?${query.toString()}` : "";
    navigateTo(`/teacher/home/roster${suffix}`, { replace: true });
  }, [searchParams]);

  return <PageLoading />;
}
