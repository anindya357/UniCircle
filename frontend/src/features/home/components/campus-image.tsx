"use client";

import { useState } from "react";

import styles from "./home-page.module.css";

type CampusImageProps = Readonly<{
  src: string;
  alt: string;
  eager?: boolean;
}>;

export function CampusImage({ src, alt, eager = false }: CampusImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={styles.imageFallback}
        role="img"
        aria-label={`${alt}. Image unavailable.`}
      >
        <span aria-hidden="true">CUET</span>
        <small>Campus image unavailable</small>
      </div>
    );
  }

  return (
    // These are project-provided CUET assets. The explicit error UI keeps the
    // gallery understandable if an asset is missing or cannot be decoded.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
      onError={() => setHasError(true)}
    />
  );
}
