"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AdminControlSkeleton } from "@/components/app/admin-control-skeleton";
import { AdminControlClient } from "@/components/app/admin-control-client";
import { PageStatus } from "@/components/app/page-status";
import { normalizeAdminCampus } from "@/lib/admin-campus";
import { getAdminControlData } from "@/lib/services/mobile-app";
import { SearchParamsSuspense } from "@/components/app/search-params-suspense";

export default function AdminControlPage() {
  return (
    <SearchParamsSuspense>
      <AdminControlPageInner />
    </SearchParamsSuspense>
  );
}

function AdminControlPageInner() {
  const searchParams = useSearchParams();
  const campus = searchParams.get("campus") ?? undefined;
  const activeCampus = normalizeAdminCampus(campus);
  const requestKey = activeCampus ?? "__default__";

  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminControlData>> | null>(null);
  const [error, setError] = useState("");
  const [resolvedRequestKey, setResolvedRequestKey] = useState<string | null>(null);
  const latestDataRef = useRef<typeof data>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const nextData = await getAdminControlData(activeCampus);
        if (active) {
          latestDataRef.current = nextData;
          setData(nextData);
          setError("");
          setResolvedRequestKey(requestKey);
        }
      } catch (err) {
        if (active) {
          if (latestDataRef.current) {
            setData(latestDataRef.current);
            setError("");
          } else {
            setData(null);
            setError(err instanceof Error ? err.message : "课程管理数据加载失败，请稍后重试");
          }
          setResolvedRequestKey(requestKey);
        }
      }
    }

    void loadData();

    const intervalId = window.setInterval(() => {
      if (!latestDataRef.current?.pollingEnabled) {
        return;
      }

      void loadData();
    }, 10_000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [activeCampus, requestKey]);

  const currentData = resolvedRequestKey === requestKey ? data : null;
  const currentError = resolvedRequestKey === requestKey ? error : "";

  if (!currentData && !currentError) {
    return <AdminControlSkeleton campus={activeCampus} />;
  }

  if (!currentData) {
    return (
      <PageStatus
        title="课程管理加载失败"
        description={currentError || "当前无法读取课程管理数据。"}
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  return <AdminControlClient data={currentData} campus={activeCampus} />;
}
