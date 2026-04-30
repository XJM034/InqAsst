"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { AdminClassAttendanceClient } from "@/components/app/admin-class-attendance-client";
import { PageLoading } from "@/components/app/page-loading";
import { PageStatus } from "@/components/app/page-status";
import { normalizeAdminCampus } from "@/lib/admin-campus";
import { resolveStaticExportParam } from "@/lib/admin-route-hrefs";
import { getAdminClassAttendanceData } from "@/lib/services/mobile-app";

export function AdminClassDetailClient() {
  const params = useParams<{ classId: string }>();
  const searchParams = useSearchParams();
  const classId = resolveStaticExportParam(params.classId, searchParams.get("classId"));
  const campus = searchParams.get("campus") ?? undefined;
  const courseSessionId = searchParams.get("courseSessionId") ?? searchParams.get("sessionId") ?? undefined;
  const activeCampus = normalizeAdminCampus(campus);

  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminClassAttendanceData>>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    void getAdminClassAttendanceData(classId, activeCampus, courseSessionId)
      .then((nextData) => {
        if (active) {
          setData(nextData);
          setError("");
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setData(null);
          setError(err instanceof Error ? err.message : "点名名单加载失败，请稍后重试");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [activeCampus, classId, courseSessionId]);

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <PageStatus
        title="点名名单加载失败"
        description={error}
        secondaryActionLabel="返回总控"
        secondaryActionHref="/admin/control"
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  if (!data) {
    return (
      <PageStatus
        title="暂无点名名单"
        description="当前课程还没有可展示的点名数据。"
        secondaryActionLabel="返回总控"
        secondaryActionHref="/admin/control"
      />
    );
  }

  return <AdminClassAttendanceClient data={data} campus={activeCampus} />;
}
