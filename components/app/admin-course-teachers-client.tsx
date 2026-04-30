"use client";

import { AdminRefreshWarning } from "@/components/app/admin-refresh-warning";
import { SearchField } from "@/components/app/search-field";
import type { AdminCourseTeachersData, AdminEmergencyDayKey } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

type AdminCourseTeachersClientProps = {
  data: AdminCourseTeachersData;
  loading?: boolean;
  isRefreshing?: boolean;
  refreshError?: string;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onDayChange: (dayKey: AdminEmergencyDayKey) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export function AdminCourseTeachersClient({
  data,
  loading = false,
  isRefreshing = false,
  refreshError = "",
  searchQuery,
  onSearchQueryChange,
  onDayChange,
  onPrevPage,
  onNextPage,
}: AdminCourseTeachersClientProps) {
  const selectedDayKey = data.selectedDayKey ?? data.defaultDayKey;
  const pageInfo = data.teachersPage ?? {
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: data.teachers.length,
    hasNextPage: false,
    hasPrevPage: false,
  };
  const totalPagesLabel = Math.max(pageInfo.totalPages, 1);

  return (
    <div className="space-y-3.5 px-5 pt-2.5">
      <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {data.days.map((day) => {
            const isSelected = day.key === selectedDayKey;

            return (
              <button
                key={day.key}
                type="button"
                onClick={() => onDayChange(day.key as AdminEmergencyDayKey)}
                className={cn(
                  "flex min-h-9 items-center justify-center rounded-full border px-2 py-2 text-center text-xs font-semibold transition-colors",
                  isSelected
                    ? "border-transparent bg-[#1E3A5F] text-white"
                    : "border-[#E8E5E0] bg-[#F5F3F0] text-[var(--jp-text)]",
                )}
              >
                {day.label}
              </button>
            );
          })}
        </div>

        <SearchField
          value={searchQuery}
          onChange={onSearchQueryChange}
          placeholder={data.searchPlaceholder}
          className="mt-3 h-[42px]"
        />
      </section>

      {refreshError ? <AdminRefreshWarning message={refreshError} /> : null}

      <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
        <div className={cn("space-y-2.5", isRefreshing && !loading && "opacity-80")}>
          {loading
            ? Array.from({ length: 3 }, (_, index) => (
                <div
                  key={`loading-${index}`}
                  className="rounded-[14px] border border-[#E8E5E0] bg-white px-4 py-3.5 shadow-[0_8px_18px_rgba(28,28,28,0.03)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-28 animate-pulse rounded bg-[#F5F3F0]" />
                        <div className="h-5 w-12 animate-pulse rounded-full bg-[#FFF4EA]" />
                      </div>
                      <div className="h-4 w-36 animate-pulse rounded bg-[#F4F1EB]" />
                      <div className="h-3 w-32 animate-pulse rounded bg-[#F5F3F0]" />
                    </div>
                  </div>
                </div>
              ))
            : null}

          {!loading
            ? data.teachers.map((teacher) => {
                const teacherName = teacher.teacherName ?? teacher.label;
                const courseLabel = teacher.courseLabel;
                const metaLine = teacher.locationLabel ?? teacher.note;

                return (
                  <div
                    key={teacher.id}
                    className={cn(
                      "rounded-[14px] border px-4 py-3.5 shadow-[0_8px_18px_rgba(28,28,28,0.03)]",
                      teacher.tone === "substitute"
                        ? "border-[#F2DEC2] bg-[#FFFDF8]"
                        : "border-[#E8E5E0] bg-white",
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-[12px] font-semibold text-[var(--jp-text-secondary)]">
                          {courseLabel ?? "课程老师"}
                        </p>
                        {teacher.tone === "substitute" ? (
                          <span className="shrink-0 rounded-full bg-[#FFF4EA] px-2.5 py-1 text-[10px] font-semibold text-[#9A5A1F]">
                            {teacher.statusLabel ?? "代课老师"}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-end gap-x-2 gap-y-1">
                        <p className="text-[15px] font-bold leading-none text-[var(--jp-text)]">
                          {teacherName}
                        </p>
                        {teacher.teacherPhone ? (
                          <p className="text-[12px] font-semibold leading-none text-[#1E3A5F]">
                            {teacher.teacherPhone}
                          </p>
                        ) : null}
                      </div>

                      <p className="mt-2 truncate text-[11px] leading-5 text-[var(--jp-text-secondary)]">
                        {metaLine}
                      </p>
                    </div>
                  </div>
                );
              })
            : null}

          {!loading && data.teachers.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-[#D8D5D0] px-4 py-6 text-center text-[13px] text-[var(--jp-text-muted)]">
              未找到匹配的课程老师
            </div>
          ) : null}
        </div>

        {loading ? null : (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#F0ECE6] pt-3">
            <p className="text-[11px] text-[var(--jp-text-muted)]">
              第 {pageInfo.page + 1} / {totalPagesLabel} 页
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPrevPage}
                disabled={!pageInfo.hasPrevPage}
                className="flex h-9 min-w-[76px] items-center justify-center rounded-full border border-[#E8E5E0] bg-[#F5F3F0] px-4 text-xs font-semibold text-[var(--jp-text)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                上一页
              </button>
              <button
                type="button"
                onClick={onNextPage}
                disabled={!pageInfo.hasNextPage}
                className="flex h-9 min-w-[76px] items-center justify-center rounded-full bg-[#1E3A5F] px-4 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#AAB7C8]"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
