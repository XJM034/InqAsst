"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import type { AdminTimePickerData } from "@/lib/domain/types";
import { AdminTimeSettingPickerClient } from "@/components/app/admin-time-setting-picker-client";
import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageLoading } from "@/components/app/page-loading";
import { PageShell } from "@/components/app/page-shell";
import { PageStatus } from "@/components/app/page-status";
import { buildAdminTimeSettingsHref, resolveStaticExportParam } from "@/lib/admin-route-hrefs";
import { getAdminTimePicker } from "@/lib/services/mobile-app";

export function AdminTimePickerClient() {
  const params = useParams<{ courseSessionId: string }>();
  const searchParams = useSearchParams();
  const settingKey = resolveStaticExportParam(
    params.courseSessionId,
    searchParams.get("courseSessionId"),
  );
  const targetDate = searchParams.get("targetDate");
  const [data, setData] = useState<AdminTimePickerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    void getAdminTimePicker(settingKey, targetDate)
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
          setError(err instanceof Error ? err.message : "时间选择器加载失败，请稍后重试");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [settingKey, targetDate]);

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <PageStatus
        title="时间选择器加载失败"
        description={error}
        secondaryActionLabel="返回时间设置"
        secondaryActionHref={buildAdminTimeSettingsHref(targetDate ?? undefined)}
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  if (!data) {
    return (
      <PageStatus
        title="暂无可调整时间"
        description="当前规则还没有可用的时间选择器数据。"
        secondaryActionLabel="返回时间设置"
        secondaryActionHref={buildAdminTimeSettingsHref(targetDate ?? undefined)}
      />
    );
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader
            title={data.title}
            backHref={data.backHref}
            trailing={
              <span className="rounded-full bg-[#FFF1DE] px-3 py-1.5 text-[11px] font-semibold text-[#C46A1A]">
                {data.badge}
              </span>
            }
          />
          <div className="px-5 pt-3">
            <AdminTimeSettingPickerClient data={data} />
          </div>
        </div>
        <MobileTabBar
          active="home"
          items={[
            { key: "home", href: "/admin/home" },
            { key: "attendance", href: "/admin/control" },
            { key: "profile", href: "/admin/me" },
          ]}
        />
      </div>
    </PageShell>
  );
}
