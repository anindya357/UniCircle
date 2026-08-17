import { AppShell } from "@/components/shared/app-shell";
import type { FeaturePageContent } from "@/features/shell/config/feature-pages";

import styles from "./feature-placeholder.module.css";

type FeaturePlaceholderProps = Readonly<{
  content: FeaturePageContent;
}>;

export function FeaturePlaceholder({ content }: FeaturePlaceholderProps) {
  return (
    <AppShell>
      <section className={styles.hero} aria-labelledby="feature-page-title">
        <p className="eyebrow">{content.eyebrow}</p>
        <h1 id="feature-page-title">{content.title}</h1>
        <p>{content.description}</p>
        <span>Scheduled for Phase 4</span>
      </section>
    </AppShell>
  );
}
