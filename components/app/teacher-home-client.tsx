"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CircleUserRound,
  MapPin,
  Navigation,
} from "lucide-react";

import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { StaticLink } from "@/components/app/static-link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatAttendanceClockLabel } from "@/lib/admin-attendance-header";
import type {
  TeacherHomeCourseCard,
  TeacherHomeData,
  TeacherHomeSecondaryCourse,
} from "@/lib/domain/types";
import { buildTeacherAttendanceEntryPrompt } from "@/lib/teacher-attendance-entry";

type TeacherHomeClientProps = {
  home: TeacherHomeData;
};

type PendingAction = ReturnType<typeof buildTeacherAttendanceEntryPrompt>;

function buildPendingAction(course: TeacherHomeCourseCard): PendingAction {
  return buildTeacherAttendanceEntryPrompt({
    source: "home",
    attendanceWindowActive: course.attendanceWindowState === "active",
    actionHref: course.actionHref,
    rosterHref: course.rosterHref,
    rollCallStartAt: course.rollCallStartAt,
    referenceSessionStartAt: course.referenceSessionStartAt,
    referenceSessionEndAt: course.referenceSessionEndAt,
  });
}

function buildSecondaryStyles(course?: TeacherHomeSecondaryCourse) {
  if (course?.kind === "merge") {
    return {
      cardBorder: "border-[#CFE0D4]",
      cardShadow: "shadow-[0_10px_22px_rgba(61,107,79,0.07)]",
      headerBg: "bg-[#EEF6F1]",
      bodyBg: "bg-[#FBFEFC]",
      badgeText: "text-[#3D6B4F]",
      metaRing: "ring-[#D7E6DC]",
      locationBorder: "border-[#D7E6DC]",
      locationIcon: "text-[#3D6B4F]",
    };
  }

  if (course?.kind === "substitute") {
    return {
      cardBorder: "border-[#EFD8BB]",
      cardShadow: "shadow-[0_10px_22px_rgba(196,106,26,0.07)]",
      headerBg: "bg-[#FFF5E8]",
      bodyBg: "bg-[#FFFCF7]",
      badgeText: "text-[#A55B14]",
      metaRing: "ring-[#F0E1BD]",
      locationBorder: "border-[#EFD8BB]",
      locationIcon: "text-[#C46A1A]",
    };
  }

  return {
    cardBorder: "border-[#D8E2F0]",
    cardShadow: "shadow-[0_10px_22px_rgba(30,58,95,0.06)]",
    headerBg: "bg-[#F4F8FC]",
    bodyBg: "bg-[#FAFCFE]",
    badgeText: "text-[#1E3A5F]",
    metaRing: "ring-[#D8E2F0]",
    locationBorder: "border-[#D8E2F0]",
    locationIcon: "text-[#1E3A5F]",
  };
}

function splitExpectedMetric(value?: string) {
  const match = value?.trim().match(/^(\S+)\s+(.+)$/);
  if (!match) {
    return null;
  }

  return {
    label: match[1],
    value: match[2],
  };
}

function resolveSecondaryFields(course?: TeacherHomeSecondaryCourse) {
  const parts = course?.description?.split(" | ").map((item) => item.trim()) ?? [];

  return {
    campus: course?.campus ?? parts[0],
    time: course?.time ?? parts.at(-1),
    locationTrail:
      course?.locationTrail ?? (parts.length >= 2 ? parts[1] : parts[0]) ?? "",
  };
}

function buildRollCallTimeLabel(course?: TeacherHomeCourseCard) {
  const startLabel = formatAttendanceClockLabel(course?.rollCallStartAt);
  const endLabel = formatAttendanceClockLabel(course?.rollCallDeadlineAt);

  if (startLabel && endLabel) {
    return `${startLabel}-${endLabel}`;
  }

  if (startLabel) {
    return `${startLabel} 起`;
  }

  return "待设置";
}

