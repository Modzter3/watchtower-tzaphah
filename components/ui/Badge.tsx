export function Badge({
  children,
  color = "#c9a84c",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      className="inline-block rounded border border-solid px-2 py-0.5 text-xs text-text-primary"
      style={{ backgroundColor: `${color}33`, borderColor: color }}
    >
      {children}
    </span>
  );
}
