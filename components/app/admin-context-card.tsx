type AdminContextCardProps = {
  title: string;
  description?: string;
  detail?: string;
};

export function AdminContextCard({
  title,
  description,
  detail,
}: AdminContextCardProps) {
  return (
    <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
      <h1 className="text-[15px] font-semibold text-[var(--jp-text)]">{title}</h1>
      {description ? (
        <p className="mt-1.5 text-[12px] font-medium leading-5 text-[var(--jp-text-secondary)]">
          {description}
        </p>
      ) : null}
      {detail ? (
        <p className="mt-2.5 text-[12px] leading-5 text-[var(--jp-text-secondary)]">{detail}</p>
      ) : null}
    </section>
  );
}
