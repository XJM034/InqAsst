const DEFAULT_ADMIN_CAMPUS = "chenghua";

export function normalizeAdminCampus(campus: string | null | undefined) {
  if (!campus) {
    return DEFAULT_ADMIN_CAMPUS;
  }

  return campus;
}

export function withCampusQuery(href: string, campus: string) {
  const normalizedCampus = normalizeAdminCampus(campus);

  if (normalizedCampus === DEFAULT_ADMIN_CAMPUS) {
    return href;
  }

  const [pathname, hash = ""] = href.split("#");
  const [basePath, queryString = ""] = pathname.split("?");
  const params = new URLSearchParams(queryString);
  params.set("campus", normalizedCampus);

  const nextQuery = params.toString();
  const nextHref = nextQuery ? `${basePath}?${nextQuery}` : basePath;

  return hash ? `${nextHref}#${hash}` : nextHref;
}

export function buildAdminTabItems(campus: string) {
  return [
    { key: "home" as const, href: withCampusQuery("/admin/home", campus) },
    { key: "attendance" as const, href: withCampusQuery("/admin/control", campus) },
    { key: "profile" as const, href: withCampusQuery("/admin/me", campus) },
  ];
}

export function buildAdminAttendanceTabs(campus: string, active: "control" | "unarrived") {
  return [
    {
      label: "课程管理",
      href: withCampusQuery("/admin/control", campus),
      active: active === "control",
    },
    {
      label: "未到学生管理",
      href: withCampusQuery("/admin/unarrived", campus),
      active: active === "unarrived",
    },
  ];
}

export function buildAdminControlBackHref(campus: string) {
  return withCampusQuery("/admin/control", campus);
}
