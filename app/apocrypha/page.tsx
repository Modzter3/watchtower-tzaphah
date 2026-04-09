import Link from "next/link";

export default function ApocryphaPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 pb-24">
      <h1 className="font-cinzel-deco text-2xl text-accent-gold">Apocrypha Lens</h1>
      <p className="text-sm leading-relaxed text-text-secondary">
        The analysis pipeline treats 1 Enoch, Jubilees, Maccabees, Wisdom, Sirach, and Baruch
        as valid scripture where the model cites them. Articles flagged with{" "}
        <code className="rounded bg-background-surface px-1 font-mono text-xs">
          is_apocrypha_connected
        </code>{" "}
        surface in feeds and drawers alongside canonical references.
      </p>
      <p className="text-sm text-text-secondary">
        Use the main{" "}
        <Link href="/" className="text-accent-gold hover:underline">
          intelligence feed
        </Link>{" "}
        and filter mentally for Apocrypha-tagged references in each card&apos;s scripture
        block.
      </p>
    </div>
  );
}
