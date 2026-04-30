"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { ChevronDown, Copy } from "lucide-react";

import { AdminAttendanceHeaderTicker } from "@/components/app/admin-attendance-header-ticker";
import {
  ADMIN_ATTENDANCE_COPY_FEEDBACK_LABELS,
  ADMIN_ATTENDANCE_COPY_LABELS,
  AdminAttendanceTopTools,
} from "@/components/app/admin-attendance-top-tools";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { buildAdminAttendanceTabs, buildAdminTabItems } from "@/lib/admin-campus";
import { buildAdminAttendanceSubtitle } from "@/lib/admin-attendance-header";
import { getAttendanceSummary } from "@/lib/domain/attendance";
import type {
  AdminUnarrivedData,
  AdminUnarrivedGroupStudent,
  AttendanceStatus,
} from "@/lib/domain/types";
import { submitAdminAttendance } from "@/lib/services/mobile-client";
import { cn } from "@/lib/utils";

type AdminUnarrivedClientProps = {
  data: AdminUnarrivedData;
  campus: string;
};

type CollapsedByGroupId = Record<string, boolean>;

function toSelectableStatus(status: AttendanceStatus) {
  return status === "unmarked" ? "absent" : status;
}

export function getManagedStudentCount(groups: AdminUnarrivedData["groups"]) {
  return groups.reduce((count, group) => count + group.students.length, 0);
}

export function getResolvedStudentCount(groups: AdminUnarrivedData["groups"]) {
  return groups.reduce(
    (count, group) =>
      count +
      group.students.filter(
        (student) => student.managerUpdated && student.status !== "absent" && student.status !== "unmarked",
      ).length,
    0,
  );
}

export function buildUnarrivedCollapsedByGroupId(groups: AdminUnarrivedData["groups"]) {
  return groups.reduce<CollapsedByGroupId>((collapsedByGroupId, group) => {
    collapsedByGroupId[group.id] = true;
    return collapsedByGroupId;
  }, {});
}

export function toggleUnarrivedGroupCollapsed(
  collapsedByGroupId: CollapsedByGroupId,
  groupId: string,
) {
  return {
    ...collapsedByGroupId,
    [groupId]: !(collapsedByGroupId[groupId] ?? true),
  };
}

export function filterUnarrivedGroups(
  groups: AdminUnarrivedData["groups"],
  normalizedQuery: string,
) {
  if (!normalizedQuery) {
    return groups;
  }

  return groups
    .map((group) => ({
      ...group,
      students: group.students.filter((student) =>
        `${student.name} ${student.homeroomClass} ${student.note} ${group.label}`
          .toLowerCase()
          .includes(normalizedQuery),
      ),
    }))
    .filter((group) => group.students.length > 0);
}

export function isUnarrivedGroupCollapsed(
  collapsedByGroupId: CollapsedByGroupId,
  groupId: string,
  normalizedQuery: string,
) {
  if (normalizedQuery) {
    return false;
  }

  return collapsedByGroupId[groupId] ?? true;
}

function buildUnarrivedHeadline(
  pendingAbsentCount: number,
  managedCount: number,
) {
  if (managedCount === 0) {
    return "今天暂无未到学生";
  }

  return `当前共 ${pendingAbsentCount} 名学生待确认未到情况`;
}

function getGroupIssueCount(group: AdminUnarrivedData["groups"][number]) {
  return group.students.length;
}

