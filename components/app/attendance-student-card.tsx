"use client";

import type { AttendanceStatus } from "@/lib/domain/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AttendanceStudentCardProps = {
  name: string;
  homeroomClass: string;
  status: AttendanceStatus;
  managerUpdated?: boolean;
  overrideLabel?: string;
  editable?: boolean;
  hideStatus?: boolean;
  onToggle?: () => void;
};

export function AttendanceStudentCard({
  name,
  homeroomClass,
  status,
  managerUpdated = false,
  overrideLabel,
  editable = false,
  hideStatus = false,
  onToggle,
}: AttendanceStudentCardProps) {
  const tone = hideStatus
    ? {
        card: "bg-[var(--jp-surface)] ring-[color:var(--jp-border)]",
        badge: "bg-[var(--jp-surface-muted)] text-[var(--jp-text-secondary)]",
        label: "",
      }
    : managerUpdated && overrideLabel
      ? {
          card: "bg-[#FFFDF8] ring-[#E59A52]",
          badge: "bg-[#FFF4EA] text-[#9A5A1F]",
          label: status === "present" ? "已到" : status === "leave" ? "请假" : "未到",
        }
      : status === "present"
        ? {
            card: "bg-[#F7FBF8] ring-[#D9E8DD]",
            badge: "bg-[#EAF2EC] text-[#3D6B4F]",
            label: "已到",
          }
        : status === "leave"
          ? {
              card: "bg-[#F5F3F0] ring-[#E8E5E0]",
              badge: "bg-[#ECE8E1] text-[#1C1C1C]",
              label: "请假",
            }
          : {
              card: "bg-[#FFF8F8] ring-[#F0D2D2]",
              badge: "bg-[#FCEBEC] text-[#D32F2F]",
              label: "未到",
            };

  return (
    <button
      type="button"
      onClick={editable ? onToggle : undefined}
      disabled={!editable}
      className={cn(
        "min-h-[88px] rounded-[12px] px-3 py-3 text-left ring-1 transition-transform",
        tone.card,
        editable ? "cursor-pointer active:translate-y-px" : "cursor-default",
      )}
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[var(--jp-text)]">{name}</p>
        <p className="text-xs text-[var(--jp-text-secondary)]">{homeroomClass}</p>
      </div>
      {hideStatus ? null : (
        <Badge className={cn("mt-3 rounded-full border-0 px-2.5 py-1 text-xs", tone.badge)}>
          {tone.label}
        </Badge>
      )}
    </button>
  );
}
