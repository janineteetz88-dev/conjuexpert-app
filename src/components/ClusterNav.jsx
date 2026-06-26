/**
 * ClusterNav — drei Unterkomponenten für die automatisch generierte Navigation.
 *
 * <Breadcrumb pageSlug>  — Global-Pillar → Hub → aktuelle Seite
 * <HubLink pageSlug>     — „Hoch zum Hub"-Link
 * <RelatedCards pageSlug> — 3 Geschwister-Spokes (ohne aktuelle Seite)
 *
 * Alle lesen ausschließlich aus clusters.js — keine Hardcodes hier.
 *
 * HINWEIS: Diese Komponenten laufen client-seitig (React im Browser).
 * LLM-Crawler (ChatGPT, Perplexity, Claude) führen kein JS aus und
 * sehen den Output NICHT. Sie sind als Übergangslösung gedacht,
 * bis SSG/Prerender implementiert ist. Siehe .agents/ssg-evaluation.md.
 */

import { clusters, GLOBAL_PILLAR, findPage } from "../data/clusters.js";

/* ─── Breadcrumb ──────────────────────────────────────────────────────────── */

export function Breadcrumb({ pageSlug }) {
  const { type, cluster, spoke } = findPage(pageSlug);

  const crumbs = [{ slug: "/blog/", label: "Blog" }];

  if (type === "globalPillar") {
    crumbs.push({ slug: GLOBAL_PILLAR.slug, label: GLOBAL_PILLAR.title, current: true });
  } else if (type === "hub" && cluster) {
    crumbs.push({ slug: GLOBAL_PILLAR.slug, label: GLOBAL_PILLAR.title });
    crumbs.push({ slug: cluster.hub.slug, label: cluster.hub.title, current: true });
  } else if (type === "spoke" && cluster && spoke) {
    crumbs.push({ slug: GLOBAL_PILLAR.slug, label: GLOBAL_PILLAR.title });
    if (cluster.hub && cluster.hub.live) {
      crumbs.push({ slug: cluster.hub.slug, label: cluster.hub.title });
    }
    crumbs.push({ slug: spoke.slug, label: spoke.title, current: true });
  } else {
    return null;
  }

  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.slug}>
          {i > 0 && <span aria-hidden="true">›</span>}
          {crumb.current ? (
            <span aria-current="page">{crumb.label}</span>
          ) : (
            <a href={crumb.slug}>{crumb.label}</a>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/* ─── HubLink ─────────────────────────────────────────────────────────────── */

export function HubLink({ pageSlug }) {
  const { type, cluster } = findPage(pageSlug);

  if (type === "spoke" && cluster && cluster.hub && cluster.hub.live) {
    return (
      <a
        className="inline"
        href={cluster.hub.slug}
        style={{ "--lc": cluster.color }}
      >
        ↑ Alle {cluster.label} Verben im Überblick
      </a>
    );
  }

  if (type === "hub" || type === "spoke") {
    return (
      <a className="inline" href={GLOBAL_PILLAR.slug}>
        ↑ {GLOBAL_PILLAR.title}
      </a>
    );
  }

  return null;
}

/* ─── RelatedCards ────────────────────────────────────────────────────────── */

const RELATED_COUNT = 3;

export function RelatedCards({ pageSlug }) {
  const { type, cluster, spoke } = findPage(pageSlug);

  if (!cluster) return null;

  const siblings = cluster.spokes.filter(
    (s) => s.live && s.slug.replace(/\/$/, "") !== pageSlug.replace(/\/$/, "")
  );

  const cards = siblings.slice(0, RELATED_COUNT);

  if (cards.length === 0) return null;

  return (
    <section className="block related" style={{ padding: "54px 0 0" }}>
      <div className="wrap">
        <span className="sec-tag">Weiterlesen</span>
        <div className="pair" style={{ marginTop: "18px" }}>
          {cards.map((card) => (
            <a key={card.slug} className="post" href={card.slug}>
              <div
                className="thumb"
                style={{ position: "relative", overflow: "hidden" }}
              >
                <div
                  className="glow"
                  style={{ background: cluster.color, opacity: 0.35 }}
                ></div>
                <span
                  className="verb"
                  style={{ color: cluster.color }}
                >
                  {cluster.label}
                </span>
              </div>
              <div className="body">
                <span
                  className="cat gram"
                  style={{ "--dc": cluster.color }}
                >
                  <span className="d"></span>Grammatik
                </span>
                <h3>{card.title}</h3>
                <div className="pmeta">
                  <span>{cluster.lang.toUpperCase()}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
