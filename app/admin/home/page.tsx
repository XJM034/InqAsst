import Link from "next/link";
import { ChevronRight, Clock3, UserCheck, Users } from "lucide-react";

import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageTitleBlock } from "@/components/app/page-title-block";
import { PageShell } from "@/components/app/page-shell";
import { getAdminHomeData } from "@/lib/services/mobile-app";

export default async function AdminHomePage() {
  const home = await getAdminHomeData();

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll px-5 pt-4">
          <PageTitleBlock title={home.title} />

          <section className="mt-4 rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--jp-text)]">今日生效规则</p>
              <span className="rounded-full bg-[#F5F3F0] px-2.5 py-1 text-[10px] font-semibold text-[var(--jp-text-muted)]">
                {home.ruleDateLabel}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {home.effectiveRules.map((item) => {
                const isCompactRule = item.label === "今日代课";

                return (
                  <div
                    key={item.label}
                    className={`flex min-h-[58px] flex-col rounded-[12px] px-2.5 py-2 ${
                      item.tone === "warning"
                        ? "bg-[#FFF3E8]"
                      : item.tone === "success"
                          ? "bg-[#EEF5EC]"
                          : "bg-[#F5F3F0]"
                    }`}
                  >
                    <p
                      className={`text-[10px] font-semibold ${
                        item.tone === "warning"
                          ? "text-[#C46A1A]"
                          : item.tone === "success"
                            ? "text-[#3D6B4F]"
                            : "text-[var(--jp-text-muted)]"
                      }`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`mt-auto pt-1 font-bold ${
                        isCompactRule
                          ? "text-[11px] leading-[1.15] whitespace-nowrap tracking-[-0.01em]"
                          : "text-[13px] leading-[1.15]"
                      } ${
                        item.tone === "warning"
                          ? "text-[#C46A1A]"
                          : item.tone === "success"
                            ? "text-[#3D6B4F]"
                            : "text-[var(--jp-text)]"
                      }`}
                    >
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-3 rounded-[16px] bg-[#1E3A5F] p-3.5 text-white shadow-[0_14px_28px_rgba(30,58,95,0.18)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-[30px] items-center justify-center rounded-full bg-white/15">
                  <UserCheck className="size-4" />
                </div>
                <div>
                  <p className="text-base font-bold">老师设置</p>
                  <p className="text-[11px] font-medium text-[#D7E3F2]">
                    默认同步与代课管理
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold">
                今日启用
              </span>
            </div>
            <p className="mt-3 text-[11px] font-medium leading-5 text-[#E6EEF8]">
              {home.heroDescription}
            </p>
            <div className="mt-3 flex gap-2">
              <Link
                href={home.heroPrimaryHref}
                className="flex h-9 flex-1 items-center justify-center rounded-[10px] bg-white text-xs font-bold text-[#1E3A5F]"
              >
                进入老师设置
              </Link>
              <Link
                href={home.heroSecondaryHref}
                className="flex h-9 w-[110px] items-center justify-center gap-1 rounded-[10px] border border-white/20 bg-white/8 text-[11px] font-semibold text-white"
              >
                <span>查看课程老师</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>
          </section>

          <section className="mt-3.5">
            <div className="mb-2 flex items-center gap-2">
              <div className="size-2 rounded-full bg-[var(--jp-accent)]" />
              <h2 className="text-sm font-semibold text-[var(--jp-text)]">常用入口</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {home.entryCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="rounded-[16px] border border-[#E8E5E0] bg-[#FCFBF9] p-3 shadow-[0_8px_18px_rgba(28,28,28,0.03)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex size-7 items-center justify-center rounded-full ${
                          card.tone === "success" ? "bg-[#EEF5EC]" : "bg-[#E8F0FB]"
                        }`}
                      >
                        {card.tone === "success" ? (
                          <Users className="size-3.5 text-[#3D6B4F]" />
                        ) : (
                          <Clock3 className="size-3.5 text-[#1E3A5F]" />
                        )}
                      </div>
                      <span className="text-[13px] font-semibold text-[var(--jp-text)]">
                        {card.title}
                      </span>
                    </div>
                    <ChevronRight className="size-4 text-[var(--jp-text-muted)]" />
                  </div>
                  <div
                    className={`mt-2.5 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                      card.tone === "success"
                        ? "bg-[#EEF5EC] text-[#3D6B4F]"
                        : "bg-[#E8F0FB] text-[#1E3A5F]"
                    }`}
                  >
                    {card.badge}
                  </div>
                </Link>
              ))}
            </div>
          </section>
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
