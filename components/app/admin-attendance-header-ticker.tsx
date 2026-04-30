"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type AdminAttendanceHeaderTickerProps = {
  text: string;
  highlightText?: string;
  className?: string;
};

export function AdminAttendanceHeaderTicker({
  text,
  highlightText,
  className,
}: AdminAttendanceHeaderTickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    function updateOverflowState() {
      const container = containerRef.current;
      const textNode = textRef.current;

      if (!container || !textNode) {
        return;
      }

      setIsOverflowing(textNode.scrollWidth > container.clientWidth);
    }

    updateOverflowState();

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateOverflowState);

    if (resizeObserver && containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    if (resizeObserver && textRef.current) {
      resizeObserver.observe(textRef.current);
    }

    window.addEventListener("resize", updateOverflowState);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateOverflowState);
    };
  }, [highlightText, text]);

  function renderTickerText(content: string, emphasizedText?: string): ReactNode {
    if (!emphasizedText || !content.includes(emphasizedText)) {
      return content;
    }

    const parts = content.split(emphasizedText);

    return parts.flatMap((part, index) => {
      const isLast = index === parts.length - 1;

      if (isLast) {
        return [part];
      }

      return [
        part,
        <span
          key={`${emphasizedText}-${index}`}
          className="admin-attendance-ticker-highlight mx-1 inline-flex rounded-full bg-[#FFF0DD] px-1.5 py-0.5 font-semibold text-[#B85E0B] ring-1 ring-[#F4DAB9]"
        >
          {emphasizedText}
        </span>,
      ];
    });
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden whitespace-nowrap text-[12px] font-medium text-[var(--jp-text-secondary)]",
        className,
      )}
    >
      {isOverflowing ? (
        <div className="admin-attendance-ticker-track">
          <span className="admin-attendance-ticker-copy" ref={textRef}>
            {renderTickerText(text, highlightText)}
          </span>
          <span aria-hidden className="admin-attendance-ticker-copy">
            {renderTickerText(text, highlightText)}
          </span>
        </div>
      ) : (
        <span className="block" ref={textRef}>
          {renderTickerText(text, highlightText)}
        </span>
      )}
    </div>
  );
}
