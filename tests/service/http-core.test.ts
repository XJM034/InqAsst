import {
  ApiRequestError,
  normalizeProxyApiPath,
  requestJson,
} from "@/lib/services/http-core";

describe("http-core transport behavior", () => {
  const originalFetch = global.fetch;
  const originalWindow = global.window;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (typeof originalWindow === "undefined") {
      delete (global as typeof global & { window?: Window }).window;
    } else {
      global.window = originalWindow;
    }
    vi.useRealTimers();
  });

  it("retries a GET request once after a retryable upstream response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("temporary failure", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 0, data: { ok: true } }), { status: 200 }),
      );
    global.fetch = fetchMock as typeof fetch;

    const request = requestJson<{ code: number; data: { ok: boolean } }>("/api/example");

    await vi.runAllTimersAsync();

    await expect(request).resolves.toEqual({
      code: 0,
      data: {
        ok: true,
      },
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("fails fast with a timeout error when the proxy request hangs", async () => {
    global.fetch = vi.fn((_input, init) => {
      const signal = init?.signal;

      return new Promise((_resolve, reject) => {
        signal?.addEventListener(
          "abort",
          () => {
            reject(signal.reason ?? new Error("aborted"));
          },
          { once: true },
        );
      });
    }) as typeof fetch;

    const request = requestJson("/api/example", {
      retry: false,
      timeoutMs: 25,
    });
    const expectation = expect(request).rejects.toEqual(
      expect.objectContaining<ApiRequestError>({
        message: "Request timed out after 25ms",
        status: 408,
      }),
    );

    await vi.advanceTimersByTimeAsync(25);

    await expectation;
  });

  it("keeps proxy api paths unchanged", () => {
    expect(normalizeProxyApiPath("/api/teacher/home?weekStart=2026-04-20")).toBe(
      "/api/teacher/home?weekStart=2026-04-20",
    );
    expect(normalizeProxyApiPath("http://127.0.0.1:3000/api/me")).toBe(
      "http://127.0.0.1:3000/api/me",
    );
    expect(normalizeProxyApiPath("/api/teacher/courses/today/#hash")).toBe(
      "/api/teacher/courses/today/#hash",
    );
  });

  it("keeps direct-mode api paths unchanged", () => {
    expect(
      normalizeProxyApiPath("/api/teacher/home?weekStart=2026-04-20", "direct"),
    ).toBe("/api/teacher/home?weekStart=2026-04-20");
  });

  it("uses unchanged proxy api paths for browser-side fetches", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ code: 0, data: { ok: true } }), { status: 200 }),
    );
    global.fetch = fetchMock as typeof fetch;
    global.window = {} as Window & typeof globalThis;

    await expect(
      requestJson<{ code: number; data: { ok: boolean } }>(
        "/api/teacher/home?weekStart=2026-04-20",
      ),
    ).resolves.toEqual({
      code: 0,
      data: {
        ok: true,
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/teacher/home?weekStart=2026-04-20",
      expect.any(Object),
    );
  });
});
