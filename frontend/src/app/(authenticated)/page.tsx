import { AppShell } from "@/components/shared/app-shell";
import { EmptyState } from "@/components/ui/feedback/empty-state";
import { homeService } from "@/services";

export default async function HomePage() {
  const overview = await homeService.getOverview();

  return (
    <AppShell>
      <section className="hero" aria-labelledby="foundation-title">
        <p className="eyebrow">CUET digital campus</p>
        <h1 id="foundation-title">{overview.platformName}</h1>
        <p className="hero-copy">{overview.tagline}</p>
        <span className="status-badge">Shared frontend shell ready</span>
      </section>

      <section className="section" aria-labelledby="modules-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Implementation roadmap</p>
            <h2 id="modules-title">Feature modules</h2>
          </div>
          <p>
            Typed mock services provide data until each FastAPI feature is integrated.
          </p>
        </div>

        {overview.modules.length === 0 ? (
          <EmptyState
            title="No modules available"
            description="Feature modules will appear here as the implementation progresses."
          />
        ) : (
          <ul className="module-grid" aria-label="Planned UniCircle modules">
            {overview.modules.map((module) => (
              <li className="module-card" key={module.id}>
                <span aria-hidden="true">{module.sequence}</span>
                <h3>{module.name}</h3>
                <p>{module.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
