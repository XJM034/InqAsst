"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { logoutCurrentUser } from "@/lib/services/mobile-client";
import { navigateTo } from "@/lib/static-navigation";

type LogoutConfirmDialogProps = {
  triggerLabel?: string;
  triggerClassName?: string;
};

export function LogoutConfirmDialog({
  triggerLabel = "退出登录",
  triggerClassName,
}: LogoutConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      await logoutCurrentUser();
      navigateTo("/login", { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={triggerClassName}>{triggerLabel}</Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-[rgba(15,23,42,0.35)] backdrop-blur-0"
        className="max-w-[354px] gap-[18px] rounded-[16px] border-0 bg-white p-5 shadow-none ring-0"
      >
        <DialogHeader className="gap-2">
          <DialogTitle className="text-[20px] font-semibold text-[var(--jp-text)]">
            确认退出登录？
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-6 text-[var(--jp-text-secondary)]">
            退出后需要重新输入手机号和验证码登录。
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="h-11 rounded-[12px] border-[var(--jp-border)] bg-[var(--jp-surface-muted)] text-[15px] font-medium text-[var(--jp-text)] hover:bg-[var(--jp-surface-muted)]"
            >
              取消
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleLogout}
            className="h-11 rounded-[12px] bg-[var(--jp-accent)] text-[15px] font-semibold text-white hover:bg-[var(--jp-accent)]/90"
          >
            {isSubmitting ? "退出中" : "确认退出"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
