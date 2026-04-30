"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageLoading } from "@/components/app/page-loading";
import { PageShell } from "@/components/app/page-shell";
import { PageStatus } from "@/components/app/page-status";
import { StaticLink } from "@/components/app/static-link";
import type { AdminTimeSettingsData } from "@/lib/domain/types";
import { getAdminTimeSettingsData } from "@/lib/services/mobile-app";

export default function AdminTimeSettingsPage() {
  const searchParams = useSearchParams();
  const targetDate = searchParams.get("targetDate");
  const [data, setData] = useState<AdminTimeSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    void getAdminTimeSettingsData(targetDate)
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
          setError(err instanceof Error ? err.message : "时间设置加载失败，请稍后重试");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [targetDate]);

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <PageStatus
        title="时间设置加载失败"
        description={error}
        secondaryActionLabel="返回首页"
        secondaryActionHref="/admin/home"
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  if (!data) {
    return (
      <PageStatus
        title="暂无时间规则"
        description="当前校区还没有可配置的时间规则。"
        secondaryActionLabel="返回首页"
        secondaryActionHref="/admin/home"
      />
    );
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader title={data.title} backHref="/admin/home" />
          <section className="mx-5 mt-2.5 rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {data.days.map((day) => (
                <StaticLink
                  key={day.key}
                  href={day.href ?? `/admin/time-settings?targetDate=${day.date}`}
                  className={
                    day.active
                      ? "flex min-h-9 items-center justify-center rounded-full border border-transparent bg-[#1E3A5F] px-2 py-2 text-center text-xs font-semibold text-white"
                      : day.readonly
                        ? "flex min-h-9 items-center justify-center rounded-full border border-[#ECE7DE] bg-[#F6F4F1] px-2 py-2 text-center text-xs font-semibold text-[#8F877A]"
                        : "flex min-h-9 items-center justify-center rounded-full border border-[#E8E5E0] bg-[#F5F3F0] px-2 py-2 text-center text-xs font-semibold text-[var(--jp-text)]"
                  }
                >
                  {day.label}
                </StaticLink>
              ))}
            </div>
          </section>
          {data.cards.length > 0 ? (
            data.cards.map((card) => (
              card.href ? (
                <StaticLink
                  key={card.id}
                  href={card.href}
                  className="mx-5 mt-2.5 block rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[15px] font-bold text-[var(--jp-text)]">{card.title}</p>
                      <p className="mt-2 text-xs text-[var(--jp-text-secondary)]">{card.currentLabel}</p>
                    </div>
                    <ChevronRight className="size-4 text-[var(--jp-text-muted)]" />
                  </div>
                </StaticLink>
              ) : (
                <div
                  key={card.id}
                  className="mx-5 mt-2.5 rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[15px] font-bold text-[var(--jp-text)]">{card.title}</p>
                      <p className="mt-2 text-xs text-[var(--jp-text-secondary)]">{card.currentLabel}</p>
                    </div>
                  </div>
                </div>
              )
            ))
          ) : (
            <div className="mx-5 mt-2.5 rounded-[16px] border border-[#E8E5E0] bg-white px-4 py-6 text-center text-[13px] text-[var(--jp-text-muted)]">
              当前还没有可配置的时间规则。
            </div>
          )}
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
