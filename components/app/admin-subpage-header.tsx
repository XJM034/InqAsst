import { ChevronLeft } from "lucide-react";
import { StaticLink } from "@/components/app/static-link";

type AdminSubpageHeaderProps = {
  title: string;
  backHref: string;
  trailing?: React.ReactNode;
};

export function AdminSubpageHeader({
  title,
  backHref,
  trailing,
}: AdminSubpageHeaderProps) {
  return (
    <header className="border-b border-[color:var(--jp-border)] bg-white px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <StaticLink
            href={backHref}
            aria-label="返回"
            className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-[#F5F3F0] text-[var(--jp-text)]"
          >
            <ChevronLeft className="size-4" />
          </StaticLink>
          <h1 className="truncate text-[15px] font-semibold text-[var(--jp-text)]">{title}</h1>
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    </header>
  );
}
