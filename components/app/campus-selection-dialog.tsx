"use client";

type CampusSelectionItem = {
  id: string;
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  disabled?: boolean;
  loading?: boolean;
};

type CampusSelectionDialogProps = {
  open: boolean;
  title: string;
  description: string;
  footerText: string;
  options: CampusSelectionItem[];
  onSelect: (optionId: string) => void;
  showCloseButton?: boolean;
  onClose?: () => void;
};

export function CampusSelectionDialog({
  open,
  title,
  description,
  footerText,
  options,
  onSelect,
  showCloseButton = false,
  onClose,
}: CampusSelectionDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/42 px-5 backdrop-blur-[2px]">
      <section className="w-full max-w-[420px] rounded-[24px] bg-[var(--jp-surface)] p-5 shadow-[0_24px_60px_rgba(16,24,40,0.18)] ring-1 ring-black/5">
        <div className="space-y-1.5 text-center">
          <p className="text-[18px] font-semibold text-[var(--jp-text)]">{title}</p>
          <p className="text-[13px] leading-6 text-[var(--jp-text-secondary)]">{description}</p>
        </div>

        <div className="mt-4 max-h-[50vh] space-y-2.5 overflow-y-auto overscroll-contain">
          {options.map((option, index) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              disabled={option.disabled}
              className={
                option.loading
                  ? "flex min-h-[72px] w-full items-center justify-between rounded-[18px] border border-[#1E3A5F] bg-[#1E3A5F] px-4 py-3 text-left text-white shadow-[0_14px_28px_rgba(30,58,95,0.18)] disabled:opacity-80"
                  : "flex min-h-[72px] w-full items-center justify-between rounded-[18px] border border-[#E8E5E0] bg-[#F7F4EF] px-4 py-3 text-left text-[var(--jp-text)] transition-colors hover:border-[#1E3A5F] hover:bg-[#FBF8F3] disabled:opacity-70"
              }
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span
                    className={
                      option.loading
                        ? "flex size-6 shrink-0 items-center justify-center rounded-full bg-white/14 text-[11px] font-semibold text-white"
                        : "flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-[var(--jp-text-secondary)]"
                    }
                  >
                    {index + 1}
                  </span>
                  <p className="truncate text-[15px] font-semibold">{option.title}</p>
                </div>
                {option.subtitle ? (
                  <p
                    className={
                      option.loading
                        ? "mt-1.5 pl-8 text-[12px] text-white/72"
                        : "mt-1.5 pl-8 text-[12px] text-[var(--jp-text-muted)]"
                    }
                  >
                    {option.subtitle}
                  </p>
                ) : null}
              </div>
              <span
                className={
                  option.loading
                    ? "shrink-0 rounded-full bg-white/14 px-3 py-1.5 text-[11px] font-semibold text-white"
                    : "shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--jp-text-secondary)]"
                }
              >
                {option.loading ? "切换中" : option.badgeLabel ?? "进入"}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <p className="shrink-0 text-center text-[12px] text-[var(--jp-text-muted)]">
            {footerText}
          </p>
          {showCloseButton && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="h-11 w-full rounded-[14px] border border-[#D8D2C8] bg-white text-[14px] font-medium text-[var(--jp-text)] transition-colors hover:bg-[#F7F4EF]"
            >
              关闭
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
