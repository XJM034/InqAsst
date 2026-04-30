"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { resolveStaticExportParam } from "@/lib/admin-route-hrefs";
import { AdminCourseRosterClient as RosterClient } from "@/components/app/admin-course-roster-client";
import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageLoading } from "@/components/app/page-loading";
import { PageShell } from "@/components/app/page-shell";
import { PageStatus } from "@/components/app/page-status";
import {
  buildAdminTabItems,
  normalizeAdminCampus,
  withCampusQuery,
} from "@/lib/admin-campus";
import { getAdminCourseRoster } from "@/lib/services/mobile-app";

export function AdminCourseRosterClientPage() {
  const params = useParams<{ courseId: string }>();
  const searchParams = useSearchParams();
  const courseId = resolveStaticExportParam(params.courseId, searchParams.get("courseId"));
  const courseSessionId = searchParams.get("courseSessionId") ?? undefined;
  const campus = searchParams.get("campus") ?? undefined;
  const activeCampus = normalizeAdminCampus(campus);

  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminCourseRoster>>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getAdminCourseRoster(courseId, courseSessionId, activeCampus)
      .then((nextData) => {
        if (!cancelled) {
          setData(nextData);
          setError("");
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setData(null);
          setError(err instanceof Error ? err.message : "学生名单加载失败，请稍后重试");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeCampus, courseId, courseSessionId]);

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <PageStatus
        title="学生名单加载失败"
        description={error}
        secondaryActionLabel="返回课程设置"
        secondaryActionHref={withCampusQuery("/admin/course-settings", activeCampus)}
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  if (!data) {
    return (
      <PageStatus
        title="暂无学生名单"
        description="当前课程还没有可展示的学生数据。"
        secondaryActionLabel="返回课程设置"
        secondaryActionHref={withCampusQuery("/admin/course-settings", activeCampus)}
      />
    );
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader
            title={data.title}
            backHref={withCampusQuery("/admin/course-settings", activeCampus)}
            trailing={
              <span className="rounded-full bg-[#E8F0FB] px-2.5 py-1 text-[11px] font-semibold text-[#1E3A5F]">
                {data.badge}
              </span>
            }
          />
          <RosterClient data={data} campus={activeCampus} />
        </div>
        <MobileTabBar active="home" items={buildAdminTabItems(activeCampus)} />
      </div>
    </PageShell>
  );
}
