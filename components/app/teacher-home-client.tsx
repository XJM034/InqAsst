"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarClock,
  ChevronRight,
  CircleUserRound,
  MapPin,
  Navigation,
} from "lucide-react";

import type { TeacherHomeData } from "@/lib/domain/types";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type TeacherHomeClientProps = {
  home: TeacherHomeData;
};

export function TeacherHomeClient({ home }: TeacherHomeClientProps) {
  const [selectedDayKey, setSelectedDayKey] = useState(home.defaultDayKey);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    isAttendanceWindow: boolean;
    confirmHref: string;
  } | null>(null);

  const selectedSchedule = useMemo(
    () => home.daySchedules.find((item) => item.dayKey === selectedDayKey) ?? home.daySchedules[0],
    [home.daySchedules, selectedDayKey],
  );

  function openPendingAction(payload: { isAttendanceWindow: boolean; confirmHref: string }) {
    setPendingAction(payload);
    setDialogOpen(true);
  }

  function handleCardKeyDown(
    event: React.KeyboardEvent<HTMLElement>,
    payload: { isAttendanceWindow: boolean; confirmHref: string },
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPendingAction(payload);
    }
  }

  const primaryAction = {
    isAttendanceWindow: selectedSchedule.primaryCourse.attendanceWindowState === "active",
    confirmHref:
      selectedSchedule.primaryCourse.attendanceWindowState === "active"
        ? selectedSchedule.primaryCourse.actionHref
        : selectedSchedule.primaryCourse.rosterHref,
  };

  const substituteAction = selectedSchedule.substituteCourse
    ? {
        isAttendanceWindow: selectedSchedule.substituteCourse.attendanceWindowState === "active",
        confirmHref:
          selectedSchedule.substituteCourse.attendanceWindowState === "active"
            ? selectedSchedule.substituteCourse.actionHref
            : selectedSchedule.substituteCourse.rosterHref,
      }
    : null;
  const substituteDescriptionParts = selectedSchedule.substituteCourse?.description
    .split(" | ")
    .map((item) => item.trim());
  const [substituteCampus, substituteLocation, substituteTime] = substituteDescriptionParts ?? [];

  return (
    <PageShell>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <div className="app-screen">
          <div className="app-scroll px-5 pt-4">
            <header className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[var(--jp-surface-muted)] text-[var(--jp-text-muted)]">
                <CircleUserRound className="size-6" />
              </div>
              <p className="text-[15px] font-medium text-[var(--jp-text)]">{home.greeting}</p>
            </header>

            <section className="mt-4 rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <div className="mb-3 flex items-center gap-2">
                <div className="size-2 rounded-full bg-[var(--jp-accent)]" />
                <h2 className="text-sm font-semibold text-[var(--jp-text)]">本周排课</h2>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {home.weekCalendar.map((day) => {
                  const isSelected = day.key === selectedDayKey;
                  const caption =
                    day.key === home.defaultDayKey ? day.caption : isSelected && day.hasClass ? "排课" : undefined;

                  return (
                    <button
                      key={day.key}
                      type="button"
                      disabled={!day.hasClass}
                      onClick={() => day.hasClass && setSelectedDayKey(day.key)}
                      className={
                        isSelected
                          ? "flex min-h-[58px] flex-col items-center rounded-[12px] bg-[var(--jp-surface)] px-2 py-2"
                          : "flex min-h-[58px] flex-col items-center justify-center gap-2 rounded-[12px] px-2 py-2"
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

            <article
              role="button"
              tabIndex={0}
              onClick={() => openPendingAction(primaryAction)}
              onKeyDown={(event) => handleCardKeyDown(event, primaryAction)}
              className="mt-3 cursor-pointer overflow-hidden rounded-[16px] border border-[#E8E5E0] shadow-[0_12px_26px_rgba(28,28,28,0.05)] transition-transform active:scale-[0.99]"
            >
              <div className="flex items-center gap-2 bg-[#2C2C2C] px-4 py-3 text-white">
                <MapPin className="size-4" />
                <p className="text-base font-semibold">
                  {selectedSchedule.primaryCourse.campus}
                </p>
              </div>
              <div className="space-y-3 bg-[var(--jp-surface)] px-4 py-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[20px] font-medium tracking-[-0.03em] text-[var(--jp-text)]">
                      {selectedSchedule.primaryCourse.time}
                    </p>
                    <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-[var(--jp-text-secondary)] ring-1 ring-[color:var(--jp-border)]">
                      {selectedSchedule.dateLabel}
                    </span>
                  </div>
                  <p className="text-[17px] font-medium tracking-[-0.02em] text-[var(--jp-text)]">
                    {selectedSchedule.primaryCourse.title}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-[12px] border border-[color:var(--jp-border)] bg-white px-4 py-3">
                  <p className="text-[16px] font-semibold tracking-[-0.02em] text-[var(--jp-text)]">
                    {selectedSchedule.primaryCourse.locationTrail}
                  </p>
                  <Navigation className="size-5 text-[var(--jp-accent)]" />
                </div>

                <Button
                  onClick={(event) => {
                    event.stopPropagation();
                    openPendingAction(primaryAction);
                  }}
                  className="h-11 w-full rounded-[12px] bg-[var(--jp-accent)] text-[var(--jp-bg)] hover:bg-[var(--jp-accent)]/90"
                >
                  {selectedSchedule.primaryCourse.actionLabel}
                </Button>
              </div>
            </article>

            {selectedSchedule.substituteCourse && substituteAction ? (
              <article
                role="button"
                tabIndex={0}
                onClick={() => openPendingAction(substituteAction)}
                onKeyDown={(event) => handleCardKeyDown(event, substituteAction)}
                className="mt-3.5 cursor-pointer overflow-hidden rounded-[16px] border border-[#F0E1BD] text-left shadow-[0_10px_22px_rgba(196,106,26,0.08)] transition-transform active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-3 bg-[#FFF3E0] px-3.5 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="rounded-[4px] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#A55B14]">
                      {selectedSchedule.substituteCourse.badge}
                    </span>
                    <p className="truncate text-[15px] font-semibold text-[var(--jp-text)]">
                      {selectedSchedule.substituteCourse.title}
                    </p>
                  </div>
                  <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px]">
                    <span className="font-medium text-[var(--jp-text-secondary)]">
                      {selectedSchedule.substituteCourse.expectedLabel.split(" ")[0]}
                    </span>
                    <span className="font-bold text-[var(--jp-accent)]">
                      {selectedSchedule.substituteCourse.expectedLabel.split(" ")[1]}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 bg-[#FFFDF8] px-3.5 py-3">
                  <div className="flex flex-wrap gap-2">
                    {substituteCampus ? (
                      <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-[var(--jp-text-secondary)] ring-1 ring-[#F0E1BD]">
                        {substituteCampus}
                      </span>
                    ) : null}
                    {substituteTime ? (
                      <span className="rounded-full bg-[#F9E7CA] px-3 py-1.5 text-[11px] font-semibold text-[#A55B14]">
                        {substituteTime}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between rounded-[12px] border border-[#F0E1BD] bg-white px-3.5 py-3">
                    <p className="text-[14px] font-medium text-[var(--jp-text)]">
                      {substituteLocation ?? selectedSchedule.substituteCourse.description}
                    </p>
                    <ChevronRight className="size-4 shrink-0 text-[var(--jp-text-muted)]" />
                  </div>
                </div>
              </article>
            ) : null}

            <article className="mt-3 flex items-center gap-3 rounded-[16px] border border-[#E8E5E0] bg-[#FCFBF9] px-3 py-2.5 shadow-[0_8px_18px_rgba(28,28,28,0.03)]">
              <div className="flex size-8 items-center justify-center rounded-full bg-white text-[var(--jp-accent)] ring-1 ring-[color:var(--jp-border)]">
                <CalendarClock className="size-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--jp-text-muted)]">
                  明日行程
                </p>
                <p className="text-[13px] font-medium leading-5 text-[var(--jp-text)]">
                  {home.tomorrowTrip}
                </p>
              </div>
            </article>
          </div>

          <MobileTabBar
            active="home"
            items={[
              { key: "home", href: "/teacher/home" },
              { key: "attendance", href: "/teacher/attendance/demo" },
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
              {pendingAction?.isAttendanceWindow ? "当前处于点名时间" : "当前不属于点名时间"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#666666]">
              {pendingAction?.isAttendanceWindow ? "是否进入点名页？" : "是否查看学生名单？"}
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
              <Link href={pendingAction?.confirmHref ?? "/teacher/home"}>
                {pendingAction?.isAttendanceWindow ? "进入点名页" : "查看学生名单"}
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
