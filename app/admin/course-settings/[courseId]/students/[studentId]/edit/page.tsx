import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

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
          <header className="flex items-center justify-between bg-white px-5 py-4">
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/course-settings/${courseId}/students`}
                className="flex size-8 items-center justify-center rounded-[8px] bg-[#F5F3F0] text-[var(--jp-text)]"
              >
                <ChevronLeft className="size-4" />
              </Link>
              <span className="text-sm font-semibold text-[var(--jp-text)]">{data.title}</span>
            </div>
            <span className="rounded-full bg-[#E8F0FB] px-2.5 py-1 text-[11px] font-semibold text-[#1E3A5F]">
              {data.badge}
            </span>
          </header>

          <div className="space-y-3 px-5 pt-3">
            <section className="rounded-[14px] border border-[#E8E5E0] bg-white p-3">
              <h1 className="text-base font-bold text-[var(--jp-text)]">{data.nameValue}</h1>
              {data.courseContext ? (
                <p className="mt-2 text-xs text-[var(--jp-text-secondary)]">{data.courseContext}</p>
              ) : null}
            </section>

            <section className="rounded-[14px] border border-[#E8E5E0] bg-white p-3">
              <h2 className="text-sm font-bold text-[var(--jp-text)]">学生信息</h2>
              <div className="mt-3 space-y-3">
                <Field label="姓名" defaultValue={data.nameValue} />
                <Field label="学生ID" defaultValue={data.studentCodeValue} />
                <Field label="行政班" defaultValue={data.homeroomClassValue} />
              </div>
            </section>

            <Button className="h-10 w-full rounded-[10px] bg-[#1E3A5F] text-xs font-bold text-white hover:bg-[#1E3A5F]/90">
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
        className="h-10 rounded-[10px] border-0 bg-[#F5F3F0] px-3 text-sm text-[var(--jp-text)] shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
