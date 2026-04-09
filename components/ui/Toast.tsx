"use client";

export function Toast({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-16 left-1/2 z-[90] -translate-x-1/2 rounded border border-accent-gold bg-background-elevated px-4 py-2 text-sm text-text-primary shadow-lg">
      {message}
    </div>
  );
}
