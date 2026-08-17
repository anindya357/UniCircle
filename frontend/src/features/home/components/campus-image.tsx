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
    // The source is a verified CUET-owned media URL and the explicit error UI is
    // required to keep the gallery usable when that external host is unavailable.
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
