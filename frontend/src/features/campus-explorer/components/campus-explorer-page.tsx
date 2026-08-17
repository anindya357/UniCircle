"use client";

import { useState } from "react";

import { AppShell } from "@/components/shared/app-shell";
import { campusLocations } from "@/mocks/data/campus-locations";

import styles from "./campus-explorer-page.module.css";

export function CampusExplorerPage() {
  const [selectedId, setSelectedId] = useState<string>(campusLocations[0].id);
  const selectedLocation =
    campusLocations.find((location) => location.id === selectedId) ??
    campusLocations[0];

  return (
    <AppShell>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Campus Explorer</p>
          <h1>Find your way around CUET.</h1>
        </div>
        <p>
          Browse important places, select a map marker, and get a quick sense of what
          you will find there.
        </p>
      </header>

      <section className={styles.explorer} aria-label="Interactive campus explorer">
        <div className={styles.mapPanel}>
          <div className={styles.mapHeader}>
            <div>
              <span>Demo campus map</span>
              <strong>CUET, Raozan</strong>
            </div>
            <span className={styles.mapKey}>Select a marker</span>
          </div>

          <div className={styles.map}>
            {/* This illustrated overview is intentionally a demo, not a navigation map. */}
            <div className={styles.roadOne} aria-hidden="true" />
            <div className={styles.roadTwo} aria-hidden="true" />
            <div className={styles.water} aria-hidden="true" />
            <span className={styles.mapLabel}>Academic zone</span>
            <span className={styles.fieldLabel}>Central field</span>
            {campusLocations.map((location, index) => (
              <button
                key={location.id}
                type="button"
                className={styles.marker}
                style={{
                  left: `${location.mapPosition.x}%`,
                  top: `${location.mapPosition.y}%`,
                }}
                aria-label={`View ${location.name}`}
                aria-pressed={location.id === selectedLocation.id}
                onClick={() => setSelectedId(location.id)}
              >
                <span>{index + 1}</span>
              </button>
            ))}
          </div>
          <p className={styles.disclaimer}>
            Illustrative demo map — positions are approximate and not intended for
            turn-by-turn navigation.
          </p>
        </div>

        <div className={styles.directory}>
          <div className={styles.listHeader}>
            <div>
              <span>Campus places</span>
              <strong>{campusLocations.length} locations</strong>
            </div>
            <small>Scroll to browse</small>
          </div>
          <div
            className={styles.locationList}
            role="listbox"
            aria-label="Campus locations"
          >
            {campusLocations.map((location, index) => (
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
        </div>
      </section>
    </AppShell>
  );
}
