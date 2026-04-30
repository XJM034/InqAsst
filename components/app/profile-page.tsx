"use client";

import { useState } from "react";
import { CircleUserRound, ChevronsUpDown } from "lucide-react";

import { CampusSelectionDialog } from "@/components/app/campus-selection-dialog";
import { LogoutConfirmDialog } from "@/components/app/logout-confirm-dialog";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import type { AdminCampusOption } from "@/lib/domain/types";
import { switchAdminCampus } from "@/lib/services/mobile-client";
import { navigateTo } from "@/lib/static-navigation";

type ProfilePageProps = {
  name: string;
  phone: string;
  roleLabel?: string;
  activeCampusId?: string;
  campusOptions?: AdminCampusOption[];
  tabItems: Array<{
    key: "home" | "attendance" | "profile";
    href: string;
  }>;
};

export function ProfilePage({
  name,
  phone,
  roleLabel,
  activeCampusId,
  campusOptions,
  tabItems,
}: ProfilePageProps) {
  const [feedback, setFeedback] = useState("");
  const [switchingCampusId, setSwitchingCampusId] = useState<string | null>(null);
  const [isCampusDialogOpen, setIsCampusDialogOpen] = useState(false);

  const currentCampus = campusOptions?.find((campus) => campus.id === activeCampusId);
  const availableCampuses = campusOptions?.filter((campus) => campus.id !== activeCampusId) ?? [];
  const switchableCampuses = availableCampuses.filter((campus) => Boolean(campus.adminUserId));

  async function handleSwitchCampus(campus: AdminCampusOption) {
    if (!campus.adminUserId || campus.id === activeCampusId) {
      return;
    }

    setFeedback("");
    setSwitchingCampusId(campus.id);

    try {
      await switchAdminCampus(campus.adminUserId);
      setIsCampusDialogOpen(false);
      navigateTo("/admin/home");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "校区切换失败，请稍后重试");
    } finally {
      setSwitchingCampusId(null);
    }
  }

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
                {roleLabel ? (
                  <p className="text-[13px] text-[var(--jp-text-muted)]">{roleLabel}</p>
                ) : null}
              </div>
            </section>

            {campusOptions && activeCampusId ? (
              <section className="mt-8 rounded-[18px] border border-[#E8E5E0] bg-white p-4 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
                <div className="flex items-start gap-3 max-[360px]:flex-col">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-[var(--jp-text)]">当前校区</p>
                    <p className="mt-1 text-[11px] leading-5 text-[var(--jp-text-muted)]">
                      切换后会重新获取对应校区 token，并同步刷新首页和点名数据。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedback("");
                      setIsCampusDialogOpen(true);
                    }}
                    disabled={availableCampuses.length === 0 || Boolean(switchingCampusId)}
                    className="inline-flex h-10 shrink-0 items-center gap-1.5 self-start whitespace-nowrap rounded-full border border-[#D8D2C8] bg-[#F7F4EF] px-4 text-[12px] font-semibold text-[#1E3A5F] shadow-sm transition-colors hover:border-[#1E3A5F] hover:bg-[#EEF3FA] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ChevronsUpDown className="size-4" />
                    <span>更换校区</span>
                  </button>
                </div>

                <div className="mt-3 rounded-[16px] border border-[#1E3A5F] bg-[#1E3A5F] px-4 py-3 text-left text-white shadow-[0_10px_18px_rgba(30,58,95,0.18)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold">
                        {currentCampus?.label ?? "当前校区"}
                      </p>
                      <p className="mt-1 text-[11px] text-white/72">
                        {availableCampuses.length > 0
                          ? "点击右上角按钮可切换到其他校区"
                          : "当前账号暂无其他可切换校区"}
                      </p>
                    </div>
                    <div className="shrink-0 rounded-full bg-white/14 px-3 py-1 text-[11px] font-semibold text-white">
                      当前校区
                    </div>
                  </div>
                </div>

                {feedback ? (
                  <p className="mt-3 text-[12px] font-medium text-[#D32F2F]">{feedback}</p>
                ) : null}
              </section>
            ) : null}

            <section className="mt-8">
              <LogoutConfirmDialog
                triggerClassName="h-12 w-full rounded-[12px] bg-white text-[15px] font-medium text-[#8B4049] shadow-none hover:bg-white"
              />
            </section>
          </div>
        </div>

        <MobileTabBar active="profile" items={tabItems} />
      </div>

      <CampusSelectionDialog
        open={isCampusDialogOpen}
        title="选择切换校区"
        description="请选择要切换进入的校区，切换后将同步刷新首页和点名相关数据。"
        footerText="切换成功后将直接进入对应校区首页。"
        options={availableCampuses.map((campus) => ({
          id: campus.id,
          title: campus.label,
          subtitle: campus.adminUserId
            ? "切换后同步刷新首页与点名数据"
            : "当前账号暂无该校区的切换权限",
          badgeLabel: campus.adminUserId ? `切换到${campus.shortLabel}` : "暂不可切换",
          disabled: Boolean(switchingCampusId) || !campus.adminUserId,
          loading: switchingCampusId === campus.id,
        }))}
        onSelect={(campusId) => {
          const target = switchableCampuses.find((campus) => campus.id === campusId);

          if (target) {
            void handleSwitchCampus(target);
          }
        }}
        showCloseButton
        onClose={() => {
          if (!switchingCampusId) {
            setIsCampusDialogOpen(false);
          }
        }}
      />
    </PageShell>
  );
}
