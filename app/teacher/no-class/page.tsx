import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";

export default function TeacherNoClassPage() {
  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll px-7 pt-6">
          <header className="space-y-1">
            <h1 className="text-[24px] font-medium text-[var(--jp-text)]">老师首页</h1>
            <p className="text-sm text-[var(--jp-text-secondary)]">今天暂无排课</p>
          </header>

          <section className="mt-5 rounded-[16px] bg-[var(--jp-surface)] p-5 text-center shadow-[0_14px_30px_rgba(28,28,28,0.04)] ring-1 ring-[color:var(--jp-border)]">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--jp-surface-muted)] text-[var(--jp-accent)]">
              <CalendarDays className="size-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[var(--jp-text)]">今日无课</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--jp-text-secondary)]">
              当前手机号在今天没有需要点名的课程，后续如有临时代课安排会在这里显示。
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-11 rounded-[12px]" asChild>
                <Link href="/login">返回登录</Link>
              </Button>
              <Button
                className="h-11 rounded-[12px] bg-[var(--jp-accent)] text-[var(--jp-bg)] hover:bg-[var(--jp-accent)]/90"
                asChild
              >
                <Link href="/teacher/home">查看有课态示例</Link>
              </Button>
            </div>
          </section>
        </div>

        <MobileTabBar
          active="home"
          items={[
            { key: "home", href: "/teacher/home" },
            { key: "attendance", href: "/teacher/attendance/demo" },
            { key: "profile", href: "/teacher/me" },
          ]}
        />
      </div>
    </PageShell>
  );
}
