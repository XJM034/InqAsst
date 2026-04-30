"use client";

import { useEffect, useState } from "react";

import { buildAdminSelectTeacherHref } from "@/lib/admin-route-hrefs";
import { buildAdminTabItems, withCampusQuery } from "@/lib/admin-campus";
import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { StaticLink } from "@/components/app/static-link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { clearRollCallTeacher } from "@/lib/services/mobile-client";
import { reloadPage } from "@/lib/static-navigation";

type Props = {
  campus: string;
  courseId: string;
  courseSessionId: string;
  courseTitle: string;
  courseMeta: string;
  currentTeacherLabel: string;
  currentTeacherMode: "temporary" | "default";
  defaultTeacherLabel: string;
  swapRestoreTarget?: {
    courseId?: string;
    courseSessionId?: string;
    courseTitle: string;
    courseMeta?: string;
    currentTeacherLabel?: string;
    defaultTeacherLabel?: string;
  };
  successMessage?: string;
};

const COPY = {
  dialogTitle: "确认恢复默认老师",
  dialogDescription:
    "将 {courseTitle} 的点名老师从「{currentTeacher}」恢复为默认老师「{defaultTeacher}」后，后续点名会按默认老师身份继续进行。",
  dialogCurrent: "当前：{currentTeacher}",
  dialogNext: "恢复后：{defaultTeacher}",
  cancel: "取消",
  confirm: "确认恢复",
  resetting: "恢复中...",
} as const;

