import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";

import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { getAdminCourseSettingsData } from "@/lib/services/mobile-app";
import { cn } from "@/lib/utils";

export default async function AdminCourseSettingsPage() {
  const data = await getAdminCourseSettingsData();

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <header className="flex items-center bg-white px-5 py-4">
            <Link
              href="/admin/home"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--jp-text)]"
            >
              <span className="flex size-8 items-center justify-center rounded-[8px] bg-[#F5F3F0]">
                <ChevronLeft className="size-4" />
              </span>
              <span>返回首页</span>
            </Link>
          </header>

          <div className="space-y-3 px-5 pt-3">
            <section className="rounded-[14px] border border-[#E8E5E0] bg-white p-3.5">
              <h1 className="text-base font-semibold text-[var(--jp-text)]">
                {data.ruleTitle}
              </h1>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {data.modes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    className={cn(
                      "rounded-[12px] px-3 py-3 text-left text-[13px] font-medium",
                      mode.active
                        ? "bg-[#1E3A5F] text-white"
                        : "border border-[#E8E5E0] bg-[#F5F3F0] text-[var(--jp-text)]",
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </section>

            <div className="flex h-[42px] items-center gap-2 rounded-[10px] bg-[#F5F3F0] px-3.5 text-xs text-[var(--jp-text-muted)]">
              <Search className="size-4" />
              <span>{data.searchPlaceholder}</span>
            </div>

            <section className="rounded-[14px] border border-[#E8E5E0] bg-white p-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--jp-text)]">
                  {data.sectionTitle}
                </h2>
                <button
                  type="button"
                  className="rounded-[10px] bg-[#1E3A5F] px-3 py-2 text-[11px] font-semibold text-white"
                >
                  {data.temporaryActionLabel}
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {data.courses.map((course) => (
                  <article
                    key={course.id}
                    className="rounded-[12px] bg-[#F5F3F0] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          course.badgeTone === "temporary"
                            ? "text-[var(--jp-accent)]"
                            : "text-[var(--jp-text)]",
                        )}
                      >
                        {course.title}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          course.badgeTone === "temporary"
                            ? "bg-white text-[var(--jp-accent)]"
                            : "bg-[#EEF4FA] text-[#1E3A5F]",
                        )}
                      >
                        {course.badgeLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[var(--jp-text-secondary)]">
                      {course.meta}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="h-[34px] rounded-[10px] border-[#E8E5E0] bg-white text-[11px] font-semibold text-[var(--jp-text-secondary)] hover:bg-white"
                        asChild
                      >
                        <Link href={course.rosterHref}>进入学生名单</Link>
                      </Button>
                      <Button
                        className={cn(
                          "h-[34px] rounded-[10px] text-[11px] font-semibold",
                          course.secondaryActionTone === "accent"
                            ? "bg-[var(--jp-accent)] text-white hover:bg-[var(--jp-accent)]/90"
                            : "border border-[#E8E5E0] bg-white text-[var(--jp-text-secondary)] hover:bg-white",
                        )}
                      >
                        {course.secondaryActionLabel}
                      </Button>
                    </div>
                  </article>
                ))}
              </div>

              <Button className="mt-3 h-10 w-full rounded-[10px] bg-[#1E3A5F] text-xs font-semibold text-white hover:bg-[#1E3A5F]/90">
                {data.saveLabel}
              </Button>
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
