import { PROPHETIC_CATEGORIES } from "@/lib/constants/categories";

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 pb-24">
      <h1 className="font-cinzel-deco text-2xl text-accent-gold">Prophetic Categories</h1>
      <p className="text-sm text-text-secondary">
        Twelve lenses used for tagging and UI. The AI must return category slugs matching
        these identifiers when possible.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {PROPHETIC_CATEGORIES.map((c) => (
          <li
            key={c.slug}
            className="rounded-lg border border-white/10 bg-background-surface p-4"
            style={{ borderLeftWidth: 4, borderLeftColor: c.color }}
          >
            <div className="flex items-center gap-2">
              <span aria-hidden>{c.icon}</span>
              <h2 className="font-cinzel text-text-primary">{c.name}</h2>
            </div>
            <p className="mt-1 font-mono text-xs text-text-secondary">{c.slug}</p>
            <p className="mt-2 text-xs text-accent-gold/90">{c.scripture}</p>
            <p className="mt-2 text-xs text-text-secondary line-clamp-3">
              Keywords: {c.keywords.slice(0, 6).join(", ")}…
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
