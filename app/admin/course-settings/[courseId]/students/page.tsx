import Link from "next/link";
import { Plus, Search, Upload } from "lucide-react";
import { notFound } from "next/navigation";

import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { getAdminCourseRoster } from "@/lib/services/mobile-app";
import { cn } from "@/lib/utils";

export default async function AdminCourseRosterPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const data = await getAdminCourseRoster(courseId);

  if (!data) {
    notFound();
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader
            title={data.title}
            backHref="/admin/course-settings"
            trailing={
              <span className="rounded-full bg-[#E8F0FB] px-2.5 py-1 text-[11px] font-semibold text-[#1E3A5F]">
                {data.badge}
              </span>
            }
          />

          <div className="space-y-3.5 px-5 pt-3">
            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <h1 className="text-base font-bold text-[var(--jp-text)]">{data.courseTitle}</h1>
              <div className="mt-2 rounded-[12px] bg-[#F5F3F0] px-3 py-2">
                <p className="text-xs font-medium text-[var(--jp-text-secondary)]">
                  {data.courseMeta}
                </p>
              </div>
            </section>

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <div className="flex h-10 items-center gap-3 rounded-[12px] bg-[var(--jp-surface-muted)] px-4 text-[13px] text-[var(--jp-text-muted)]">
                <Search className="size-4" />
                <span>{data.searchPlaceholder}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Button
                  className="h-11 rounded-[12px] bg-[#1E3A5F] text-xs font-semibold text-white hover:bg-[#1E3A5F]/90"
                  asChild
                >
                  <Link className="inline-flex items-center justify-center gap-2" href={data.addHref}>
                    <Plus className="size-4" />
                    新增学生
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-11 rounded-[12px] border-[#E8E5E0] bg-white text-xs font-semibold text-[var(--jp-text)] hover:bg-white"
                  asChild
                >
                  <Link className="inline-flex items-center justify-center gap-2" href={data.importHref}>
                    <Upload className="size-4" />
                    批量导入
                  </Link>
                </Button>
              </div>
            </section>

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <div className="flex items-center justify-between px-0.5 pb-2.5">
                <h2 className="text-sm font-bold text-[var(--jp-text)]">学生名单</h2>
                <span className="rounded-full bg-[var(--jp-surface-muted)] px-2.5 py-1 text-[10px] font-semibold text-[var(--jp-text-secondary)]">
                  共 {data.students.length} 人
                </span>
              </div>

              <div className="space-y-2">
                {data.students.map((student) => (
                  <article
                    key={student.id}
                    className={cn(
                      "flex items-center justify-between rounded-[14px] p-3 shadow-[0_8px_18px_rgba(28,28,28,0.03)]",
                      student.highlighted
                        ? "border border-[#E8E5E0] bg-[#F5F3F0]"
                        : "border border-[#E8E5E0] bg-white",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-[var(--jp-text)]">
                        {student.name}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold text-[var(--jp-text-secondary)]">
                        {student.studentCode} · {student.homeroomClass}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="h-auto rounded-full border-[#D4E1EF] bg-white px-2.5 py-1 text-[10px] font-bold text-[#1E3A5F] hover:bg-white"
                      asChild
                    >
                      <Link href={student.editHref}>编辑学生</Link>
                    </Button>
                  </article>
                ))}
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
