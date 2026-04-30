"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AdminCourseSettingsClient } from "@/components/app/admin-course-settings-client";
import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageLoading } from "@/components/app/page-loading";
import { PageShell } from "@/components/app/page-shell";
import { PageStatus } from "@/components/app/page-status";
import { SearchParamsSuspense } from "@/components/app/search-params-suspense";
import { buildAdminTabItems, normalizeAdminCampus, withCampusQuery } from "@/lib/admin-campus";
import { getAdminCourseSettingsData } from "@/lib/services/mobile-app";

export default function AdminCourseSettingsPage() {
  return (
    <SearchParamsSuspense>
      <AdminCourseSettingsPageInner />
    </SearchParamsSuspense>
  );
}

function AdminCourseSettingsPageInner() {
  const searchParams = useSearchParams();
  const campus = searchParams.get("campus") ?? undefined;
  const activeCampus = normalizeAdminCampus(campus);
  const requestKey = activeCampus ?? "__default__";

  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminCourseSettingsData>> | null>(
    null,
  );
  const [error, setError] = useState("");
  const [resolvedRequestKey, setResolvedRequestKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getAdminCourseSettingsData(activeCampus)
      .then((nextData) => {
        if (!cancelled) {
          setData(nextData);
          setError("");
          setResolvedRequestKey(requestKey);
        }
      })
      .catch((nextError) => {
        if (!cancelled) {
          setData(null);
          setError(
            nextError instanceof Error
              ? nextError.message
              : "课程设置加载失败，请稍后重试",
          );
          setResolvedRequestKey(requestKey);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeCampus, requestKey]);

  const currentData = resolvedRequestKey === requestKey ? data : null;
  const currentError = resolvedRequestKey === requestKey ? error : "";

  if (!currentData && !currentError) {
    return <PageLoading />;
  }

  if (currentError) {
    return (
      <PageStatus
        title="课程设置加载失败"
        description={currentError}
        secondaryActionLabel="返回首页"
        secondaryActionHref={withCampusQuery("/admin/home", activeCampus)}
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  if (!currentData) {
    return (
      <PageStatus
        title="暂无课程设置"
        description="当前没有可展示的课程设置数据，请确认后端接口和当天课节数据。"
        secondaryActionLabel="返回首页"
        secondaryActionHref={withCampusQuery("/admin/home", activeCampus)}
      />
    );
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader
            title={currentData.title}
            backHref={withCampusQuery("/admin/home", activeCampus)}
            trailing={
              <span className="rounded-full bg-[#F5F3F0] px-2.5 py-1 text-[10px] font-semibold text-[var(--jp-text-muted)]">
                {currentData.effectiveCourseCountLabel}
              </span>
            }
          />
          <AdminCourseSettingsClient
            data={currentData}
            campus={activeCampus}
            onDataChange={setData}
          />
        </div>
        <MobileTabBar active="home" items={buildAdminTabItems(activeCampus)} />
      </div>
    </PageShell>
  );
}
