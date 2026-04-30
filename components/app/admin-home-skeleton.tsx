"use client";

import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { buildAdminTabItems, normalizeAdminCampus } from "@/lib/admin-campus";

type AdminHomeSkeletonProps = {
  campus?: string;
};

export function AdminHomeSkeleton({ campus }: AdminHomeSkeletonProps) {
  const activeCampus = normalizeAdminCampus(campus);

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll px-5 pt-4">
          <div className="space-y-3 pb-4">
            <section className="rounded-[22px] border border-[#E8E2D8] bg-[linear-gradient(180deg,#FFFCF8_0%,#FFFFFF_34%,#FFFFFF_100%)] p-4 shadow-[0_14px_28px_rgba(28,28,28,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-7 w-24 animate-pulse rounded bg-[#EEE8E0]" />
                  <div className="h-4 w-40 animate-pulse rounded bg-[#F3EEE8]" />
                </div>
                <div className="rounded-[16px] border border-[#E6DED2] bg-[#F7F2EA] px-3.5 py-2.5 shadow-[0_8px_18px_rgba(28,28,28,0.04)]">
                  <div className="h-2.5 w-8 animate-pulse rounded bg-white/80" />
                  <div className="mt-1.5 h-4 w-16 animate-pulse rounded bg-white/95" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-3 w-16 animate-pulse rounded bg-[#E8DED0]" />
                <div className="h-px flex-1 bg-[#EEE7DC]" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {Array.from({ length: 2 }, (_, index) => (
                  <div
                    key={`rule-${index}`}
                    className="rounded-[14px] border border-[#ECE6DE] bg-[#FAF7F2] px-3 py-3"
                  >
                    <div className="h-3 w-16 animate-pulse rounded bg-white/80" />
                    <div className="mt-2 h-4 w-20 animate-pulse rounded bg-white/90" />
                  </div>
                ))}
                <div className="col-span-2 rounded-[14px] border border-[#E3E9E2] bg-[#F5F8F2] px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-3 w-16 animate-pulse rounded bg-white/80" />
                    <div className="h-4 w-28 animate-pulse rounded bg-white/90" />
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[20px] border border-[#27476D] bg-[linear-gradient(180deg,#23466B_0%,#1E3A5F_100%)] p-4 shadow-[0_18px_36px_rgba(30,58,95,0.18)]">
              <div className="flex items-center gap-2.5">
                <div className="size-9 animate-pulse rounded-full bg-white/12" />
                <div className="space-y-2">
                  <div className="h-4 w-20 animate-pulse rounded bg-white/20" />
                  <div className="h-3 w-28 animate-pulse rounded bg-white/15" />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-white/15" />
                <div className="h-3 w-11/12 animate-pulse rounded bg-white/15" />
              </div>
              <div className="mt-4 h-11 animate-pulse rounded-[13px] bg-white/90" />
            </section>

            <section className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-[#C8D4E4]" />
                <div className="h-4 w-16 animate-pulse rounded bg-[#EEE8E0]" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {Array.from({ length: 2 }, (_, index) => (
                  <div
                    key={`entry-${index}`}
                    className="flex min-h-[148px] flex-col rounded-[18px] border border-[#E8E5E0] bg-white p-3 shadow-[0_8px_18px_rgba(28,28,28,0.03)]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="size-9 animate-pulse rounded-full bg-[#EEF3F8]" />
                      <div className="h-4 w-4 animate-pulse rounded bg-[#F3EEE8]" />
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="h-4 w-16 animate-pulse rounded bg-[#EEE8E0]" />
                      <div className="h-3 w-full animate-pulse rounded bg-[#F3EEE8]" />
                      <div className="h-3 w-5/6 animate-pulse rounded bg-[#F3EEE8]" />
                    </div>
                    <div className="mt-auto pt-4">
                      <div className="h-6 w-20 animate-pulse rounded-full bg-[#F3EEE8]" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <MobileTabBar active="home" items={buildAdminTabItems(activeCampus)} />
      </div>
    </PageShell>
  );
}
