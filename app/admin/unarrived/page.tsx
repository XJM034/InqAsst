"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AdminUnarrivedSkeleton } from "@/components/app/admin-unarrived-skeleton";
import { AdminUnarrivedClient } from "@/components/app/admin-unarrived-client";
import { PageStatus } from "@/components/app/page-status";
import { normalizeAdminCampus } from "@/lib/admin-campus";
import type { AdminUnarrivedData } from "@/lib/domain/types";
import { getAdminUnarrivedData } from "@/lib/services/mobile-app";
import { SearchParamsSuspense } from "@/components/app/search-params-suspense";

export default function AdminUnarrivedPage() {
  return (
    <SearchParamsSuspense>
      <AdminUnarrivedPageInner />
    </SearchParamsSuspense>
  );
}

function AdminUnarrivedPageInner() {
  const searchParams = useSearchParams();
  const campus = searchParams.get("campus") ?? undefined;
  const activeCampus = normalizeAdminCampus(campus);
  const requestKey = activeCampus ?? "__default__";

  const [data, setData] = useState<AdminUnarrivedData | null>(null);
  const [error, setError] = useState("");
  const [resolvedRequestKey, setResolvedRequestKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void getAdminUnarrivedData(activeCampus)
      .then((nextData) => {
        if (active) {
          setData(nextData);
          setError("");
          setResolvedRequestKey(requestKey);
        }
      })
      .catch((err) => {
        if (active) {
          setData(null);
          setError(err instanceof Error ? err.message : "未到学生管理数据加载失败，请稍后重试");
          setResolvedRequestKey(requestKey);
        }
      });

    return () => {
      active = false;
    };
  }, [activeCampus, requestKey]);

  const currentData = resolvedRequestKey === requestKey ? data : null;
  const currentError = resolvedRequestKey === requestKey ? error : "";

  if (!currentData && !currentError) {
    return <AdminUnarrivedSkeleton campus={activeCampus} />;
  }

  if (!currentData) {
    return (
      <PageStatus
        title="未到学生管理加载失败"
        description={currentError || "当前无法读取未到学生管理数据。"}
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  return <AdminUnarrivedClient data={currentData} campus={activeCampus} />;
}
