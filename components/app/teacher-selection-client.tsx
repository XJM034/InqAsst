"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight, Check, Layers3 } from "lucide-react";

import {
  buildAdminEmergencyCourseHref,
  buildAdminExternalTeacherHref,
} from "@/lib/admin-route-hrefs";
import { buildAdminTabItems, withCampusQuery } from "@/lib/admin-campus";
import { isRollCallTeacherConflictMessage } from "@/lib/roll-call-teacher-conflict";
import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { SearchField } from "@/components/app/search-field";
import { StaticLink } from "@/components/app/static-link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  setRollCallTeacher,
  setRollCallTeacherBatch,
  setRollCallTeacherMergeGroup,
} from "@/lib/services/mobile-client";
import { navigateTo } from "@/lib/static-navigation";
import { cn } from "@/lib/utils";

type TeacherItem = {
  id: string;
  label: string;
  name?: string;
  phone?: string | null;
  note?: string;
  selected?: boolean;
  source?: "internal" | "external";
  manual?: boolean;
  badges?: string[];
  swapTargets?: Array<{
    courseId: string;
    courseSessionId: string;
    courseTitle: string;
    dayLabel?: string;
    sessionTimeLabel: string;
    locationLabel?: string;
    currentTeacherLabel: string;
  }>;
};

