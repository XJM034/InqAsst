"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, Info, MapPin, Navigation } from "lucide-react";

import { AdminAttendanceHeaderTicker } from "@/components/app/admin-attendance-header-ticker";
import { getAttendanceSummary } from "@/lib/domain/attendance";
import type { AttendanceSession, AttendanceStudent } from "@/lib/domain/types";
import { AttendanceStudentCard } from "@/components/app/attendance-student-card";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { StaticLink } from "@/components/app/static-link";
import { TeacherTemporaryStudentForm } from "@/components/app/teacher-temporary-student-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  fetchTeacherAttendanceStatus,
  submitTeacherAttendance,
} from "@/lib/services/mobile-client";
import { navigateTo, reloadPage } from "@/lib/static-navigation";
import {
  buildTeacherAttendanceSubtitle,
  formatAttendanceClockLabel,
} from "@/lib/admin-attendance-header";

type AttendanceSessionClientProps = {
  session: AttendanceSession;
  mode?: "attendance" | "roster";
  displayMeta?: {
    pageTitle: string;
    dateLabel: string;
    courseTitle: string;
    courseInfo: string;
  };
  tabActive?: "home" | "attendance" | "profile";
  backHref?: string;
  backLabel?: string;
  rosterNotice?: string;
};

export function AttendanceSessionClient({
  session,
  mode = "attendance",
  displayMeta,
  tabActive = mode === "roster" ? "home" : "attendance",
  backHref,
  backLabel = "返回首页",
  rosterNotice,
}: AttendanceSessionClientProps) {
  const [students, setStudents] = useState<AttendanceStudent[]>(session.students);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const courseInfoParts = (displayMeta?.courseInfo ?? session.courseInfo)
    .split(" | ")
    .map((item) => item.trim())
    .filter(Boolean);
  const [parsedCampusLabel, locationLabel, parsedTimeLabel] =
    courseInfoParts.length >= 3
      ? courseInfoParts
      : [undefined, courseInfoParts[0], courseInfoParts[1]];
  const campusLabel = session.campusLabel ?? parsedCampusLabel;
  const timeLabel = session.sessionTimeLabel ?? parsedTimeLabel;
  const dateLabel = displayMeta?.dateLabel ?? session.dateLabel;
  const displayCourseTitle = displayMeta?.courseTitle ?? session.courseTitle;
  const summary = getAttendanceSummary(students);
  const syncKey = useMemo(
    () => students.map((student) => `${student.id}:${student.status}`).join("|"),
    [students],
  );
  const initialSyncKeyRef = useRef(syncKey);
  const latestAttendanceRecordIdRef = useRef(session.latestAttendanceRecordId ?? "");
  const latestSubmittedAtRef = useRef(session.latestSubmittedAt ?? "");
  const absentStudents = students.filter((student) => student.status === "absent");
  const leaveStudents = students.filter((student) => student.status === "leave");
  const hasAnyException = absentStudents.length > 0 || leaveStudents.length > 0;
  const primarySummaryItems = [
    { label: "应到", value: summary.expected, tone: "info" as const },
    { label: "已到", value: summary.present, tone: "success" as const },
    { label: "未到", value: summary.absent, tone: "danger" as const },
  ];
  const secondarySummaryItems = [
    summary.leave > 0
      ? { label: "请假", value: summary.leave, tone: "neutral" as const }
      : null,
    summary.unmarked > 0
      ? { label: "未点名", value: summary.unmarked, tone: "muted" as const }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    value: number;
    tone: "neutral" | "muted";
  }>;
  const attendanceTickerText = useMemo(
    () =>
      mode === "attendance"
        ? buildTeacherAttendanceSubtitle(
            {
              campusLabel: session.campusLabel,
              courseTitle: displayCourseTitle,
              dateLabel: session.dateLabel,
              sessionTimeLabel: session.sessionTimeLabel,
              referenceSessionStartAt: session.referenceSessionStartAt,
              rollCallDeadlineAt: session.rollCallDeadlineAt,
            },
            now,
          )
        : "",
    [displayCourseTitle, mode, now, session],
  );
  const attendanceDeadlineHighlight = useMemo(() => {
    if (mode !== "attendance") {
      return undefined;
    }

    const deadlineClockLabel = formatAttendanceClockLabel(session.rollCallDeadlineAt);

    return deadlineClockLabel ? `${deadlineClockLabel} 前完成点名` : undefined;
  }, [mode, session.rollCallDeadlineAt]);
  const [tapHintPrimary, tapHintSecondary] = useMemo(() => {
    const lines = session.tapHint
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      return ["", ""];
    }

    if (lines.length === 1) {
      return ["", lines[0] ?? ""];
    }

    return [lines[0]?.replace(/[；;]+$/, "") ?? "", lines.slice(1).join(" ")];
  }, [session.tapHint]);

  function handleToggleStudentStatus(studentId: string) {
    setStudents((current) =>
      current.map((student) =>
        student.id === studentId
          ? {
              ...student,
              status: student.status === "present" ? "absent" : "present",
            }
          : student,
      ),
    );
  }

  function handleTemporaryStudentCreated(student: AttendanceStudent) {
    setStudents((current) =>
      current.some((item) => item.id === student.id) ? current : [...current, student],
    );
  }

  async function handleSubmitAttendance() {
    if (session.submitDisabled) {
      setSubmitError(session.submitDisabledReason ?? "当前不在点名时间内");
      return;
    }

    if (!session.courseId) {
      navigateTo("/teacher/home");
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      await submitTeacherAttendance({
        courseId: session.courseId,
        courseSessionId: session.courseSessionId,
        students,
      });
      navigateTo("/teacher/home");
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("点名提交失败，请稍后重试");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    initialSyncKeyRef.current = syncKey;
  }, [syncKey]);

  useEffect(() => {
    latestAttendanceRecordIdRef.current = session.latestAttendanceRecordId ?? "";
    latestSubmittedAtRef.current = session.latestSubmittedAt ?? "";
  }, [session.latestAttendanceRecordId, session.latestSubmittedAt]);

  useEffect(() => {
    if (mode !== "attendance") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [mode]);

  useEffect(() => {
    if (
      mode !== "attendance" ||
      !session.courseId ||
      !session.courseSessionId ||
      !session.attendanceWindowActive
    ) {
      return;
    }

    let cancelled = false;
    const intervalId = window.setInterval(async () => {
      try {
        const status = await fetchTeacherAttendanceStatus({
          courseId: session.courseId!,
          courseSessionId: session.courseSessionId,
        });
        if (cancelled) {
          return;
        }

        const nextRecordId =
          typeof status.attendanceRecordId === "number"
            ? String(status.attendanceRecordId)
            : "";
        const nextSubmittedAt = status.submittedAt ?? "";
        const hasRemoteUpdate =
          nextRecordId !== latestAttendanceRecordIdRef.current ||
          nextSubmittedAt !== latestSubmittedAtRef.current;
        const hasLocalChanges = syncKey !== initialSyncKeyRef.current;

        if (hasRemoteUpdate && !hasLocalChanges) {
          latestAttendanceRecordIdRef.current = nextRecordId;
          latestSubmittedAtRef.current = nextSubmittedAt;
          reloadPage();
        }
      } catch {
        // Keep polling non-blocking; the next cycle will retry automatically.
      }
    }, 10_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [mode, session.attendanceWindowActive, session.courseId, session.courseSessionId, syncKey]);

  return (
    <PageShell>
      <Dialog>
        <div className="app-screen">
          <div className={`app-scroll px-5 ${backHref ? "" : mode === "attendance" ? "pt-4" : ""}`}>
            {backHref ? (
              <div className="pt-3">
                <Button
                  asChild
                  variant="outline"
                  className="h-9 rounded-full border-[color:var(--jp-border)] bg-white px-3 text-[13px] font-medium text-[var(--jp-text)] hover:bg-white"
                >
                  <StaticLink className="inline-flex items-center gap-1.5" href={backHref}>
                    <ChevronLeft className="size-4" />
                    {backLabel}
                  </StaticLink>
                </Button>
              </div>
            ) : null}

            {attendanceTickerText ? (
              <header className={backHref ? "pt-2.5 pb-0.5" : "pb-0.5"}>
                <AdminAttendanceHeaderTicker
                  text={attendanceTickerText}
                  highlightText={attendanceDeadlineHighlight}
                />
              </header>
            ) : null}

            {mode === "roster" ? (
              <section
                className={`${
                  backHref || attendanceTickerText ? "mt-2.5" : "mt-0"
                } overflow-hidden rounded-[16px] border border-[#E8E5E0] shadow-[0_12px_26px_rgba(28,28,28,0.05)]`}
              >
                {campusLabel ? (
                  <div className="flex items-center gap-2 bg-[#2C2C2C] px-3.5 py-3 text-white">
                    <MapPin className="size-4" />
                    <p className="text-base font-semibold">{campusLabel}</p>
                  </div>
                ) : null}

                <div className="space-y-2.5 bg-[var(--jp-surface)] px-3.5 py-3.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      {timeLabel ? (
                        <p className="text-[19px] font-medium tracking-[-0.03em] text-[var(--jp-text)]">
                          {timeLabel}
                        </p>
                      ) : (
                        <div />
                      )}
                      <MetaPill tone="neutral" className="shrink-0">
                        {dateLabel}
                      </MetaPill>
                    </div>
                    <h2 className="text-[16px] font-medium tracking-[-0.02em] text-[var(--jp-text)]">
                      {displayMeta?.courseTitle ?? session.courseTitle}
                    </h2>
                  </div>

                  {locationLabel ? (
                    <div className="flex items-center justify-between rounded-[12px] border border-[color:var(--jp-border)] bg-white px-3.5 py-2.5">
                      <p className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--jp-text)]">
                        {locationLabel}
                      </p>
                      <NavigationIcon />
                    </div>
                  ) : null}

                  {rosterNotice ? (
                    <div className="flex items-start gap-2 rounded-[12px] bg-[#FCF7EE] px-3 py-2 text-[#7B5C1E] ring-1 ring-[#F0E1BD]/80">
                      <Info className="mt-0.5 size-3 shrink-0" />
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-medium leading-5">{rosterNotice}</p>
                        <p className="text-[10px] font-medium leading-4 text-[#8C6B28]">
                          {dateLabel}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : (
              <section
                className={`${
                  attendanceTickerText ? "mt-2.5" : "mt-0"
                } rounded-[16px] border border-[#E8E5E0] bg-white px-3.5 py-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]`}
              >
                <div className="grid grid-cols-3 gap-2">
                  {primarySummaryItems.map((item) => (
                    <SummaryChip
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      tone={item.tone}
                      variant="stretch"
                    />
                  ))}
                </div>
                {secondarySummaryItems.length > 0 ? (
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {secondarySummaryItems.map((item) => (
                      <SummaryChip
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        tone={item.tone}
                      />
                    ))}
                  </div>
                ) : null}

              </section>
            )}

            {mode === "attendance" ? (
              <TeacherTemporaryStudentForm
                courseId={session.courseId}
                courseSessionId={session.courseSessionId}
                homeroomClasses={session.temporaryStudent?.homeroomClasses ?? []}
                disabled={session.submitDisabled}
                disabledReason={
                  session.submitDisabled
                    ? session.submitDisabledReason
                    : session.temporaryStudent?.disabledReason
                }
                className="mt-3"
                onCreated={handleTemporaryStudentCreated}
              />
            ) : null}

            {students.length === 0 ? (
              <div className="mt-3.5 rounded-[16px] border border-dashed border-[#D8D5D0] bg-white px-4 py-8 text-center text-[13px] text-[var(--jp-text-muted)]">
                当前课节还没有学生名单
              </div>
            ) : (
              <>
                {tapHintPrimary ? (
                  <p className="mt-3 px-1 text-[11px] font-semibold tracking-[-0.01em] text-[#36557D]">
                    {tapHintPrimary}
                  </p>
                ) : null}
                {tapHintSecondary ? (
                  <div className="mt-1.5 rounded-[12px] border border-[#F1DFB4] bg-[#FFF8E8] px-3 py-2 text-[10px] font-medium leading-4 text-[#8A6018]">
                    {tapHintSecondary}
                  </div>
                ) : null}
                <div
                  className={`${
                    tapHintPrimary || tapHintSecondary ? "mt-2.5" : "mt-3.5"
                  } grid grid-cols-3 gap-2 ${
                  mode === "attendance"
                    ? "pb-[calc(var(--mobile-tabbar-total-height)+68px)]"
                    : "pb-6"
                  }`}
                >
                  {students.map((student) => (
                    <AttendanceStudentCard
                      key={student.id}
                      name={student.name}
                      homeroomClass={student.homeroomClass}
                      status={student.status}
                      managerUpdated={student.managerUpdated}
                      overrideLabel={student.overrideLabel}
                      // 教师端只允许已到/未到互切；请假状态仅展示，不开放点击修改。
                      editable={
                        mode === "attendance" &&
                        !student.managerUpdated &&
                        student.status !== "leave"
                      }
                      hideStatus={mode === "roster"}
                      onToggle={() => handleToggleStudentStatus(student.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {mode === "attendance" ? (
            <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--mobile-tabbar-total-height)+10px)] z-40 mx-auto w-full max-w-[402px] px-4">
              <div className="pointer-events-auto">
                {submitError ? (
                  <p className="mb-2 px-2 text-center text-[12px] font-medium text-[#D32F2F]">
                    {submitError}
                  </p>
                ) : session.submitDisabled && session.submitDisabledReason ? (
                  <p className="mb-2 px-2 text-center text-[12px] font-medium text-[#D32F2F]">
                    {session.submitDisabledReason}
                  </p>
                ) : null}
                <DialogTrigger asChild>
                  <Button
                    disabled={session.submitDisabled}
                    className="h-12 w-full rounded-[16px] bg-[var(--jp-accent)] text-[15px] font-semibold text-[var(--jp-bg)] shadow-[0_16px_32px_rgba(30,58,95,0.24)] hover:bg-[var(--jp-accent)]/90 disabled:opacity-60"
                  >
                    {session.submitLabel}
                  </Button>
                </DialogTrigger>
              </div>
            </div>
          ) : null}

          <MobileTabBar
            active={tabActive}
            items={[
              { key: "home", href: "/teacher/home" },
              { key: "attendance", href: "/teacher/attendance" },
              { key: "profile", href: "/teacher/me" },
            ]}
          />
        </div>

        {mode === "attendance" ? (
          <DialogContent
            showCloseButton={false}
            overlayClassName="bg-[rgba(15,23,42,0.35)] backdrop-blur-0"
            className="max-w-[320px] gap-4 rounded-[16px] border-0 bg-white p-6 shadow-none ring-0"
          >
            {hasAnyException ? (
              <>
                <div className="space-y-2.5">
                  <DialogTitle className="text-[18px] font-semibold text-[#1E3A5F]">
                    确认提交点名
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-6 text-[#666666]">
                    {`本节课应到 ${summary.expected} 人，确认后会按当前结果同步到管理端。`}
                  </DialogDescription>
                </div>

                {absentStudents.length > 0 ? (
                  <div className="space-y-2 rounded-[12px] bg-[#FFF8F8] px-3.5 py-3">
                    <p className="text-sm font-semibold text-[#D32F2F]">
                      {`未到学生（${summary.absent}人）`}
                    </p>
                    <div className="space-y-1.5">
                      {absentStudents.map((student) => (
                        <p
                          key={student.id}
                          className="text-[12px] leading-5 text-[#7A3940]"
                        >
                          {`${student.name} · ${student.homeroomClass}`}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}

                {leaveStudents.length > 0 ? (
                  <div className="space-y-2 rounded-[12px] bg-[#F5F3F0] px-3.5 py-3">
                    <p className="text-sm font-semibold text-[var(--jp-text)]">
                      {`请假学生（${summary.leave}人）`}
                    </p>
                    <div className="space-y-1.5">
                      {leaveStudents.map((student) => (
                        <p
                          key={student.id}
                          className="text-[12px] leading-5 text-[var(--jp-text-secondary)]"
                        >
                          {`${student.name} · ${student.homeroomClass}`}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                      className="h-11 rounded-[8px] border-0 bg-[#F5F5F5] text-[15px] font-medium text-[var(--jp-text)] hover:bg-[#F5F5F5]"
                    >
                      返回修改
                    </Button>
                  </DialogClose>
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmitAttendance}
                    className="h-11 rounded-[8px] bg-[#1E3A5F] text-[15px] font-semibold text-white hover:bg-[#1E3A5F]/90"
                  >
                    {isSubmitting ? "提交中" : "确认提交"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex size-[52px] items-center justify-center rounded-full bg-[#E8F5E9]">
                    <Check className="size-[22px] text-[#4CAF50]" strokeWidth={2.4} />
                  </div>
                  <div className="space-y-2.5">
                    <DialogTitle className="text-[18px] font-semibold text-[#1E3A5F]">
                      确认提交点名
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-6 text-[#666666]">
                      {`本节课应到 ${summary.expected} 人，确认全部已到后提交。`}
                    </DialogDescription>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                      className="h-11 rounded-[8px] border-0 bg-[#F5F5F5] text-[15px] font-medium text-[var(--jp-text)] hover:bg-[#F5F5F5]"
                    >
                      修改点名
                    </Button>
                  </DialogClose>
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmitAttendance}
                    className="h-11 rounded-[8px] bg-[#1E3A5F] text-[15px] font-semibold text-white hover:bg-[#1E3A5F]/90"
                  >
                    {isSubmitting ? "提交中" : "完成点名"}
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        ) : null}
      </Dialog>
    </PageShell>
  );
}

function SummaryChip({
  label,
  value,
  tone,
  variant = "pill",
}: {
  label: string;
  value: number;
  tone: "info" | "success" | "neutral" | "muted" | "danger";
  variant?: "pill" | "stretch";
}) {
  const toneClass = {
    info: {
      pill: "bg-[#1E3A5F10] text-[#1E3A5F]",
      stretch: "bg-[#EEF4FA] text-[#1E3A5F] ring-1 ring-[#D9E5F1]",
    },
    success: {
      pill: "bg-[#3d6b4f1a] text-[#3D6B4F]",
      stretch: "bg-[#EEF6F1] text-[#3D6B4F] ring-1 ring-[#D7E6DC]",
    },
    neutral: {
      pill: "bg-[#1C1C1C12] text-[#1C1C1C]",
      stretch: "bg-[#F3F0EB] text-[#1C1C1C] ring-1 ring-[#E5E0D7]",
    },
    muted: {
      pill: "bg-[#EDF3F8] text-[#4C6177]",
      stretch: "bg-[#EDF3F8] text-[#4C6177] ring-1 ring-[#DCE7F0]",
    },
    danger: {
      pill: "bg-[#d52f2f1a] text-[#D32F2F]",
      stretch: "bg-[#FFF1F1] text-[#D32F2F] ring-1 ring-[#F2D7D8]",
    },
  }[tone];

  if (variant === "stretch") {
    return (
      <div className={`flex h-10 w-full items-center justify-center gap-1.5 rounded-full px-2 ${toneClass.stretch}`}>
        <span className="truncate text-[12px] font-medium tracking-[-0.01em]">{label}</span>
        <span className="text-[16px] font-semibold tracking-[-0.02em]">{value}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${toneClass.pill}`}>
      <span className="text-[13px] font-medium">{label}</span>
      <span className="text-[13px] font-bold">{value}</span>
    </div>
  );
}

function MetaPill({
  children,
  tone,
  className,
}: {
  children: string;
  tone: "neutral" | "accent";
  className?: string;
}) {
  return (
    <div
      className={[
        tone === "accent"
          ? "rounded-full bg-[#E8F0FB] px-3 py-1.5 text-[11px] font-semibold text-[#1E3A5F]"
          : "rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-[var(--jp-text-secondary)] ring-1 ring-[color:var(--jp-border)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

function NavigationIcon() {
  return <Navigation className="size-5 text-[var(--jp-accent)]" />;
}
