import { CalendarDays, ClipboardCheck, ChevronLeft } from "lucide-react";

import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { StaticLink } from "@/components/app/static-link";
import { Button } from "@/components/ui/button";

export default function TeacherAttendanceNoClassPage() {
  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll px-5 pt-4">
          <Button
            asChild
            variant="outline"
            className="h-9 rounded-full border-[color:var(--jp-border)] bg-white px-3 text-[13px] font-medium text-[var(--jp-text)] hover:bg-white"
          >
            <StaticLink href="/teacher/home" className="inline-flex items-center gap-1.5">
              <ChevronLeft className="size-4" />
              返回主页
            </StaticLink>
          </Button>

          <section className="mt-2.5 overflow-hidden rounded-[16px] border border-[#E8E5E0] bg-white shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#F1ECE6] px-3.5 py-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-[var(--jp-surface-muted)] text-[var(--jp-text-muted)]">
                  <ClipboardCheck className="size-4.5" />
                </div>
                <h1 className="text-[15px] font-semibold text-[var(--jp-text)]">今日点名</h1>
              </div>
              <span className="rounded-full bg-[var(--jp-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--jp-text-secondary)] ring-1 ring-[color:var(--jp-border)]">
                无课时段
              </span>
            </div>

            <div className="px-4 py-6 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[var(--jp-surface-muted)] text-[var(--jp-text-muted)]">
                <CalendarDays className="size-6" />
              </div>
              <h2 className="mt-4 text-[15px] font-semibold text-[var(--jp-text)]">
                当前没有可执行的点名任务
              </h2>
              <p className="mx-auto mt-2.5 max-w-[260px] text-[13px] leading-6 text-[var(--jp-text-secondary)]">
                现在不在点名时间窗口，或者今天没有排课。你可以先返回主页查看课程安排。
              </p>
            </div>
          </section>
        </div>

        <MobileTabBar
          active="attendance"
          items={[
            { key: "home", href: "/teacher/home" },
            { key: "attendance", href: "/teacher/attendance" },
            { key: "profile", href: "/teacher/me" },
          ]}
        />
      </div>
    </PageShell>
  );
}
