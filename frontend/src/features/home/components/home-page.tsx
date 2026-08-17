import Link from "next/link";

import { routes } from "@/config/routes";
import type { HomeOverview } from "@/features/home/types/home-overview";

import { CampusImage } from "./campus-image";
import styles from "./home-page.module.css";

type HomePageContentProps = Readonly<{
  overview: HomeOverview;
}>;

export function HomePageContent({ overview }: HomePageContentProps) {
  return (
    <>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{overview.hero.eyebrow}</p>
          <h1 id="home-title">{overview.hero.title}</h1>
          <p>{overview.hero.description}</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href={routes.campusExplorer}>
              Explore the campus <span aria-hidden="true">&#8599;</span>
            </Link>
            <a className={styles.secondaryAction} href="#cuet-story">
              Discover the story
            </a>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <CampusImage
            src={overview.gallery[1].src}
            alt={overview.gallery[1].alt}
            eager
          />
          <span className={styles.heroLocation}>Raozan · Chattogram</span>
        </div>
      </section>

      <ul className={styles.factGrid} aria-label="CUET at a glance">
        {overview.facts.map((fact) => (
          <li key={fact.id}>
            <strong>{fact.value}</strong>
            <span>{fact.label}</span>
          </li>
        ))}
      </ul>

      <section
        className={styles.storySection}
        id="cuet-story"
        aria-labelledby="story-title"
      >
        <div className={styles.sectionLabel}>
          <span>01</span>
          <p>About CUET</p>
        </div>
        <div className={styles.storyCopy}>
          <h2 id="story-title">{overview.introduction.title}</h2>
          <div>
            {overview.introduction.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <a
            className={styles.textLink}
            href="https://cuet.ac.bd/"
            target="_blank"
            rel="noreferrer"
          >
            Visit the official CUET website <span aria-hidden="true">&#8599;</span>
          </a>
        </div>
      </section>

      <section className={styles.historySection} aria-labelledby="history-title">
        <div className={styles.sectionIntro}>
          <div>
            <p className={styles.eyebrow}>From college to university</p>
            <h2 id="history-title">A timeline of progress</h2>
          </div>
          <p>
            CUET&apos;s identity has grown through more than five decades of engineering
            education and institutional development.
          </p>
        </div>

        <ol className={styles.timeline}>
          {overview.history.map((event) => (
            <li key={event.id}>
              <span className={styles.timelineYear}>{event.year}</span>
              <div>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        className={styles.achievementSection}
        aria-labelledby="achievement-title"
      >
        <div className={styles.sectionIntro}>
          <div>
            <p className={styles.eyebrow}>Learning with purpose</p>
            <h2 id="achievement-title">Achievement through impact</h2>
          </div>
          <p>
            CUET&apos;s contribution is reflected in its graduates, research culture,
            industry relevance, and active academic community.
          </p>
        </div>

        <ul className={styles.achievementGrid}>
          {overview.achievements.map((achievement) => (
            <li key={achievement.id}>
              <span>{achievement.marker}</span>
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.facilitySection} aria-labelledby="facilities-title">
        <div className={styles.facilityHeading}>
          <p className={styles.eyebrow}>Campus essentials</p>
          <h2 id="facilities-title">Facilities for learning and living</h2>
          <p>
            Academic support, residential life, wellbeing, transport, and student
            activities come together across the campus.
          </p>
        </div>

        <ul className={styles.facilityGrid}>
          {overview.facilities.map((facility) => (
            <li key={facility.id}>
              <span aria-hidden="true">{facility.marker}</span>
              <div>
                <h3>{facility.title}</h3>
                <p>{facility.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.gallerySection} aria-labelledby="gallery-title">
        <div className={styles.sectionIntro}>
          <div>
            <p className={styles.eyebrow}>Around campus</p>
            <h2 id="gallery-title">A glimpse of CUET</h2>
          </div>
          <p>
            Green roads, shared landmarks, and an active campus shape the everyday CUET
            experience.
          </p>
        </div>

        <div className={styles.galleryGrid}>
          {overview.gallery.map((image, index) => (
            <figure
              className={index === 0 ? styles.galleryFeatured : ""}
              key={image.id}
            >
              <div className={styles.galleryImage}>
                <CampusImage src={image.src} alt={image.alt} />
              </div>
              <figcaption>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {image.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={styles.videoSection} aria-labelledby="video-title">
        <div className={styles.videoCopy}>
          <p className={styles.eyebrow}>Campus in motion</p>
          <h2 id="video-title">{overview.video.title}</h2>
          <p>{overview.video.description}</p>
          <a
            className={styles.textLinkLight}
            href={overview.video.watchUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open video on YouTube <span aria-hidden="true">&#8599;</span>
          </a>
        </div>

        <div className={styles.videoFrame}>
          <iframe
            src={overview.video.embedUrl}
            title={overview.video.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          <noscript>
            <a href={overview.video.watchUrl}>{overview.video.sourceLabel}</a>
          </noscript>
        </div>
      </section>

      <footer className={styles.sourceNote}>
        <p>Static preview content prepared from:</p>
        <ul>
          {overview.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label} <span aria-hidden="true">&#8599;</span>
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </>
  );
}
