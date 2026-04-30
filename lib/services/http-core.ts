import { API_BASE_URL, API_REQUEST_MODE } from "@/lib/services/api-config";

type NextFetchOptions = {
  revalidate?: number | false;
  tags?: string[];
};

export type ApiEnvelope<T> = {
  code?: number;
  message?: string;
  data: T;
};

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | unknown[] | null;
  token?: string | null;
  next?: NextFetchOptions;
  timeoutMs?: number;
  retry?: number | false;
};

export class ApiRequestError extends Error {
  status: number;
  code?: number;
  payload?: unknown;

  constructor(message: string, status: number, code?: number, payload?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

function isSerializableBody(body: ApiRequestOptions["body"]) {
  return (
    body !== null &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer)
  );
}

const DEFAULT_API_TIMEOUT_MS = 15_000;
const DEFAULT_RETRY_DELAY_MS = 300;
const RETRYABLE_METHODS = new Set(["GET", "HEAD"]);
const RETRYABLE_STATUS_CODES = new Set([408, 500, 502, 503, 504]);
const ADMIN_ROLL_CALL_DEBUG_PREFIX = "[AdminRollCallDebug]";

function getRequestMethod(method?: string) {
  return (method ?? "GET").toUpperCase();
}

export function normalizeProxyApiPath(
  path: string,
  requestMode = API_REQUEST_MODE,
) {
  void requestMode;
  return path;
}

function isRetryableMethod(method: string) {
  return RETRYABLE_METHODS.has(method);
}

function resolveRetryCount(method: string, retry?: number | false) {
  if (retry === false) {
    return 0;
  }

  if (typeof retry === "number") {
    return Math.max(0, retry);
  }

  return isRetryableMethod(method) ? 1 : 0;
}

function shouldRetryStatus(method: string, status: number) {
  return isRetryableMethod(method) && RETRYABLE_STATUS_CODES.has(status);
}

function shouldRetryTransportError(method: string, error: unknown) {
  if (!isRetryableMethod(method)) {
    return false;
  }

  if (error instanceof ApiRequestError) {
    return error.status === 408;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const normalized = error.message.trim().toLowerCase();
  return (
    normalized === "fetch failed" ||
    normalized.includes("timed out") ||
    normalized.includes("timeout") ||
    normalized.includes("etimedout") ||
    normalized.includes("econnreset")
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldDebugAdminHomeRequest(path: string) {
  return path.includes("/api/admin/me") || path.includes("/api/admin/home/summary");
}

function debugAdminHomeRequest(event: string, payload?: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof payload === "undefined") {
    console.log(`${ADMIN_ROLL_CALL_DEBUG_PREFIX} ${event}`);
    return;
  }

  console.log(`${ADMIN_ROLL_CALL_DEBUG_PREFIX} ${event}`, payload);
}

function summarizeDebugPayload(payload: unknown) {
  if (typeof payload === "string") {
    return {
      payloadType: "string",
      preview: payload.slice(0, 160),
    };
  }

  if (payload === null) {
    return {
      payloadType: "null",
      hasData: false,
    };
  }

  if (typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    return {
      payloadType: "object",
      code: typeof record.code === "number" ? record.code : undefined,
      message: typeof record.message === "string" ? record.message : undefined,
      hasData: Object.prototype.hasOwnProperty.call(record, "data"),
      dataIsNull: Object.prototype.hasOwnProperty.call(record, "data") ? record.data === null : undefined,
      dataType: Object.prototype.hasOwnProperty.call(record, "data")
        ? record.data === null
          ? "null"
          : Array.isArray(record.data)
            ? "array"
            : typeof record.data
        : undefined,
    };
  }

  return {
    payloadType: typeof payload,
    value: payload,
  };
}

function mergeAbortSignals(signals: AbortSignal[]) {
  if (signals.length === 0) {
    return {
      signal: undefined,
      cleanup: () => {},
    };
  }

  if (signals.length === 1) {
    return {
      signal: signals[0],
      cleanup: () => {},
    };
  }

  const controller = new AbortController();
  const listeners = new Map<AbortSignal, () => void>();

  function cleanup() {
    for (const [signal, listener] of listeners) {
      signal.removeEventListener("abort", listener);
    }
    listeners.clear();
  }

  function abortWith(signal: AbortSignal) {
    cleanup();
    controller.abort(signal.reason);
  }

  for (const signal of signals) {
    if (signal.aborted) {
      abortWith(signal);
      return {
        signal: controller.signal,
        cleanup,
      };
    }

    const listener = () => abortWith(signal);
    listeners.set(signal, listener);
    signal.addEventListener("abort", listener, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup,
  };
}

async function fetchWithTimeout(
  requestUrl: string,
  options: RequestInit,
  timeoutMs: number,
) {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort("request-timeout");
  }, timeoutMs);
  const signals = [options.signal, timeoutController.signal].filter(
    (signal): signal is AbortSignal => Boolean(signal),
  );
  const { signal, cleanup } = mergeAbortSignals(signals);

  try {
    return await fetch(requestUrl, {
      ...options,
      signal,
    });
  } catch (error) {
    if (
      timeoutController.signal.aborted &&
      timeoutController.signal.reason === "request-timeout" &&
      !options.signal?.aborted
    ) {
      throw new ApiRequestError(`Request timed out after ${timeoutMs}ms`, 408);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
    cleanup();
  }
}

async function parseResponseBody(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const rawText = await response.text();

  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return rawText;
  }
}

export async function requestJson<T>(path: string, options: ApiRequestOptions = {}) {
  const { body, headers, token, timeoutMs = DEFAULT_API_TIMEOUT_MS, retry, ...rest } = options;
  const requestHeaders = new Headers(headers);
  const method = getRequestMethod(rest.method);
  const retryCount = resolveRetryCount(method, retry);
  const normalizedPath = normalizeProxyApiPath(path);

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let requestBody = body as BodyInit | null | undefined;

  if (isSerializableBody(body)) {
    requestHeaders.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  const requestUrl = (() => {
    if (/^https?:\/\//.test(normalizedPath)) {
      return normalizedPath;
    }

    if (typeof window !== "undefined") {
      // Static exports can't rely on Next.js rewrites at runtime, so absolute API bases default to direct requests.
      if (API_REQUEST_MODE !== "proxy" && API_BASE_URL) {
        return `${API_BASE_URL}${normalizedPath}`;
      }

      // Explicit proxy mode keeps browser requests same-origin for local dev proxying.
      return normalizedPath;
    }

    return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
  })();
  const shouldDebug = shouldDebugAdminHomeRequest(normalizedPath);

  if (shouldDebug) {
    debugAdminHomeRequest("http.request.start", {
      path: normalizedPath,
      requestUrl,
      method,
      hasToken: Boolean(token),
      requestMode: API_REQUEST_MODE,
      hasApiBaseUrl: Boolean(API_BASE_URL),
    });
  }

  let attempt = 0;

  while (true) {
    let response: Response;

    try {
      response = await fetchWithTimeout(
        requestUrl,
        {
          ...rest,
          body: requestBody,
          headers: requestHeaders,
        },
        timeoutMs,
      );
    } catch (error) {
      if (shouldDebug) {
        debugAdminHomeRequest("http.request.transport-error", {
          path: normalizedPath,
          requestUrl,
          method,
          attempt,
          error: error instanceof Error ? error.message : String(error),
        });
      }
      if (attempt < retryCount && shouldRetryTransportError(method, error)) {
        attempt += 1;
        await delay(DEFAULT_RETRY_DELAY_MS);
        continue;
      }

      throw error;
    }

    if (!response.ok && attempt < retryCount && shouldRetryStatus(method, response.status)) {
      attempt += 1;
      await delay(DEFAULT_RETRY_DELAY_MS);
      continue;
    }

    const payload = await parseResponseBody(response);

    if (shouldDebug) {
      debugAdminHomeRequest("http.request.response", {
        path: normalizedPath,
        requestUrl,
        method,
        attempt,
        status: response.status,
        ok: response.ok,
        payload,
        payloadSummary: summarizeDebugPayload(payload),
      });
    }

    if (!response.ok) {
      const message =
        typeof payload === "object" &&
        payload !== null &&
        "message" in payload &&
        typeof payload.message === "string"
          ? payload.message
          : `Request failed with status ${response.status}`;
      const code =
        typeof payload === "object" &&
        payload !== null &&
        "code" in payload &&
        typeof payload.code === "number"
          ? payload.code
          : undefined;

      throw new ApiRequestError(message, response.status, code, payload);
    }

    return payload as T;
  }
}

export function unwrapEnvelope<T>(payload: ApiEnvelope<T>) {
  if (typeof payload?.code === "number" && payload.code >= 400) {
    throw new ApiRequestError(
      payload.message ?? "API returned an error",
      200,
      payload.code,
      payload,
    );
  }

  return payload.data;
}
