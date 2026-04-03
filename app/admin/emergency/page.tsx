import Link from "next/link";
import { ChevronRight, Search, UserCheck } from "lucide-react";

import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { getAdminEmergencyData } from "@/lib/services/mobile-app";

export default async function AdminEmergencyPage() {
  const data = await getAdminEmergencyData();

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader title="老师设置" backHref="/admin/home" />

          <section className="mx-5 mt-2.5 rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
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

            <div className="mt-3 flex h-[42px] items-center gap-2 rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-xs text-[var(--jp-text-muted)] shadow-[0_8px_18px_rgba(28,28,28,0.03)]">
              <Search className="size-4" />
              <span>搜索课程名 / 默认负责老师</span>
            </div>
          </section>

          <section className="mx-5 mt-3 rounded-[16px] border border-[#F2DEC2] bg-[#FFF7EA] p-3 shadow-[0_10px_22px_rgba(196,106,26,0.08)]">
            <div className="space-y-1">
              <h1 className="text-base font-bold text-[var(--jp-text)]">
                {data.featuredDateLabel}
              </h1>
            </div>
            <Link
              href={data.featuredCourse.href}
              className="mt-3 flex items-center justify-between rounded-[14px] border border-[#F2DEC2] bg-white p-3 shadow-[0_8px_18px_rgba(28,28,28,0.03)]"
            >
              <div className="flex min-w-0 items-start gap-2.5">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FFF3E0] text-[#A55B14]">
                  <UserCheck className="size-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--jp-text)]">
                    {data.featuredCourse.title}
                  </p>
                  <p className="text-xs text-[var(--jp-text-secondary)]">
                    {data.featuredCourse.meta}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-[#1E3A5F]">
                <span>老师设置</span>
                <ChevronRight className="size-3.5" />
              </div>
            </Link>
          </section>

          <section className="mx-5 mt-3 rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
            <h2 className="text-[15px] font-bold text-[var(--jp-text)]">全部课程</h2>
            <div className="mt-3 space-y-3">
              {data.allCourses.map((course) => (
                <Link
                  key={course.id}
                  href={course.href}
                  className="flex items-center justify-between rounded-[14px] border border-[#E8E5E0] bg-white p-3 shadow-[0_8px_18px_rgba(28,28,28,0.03)]"
                >
                  <div className="flex min-w-0 items-start gap-2.5 pr-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#EEF4FA] text-[#1E3A5F]">
                      <UserCheck className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[var(--jp-text)]">
                        {course.title}
                      </p>
                      <p className="text-xs text-[var(--jp-text-secondary)]">
                        {course.meta}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#1E3A5F]">
                    <span>老师设置</span>
                    <ChevronRight className="size-3.5" />
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
