"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageLoading } from "@/components/app/page-loading";
import { PageShell } from "@/components/app/page-shell";
import { PageStatus } from "@/components/app/page-status";
import { StaticLink } from "@/components/app/static-link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  appendQueryHref,
  buildAdminTimeSettingsHref,
  buildAdminTimeSettingDetailHref,
  resolveStaticExportParam,
} from "@/lib/admin-route-hrefs";
import type { AdminTimeSettingDetailData } from "@/lib/domain/types";
import { buildAdminTimeSettingSaveConfirmCopy } from "@/lib/admin-time-setting-confirmation";
import { getAdminTimeSettingDetail } from "@/lib/services/mobile-app";
import {
  resetAdminCampusActualTime,
  updateAdminCampusActualTime,
  updateAdminCourseSessionTimeSetting,
} from "@/lib/services/mobile-client";
import { navigateTo } from "@/lib/static-navigation";

const ADMIN_ROLL_CALL_DEBUG_PREFIX = "[AdminRollCallDebug]";
const TIME_RANGE_LABEL = "时间范围";

function debugAdminRollCall(event: string, payload?: unknown) {
  if (typeof payload === "undefined") {
    console.log(`${ADMIN_ROLL_CALL_DEBUG_PREFIX} ${event}`);
    return;
  }

  console.log(`${ADMIN_ROLL_CALL_DEBUG_PREFIX} ${event}`, payload);
}

