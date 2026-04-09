"use client";

import { useEffect, useState } from "react";

export function WatchmanBrief() {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/tzaphah-index")
      .then((r) => r.json())
      .then((d: { index?: { score?: number } }) =>
        setScore(typeof d.index?.score === "number" ? d.index.score : 0),
      )
      .catch(() => setScore(null));
  }, []);

  return (
    <section className="relative overflow-hidden rounded-xl border border-accent-gold/20 bg-background-surface/40 backdrop-blur-md p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all hover:border-accent-gold/40 group">
      {/* Decorative HUD Elements */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent-gold/30 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-gold/30 rounded-tr-lg" />
      
      <div className="relative z-10">
        <h2 className="mb-4 font-cinzel-deco text-xl font-bold tracking-widest text-accent-gold text-glow-gold">
          Watchman Brief
        </h2>
        <p className="text-sm leading-relaxed text-text-secondary/90 italic">
          Tzaphah surfaces headlines through a Hebrew Israelite prophetic lens: covenant land
          events, signs of the times, economic control, persecution of scattered Israel, and
          the nations in commotion.
        </p>
        
        {score != null && (
          <div className="mt-6 pt-4 border-t border-accent-gold/10 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase tracking-widest text-accent-gold/60">
                INTENSITY_INDEX
              </span>
              <span className="font-cinzel text-3xl font-black text-accent-gold group-hover:scale-110 transition-transform origin-left">
                {score}
              </span>
            </div>
            <div className="h-12 w-24 flex items-end gap-1 opacity-40">
               {[...Array(8)].map((_, i) => (
                 <div 
                   key={i} 
                   className="flex-1 bg-accent-gold" 
                   style={{ 
                     height: `${Math.random() * 100}%`,
                     opacity: i / 8 
                   }} 
                 />
               ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
