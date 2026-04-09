"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
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

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function PropheticMap({ articles }: { articles: ArticleWithRelations[] }) {
  const points = useMemo(
    () =>
      articles.filter(
        (a) => typeof a.lat === "number" && typeof a.lng === "number",
      ),
    [articles],
  );

  const center: [number, number] = useMemo(() => {
    if (points.length === 0) return [20, 0];
    const lat = points.reduce((s, p) => s + (p.lat as number), 0) / points.length;
    const lng = points.reduce((s, p) => s + (p.lng as number), 0) / points.length;
    return [lat, lng];
  }, [points]);

  return (
    <MapContainer
      center={center}
      zoom={points.length ? 2 : 2}
      className="h-[480px] w-full rounded-lg border border-accent-gold/20"
      scrollWheelZoom
    >
      <FixIcons />
      <Recenter center={center} />
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
          <Popup>
            <div className="max-w-xs text-text-primary">
              <p className="font-semibold">{a.headline}</p>
              <p className="text-xs text-text-secondary">{a.source_name}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