function toMinutes(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function normalizeTimeValue(value: string) {
  return /^\d{2}:\d{2}$/.test(value) ? `${value}:00` : value;
}

function buildRangeLabel(startTime: string, endTime: string) {
  return `${startTime}-${endTime}`;
}

function isTimeValue(value: string | null) {
  return value !== null && /^\d{2}:\d{2}$/.test(value);
}

export function AdminTimeSettingDetailClient() {
  const params = useParams<{ courseSessionId: string }>();
  const searchParams = useSearchParams();
  const settingKey = resolveStaticExportParam(
    params.courseSessionId,
    searchParams.get("courseSessionId"),
  );
  const targetDate = searchParams.get("targetDate");
  const [detail, setDetail] = useState<AdminTimeSettingDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let active = true;

    setLoading(true);
    debugAdminRollCall("time-setting.detail.fetch.start", {
      settingKey,
      href: window.location.href,
    });
    void getAdminTimeSettingDetail(settingKey, targetDate)
      .then((nextDetail) => {
        if (active) {
          debugAdminRollCall("time-setting.detail.fetch.success", {
            settingKey,
            detail: nextDetail,
          });
          setDetail(nextDetail);
          setError("");
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          debugAdminRollCall("time-setting.detail.fetch.error", {
            settingKey,
            error: err instanceof Error ? err.message : String(err),
          });
          setDetail(null);
          setError(err instanceof Error ? err.message : "时间详情加载失败，请稍后重试");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [settingKey, targetDate]);

  const selectedStartTime =
    detail && isTimeValue(searchParams.get("draftStartTime"))
      ? (searchParams.get("draftStartTime") as string)
      : detail?.startTime ?? "";
  const selectedEndTime =
    detail && isTimeValue(searchParams.get("draftEndTime"))
      ? (searchParams.get("draftEndTime") as string)
      : detail?.endTime ?? "";
  const selectedRange = useMemo(
    () => buildRangeLabel(selectedStartTime, selectedEndTime),
    [selectedEndTime, selectedStartTime],
  );
  const confirmCopy = useMemo(
    () =>
      detail
        ? buildAdminTimeSettingSaveConfirmCopy({
            kind: detail.kind,
            currentRange: detail.currentRange,
            nextRange: selectedRange,
          })
        : null,
    [detail, selectedRange],
  );

  const pickerHref = useMemo(() => {
    if (!detail) {
      return buildAdminTimeSettingsHref(targetDate ?? undefined);
    }
    return appendQueryHref(detail.pickerHref, {
        draftStartTime: selectedStartTime,
        draftEndTime: selectedEndTime,
      });
  }, [detail, selectedEndTime, selectedStartTime]);

  function validateSelectedRange() {
    const startMinutes = toMinutes(selectedStartTime);
    const endMinutes = toMinutes(selectedEndTime);

    if (startMinutes === null || endMinutes === null) {
      return "请先选择完整的时间范围。";
    }

    if (endMinutes <= startMinutes) {
      return "结束时间需要晚于开始时间。";
    }

    if (detail && detail.currentRange === selectedRange) {
      return "当前时间范围未变更，无需保存。";
    }

    return "";
  }

  function handleSave() {
    if (!detail) {
      return;
    }

    if (!detail.editable) {
      setFeedback("历史日期仅支持查看，不能修改。");
      return;
    }

    setFeedback("");
    const validationMessage = validateSelectedRange();
    if (validationMessage) {
      setFeedback(validationMessage);
      return;
    }

    setConfirmOpen(true);
  }

  async function handleConfirmSave() {
    if (!detail) {
      return;
    }

    if (!detail.editable) {
      setFeedback("历史日期仅支持查看，不能修改。");
      return;
    }

    setFeedback("");
    setIsSaving(true);

    try {
      const startMinutes = toMinutes(selectedStartTime);
      const endMinutes = toMinutes(selectedEndTime);

      if (startMinutes === null || endMinutes === null) {
        setFeedback("请先选择完整的时间范围。");
        return;
      }

      if (endMinutes <= startMinutes) {
        setFeedback("结束时间需要晚于开始时间。");
        return;
      }

      if (detail.kind === "actual") {
        if (!detail.campusId || !detail.targetDate) {
          setFeedback("缺少校区或日期信息，暂时无法保存。");
          return;
        }

        debugAdminRollCall("time-setting.detail.save.actual", {
          detail,
          selectedStartTime,
          selectedEndTime,
        });
        await updateAdminCampusActualTime({
          campusId: detail.campusId,
          targetDate: detail.targetDate,
          startTime: normalizeTimeValue(selectedStartTime),
          endTime: normalizeTimeValue(selectedEndTime),
        });
      } else {
        const referenceMinutes = detail.referenceStartTime
          ? toMinutes(detail.referenceStartTime)
          : null;

        if (referenceMinutes === null || !detail.courseSessionId) {
          setFeedback("缺少课节或参考时间信息，暂时无法保存。");
          return;
        }

        debugAdminRollCall("time-setting.detail.save.roll-call", {
          detail,
          selectedStartTime,
          selectedEndTime,
          referenceMinutes,
          startOffsetMinutes: startMinutes - referenceMinutes,
          endOffsetMinutes: endMinutes - referenceMinutes,
        });
        await updateAdminCourseSessionTimeSetting({
          courseSessionId: detail.courseSessionId,
          kind: "roll-call",
          startOffsetMinutes: startMinutes - referenceMinutes,
          endOffsetMinutes: endMinutes - referenceMinutes,
        });
      }

      setDetail({
        ...detail,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        currentRange: selectedRange,
      });
      debugAdminRollCall("time-setting.detail.save.success", {
        detail,
        selectedRange,
        navigateTo: buildAdminTimeSettingDetailHref(detail.settingKey, detail.targetDate),
      });
      setConfirmOpen(false);
      navigateTo(buildAdminTimeSettingDetailHref(detail.settingKey, detail.targetDate), {
        replace: true,
      });
    } catch (nextError) {
      debugAdminRollCall("time-setting.detail.save.error", {
        detail,
        error: nextError instanceof Error ? nextError.message : String(nextError),
      });
      setFeedback(nextError instanceof Error ? nextError.message : "保存失败，请稍后重试。");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReset() {
    if (!detail) {
      return;
    }

    if (!detail.editable) {
      setFeedback("历史日期仅支持查看，不能修改。");
      return;
    }

    setFeedback("");
    setIsResetting(true);

    try {
      if (detail.kind === "actual") {
        if (!detail.campusId || !detail.targetDate) {
          setFeedback("缺少校区或日期信息，暂时无法恢复默认。");
          return;
        }

        debugAdminRollCall("time-setting.detail.reset.actual", { detail });
        await resetAdminCampusActualTime({
          campusId: detail.campusId,
          targetDate: detail.targetDate,
        });
      } else if (detail.courseSessionId) {
        debugAdminRollCall("time-setting.detail.reset.roll-call", {
          detail,
          startOffsetMinutes: -(detail.defaultBeforeStartMinutes ?? 0),
          endOffsetMinutes: detail.defaultAfterStartMinutes ?? 0,
        });
        await updateAdminCourseSessionTimeSetting({
          courseSessionId: detail.courseSessionId,
          kind: "roll-call",
          startOffsetMinutes: -(detail.defaultBeforeStartMinutes ?? 0),
          endOffsetMinutes: detail.defaultAfterStartMinutes ?? 0,
        });
      }

      navigateTo(buildAdminTimeSettingDetailHref(detail.settingKey, detail.targetDate), {
        replace: true,
      });
    } catch (nextError) {
      setFeedback(nextError instanceof Error ? nextError.message : "操作失败，请稍后重试。");
    } finally {
      setIsResetting(false);
    }
  }

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <PageStatus
        title="时间详情加载失败"
        description={error}
        secondaryActionLabel="返回时间设置"
        secondaryActionHref={buildAdminTimeSettingsHref(targetDate ?? undefined)}
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  if (!detail) {
    return (
      <PageStatus
        title="暂无时间规则"
        description="当前还没有可调整的时间规则。"
        secondaryActionLabel="返回时间设置"
        secondaryActionHref={buildAdminTimeSettingsHref(targetDate ?? undefined)}
      />
    );
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader
            title={detail.title}
            backHref={buildAdminTimeSettingsHref(detail.targetDate)}
          />
          <div className="space-y-3.5 px-5 pt-3">
            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <h1 className="text-[15px] font-semibold text-[var(--jp-text)]">{detail.introTitle}</h1>
              <p className="mt-1.5 text-[12px] font-medium leading-5 text-[var(--jp-text-secondary)]">
                {detail.introPrimaryText}
              </p>
              <p className="mt-2.5 text-[12px] leading-5 text-[var(--jp-text-secondary)]">
                {detail.introSecondaryText}
              </p>
            </section>

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-4 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <h2 className="text-[15px] font-semibold text-[var(--jp-text)]">{detail.sectionTitle}</h2>
              {detail.editable ? (
                <StaticLink
                  href={pickerHref}
                  className="mt-3 flex items-center justify-between rounded-[12px] border border-[#E8E5E0] bg-[#F5F3F0] px-3.5 py-3"
                >
                  <span className="text-[13px] font-medium text-[var(--jp-text-secondary)]">
                    {TIME_RANGE_LABEL}
                  </span>
                  <span className="flex items-center gap-1.5 text-[17px] font-semibold text-[var(--jp-text)]">
                    {selectedRange}
                    <ChevronRight className="size-4 text-[var(--jp-text-muted)]" />
                  </span>
                </StaticLink>
              ) : (
                <div className="mt-3 flex items-center justify-between rounded-[12px] border border-[#E8E5E0] bg-[#F8F6F3] px-3.5 py-3">
                  <span className="text-[13px] font-medium text-[var(--jp-text-secondary)]">
                    {TIME_RANGE_LABEL}
                  </span>
                  <span className="text-[17px] font-semibold text-[var(--jp-text)]">
                    {selectedRange}
                  </span>
                </div>
              )}
              <p className="mt-3 text-xs text-[var(--jp-text-secondary)]">
                {detail.introSecondaryText}
              </p>
            </section>

            <section className="rounded-[16px] border border-[#F0E1BD] bg-[#FFF6EC] p-3.5 shadow-[0_8px_18px_rgba(196,106,26,0.08)]">
              <p className="text-xs font-semibold text-[#C46A1A]">{detail.highlightText}</p>
            </section>

            {!detail.editable ? (
              <section className="rounded-[16px] border border-[#E8E5E0] bg-[#F8F6F3] p-3.5 shadow-[0_8px_18px_rgba(28,28,28,0.03)]">
                <p className="text-xs font-semibold text-[var(--jp-text-secondary)]">
                  历史日期仅支持查看，不能修改或恢复默认。
                </p>
              </section>
            ) : null}

            {feedback ? (
              <p className="text-[12px] font-medium text-[#D32F2F]">{feedback}</p>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving || isResetting || !detail.editable}
                onClick={() => void handleReset()}
                className="h-11 rounded-[12px] border border-[#E8E5E0] bg-white text-[13px] font-semibold text-[var(--jp-text-secondary)] hover:bg-white disabled:opacity-50"
              >
                {isResetting ? "处理中..." : detail.resetLabel}
              </Button>
              <Button
                type="button"
                disabled={isSaving || isResetting || !detail.editable}
                onClick={handleSave}
                className="h-11 rounded-[12px] bg-[#1E3A5F] text-[13px] font-semibold text-white hover:bg-[#1E3A5F]/90 disabled:opacity-50"
              >
                {isSaving ? "生效中..." : detail.saveLabel}
              </Button>
            </div>
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

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!isSaving) {
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
              {confirmCopy?.title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#666666]">
              {confirmCopy?.description}
            </DialogDescription>
          </div>

          <div className="rounded-[12px] bg-[#F7F9FC] px-3.5 py-3 text-[12px] leading-6 text-[#526273]">
            <p>{confirmCopy?.current}</p>
            <p className="mt-1 font-semibold text-[#1E3A5F]">{confirmCopy?.next}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => setConfirmOpen(false)}
              className="h-11 rounded-[12px] border border-[#E8E5E0] bg-white text-[13px] font-semibold text-[var(--jp-text-secondary)] hover:bg-white disabled:opacity-50"
            >
              {confirmCopy?.cancelLabel}
            </Button>
            <Button
              type="button"
              disabled={isSaving}
              onClick={() => void handleConfirmSave()}
              className="h-11 rounded-[12px] bg-[#1E3A5F] text-[13px] font-semibold text-white hover:bg-[#1E3A5F]/90 disabled:opacity-50"
            >
              {isSaving ? confirmCopy?.pendingLabel : confirmCopy?.confirmLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
