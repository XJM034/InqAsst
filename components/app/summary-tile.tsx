type SummaryTileProps = {
  label: string;
  value: string;
};

export function SummaryTile({ label, value }: SummaryTileProps) {
  return (
    <div className="rounded-[20px] bg-[var(--jp-surface)] p-4 shadow-[0_10px_30px_rgba(30,58,95,0.05)] ring-1 ring-[var(--jp-border)]">
      <p className="text-xs text-[var(--jp-text-secondary)]">{label}</p>
      <p className="mt-2 text-xl font-semibold text-[var(--jp-text)]">{value}</p>
    </div>
  );
}