export function AdminUnarrivedClient({ data, campus }: AdminUnarrivedClientProps) {
  const [feedback, setFeedback] = useState("");
  const [groups, setGroups] = useState(data.groups);
  const [collapsedByGroupId, setCollapsedByGroupId] = useState<CollapsedByGroupId>(() =>
    buildUnarrivedCollapsedByGroupId(data.groups),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setGroups(data.groups);
    setCollapsedByGroupId(buildUnarrivedCollapsedByGroupId(data.groups));
  }, [data.groups]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const summary = getAttendanceSummary(
    groups.flatMap((group) =>
      group.students.map((student) => ({
        id: student.id,
        name: student.name,
        homeroomClass: student.homeroomClass,
        status: student.status,
        managerUpdated: student.managerUpdated,
      })),
    ),
  );
  const followUpCount = getManagedStudentCount(groups);
  const pendingAbsentCount = summary.absent + summary.unmarked;
  const controlHeadline = buildUnarrivedHeadline(pendingAbsentCount, followUpCount);
  const courseSummaryText = Array.from(
    new Set(
      groups.flatMap((group) =>
        group.students.map((student) => student.courseName ?? student.note).filter(Boolean),
      ),
    ),
  ).join("\n");

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback(`${label}已复制`);
    } catch {
      setFeedback("当前环境不支持自动复制");
    }
  }

  async function persistStudentChange(
    nextGroups: typeof data.groups,
    previousGroups: typeof data.groups,
    targetStudent: AdminUnarrivedGroupStudent | null,
  ) {
    setGroups(nextGroups);

    if (!targetStudent?.courseId) {
      return;
    }

    setFeedback("");
    setIsSaving(true);

    try {
      await submitAdminAttendance({
        courseId: targetStudent.courseId,
        courseSessionId: targetStudent.courseSessionId,
        students: [
          {
            id: targetStudent.studentId,
            name: targetStudent.name,
            homeroomClass: targetStudent.homeroomClass,
            homeroomClassId: targetStudent.homeroomClassId,
            status: targetStudent.status,
            managerUpdated: targetStudent.managerUpdated,
            overrideLabel: targetStudent.overrideLabel,
          },
        ],
      });
      setFeedback("学生状态已同步");
    } catch (error) {
      setGroups(previousGroups);
      setFeedback(error instanceof Error ? error.message : "同步失败，请稍后重试");
    } finally {
      setIsSaving(false);
    }
  }

  function handleStatusChange(groupId: string, studentId: string, nextStatus: AttendanceStatus) {
    const previousGroups = groups;
    const nextGroups = groups.map((group) => {
      if (group.id !== groupId) {
        return group;
      }

      return {
        ...group,
        students: group.students.map((student) => {
          if (student.id !== studentId) {
            return student;
          }

          const sourceGroup = data.groups.find((item) => item.id === groupId);
          const sourceStudent =
            sourceGroup?.students.find((item) => item.id === studentId) ?? student;
          const managerUpdated =
            Boolean(sourceStudent.managerUpdated) || nextStatus !== sourceStudent.status;

          return {
            ...student,
            status: nextStatus,
            managerUpdated,
            overrideLabel: undefined,
          };
        }),
      };
    });
    const targetStudent =
      nextGroups
        .find((group) => group.id === groupId)
        ?.students.find((student) => student.id === studentId) ?? null;

    void persistStudentChange(nextGroups, previousGroups, targetStudent);
  }

  const unarrivedText = groups
    .flatMap((group) =>
      group.students.map((student) => `${group.label}：${student.name}，${student.note}`),
    )
    .join("\n");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleGroups = useMemo(
    () => filterUnarrivedGroups(groups, normalizedQuery),
    [groups, normalizedQuery],
  );
  const subtitle = useMemo(() => buildAdminAttendanceSubtitle(data, now), [data, now]);
  const emptyTitle = normalizedQuery ? "未找到匹配的学生" : "今天暂无未到学生";
  const emptyDescription = normalizedQuery
    ? "换个学生、行政班或课程关键词再试试。"
    : "老师提交点名后，这里会按行政班整理待跟进学生。";

  function toggleGroupCollapsed(groupId: string) {
    if (normalizedQuery) {
      return;
    }

    setCollapsedByGroupId((current) => toggleUnarrivedGroupCollapsed(current, groupId));
  }

  function handleGroupKeyDown(event: KeyboardEvent<HTMLElement>, groupId: string) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    toggleGroupCollapsed(groupId);
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll px-5 pt-4">
          <section className="rounded-[20px] border border-[#E8E2D8] bg-[linear-gradient(180deg,#FFFCF8_0%,#FFFFFF_34%,#FFFFFF_100%)] p-4 shadow-[0_14px_28px_rgba(28,28,28,0.05)]">
            <div className="min-w-0">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold tracking-[0.06em] text-[#8C7961]">
                  未到学生管理
                </p>
                <p className="mt-2 text-[22px] font-semibold leading-[1.2] tracking-[-0.03em] text-[var(--jp-text)]">
                  {controlHeadline}
                </p>
                <AdminAttendanceHeaderTicker
                  text={subtitle}
                  className="mt-2 text-[11px] text-[var(--jp-text-secondary)]"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <SummaryBadge label="已到" value={summary.present} tone="success" />
              <SummaryBadge label="请假" value={summary.leave} tone="neutral" />
            </div>
          </section>

          <AdminAttendanceTopTools
            summaryItems={[]}
            actions={[
              {
                label: ADMIN_ATTENDANCE_COPY_LABELS.courses,
                onClick: () =>
                  copyText(courseSummaryText, ADMIN_ATTENDANCE_COPY_FEEDBACK_LABELS.courses),
                disabled: !courseSummaryText,
              },
              {
                label: ADMIN_ATTENDANCE_COPY_LABELS.details,
                onClick: () =>
                  copyText(unarrivedText, ADMIN_ATTENDANCE_COPY_FEEDBACK_LABELS.details),
                disabled: !unarrivedText,
              },
            ]}
            tabs={buildAdminAttendanceTabs(campus, "unarrived")}
            searchPlaceholder="搜索学生、行政班或课程"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {feedback ? (
            <p className="mt-3 inline-flex rounded-full bg-[#EEF3F8] px-3 py-1 text-[11px] font-medium text-[#1E3A5F]">
              {feedback}
            </p>
          ) : null}

          {visibleGroups.length === 0 ? (
            <div className="mt-3.5 rounded-[16px] border border-[#E8E5E0] bg-white px-5 py-8 text-center shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <p className="text-[15px] font-semibold text-[var(--jp-text)]">{emptyTitle}</p>
              <p className="mx-auto mt-2 max-w-[24ch] text-[12px] leading-[1.7] text-[var(--jp-text-secondary)]">
                {emptyDescription}
              </p>
              {normalizedQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 inline-flex rounded-full bg-[#F5F3F0] px-3 py-1.5 text-[11px] font-semibold text-[var(--jp-text-secondary)]"
                >
                  清空搜索
                </button>
              ) : null}
            </div>
          ) : (
            <div className="mt-3.5 space-y-4">
              {visibleGroups.map((group) => {
                const collapsed = isUnarrivedGroupCollapsed(
                  collapsedByGroupId,
                  group.id,
                  normalizedQuery,
                );
                const groupIssueCount = getGroupIssueCount(group);
                const groupTouched = group.students.some((student) => student.managerUpdated);

                return (
                  <section
                    key={group.id}
                    className={cn(
                      "rounded-[16px] border p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)] transition-[border-color,background-color,box-shadow] duration-200",
                      groupTouched
                        ? "border-[#EAD8C6] bg-[#FFFCF8]"
                        : "border-[#E8E5E0] bg-white",
                    )}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      aria-expanded={!collapsed}
                      onClick={() => toggleGroupCollapsed(group.id)}
                      onKeyDown={(event) => handleGroupKeyDown(event, group.id)}
                      className="flex items-center justify-between gap-3 rounded-[12px] px-1 py-1 outline-none transition-colors hover:bg-[#FAF7F2] focus-visible:ring-2 focus-visible:ring-[var(--jp-accent)]/30"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={cn(
                              "size-4 text-[var(--jp-text-muted)] transition-transform",
                              collapsed ? "-rotate-90" : "rotate-0",
                            )}
                          />
                          <h2 className="text-sm font-semibold text-[var(--jp-text)]">{group.label}</h2>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-[#F5F3F0] px-2.5 py-1 text-[11px] font-semibold text-[var(--jp-text-secondary)]">
                          {groupIssueCount > 0 ? `${groupIssueCount} 人` : "已修正"}
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void copyText(
                              group.students
                                .map((student) => `${student.name}，${student.note}`)
                                .join("\n"),
                              `${group.label}名单`,
                            );
                          }}
                          onKeyDown={(event) => {
                            event.stopPropagation();
                          }}
                          className="flex size-8 items-center justify-center rounded-[8px] bg-[#F5F3F0] text-[var(--jp-text-secondary)] transition-[transform,background-color,box-shadow,color] duration-200 hover:-translate-y-[1px] hover:bg-[#FBF7F1] hover:text-[#1E3A5F] hover:shadow-[0_10px_18px_rgba(28,28,28,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jp-accent)]/20 active:translate-y-0"
                          aria-label={`复制${group.label}名单`}
                        >
                          <Copy className="size-4" />
                        </button>
                      </div>
                    </div>

                    {collapsed ? null : (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {group.students.map((student) => (
                          <article
                            key={student.id}
                            className={cn(
                              "flex min-h-[110px] flex-col rounded-[14px] border p-2.5 shadow-[0_8px_18px_rgba(28,28,28,0.03)] transition-[border-color,background-color,box-shadow] duration-200",
                              student.managerUpdated
                                ? "border-[#E59A52] bg-[#FFFDF8]"
                                : "border-[#E8E5E0] bg-white",
                            )}
                          >
                            <div className="space-y-1.5">
                              <p className="text-[13px] font-semibold text-[var(--jp-text)]">{student.name}</p>
                              <p className="line-clamp-2 text-[10px] leading-[1.45] text-[var(--jp-text-secondary)]">
                                {student.note}
                              </p>
                            </div>
                            <label
                              className={cn(
                                "relative mt-auto block rounded-[8px]",
                                student.managerUpdated
                                  ? "bg-[#FFF4EA] text-[#9A5A1F]"
                                  : student.status === "present"
                                    ? "bg-[#EAF2EC] text-[#3D6B4F]"
                                    : student.status === "leave"
                                      ? "bg-[#ECE8E1] text-[#1C1C1C]"
                                      : "bg-[#FCEBEC] text-[#D32F2F]",
                              )}
                            >
                              <select
                                aria-label={`${student.name} 点名状态`}
                                value={toSelectableStatus(student.status)}
                                disabled={isSaving}
                                onChange={(event) =>
                                  handleStatusChange(
                                    group.id,
                                    student.id,
                                    event.target.value as AttendanceStatus,
                                  )
                                }
                                className="h-9 w-full appearance-none rounded-[8px] bg-transparent px-2 pr-7 text-[11px] font-medium outline-none"
                              >
                                <option value="present">已到</option>
                                <option value="leave">请假</option>
                                <option value="absent">未到</option>
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2" />
                            </label>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>

        <MobileTabBar active="attendance" items={buildAdminTabItems(campus)} />
      </div>
    </PageShell>
  );
}

function SummaryBadge({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "info" | "success" | "neutral" | "danger" | "dangerSoft";
}) {
  const toneClass = {
    info: "bg-[#EEF3F8] text-[#1E3A5F]",
    success: "bg-[#EAF2EC] text-[#3D6B4F]",
    neutral: "bg-[#F5F3F0] text-[var(--jp-text-secondary)]",
    danger: "bg-[#FCEBEC] text-[#C84A4A]",
    dangerSoft: "bg-[#FFF2E8] text-[#B96B1E]",
  }[tone];

  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5", toneClass)}>
      <span className="text-[11px] font-medium">{label}</span>
      <span className="text-[12px] font-semibold">{value}</span>
    </div>
  );
}
