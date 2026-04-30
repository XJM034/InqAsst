"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AttendanceGroupClient } from "@/components/app/attendance-group-client";
import { PageLoading } from "@/components/app/page-loading";
import { PageStatus } from "@/components/app/page-status";
import { SearchParamsSuspense } from "@/components/app/search-params-suspense";
import { getAttendanceGroup } from "@/lib/services/mobile-app";

export default function TeacherAttendanceGroupPage() {
  return (
    <SearchParamsSuspense>
      <TeacherAttendanceGroupPageInner />
    </SearchParamsSuspense>
  );
}

function TeacherAttendanceGroupPageInner() {
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId") ?? "";
  const [group, setGroup] = useState<Awaited<ReturnType<typeof getAttendanceGroup>> | null>(null);
  const [error, setError] = useState("");
  const [resolvedGroupId, setResolvedGroupId] = useState("");

  useEffect(() => {
    if (!groupId) {
      return;
    }

    let cancelled = false;

    getAttendanceGroup(groupId)
      .then((nextGroup) => {
        if (!cancelled) {
          setGroup(nextGroup);
          setError("");
          setResolvedGroupId(groupId);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setGroup(null);
          setError(err instanceof Error ? err.message : "合班点名页加载失败，请稍后重试");
          setResolvedGroupId(groupId);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [groupId]);

  if (!groupId) {
    return (
      <PageStatus
        title="合班点名页加载失败"
        description="缺少合班参数，无法进入合班点名页。"
        secondaryActionLabel="返回首页"
        secondaryActionHref="/teacher/home"
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  const currentGroup = resolvedGroupId === groupId ? group : null;
  const currentError = resolvedGroupId === groupId ? error : "";

  if (resolvedGroupId !== groupId && !currentError) {
    return <PageLoading />;
  }

  if (!currentGroup) {
    return (
      <PageStatus
        title="合班点名页加载失败"
        description={currentError || "当前没有可读取的合班点名任务。"}
        secondaryActionLabel="返回首页"
        secondaryActionHref="/teacher/home"
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  return <AttendanceGroupClient group={currentGroup} />;
}
