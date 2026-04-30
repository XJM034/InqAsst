"use client";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/app/page-shell";
import { StaticLink } from "@/components/app/static-link";
import {
  AUTH_EXPIRED_TITLE,
  normalizeAuthExpiredDisplayMessage,
  resolveAuthExpiredPrimaryAction,
} from "@/lib/services/auth-expiry";
import { navigateTo } from "@/lib/static-navigation";

type PageStatusProps = {
  title: string;
  description: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
};

export function PageStatus({
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  secondaryActionHref,
}: PageStatusProps) {
  const primaryAction = resolveAuthExpiredPrimaryAction(description);
  const resolvedTitle = primaryAction === "relogin" ? AUTH_EXPIRED_TITLE : title;
  const resolvedDescription = normalizeAuthExpiredDisplayMessage(description);
  const resolvedPrimaryActionLabel =
    primaryAction === "relogin" ? "重新登录" : primaryActionLabel;
  const resolvedPrimaryAction =
    primaryAction === "relogin"
      ? () => {
          navigateTo("/login", { replace: true });
        }
      : onPrimaryAction;
  const actionCount =
    Number(Boolean(secondaryActionLabel && secondaryActionHref)) +
    Number(Boolean(resolvedPrimaryActionLabel && resolvedPrimaryAction));

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll px-7 pt-10">
          <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-5 text-center shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
            <h1 className="text-[18px] font-semibold text-[var(--jp-text)]">{resolvedTitle}</h1>
            <p className="mt-2 text-[13px] leading-6 text-[var(--jp-text-secondary)]">
              {resolvedDescription}
            </p>
            {actionCount > 0 ? (
              <div className={`mt-5 grid gap-3 ${actionCount > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                {secondaryActionLabel && secondaryActionHref ? (
                  <Button type="button" variant="outline" className="h-11 rounded-[12px]" asChild>
                    <StaticLink href={secondaryActionHref}>{secondaryActionLabel}</StaticLink>
                  </Button>
                ) : null}
                {resolvedPrimaryActionLabel && resolvedPrimaryAction ? (
                  <Button
                    type="button"
                    className="h-11 rounded-[12px] bg-[var(--jp-accent)] text-[var(--jp-bg)] hover:bg-[var(--jp-accent)]/90"
                    onClick={resolvedPrimaryAction}
                  >
                    {resolvedPrimaryActionLabel}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </PageShell>
  );
}
