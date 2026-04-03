import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";

import { AdminContextCard } from "@/components/app/admin-context-card";
import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { getAdminTimeSettingDetail } from "@/lib/services/mobile-app";

export default async function AdminTimeSettingDetailPage({
  params,
}: {
  params: Promise<{ settingKey: string }>;
}) {
  const { settingKey } = await params;
  const detail = await getAdminTimeSettingDetail(settingKey);

  if (!detail) {
    notFound();
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader title={detail.title} backHref="/admin/time-settings" />

          <div className="space-y-3.5 px-5 pt-3">
            <AdminContextCard
              title={detail.title}
              description={detail.subtitle}
              detail={detail.helperText}
            />

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-4 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <h2 className="text-[15px] font-semibold text-[var(--jp-text)]">
                {detail.title === "设置点名时间" ? "点名时间范围" : "实际上课时间范围"}
              </h2>
              <Link
                href={detail.pickerHref}
                className="mt-3 flex items-center justify-between rounded-[12px] border border-[#E8E5E0] bg-[#F5F3F0] px-3.5 py-3"
              >
                <span className="text-[13px] font-medium text-[var(--jp-text-secondary)]">
                  时间范围
                </span>
                <span className="flex items-center gap-1.5 text-[17px] font-semibold text-[var(--jp-text)]">
                  {detail.currentRange}
                  <ChevronRight className="size-4 text-[var(--jp-text-muted)]" />
                </span>
              </Link>
              <p className="mt-3 text-xs text-[var(--jp-text-secondary)]">{detail.helperText}</p>
            </section>

            <section className="rounded-[16px] border border-[#F0E1BD] bg-[#FFF6EC] p-3.5 shadow-[0_8px_18px_rgba(196,106,26,0.08)]">
              <p className="text-xs font-semibold text-[#C46A1A]">
                {detail.defaultLogicText}
              </p>
            </section>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-11 rounded-[12px] border border-[#E8E5E0] bg-white text-[13px] font-semibold text-[var(--jp-text-secondary)] hover:bg-white"
              >
                {detail.resetLabel}
              </Button>
              <Button className="h-11 rounded-[12px] bg-[#1E3A5F] text-[13px] font-semibold text-white hover:bg-[#1E3A5F]/90">
                {detail.saveLabel}
              </Button>
            </div>
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
