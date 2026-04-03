import { CircleUserRound } from "lucide-react";

import { LogoutConfirmDialog } from "@/components/app/logout-confirm-dialog";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";

type ProfilePageProps = {
  name: string;
  phone: string;
  roleLabel: string;
  tabItems: Array<{
    key: "home" | "attendance" | "profile";
    href: string;
  }>;
};

export function ProfilePage({
  name,
  phone,
  roleLabel,
  tabItems,
}: ProfilePageProps) {
  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll px-7">
          <div className="flex min-h-full flex-col pt-10">
            <section className="flex flex-col items-center gap-4">
              <div className="flex size-20 items-center justify-center rounded-full bg-[var(--jp-surface-muted)] text-[var(--jp-text-muted)]">
                <CircleUserRound className="size-10" />
              </div>
              <div className="space-y-3 text-center">
                <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--jp-text)]">
                  {name}
                </h1>
                <p className="text-[14px] text-[var(--jp-text-secondary)]">{phone}</p>
                <p className="text-[13px] text-[var(--jp-text-muted)]">{roleLabel}</p>
              </div>
            </section>

            <section className="mt-8 flex flex-col items-center gap-8">
              <LogoutConfirmDialog
                triggerClassName="h-12 w-full rounded-[12px] bg-white text-[15px] font-medium text-[#8B4049] shadow-none hover:bg-white"
              />
              <p className="max-w-[220px] text-center text-[12px] leading-5 text-[var(--jp-text-muted)]">
                点击退出后将二次确认
              </p>
            </section>
          </div>
        </div>

        <MobileTabBar active="profile" items={tabItems} />
      </div>
    </PageShell>
  );
}
