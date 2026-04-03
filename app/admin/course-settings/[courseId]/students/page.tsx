import Link from "next/link";
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
              <div className="space-y-2">
                <div className="flex h-10 items-center rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-xs text-[var(--jp-text-muted)] shadow-[0_8px_18px_rgba(28,28,28,0.03)]">
                  {data.searchPlaceholder}
                </div>
                <div className="flex gap-2">
                  <Button
                    className="h-9 flex-1 rounded-[10px] bg-[#1E3A5F] text-xs font-bold text-white hover:bg-[#1E3A5F]/90"
                    asChild
                  >
                    <Link href={data.addHref}>新增学生</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 w-[114px] rounded-[10px] border-[#E8E5E0] bg-white text-xs font-semibold text-[var(--jp-text)] hover:bg-white"
                    asChild
                  >
                    <Link href={data.importHref}>批量导入</Link>
                  </Button>
                </div>
              </div>
            </section>

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <div className="flex items-center justify-between px-0.5 pb-2">
                <h2 className="text-sm font-bold text-[var(--jp-text)]">学生名单</h2>
                <span className="text-[10px] font-semibold text-[var(--jp-text-secondary)]">
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
