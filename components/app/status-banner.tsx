import { AlertTriangle, Info } from "lucide-react";

import { cn } from "@/lib/utils";

type StatusBannerProps = {
  title: string;
  description: string;
  tone?: "info" | "warning";
};

const toneMap = {
  info: {
    icon: Info,
    className:
      "bg-[color-mix(in_srgb,var(--color-info)_62%,white)] text-[var(--color-info-foreground)]",
  },
  warning: {
    icon: AlertTriangle,
    className:
      "bg-[color-mix(in_srgb,var(--color-warning)_68%,white)] text-[var(--color-warning-foreground)]",
  },
};

export function StatusBanner({
  title,
  description,
  tone = "info",
}: StatusBannerProps) {
  const config = toneMap[tone];
  const Icon = config.icon;

  return (
    <section className={cn("rounded-[18px] p-4", config.className)}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-4 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs leading-5 opacity-90">{description}</p>
        </div>
      </div>
    </section>
  );
}