type TaskCardStyles = ReturnType<typeof buildSecondaryStyles>;
type ExpectedMetric = ReturnType<typeof splitExpectedMetric>;
type ScheduleFields = ReturnType<typeof resolveSecondaryFields>;
type CourseCardAction = {
  actionLabel: string;
  payload: PendingAction;
};

function getTaskLocationLabel(course: TeacherHomeCourseCard, fields: ScheduleFields) {
  return fields.campus ?? fields.locationTrail ?? course.locationTrail ?? "地点待定";
}

function TaskMetricPill({
  metric,
  expectedLabel,
}: {
  metric: ExpectedMetric;
  expectedLabel?: string;
}) {
  if (metric) {
    return (
      <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px]">
        <span className="font-medium text-[var(--jp-text-secondary)]">
          {metric.label}
        </span>
        <span className="font-bold text-[var(--jp-accent)]">{metric.value}</span>
      </div>
    );
  }

  if (expectedLabel) {
    return (
      <div className="inline-flex shrink-0 items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--jp-text-secondary)]">
        {expectedLabel}
      </div>
    );
  }

  return null;
}

function TaskCourseTitleRow({
  course,
  metric,
  styles,
}: {
  course: TeacherHomeCourseCard;
  metric: ExpectedMetric;
  styles: TaskCardStyles;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`rounded-[4px] bg-white px-2 py-0.5 text-[10px] font-semibold ${styles.badgeText}`}
        >
          {course.badge ?? "代课"}
        </span>
        <p className="truncate text-[15px] font-semibold text-[var(--jp-text)]">
          {course.title}
        </p>
      </div>
      <TaskMetricPill metric={metric} expectedLabel={course.expectedLabel} />
    </div>
  );
}

function TaskLocationHeader({
  locationLabel,
  styles,
}: {
  locationLabel: string;
  styles: TaskCardStyles;
}) {
  return (
    <div className={`flex items-center gap-2 px-3.5 py-3 ${styles.headerBg}`}>
      <MapPin className={`size-4 shrink-0 ${styles.locationIcon}`} />
      <p className="min-w-0 truncate text-base font-semibold text-[var(--jp-text)]">
        {locationLabel}
      </p>
    </div>
  );
}

function TaskCampusPillRow({
  fields,
  styles,
}: {
  fields: ScheduleFields;
  styles: TaskCardStyles;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      {fields.campus ? (
        <span
          className={`rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-[var(--jp-text-secondary)] ring-1 ${styles.metaRing}`}
        >
          {fields.campus}
        </span>
      ) : (
        <div />
      )}
    </div>
  );
}

function StandardCourseCard({
  course,
  action,
  dateLabel,
  rollCallTimeLabel,
  onOpenAction,
  onCardKeyDown,
}: {
  course: TeacherHomeCourseCard;
  action: CourseCardAction;
  dateLabel: string;
  rollCallTimeLabel: string;
  onOpenAction: (payload: PendingAction) => void;
  onCardKeyDown: (event: React.KeyboardEvent<HTMLElement>, payload: PendingAction) => void;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpenAction(action.payload)}
      onKeyDown={(event) => onCardKeyDown(event, action.payload)}
      className="mt-2 cursor-pointer overflow-hidden rounded-[16px] border border-[#E8E5E0] shadow-[0_12px_26px_rgba(28,28,28,0.05)] transition-transform active:scale-[0.99]"
    >
      {course.campus ? (
        <div className="flex items-center gap-2 bg-[#2C2C2C] px-3.5 py-3 text-white">
          <MapPin className="size-4" />
          <p className="text-base font-semibold">{course.campus}</p>
        </div>
      ) : null}
      <div className="space-y-2.5 bg-[var(--jp-surface)] px-3.5 py-3.5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {course.badge ? (
                <span className="rounded-[4px] bg-[#FFF4EA] px-2 py-0.5 text-[10px] font-semibold text-[#A55B14]">
                  {course.badge}
                </span>
              ) : null}
              <p className="truncate text-[16px] font-medium tracking-[-0.02em] text-[var(--jp-text)]">
                {course.title}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-[var(--jp-text-secondary)] ring-1 ring-[color:var(--jp-border)]">
              {dateLabel}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ScheduleMetaCard label="上课时间" value={course.time ?? "待确认"} />
            <ScheduleMetaCard label="点名时间" value={rollCallTimeLabel} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-[12px] border border-[color:var(--jp-border)] bg-white px-3.5 py-2.5">
          <p className="text-[14px] font-semibold tracking-[-0.02em] text-[var(--jp-text)]">
            {course.locationTrail}
          </p>
          <Navigation className="size-5 text-[var(--jp-accent)]" />
        </div>

        <Button
          onClick={(event) => {
            event.stopPropagation();
            onOpenAction(action.payload);
          }}
          className="h-10 w-full rounded-[12px] bg-[var(--jp-accent)] text-[var(--jp-bg)] hover:bg-[var(--jp-accent)]/90"
        >
          {action.actionLabel}
        </Button>
      </div>
    </article>
  );
}

