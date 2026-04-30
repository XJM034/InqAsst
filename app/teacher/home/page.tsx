"use client";

import { useEffect, useState } from "react";

import { TeacherHomeClient } from "@/components/app/teacher-home-client";
import { PageLoading } from "@/components/app/page-loading";
import { PageStatus } from "@/components/app/page-status";
import { getTeacherHomeData } from "@/lib/services/mobile-app";
import { reloadPage } from "@/lib/static-navigation";

export default function TeacherHomePage() {
  const [home, setHome] = useState<Awaited<ReturnType<typeof getTeacherHomeData>> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getTeacherHomeData()
      .then((data) => {
        if (!cancelled) {
          setHome(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "老师首页加载失败，请稍后重试");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (home) {
    return <TeacherHomeClient home={home} />;
  }

  if (!error) {
    return <PageLoading />;
  }

  return (
    <PageStatus
      title="老师首页加载失败"
      description={error}
      secondaryActionLabel="返回登录"
      secondaryActionHref="/login"
      primaryActionLabel="重新加载"
      onPrimaryAction={reloadPage}
    />
  );
}
