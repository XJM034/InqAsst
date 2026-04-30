"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { buildAdminTabItems, normalizeAdminCampus, withCampusQuery } from "@/lib/admin-campus";
import { buildCourseTeachersRefreshFailureData } from "@/lib/admin-refresh-state";
import { AdminCourseTeachersClient } from "@/components/app/admin-course-teachers-client";
import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { PageStatus } from "@/components/app/page-status";
import { SearchParamsSuspense } from "@/components/app/search-params-suspense";
import type { AdminCourseTeachersData, AdminEmergencyDayKey } from "@/lib/domain/types";
import { getAdminCourseTeachersData } from "@/lib/services/mobile-app";

const PAGE_SIZE = 20;

function getShanghaiTodayDayKey(): AdminEmergencyDayKey {
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const shanghaiNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }),
  );
  return dayKeys[shanghaiNow.getDay()] ?? "mon";
}

function getShanghaiWeekStart() {
  const shanghaiNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }),
  );
  const day = shanghaiNow.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  shanghaiNow.setDate(shanghaiNow.getDate() + mondayOffset);
  const y = shanghaiNow.getFullYear();
  const m = String(shanghaiNow.getMonth() + 1).padStart(2, "0");
  const d = String(shanghaiNow.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const DEFAULT_DAY_KEY = getShanghaiTodayDayKey();
const EMPTY_COURSE_TEACHERS_DATA: AdminCourseTeachersData = {
  title: "查看课程老师",
  searchPlaceholder: "搜索老师姓名 / 手机号",
  days: [
    { key: "mon", label: "周一", active: DEFAULT_DAY_KEY === "mon" },
    { key: "tue", label: "周二", active: DEFAULT_DAY_KEY === "tue" },
    { key: "wed", label: "周三", active: DEFAULT_DAY_KEY === "wed" },
    { key: "thu", label: "周四", active: DEFAULT_DAY_KEY === "thu" },
    { key: "fri", label: "周五", active: DEFAULT_DAY_KEY === "fri" },
    { key: "sat", label: "周六", active: DEFAULT_DAY_KEY === "sat" },
    { key: "sun", label: "周日", active: DEFAULT_DAY_KEY === "sun" },
  ],
  defaultDayKey: DEFAULT_DAY_KEY,
  selectedDayKey: DEFAULT_DAY_KEY,
  teachers: [],
  teachersPage: {
    page: 0,
    size: PAGE_SIZE,
    totalPages: 0,
    totalElements: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

export default function AdminCourseTeachersPage() {
  return (
    <SearchParamsSuspense>
      <AdminCourseTeachersPageInner />
    </SearchParamsSuspense>
  );
}

function AdminCourseTeachersPageInner() {
  const searchParams = useSearchParams();
  const campus = searchParams.get("campus") ?? undefined;
  const activeCampus = normalizeAdminCampus(campus);

  const [weekStart] = useState(getShanghaiWeekStart);
  const [selectedDayKey, setSelectedDayKey] = useState<AdminEmergencyDayKey>(DEFAULT_DAY_KEY);
  const [requestDayKey, setRequestDayKey] = useState<AdminEmergencyDayKey | undefined>(undefined);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<AdminCourseTeachersData>(EMPTY_COURSE_TEACHERS_DATA);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const requestKey = JSON.stringify({
    weekStart,
    dayKey: requestDayKey ?? "",
    q: debouncedSearchQuery,
    page,
  });
  const [resolvedRequestKey, setResolvedRequestKey] = useState<string | null>(null);

  const requestVersionRef = useRef(0);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (hasLoadedRef.current) {
        setIsRefreshing(true);
      }
      setDebouncedSearchQuery(searchInput.trim());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;
    const isInitialLoad = !hasLoadedRef.current;

    getAdminCourseTeachersData({
      weekStart,
      dayKey: requestDayKey,
      q: debouncedSearchQuery || undefined,
      page,
      size: PAGE_SIZE,
    })
      .then((nextData) => {
        if (requestVersionRef.current !== requestVersion) {
          return;
        }

        hasLoadedRef.current = true;
        setHasLoadedOnce(true);
        setData(nextData);
        setSelectedDayKey(
          (nextData.selectedDayKey ?? nextData.defaultDayKey) as AdminEmergencyDayKey,
        );
        setError("");
        setLoading(false);
        setIsRefreshing(false);
        setResolvedRequestKey(requestKey);
      })
      .catch((err) => {
        if (requestVersionRef.current !== requestVersion) {
          return;
        }

        setError(err instanceof Error ? err.message : "课程老师页面加载失败，请稍后重试");
        if (isInitialLoad) {
          setData(EMPTY_COURSE_TEACHERS_DATA);
          setSelectedDayKey(DEFAULT_DAY_KEY);
          setLoading(false);
        }
        setIsRefreshing(false);
        setResolvedRequestKey(requestKey);
      });
  }, [debouncedSearchQuery, page, requestDayKey, requestKey, weekStart]);

  function handleDayChange(dayKey: AdminEmergencyDayKey) {
    if (hasLoadedRef.current) {
      setIsRefreshing(true);
    }
    setSelectedDayKey(dayKey);
    setRequestDayKey(dayKey);
    setPage(0);
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setPage(0);
    setRequestDayKey((currentDayKey) => currentDayKey ?? selectedDayKey);
  }

  function handlePrevPage() {
    if (!data?.teachersPage?.hasPrevPage) {
      return;
    }

    if (hasLoadedRef.current) {
      setIsRefreshing(true);
    }
    setRequestDayKey((currentDayKey) => currentDayKey ?? selectedDayKey);
    setPage((currentPage) => Math.max(currentPage - 1, 0));
  }

  function handleNextPage() {
    if (!data?.teachersPage?.hasNextPage) {
      return;
    }

    if (hasLoadedRef.current) {
      setIsRefreshing(true);
    }
    setRequestDayKey((currentDayKey) => currentDayKey ?? selectedDayKey);
    setPage((currentPage) => currentPage + 1);
  }

  const currentError = resolvedRequestKey === requestKey ? error : "";
  const renderedData =
    currentError && hasLoadedOnce
      ? buildCourseTeachersRefreshFailureData({
          ...data,
          selectedDayKey,
        })
      : {
          ...data,
          selectedDayKey,
        };

  if (!loading && currentError && !hasLoadedOnce) {
    return (
      <PageStatus
        title="课程老师页面加载失败"
        description={currentError || "当前无法读取课程老师列表。"}
        secondaryActionLabel="返回首页"
        secondaryActionHref={withCampusQuery("/admin/home", activeCampus)}
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader
            title={data.title}
            backHref={withCampusQuery("/admin/home", activeCampus)}
          />
          <AdminCourseTeachersClient
            data={renderedData}
            loading={loading}
            isRefreshing={isRefreshing}
            refreshError={currentError && hasLoadedOnce ? currentError : ""}
            searchQuery={searchInput}
            onSearchQueryChange={handleSearchChange}
            onDayChange={handleDayChange}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
          />
        </div>
        <MobileTabBar active="home" items={buildAdminTabItems(activeCampus)} />
      </div>
    </PageShell>
  );
}
