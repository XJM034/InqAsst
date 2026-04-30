"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import {
  buildAdminCourseRosterHref,
  resolveStaticExportParam,
} from "@/lib/admin-route-hrefs";
import { buildAdminTabItems, normalizeAdminCampus, withCampusQuery } from "@/lib/admin-campus";
import { AdminContextCard } from "@/components/app/admin-context-card";
import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageLoading } from "@/components/app/page-loading";
import { PageShell } from "@/components/app/page-shell";
import { PageStatus } from "@/components/app/page-status";
import { Button } from "@/components/ui/button";
import { getAdminCourseStudentImport } from "@/lib/services/mobile-app";

export function AdminCourseStudentImportClient() {
  const params = useParams<{ courseId: string }>();
  const searchParams = useSearchParams();
  const courseId = resolveStaticExportParam(params.courseId, searchParams.get("courseId"));
  const courseSessionId = searchParams.get("courseSessionId") ?? undefined;
  const campus = searchParams.get("campus") ?? undefined;
  const activeCampus = normalizeAdminCampus(campus);

  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminCourseStudentImport>> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getAdminCourseStudentImport(courseId, activeCampus)
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
          setError(err instanceof Error ? err.message : "导入页加载失败，请稍后重试");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeCampus, courseId]);

  const backHref = withCampusQuery(
    buildAdminCourseRosterHref(courseId, {
      courseSessionId,
    }),
    activeCampus,
  );

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <PageStatus
        title="导入页加载失败"
        description={error}
        secondaryActionLabel="返回名单"
        secondaryActionHref={backHref}
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  if (!data) {
    return (
      <PageStatus
        title="暂无导入信息"
        description="当前课程暂时无法展示批量导入信息。"
        secondaryActionLabel="返回名单"
        secondaryActionHref={backHref}
      />
    );
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader
            title={data.title}
            backHref={backHref}
            trailing={
              <span className="rounded-full bg-[#E8F0FB] px-2.5 py-1 text-[11px] font-semibold text-[#1E3A5F]">
                {data.badge}
              </span>
            }
          />

          <div className="space-y-3.5 px-5 pt-3">
            <AdminContextCard
              title={data.courseTitle}
              description="批量导入当前课程学生名单"
            />

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-4 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <h2 className="text-[15px] font-semibold text-[var(--jp-text)]">支持字段</h2>
              <div className="mt-3.5 grid grid-cols-3 gap-2">
                {data.fields.map((field) => (
                  <div
                    key={field}
                    className="rounded-[12px] border border-[#E8E5E0] bg-[#F5F3F0] px-2.5 py-2.5 text-center text-[11px] font-bold text-[var(--jp-text)]"
                  >
                    {field}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-4 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-[12px] border border-[#E8E5E0] bg-white text-[13px] font-semibold text-[var(--jp-text-secondary)] hover:bg-white"
                >
                  {data.downloadLabel}
                </Button>
                <Button className="h-11 w-full rounded-[12px] bg-[#1E3A5F] text-[13px] font-semibold text-white hover:bg-[#1E3A5F]/90">
                  {data.uploadLabel}
                </Button>
              </div>
            </section>
          </div>
        </div>

        <MobileTabBar active="home" items={buildAdminTabItems(activeCampus)} />
      </div>
    </PageShell>
  );
}
