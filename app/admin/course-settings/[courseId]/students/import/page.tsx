import { notFound } from "next/navigation";

import { AdminContextCard } from "@/components/app/admin-context-card";
import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { adminCourseStudentImports } from "@/lib/mocks/mobile-data";
import { getAdminCourseStudentImport } from "@/lib/services/mobile-app";

export function generateStaticParams() {
  return Object.keys(adminCourseStudentImports).map((courseId) => ({ courseId }));
}

export default async function AdminCourseStudentImportPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const data = await getAdminCourseStudentImport(courseId);

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
            <AdminContextCard title={data.courseTitle} />

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-4 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <h2 className="text-[15px] font-semibold text-[var(--jp-text)]">支持字段</h2>
              <div className="mt-3.5 grid grid-cols-3 gap-2">
                {data.fields.map((field) => (
                  <div
                    key={field}
                    className="rounded-[12px] border border-[#E8E5E0] bg-[#F5F3F0] px-2.5 py-2.5 text-center text-[11px] font-bold text-[var(--jp-text)]"
                  >
                    {field}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-4 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-[12px] border border-[#E8E5E0] bg-white text-[13px] font-semibold text-[var(--jp-text-secondary)] hover:bg-white"
                >
                  {data.downloadLabel}
                </Button>
                <Button className="h-11 w-full rounded-[12px] bg-[#1E3A5F] text-[13px] font-semibold text-white hover:bg-[#1E3A5F]/90">
                  {data.uploadLabel}
                </Button>
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
