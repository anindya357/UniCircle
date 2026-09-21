"use client";

import { useEffect, useRef, useState } from "react";
import type Leaflet from "leaflet";

import type {
  CampusLocation,
  CampusMapData,
} from "@/features/campus-explorer/types/campus-location";

import styles from "./campus-explorer-page.module.css";

type CampusMapProps = Readonly<{
  mapData: CampusMapData;
  locations: readonly CampusLocation[];
  selectedId: string;
  onSelect: (id: string) => void;
}>;

const markerStyle = {
  color: "#ffffff",
  weight: 2,
  fillColor: "#075c3c",
  fillOpacity: 1,
};
const selectedStyle = {
  color: "#ffffff",
  weight: 3,
  fillColor: "#c58f12",
  fillOpacity: 1,
};

export function CampusMap({
  mapData,
  locations,
  selectedId,
  onSelect,
}: CampusMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, Leaflet.CircleMarker>>(new Map());
  const onSelectRef = useRef(onSelect);
  const selectedRef = useRef(selectedId);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    selectedRef.current = selectedId;
    for (const [id, marker] of markersRef.current) {
      const active = id === selectedId;
      marker.setStyle(active ? selectedStyle : markerStyle);
      marker.setRadius(active ? 10 : 7);
      if (active) marker.bringToFront();
    }
  }, [selectedId]);

  useEffect(() => {
    let disposed = false;
    let instance: Leaflet.Map | null = null;

    void import("leaflet")
      .then((L) => {
        if (disposed || !containerRef.current) return;
        const bounds = L.latLngBounds([[...mapData.bounds[0]], [...mapData.bounds[1]]]);
        const boundary: [number, number][] = mapData.boundary.map(
          ([latitude, longitude]) => [latitude, longitude],
        );
        instance = L.map(containerRef.current, {
          scrollWheelZoom: false,
          maxBounds: bounds.pad(0.03),
          maxBoundsViscosity: 1,
        });
        L.tileLayer(mapData.tileUrl, {
          minZoom: 14,
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        }).addTo(instance);
        instance.fitBounds(bounds, { padding: [12, 12] });
        L.control.scale({ imperial: false }).addTo(instance);

        // Mask every tile outside the reviewed CUET outline; no nearby city area is shown.
        const outer: [number, number][] = [
          [22.3, 91.8],
          [22.3, 92.1],
          [22.6, 92.1],
          [22.6, 91.8],
        ];
        L.polygon([outer, boundary], {
          stroke: false,
          fillColor: "#f4f7f5",
          fillOpacity: 1,
          fillRule: "evenodd",
          interactive: false,
        }).addTo(instance);
        L.polygon(boundary, {
          color: "#075c3c",
          weight: 3,
          fillOpacity: 0,
          interactive: false,
        }).addTo(instance);

        const markers = new Map<string, Leaflet.CircleMarker>();
        for (const location of locations) {
          const active = location.id === selectedRef.current;
          const marker = L.circleMarker([location.latitude, location.longitude], {
            ...(active ? selectedStyle : markerStyle),
            radius: active ? 10 : 7,
          }).addTo(instance);
          const label = document.createElement("span");
          label.textContent = location.name;
          marker.bindTooltip(label, { direction: "top" });
          marker.on("click", () => onSelectRef.current(location.id));
          markers.set(location.id, marker);
        }
        markersRef.current = markers;
        markers.get(selectedRef.current)?.bringToFront();
      })
      .catch(() => {
        if (!disposed) setMapError(true);
      });

    return () => {
      disposed = true;
      instance?.remove();
      markersRef.current.clear();
    };
  }, [mapData, locations]);

  if (mapError) {
    return (
      <div className={styles.mapFallback} role="status">
        The interactive map could not load. Choose a campus place from the list.
      </div>
    );
  }

  return (
    <div
      className={styles.map}
      ref={containerRef}
      role="region"
      aria-label="Interactive map of the CUET Raozan campus"
    />
  );
}
