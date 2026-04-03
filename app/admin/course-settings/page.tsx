import Link from "next/link";
import { Search, UserCheck } from "lucide-react";

import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
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
          <AdminSubpageHeader title="课程设置" backHref="/admin/home" />

          <div className="space-y-2.5 px-5 pt-2.5">
            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <p className="text-sm font-semibold text-[var(--jp-text)]">{data.ruleTitle}</p>
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

              <div className="mt-3 flex h-[42px] items-center gap-2 rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-xs text-[var(--jp-text-muted)] shadow-[0_8px_18px_rgba(28,28,28,0.03)]">
                <Search className="size-4" />
                <span>{data.searchPlaceholder}</span>
              </div>
            </section>

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
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

              <div className="mt-3 space-y-3">
                {data.courses.map((course) => (
                  <article
                    key={course.id}
                    className={cn(
                      "rounded-[14px] border bg-white p-3 shadow-[0_8px_18px_rgba(28,28,28,0.03)]",
                      course.badgeTone === "temporary"
                        ? "border-[#F2DEC2]"
                        : "border-[#E8E5E0]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-2.5 pr-2">
                        <div
                          className={cn(
                            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                            course.badgeTone === "temporary"
                              ? "bg-[#FFF3E0] text-[#A55B14]"
                              : "bg-[#EEF4FA] text-[#1E3A5F]",
                          )}
                        >
                          <UserCheck className="size-4" />
                        </div>
                        <div className="min-w-0 space-y-1">
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
                          <p className="text-xs text-[var(--jp-text-secondary)]">
                            {course.meta}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          course.badgeTone === "temporary"
                            ? "bg-[#FFF4EA] text-[var(--jp-accent)]"
                            : "bg-[#EEF4FA] text-[#1E3A5F]",
                        )}
                      >
                        {course.badgeLabel}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="h-8 rounded-[10px] border-[#E8E5E0] bg-white text-[11px] font-semibold text-[var(--jp-text-secondary)] hover:bg-white"
                        asChild
                      >
                        <Link href={course.rosterHref}>进入学生名单</Link>
                      </Button>
                      <Button
                        className={cn(
                          "h-8 rounded-[10px] text-[11px] font-semibold",
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
