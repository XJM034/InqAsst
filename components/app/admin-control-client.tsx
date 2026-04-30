"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import { AdminAttendanceHeaderTicker } from "@/components/app/admin-attendance-header-ticker";
import {
  ADMIN_ATTENDANCE_COPY_FEEDBACK_LABELS,
  ADMIN_ATTENDANCE_COPY_LABELS,
  AdminAttendanceTopTools,
} from "@/components/app/admin-attendance-top-tools";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { StaticLink } from "@/components/app/static-link";
import { buildAdminAttendanceTabs, buildAdminTabItems, withCampusQuery } from "@/lib/admin-campus";
import { buildAdminAttendanceSubtitle } from "@/lib/admin-attendance-header";
import type { AdminControlData } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

type AdminControlClientProps = {
  data: AdminControlData;
  campus: string;
};

const CONTROL_STATE_PRIORITY: Record<AdminControlData["classes"][number]["state"], number> = {
  pending: 0,
  partial: 1,
  done: 2,
};

const CONTROL_STATE_STYLES = {
  pending: {
    card: "border-[#F1D6C0] bg-[#FFF9F3]",
    badge: "bg-[#FFF0E4] text-[#B4631A]",
    progress: "bg-[#D57A2B]",
  },
  partial: {
    card: "border-[#E8DFC9] bg-[#FFFCF7]",
    badge: "bg-[#FFF4E8] text-[#A8631F]",
    progress: "bg-[#C98332]",
  },
  done: {
    card: "border-[#DCE6DA] bg-[#FBFDF9]",
    badge: "bg-[#EAF2EC] text-[#3D6B4F]",
    progress: "bg-[#3D6B4F]",
  },
} as const;

function getControlStateLabel(state: AdminControlData["classes"][number]["state"]) {
  if (state === "done") {
    return "已完成";
  }

  if (state === "partial") {
    return "进行中";
  }

  return "待点名";
}

function getControlStateHint(item: AdminControlData["classes"][number]) {
  if (item.kind === "merge") {
    return item.description ?? "这是合班点名任务，由一名老师统一提交。";
  }

  if (item.state === "done") {
    return "已提交点名，可核对未到学生。";
  }

  if (item.state === "partial") {
    return "正在同步进度，建议优先跟进。";
  }

  return "老师未提交点名，建议先确认。";
}

function buildControlHeadline(data: AdminControlData) {
  if (data.classes.length === 0) {
    return "今天暂无待跟进课程";
  }

  if (data.unfinishedCount === 0) {
    return "所有课程已完成点名";
  }

  return `当前共 ${data.unfinishedCount} 门课程未完成点名`;
}

