import { normalizeApiBaseUrl } from "@/lib/services/api-base-url";

export const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL ?? "");

export const API_REQUEST_MODE =
  process.env.NEXT_PUBLIC_API_REQUEST_MODE ?? (API_BASE_URL ? "direct" : "proxy");
