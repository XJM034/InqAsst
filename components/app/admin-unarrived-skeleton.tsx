"use client";

import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { buildAdminTabItems, normalizeAdminCampus } from "@/lib/admin-campus";

type AdminUnarrivedSkeletonProps = {
  campus?: string;
};

export function AdminUnarrivedSkeleton({ campus }: AdminUnarrivedSkeletonProps) {
  const activeCampus = normalizeAdminCampus(campus);

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll px-5 pt-4">
          <section className="rounded-[20px] border border-[#E8E2D8] bg-[linear-gradient(180deg,#FFFCF8_0%,#FFFFFF_34%,#FFFFFF_100%)] p-4 shadow-[0_14px_28px_rgba(28,28,28,0.05)]">
            <div className="min-w-0">
              <div className="h-3 w-20 animate-pulse rounded bg-[#E8DED0]" />
              <div className="mt-3 h-7 w-[min(100%,260px)] animate-pulse rounded bg-[#EEE8E0]" />
              <div className="mt-2 h-3.5 w-[min(100%,240px)] animate-pulse rounded bg-[#F1ECE5]" />
              <div className="mt-2 flex gap-2">
                <div className="h-3.5 w-16 animate-pulse rounded bg-[#F1ECE5]" />
                <div className="h-3.5 w-20 animate-pulse rounded bg-[#F1ECE5]" />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: 2 }, (_, index) => (
                <div
                  key={`chip-${index}`}
                  className={
                    index === 0
                      ? "h-8 w-[74px] animate-pulse rounded-full bg-[#EAF2EC]"
                      : "h-8 w-[74px] animate-pulse rounded-full bg-[#F5F3F0]"
                  }
                />
              ))}
            </div>
          </section>

          <section className="mt-3.5 rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 2 }, (_, index) => (
	                <div
	                  key={`action-${index}`}
	                  className="flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-[12px] bg-[#F5F3F0] px-3"
	                >
                  <div className="size-4 animate-pulse rounded bg-[#E4DFD8]" />
                  <div className="h-3.5 w-20 animate-pulse rounded bg-[#E4DFD8]" />
                </div>
              ))}
            </div>

            <div className="mt-3 border-b border-[color:var(--jp-border)]">
              <div className="grid grid-cols-2">
                {Array.from({ length: 2 }, (_, index) => (
                  <div
                    key={`tab-${index}`}
                    className="flex min-h-12 items-center justify-center px-3 py-3"
                  >
                    <div className="h-4 w-20 animate-pulse rounded bg-[#EEE8E0]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 h-10 animate-pulse rounded-[12px] bg-[#F5F3F0]" />
          </section>

          <div className="mt-3.5 space-y-4">
            {Array.from({ length: 2 }, (_, groupIndex) => (
              <section
                key={`group-${groupIndex}`}
                className="rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]"
              >
                <div className="flex items-center justify-between gap-3 rounded-[12px] px-1 py-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="size-4 animate-pulse rounded bg-[#EEE8E0]" />
                      <div className="h-4 w-28 animate-pulse rounded bg-[#EEE8E0]" />
                    </div>
                    <div className="ml-6 mt-2 h-3 w-32 animate-pulse rounded bg-[#F3EEE8]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-14 animate-pulse rounded-full bg-[#F3EEE8]" />
                    <div className="size-8 animate-pulse rounded-[8px] bg-[#F5F3F0]" />
                  </div>
                </div>

                {groupIndex === 0 ? (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {Array.from({ length: 3 }, (_, cardIndex) => (
                      <div
                        key={`student-${cardIndex}`}
                        className="rounded-[14px] border border-[#E8E5E0] bg-white p-2.5 shadow-[0_8px_18px_rgba(28,28,28,0.03)]"
                      >
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-12 animate-pulse rounded bg-[#EEE8E0]" />
                          <div className="h-6 animate-pulse rounded bg-[#F3EEE8]" />
                        </div>
                        <div className="mt-4 h-9 animate-pulse rounded-[8px] bg-[#F5F3F0]" />
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        </div>

        <MobileTabBar active="attendance" items={buildAdminTabItems(activeCampus)} />
      </div>
    </PageShell>
  );
}
