"use client";

import Link from "next/link";
import { UserButton, SignInButton, Show } from "@clerk/nextjs";

const links = [
  { href: "/", label: "Feed" },
  { href: "/map", label: "Map" },
  { href: "/scripture", label: "Scripture" },
  { href: "/tracker", label: "Tracker" },
  { href: "/apocrypha", label: "Apocrypha" },
  { href: "/categories", label: "Categories" },
  { href: "/settings", label: "Settings" },
];

export function Header({ showAuth }: { showAuth: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-accent-gold/30 bg-background-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1920px] flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex flex-col">
          <span className="font-cinzel-deco text-lg tracking-widest text-accent-gold md:text-xl">
            The Watchtower
          </span>
          <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-text-secondary">
            Tzaphah
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm text-text-secondary md:gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded px-2 py-1 transition-colors hover:bg-background-elevated hover:text-accent-gold"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        {showAuth ? (
          <div className="flex items-center gap-2">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="rounded border border-accent-gold/50 px-3 py-1.5 text-sm text-accent-gold transition-colors hover:bg-accent-gold/10"
                >
                  Sign in
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        ) : null}
      </div>
    </header>
  );
}
