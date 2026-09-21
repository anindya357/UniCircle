"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/shared/app-shell";
import type { CampusExplorerSnapshot } from "@/features/campus-explorer/types/campus-location";
import { campusExplorerService } from "@/services";

import { CampusMap } from "./campus-map";
import styles from "./campus-explorer-page.module.css";

export function CampusExplorerPage() {
  const [snapshot, setSnapshot] = useState<CampusExplorerSnapshot | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    void campusExplorerService
      .getSnapshot()
      .then((result) => {
        if (active) setSnapshot(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "The campus map could not be loaded.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [retry]);

  const locations = snapshot?.locations ?? [];
  const selectedLocation =
    locations.find((location) => location.id === selectedId) ?? locations[0];

  return (
    <AppShell>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Campus Explorer</p>
          <h1>Find your way around CUET.</h1>
        </div>
        <p>
          Explore the Raozan campus footprint and select a mapped place to learn more
          about it.
        </p>
      </header>

      {!snapshot ? (
        <div className={styles.statePanel} role="status">
          {error ? (
            <>
              <h2>Campus map unavailable</h2>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setRetry((value) => value + 1);
                }}
              >
                Try again
              </button>
            </>
          ) : (
            <p>Loading the CUET campus map and locations...</p>
          )}
        </div>
      ) : locations.length === 0 || !selectedLocation ? (
        <div className={styles.statePanel} role="status">
          <h2>No campus places available</h2>
          <p>The campus map is ready, but no locations have been added yet.</p>
        </div>
      ) : (
        <>
          <section className={styles.explorer} aria-label="Interactive campus explorer">
            <div className={styles.mapPanel}>
              <div className={styles.mapHeader}>
                <div>
                  <span>Mapped campus</span>
                  <strong>CUET, Raozan</strong>
                </div>
                <span className={styles.mapKey}>Select a marker</span>
              </div>
              <CampusMap
                mapData={snapshot.map}
                locations={locations}
                selectedId={selectedLocation.id}
                onSelect={setSelectedId}
              />
              <p className={styles.disclaimer}>
                Campus boundary and place coordinates from{" "}
                <a
                  href={snapshot.map.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenStreetMap contributors
                </a>
                . Map locations may change; use on-site signs for navigation.
              </p>
            </div>

            <div className={styles.directory}>
              <div className={styles.listHeader}>
                <div>
                  <span>Campus places</span>
                  <strong>{locations.length} locations</strong>
                </div>
                <small>Scroll to browse</small>
              </div>
              <div
                className={styles.locationList}
                role="listbox"
                aria-label="Campus locations"
              >
                {locations.map((location, index) => (
                  <button
                    key={location.id}
                    type="button"
                    role="option"
                    aria-selected={location.id === selectedLocation.id}
                    className={styles.locationCard}
                    onClick={() => setSelectedId(location.id)}
                  >
                    <span className={styles.cardNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.cardCopy}>
                      <strong>{location.name}</strong>
                      <small>{location.address}</small>
                    </span>
                    <span className={styles.arrow} aria-hidden="true">
                      &#8594;
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section
            className={styles.details}
            aria-live="polite"
            aria-labelledby="location-title"
          >
            <div className={styles.detailMark} aria-hidden="true">
              {selectedLocation.shortName}
            </div>
            <div className={styles.detailMain}>
              <p>{selectedLocation.category}</p>
              <h2 id="location-title">{selectedLocation.name}</h2>
              <address>{selectedLocation.address}</address>
            </div>
            <div className={styles.detailCopy}>
              <strong>{selectedLocation.description}</strong>
              <p>{selectedLocation.details}</p>
              <a
                href={selectedLocation.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View mapped source ↗
              </a>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
