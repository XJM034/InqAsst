"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AttendanceSessionClient } from "@/components/app/attendance-session-client";
import { PageLoading } from "@/components/app/page-loading";
import { PageStatus } from "@/components/app/page-status";
import { SearchParamsSuspense } from "@/components/app/search-params-suspense";
import { PageShell } from "@/components/app/page-shell";
import { StaticLink } from "@/components/app/static-link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { AttendanceSession } from "@/lib/domain/types";
import { getAttendanceSession } from "@/lib/services/mobile-app";
import {
  buildTeacherAttendanceEntryPrompt,
  buildTeacherAttendanceSessionHref,
  buildTeacherRosterHref,
  resolveTeacherAttendanceEntryState,
} from "@/lib/teacher-attendance-entry";
import { navigateTo } from "@/lib/static-navigation";

export default function TeacherAttendanceSessionPage() {
  return (
    <SearchParamsSuspense>
      <TeacherAttendanceSessionPageInner />
    </SearchParamsSuspense>
  );
}

function TeacherAttendanceSessionPageInner() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") ?? undefined;
  const sessionId = searchParams.get("sessionId") ?? undefined;
  const courseSessionId = searchParams.get("courseSessionId") ?? undefined;
  const requestKey = courseId ? `${courseId}:${courseSessionId ?? sessionId ?? ""}` : null;

  const [session, setSession] = useState<Awaited<ReturnType<typeof getAttendanceSession>> | null>(
    null,
  );
  const [error, setError] = useState("");
  const [resolvedRequestKey, setResolvedRequestKey] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId || !requestKey) {
      return;
    }

    let cancelled = false;

    getAttendanceSession(courseId, courseSessionId ?? sessionId)
      .then((nextSession) => {
        if (!cancelled) {
          setSession(nextSession);
          setError("");
          setResolvedRequestKey(requestKey);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSession(null);
          setError(err instanceof Error ? err.message : "老师点名页加载失败，请稍后重试");
          setResolvedRequestKey(requestKey);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [courseId, courseSessionId, requestKey, sessionId]);

  if (!courseId) {
    return (
      <PageStatus
        title="老师点名页加载失败"
        description="缺少课程参数，无法进入老师点名页。"
        secondaryActionLabel="返回首页"
        secondaryActionHref="/teacher/home"
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  const currentSession = resolvedRequestKey === requestKey ? session : null;
  const currentError = resolvedRequestKey === requestKey ? error : "";

  if (!currentSession && !currentError) {
    return <PageLoading />;
  }

  if (!currentSession) {
    return (
      <PageStatus
        title="老师点名页加载失败"
        description={currentError || "当前无法读取点名课节。"}
        secondaryActionLabel="返回首页"
        secondaryActionHref="/teacher/home"
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  const entryState = resolveTeacherAttendanceEntryState({
    attendanceWindowActive: currentSession.attendanceWindowActive,
    rollCallStartAt: currentSession.rollCallStartAt,
    referenceSessionStartAt: currentSession.referenceSessionStartAt,
    referenceSessionEndAt: currentSession.referenceSessionEndAt,
  });

  if (entryState !== "attendance") {
    return <TeacherAttendanceGuard session={currentSession} />;
  }

  return <AttendanceSessionClient session={currentSession} />;
}

function TeacherAttendanceGuard({ session }: { session: AttendanceSession }) {
  const prompt = buildTeacherAttendanceEntryPrompt({
    source: "attendance",
    attendanceWindowActive: session.attendanceWindowActive,
    actionHref: buildTeacherAttendanceSessionHref(session.courseId, session.courseSessionId),
    rosterHref: buildTeacherRosterHref(session.courseId, session.courseSessionId),
    rollCallStartAt: session.rollCallStartAt,
    referenceSessionStartAt: session.referenceSessionStartAt,
    referenceSessionEndAt: session.referenceSessionEndAt,
  });

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
