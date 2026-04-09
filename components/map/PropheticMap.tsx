"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ArticleWithRelations } from "@/lib/types/article";

function FixIcons() {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, []);
  return null;
}

function Recenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

/** Leaflet often measures 0×0 when mounted inside dynamic/layout; force a relayout. */
function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    const run = () => map.invalidateSize();
    run();
    const id = requestAnimationFrame(run);
    const t = window.setTimeout(run, 200);
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(t);
    };
  }, [map]);
  return null;
}

export function PropheticMap({ articles }: { articles: ArticleWithRelations[] }) {
  const points = useMemo(
    () =>
      articles.filter((a) => {
        const lat = a.lat;
        const lng = a.lng;
        return (
          typeof lat === "number" &&
          typeof lng === "number" &&
          Number.isFinite(lat) &&
          Number.isFinite(lng) &&
          Math.abs(lat) <= 90 &&
          Math.abs(lng) <= 180
        );
      }),
    [articles],
  );

  const center: [number, number] = useMemo(() => {
    if (points.length === 0) return [20, 0];
    const lat = points.reduce((s, p) => s + (p.lat as number), 0) / points.length;
    const lng = points.reduce((s, p) => s + (p.lng as number), 0) / points.length;
    return [lat, lng];
  }, [points]);

  const zoom = points.length === 0 ? 2 : points.length === 1 ? 4 : 3;

  return (
    <div className="relative z-0 h-[min(70vh,520px)] min-h-[420px] w-full overflow-hidden rounded-lg border border-accent-gold/20">
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full min-h-[420px] w-full bg-background-base"
      scrollWheelZoom
      style={{ minHeight: 420 }}
    >
      <FixIcons />
      <InvalidateSizeOnMount />
      <Recenter center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((a) => (
        <CircleMarker
          key={a.id}
          center={[a.lat as number, a.lng as number]}
          radius={6 + (a.watch_level ?? 3)}
          pathOptions={{
            color: a.urgency_color ?? "#c9a84c",
            fillColor: a.urgency_color ?? "#c9a84c",
            fillOpacity: 0.35,
          }}
        >
          <Popup className="prophetic-map-popup">
            <div style={{ maxWidth: 280, color: "#ede9d8" }}>
              <p style={{ fontWeight: 600, margin: "0 0 4px" }}>{a.headline}</p>
              <p style={{ fontSize: 12, opacity: 0.8, margin: 0 }}>{a.source_name}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
    </div>
  );
}
