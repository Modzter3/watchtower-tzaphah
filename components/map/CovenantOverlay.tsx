"use client";

export function CovenantOverlay() {
  return (
    <div className="rounded-lg border border-accent-gold/20 bg-background-surface p-4 text-sm text-text-secondary">
      <h3 className="font-cinzel text-accent-gold">Covenant significance</h3>
      <p className="mt-2">
        GeoJSON covenant overlays (land boundaries, migration arcs) can be layered here.
        Feed the map from analyzed article coordinates and future static GeoJSON assets.
      </p>
    </div>
  );
}
