export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-background-elevated ${className}`}
      aria-hidden
    />
  );
}
