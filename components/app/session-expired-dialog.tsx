"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AUTH_EXPIRED_EVENT,
  AUTH_EXPIRED_MESSAGE,
  AUTH_EXPIRED_TITLE,
} from "@/lib/services/auth-expiry";
import { navigateTo } from "@/lib/static-navigation";

type AuthExpiredEventDetail = {
  message?: string;
};

export function SessionExpiredDialog() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(AUTH_EXPIRED_MESSAGE);

  useEffect(() => {
    function handleAuthExpired(event: Event) {
      const customEvent = event as CustomEvent<AuthExpiredEventDetail>;
      setMessage(customEvent.detail?.message ?? AUTH_EXPIRED_MESSAGE);
      setOpen(true);
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, []);

  function redirectToLogin() {
    setOpen(false);
    if (pathname !== "/login") {
      navigateTo("/login", { replace: true });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          redirectToLogin();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-[320px] gap-4 rounded-[16px] border-0 bg-white p-6 shadow-none ring-0"
      >
        <DialogHeader className="gap-2">
          <DialogTitle className="text-[18px] font-semibold text-[#1E3A5F]">
            {AUTH_EXPIRED_TITLE}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[#666666]">
            {message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="border-t-0 bg-transparent p-0 pt-1">
          <Button
            type="button"
            className="h-11 w-full rounded-[12px] bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90"
            onClick={redirectToLogin}
          >
            重新登录
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
