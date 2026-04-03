import Link from "next/link";
import { Check, Search } from "lucide-react";
import { notFound } from "next/navigation";

import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { getAdminTeacherSelection } from "@/lib/services/mobile-app";

export default async function AdminTeacherSelectionPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const data = await getAdminTeacherSelection(courseId);

  if (!data) {
    notFound();
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader
            title="更换点名老师"
            backHref={`/admin/emergency/course/${courseId}`}
          />

          <div className="space-y-3.5 px-5 pt-3">
            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <h1 className="text-base font-bold text-[var(--jp-text)]">{data.courseTitle}</h1>
              <p className="mt-2 text-xs text-[var(--jp-text-secondary)]">{data.courseMeta}</p>
            </section>

            <section className="rounded-[16px] border border-[#D4E1EF] bg-[#EEF4FA] p-3.5 shadow-[0_10px_22px_rgba(30,58,95,0.08)]">
              <p className="text-sm font-bold text-[#1E3A5F]">{data.defaultTeacherLabel}</p>
            </section>

            <div className="flex h-[42px] items-center gap-2 rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-xs text-[var(--jp-text-muted)] shadow-[0_8px_18px_rgba(28,28,28,0.03)]">
              <Search className="size-4" />
              <span>搜索老师姓名 / 手机号</span>
            </div>

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-[var(--jp-text)]">系统老师列表</h2>
                <Link
                  href={`/admin/emergency/course/${courseId}/external-teacher`}
                  className="rounded-full border border-[#D4E1EF] px-3 py-1.5 text-[11px] font-semibold text-[#1E3A5F]"
                >
                  录入系统外老师
                </Link>
              </div>

              <div className="mt-3 space-y-2.5">
                {data.teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className={`flex items-center justify-between rounded-[14px] border px-3 py-3 shadow-[0_8px_18px_rgba(28,28,28,0.03)] ${
                      teacher.selected
                        ? "border-[#D4E1EF] bg-[#EEF4FA]"
                        : "border-[#E8E5E0] bg-white"
                    }`}
                  >
                    <div>
                      <p className="text-[13px] font-bold text-[var(--jp-text)]">
                        {teacher.label}
                      </p>
                      {teacher.note ? (
                        <p className="mt-1 text-[11px] text-[var(--jp-text-secondary)]">
                          {teacher.note}
                        </p>
                      ) : null}
                    </div>
                    <div
                      className={`flex size-5 items-center justify-center rounded-full ${
                        teacher.selected ? "bg-[#1E3A5F]" : "bg-white"
                      }`}
                    >
                      {teacher.selected ? <Check className="size-3 text-white" /> : null}
                    </div>
                  </div>
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
