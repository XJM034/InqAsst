"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Clock3, UserCheck, Users } from "lucide-react";

import { buildAdminTabItems, normalizeAdminCampus, withCampusQuery } from "@/lib/admin-campus";
import { AdminHomeSkeleton } from "@/components/app/admin-home-skeleton";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageStatus } from "@/components/app/page-status";
import { PageTitleBlock } from "@/components/app/page-title-block";
import { PageShell } from "@/components/app/page-shell";
import { SearchParamsSuspense } from "@/components/app/search-params-suspense";
import { StaticLink } from "@/components/app/static-link";
import { getAdminHomeData } from "@/lib/services/mobile-app";

const RULE_TONE_STYLES = {
  neutral: {
    sectionBorder: "border-[#ECE6DE]",
    sectionBg: "bg-[#FAF7F2]",
    label: "text-[var(--jp-text-muted)]",
    value: "text-[var(--jp-text)]",
  },
  warning: {
    sectionBorder: "border-[#F2DEC7]",
    sectionBg: "bg-[#FFF4E8]",
    label: "text-[#B96B1E]",
    value: "text-[#A55B14]",
  },
  success: {
    sectionBorder: "border-[#E0E8D9]",
    sectionBg: "bg-[#F3F8F0]",
    label: "text-[#4A755A]",
    value: "text-[#3D6B4F]",
  },
} as const;

export default function AdminHomePage() {
  return (
    <SearchParamsSuspense>
      <AdminHomePageInner />
    </SearchParamsSuspense>
  );
}

