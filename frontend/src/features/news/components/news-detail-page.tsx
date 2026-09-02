import Link from "next/link";

import { AppShell } from "@/components/shared/app-shell";
import { routes } from "@/config/routes";
import {
  formatNewsFullDate,
  formatNewsTime,
} from "@/features/news/lib/format-news-date";
import type { CampusNewsItem, CampusNewsType } from "@/features/news/types/campus-news";

import styles from "./news-page.module.css";

type NewsDetailPageProps = Readonly<{
  item: CampusNewsItem;
}>;

const newsTypeLabels = {
  news: "Campus news",
  update: "Campus update",
  announcement: "Official announcement",
} as const satisfies Record<CampusNewsType, string>;

export function NewsDetailPage({ item }: NewsDetailPageProps) {
  return (
    <AppShell className={styles.detailPageShell}>
      <Link className={styles.backLink} href={routes.news}>
        <span aria-hidden="true">←</span>
        Back to news &amp; announcements
      </Link>

      <article>
        <header className={styles.detailHero} data-type={item.type}>
          <div className={styles.detailMeta}>
            <span>{newsTypeLabels[item.type]}</span>
            <time dateTime={item.publishedAt}>
              {formatNewsFullDate(item.publishedAt)} ·{" "}
              {formatNewsTime(item.publishedAt)}
            </time>
          </div>
          <h1>{item.title}</h1>
          <p>{item.summary}</p>
        </header>

        <div className={styles.detailLayout}>
          <section
            className={styles.articleBody}
            aria-labelledby="article-content-title"
          >
            <p className={styles.articleLabel} id="article-content-title">
              Full information
            </p>
            {item.content.map((paragraph, index) => (
              <p key={`${item.id}-paragraph-${index}`}>{paragraph}</p>
            ))}
          </section>

          <aside className={styles.articleFacts} aria-label="Publication details">
            <p>Publication details</p>
            <dl>
              <div>
                <dt>Type</dt>
                <dd>{newsTypeLabels[item.type]}</dd>
              </div>
              <div>
                <dt>Published by</dt>
                <dd>{item.publishedBy}</dd>
              </div>
              <div>
                <dt>Audience</dt>
                <dd>{item.audience}</dd>
              </div>
              <div>
                <dt>Published</dt>
                <dd>{formatNewsFullDate(item.publishedAt)}</dd>
              </div>
            </dl>
            <div className={styles.detailNotice}>
              <span aria-hidden="true">i</span>
              <p>
                Prototype information will be replaced by verified Admin publications
                after backend integration.
              </p>
            </div>
          </aside>
        </div>
      </article>
    </AppShell>
  );
}
