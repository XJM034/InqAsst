import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { getAdminTimePicker } from "@/lib/services/mobile-app";

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
          <div className="flex items-center justify-between bg-white px-5 py-4">
            <Link
              href={`/admin/time-settings/${settingKey}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--jp-text)]"
            >
              <span className="flex size-8 items-center justify-center rounded-[8px] bg-[#F5F3F0]">
                <ChevronLeft className="size-4" />
              </span>
              <span>{data.title}</span>
            </Link>
            <span className="rounded-full bg-[#FFF1DE] px-3 py-1.5 text-[11px] font-semibold text-[#C46A1A]">
              {data.badge}
            </span>
          </div>

          <div className="space-y-3 px-5 pt-3">
            <section className="rounded-[14px] border border-[#E8E5E0] bg-white p-4">
              <h1 className="text-base font-semibold text-[var(--jp-text)]">{data.contextTitle}</h1>
              <p className="mt-2 text-xs font-medium text-[var(--jp-text-secondary)]">
                {data.contextSubtitle}
              </p>
              <p className="mt-2 text-xs font-semibold text-[#C46A1A]">
                当前时间范围 {data.currentRange}
              </p>
            </section>

            <section className="rounded-[18px] bg-white p-4 shadow-[0_10px_24px_rgba(28,28,28,0.04)]">
              <div className="mx-auto h-1.5 w-10 rounded-full bg-[#E8E5E0]" />
              <h2 className="mt-4 text-base font-bold text-[var(--jp-text)]">设置时间范围</h2>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="flex h-9 items-center justify-center rounded-[10px] bg-[#1E3A5F] text-xs font-semibold text-white">
                  {data.primaryLabel}
                </div>
                <div className="flex h-9 items-center justify-center rounded-[10px] border border-[#E8E5E0] bg-white text-xs font-semibold text-[var(--jp-text-secondary)]">
                  {data.secondaryLabel}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-6 rounded-[14px] bg-[#F5F3F0] px-4 py-4">
                <PickerColumn values={["14", "15", "16"]} activeIndex={1} />
                <span className="text-xl font-bold text-[var(--jp-text)]">:</span>
                <PickerColumn values={["35", "45", "55"]} activeIndex={1} />
              </div>

              <div className="mt-4 flex items-center justify-between rounded-[12px] bg-[#F5F3F0] px-3 py-3">
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
