import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DayChipScrollProps = {
  children: ReactNode;
  viewportClassName?: string;
  contentClassName?: string;
};

export function DayChipScroll({
  children,
  viewportClassName,
  contentClassName,
}: DayChipScrollProps) {
  return (
    <div
      className={cn(
        "overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        viewportClassName,
      )}
    >
      <div className={cn("flex w-max min-w-full gap-2", contentClassName)}>{children}</div>
    </div>
  );
}
