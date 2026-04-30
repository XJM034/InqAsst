"use client";

import { ChevronRight } from "lucide-react";

import { AdminRefreshWarning } from "@/components/app/admin-refresh-warning";
import { SearchField } from "@/components/app/search-field";
import { StaticLink } from "@/components/app/static-link";
import { Button } from "@/components/ui/button";
import type {
  AdminEmergencyCourse,
  AdminEmergencyData,
  AdminEmergencyDayKey,
} from "@/lib/domain/types";
import { normalizePhoneForDisplay } from "@/lib/utils/phone";

type Props = {
  data: AdminEmergencyData;
  loading?: boolean;
  isRefreshing?: boolean;
  refreshError?: string;
  searchQuery: string;
  batchMode?: boolean;
  selectedSessionIds?: string[];
  onSearchQueryChange: (value: string) => void;
  onDayChange: (dayKey: AdminEmergencyDayKey) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onToggleBatchMode?: () => void;
  onToggleCourseSelection?: (course: AdminEmergencyCourse) => void;
  onOpenBatchPanel?: () => void;
};

export function withSelectedEmergencyDay(
  data: AdminEmergencyData,
  selectedDayKey: AdminEmergencyDayKey,
): AdminEmergencyData {
  return {
    ...data,
    selectedDayKey,
    days: data.days.map((day) => ({
      ...day,
      active: day.key === selectedDayKey,
    })),
  };
}

export function buildEmergencyCoursesLoadingLabel(
  data: Pick<AdminEmergencyData, "days" | "selectedDayKey">,
) {
  const activeDayLabel = resolveSelectedEmergencyDayLabel(data);

  return activeDayLabel ? `正在切换到${activeDayLabel}课程...` : "课程加载中...";
}

export function resolveSelectedEmergencyDayLabel(
  data: Pick<AdminEmergencyData, "days" | "selectedDayKey">,
) {
  const activeDay =
    data.days.find((day) => day.key === data.selectedDayKey) ??
    data.days.find((day) => day.active);

  return activeDay?.label ?? "";
}

export function buildEmergencyBatchSelectionHint(selectedCount: number) {
  if (selectedCount <= 0) {
    return "勾选同一天内需要一起调整的课节";
  }

  if (selectedCount === 1) {
    return "至少再选 1 节课后才能进入批量互换";
  }

  return `已选 ${selectedCount} 节课，可以进入批量互换`;
}

function CourseBadge({
  teacherChanged,
  temporaryTeacherAssigned,
}: {
  teacherChanged?: boolean;
  temporaryTeacherAssigned?: boolean;
}) {
  if (!teacherChanged && !temporaryTeacherAssigned) {
    return null;
  }

  const label = temporaryTeacherAssigned ? "代课" : "已调整";
  const tone = temporaryTeacherAssigned
    ? "border-[#F2DEC2] bg-[#FFF3E0] text-[#A55B14]"
    : "border-[#D6E4F1] bg-[#EEF4FA] text-[#1E3A5F]";

  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center rounded-full border px-2.5 text-[11px] font-semibold ${tone}`}
    >
      {label}
    </span>
  );
}

function CourseSelectionBadge({ selected }: { selected: boolean }) {
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center rounded-full border px-2.5 text-[11px] font-semibold ${
        selected
          ? "border-[#D6E4F1] bg-[#EEF4FA] text-[#1E3A5F]"
          : "border-[#E8E5E0] bg-white text-[var(--jp-text-secondary)]"
      }`}
    >
      {selected ? "已选择" : "选择"}
    </span>
  );
}

