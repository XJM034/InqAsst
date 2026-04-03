import { cn } from "@/lib/utils";

type PageTitleBlockProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function PageTitleBlock({
  title,
  subtitle,
  className,
}: PageTitleBlockProps) {
  return (
    <header className={cn("space-y-1.5", className)}>
      <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--jp-text)]">
        {title}
      </h1>
      {subtitle ? (
        <p className="text-[13px] font-medium text-[var(--jp-text-secondary)]">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
