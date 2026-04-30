"use client";

import { useEffect } from "react";

import Link from "next/link";

export default function LegacyTeacherAttendanceRosterPage() {
  useEffect(() => {
    window.location.replace(`/teacher/home/roster${window.location.search}`);
  }, []);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--jp-bg)] px-6 text-center">
      <Link className="text-sm font-semibold text-[var(--jp-accent)]" href="/teacher/home/roster">
        前往学生名单
      </Link>
    </main>
  );
}
