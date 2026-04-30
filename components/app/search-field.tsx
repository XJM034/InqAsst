"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
};

export function SearchField({
  value,
  onChange,
  placeholder,
  className,
}: SearchFieldProps) {
  return (
    <label
      className={cn(
        "flex h-10 items-center gap-3 rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 shadow-[0_8px_18px_rgba(28,28,28,0.03)]",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-[var(--jp-text-muted)]" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-auto border-0 bg-transparent px-0 py-0 text-[13px] text-[var(--jp-text)] shadow-none focus-visible:border-0 focus-visible:ring-0"
      />
    </label>
  );
}
