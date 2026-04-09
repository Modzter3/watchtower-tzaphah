"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function ScripturePage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<
    { book: string; chapter: number; verse: number; text: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/scripture?q=${encodeURIComponent(q)}&limit=40`,
      );
      const data = await res.json();
      setResults(data.verses ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 pb-24">
      <h1 className="font-cinzel-deco text-2xl text-accent-gold">Scripture Index</h1>
      <p className="text-sm text-text-secondary">
        Search the seeded KJV table in Supabase (populate{" "}
        <code className="rounded bg-background-surface px-1 font-mono text-xs">kjv_verses</code>{" "}
        from a public dataset).
      </p>
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. Deuteronomy, famine, sword"
          className="flex-1 rounded border border-accent-gold/30 bg-background-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-gold"
        />
        <Button type="button" onClick={search} disabled={loading}>
          {loading ? "…" : "Search"}
        </Button>
      </div>
      <ul className="space-y-4">
        {results.map((v, i) => (
          <li
            key={`${v.book}-${v.chapter}-${v.verse}-${i}`}
            className="rounded-lg border border-white/10 bg-background-surface p-4"
          >
            <p className="text-xs text-accent-gold">
              {v.book} {v.chapter}:{v.verse}
            </p>
            <p className="font-crimson mt-2 text-sm italic text-text-scripture">{v.text}</p>
          </li>
        ))}
      </ul>
      {!loading && results.length === 0 && q ? (
        <p className="text-sm text-text-secondary">No verses found.</p>
      ) : null}
    </div>
  );
}
