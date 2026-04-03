import Link from "next/link";
import { Check, ChevronLeft, Search } from "lucide-react";
import { notFound } from "next/navigation";

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
          <div className="bg-white px-5 py-4">
            <Link
              href={`/admin/emergency/course/${courseId}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--jp-text)]"
            >
              <span className="flex size-8 items-center justify-center rounded-[8px] bg-[#F5F3F0]">
                <ChevronLeft className="size-4" />
              </span>
              <span>更换点名老师</span>
            </Link>
          </div>

          <div className="space-y-3 px-5 pt-3">
            <section className="rounded-[14px] border border-[#E8E5E0] bg-white p-3.5">
              <h1 className="text-base font-bold text-[var(--jp-text)]">{data.courseTitle}</h1>
              <p className="mt-2 text-xs text-[var(--jp-text-secondary)]">{data.courseMeta}</p>
            </section>

            <section className="rounded-[14px] border border-[#D4E1EF] bg-[#EEF4FA] p-3.5">
              <p className="text-sm font-bold text-[#1E3A5F]">{data.defaultTeacherLabel}</p>
            </section>

            <div className="flex h-[42px] items-center gap-2 rounded-[14px] border border-[#E8E5E0] bg-white px-3.5 text-xs text-[var(--jp-text-muted)]">
              <Search className="size-4" />
              <span>搜索老师姓名 / 手机号</span>
            </div>

            <section className="rounded-[14px] border border-[#E8E5E0] bg-white p-3.5">
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
                    className="flex items-center justify-between rounded-[12px] bg-[#F5F3F0] px-3 py-3"
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
