"use client";

import { cn } from "@/lib/utils";

type AdminRefreshWarningProps = {
  message?: string;
  className?: string;
};

export function AdminRefreshWarning({
  message,
  className,
}: AdminRefreshWarningProps) {
  const normalizedMessage = message?.trim();
  const detail = normalizedMessage
    ? `旧数据已隐藏。${normalizedMessage}`
    : "旧数据已隐藏，请稍后重试。";

  return (
    <section
      className={cn(
        "rounded-[16px] border border-[#F2DEC2] bg-[#FFF7EA] p-3.5 shadow-[0_10px_22px_rgba(196,106,26,0.08)]",
        className,
      )}
    >
      <p className="text-[13px] font-bold text-[#A55B14]">当前筛选结果刷新失败</p>
      <p className="mt-1 text-[12px] leading-5 text-[#7A5A2A]">{detail}</p>
    </section>
  );
}
