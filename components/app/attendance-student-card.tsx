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
        card: "border border-[color:var(--jp-border)] bg-[var(--jp-surface)] shadow-[0_8px_18px_rgba(28,28,28,0.03)]",
        badge: "bg-[var(--jp-surface-muted)] text-[var(--jp-text-secondary)]",
        label: "",
      }
      : managerUpdated && overrideLabel
        ? {
            card: "border border-[#E59A52] bg-[#FFFDF8] shadow-[0_8px_18px_rgba(196,106,26,0.05)]",
            badge: "bg-[#FFF4EA] text-[#9A5A1F]",
            label:
              status === "present"
                ? "已到"
                : status === "leave"
                  ? "请假"
                  : status === "unmarked"
                    ? "未点名"
                    : "未到",
          }
      : status === "present"
        ? {
            card: "border border-[#D9E8DD] bg-[#F7FBF8]",
            badge: "bg-[#EAF2EC] text-[#3D6B4F]",
            label: "已到",
          }
        : status === "leave"
          ? {
              card: "border border-[#E8E5E0] bg-[#F5F3F0]",
              badge: "bg-[#ECE8E1] text-[#1C1C1C]",
              label: "请假",
            }
          : status === "unmarked"
            ? {
                card: "border border-[#E4EAF1] bg-[#F7FAFD]",
                badge: "bg-[#EDF3F8] text-[#4C6177]",
                label: "未点名",
              }
          : {
              card: "border border-[#F0D2D2] bg-[#FFF8F8]",
              badge: "bg-[#FCEBEC] text-[#D32F2F]",
              label: "未到",
            };

  return (
    <button
      type="button"
      onClick={editable ? onToggle : undefined}
      disabled={!editable}
      className={cn(
        hideStatus
          ? "min-h-[76px] rounded-[14px] px-2.5 py-2.5"
          : "min-h-[86px] rounded-[14px] px-2.5 py-2.5",
        "text-left transition-transform",
        tone.card,
        editable ? "cursor-pointer active:translate-y-px" : "cursor-default",
      )}
    >
      <div className="space-y-1">
        <p className="text-[13px] font-semibold text-[var(--jp-text)]">{name}</p>
        <p className="text-[10px] leading-4 text-[var(--jp-text-secondary)]">{homeroomClass}</p>
      </div>
      {hideStatus ? null : (
        <Badge className={cn("mt-2.5 rounded-full border-0 px-2 py-1 text-[10px]", tone.badge)}>
          {tone.label}
        </Badge>
      )}
    </button>
  );
}
