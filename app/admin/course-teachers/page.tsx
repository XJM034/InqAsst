import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";

import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { getAdminCourseTeachersData } from "@/lib/services/mobile-app";
import { cn } from "@/lib/utils";

export default async function AdminCourseTeachersPage() {
  const data = await getAdminCourseTeachersData();

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <div className="bg-white px-5 py-4">
            <Link
              href="/admin/home"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--jp-text)]"
            >
              <span className="flex size-8 items-center justify-center rounded-[8px] bg-[#F5F3F0]">
                <ChevronLeft className="size-4" />
              </span>
              <span>{data.title}</span>
            </Link>
          </div>

          <div className="space-y-3 px-5 pt-3">
            <div className="flex h-[42px] items-center gap-2 rounded-[14px] border border-[#E8E5E0] bg-white px-3.5 text-xs text-[var(--jp-text-muted)]">
              <Search className="size-4" />
              <span>{data.searchPlaceholder}</span>
            </div>

            <section className="rounded-[14px] border border-[#E8E5E0] bg-white p-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-[var(--jp-text)]">系统老师列表</h2>
              </div>

              <div className="mt-3 space-y-2.5">
                {data.teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className={cn(
                      "rounded-[12px] px-3 py-3",
                      teacher.tone === "substitute"
                        ? "border border-[#E59A52] bg-[#FFFDF8]"
                        : "bg-[#F5F3F0]",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-bold text-[var(--jp-text)]">
                        {teacher.label}
                      </p>
                      {teacher.tone === "substitute" ? (
                        <span className="rounded-[6px] bg-[#FFF4EA] px-2 py-0.5 text-[10px] font-semibold text-[#9A5A1F]">
                          代课老师
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[11px] text-[var(--jp-text-secondary)]">
                      {teacher.note}
                    </p>
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
