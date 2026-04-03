import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { getAdminTeacherSettingCourse } from "@/lib/services/mobile-app";

export default async function AdminTeacherCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getAdminTeacherSettingCourse(courseId);

  if (!course) {
    notFound();
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader title="设置课程老师" backHref="/admin/emergency" />

          <div className="space-y-3 px-5 pt-3">
            <section className="rounded-[14px] border border-[#E8E5E0] bg-white p-3.5">
              <h1 className="text-base font-bold text-[var(--jp-text)]">{course.title}</h1>
              <p className="mt-2 text-xs text-[var(--jp-text-secondary)]">{course.meta}</p>
            </section>

            <section className="rounded-[14px] border border-[#E8E5E0] bg-white p-3">
              <h2 className="text-[15px] font-bold text-[var(--jp-text)]">当前点名老师</h2>
              {course.currentTeacherMode === "temporary" ? (
                <div className="mt-3 flex items-center justify-between rounded-[12px] bg-[#FFF7ED] px-3 py-3">
                  <p className="text-sm font-bold text-[#1E3A5F]">
                    {course.currentTeacherLabel}
                  </p>
                  <button
                    type="button"
                    className="rounded-[10px] border border-[#D4E1EF] bg-white px-3 py-2 text-xs font-semibold text-[#1E3A5F]"
                  >
                    恢复默认老师
                  </button>
                </div>
              ) : (
                <div className="mt-3 rounded-[12px] bg-[#F5F3F0] px-3 py-3">
                  <p className="text-sm font-bold text-[var(--jp-text)]">
                    {course.currentTeacherLabel}
                  </p>
                </div>
              )}
            </section>

            <Button
              className="h-11 w-full rounded-[12px] bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90"
              asChild
            >
              <Link href={`/admin/emergency/course/${course.id}/select-teacher`}>
                更换点名老师
              </Link>
            </Button>
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