function CourseCard({
  course,
  batchMode = false,
  selected = false,
  onSelect,
}: {
  course: AdminEmergencyCourse;
  batchMode?: boolean;
  selected?: boolean;
  onSelect?: (course: AdminEmergencyCourse) => void;
}) {
  const currentTeacherName = course.currentTeacherName ?? "待分配老师";
  const currentTeacherPhone = normalizePhoneForDisplay(course.currentTeacherPhone);
  const locationLine = course.locationLabel ?? "地点待定";
  const courseInfoLine = [course.title, locationLine].filter(Boolean).join(" · ");

  const cardContent = (
    <div className="min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex flex-wrap items-end gap-x-2 gap-y-1">
          <p className="truncate text-[17px] font-bold leading-none text-[var(--jp-text)]">
            {currentTeacherName}
          </p>
          {currentTeacherPhone ? (
            <p className="text-[12px] font-semibold leading-none text-[var(--jp-text-secondary)]">
              {currentTeacherPhone}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <CourseBadge
            teacherChanged={course.teacherChanged}
            temporaryTeacherAssigned={course.temporaryTeacherAssigned}
          />
          {batchMode ? <CourseSelectionBadge selected={selected} /> : null}
        </div>
      </div>

      <div className="mt-2 min-w-0">
        {courseInfoLine ? (
          <p className="truncate text-[12px] leading-[1.4] text-[var(--jp-text-secondary)]">
            {courseInfoLine}
          </p>
        ) : null}
        {batchMode && course.sessionTimeLabel ? (
          <p className="mt-1 text-[11px] font-medium text-[var(--jp-text-muted)]">
            {course.sessionTimeLabel}
          </p>
        ) : null}
      </div>
    </div>
  );

  if (batchMode) {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(course)}
        className={`block w-full rounded-[14px] border px-4 py-3.5 text-left shadow-[0_8px_18px_rgba(28,28,28,0.03)] ${
          selected
            ? "border-[#D4E1EF] bg-[#F7FBFF]"
            : "border-[#E8E5E0] bg-white"
        }`}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <StaticLink
      href={course.href}
      className="block rounded-[14px] border border-[#E8E5E0] bg-white px-4 py-3.5 shadow-[0_8px_18px_rgba(28,28,28,0.03)]"
    >
      {cardContent}
    </StaticLink>
  );
}

function FeaturedTeacherCard({
  course,
  batchMode = false,
  selected = false,
  onSelect,
}: {
  course: AdminEmergencyCourse;
  batchMode?: boolean;
  selected?: boolean;
  onSelect?: (course: AdminEmergencyCourse) => void;
}) {
  const currentTeacherName = course.currentTeacherName ?? "待分配老师";
  const currentTeacherPhone = normalizePhoneForDisplay(course.currentTeacherPhone);
  const originalTeacherName = course.defaultTeacherName ?? "待确认";
  const originalTeacherPhone = normalizePhoneForDisplay(course.defaultTeacherPhone);
  const courseInfo = [course.locationLabel, course.sessionTimeLabel].filter(Boolean).join(" · ");

  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-[#FFE7C8] px-2 text-[10px] font-semibold text-[#A55B14]">
              代课中
            </span>
            <p className="truncate text-[12px] font-semibold text-[var(--jp-text-secondary)]">
              {course.title}
            </p>
          </div>

          <div className="mt-2.5 flex flex-wrap items-end gap-x-2 gap-y-1">
            <p className="text-[22px] font-black leading-none tracking-[-0.04em] text-[#7D4314]">
              {currentTeacherName}
            </p>
            {currentTeacherPhone ? (
              <p className="text-[13px] font-semibold leading-none text-[#A55B14]">
                {currentTeacherPhone}
              </p>
            ) : null}
          </div>
        </div>

        {batchMode ? (
          <CourseSelectionBadge selected={selected} />
        ) : (
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#1E3A5F]">
            <span>设置</span>
            <ChevronRight className="size-3.5" />
          </div>
        )}
      </div>

      <div className="mt-3 grid gap-2 rounded-[12px] border border-[#F6E8D1] bg-white/88 px-3 py-2.5">
        <div className="flex items-start gap-2">
          <span className="inline-flex shrink-0 items-center rounded-full bg-[#F5F3F0] px-2 py-0.5 text-[10px] font-semibold text-[var(--jp-text-muted)]">
            原上课老师
          </span>
          <p className="min-w-0 text-[12px] font-medium leading-[1.5] text-[var(--jp-text)]">
            {originalTeacherName}
            {originalTeacherPhone ? ` · ${originalTeacherPhone}` : ""}
          </p>
        </div>

        <div className="flex items-start gap-2">
          <span className="inline-flex shrink-0 items-center rounded-full bg-[#FFF2DE] px-2 py-0.5 text-[10px] font-semibold text-[#B06A1F]">
            课程信息
          </span>
          <p className="min-w-0 text-[12px] font-medium leading-[1.5] text-[var(--jp-text)]">
            {courseInfo || course.meta}
          </p>
        </div>
      </div>
    </>
  );

  if (batchMode) {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(course)}
        className={`block w-full rounded-[16px] border p-3.5 text-left shadow-[0_10px_22px_rgba(196,106,26,0.08)] ${
          selected
            ? "border-[#D9C7AA] bg-[linear-gradient(180deg,#FFF8EA_0%,#FFF2DE_100%)]"
            : "border-[#F2DEC2] bg-[linear-gradient(180deg,#FFFDF8_0%,#FFF6E8_100%)]"
        }`}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <StaticLink
      href={course.href}
      className="block rounded-[16px] border border-[#F2DEC2] bg-[linear-gradient(180deg,#FFFDF8_0%,#FFF6E8_100%)] p-3.5 shadow-[0_10px_22px_rgba(196,106,26,0.08)]"
    >
      {cardContent}
    </StaticLink>
  );
}