function AdminHomePageInner() {
  const searchParams = useSearchParams();
  const campus = searchParams.get("campus") ?? undefined;
  const activeCampus = normalizeAdminCampus(campus);
  const requestKey = activeCampus ?? "__default__";

  const [home, setHome] = useState<Awaited<ReturnType<typeof getAdminHomeData>> | null>(null);
  const [error, setError] = useState("");
  const [resolvedRequestKey, setResolvedRequestKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getAdminHomeData(activeCampus)
      .then((data) => {
        if (!cancelled) {
          setHome(data);
          setError("");
          setResolvedRequestKey(requestKey);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setHome(null);
          setError(err instanceof Error ? err.message : "首页加载失败，请稍后重试");
          setResolvedRequestKey(requestKey);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeCampus, requestKey]);

  const currentHome = resolvedRequestKey === requestKey ? home : null;
  const currentError = resolvedRequestKey === requestKey ? error : "";

  if (!currentHome && !currentError) {
    return <AdminHomeSkeleton campus={activeCampus} />;
  }

  if (!currentHome) {
    return (
      <PageStatus
        title="首页加载失败"
        description={currentError || "当前无法读取管理端首页数据。"}
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll px-5 pt-4">
          <div className="space-y-3 pb-4">
            <section className="rounded-[22px] border border-[#E8E2D8] bg-[linear-gradient(180deg,#FFFCF8_0%,#FFFFFF_34%,#FFFFFF_100%)] p-4 shadow-[0_14px_28px_rgba(28,28,28,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <PageTitleBlock
                    title={currentHome.title}
                    subtitle={currentHome.campusLabel}
                    className="space-y-2"
                  />
                </div>
                <div className="shrink-0 rounded-[16px] border border-[#E6DED2] bg-[#F7F2EA] px-3.5 py-2.5 text-right shadow-[0_8px_18px_rgba(28,28,28,0.04)]">
                  <p className="text-[9px] font-semibold tracking-[0.08em] text-[#8C7961]">今日</p>
                  <p className="mt-1 text-[14px] font-semibold tracking-[-0.01em] text-[#1E3A5F]">
                    {currentHome.ruleDateLabel}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <p className="shrink-0 text-[11px] font-semibold tracking-[0.04em] text-[#8C7961]">
                  今日生效规则
                </p>
                <div className="h-px flex-1 bg-[#EEE7DC]" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {currentHome.effectiveRules.map((item) => {
                  const toneStyles = RULE_TONE_STYLES[item.tone];
                  const isWideRule = item.label === "今日代课";

                  return (
                    <div
                      key={item.label}
                      className={`rounded-[14px] border px-3 py-3 shadow-[0_8px_18px_rgba(28,28,28,0.03)] ${toneStyles.sectionBorder} ${toneStyles.sectionBg} ${
                        isWideRule ? "col-span-2" : ""
                      }`}
                    >
                      {isWideRule ? (
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className={`text-[10px] font-semibold ${toneStyles.label}`}>
                              {item.label}
                            </p>
                            {item.meta ? (
                              <p className="mt-1 text-[10px] leading-4 text-[var(--jp-text-secondary)]">
                                {item.meta}
                              </p>
                            ) : null}
                          </div>
                          <p
                            className={`shrink-0 text-right text-[13px] font-semibold leading-[1.35] tracking-[-0.01em] ${toneStyles.value}`}
                          >
                            {item.value}
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className={`text-[10px] font-semibold ${toneStyles.label}`}>
                            {item.label}
                          </p>
                          <p
                            className={`mt-2 text-[13px] font-semibold leading-[1.35] tracking-[-0.01em] ${toneStyles.value}`}
                          >
                            {item.value}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="overflow-hidden rounded-[20px] border border-[#27476D] bg-[linear-gradient(180deg,#23466B_0%,#1E3A5F_100%)] p-4 text-white shadow-[0_18px_36px_rgba(30,58,95,0.18)]">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-full bg-white/12">
                  <UserCheck className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold">老师设置</p>
                  <p className="mt-1 text-[11px] font-medium text-[#DCE8F6]">
                    现场点名老师与代课调整入口
                  </p>
                </div>
              </div>
              <p className="mt-3 max-w-[30ch] text-[12px] leading-[1.7] text-[#EAF2FC]">
                {currentHome.heroDescription}
              </p>
              <StaticLink
                href={withCampusQuery(currentHome.heroPrimaryHref, activeCampus)}
                className="group mt-4 flex h-11 items-center justify-center gap-1.5 rounded-[13px] bg-white text-[12px] font-bold text-[#1E3A5F] shadow-[0_10px_18px_rgba(14,28,45,0.14)] transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-[1px] hover:bg-[#FBF8F3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:translate-y-0"
              >
                <span>进入老师设置</span>
                <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5" />
              </StaticLink>
            </section>

            <section className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-[var(--jp-accent)]" />
                <h2 className="text-[13px] font-semibold text-[var(--jp-text)]">常用入口</h2>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {currentHome.entryCards.map((card) => (
                  <StaticLink
                    key={card.title}
                    href={withCampusQuery(card.href, activeCampus)}
                    className="group flex min-h-[148px] flex-col rounded-[18px] border border-[#E8E5E0] bg-white p-3 shadow-[0_8px_18px_rgba(28,28,28,0.03)] transition-[transform,border-color,box-shadow,background-color] duration-200 hover:-translate-y-[1px] hover:border-[#D8D2C8] hover:bg-[#FCFBF8] hover:shadow-[0_12px_22px_rgba(28,28,28,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jp-accent)]/20 active:translate-y-0"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex size-9 items-center justify-center rounded-full ${
                          card.iconTone === "success" ? "bg-[#EEF5EC]" : "bg-[#E8F0FB]"
                        }`}
                      >
                        {card.icon === "users" ? (
                          <Users className="size-4 text-[#3D6B4F]" />
                        ) : (
                          <Clock3 className="size-4 text-[#1E3A5F]" />
                        )}
                      </div>
                      <ChevronRight className="size-4 text-[var(--jp-text-muted)] transition-transform duration-200 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5" />
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <p className="text-[13px] font-semibold text-[var(--jp-text)]">
                        {card.title}
                      </p>
                      <p className="line-clamp-2 text-[11px] leading-5 text-[var(--jp-text-secondary)]">
                        {card.description}
                      </p>
                    </div>

                    <div className="mt-auto pt-4">
                      <div
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                          card.badgeTone === "success"
                            ? "border-[#D8E8D7] bg-[#EEF5EC] text-[#3D6B4F]"
                            : card.badgeTone === "neutral"
                              ? "border-[#E8E5E0] bg-[#F5F3F0] text-[var(--jp-text-muted)]"
                              : "border-[#D7E4F5] bg-[#E8F0FB] text-[#1E3A5F]"
                        }`}
                      >
                        {card.badge}
                      </div>
                    </div>
                  </StaticLink>
                ))}
              </div>
            </section>
          </div>
        </div>

        <MobileTabBar active="home" items={buildAdminTabItems(activeCampus)} />
      </div>
    </PageShell>
  );
}