function splitGreetingTone(greeting: string) {
  const suffix = ["早上好", "下午好", "晚上好"].find((item) => greeting.endsWith(item));
  if (!suffix) {
    return {
      name: greeting,
      tone: "",
    };
  }

  return {
    name: greeting.slice(0, -suffix.length),
    tone: suffix,
  };
}

export function TeacherHomeClient({ home }: TeacherHomeClientProps) {
  const [selectedDayKey, setSelectedDayKey] = useState(home.defaultDayKey);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const selectedSchedule = useMemo(
    () => home.daySchedules.find((item) => item.dayKey === selectedDayKey) ?? null,
    [home.daySchedules, selectedDayKey],
  );
  const attendanceTabHref = "/teacher/attendance";

  const primaryAction = selectedSchedule
    ? buildPendingAction(selectedSchedule.primaryCourse)
    : null;
  const primaryCourse = selectedSchedule?.primaryCourse;
  const primaryFields = resolveSecondaryFields(primaryCourse);
  const primaryMetric = splitExpectedMetric(primaryCourse?.expectedLabel);
  const primaryStyles = buildSecondaryStyles(primaryCourse);
  const primaryUsesTaskCard =
    primaryCourse?.kind === "substitute" || primaryCourse?.kind === "merge";
  const primaryTaskUsesLocationFirst = primaryCourse?.kind === "substitute";
  const secondaryCourse = selectedSchedule?.substituteCourse;
  const secondaryAction = secondaryCourse ? buildPendingAction(secondaryCourse) : null;
  const secondaryFields = resolveSecondaryFields(secondaryCourse);
  const secondaryMetric = splitExpectedMetric(secondaryCourse?.expectedLabel);
  const secondaryStyles = buildSecondaryStyles(secondaryCourse);
  const secondaryTaskUsesLocationFirst = secondaryCourse?.kind === "substitute";
  const primaryRollCallTimeLabel = selectedSchedule
    ? buildRollCallTimeLabel(selectedSchedule.primaryCourse)
    : "待设置";
  const secondaryRollCallTimeLabel = buildRollCallTimeLabel(secondaryCourse);
  const secondaryUsesStandardCard = secondaryCourse?.kind === "other";
  const greetingParts = splitGreetingTone(home.greeting);

  function openPendingAction(payload: PendingAction) {
    setPendingAction(payload);
    setDialogOpen(true);
  }

  function handleCardKeyDown(
    event: React.KeyboardEvent<HTMLElement>,
    payload: PendingAction,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPendingAction(payload);
    }
  }

  return (
    <PageShell>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <div className="app-screen">
          <div className="app-scroll px-5 pt-4">
            <header className="rounded-[16px] border border-[#E8E5E0] bg-white px-3.5 py-2.5 shadow-[0_8px_18px_rgba(28,28,28,0.03)]">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#F7F1E8] text-[#8B694B] ring-1 ring-[#E8DBC9]">
                  <CircleUserRound className="size-5.5" />
                </div>
                <div className="min-w-0">
                  <p className="flex max-w-full items-baseline gap-1.5 overflow-hidden whitespace-nowrap leading-5">
                    <span className="truncate text-[13px] font-medium tracking-[0.01em] text-[var(--jp-text)] sm:text-[14px]">
                      {greetingParts.name}
                    </span>
                    {greetingParts.tone ? (
                      <span className="shrink-0 text-[11px] font-medium tracking-[0.14em] text-[#8B694B] sm:text-[12px]">
                        {greetingParts.tone}
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
            </header>

            <section className="mt-2 rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <div className="mb-2.5 flex items-center gap-2">
                <div className="size-2 rounded-full bg-[var(--jp-accent)]" />
                <h2 className="text-sm font-semibold text-[var(--jp-text)]">本周排课</h2>
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
                {home.weekCalendar.map((day) => {
                  const isSelected = day.key === selectedDayKey;
                  const caption =
                    day.key === home.defaultDayKey
                      ? day.caption
                      : isSelected && day.hasClass
                        ? "排课"
                        : undefined;

                  return (
                    <button
                      key={day.key}
                      type="button"
                      disabled={!day.hasClass && !isSelected}
                      onClick={() => (day.hasClass || isSelected) && setSelectedDayKey(day.key)}
                      className={
                        isSelected
                          ? "flex min-h-[54px] flex-col items-center rounded-[12px] bg-[var(--jp-surface)] px-2 py-2"
                          : "flex min-h-[54px] flex-col items-center justify-center gap-1.5 rounded-[12px] px-2 py-2"
                      }
                    >
                      <span
                        className={
                          isSelected
                            ? "text-[13px] font-semibold text-[var(--jp-accent)]"
                            : "text-[13px] text-[var(--jp-text-secondary)]"
                        }
                      >
                        {day.label}
                      </span>
                      {caption ? (
                        <span className="mt-1 text-[11px] font-medium text-[var(--jp-accent)]">
                          {caption}
                        </span>
                      ) : (
                        <span
                          className={`size-1.5 rounded-full ${
                            day.hasClass ? "bg-[var(--jp-accent)]" : "bg-[var(--jp-border)]"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {selectedSchedule && primaryAction && primaryCourse ? (
              primaryUsesTaskCard ? (
                <article
                  role="button"
                  tabIndex={0}
                  onClick={() => openPendingAction(primaryAction)}
                  onKeyDown={(event) => handleCardKeyDown(event, primaryAction)}
                  className={`mt-2 cursor-pointer overflow-hidden rounded-[16px] text-left transition-transform active:scale-[0.99] ${primaryStyles.cardBorder} ${primaryStyles.cardShadow}`}
                >
                  {primaryTaskUsesLocationFirst ? (
                    <TaskLocationHeader
                      locationLabel={getTaskLocationLabel(primaryCourse, primaryFields)}
                      styles={primaryStyles}
                    />
                  ) : (
                    <div
                      className={`flex items-center justify-between gap-3 px-3.5 py-2.5 ${primaryStyles.headerBg}`}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={`rounded-[4px] bg-white px-2 py-0.5 text-[10px] font-semibold ${primaryStyles.badgeText}`}
                        >
                          {primaryCourse.badge ?? "代课"}
                        </span>
                        <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[var(--jp-text)]">
                          {primaryCourse.title}
                        </p>
                      </div>
                      {primaryMetric ? (
                        <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px]">
                          <span className="font-medium text-[var(--jp-text-secondary)]">
                            {primaryMetric.label}
                          </span>
                          <span className="font-bold text-[var(--jp-accent)]">
                            {primaryMetric.value}
                          </span>
                        </div>
                      ) : primaryCourse.expectedLabel ? (
                        <div className="inline-flex shrink-0 items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--jp-text-secondary)]">
                          {primaryCourse.expectedLabel}
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div className={`space-y-2.5 px-3.5 py-3.5 ${primaryStyles.bodyBg}`}>
                    {primaryTaskUsesLocationFirst ? (
                      <TaskCourseTitleRow
                        course={primaryCourse}
                        metric={primaryMetric}
                        styles={primaryStyles}
                      />
                    ) : (
                      <TaskCampusPillRow fields={primaryFields} styles={primaryStyles} />
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <ScheduleMetaCard
                        label="上课时间"
                        value={primaryFields.time ?? primaryCourse.time ?? "待确认"}
                        surfaceClassName="bg-white"
                      />
                      <ScheduleMetaCard
                        label="点名时间"
                        value={primaryRollCallTimeLabel}
                        surfaceClassName="bg-white"
                      />
                    </div>

                    <div
                      className={`flex items-center justify-between rounded-[12px] border bg-white px-3.5 py-2.5 ${primaryStyles.locationBorder}`}
                    >
                      <p className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--jp-text)]">
                        {primaryFields.locationTrail}
                      </p>
                      <Navigation className={`size-5 shrink-0 ${primaryStyles.locationIcon}`} />
                    </div>
                  </div>
                </article>
              ) : (
                <StandardCourseCard
                  course={primaryCourse}
                  action={{ actionLabel: primaryCourse.actionLabel, payload: primaryAction }}
                  dateLabel={selectedSchedule.dateLabel}
                  rollCallTimeLabel={primaryRollCallTimeLabel}
                  onOpenAction={openPendingAction}
                  onCardKeyDown={handleCardKeyDown}
                />
              )
            ) : (
              <article className="mt-2 rounded-[16px] border border-[#E8E5E0] bg-white px-6 py-7 text-center shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[var(--jp-surface-muted)] text-[var(--jp-text-muted)]">
                  <CalendarDays className="size-6" />
                </div>
                <p className="mt-5 text-[15px] font-semibold text-[var(--jp-text)]">
                  该日暂无教学安排
                </p>
                <p className="mt-3 text-[13px] leading-7 text-[var(--jp-text-secondary)]">
                  可切换上方日期查看本周其他课程安排。后续如果出现临时调课，也会在这里更新。
                </p>
              </article>
            )}

            {secondaryCourse && secondaryAction && secondaryUsesStandardCard ? (
              <StandardCourseCard
                course={secondaryCourse}
                action={{ actionLabel: secondaryCourse.actionLabel, payload: secondaryAction }}
                dateLabel={selectedSchedule?.dateLabel ?? ""}
                rollCallTimeLabel={secondaryRollCallTimeLabel}
                onOpenAction={openPendingAction}
                onCardKeyDown={handleCardKeyDown}
              />
            ) : secondaryCourse && secondaryAction ? (
              <article
                role="button"
                tabIndex={0}
                onClick={() => openPendingAction(secondaryAction)}
                onKeyDown={(event) => handleCardKeyDown(event, secondaryAction)}
                className={`mt-2 cursor-pointer overflow-hidden rounded-[16px] text-left transition-transform active:scale-[0.99] ${secondaryStyles.cardBorder} ${secondaryStyles.cardShadow}`}
              >
                {secondaryTaskUsesLocationFirst ? (
                  <TaskLocationHeader
                    locationLabel={getTaskLocationLabel(secondaryCourse, secondaryFields)}
                    styles={secondaryStyles}
                  />
                ) : (
                  <div
                    className={`flex items-center justify-between gap-3 px-3.5 py-2.5 ${secondaryStyles.headerBg}`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`rounded-[4px] bg-white px-2 py-0.5 text-[10px] font-semibold ${secondaryStyles.badgeText}`}
                      >
                        {secondaryCourse.badge ?? "代课"}
                      </span>
                      <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[var(--jp-text)]">
                        {secondaryCourse.title}
                      </p>
                    </div>
                    {secondaryMetric ? (
                      <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px]">
                        <span className="font-medium text-[var(--jp-text-secondary)]">
                          {secondaryMetric.label}
                        </span>
                        <span className="font-bold text-[var(--jp-accent)]">
                          {secondaryMetric.value}
                        </span>
                      </div>
                    ) : secondaryCourse.expectedLabel ? (
                      <div className="inline-flex shrink-0 items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--jp-text-secondary)]">
                        {secondaryCourse.expectedLabel}
                      </div>
                    ) : null}
                  </div>
                )}

                <div className={`space-y-2.5 px-3.5 py-3.5 ${secondaryStyles.bodyBg}`}>
                  {secondaryTaskUsesLocationFirst ? (
                    <TaskCourseTitleRow
                      course={secondaryCourse}
                      metric={secondaryMetric}
                      styles={secondaryStyles}
                    />
                  ) : (
                    <TaskCampusPillRow fields={secondaryFields} styles={secondaryStyles} />
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <ScheduleMetaCard
                      label="上课时间"
                      value={secondaryFields.time ?? secondaryCourse.time ?? "待确认"}
                      surfaceClassName="bg-white"
                    />
                    <ScheduleMetaCard
                      label="点名时间"
                      value={secondaryRollCallTimeLabel}
                      surfaceClassName="bg-white"
                    />
                  </div>

                  <div
                    className={`flex items-center justify-between rounded-[12px] border bg-white px-3.5 py-2.5 ${secondaryStyles.locationBorder}`}
                  >
                    <p className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--jp-text)]">
                      {secondaryFields.locationTrail}
                    </p>
                    <Navigation className={`size-5 shrink-0 ${secondaryStyles.locationIcon}`} />
                  </div>
                </div>
              </article>
            ) : null}
          </div>

          <MobileTabBar
            active="home"
            items={[
              { key: "home", href: "/teacher/home" },
              { key: "attendance", href: attendanceTabHref },
              { key: "profile", href: "/teacher/me" },
            ]}
          />
        </div>

        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-[rgba(15,23,42,0.35)] backdrop-blur-0"
          className="max-w-[320px] gap-4 rounded-[16px] border-0 bg-white p-6 shadow-none ring-0"
        >
          <div className="space-y-4">
            <DialogTitle className="text-[18px] font-semibold text-[#1E3A5F]">
              {pendingAction?.title ?? "当前不在点名时间"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#666666]">
              {pendingAction?.description ?? "是否查看学生名单？"}
            </DialogDescription>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="h-11 rounded-[8px] border-0 bg-[#F5F5F5] text-[15px] font-medium text-[var(--jp-text)] hover:bg-[#F5F5F5]"
              >
                取消
              </Button>
            </DialogClose>
            <Button
              asChild
              onClick={() => setDialogOpen(false)}
              className="h-11 rounded-[8px] bg-[#1E3A5F] text-[15px] font-semibold text-white hover:bg-[#1E3A5F]/90"
            >
              <StaticLink href={pendingAction?.confirmHref ?? "/teacher/home"}>
                {pendingAction?.confirmLabel ?? "查看学生名单"}
              </StaticLink>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function ScheduleMetaCard({
  label,
  value,
  surfaceClassName = "bg-[#FCFBF9]",
}: {
  label: string;
  value: string;
  surfaceClassName?: string;
}) {
  return (
    <div className={`rounded-[12px] border border-[color:var(--jp-border)] px-3 py-2.5 ${surfaceClassName}`}>
      <p className="text-[11px] font-medium text-[var(--jp-text-secondary)]">{label}</p>
      <p className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-[var(--jp-text)]">
        {value}
      </p>
    </div>
  );
}