export function AdminEmergencyClient({
  data,
  loading = false,
  isRefreshing = false,
  refreshError = "",
  searchQuery,
  batchMode = false,
  selectedSessionIds = [],
  onSearchQueryChange,
  onDayChange,
  onPrevPage,
  onNextPage,
  onToggleBatchMode,
  onToggleCourseSelection,
  onOpenBatchPanel,
}: Props) {
  const showCourseLoadingState = loading || isRefreshing;
  const selectedDayLabel = resolveSelectedEmergencyDayLabel(data);
  const courseLoadingLabel = buildEmergencyCoursesLoadingLabel(data);
  const totalPagesLabel = Math.max(data.courses.totalPages, 1);
  const selectedSessionIdSet = new Set(selectedSessionIds);
  const selectionHint = buildEmergencyBatchSelectionHint(selectedSessionIds.length);
  const canOpenBatchPanel = selectedSessionIds.length >= 2;

  return (
    <>
      <section className="mx-5 mt-2.5 rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {data.days.map((day) => (
            <button
              key={day.key}
              type="button"
              onClick={() => onDayChange(day.key)}
              className={`flex min-h-9 items-center justify-center rounded-full border px-2 py-2 text-center text-xs font-semibold ${
                day.key === data.selectedDayKey
                  ? "border-transparent bg-[#1E3A5F] text-white"
                  : "border-[#E8E5E0] bg-[#F5F3F0] text-[var(--jp-text)]"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>

        <SearchField
          value={searchQuery}
          onChange={onSearchQueryChange}
          placeholder="搜索课程名 / 默认负责老师"
          className="mt-3 h-[42px]"
        />
      </section>

      {refreshError ? (
        <AdminRefreshWarning className="mx-5 mt-2.5" message={refreshError} />
      ) : null}

      {loading ? (
        <section className="mx-5 mt-2.5 rounded-[16px] border border-[#F2DEC2] bg-[#FFF7EA] p-3 shadow-[0_10px_22px_rgba(196,106,26,0.08)]">
          <div className="h-5 w-32 animate-pulse rounded bg-[#F4E7D2]" />
          <div className="mt-3 rounded-[16px] border border-[#F2DEC2] bg-white p-3.5">
            <div className="flex items-start justify-between gap-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-14 animate-pulse rounded-full bg-[#FFE7C8]" />
                  <div className="h-3 w-28 animate-pulse rounded bg-[#F5F3F0]" />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-[#FFE7C8]" />
                  <div className="h-7 w-36 animate-pulse rounded bg-[#F3E3CF]" />
                  <div className="h-4 w-28 animate-pulse rounded bg-[#F5E7D4]" />
                </div>
              </div>
              <div className="h-7 w-16 animate-pulse rounded-full bg-white/90" />
            </div>
            <div className="mt-3 space-y-2 rounded-[12px] border border-[#F6E8D1] bg-white/88 px-3 py-2.5">
              <div className="h-4 w-full animate-pulse rounded bg-[#F5F3F0]" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-[#F8EEDC]" />
            </div>
          </div>
        </section>
      ) : data.featuredCourses.length > 0 ? (
        <section className="mx-5 mt-2.5 rounded-[16px] border border-[#F2DEC2] bg-[#FFF7EA] p-3 shadow-[0_10px_22px_rgba(196,106,26,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-base font-bold text-[var(--jp-text)]">今日代课老师</h1>
              <p className="text-[11px] font-medium text-[var(--jp-text-secondary)]">
                {data.featuredDateLabel} · 共 {data.featuredCourses.length} 节
              </p>
            </div>
            {isRefreshing ? (
              <span className="text-[11px] font-medium text-[var(--jp-text-muted)]">
                更新中...
              </span>
            ) : null}
          </div>
          <div className={isRefreshing ? "opacity-80" : undefined}>
            <div className="mt-3 space-y-3">
              {data.featuredCourses.map((course) => (
                <FeaturedTeacherCard
                  key={`${course.courseId}:${course.sessionId}`}
                  course={course}
                  batchMode={batchMode}
                  selected={selectedSessionIdSet.has(course.sessionId)}
                  onSelect={onToggleCourseSelection}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-5 mt-3 rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-bold text-[var(--jp-text)]">
              {selectedDayLabel ? `${selectedDayLabel}上课老师` : "当日上课老师"}
            </h2>
            {batchMode ? (
              <p className="mt-1 text-[11px] font-medium text-[var(--jp-text-muted)]">
                {selectionHint}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {isRefreshing && !loading ? (
              <span className="text-[11px] font-medium text-[var(--jp-text-muted)]">
                {courseLoadingLabel}
              </span>
            ) : loading ? null : (
              <span className="text-[11px] text-[var(--jp-text-muted)]">
                共 {data.courses.totalElements} 条
              </span>
            )}
            {!loading && onToggleBatchMode ? (
              <Button
                type="button"
                variant={batchMode ? "outline" : "default"}
                onClick={onToggleBatchMode}
              >
                {batchMode ? "取消批量" : "批量互换老师"}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-3 space-y-3">
          {showCourseLoadingState
            ? Array.from({ length: 3 }, (_, index) => (
                <div
                  key={`loading-${index}`}
                  className="rounded-[14px] border border-[#E8E5E0] bg-white px-4 py-3.5 shadow-[0_8px_18px_rgba(28,28,28,0.03)]"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-28 animate-pulse rounded bg-[#F4F1EB]" />
                      <div className="h-5 w-10 animate-pulse rounded-full bg-[#EEF4FA]" />
                    </div>
                    <div className="h-3 w-44 animate-pulse rounded bg-[#F5F3F0]" />
                  </div>
                </div>
              ))
            : null}
          {!showCourseLoadingState
            ? data.courses.items.map((course) => (
                <CourseCard
                  key={`${course.courseId}:${course.sessionId}`}
                  course={course}
                  batchMode={batchMode}
                  selected={selectedSessionIdSet.has(course.sessionId)}
                  onSelect={onToggleCourseSelection}
                />
              ))
            : null}
          {!showCourseLoadingState && data.courses.items.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-[#D8D5D0] px-4 py-6 text-center text-[13px] text-[var(--jp-text-muted)]">
              未找到匹配的课程
            </div>
          ) : null}
        </div>

        {showCourseLoadingState ? null : (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#F0ECE6] pt-3">
            <p className="text-[11px] text-[var(--jp-text-muted)]">
              第 {data.courses.page + 1} / {totalPagesLabel} 页
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPrevPage}
                disabled={!data.courses.hasPrevPage}
                className="flex h-9 min-w-[76px] items-center justify-center rounded-full border border-[#E8E5E0] bg-[#F5F3F0] px-4 text-xs font-semibold text-[var(--jp-text)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                上一页
              </button>
              <button
                type="button"
                onClick={onNextPage}
                disabled={!data.courses.hasNextPage}
                className="flex h-9 min-w-[76px] items-center justify-center rounded-full bg-[#1E3A5F] px-4 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#AAB7C8]"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </section>

      {batchMode && onOpenBatchPanel ? (
        <section className="mx-5 mt-3 rounded-[16px] border border-[#D4E1EF] bg-[#EEF4FA] p-3.5 shadow-[0_10px_22px_rgba(30,58,95,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-bold text-[#1E3A5F]">
                已选 {selectedSessionIds.length} 节课
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#56718D]">
                支持同时间段环状互换，也支持同一天内同一老师接多个不重叠课节。
              </p>
            </div>
            <Button type="button" disabled={!canOpenBatchPanel} onClick={onOpenBatchPanel}>
              下一步
            </Button>
          </div>
        </section>
      ) : null}
    </>
  );
}