type Props = {
  campus: string;
  courseId: string;
  courseSessionId: string;
  sessionDate?: string;
  courseTitle: string;
  courseMeta: string;
  currentTeacherId?: string;
  currentTeacherSource?: "internal" | "external";
  currentTeacherLabel: string;
  defaultTeacherLabel: string;
  teachers: TeacherItem[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  isRefreshing?: boolean;
  refreshError?: string;
  onLoadMore: () => void;
  returnHref?: string;
};

const COPY = {
  title: "更换点名老师",
  currentPrefix: "当前：",
  defaultPrefix: "默认：",
  searchPlaceholder: "搜索老师姓名 / 手机号",
  listTitle: "可选老师列表",
  externalTeacher: "录入系统外老师",
  selectFailed: "选择失败，请稍后重试",
  empty: "未找到匹配的老师",
  loadMore: "加载更多老师",
  loadingMore: "加载中...",
  dialogTitle: "确认更换点名老师",
  dialogDescription:
    "将 {courseTitle} 的点名老师从「{currentTeacher}」更换为「{nextTeacher}」后，老师端将按新的老师身份进入点名。",
  dialogCurrent: "当前：{currentTeacher}",
  dialogNext: "更换后：{nextTeacher}",
  swapDialogTitle: "确认互换当日点名课程",
  swapDialogDescription:
    "老师「{nextTeacher}」当天已有课程「{swapCourse}」。确认后，会把「{currentCourse}」与该课程的点名老师直接互换。",
  mergeDialogTitle: "选择处理方式",
  mergeDialogDescription:
    "老师「{nextTeacher}」同时间段已有课节。请先选择本次是合班，还是互换其中一节。",
  swapCurrentCourse: "当前课程：{courseTitle}",
  swapTargetCourse: "互换课程：{swapCourse}",
  modeTargetHint: "先选择处理方式",
  mergeModeTitle: "合班点名",
  mergeModeDescription: "当前课节和所选课节由 {nextTeacher} 一次点名",
  swapModeTitle: "互换点名老师",
  swapModeDescription: "当前课节与目标老师的一节课交换点名老师",
  swapTargetHint: "选择互换的课节",
  swapTargetTeacher: "互换后由：{currentTeacher} 接手",
  mergeTargetHint: "选择加入合班的课节",
  mergeTargetEmpty: "当前没有可加入合班的同时间段课节。",
  modeChoiceRequired: "请先选择合班或互换。",
  mergeChoiceRequired: "请选择至少一节课加入合班。",
  swapChoiceRequired: "请选择要互换的一节课。",
  swapUnavailable: "当前点名老师不是系统内老师，本次不能互换，只能直接合班。",
  conflictHint: "如需继续处理本课节，可先改录系统外老师。",
  fallbackExternalTeacher: "改录系统外老师",
  cancel: "取消",
  confirm: "确认更换",
  confirmSwap: "确认互换",
  confirmMerge: "创建合班",
  chooseMode: "先选择方式",
  chooseMergeTarget: "选择合班课节",
  chooseSwapTarget: "选择互换课节",
  submitting: "提交中...",
} as const;

function formatCopy(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

function formatSwapTargetLabel(target: {
  courseTitle: string;
  dayLabel?: string;
  sessionTimeLabel: string;
}) {
  const meta = [target.dayLabel, target.sessionTimeLabel].filter(Boolean).join(" ");
  return meta ? `${target.courseTitle}（${meta}）` : target.courseTitle;
}

type SameSlotActionMode = "" | "merge" | "swap";

export function TeacherSelectionClient({
  campus,
  courseId,
  courseSessionId,
  sessionDate,
  courseTitle,
  courseMeta,
  currentTeacherId,
  currentTeacherSource,
  currentTeacherLabel,
  defaultTeacherLabel,
  teachers: initialTeachers,
  searchQuery,
  onSearchQueryChange,
  hasNextPage,
  isLoadingMore,
  isRefreshing = false,
  refreshError = "",
  onLoadMore,
  returnHref,
}: Props) {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [pendingTeacher, setPendingTeacher] = useState<TeacherItem | null>(null);
  const [pendingSameSlotMode, setPendingSameSlotMode] =
    useState<SameSlotActionMode>("");
  const [pendingSwapTargetId, setPendingSwapTargetId] = useState("");
  const [pendingMergeTargetIds, setPendingMergeTargetIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const resolvedReturnHref =
    returnHref ??
    buildAdminEmergencyCourseHref(courseId, {
      courseSessionId,
    });

  useEffect(() => {
    setTeachers(initialTeachers);
  }, [initialTeachers]);

  useEffect(() => {
    setPendingSwapTargetId("");
    setPendingSameSlotMode("");
    setPendingMergeTargetIds([]);
    setError("");
  }, [pendingTeacher]);

  const conflictFallbackHref =
    pendingTeacher && pendingTeacher.source === "internal"
      ? withCampusQuery(
          buildAdminExternalTeacherHref(courseId, {
            courseSessionId,
            returnHref,
            prefillName: pendingTeacher.name,
          }),
          campus,
        )
      : null;
  const showConflictFallback =
    Boolean(pendingTeacher) &&
    pendingTeacher?.source === "internal" &&
    isRollCallTeacherConflictMessage(error);
  const pendingSwapTargets = pendingTeacher?.swapTargets ?? [];
  const canSwapCurrentTeacher =
    currentTeacherSource === "internal" && Boolean(currentTeacherId);
  const canCoordinateSameSlot =
    Boolean(pendingTeacher) &&
    pendingTeacher?.source === "internal" &&
    pendingTeacher?.id !== currentTeacherId &&
    Boolean(sessionDate) &&
    pendingSwapTargets.length > 0;
  const canSwapSelection =
    canCoordinateSameSlot &&
    pendingSameSlotMode === "swap" &&
    canSwapCurrentTeacher &&
    Boolean(pendingSwapTargetId);
  const selectedSwapTarget =
    pendingSwapTargets.find((target) => target.courseSessionId === pendingSwapTargetId) ??
    null;
  const mergeCandidates = pendingSwapTargets;
  const selectedMergeTargetIds = pendingMergeTargetIds.filter((id) =>
    mergeCandidates.some((target) => target.courseSessionId === id),
  );
  const selectedMergeTargets = mergeCandidates.filter((target) =>
    selectedMergeTargetIds.includes(target.courseSessionId),
  );
  const canCreateMergeGroup =
    canCoordinateSameSlot &&
    pendingSameSlotMode === "merge" &&
    selectedMergeTargetIds.length > 0 &&
    Boolean(pendingTeacher?.id);
  const sameSlotChoiceRequired =
    canCoordinateSameSlot && !canSwapSelection && !canCreateMergeGroup;
  const confirmDisabled = isSubmitting || sameSlotChoiceRequired;

  function toggleMergeTarget(targetId: string) {
    setPendingMergeTargetIds((current) =>
      current.includes(targetId)
        ? current.filter((id) => id !== targetId)
        : [...current, targetId],
    );
  }

  function handleSwapTargetChange(targetId: string) {
    setPendingSwapTargetId(targetId);
  }

  function getConfirmLabel() {
    if (isSubmitting) {
      return COPY.submitting;
    }

    if (canCreateMergeGroup) {
      return COPY.confirmMerge;
    }

    if (canSwapSelection) {
      return COPY.confirmSwap;
    }

    if (sameSlotChoiceRequired) {
      if (!pendingSameSlotMode) {
        return COPY.chooseMode;
      }

      return pendingSameSlotMode === "merge" ? COPY.chooseMergeTarget : COPY.chooseSwapTarget;
    }

    return COPY.confirm;
  }

  async function handleConfirmSelection() {
    if (!pendingTeacher) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      if (canCreateMergeGroup && pendingTeacher.id && sessionDate) {
        await setRollCallTeacherMergeGroup({
          sessionDate,
          sourceCourseSessionId: Number(courseSessionId),
          targetTeacherId: Number(pendingTeacher.id),
          mergeCourseSessionIds: selectedMergeTargetIds.map((id) => Number(id)),
        });
      } else if (canSwapSelection && selectedSwapTarget && currentTeacherId && sessionDate) {
        await setRollCallTeacherBatch({
          sessionDate,
          assignments: [
            {
              courseSessionId: Number(courseSessionId),
              teacherId: Number(pendingTeacher.id),
            },
            {
              courseSessionId: Number(selectedSwapTarget.courseSessionId),
              teacherId: Number(currentTeacherId),
            },
          ],
        });
      } else {
        await setRollCallTeacher(courseSessionId, Number(pendingTeacher.id));
      }

      setTeachers((prev) =>
        prev.map((item) => ({ ...item, selected: item.id === pendingTeacher.id })),
      );
      setPendingTeacher(null);
      navigateTo(withCampusQuery(resolvedReturnHref, campus));
    } catch (err) {
      setTeachers(initialTeachers);
      setError(err instanceof Error ? err.message : COPY.selectFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader
            title={COPY.title}
            backHref={withCampusQuery(
              buildAdminEmergencyCourseHref(courseId, {
                courseSessionId,
              }),
              campus,
            )}
          />

          <div className="space-y-3.5 px-5 pt-3">
            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <h1 className="text-base font-bold text-[var(--jp-text)]">{courseTitle}</h1>
              <p className="mt-2 text-xs text-[var(--jp-text-secondary)]">{courseMeta}</p>
            </section>

            <section className="rounded-[16px] border border-[#D4E1EF] bg-[#EEF4FA] p-3.5 shadow-[0_10px_22px_rgba(30,58,95,0.08)]">
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-[#1E3A5F]">
                  {`${COPY.currentPrefix}${currentTeacherLabel}`}
                </p>
                <p className="text-[12px] font-medium text-[#56718D]">
                  {`${COPY.defaultPrefix}${defaultTeacherLabel}`}
                </p>
              </div>
            </section>

            <SearchField
              value={searchQuery}
              onChange={onSearchQueryChange}
              placeholder={COPY.searchPlaceholder}
              className="h-[42px]"
            />

            {refreshError ? (
              <div className="rounded-[14px] border border-[#F2DEC2] bg-[#FFF7EA] px-4 py-3">
                <p className="text-[12px] font-semibold text-[#A55B14]">搜索结果刷新失败</p>
                <p className="mt-1 text-[12px] leading-5 text-[#7A5A2A]">
                  当前先保留上一版老师列表。{refreshError}
                </p>
              </div>
            ) : null}

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-[var(--jp-text)]">{COPY.listTitle}</h2>
                <div className="flex items-center gap-2">
                  {isRefreshing ? (
                    <span className="text-[11px] font-medium text-[var(--jp-text-muted)]">
                      搜索中...
                    </span>
                  ) : null}
                  <StaticLink
                    href={withCampusQuery(
                      buildAdminExternalTeacherHref(courseId, {
                        courseSessionId,
                        returnHref,
                      }),
                      campus,
                    )}
                    className="rounded-full border border-[#D4E1EF] px-3 py-1.5 text-[11px] font-semibold text-[#1E3A5F]"
                  >
                    {COPY.externalTeacher}
                  </StaticLink>
                </div>
              </div>

              <div className={cn("mt-3 space-y-2.5", isRefreshing && "opacity-80")}>
                {teachers.map((teacher) => (
                  <button
                    key={teacher.id}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setPendingTeacher(teacher)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-[14px] border px-3 py-3 text-left shadow-[0_8px_18px_rgba(28,28,28,0.03)]",
                      teacher.selected
                        ? teacher.source === "external"
                          ? "border-[#F2DEC2] bg-[#FFF7ED]"
                          : "border-[#D4E1EF] bg-[#EEF4FA]"
                        : teacher.source === "external" && teacher.manual
                          ? "border-[#F2DEC2] bg-[#FFFBF6]"
                          : "border-[#E8E5E0] bg-white",
                      isSubmitting ? "opacity-70" : "",
                    )}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-[13px] font-bold text-[var(--jp-text)]">
                          {teacher.label}
                        </p>
                        {teacher.badges?.map((badge) => (
                          <span
                            key={`${teacher.id}-${badge}`}
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              badge === "当前代课"
                                ? "bg-[#E8F0FB] text-[#1E3A5F]"
                                : badge === "可合班"
                                  ? "bg-[#EAF2EC] text-[#3D6B4F]"
                                  : badge === "可互换"
                                    ? "bg-[#EEF4FA] text-[#1E3A5F]"
                                    : badge === "手动添加"
                                      ? "bg-[#FFF3E8] text-[#A55B14]"
                                      : teacher.source === "external"
                                        ? "bg-[#FFF7ED] text-[#A55B14]"
                                        : "bg-[#F5F3F0] text-[var(--jp-text-secondary)]",
                            )}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                      {teacher.note ? (
                        <p className="mt-1 text-[11px] text-[var(--jp-text-secondary)]">
                          {teacher.note}
                        </p>
                      ) : null}
                    </div>
                    <div
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full",
                        teacher.selected ? "bg-[#1E3A5F]" : "bg-white",
                      )}
                    >
                      {teacher.selected ? <Check className="size-3 text-white" /> : null}
                    </div>
                  </button>
                ))}

                {teachers.length === 0 ? (
                  <div className="rounded-[14px] border border-dashed border-[#D8D5D0] px-4 py-6 text-center text-[13px] text-[var(--jp-text-muted)]">
                    {COPY.empty}
                  </div>
                ) : null}

                {hasNextPage ? (
                  <button
                    type="button"
                    onClick={onLoadMore}
                    disabled={isLoadingMore || isSubmitting}
                    className="w-full rounded-[14px] border border-[#D4E1EF] bg-[#EEF4FA] px-4 py-3 text-[13px] font-semibold text-[#1E3A5F] disabled:opacity-60"
                  >
                    {isLoadingMore ? COPY.loadingMore : COPY.loadMore}
                  </button>
                ) : null}
              </div>
            </section>

            {error && !pendingTeacher ? (
              <p className="px-0.5 text-[13px] font-medium text-[#D32F2F]">{error}</p>
            ) : null}
          </div>
        </div>

        <MobileTabBar active="home" items={buildAdminTabItems(campus)} />
      </div>

      <Dialog
        open={Boolean(pendingTeacher)}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            setPendingTeacher(null);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-[rgba(15,23,42,0.35)]"
          className="max-h-[calc(100vh-2rem)] max-w-[360px] gap-4 overflow-y-auto rounded-[16px] border-0 bg-white p-6 shadow-none ring-0"
        >
          <div className="space-y-2.5">
            <DialogTitle className="text-[18px] font-semibold text-[#1E3A5F]">
              {canCoordinateSameSlot ? COPY.mergeDialogTitle : COPY.dialogTitle}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#666666]">
              {canCoordinateSameSlot
                ? formatCopy(COPY.mergeDialogDescription, {
                    nextTeacher: pendingTeacher?.label ?? "待选择老师",
                  })
                : formatCopy(COPY.dialogDescription, {
                    courseTitle,
                    currentTeacher: currentTeacherLabel,
                    nextTeacher: pendingTeacher?.label ?? "待选择老师",
                  })}
            </DialogDescription>
          </div>

          <div className="rounded-[12px] bg-[#F7F9FC] px-3.5 py-3 text-[12px] leading-6 text-[#526273]">
            {canCoordinateSameSlot ? (
              <>
                {formatCopy(COPY.swapCurrentCourse, {
                  courseTitle,
                })}
                <br />
                {formatCopy(COPY.dialogNext, {
                  nextTeacher: pendingTeacher?.label ?? "待选择老师",
                })}
                {pendingSameSlotMode === "swap" && selectedSwapTarget ? (
                  <>
                    <br />
                    {formatCopy(COPY.swapTargetCourse, {
                      swapCourse: formatSwapTargetLabel(selectedSwapTarget),
                    })}
                    <br />
                    {formatCopy(COPY.swapTargetTeacher, {
                      currentTeacher: currentTeacherLabel,
                    })}
                  </>
                ) : null}
                {pendingSameSlotMode === "merge" && selectedMergeTargets.length > 0 ? (
                  <>
                    <br />
                    合班课节：{selectedMergeTargets.map(formatSwapTargetLabel).join("、")}
                  </>
                ) : null}
              </>
            ) : (
              <>
                {formatCopy(COPY.dialogCurrent, {
                  currentTeacher: currentTeacherLabel,
                })}
                <br />
                {formatCopy(COPY.dialogNext, {
                  nextTeacher: pendingTeacher?.label ?? "待选择老师",
                })}
              </>
            )}
          </div>

          {canCoordinateSameSlot ? (
            <div className="space-y-3">
              <section className="space-y-2.5">
                <div className="flex items-center gap-2 text-[#1E3A5F]">
                  <Layers3 className="size-3.5" />
                  <p className="text-[12px] font-semibold leading-5">{COPY.modeTargetHint}</p>
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setPendingSameSlotMode("merge")}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-[12px] border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6B4F]/20 disabled:opacity-60",
                      pendingSameSlotMode === "merge"
                        ? "border-[#BBD8C4] bg-[#EAF2EC]"
                        : "border-[#E8E5E0] bg-white",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                        pendingSameSlotMode === "merge"
                          ? "bg-[#3D6B4F] text-white"
                          : "bg-[#EAF2EC] text-[#3D6B4F]",
                      )}
                    >
                      <Layers3 className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold text-[var(--jp-text)]">
                        {COPY.mergeModeTitle}
                      </span>
                      <span className="mt-1 block text-[11px] leading-5 text-[var(--jp-text-secondary)]">
                        {formatCopy(COPY.mergeModeDescription, {
                          nextTeacher: pendingTeacher?.label ?? "该老师",
                        })}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting || !canSwapCurrentTeacher}
                    onClick={() => setPendingSameSlotMode("swap")}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-[12px] border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F]/20 disabled:cursor-not-allowed disabled:opacity-55",
                      pendingSameSlotMode === "swap"
                        ? "border-[#D4E1EF] bg-[#EEF4FA]"
                        : "border-[#E8E5E0] bg-white",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                        pendingSameSlotMode === "swap"
                          ? "bg-[#1E3A5F] text-white"
                          : "bg-[#EEF4FA] text-[#1E3A5F]",
                      )}
                    >
                      <ArrowLeftRight className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold text-[var(--jp-text)]">
                        {COPY.swapModeTitle}
                      </span>
                      <span className="mt-1 block text-[11px] leading-5 text-[var(--jp-text-secondary)]">
                        {COPY.swapModeDescription}
                      </span>
                    </span>
                  </button>
                </div>
                {!canSwapCurrentTeacher ? (
                  <p className="rounded-[12px] bg-[#F8F6F2] px-3 py-2.5 text-[12px] leading-5 text-[var(--jp-text-secondary)]">
                    {COPY.swapUnavailable}
                  </p>
                ) : null}
              </section>

              {pendingSameSlotMode === "merge" ? (
                <section className="space-y-2">
                  <div className="flex items-center gap-2 text-[#3D6B4F]">
                    <Layers3 className="size-3.5" />
                    <p className="text-[12px] font-semibold leading-5">{COPY.mergeTargetHint}</p>
                  </div>
                  {mergeCandidates.length === 0 ? (
                    <p className="rounded-[12px] bg-[#F8F6F2] px-3 py-2.5 text-[12px] leading-5 text-[var(--jp-text-secondary)]">
                      {COPY.mergeTargetEmpty}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {mergeCandidates.map((target) => {
                        const selected = selectedMergeTargetIds.includes(target.courseSessionId);

                        return (
                          <button
                            key={target.courseSessionId}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => toggleMergeTarget(target.courseSessionId)}
                            className={cn(
                              "flex w-full items-start gap-2 rounded-[12px] border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6B4F]/20",
                              selected
                                ? "border-[#BBD8C4] bg-[#EAF2EC]"
                                : "border-[#E8E5E0] bg-white",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                                selected
                                  ? "border-[#3D6B4F] bg-[#3D6B4F] text-white"
                                  : "border-[#D8D5D0] bg-white text-transparent",
                              )}
                            >
                              <Check className="size-2.5" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[13px] font-semibold text-[var(--jp-text)]">
                                {target.courseTitle}
                              </span>
                              <span className="mt-1 block text-[11px] leading-5 text-[var(--jp-text-secondary)]">
                                {[target.dayLabel, target.sessionTimeLabel, target.locationLabel]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              ) : null}

              {pendingSameSlotMode === "swap" ? (
                <section className="space-y-2">
                  <div className="flex items-center gap-2 text-[#1E3A5F]">
                    <ArrowLeftRight className="size-3.5" />
                    <p className="text-[12px] font-semibold leading-5">{COPY.swapTargetHint}</p>
                  </div>
                  <div className="space-y-2">
                    {pendingSwapTargets.map((target) => (
                      <button
                        key={target.courseSessionId}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleSwapTargetChange(target.courseSessionId)}
                        className={cn(
                          "w-full rounded-[12px] border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A5F]/20",
                          target.courseSessionId === selectedSwapTarget?.courseSessionId
                            ? "border-[#D4E1EF] bg-[#EEF4FA]"
                            : "border-[#E8E5E0] bg-white",
                        )}
                      >
                        <p className="text-[13px] font-semibold text-[var(--jp-text)]">
                          {target.courseTitle}
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-[var(--jp-text-secondary)]">
                          {[target.dayLabel, target.sessionTimeLabel, target.locationLabel]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        <p className="mt-1 text-[10px] font-medium text-[#6B7C8C]">
                          互换后由 {currentTeacherLabel} 接手
                        </p>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}

          {sameSlotChoiceRequired ? (
            <p className="rounded-[12px] bg-[#FFF8E8] px-3 py-2 text-[12px] leading-5 text-[#8A6018]">
              {!pendingSameSlotMode
                ? COPY.modeChoiceRequired
                : pendingSameSlotMode === "merge"
                  ? COPY.mergeChoiceRequired
                  : COPY.swapChoiceRequired}
            </p>
          ) : null}

          {error ? (
            <div className="space-y-3 rounded-[12px] border border-[#F4C7C7] bg-[#FFF3F3] px-3.5 py-3">
              <p className="text-[12px] leading-5 text-[#B42318]">{error}</p>
              {showConflictFallback && conflictFallbackHref ? (
                <div className="space-y-2">
                  <p className="text-[12px] leading-5 text-[#7A271A]">{COPY.conflictHint}</p>
                  <StaticLink
                    href={conflictFallbackHref}
                    className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#F2DEC2] bg-white px-3 text-[12px] font-semibold text-[#A55B14]"
                  >
                    {COPY.fallbackExternalTeacher}
                  </StaticLink>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                setPendingTeacher(null);
                setError("");
              }}
              className="h-11 rounded-[8px] border-0 bg-[#F5F5F5] text-[15px] font-medium text-[var(--jp-text)] hover:bg-[#F5F5F5]"
            >
              {COPY.cancel}
            </Button>
            <Button
              type="button"
              disabled={confirmDisabled}
              onClick={handleConfirmSelection}
              className="h-11 rounded-[8px] bg-[#1E3A5F] text-[15px] font-semibold text-white hover:bg-[#1E3A5F]/90"
            >
              {getConfirmLabel()}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