function formatCopy(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

export function buildRestoreDefaultTeacherDialogCopy(payload: {
  courseTitle: string;
  currentTeacherLabel: string;
  defaultTeacherLabel: string;
}) {
  return {
    description: formatCopy(COPY.dialogDescription, {
      courseTitle: payload.courseTitle,
      currentTeacher: payload.currentTeacherLabel,
      defaultTeacher: payload.defaultTeacherLabel,
    }),
    current: formatCopy(COPY.dialogCurrent, {
      currentTeacher: payload.currentTeacherLabel,
    }),
    next: formatCopy(COPY.dialogNext, {
      defaultTeacher: payload.defaultTeacherLabel,
    }),
  };
}

function buildSwapRestoreDefaultTeacherDialogCopy(payload: {
  courseTitle: string;
  currentTeacherLabel: string;
  defaultTeacherLabel: string;
  swapRestoreTarget: NonNullable<Props["swapRestoreTarget"]>;
}) {
  return {
    description: `当前课程「${payload.courseTitle}」与课程「${payload.swapRestoreTarget.courseTitle}」处于互换点名老师状态。确认后，会把两节课一起恢复为各自默认老师。`,
    currentCourse: `当前课程：${payload.courseTitle}`,
    currentTeacher: `当前老师：${payload.currentTeacherLabel}`,
    currentNext: `恢复后：${payload.defaultTeacherLabel}`,
    linkedCourse: `联动课程：${payload.swapRestoreTarget.courseTitle}${payload.swapRestoreTarget.courseMeta ? `（${payload.swapRestoreTarget.courseMeta}）` : ""}`,
    linkedTeacher: `联动当前：${payload.swapRestoreTarget.currentTeacherLabel ?? "待分配老师"}`,
    linkedNext: `联动恢复后：${payload.swapRestoreTarget.defaultTeacherLabel ?? "待分配老师"}`,
  };
}

export function TeacherSettingCourseClient({
  campus,
  courseId,
  courseSessionId,
  courseTitle,
  courseMeta,
  currentTeacherLabel,
  currentTeacherMode,
  defaultTeacherLabel,
  swapRestoreTarget,
  successMessage,
}: Props) {
  const [isResetting, setIsResetting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(successMessage ?? "");
  const dialogCopy = buildRestoreDefaultTeacherDialogCopy({
    courseTitle,
    currentTeacherLabel,
    defaultTeacherLabel,
  });
  const swapDialogCopy = swapRestoreTarget
    ? buildSwapRestoreDefaultTeacherDialogCopy({
        courseTitle,
        currentTeacherLabel,
        defaultTeacherLabel,
        swapRestoreTarget,
      })
    : null;

  useEffect(() => {
    setNotice(successMessage ?? "");
  }, [successMessage]);

  useEffect(() => {
    if (!successMessage || typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    if (!url.searchParams.has("notice")) {
      return;
    }

    url.searchParams.delete("notice");
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, "", nextUrl);
  }, [successMessage]);

  function handleOpenResetConfirm() {
    setError("");
    setConfirmOpen(true);
  }

  async function handleConfirmReset() {
    setError("");
    setIsResetting(true);

    try {
      await clearRollCallTeacher(courseSessionId);
      setConfirmOpen(false);
      reloadPage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "恢复失败，请稍后重试");
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader
            title="设置课程老师"
            backHref={withCampusQuery("/admin/emergency", campus)}
          />

          <div className="space-y-3.5 px-5 pt-3">
            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <h1 className="text-base font-bold text-[var(--jp-text)]">{courseTitle}</h1>
              <p className="mt-2 text-xs text-[var(--jp-text-secondary)]">{courseMeta}</p>
            </section>

            {notice ? (
              <section className="rounded-[16px] border border-[#CFE2D5] bg-[#EEF7F1] px-3.5 py-3 shadow-[0_10px_22px_rgba(61,107,79,0.08)]">
                <p className="text-[13px] font-semibold text-[#2F5A3D]">{notice}</p>
              </section>
            ) : null}

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <h2 className="text-[15px] font-bold text-[var(--jp-text)]">当前点名老师</h2>

              {currentTeacherMode === "temporary" ? (
                <div className="mt-3 flex items-center justify-between rounded-[14px] border border-[#F2DEC2] bg-[#FFF7ED] px-3 py-3 shadow-[0_8px_18px_rgba(196,106,26,0.08)]">
                  <p className="text-sm font-bold text-[#1E3A5F]">{currentTeacherLabel}</p>
                  <button
                    type="button"
                    onClick={handleOpenResetConfirm}
                    disabled={isResetting}
                    className="rounded-[10px] border border-[#D4E1EF] bg-white px-3 py-2 text-xs font-semibold text-[#1E3A5F] disabled:opacity-70"
                  >
                    {isResetting ? COPY.resetting : "恢复默认老师"}
                  </button>
                </div>
              ) : (
                <div className="mt-3 rounded-[14px] border border-[#E8E5E0] bg-white px-3 py-3 shadow-[0_8px_18px_rgba(28,28,28,0.03)]">
                  <p className="text-sm font-bold text-[var(--jp-text)]">
                    {`默认：${currentTeacherLabel}`}
                  </p>
                </div>
              )}
            </section>

            {error ? (
              <p className="px-0.5 text-[13px] font-medium text-[#D32F2F]">{error}</p>
            ) : null}

            <Button
              className="h-11 w-full rounded-[12px] bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90"
              asChild
            >
              <StaticLink
                href={withCampusQuery(
                  buildAdminSelectTeacherHref(courseId, {
                    courseSessionId,
                  }),
                  campus,
                )}
              >
                更换点名老师
              </StaticLink>
            </Button>
          </div>
        </div>

        <MobileTabBar active="home" items={buildAdminTabItems(campus)} />
      </div>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!isResetting) {
            setConfirmOpen(open);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-[rgba(15,23,42,0.35)]"
          className="max-w-[320px] gap-4 rounded-[16px] border-0 bg-white p-6 shadow-none ring-0"
        >
          <div className="space-y-2.5">
            <DialogTitle className="text-[18px] font-semibold text-[#1E3A5F]">
              {COPY.dialogTitle}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#666666]">
              {swapDialogCopy?.description ?? dialogCopy.description}
            </DialogDescription>
          </div>

          <div className="rounded-[12px] bg-[#F7F9FC] px-3.5 py-3 text-[12px] leading-6 text-[#526273]">
            {swapDialogCopy ? (
              <>
                {swapDialogCopy.currentCourse}
                <br />
                {swapDialogCopy.currentTeacher}
                <br />
                {swapDialogCopy.currentNext}
                <br />
                {swapDialogCopy.linkedCourse}
                <br />
                {swapDialogCopy.linkedTeacher}
                <br />
                {swapDialogCopy.linkedNext}
              </>
            ) : (
              <>
                {dialogCopy.current}
                <br />
                {dialogCopy.next}
              </>
            )}
          </div>

          {error ? <p className="text-[13px] font-medium text-[#D32F2F]">{error}</p> : null}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              disabled={isResetting}
              onClick={() => setConfirmOpen(false)}
              className="h-11 rounded-[8px] border-0 bg-[#F5F5F5] text-[15px] font-medium text-[var(--jp-text)] hover:bg-[#F5F5F5]"
            >
              {COPY.cancel}
            </Button>
            <Button
              type="button"
              disabled={isResetting}
              onClick={handleConfirmReset}
              className="h-11 rounded-[8px] bg-[#1E3A5F] text-[15px] font-semibold text-white hover:bg-[#1E3A5F]/90"
            >
              {isResetting ? COPY.resetting : COPY.confirm}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
