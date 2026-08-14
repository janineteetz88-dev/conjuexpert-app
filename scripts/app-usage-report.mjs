#!/usr/bin/env node
/**
 * app-usage-report.mjs
 *
 * Holt die App-Nutzung der letzten 7 Tage aus Plausible (Besucher, Seitenaufrufe,
 * Top-Seiten, Referrer) und der Google Search Console (Impressions, Klicks, CTR,
 * Top-Suchanfragen, Top-Seiten) und legt daraus einen Eintrag in der Notion-
 * Datenbank „🫡 Berichte" an (Quelle: „App-Nutzung (Plausible/GSC)").
 *
 * Env:
 *   PLAUSIBLE_API_KEY  (required) Plausible Stats-API-Key (read-only reicht).
 *   GSC_SA_KEY         (required) Service-Account-JSON — dasselbe wie bei gsc-inspect/submit-sitemap.
 *   NOTION_API_KEY     (required) Notion-Integration-Token — dasselbe wie bei sync-notion-tracker.
 *   SITE_DOMAIN        (optional) Plausible site_id, Default 'conjuexpert.app'.
 *   SITE_URL           (optional) GSC-Property, Default 'sc-domain:conjuexpert.app'.
 *
 * Läuft in CI (GitHub Action) mit den Secrets, NICHT in der Sandbox (kein Netz/Keys).
 * Fehlt ein Secret, bricht das Script NICHT den Job ab (exit 0) — siehe Vorbild
 * sync-notion-tracker.mjs. Grund: die drei Zugänge werden schrittweise eingerichtet,
 * das soll den restlichen CI-Lauf nicht blockieren.
 *
 * Aufruf: node scripts/app-usage-report.mjs
 */

import crypto from 'node:crypto';

const SITE_DOMAIN = process.env.SITE_DOMAIN || 'conjuexpert.app';
const SITE_URL = process.env.SITE_URL || 'sc-domain:conjuexpert.app';
const BERICHTE_DATA_SOURCE_ID = 'c5cc37ef-dbe9-46a2-ab7e-639eab468225';
const NOTION_VERSION_DS = '2025-09-03';

function warnMissing(name) {
  console.error(`⚠️  ${name} nicht gesetzt — Bericht übersprungen (nicht blockierend).`);
  console.error('    In CI als Secret hinterlegen, sobald der Zugang eingerichtet ist.');
}

const plausibleKey = process.env.PLAUSIBLE_API_KEY;
const gscRaw = process.env.GSC_SA_KEY;
const notionKey = process.env.NOTION_API_KEY;

if (!plausibleKey) { warnMissing('PLAUSIBLE_API_KEY'); process.exit(0); }
if (!gscRaw) { warnMissing('GSC_SA_KEY'); process.exit(0); }
if (!notionKey) { warnMissing('NOTION_API_KEY'); process.exit(0); }

let gscServiceAccount;
try {
  gscServiceAccount = JSON.parse(gscRaw);
} catch (e) {
  console.error(`❌  GSC_SA_KEY ist kein gültiges JSON: ${e.message}`);
  process.exit(0);
}
if (!gscServiceAccount.client_email || !gscServiceAccount.private_key) {
  console.error('❌  GSC_SA_KEY: client_email/private_key fehlen.');
  process.exit(0);
}

/* ─── Zeitraum: letzte 7 abgeschlossene Tage (GSC hat ~2-3 Tage Meldeverzug) ─── */

const today = new Date();
const end = new Date(today); end.setUTCDate(end.getUTCDate() - 3);
const start = new Date(end); start.setUTCDate(start.getUTCDate() - 6);
const fmt = (d) => d.toISOString().slice(0, 10);
const startDate = fmt(start);
const endDate = fmt(end);

/* ─── Plausible Stats API v1 ─────────────────────────────────────────────── */

