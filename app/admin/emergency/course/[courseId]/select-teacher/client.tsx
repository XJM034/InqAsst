"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { normalizeAdminCampus, withCampusQuery } from "@/lib/admin-campus";
import {
  buildAdminEmergencyCourseHref,
  resolveStaticExportParam,
} from "@/lib/admin-route-hrefs";
import { TeacherSelectionClient } from "@/components/app/teacher-selection-client";
import { PageLoading } from "@/components/app/page-loading";
import { PageStatus } from "@/components/app/page-status";
import type { AdminTeacherSelectionData } from "@/lib/domain/types";
import { getAdminTeacherSelection } from "@/lib/services/mobile-app";

const PAGE_SIZE = 20;
const DEFAULT_TEACHER_LABEL = "待分配老师";

function sortTeacherOptions(data: AdminTeacherSelectionData) {
  return {
    ...data,
    teachers: [...data.teachers].sort((left, right) => {
      const leftPriority = left.selected ? 0 : left.source === "internal" ? 1 : 2;
      const rightPriority = right.selected ? 0 : right.source === "internal" ? 1 : 2;

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return 0;
    }),
  };
}

export function AdminTeacherSelectionClient() {
  const params = useParams<{ courseId: string }>();
  const searchParams = useSearchParams();
  const courseId = resolveStaticExportParam(params.courseId, searchParams.get("courseId"));
  const courseSessionId = searchParams.get("courseSessionId") ?? courseId;
  const returnHref = searchParams.get("returnHref") ?? undefined;
  const campus = searchParams.get("campus") ?? undefined;
  const initialSearchQuery = searchParams.get("q")?.trim() ?? "";
  const activeCampus = normalizeAdminCampus(campus);

  const [data, setData] = useState<AdminTeacherSelectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialSearchQuery);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  const requestVersionRef = useRef(0);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
    setDebouncedSearchQuery(initialSearchQuery);
    setData(null);
    setError("");
    setRefreshError("");
    setLoading(true);
    setIsRefreshing(false);
    hasLoadedRef.current = false;
  }, [courseId, courseSessionId, initialSearchQuery]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const nextSearchQuery = searchQuery.trim();
      if (nextSearchQuery === debouncedSearchQuery) {
        return;
      }

      if (hasLoadedRef.current) {
        setIsRefreshing(true);
      }
      setDebouncedSearchQuery(nextSearchQuery);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [debouncedSearchQuery, searchQuery]);

  useEffect(() => {
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;
    const isInitialLoad = !hasLoadedRef.current;

    if (isInitialLoad) {
      setLoading(true);
    }

    getAdminTeacherSelection(courseId, courseSessionId, {
      teacherType: "ALL",
      q: debouncedSearchQuery,
      page: 0,
      size: PAGE_SIZE,
      campus: activeCampus,
    })
      .then((nextData: Awaited<ReturnType<typeof getAdminTeacherSelection>>) => {
        if (requestVersionRef.current === requestVersion) {
          hasLoadedRef.current = true;
          setData(
            nextData
              ? {
                  ...sortTeacherOptions(nextData),
                  defaultTeacherLabel:
                    nextData.defaultTeacherLabel || DEFAULT_TEACHER_LABEL,
                }
              : null,
          );
          setError("");
          setRefreshError("");
          setLoading(false);
          setIsRefreshing(false);
        }
      })
      .catch((err) => {
        if (requestVersionRef.current === requestVersion) {
          const nextError = err instanceof Error ? err.message : "老师列表加载失败，请稍后重试";

          if (isInitialLoad) {
            setData(null);
            setError(nextError);
            setLoading(false);
          } else {
            setRefreshError(nextError);
          }

          setIsRefreshing(false);
        }
      });
  }, [activeCampus, courseId, courseSessionId, debouncedSearchQuery]);

  async function handleLoadMore() {
    if (isLoadingMore || !data?.hasNextPage) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const nextData = await getAdminTeacherSelection(courseId, courseSessionId, {
        teacherType: "ALL",
        q: debouncedSearchQuery,
        page: (data.currentPage ?? 0) + 1,
        size: PAGE_SIZE,
        campus: activeCampus,
      });
      if (!nextData) {
        return;
      }
      setData((prev: AdminTeacherSelectionData | null) => ({
        ...sortTeacherOptions({
          ...nextData,
          teachers: [...(prev?.teachers ?? []), ...nextData.teachers],
        }),
        defaultTeacherLabel:
          nextData.defaultTeacherLabel ||
          prev?.defaultTeacherLabel ||
          DEFAULT_TEACHER_LABEL,
      }));
    } finally {
      setIsLoadingMore(false);
    }
  }

  const emergencyBackHref = withCampusQuery(
    buildAdminEmergencyCourseHref(courseId, {
      courseSessionId,
    }),
    activeCampus,
  );

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <PageStatus
        title="老师列表加载失败"
        description={error}
        secondaryActionLabel="返回课程"
        secondaryActionHref={emergencyBackHref}
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  if (!data) {
    return (
      <PageStatus
        title="暂无可选老师"
        description="当前课程还没有可供选择的老师数据。"
        secondaryActionLabel="返回课程"
        secondaryActionHref={emergencyBackHref}
      />
    );
  }

  return (
    <TeacherSelectionClient
      campus={activeCampus}
      courseId={courseId}
      courseSessionId={courseSessionId}
      sessionDate={data.sessionDate}
      courseTitle={data.courseTitle}
      courseMeta={data.courseMeta}
      currentTeacherId={data.currentTeacherId}
      currentTeacherSource={data.currentTeacherSource}
      currentTeacherLabel={data.currentTeacherLabel ?? data.defaultTeacherLabel}
      defaultTeacherLabel={data.defaultTeacherLabel}
      teachers={data.teachers}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      hasNextPage={Boolean(data.hasNextPage)}
      isLoadingMore={isLoadingMore}
      isRefreshing={isRefreshing}
      refreshError={refreshError}
      onLoadMore={handleLoadMore}
      returnHref={returnHref}
    />
  );
}
