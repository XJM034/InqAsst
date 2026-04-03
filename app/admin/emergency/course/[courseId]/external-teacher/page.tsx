import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdminExternalTeacherForm } from "@/lib/services/mobile-app";

export default async function AdminExternalTeacherPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const data = await getAdminExternalTeacherForm(courseId);

  if (!data) {
    notFound();
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader
            title="录入系统外老师"
            backHref={`/admin/emergency/course/${courseId}/select-teacher`}
          />

          <div className="space-y-3 px-5 pt-3">
            <section className="rounded-[14px] border border-[#E8E5E0] bg-white p-3.5">
              <h1 className="text-base font-bold text-[var(--jp-text)]">{data.courseTitle}</h1>
              <p className="mt-2 text-xs text-[var(--jp-text-secondary)]">{data.courseMeta}</p>
            </section>

            <section className="rounded-[14px] border border-[#E8E5E0] bg-white p-3.5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--jp-text-secondary)]">
                    老师姓名
                  </label>
                  <Input
                    placeholder="请输入代课老师姓名"
                    className="h-11 rounded-[12px] border-[#E8E5E0] bg-[#F5F3F0] shadow-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--jp-text-secondary)]">
                    手机号
                  </label>
                  <Input
                    placeholder="请输入手机号"
                    className="h-11 rounded-[12px] border-[#E8E5E0] bg-[#F5F3F0] shadow-none"
                  />
                </div>
              </div>
            </section>

            <Button
              className="h-11 w-full rounded-[12px] bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90"
              asChild
            >
              <Link href={`/admin/emergency/course/${courseId}`}>保存代课老师</Link>
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
