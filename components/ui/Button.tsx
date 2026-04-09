import type { ButtonHTMLAttributes } from "react";

export function Button({
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`rounded border border-accent-gold/50 bg-background-elevated px-4 py-2 text-sm text-accent-gold transition-colors hover:bg-accent-gold/10 disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
