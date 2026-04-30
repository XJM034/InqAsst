"use client";

import { useEffect, useState } from "react";

import { ProfilePage } from "@/components/app/profile-page";
import { PageLoading } from "@/components/app/page-loading";
import { PageStatus } from "@/components/app/page-status";
import { getTeacherProfile } from "@/lib/services/mobile-app";
import { reloadPage } from "@/lib/static-navigation";

export default function TeacherMePage() {
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getTeacherProfile>> | null>(
    null,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getTeacherProfile()
      .then((data) => {
        if (!cancelled) {
          setProfile(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "个人信息加载失败，请稍后重试");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (profile) {
    const maskedPhone = profile.phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");

    return (
      <ProfilePage
        name={profile.name}
        phone={maskedPhone}
        tabItems={[
          { key: "home", href: "/teacher/home" },
          { key: "attendance", href: "/teacher/attendance" },
          { key: "profile", href: "/teacher/me" },
        ]}
      />
    );
  }

  if (!error) {
    return <PageLoading />;
  }

  return (
    <PageStatus
      title="个人信息加载失败"
      description={error}
      secondaryActionLabel="返回首页"
      secondaryActionHref="/teacher/home"
      primaryActionLabel="重新加载"
      onPrimaryAction={reloadPage}
    />
  );
}
