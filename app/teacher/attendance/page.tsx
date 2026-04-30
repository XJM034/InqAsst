"use client";

import { useEffect, useMemo, useState } from "react";

import { StaticLink } from "@/components/app/static-link";
import { PageLoading } from "@/components/app/page-loading";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getTeacherHomeData } from "@/lib/services/mobile-app";
import {
  resolveTeacherAttendanceTabDecision,
  type TeacherAttendanceEntryPrompt,
} from "@/lib/teacher-attendance-entry";
import { navigateTo } from "@/lib/static-navigation";

function getShanghaiTodayDayKey() {
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const shanghaiToday = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }),
  );

  return dayKeys[shanghaiToday.getDay()] ?? "mon";
}

function resolveTodayPrimaryCourse(home: Awaited<ReturnType<typeof getTeacherHomeData>>) {
  return (
    home.daySchedules.find((item) => item.dayKey === getShanghaiTodayDayKey())?.primaryCourse ??
    null
  );
}

export default function TeacherAttendanceEntryPage() {
  const [home, setHome] = useState<Awaited<ReturnType<typeof getTeacherHomeData>> | null>(null);

  useEffect(() => {
    let cancelled = false;

    getTeacherHomeData()
      .then((home) => {
        if (!cancelled) {
          setHome(home);
        }
      })
      .catch(() => {
        if (!cancelled) {
          navigateTo("/teacher/attendance/no-class", { replace: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const targetCourse = useMemo(() => (home ? resolveTodayPrimaryCourse(home) : null), [home]);
  const decision = useMemo(
    () => (home ? resolveTeacherAttendanceTabDecision(targetCourse) : null),
    [home, targetCourse],
  );

  useEffect(() => {
    if (!decision || decision.kind !== "redirect") {
      return;
    }

    navigateTo(decision.href, { replace: true });
  }, [decision]);

  useEffect(() => {
    if (!decision || decision.kind !== "no-class") {
      return;
    }
    navigateTo(decision.href, { replace: true });
  }, [decision]);

  if (!home) {
    return <PageLoading />;
  }

  if (!decision || decision.kind !== "prompt" || !targetCourse) {
    return <PageLoading />;
  }

  return <TeacherAttendanceEntryPromptDialog prompt={decision.prompt} />;
}

function TeacherAttendanceEntryPromptDialog({ prompt }: { prompt: TeacherAttendanceEntryPrompt }) {
  return (
    <PageShell>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) {
            navigateTo("/teacher/home", { replace: true });
          }
        }}
      >
        <div className="app-screen">
          <div className="app-scroll px-5 pt-4" />
        </div>

        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-[rgba(15,23,42,0.35)] backdrop-blur-0"
          className="max-w-[320px] gap-4 rounded-[16px] border-0 bg-white p-6 shadow-none ring-0"
        >
          <div className="space-y-4">
            <DialogTitle className="text-[18px] font-semibold text-[#1E3A5F]">
              {prompt.title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#666666]">
              {prompt.description}
            </DialogDescription>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigateTo("/teacher/home", { replace: true })}
              className="h-11 rounded-[8px] border-0 bg-[#F5F5F5] text-[15px] font-medium text-[var(--jp-text)] hover:bg-[#F5F5F5]"
            >
              返回首页
            </Button>
            <Button
              asChild
              className="h-11 rounded-[8px] bg-[#1E3A5F] text-[15px] font-semibold text-white hover:bg-[#1E3A5F]/90"
            >
              <StaticLink href={prompt.confirmHref}>{prompt.confirmLabel}</StaticLink>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
