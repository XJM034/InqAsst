import { notFound } from "next/navigation";

import { AdminContextCard } from "@/components/app/admin-context-card";
import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdminCourseStudentForm } from "@/lib/services/mobile-app";

export default async function AdminCourseStudentEditPage({
  params,
}: {
  params: Promise<{ courseId: string; studentId: string }>;
}) {
  const { courseId, studentId } = await params;
  const data = await getAdminCourseStudentForm(courseId, studentId);

  if (!data) {
    notFound();
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader
            title={data.title}
            backHref={`/admin/course-settings/${courseId}/students`}
            trailing={
              <span className="rounded-full bg-[#E8F0FB] px-2.5 py-1 text-[11px] font-semibold text-[#1E3A5F]">
                {data.badge}
              </span>
            }
          />

          <div className="space-y-3.5 px-5 pt-3">
            <AdminContextCard title={data.nameValue} description={data.courseContext} />

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <h2 className="text-sm font-bold text-[var(--jp-text)]">学生信息</h2>
              <div className="mt-3 space-y-3">
                <Field label="姓名" defaultValue={data.nameValue} />
                <Field label="学生ID" defaultValue={data.studentCodeValue} />
                <Field label="行政班" defaultValue={data.homeroomClassValue} />
              </div>
            </section>

            <Button className="h-11 w-full rounded-[12px] bg-[#1E3A5F] text-[13px] font-semibold text-white hover:bg-[#1E3A5F]/90">
              {data.submitLabel}
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

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">{label}</p>
      <Input
        defaultValue={defaultValue}
        className="h-10 rounded-[10px] border border-[#E8E5E0] bg-white px-3 text-sm text-[var(--jp-text)] shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
