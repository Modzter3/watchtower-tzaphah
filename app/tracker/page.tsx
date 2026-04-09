"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";

interface ProphecyRow {
  id: string;
  title: string;
  description: string;
  scripture_anchor: string;
  verse_text: string;
  status: string;
  confidence: string;
  timeline_section: string;
  last_updated: string;
}

export default function TrackerPage() {
  const [items, setItems] = useState<ProphecyRow[]>([]);

  useEffect(() => {
    fetch("/api/prophecy-tracker")
      .then((r) => r.json())
      .then((d: { items?: ProphecyRow[] }) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 pb-24">
      <h1 className="font-cinzel-deco text-2xl text-accent-gold">
        Prophecy Fulfillment Tracker
      </h1>
      <p className="text-sm text-text-secondary">
        Rows are read from the{" "}
        <code className="rounded bg-background-surface px-1 font-mono text-xs">
          prophecy_tracker
        </code>{" "}
        table. Seed or edit entries in Supabase to populate this view.
      </p>
      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-text-secondary">No tracker rows yet.</p>
        ) : (
          items.map((p) => (
            <article
              key={p.id}
              className="rounded-lg border border-accent-gold/20 bg-background-surface p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-cinzel text-lg text-text-primary">{p.title}</h2>
                <Badge color="#d97706">{p.status}</Badge>
                <Badge color="#64748b">{p.confidence}</Badge>
              </div>
              <p className="mt-2 text-sm text-text-secondary">{p.description}</p>
              <p className="mt-3 text-xs text-accent-gold">{p.scripture_anchor}</p>
              <p className="font-crimson mt-1 text-sm italic text-text-scripture">
                &ldquo;{p.verse_text}&rdquo;
              </p>
              <p className="mt-2 text-xs text-text-secondary">
                Timeline: {p.timeline_section}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
