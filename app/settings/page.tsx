"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    try {
      const t = localStorage.getItem("tzaphah-theme");
      if (t === "light" || t === "dark") return t;
    } catch {
      /* ignore */
    }
    return "dark";
  });
  const [cronSecret, setCronSecret] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("tzaphah-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  return (
    <div className="mx-auto max-w-xl space-y-8 p-6 pb-24">
      <h1 className="font-cinzel-deco text-2xl text-accent-gold">Settings</h1>

      <section className="rounded-lg border border-accent-gold/20 bg-background-surface p-5">
        <h2 className="font-cinzel text-sm tracking-widest text-accent-gold">Appearance</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Toggles the <code className="font-mono text-xs">dark</code> class on the document
          root for Tailwind dark mode.
        </p>
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            onClick={() => setTheme("dark")}
            className={theme === "dark" ? "border-accent-gold bg-accent-gold/20" : ""}
          >
            Dark
          </Button>
          <Button
            type="button"
            onClick={() => setTheme("light")}
            className={theme === "light" ? "border-accent-gold bg-accent-gold/20" : ""}
          >
            Light
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-accent-gold/20 bg-background-surface p-5">
        <h2 className="font-cinzel text-sm tracking-widest text-accent-gold">
          Local cron test
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Paste your <code className="font-mono text-xs">CRON_SECRET</code> and trigger
          fetch from this browser (development use).
        </p>
        <input
          type="password"
          value={cronSecret}
          onChange={(e) => setCronSecret(e.target.value)}
          placeholder="CRON_SECRET"
          className="mt-3 w-full rounded border border-white/10 bg-background-base px-3 py-2 text-sm text-text-primary"
        />
        <Button
          type="button"
          className="mt-3"
          onClick={() => {
            void fetch("/api/cron/fetch-news", {
              headers: { Authorization: `Bearer ${cronSecret}` },
            })
              .then((r) => r.json())
              .then(console.log)
              .catch(console.error);
          }}
        >
          Run fetch-news
        </Button>
      </section>
    </div>
  );
}