export function AdminControlClient({ data, campus }: AdminControlClientProps) {
  const [feedback, setFeedback] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback(`${label}已复制`);
    } catch {
      setFeedback("当前环境不支持自动复制");
    }
  }

  const orderedClasses = useMemo(
    () =>
      [...data.classes].sort((left, right) => {
        const priorityDiff =
          CONTROL_STATE_PRIORITY[left.state] - CONTROL_STATE_PRIORITY[right.state];

        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        if (left.completion !== right.completion) {
          return left.completion - right.completion;
        }

        return left.name.localeCompare(right.name, "zh-CN");
      }),
    [data.classes],
  );

  const unfinishedCourseText = orderedClasses
    .filter((item) => item.state !== "done")
    .map((item) => item.name)
    .join("\n");

  const unfinishedDetailText = orderedClasses
    .filter((item) => item.state !== "done")
    .map((item) => `${item.name} / ${item.teacher}`)
    .join("\n");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleClasses = useMemo(
    () =>
      normalizedQuery
        ? orderedClasses.filter((item) =>
            `${item.name} ${item.teacher}`.toLowerCase().includes(normalizedQuery),
          )
        : orderedClasses,
    [normalizedQuery, orderedClasses],
  );
  const subtitle = useMemo(() => buildAdminAttendanceSubtitle(data, now), [data, now]);
  const controlHeadline = buildControlHeadline(data);
  const priorityClasses = visibleClasses.filter((item) => item.state !== "done");
  const finishedClasses = visibleClasses.filter((item) => item.state === "done");
  const visibleFinishedCount = finishedClasses.length;
  const visibleUnfinishedCount = priorityClasses.length;
  const emptyTitle = normalizedQuery ? "未找到匹配的课程或老师" : "今天还没有需要跟进的课程";
  const emptyDescription = normalizedQuery
    ? "换个课程名或老师名再试试。"
    : "点名提交后，总控进度会第一时间出现在这里。";

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll px-5 pt-4">
          <section className="rounded-[20px] border border-[#E8E2D8] bg-[linear-gradient(180deg,#FFFCF8_0%,#FFFFFF_34%,#FFFFFF_100%)] p-4 shadow-[0_14px_28px_rgba(28,28,28,0.05)]">
            <div className="min-w-0">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold tracking-[0.06em] text-[#8C7961]">
                  课程管理
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
              <SummaryBadge label="已完成" value={visibleFinishedCount} tone="success" />
              <SummaryBadge label="未完成" value={visibleUnfinishedCount} tone="danger" />
            </div>
          </section>

          <AdminAttendanceTopTools
            summaryItems={[]}
            actions={[
              {
                label: ADMIN_ATTENDANCE_COPY_LABELS.courses,
                onClick: () =>
                  copyText(unfinishedCourseText, ADMIN_ATTENDANCE_COPY_FEEDBACK_LABELS.courses),
                disabled: !unfinishedCourseText,
              },
              {
                label: ADMIN_ATTENDANCE_COPY_LABELS.details,
                onClick: () =>
                  copyText(unfinishedDetailText, ADMIN_ATTENDANCE_COPY_FEEDBACK_LABELS.details),
                disabled: !unfinishedDetailText,
              },
            ]}
            tabs={buildAdminAttendanceTabs(campus, "control")}
            searchPlaceholder="搜索课程名称、老师或手机号"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {feedback ? (
            <p className="mt-3 inline-flex rounded-full bg-[#EEF3F8] px-3 py-1 text-[11px] font-medium text-[#1E3A5F]">
              {feedback}
            </p>
          ) : null}

          {visibleClasses.length === 0 ? (
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
              ) : (
                <StaticLink
                  href={withCampusQuery("/admin/unarrived", campus)}
                  className="mt-4 inline-flex rounded-full bg-[#EEF3F8] px-3 py-1.5 text-[11px] font-semibold text-[#1E3A5F]"
                >
                  查看未到学生管理
                </StaticLink>
              )}
            </div>
          ) : (
            <div className="mt-3.5 space-y-4">
              {priorityClasses.length > 0 ? (
                <section className="space-y-2.5">
                  {finishedClasses.length > 0 ? (
                    <SectionHeading label="优先跟进" count={priorityClasses.length} tone="warm" />
                  ) : null}
                  <div className="space-y-3">
                    {priorityClasses.map((item) => (
                      <PriorityClassCard key={item.id} item={item} campus={campus} />
                    ))}
                  </div>
                </section>
              ) : null}

              {finishedClasses.length > 0 ? (
                <section className="space-y-2.5">
                  <SectionHeading
                    label={priorityClasses.length > 0 ? "已完成课程" : "今日课程"}
                    count={finishedClasses.length}
                    tone="calm"
                  />
                  <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
                    {finishedClasses.map((item) => (
                      <FinishedClassCard key={item.id} item={item} campus={campus} />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </div>

        <MobileTabBar active="attendance" items={buildAdminTabItems(campus)} />
      </div>
    </PageShell>
  );
}

function SectionHeading({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "warm" | "calm";
}) {
  const toneClass =
    tone === "warm"
      ? "border-[#EEDBC6] bg-[#FFF7EE] text-[#8C6845]"
      : "border-[#E3E8E8] bg-[#F7FAFA] text-[#63717A]";

  return (
    <div className="flex items-center justify-between gap-3 px-0.5">
      <p className="text-[12px] font-semibold tracking-[0.04em] text-[var(--jp-text-secondary)]">
        {label}
      </p>
      <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold", toneClass)}>
        {count} 门课程
      </span>
    </div>
  );
}

function PriorityClassCard({
  item,
  campus,
}: {
  item: AdminControlData["classes"][number];
  campus: string;
}) {
  const styles = CONTROL_STATE_STYLES[item.state];

  return (
    <StaticLink
      href={withCampusQuery(item.href, campus)}
      className={cn(
        "group block rounded-[16px] border p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_28px_rgba(28,28,28,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jp-accent)]/20 active:translate-y-0",
        styles.card,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {item.badge ? (
              <span className="rounded-[4px] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#3D6B4F] ring-1 ring-[#D7E6DC]">
                {item.badge}
              </span>
            ) : null}
            <p className="min-w-0 text-[14px] font-semibold text-[var(--jp-text)]">
              {item.name}
            </p>
          </div>
          <p className="mt-1 text-[11px] text-[var(--jp-text-secondary)]">{item.teacher}</p>
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", styles.badge)}>
          {getControlStateLabel(item.state)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[12px] font-semibold text-[var(--jp-text)]">{item.progressLabel}</p>
        <p className="text-[11px] text-[var(--jp-text-secondary)]">
          请假 {item.leaveCount} · 未到 {item.absentCount}
        </p>
      </div>

      <div className="mt-2 h-2 rounded-full bg-[#E9E3DA]">
        <div
          className={cn("h-full rounded-full transition-[width] duration-300", styles.progress)}
          style={{ width: `${item.completion}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate whitespace-nowrap text-[11px] leading-5 text-[var(--jp-text-secondary)]">
          {getControlStateHint(item)}
        </p>
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/88 text-[#1E3A5F] shadow-[0_8px_18px_rgba(28,28,28,0.06)] transition-[transform,box-shadow] duration-200 group-hover:-translate-y-[1px] group-hover:shadow-[0_10px_20px_rgba(28,28,28,0.08)] group-focus-visible:-translate-y-[1px]">
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5" />
        </span>
      </div>
    </StaticLink>
  );
}

function FinishedClassCard({
  item,
  campus,
}: {
  item: AdminControlData["classes"][number];
  campus: string;
}) {
  const styles = CONTROL_STATE_STYLES[item.state];

  return (
    <StaticLink
      href={withCampusQuery(item.href, campus)}
      className={cn(
        "group block rounded-[15px] border p-3 shadow-[0_8px_18px_rgba(28,28,28,0.04)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-[1px] hover:shadow-[0_12px_22px_rgba(28,28,28,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jp-accent)]/20 active:translate-y-0",
        styles.card,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {item.badge ? (
            <span className="mb-1 inline-flex rounded-[4px] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#3D6B4F] ring-1 ring-[#D7E6DC]">
              {item.badge}
            </span>
          ) : null}
          <p className="line-clamp-2 text-[13px] font-semibold leading-[1.35] text-[var(--jp-text)]">
            {item.name}
          </p>
        </div>
        <span className={cn("shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold", styles.badge)}>
          {getControlStateLabel(item.state)}
        </span>
      </div>

      <p className="mt-1 text-[11px] text-[var(--jp-text-secondary)]">{item.teacher}</p>

      <div className="mt-3 h-1.5 rounded-full bg-[#E9E3DA]">
        <div
          className={cn("h-full rounded-full transition-[width] duration-300", styles.progress)}
          style={{ width: `${item.completion}%` }}
        />
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-[var(--jp-text)]">{item.progressLabel}</p>
          <p className="mt-1 text-[10px] text-[var(--jp-text-secondary)]">
            请假 {item.leaveCount} · 未到 {item.absentCount}
          </p>
        </div>
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white/82 text-[#1E3A5F] shadow-[0_8px_18px_rgba(28,28,28,0.05)] transition-[transform,box-shadow] duration-200 group-hover:-translate-y-[1px] group-hover:shadow-[0_10px_20px_rgba(28,28,28,0.07)] group-focus-visible:-translate-y-[1px]">
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5" />
        </span>
      </div>
    </StaticLink>
  );
}

function SummaryBadge({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "info" | "success" | "danger" | "dangerSoft";
}) {
  const toneClass = {
    info: "bg-[#EEF3F8] text-[#1E3A5F]",
    success: "bg-[#EAF2EC] text-[#3D6B4F]",
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
