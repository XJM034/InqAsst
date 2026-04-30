"use client";

import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { buildAdminTabItems, normalizeAdminCampus } from "@/lib/admin-campus";

type AdminControlSkeletonProps = {
  campus?: string;
};

export function AdminControlSkeleton({ campus }: AdminControlSkeletonProps) {
  const activeCampus = normalizeAdminCampus(campus);

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll px-5 pt-4">
          <section className="rounded-[20px] border border-[#E8E2D8] bg-[linear-gradient(180deg,#FFFCF8_0%,#FFFFFF_34%,#FFFFFF_100%)] p-4 shadow-[0_14px_28px_rgba(28,28,28,0.05)]">
            <div className="min-w-0">
              <div className="h-3 w-16 animate-pulse rounded bg-[#E8DED0]" />
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
                      ? "h-8 w-[86px] animate-pulse rounded-full bg-[#EAF2EC]"
                      : "h-8 w-[92px] animate-pulse rounded-full bg-[#FCEBEC]"
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
            <section className="space-y-2.5">
              <div className="flex items-center justify-between gap-3 px-0.5">
                <div className="h-3 w-16 animate-pulse rounded bg-[#EEE8E0]" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-[#F3EEE8]" />
              </div>

              <div className="space-y-3">
                {Array.from({ length: 2 }, (_, index) => (
                  <div
                    key={`priority-card-${index}`}
                    className="rounded-[16px] border border-[#F1D6C0] bg-[#FFF9F3] p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-[min(100%,210px)] animate-pulse rounded bg-[#EFE7DD]" />
                        <div className="h-3 w-24 animate-pulse rounded bg-[#F4ECE2]" />
                      </div>
                      <div className="h-8 w-14 animate-pulse rounded-full bg-[#FFF0E4]" />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="h-3.5 w-20 animate-pulse rounded bg-[#EFE7DD]" />
                      <div className="h-3.5 w-24 animate-pulse rounded bg-[#F4ECE2]" />
                    </div>
                    <div className="mt-2 h-2 animate-pulse rounded-full bg-[#E9E3DA]" />
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="h-3 w-[min(100%,190px)] animate-pulse rounded bg-[#F4ECE2]" />
                      <div className="size-8 animate-pulse rounded-full bg-white/88" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-2.5">
              <div className="flex items-center justify-between gap-3 px-0.5">
                <div className="h-3 w-16 animate-pulse rounded bg-[#EEE8E0]" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-[#F3EEE8]" />
              </div>

              <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
                {Array.from({ length: 2 }, (_, index) => (
                  <div
                    key={`done-card-${index}`}
                    className="rounded-[15px] border border-[#E8E5E0] bg-white p-3 shadow-[0_8px_18px_rgba(28,28,28,0.04)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="h-8 w-24 animate-pulse rounded bg-[#EEE8E0]" />
                      <div className="h-6 w-14 animate-pulse rounded-full bg-[#F3EEE8]" />
                    </div>
                    <div className="mt-2 h-3 w-16 animate-pulse rounded bg-[#F3EEE8]" />
                    <div className="mt-3 h-1.5 animate-pulse rounded-full bg-[#EEE8E0]" />
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <div className="space-y-2">
                        <div className="h-3.5 w-16 animate-pulse rounded bg-[#EEE8E0]" />
                        <div className="h-3 w-20 animate-pulse rounded bg-[#F3EEE8]" />
                      </div>
                      <div className="size-7 animate-pulse rounded-full bg-[#EEE8E0]" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <MobileTabBar active="attendance" items={buildAdminTabItems(activeCampus)} />
      </div>
    </PageShell>
  );
}
