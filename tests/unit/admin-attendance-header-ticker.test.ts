// @vitest-environment jsdom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import { AdminAttendanceHeaderTicker } from "@/components/app/admin-attendance-header-ticker";

describe("admin attendance header ticker", () => {
  let container: HTMLDivElement;
  let root: Root;
  const originalActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment;
  });

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.unstubAllGlobals();
  });

  it("renders a static single-line label when the text fits", () => {
    act(() => {
      root.render(createElement(AdminAttendanceHeaderTicker, { text: "短文案" }));
    });

    const outer = container.firstElementChild as HTMLDivElement | null;
    const singleCopy = container.querySelector("span");
    expect(outer).not.toBeNull();
    expect(singleCopy).not.toBeNull();

    Object.defineProperty(outer!, "clientWidth", {
      configurable: true,
      value: 240,
    });
    Object.defineProperty(singleCopy!, "scrollWidth", {
      configurable: true,
      value: 120,
    });

    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(container.querySelector(".admin-attendance-ticker-track")).toBeNull();
    expect(container.textContent).toContain("短文案");
  });

  it("switches to a marquee track when the text overflows", () => {
    act(() => {
      root.render(
        createElement(AdminAttendanceHeaderTicker, {
          text: "成都嘉祥外国语学校 · 2026/4/22（周三） · 已上课 5 min，请及时确认学生点名情况",
        }),
      );
    });

    const outer = container.firstElementChild as HTMLDivElement | null;
    const singleCopy = container.querySelector("span");
    expect(outer).not.toBeNull();
    expect(singleCopy).not.toBeNull();

    Object.defineProperty(outer!, "clientWidth", {
      configurable: true,
      value: 180,
    });
    Object.defineProperty(singleCopy!, "scrollWidth", {
      configurable: true,
      value: 360,
    });

    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(container.querySelector(".admin-attendance-ticker-track")).not.toBeNull();
    expect(container.querySelectorAll(".admin-attendance-ticker-copy")).toHaveLength(2);
  });

  it("emphasizes the provided deadline segment", () => {
    act(() => {
      root.render(
        createElement(AdminAttendanceHeaderTicker, {
          text: "成都嘉祥外国语学校 · 2026/4/22（周三） · 16:00-17:30 · 请于 16:05 前完成点名",
          highlightText: "16:05 前完成点名",
        }),
      );
    });

    const highlights = container.querySelectorAll(".admin-attendance-ticker-highlight");

    expect(highlights).toHaveLength(1);
    expect(highlights[0]?.textContent).toBe("16:05 前完成点名");
    expect(container.textContent).toContain("请于 16:05 前完成点名");
  });
});
