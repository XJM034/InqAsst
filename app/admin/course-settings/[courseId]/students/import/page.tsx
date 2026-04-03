import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { getAdminCourseStudentImport } from "@/lib/services/mobile-app";

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
              <h1 className="text-base font-bold text-[var(--jp-text)]">{data.courseTitle}</h1>
            </section>

            <section className="rounded-[14px] border border-[#E8E5E0] bg-white p-3">
              <h2 className="text-sm font-bold text-[var(--jp-text)]">支持字段</h2>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {data.fields.map((field) => (
                  <div
                    key={field}
                    className="rounded-[10px] bg-[#F5F3F0] px-2.5 py-2 text-center text-[11px] font-bold text-[var(--jp-text)]"
                  >
                    {field}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[14px] border border-[#E8E5E0] bg-white p-3">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="h-10 w-full rounded-[10px] border-0 bg-[#F5F3F0] text-xs font-bold text-[var(--jp-text)] hover:bg-[#F5F3F0]"
                >
                  {data.downloadLabel}
                </Button>
                <Button className="h-10 w-full rounded-[10px] bg-[#1E3A5F] text-xs font-bold text-white hover:bg-[#1E3A5F]/90">
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
