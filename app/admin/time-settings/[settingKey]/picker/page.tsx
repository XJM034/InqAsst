import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { adminTimePickerData } from "@/lib/mocks/mobile-data";
import { getAdminTimePicker } from "@/lib/services/mobile-app";

export function generateStaticParams() {
  return Object.keys(adminTimePickerData).map((settingKey) => ({ settingKey }));
}

export default async function AdminTimePickerPage({
  params,
}: {
  params: Promise<{ settingKey: string }>;
}) {
  const { settingKey } = await params;
  const data = await getAdminTimePicker(settingKey);

  if (!data) {
    notFound();
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader
            title={data.title}
            backHref={`/admin/time-settings/${settingKey}`}
            trailing={
              <span className="rounded-full bg-[#FFF1DE] px-3 py-1.5 text-[11px] font-semibold text-[#C46A1A]">
                {data.badge}
              </span>
            }
          />

          <div className="space-y-3.5 px-5 pt-3">
            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-4 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <h1 className="text-base font-semibold text-[var(--jp-text)]">{data.contextTitle}</h1>
              <p className="mt-2 text-xs font-medium text-[var(--jp-text-secondary)]">
                {data.contextSubtitle}
              </p>
              <p className="mt-2 text-xs font-semibold text-[#C46A1A]">
                当前时间范围 {data.currentRange}
              </p>
            </section>

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-4 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <h2 className="text-base font-bold text-[var(--jp-text)]">设置时间范围</h2>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="flex h-9 items-center justify-center rounded-[10px] bg-[#1E3A5F] text-xs font-semibold text-white">
                  {data.primaryLabel}
                </div>
                <div className="flex h-9 items-center justify-center rounded-[10px] border border-[#E8E5E0] bg-white text-xs font-semibold text-[var(--jp-text-secondary)]">
                  {data.secondaryLabel}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-6 rounded-[14px] border border-[#E8E5E0] bg-[#F5F3F0] px-4 py-4">
                <PickerColumn values={["14", "15", "16"]} activeIndex={1} />
                <span className="text-xl font-bold text-[var(--jp-text)]">:</span>
                <PickerColumn values={["35", "45", "55"]} activeIndex={1} />
              </div>

              <div className="mt-4 flex items-center justify-between rounded-[12px] border border-[#E8E5E0] bg-white px-3 py-3">
                <span className="text-xs font-medium text-[var(--jp-text-secondary)]">
                  当前范围
                </span>
                <span className="text-base font-bold text-[var(--jp-text)]">
                  {data.currentRange}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link
                  href={`/admin/time-settings/${settingKey}`}
                  className="flex h-10 items-center justify-center rounded-[10px] border border-[#E8E5E0] bg-white text-xs font-semibold text-[var(--jp-text-secondary)]"
                >
                  取消
                </Link>
                <Link
                  href={`/admin/time-settings/${settingKey}`}
                  className="flex h-10 items-center justify-center rounded-[10px] bg-[#1E3A5F] text-xs font-semibold text-white"
                >
                  {data.confirmLabel}
                </Link>
              </div>
            </section>
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

function PickerColumn({
  values,
  activeIndex,
}: {
  values: string[];
  activeIndex: number;
}) {
  return (
    <div className="space-y-1 text-center">
      {values.map((value, index) => (
        <p
          key={value}
          className={
            index === activeIndex
              ? "text-2xl font-bold text-[var(--jp-text)]"
              : "text-sm font-medium text-[#B8B8B8]"
          }
        >
          {value}
        </p>
      ))}
    </div>
  );
}
