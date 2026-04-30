"use client";

import { useEffect, useMemo, useState } from "react";

import { SearchField } from "@/components/app/search-field";
import { StaticLink } from "@/components/app/static-link";
import { Button } from "@/components/ui/button";
import { withCampusQuery } from "@/lib/admin-campus";
import type { AdminCourseSettingsData } from "@/lib/domain/types";
import { mapAdminCourseSettingsData } from "@/lib/services/mobile-adapters";
import {
  fetchAdminCourseSettingsOverviewClient,
  updateAdminCourseSettingsRule,
} from "@/lib/services/mobile-client";
import { cn } from "@/lib/utils";

type Props = {
  data: AdminCourseSettingsData;
  campus: string;
  onDataChange?: (data: AdminCourseSettingsData) => void;
};

export function AdminCourseSettingsClient({ data, campus, onDataChange }: Props) {
  const [viewData, setViewData] = useState(data);
  const [searchQuery, setSearchQuery] = useState("");
  const [isActing, setIsActing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setViewData(data);
  }, [data]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const selectedModeId = viewData.modes.find((mode) => mode.active)?.id ?? "default";
  const visibleCourses = useMemo(
    () =>
      normalizedQuery
        ? viewData.courses.filter((course) =>
            `${course.title} ${course.meta} ${course.badgeLabel}`
              .toLowerCase()
              .includes(normalizedQuery),
          )
        : viewData.courses,
    [normalizedQuery, viewData.courses],
  );

  async function applyOverviewAction(
    runner: () => Promise<Awaited<ReturnType<typeof fetchAdminCourseSettingsOverviewClient>>>,
    successMessage: string,
    fallbackMessage: string,
  ) {
    setIsActing(true);
    setMessage("");

    try {
      const overview = await runner();
      const nextData = mapAdminCourseSettingsData({
        overview,
      });
      setViewData(nextData);
      onDataChange?.(nextData);
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : fallbackMessage);
    } finally {
      setIsActing(false);
    }
  }

  async function handleUseDefaultRule() {
    await applyOverviewAction(
      () =>
        updateAdminCourseSettingsRule({
          ruleMode: "DEFAULT_DAY",
        }),
      "已切换为默认行课规则",
      "切换失败，请稍后重试",
    );
  }

  async function handleRefresh() {
    await applyOverviewAction(
      () => fetchAdminCourseSettingsOverviewClient(),
      "当前课程设置已同步接口",
      "同步失败，请稍后重试",
    );
  }

  return (
    <div className="space-y-2.5 px-5 pt-2.5">
      <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
        <p className="text-sm font-semibold text-[var(--jp-text)]">{viewData.ruleTitle}</p>
        <div
          className={cn(
            "mt-2 grid gap-2",
            viewData.modes.length > 1 ? "grid-cols-2" : "grid-cols-1",
          )}
        >
          {viewData.modes.map((mode) => {
            const modeClassName = cn(
              "rounded-[12px] px-3 py-3 text-left text-[13px] font-medium",
              selectedModeId === mode.id
                ? "bg-[#1E3A5F] text-white"
                : "border border-[#E8E5E0] bg-[#F5F3F0] text-[var(--jp-text)]",
              (mode.disabled || isActing) && "pointer-events-none opacity-60",
            );

            if (mode.id === "alternate" && mode.href) {
              return (
                <StaticLink
                  key={mode.id}
                  href={withCampusQuery(mode.href, campus)}
                  className={modeClassName}
                >
                  {mode.label}
                </StaticLink>
              );
            }

            return (
              <button
                key={mode.id}
                type="button"
                disabled={mode.disabled || isActing || selectedModeId === mode.id}
                onClick={handleUseDefaultRule}
                className={cn(
                  modeClassName,
                  (mode.disabled || isActing || selectedModeId === mode.id) &&
                    "cursor-not-allowed",
                )}
              >
                {mode.label}
              </button>
            );
          })}
        </div>

        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={viewData.searchPlaceholder}
          className="mt-3 h-[42px]"
        />
      </section>

      <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--jp-text)]">{viewData.sectionTitle}</h2>
          {viewData.temporaryActionHref && !viewData.temporaryActionDisabled ? (
            <StaticLink
              href={withCampusQuery(viewData.temporaryActionHref, campus)}
              className="rounded-[10px] bg-[#1E3A5F] px-3 py-2 text-[11px] font-semibold text-white"
            >
              {viewData.temporaryActionLabel}
            </StaticLink>
          ) : (
            <button
              type="button"
              disabled={viewData.temporaryActionDisabled || isActing}
              className={cn(
                "rounded-[10px] px-3 py-2 text-[11px] font-semibold",
                viewData.temporaryActionDisabled
                  ? "cursor-not-allowed bg-[#C9D4E2] text-white/90"
                  : "bg-[#1E3A5F] text-white",
              )}
            >
              {viewData.temporaryActionLabel}
            </button>
          )}
        </div>

        {viewData.courses.length === 0 ? (
          <div className="mt-3 rounded-[14px] border border-dashed border-[#D8D5D0] px-4 py-8 text-center text-[13px] text-[var(--jp-text-muted)]">
            当前还没有今日生效课程
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {visibleCourses.map((course) => {
              const subtitle = [
                course.locationLabel ?? "地点待定",
                course.teacherLabel ?? "待分配老师",
                typeof course.studentCount === "number" ? `${course.studentCount} 人` : null,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <article
                  key={course.id}
                  className={cn(
                    "rounded-[14px] border bg-white p-3 shadow-[0_8px_18px_rgba(28,28,28,0.03)]",
                    course.badgeTone === "temporary"
                      ? "border-[#F2DEC2] bg-[#FFFDF8]"
                      : "border-[#E8E5E0]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "min-w-0 flex-1 text-sm font-semibold leading-6",
                            course.badgeTone === "temporary"
                              ? "text-[var(--jp-accent)]"
                              : "text-[var(--jp-text)]",
                          )}
                        >
                          {course.title}
                        </p>
                        {course.badgeTone === "temporary" ? (
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                              "bg-[#FFF4EA] text-[var(--jp-accent)]",
                            )}
                          >
                            {course.badgeLabel}
                          </span>
                        ) : null}
                      </div>

                      <p className="truncate text-[11px] leading-5 text-[var(--jp-text-secondary)]">
                        {subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <StaticLink
                      href={withCampusQuery(course.rosterHref, campus)}
                      className="inline-flex h-8 items-center justify-center rounded-[10px] border border-[#E8E5E0] bg-white text-[11px] font-semibold text-[var(--jp-text-secondary)]"
                    >
                      进入学生名单
                    </StaticLink>

                    {course.secondaryActionHref && !course.secondaryActionDisabled ? (
                      <StaticLink
                        href={withCampusQuery(course.secondaryActionHref, campus)}
                        className={cn(
                          "inline-flex h-8 items-center justify-center rounded-[10px] text-[11px] font-semibold",
                          course.secondaryActionTone === "accent"
                            ? "bg-[var(--jp-accent)] text-white"
                            : "border border-[#E8E5E0] bg-white text-[var(--jp-text-secondary)]",
                        )}
                      >
                        {course.secondaryActionLabel}
                      </StaticLink>
                    ) : (
                      <Button
                        disabled={course.secondaryActionDisabled}
                        className={cn(
                          "h-8 rounded-[10px] text-[11px] font-semibold",
                          course.secondaryActionTone === "accent"
                            ? "bg-[var(--jp-accent)] text-white hover:bg-[var(--jp-accent)]/90"
                            : "border border-[#E8E5E0] bg-white text-[var(--jp-text-secondary)] hover:bg-white",
                          course.secondaryActionDisabled &&
                            "cursor-not-allowed border-[#D8D5D0] bg-[#F5F3F0] text-[var(--jp-text-muted)] hover:bg-[#F5F3F0]",
                        )}
                      >
                        {course.secondaryActionLabel}
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}

            {visibleCourses.length === 0 ? (
              <div className="rounded-[14px] border border-dashed border-[#D8D5D0] px-4 py-6 text-center text-[13px] text-[var(--jp-text-muted)]">
                未找到匹配的课程
              </div>
            ) : null}
          </div>
        )}

        {viewData.saveDescription ? (
          <p className="mt-3 text-[11px] leading-5 text-[var(--jp-text-secondary)]">
            {viewData.saveDescription}
          </p>
        ) : null}

        {message ? (
          <p className="mt-3 text-[12px] font-medium text-[#1E3A5F]">{message}</p>
        ) : null}

        <Button
          type="button"
          onClick={handleRefresh}
          disabled={viewData.saveDisabled || isActing}
          className={cn(
            "mt-3 h-10 w-full rounded-[10px] text-xs font-semibold",
            viewData.saveDisabled || isActing
              ? "cursor-not-allowed bg-[#C9D4E2] text-white/90 hover:bg-[#C9D4E2]"
              : "bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90",
          )}
        >
          {isActing ? "同步中..." : viewData.saveLabel}
        </Button>
      </section>
    </div>
  );
}
