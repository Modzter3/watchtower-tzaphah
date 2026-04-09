"use client";

import { useEffect, useState } from "react";
import { ROTATION_SCRIPTURES } from "@/lib/constants/scriptures";

export function ScriptureRotator() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setI((n) => (n + 1) % ROTATION_SCRIPTURES.length),
      12000,
    );
    return () => clearInterval(t);
  }, []);

  const s = ROTATION_SCRIPTURES[i];

  return (
    <section className="rounded-lg border border-accent-gold/20 bg-background-surface p-4">
      <h2 className="mb-2 font-cinzel text-sm tracking-widest text-accent-gold">
        On the Wall
      </h2>
      <p className="font-crimson text-sm italic text-text-scripture">
        &ldquo;{s.text}&rdquo;
      </p>
      <p className="mt-2 text-xs text-accent-gold/90">{s.reference}</p>
    </section>
  );
}
