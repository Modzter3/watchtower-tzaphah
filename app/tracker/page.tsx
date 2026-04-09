"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

function statusBadgeStyle(status: string) {
  switch (status) {
    case "FULFILLED":
      return "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
    case "IN_PROGRESS":
      return "border-amber-500/50 bg-amber-500/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
    case "WATCHING":
      return "border-accent-gold/50 bg-accent-gold/10 text-accent-gold shadow-[0_0_10px_rgba(201,168,76,0.2)]";
    default:
      return "border-white/10 bg-white/5 text-text-secondary";
  }
}

export default function TrackerPage() {
  const [items, setItems] = useState<ProphecyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prophecy-tracker")
      .then((r) => r.json())
      .then((d: { items?: ProphecyRow[] }) => {
        setItems(d.items ?? []);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative min-h-screen bg-background-base pb-24 text-text-primary">
      {/* HUD Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-accent-gold/5 blur-[120px] animate-float" />
        <div className="absolute bottom-10 left-10 w-48 h-48 border border-accent-gold/5 rounded-full opacity-20" />
        <div className="scanline absolute top-0 left-0 animate-scanline" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl space-y-8 p-6">
        <header className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent-gold/30 to-transparent" />
            <h1 className="font-cinzel-deco text-3xl font-black tracking-[0.2em] text-accent-gold text-glow-gold uppercase">
              Prophetic Fulfillment Tracker
            </h1>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent-gold/30 to-transparent" />
          </div>
          <p className="text-center font-mono text-[10px] uppercase tracking-widest text-text-secondary/60">
            Real-time monitoring of covenant milestones // Database: prophecy_tracker
          </p>
        </header>

        <div className="grid gap-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
               <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
               <span className="font-mono text-[10px] uppercase tracking-widest text-accent-gold/60">Decrypting_Data...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-background-surface/30 p-12 text-center backdrop-blur-sm">
              <p className="font-cinzel text-accent-gold/60">No transmission detected.</p>
              <p className="mt-2 text-xs text-text-secondary italic">Ensure prophecy_tracker table is populated.</p>
            </div>
          ) : (
            items.map((p, idx) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-background-surface/40 backdrop-blur-md p-6 transition-all hover:border-accent-gold/30 hover:bg-background-elevated/60 shadow-xl"
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-10">
                   <div className="absolute top-4 right-4 w-px h-8 bg-accent-gold" />
                   <div className="absolute top-4 right-4 h-px w-8 bg-accent-gold" />
                </div>

                <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-cinzel text-xl font-bold tracking-tight text-text-primary text-glow-gold/20">
                      {p.title}
                    </h2>
                    <span className={`rounded-sm border px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-[0.15em] ${statusBadgeStyle(p.status)}`}>
                      {p.status}
                    </span>
                    <span className="rounded-sm border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-text-secondary">
                      {p.confidence}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-text-secondary/50 uppercase">
                    Ref_ID: {p.id.slice(0, 8)}
                  </span>
                </div>

                <div className="grid gap-6 md:grid-cols-12">
                  <div className="md:col-span-7 space-y-4">
                    <p className="text-sm leading-relaxed text-text-secondary/90 italic border-l-2 border-accent-gold/20 pl-4">
                      {p.description}
                    </p>
                    <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                      <div>
                        <span className="block font-mono text-[8px] uppercase tracking-widest text-accent-gold/50 mb-1">Timeline_Placement</span>
                        <span className="text-[11px] font-bold text-text-primary tracking-wide">{p.timeline_section.replace(/_/g, " ")}</span>
                      </div>
                      <div className="h-8 w-px bg-white/5" />
                      <div>
                        <span className="block font-mono text-[8px] uppercase tracking-widest text-accent-gold/50 mb-1">Last_Signal</span>
                        <span className="text-[11px] font-bold text-text-primary tracking-wide">
                          {new Date(p.last_updated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-5 p-4 rounded-lg bg-black/20 border border-white/5 relative overflow-hidden group-hover:border-accent-gold/20 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-accent-gold/20 group-hover:bg-accent-gold/50 transition-colors" />
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-lg">📜</span>
                      <span className="font-mono text-[9px] font-bold tracking-widest text-accent-gold uppercase">Scripture_Anchor</span>
                    </div>
                    <p className="text-[11px] font-bold text-accent-gold mb-2">{p.scripture_anchor}</p>
                    <p className="font-crimson text-sm italic text-text-scripture leading-relaxed">
                      &ldquo;{p.verse_text}&rdquo;
                    </p>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
