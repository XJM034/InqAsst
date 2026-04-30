"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { buildAdminTabItems, normalizeAdminCampus, withCampusQuery } from "@/lib/admin-campus";
import { buildEmergencyRefreshFailureData } from "@/lib/admin-refresh-state";
import {
  AdminEmergencyClient,
  withSelectedEmergencyDay,
} from "@/components/app/admin-emergency-client";
import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { PageStatus } from "@/components/app/page-status";
import { SearchParamsSuspense } from "@/components/app/search-params-suspense";
import type { AdminEmergencyData, AdminEmergencyDayKey } from "@/lib/domain/types";
import { getAdminEmergencyWeeklyData } from "@/lib/services/mobile-app";

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

const EMPTY_DAY_KEY = getShanghaiTodayDayKey();

const EMPTY_EMERGENCY_DATA: AdminEmergencyData = {
  days: [
    { key: "mon", label: "周一", active: EMPTY_DAY_KEY === "mon" },
    { key: "tue", label: "周二", active: EMPTY_DAY_KEY === "tue" },
    { key: "wed", label: "周三", active: EMPTY_DAY_KEY === "wed" },
    { key: "thu", label: "周四", active: EMPTY_DAY_KEY === "thu" },
    { key: "fri", label: "周五", active: EMPTY_DAY_KEY === "fri" },
    { key: "sat", label: "周六", active: EMPTY_DAY_KEY === "sat" },
    { key: "sun", label: "周日", active: EMPTY_DAY_KEY === "sun" },
  ],
  selectedDayKey: EMPTY_DAY_KEY,
  featuredDateLabel: "今日代课课程",
  featuredCourses: [],
  courses: {
    items: [],
    page: 0,
    size: PAGE_SIZE,
    totalPages: 0,
    totalElements: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

function paginateEmergencyData(
  data: AdminEmergencyData,
  page: number,
  size: number,
): AdminEmergencyData {
  const totalElements = data.courses.items.length;
  const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / size);
  const resolvedPage = totalPages === 0 ? 0 : Math.min(page, totalPages - 1);
  const start = resolvedPage * size;

  return {
    ...data,
    courses: {
      items: data.courses.items.slice(start, start + size),
      page: resolvedPage,
      size,
      totalPages,
      totalElements,
      hasNextPage: resolvedPage + 1 < totalPages,
      hasPrevPage: resolvedPage > 0,
    },
  };
}

export default function AdminEmergencyPage() {
  return (
    <SearchParamsSuspense>
      <AdminEmergencyPageInner />
    </SearchParamsSuspense>
  );
}

function AdminEmergencyPageInner() {
  const searchParams = useSearchParams();
  const campus = searchParams.get("campus") ?? undefined;
  const activeCampus = normalizeAdminCampus(campus);

  const [weekStart] = useState(getShanghaiWeekStart);
  const [selectedDayKey, setSelectedDayKey] = useState<AdminEmergencyDayKey>(EMPTY_DAY_KEY);
  const [requestDayKey, setRequestDayKey] = useState<AdminEmergencyDayKey | undefined>(undefined);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<AdminEmergencyData>(EMPTY_EMERGENCY_DATA);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const requestKey = JSON.stringify({
    weekStart,
    dayKey: requestDayKey ?? "",
    q: debouncedSearchQuery,
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

    getAdminEmergencyWeeklyData({
      weekStart,
      dayKey: requestDayKey,
      q: debouncedSearchQuery || undefined,
    })
      .then((nextData) => {
        if (requestVersionRef.current !== requestVersion) {
          return;
        }

        hasLoadedRef.current = true;
        setHasLoadedOnce(true);
        setData(nextData);
        setSelectedDayKey(nextData.selectedDayKey);
        setError("");
        setLoading(false);
        setIsRefreshing(false);
        setResolvedRequestKey(requestKey);
      })
      .catch((err) => {
        if (requestVersionRef.current !== requestVersion) {
          return;
        }

        setError(err instanceof Error ? err.message : "老师设置加载失败，请稍后重试");
        if (isInitialLoad) {
          setData(EMPTY_EMERGENCY_DATA);
          setSelectedDayKey(EMPTY_DAY_KEY);
          setLoading(false);
        }
        setIsRefreshing(false);
        setResolvedRequestKey(requestKey);
      });
  }, [debouncedSearchQuery, requestDayKey, requestKey, weekStart]);

  const pagedData = paginateEmergencyData(data, page, PAGE_SIZE);
  const currentError = resolvedRequestKey === requestKey ? error : "";
  const renderedData =
    currentError && hasLoadedOnce
      ? buildEmergencyRefreshFailureData(withSelectedEmergencyDay(pagedData, selectedDayKey))
      : withSelectedEmergencyDay(pagedData, selectedDayKey);

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
  }

  function handlePrevPage() {
    if (!pagedData.courses.hasPrevPage) {
      return;
    }

    setPage((currentPage) => Math.max(currentPage - 1, 0));
  }

  function handleNextPage() {
    if (!pagedData.courses.hasNextPage) {
      return;
    }

    setPage((currentPage) => currentPage + 1);
  }

  if (!loading && currentError && !hasLoadedOnce) {
    return (
      <PageStatus
        title="老师设置加载失败"
        description={currentError || "当前无法读取老师设置列表。"}
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
            title="老师设置"
            backHref={withCampusQuery("/admin/home", activeCampus)}
          />
          <AdminEmergencyClient
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
