"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { PageLoading } from "@/components/app/page-loading";
import { SearchParamsSuspense } from "@/components/app/search-params-suspense";
import { navigateTo } from "@/lib/static-navigation";

export default function LegacyTeacherAttendanceDemoPage() {
  return (
    <SearchParamsSuspense>
      <LegacyTeacherAttendanceDemoPageInner />
    </SearchParamsSuspense>
  );
}

function LegacyTeacherAttendanceDemoPageInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = new URLSearchParams();
    const courseId = searchParams.get("courseId");
    const sessionId = searchParams.get("sessionId");
    const courseSessionId = searchParams.get("courseSessionId");

    if (courseId) {
      query.set("courseId", courseId);
    }
    if (sessionId) {
      query.set("sessionId", sessionId);
    }
    if (courseSessionId) {
      query.set("courseSessionId", courseSessionId);
    }

    const suffix = query.toString() ? `?${query.toString()}` : "";
    const targetHref = courseId
      ? `/teacher/attendance/session${suffix}`
      : "/teacher/attendance";
    navigateTo(targetHref, { replace: true });
  }, [searchParams]);

  return <PageLoading />;
}
