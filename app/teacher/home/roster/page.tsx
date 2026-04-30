"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AttendanceSessionClient } from "@/components/app/attendance-session-client";
import { PageLoading } from "@/components/app/page-loading";
import { SearchParamsSuspense } from "@/components/app/search-params-suspense";
import type { AttendanceSession } from "@/lib/domain/types";
import { getAttendanceSession } from "@/lib/services/mobile-app";

const EMPTY_ROSTER_SESSION: AttendanceSession = {
  id: "teacher-home-roster-empty",
  pageTitle: "学生名单",
  dateLabel: "课程待确认",
  courseTitle: "课程待确认",
  courseInfo: "上课地点待定",
  deadlineHint: "",
  tapHint: "",
  submitLabel: "",
  students: [],
};

function buildRosterDisplayMeta(session: AttendanceSession) {
  return {
    pageTitle: "学生名单",
    dateLabel: session.dateLabel,
    courseTitle: session.courseTitle,
    courseInfo: session.courseInfo,
  };
}

export default function TeacherHomeRosterPage() {
  return (
    <SearchParamsSuspense>
      <TeacherHomeRosterPageInner />
    </SearchParamsSuspense>
  );
}

function TeacherHomeRosterPageInner() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") ?? undefined;
  const sessionId = searchParams.get("sessionId") ?? undefined;
  const courseSessionId = searchParams.get("courseSessionId") ?? undefined;

  return (
    <TeacherHomeRosterSessionLoader
      key={`${courseId ?? "empty"}:${courseSessionId ?? sessionId ?? ""}`}
      courseId={courseId}
      sessionId={sessionId}
      courseSessionId={courseSessionId}
    />
  );
}

function TeacherHomeRosterSessionLoader({
  courseId,
  sessionId,
  courseSessionId,
}: {
  courseId?: string;
  sessionId?: string;
  courseSessionId?: string;
}) {
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [loading, setLoading] = useState(Boolean(courseId));

  useEffect(() => {
    let cancelled = false;

    if (!courseId) {
      return () => {
        cancelled = true;
      };
    }

    getAttendanceSession(courseId, courseSessionId ?? sessionId)
      .then((data) => {
        if (!cancelled) {
          setSession(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSession(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [courseId, sessionId, courseSessionId]);

  if (loading) {
    return <PageLoading />;
  }

  const resolvedSession = session ?? EMPTY_ROSTER_SESSION;
  const displayMeta = buildRosterDisplayMeta(resolvedSession);
  const rosterNotice = session
    ? `${resolvedSession.courseTitle} 当前不在点名时间，可先查看学生名单。`
    : "当前课程还没有可查看的学生名单，请先返回首页确认课节。";

  return (
    <AttendanceSessionClient
      session={resolvedSession}
      mode="roster"
      displayMeta={displayMeta}
      rosterNotice={rosterNotice}
      tabActive="home"
      backHref="/teacher/home"
      backLabel="返回主页"
    />
  );
}
