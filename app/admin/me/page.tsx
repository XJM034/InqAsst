"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { PageLoading } from "@/components/app/page-loading";
import { PageStatus } from "@/components/app/page-status";
import { ProfilePage } from "@/components/app/profile-page";
import { buildAdminTabItems } from "@/lib/admin-campus";
import { getAdminProfile } from "@/lib/services/mobile-app";
import { SearchParamsSuspense } from "@/components/app/search-params-suspense";

export default function AdminMePage() {
  return (
    <SearchParamsSuspense>
      <AdminMePageInner />
    </SearchParamsSuspense>
  );
}

function AdminMePageInner() {
  const searchParams = useSearchParams();
  const campus = searchParams.get("campus") ?? undefined;

  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getAdminProfile>> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getAdminProfile()
      .then((p) => {
        if (!cancelled) {
          setProfile(p);
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

  if (!profile) {
    if (!error) {
      return <PageLoading />;
    }

    return (
      <PageStatus
        title="个人信息加载失败"
        description={error}
        secondaryActionLabel="返回首页"
        secondaryActionHref="/admin/home"
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  const activeCampusId = profile.activeCampusId ?? campus ?? profile.campusOptions[0]?.id ?? "chenghua";

  return (
    <ProfilePage
      name={profile.name}
      phone={profile.phone}
      roleLabel={profile.roleLabel}
      activeCampusId={activeCampusId}
      campusOptions={profile.campusOptions}
      tabItems={buildAdminTabItems(activeCampusId)}
    />
  );
}
