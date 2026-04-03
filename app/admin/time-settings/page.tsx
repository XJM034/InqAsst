import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { getAdminTimeSettingsData } from "@/lib/services/mobile-app";

export default async function AdminTimeSettingsPage() {
  const data = await getAdminTimeSettingsData();

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <div className="bg-white px-5 py-4">
            <Link
              href="/admin/home"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--jp-text)]"
            >
              <span className="flex size-8 items-center justify-center rounded-[8px] bg-[#F5F3F0]">
                <ChevronLeft className="size-4" />
              </span>
              <span>时间设置</span>
            </Link>
          </div>

          <div className="space-y-3 px-5 pt-3">
            <section className="rounded-[14px] border border-[#E8E5E0] bg-white p-3.5">
              <div className="flex flex-wrap gap-2">
                {data.days.map((day) => (
                  <div
                    key={day.label}
                    className={`flex h-9 min-w-[60px] items-center justify-center rounded-full border px-4 text-xs font-semibold ${
                      day.active
                        ? "border-transparent bg-[#1E3A5F] text-white"
                        : "border-[#E8E5E0] bg-[#F5F3F0] text-[var(--jp-text)]"
                    }`}
                  >
                    {day.label}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex h-[42px] items-center gap-2 rounded-[10px] bg-[#F5F3F0] px-3.5 text-xs text-[var(--jp-text-muted)]">
                <Search className="size-4" />
                <span>搜索时间规则 / 点名窗口</span>
              </div>
            </section>

            <Link
              href={data.actualHref}
              className="block rounded-[14px] border border-[#E8E5E0] bg-white p-3.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-bold text-[var(--jp-text)]">设置实际上课时间</p>
                  <p className="mt-2 text-xs text-[var(--jp-text-secondary)]">
                    当前：{data.actualClassTime}
                  </p>
                </div>
                <ChevronRight className="size-4 text-[var(--jp-text-muted)]" />
              </div>
            </Link>

            <Link
              href={data.attendanceHref}
              className="block rounded-[14px] border border-[#E8E5E0] bg-white p-3.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-bold text-[var(--jp-text)]">设置点名时间</p>
                  <p className="mt-2 text-xs text-[var(--jp-text-secondary)]">
                    当前：{data.attendanceWindow}
                  </p>
                </div>
                <ChevronRight className="size-4 text-[var(--jp-text-muted)]" />
              </div>
            </Link>
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