async function plausibleFetch(path, params) {
  const url = new URL(`https://plausible.io/api/v1/stats/${path}`);
  url.searchParams.set('site_id', SITE_DOMAIN);
  url.searchParams.set('period', '7d');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${plausibleKey}` } });
  if (!res.ok) throw new Error(`Plausible API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function getPlausibleStats() {
  const aggregate = await plausibleFetch('aggregate', {
    metrics: 'visitors,pageviews,visit_duration,bounce_rate',
  });
  const topPages = await plausibleFetch('breakdown', {
    property: 'event:page', metrics: 'visitors', limit: '5',
  });
  const topSources = await plausibleFetch('breakdown', {
    property: 'visit:source', metrics: 'visitors', limit: '5',
  });
  return {
    visitors: aggregate.results?.visitors?.value ?? 0,
    pageviews: aggregate.results?.pageviews?.value ?? 0,
    visitDuration: aggregate.results?.visit_duration?.value ?? 0,
    bounceRate: aggregate.results?.bounce_rate?.value ?? 0,
    topPages: topPages.results ?? [],
    topSources: topSources.results ?? [],
  };
}

/* ─── Google Search Console (searchanalytics/query) ──────────────────────── */

function b64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getGscAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const scope = 'https://www.googleapis.com/auth/webmasters.readonly';
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: sa.client_email, scope,
    aud: sa.token_uri || 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  }));
  const signingInput = `${header}.${claim}`;
  const signature = crypto.createSign('RSA-SHA256').update(signingInput)
    .sign(sa.private_key, 'base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const res = await fetch(sa.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${signingInput}.${signature}` }),
  });
  if (!res.ok) throw new Error(`GSC Token-Anfrage fehlgeschlagen (${res.status}): ${await res.text()}`);
  const data = await res.json();
  if (!data.access_token) throw new Error(`Kein GSC access_token: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function gscQuery(token, body) {
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(`GSC searchAnalytics ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function getGscStats() {
  const token = await getGscAccessToken(gscServiceAccount);
  const [totals, queries, pages] = await Promise.all([
    gscQuery(token, { startDate, endDate }),
    gscQuery(token, { startDate, endDate, dimensions: ['query'], rowLimit: 5 }),
    gscQuery(token, { startDate, endDate, dimensions: ['page'], rowLimit: 5 }),
  ]);
  const t = totals.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  return {
    clicks: t.clicks,
    impressions: t.impressions,
    ctr: t.ctr,
    position: t.position,
    topQueries: queries.rows || [],
    topPages: pages.rows || [],
  };
}

/* ─── Notion: Eintrag in „🫡 Berichte" anlegen ───────────────────────────── */

async function notionCreatePage(properties) {
  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${notionKey}`,
      'Notion-Version': NOTION_VERSION_DS,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { type: 'data_source_id', data_source_id: BERICHTE_DATA_SOURCE_ID },
      properties,
    }),
  });
  if (!res.ok) throw new Error(`Notion API ${res.status}: ${await res.text()}`);
  return res.json();
}

/* ─── Report zusammenbauen + Highlights ableiten ─────────────────────────── */

function pct(n) { return `${(n ?? 0).toFixed(1)}%`; }
function fmtDuration(sec) {
  const m = Math.floor((sec ?? 0) / 60);
  const s = Math.round((sec ?? 0) % 60);
  return `${m}m ${s}s`;
}

function buildHighlights(plausible, gsc) {
  const lines = [];
  lines.push(`Plausible (${startDate} – ${endDate}): ${plausible.visitors} Besucher, ${plausible.pageviews} Seitenaufrufe, Ø Verweildauer ${fmtDuration(plausible.visitDuration)}, Bounce-Rate ${pct(plausible.bounceRate)}.`);
  if (plausible.topPages.length) {
    lines.push(`Top-Seiten: ${plausible.topPages.map((p) => `${p.page} (${p.visitors})`).join(', ')}.`);
  }
  if (plausible.topSources.length) {
    lines.push(`Top-Quellen: ${plausible.topSources.map((s) => `${s.source} (${s.visitors})`).join(', ')}.`);
  }
  lines.push(`GSC: ${gsc.impressions} Impressions, ${gsc.clicks} Klicks, CTR ${pct((gsc.ctr ?? 0) * 100)}, Ø Position ${(gsc.position ?? 0).toFixed(1)}.`);
  if (gsc.topQueries.length) {
    lines.push(`Top-Suchanfragen: ${gsc.topQueries.map((q) => `„${q.keys[0]}" (${q.clicks} Klicks)`).join(', ')}.`);
  }
  if (gsc.topPages.length) {
    lines.push(`Top-Seiten (GSC): ${gsc.topPages.map((p) => `${p.keys[0]} (${p.clicks} Klicks)`).join(', ')}.`);
  }
  return lines.join('\n');
}

console.log(`\n📊 App-Nutzungs-Bericht: ${startDate} – ${endDate}`);

let plausible, gsc;
try {
  plausible = await getPlausibleStats();
} catch (e) {
  console.error(`❌  Plausible-Abfrage fehlgeschlagen: ${e.message}`);
  process.exit(0);
}
try {
  gsc = await getGscStats();
} catch (e) {
  console.error(`❌  GSC-Abfrage fehlgeschlagen: ${e.message}`);
  process.exit(0);
}

const highlights = buildHighlights(plausible, gsc);
console.log(`\n${highlights}\n`);

const title = `App-Nutzungs-Bericht — ${startDate} bis ${endDate}`;
const properties = {
  Titel: { title: [{ text: { content: title } }] },
  Quelle: { select: { name: 'App-Nutzung (Plausible/GSC)' } },
  Datum: { date: { start: fmt(today) } },
  'Ergebnisse / Highlights': { rich_text: [{ text: { content: highlights.slice(0, 2000) } }] },
  Absprung: { url: `https://plausible.io/${SITE_DOMAIN}` },
};

try {
  await notionCreatePage(properties);
  console.log('✅  Eintrag in „🫡 Berichte" angelegt.');
} catch (e) {
  console.error(`❌  Notion-Eintrag fehlgeschlagen: ${e.message}`);
  process.exit(0);
}

const summary = process.env.GITHUB_STEP_SUMMARY;
if (summary) {
  const { writeFileSync } = await import('node:fs');
  writeFileSync(summary, `## ${title}\n\n${highlights.split('\n').map((l) => `- ${l}`).join('\n')}\n`, { flag: 'a' });
}

console.log('\nFertig.');
