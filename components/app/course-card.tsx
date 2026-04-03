import { Clock3, MapPin, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CourseCardProps = {
  title: string;
  campus: string;
  location: string;
  time: string;
  studentCount: number;
  status?: string;
  tone?: "default" | "warning" | "success";
  substitute?: boolean;
};

const toneClasses = {
  default: "bg-[color-mix(in_srgb,var(--color-info)_45%,white)] text-[var(--color-info-foreground)]",
  warning:
    "bg-[color-mix(in_srgb,var(--color-warning)_65%,white)] text-[var(--color-warning-foreground)]",
  success:
    "bg-[color-mix(in_srgb,var(--color-success)_60%,white)] text-[var(--color-success-foreground)]",
};

export function CourseCard({
  title,
  campus,
  location,
  time,
  studentCount,
  status,
  tone = "default",
  substitute = false,
}: CourseCardProps) {
  return (
    <Card
      className={cn(
        "border-0 bg-[var(--jp-surface)] py-0 shadow-[0_10px_30px_rgba(30,58,95,0.06)] ring-1 ring-[var(--jp-border)]",
        substitute && "border-l-4 border-l-[var(--primary)]",
      )}
    >
      <CardHeader className="gap-3 px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-[15px] font-semibold text-[var(--jp-text)]">
            {title}
          </CardTitle>
          {status ? (
            <Badge className={cn("rounded-full border-0 px-2.5 py-1", toneClasses[tone])}>
              {status}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        <p className="text-sm text-[var(--jp-text-secondary)]">
          {campus} | {location}
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs text-[var(--jp-text-secondary)]">
          <div className="flex items-center gap-2 rounded-full bg-[var(--jp-surface-muted)] px-3 py-2">
            <Clock3 className="size-3.5" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[var(--jp-surface-muted)] px-3 py-2">
            <UsersRound className="size-3.5" />
            <span>{studentCount} 名学生</span>
          </div>
          <div className="col-span-2 flex items-center gap-2 rounded-full bg-[var(--jp-surface-muted)] px-3 py-2">
            <MapPin className="size-3.5" />
            <span>{location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
