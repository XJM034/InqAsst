"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronLeft, Info, MapPin, Navigation } from "lucide-react";

import { getAttendanceSummary } from "@/lib/domain/attendance";
import type { AttendanceSession, AttendanceStudent } from "@/lib/domain/types";
import { AttendanceStudentCard } from "@/components/app/attendance-student-card";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const courseInfoParts = (displayMeta?.courseInfo ?? session.courseInfo)
    .split(" | ")
    .map((item) => item.trim());
  const [campusLabel, locationLabel, timeLabel] = courseInfoParts;
  const dateLabel = displayMeta?.dateLabel ?? session.dateLabel;
  const datePillLabel = dateLabel.replace(/\s*·\s*当前.*$/, "");
  const summary = getAttendanceSummary(students);
  const absentStudents = students.filter((student) => student.status === "absent");
  const leaveStudents = students.filter((student) => student.status === "leave");
  const hasAnyException = absentStudents.length > 0 || leaveStudents.length > 0;
  const statusLabel = absentStudents.length > 0 ? "未到" : "请假";
  const statusToneClass =
    absentStudents.length > 0 ? "text-[#D32F2F]" : "text-[var(--jp-text)]";
  const statusNames = (absentStudents.length > 0 ? absentStudents : leaveStudents)
    .map((student) => student.name)
    .join("、");

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
                  <Link className="inline-flex items-center gap-1.5" href={backHref}>
                    <ChevronLeft className="size-4" />
                    {backLabel}
                  </Link>
                </Button>
              </div>
            ) : null}

            <section
              className={`${backHref ? "mt-2.5" : "mt-0"} overflow-hidden rounded-[16px] border border-[#E8E5E0] shadow-[0_12px_26px_rgba(28,28,28,0.05)]`}
            >
              <div className="flex items-center gap-2 bg-[#2C2C2C] px-4 py-3 text-white">
                <MapPin className="size-4" />
                <p className="text-base font-semibold">{campusLabel ?? "上课校区"}</p>
              </div>

              <div className="space-y-3 bg-[var(--jp-surface)] px-4 py-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    {timeLabel ? (
                      <p className="text-[20px] font-medium tracking-[-0.03em] text-[var(--jp-text)]">
                        {timeLabel}
                      </p>
                    ) : (
                      <div />
                    )}
                    <MetaPill tone="neutral" className="shrink-0">
                      {datePillLabel}
                    </MetaPill>
                  </div>
                  <h2 className="text-[17px] font-medium tracking-[-0.02em] text-[var(--jp-text)]">
                    {displayMeta?.courseTitle ?? session.courseTitle}
                  </h2>
                </div>

                {locationLabel ? (
                  <div className="flex items-center justify-between rounded-[12px] border border-[color:var(--jp-border)] bg-white px-4 py-3">
                    <p className="text-[16px] font-semibold tracking-[-0.02em] text-[var(--jp-text)]">
                      {locationLabel}
                    </p>
                    <NavigationIcon />
                  </div>
                ) : null}

                {mode === "attendance" ? (
                  <div className="rounded-[12px] bg-[#FFF3E8] px-3 py-2.5 text-xs font-medium text-[#C46A1A]">
                    {session.deadlineHint}
                  </div>
                ) : rosterNotice ? (
                  <div className="flex items-start gap-2 rounded-[12px] bg-[#FFF7E7] px-3 py-2.5 text-[#7B5C1E] ring-1 ring-[#F0E1BD]">
                    <Info className="mt-0.5 size-3.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-[12px] font-semibold leading-5">{rosterNotice}</p>
                      <p className="text-[11px] font-medium leading-5 text-[#8C6B28]">
                        {datePillLabel}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            {mode === "attendance" ? (
              <>
                <div className="mt-3.5 flex flex-wrap gap-2">
                  <SummaryChip label="应到" value={summary.expected} tone="info" />
                  <SummaryChip label="已到" value={summary.present} tone="success" />
                  <SummaryChip label="请假" value={summary.leave} tone="neutral" />
                  <SummaryChip label="未到" value={summary.absent} tone="danger" />
                </div>

                <div className="mt-3.5 flex items-start gap-2 rounded-[16px] bg-[#E8F0FB] px-3.5 py-3 text-[#1E3A5F]">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  <p className="text-[11px] font-medium leading-5">{session.tapHint}</p>
                </div>
              </>
            ) : null}

            <div className="mt-3.5 grid grid-cols-3 gap-2 pb-6">
              {students.map((student) => (
                <AttendanceStudentCard
                  key={student.id}
                  name={student.name}
                  homeroomClass={student.homeroomClass}
                  status={student.status}
                  managerUpdated={student.managerUpdated}
                  overrideLabel={student.overrideLabel}
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
          </div>

          {mode === "attendance" ? (
            <div className="app-bottom-safe bg-[var(--jp-surface)] px-4 py-3 shadow-[0_-12px_24px_rgba(28,28,28,0.06)]">
              <DialogTrigger asChild>
                <Button className="h-11 w-full rounded-[12px] bg-[var(--jp-accent)] text-[var(--jp-bg)] hover:bg-[var(--jp-accent)]/90">
                  {session.submitLabel}
                </Button>
              </DialogTrigger>
            </div>
          ) : null}

          <MobileTabBar
            active={tabActive}
            items={[
              { key: "home", href: "/teacher/home" },
              { key: "attendance", href: "/teacher/attendance/demo" },
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
                  <p className={`text-sm font-semibold ${statusToneClass}`}>
                    {statusLabel} ({absentStudents.length > 0 ? summary.absent : summary.leave}人)
                  </p>
                  <DialogDescription className="text-sm leading-6 text-[#666666]">
                    {statusNames}
                  </DialogDescription>
                </div>

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
                    asChild
                    className="h-11 rounded-[8px] bg-[#1E3A5F] text-[15px] font-semibold text-white hover:bg-[#1E3A5F]/90"
                  >
                    <Link href="/teacher/home">确认提交</Link>
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
                      班级全勤
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-6 text-[#666666]">
                      本节课应到{summary.expected}人，实到{summary.present}人
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
                    asChild
                    className="h-11 rounded-[8px] bg-[#1E3A5F] text-[15px] font-semibold text-white hover:bg-[#1E3A5F]/90"
                  >
                    <Link href="/teacher/home">完成点名</Link>
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
}: {
  label: string;
  value: number;
  tone: "info" | "success" | "neutral" | "danger";
}) {
  const toneClass = {
    info: "bg-[#1E3A5F10] text-[#1E3A5F]",
    success: "bg-[#3d6b4f1a] text-[#3D6B4F]",
    neutral: "bg-[#1C1C1C12] text-[#1C1C1C]",
    danger: "bg-[#d52f2f1a] text-[#D32F2F]",
  }[tone];

  return (
    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${toneClass}`}>
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
