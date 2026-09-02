import Link from "next/link";

import { AppShell } from "@/components/shared/app-shell";
import { EmptyState } from "@/components/ui/feedback/empty-state";
import { routes } from "@/config/routes";
import { formatNewsDate, formatNewsTime } from "@/features/news/lib/format-news-date";
import type { CampusNewsItem, CampusNewsType } from "@/features/news/types/campus-news";

import styles from "./news-page.module.css";

type NewsPageProps = Readonly<{
  items: readonly CampusNewsItem[];
}>;

const newsTypeLabels = {
  news: "News",
  update: "Update",
  announcement: "Announcement",
} as const satisfies Record<CampusNewsType, string>;

export function NewsPage({ items }: NewsPageProps) {
  const typeCounts = items.reduce<Record<CampusNewsType, number>>(
    (counts, item) => ({ ...counts, [item.type]: counts[item.type] + 1 }),
    { news: 0, update: 0, announcement: 0 },
  );

  return (
    <AppShell className={styles.pageShell}>
      <section className={styles.hero} aria-labelledby="news-title">
        <div className={styles.heroCopy}>
          <p>Campus newsroom</p>
          <h1 id="news-title">
            Know what’s happening. <span>Stay connected to CUET.</span>
          </h1>
          <p>
            Read campus stories, service updates, and official announcements in one
            clear, newest-first information stream.
          </p>
          <div className={styles.prototypeNote}>
            <span aria-hidden="true">i</span>
            Prototype content · official information will come from authorized Admin
            publishing
          </div>
        </div>

        <aside className={styles.heroSummary} aria-label="Newsroom summary">
          <span>Published items</span>
          <strong>{String(items.length).padStart(2, "0")}</strong>
          <p>Campus information arranged by latest publication time.</p>
          <div>
            <span>{typeCounts.news} news</span>
            <span>{typeCounts.update} updates</span>
            <span>{typeCounts.announcement} announcements</span>
          </div>
        </aside>
      </section>

      <section className={styles.newsSection} aria-labelledby="latest-news-title">
        <header className={styles.sectionHeading}>
          <div>
            <p>Latest first</p>
            <h2 id="latest-news-title">News &amp; announcements</h2>
          </div>
          <div className={styles.typeLegend} aria-label="Content types">
            {(Object.keys(newsTypeLabels) as CampusNewsType[]).map((type) => (
              <span data-type={type} key={type}>
                {newsTypeLabels[type]}
              </span>
            ))}
          </div>
        </header>

        {items.length === 0 ? (
          <EmptyState
            title="No campus updates yet"
            description="New CUET news, updates, and announcements will appear here after publication."
          />
        ) : (
          <ol className={styles.newsList}>
            {items.map((item, index) => (
              <li key={item.id}>
                <article className={styles.newsCard}>
                  <span className={styles.serialNumber} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className={styles.newsContent}>
                    <div className={styles.newsMeta}>
                      <span data-type={item.type}>{newsTypeLabels[item.type]}</span>
                      <time dateTime={item.publishedAt}>
                        {formatNewsDate(item.publishedAt)} ·{" "}
                        {formatNewsTime(item.publishedAt)}
                      </time>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <div className={styles.publisherLine}>
                      <span>Published by {item.publishedBy}</span>
                      <span>For {item.audience}</span>
                    </div>
                  </div>
                  <Link href={`${routes.news}/${item.id}`}>
                    <span>Read full item</span>
                    <b aria-hidden="true">→</b>
                  </Link>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>
    </AppShell>
  );
}
