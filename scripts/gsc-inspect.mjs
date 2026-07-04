/**
 * gsc-inspect.mjs
 *
 * Fragt für eine Liste von URLs den echten Index-Status aus der Google Search
 * Console ab (URL-Inspection-API) und gibt eine Tabelle aus — plus eine
 * Markdown-Zusammenfassung ins GitHub-Job-Summary.
 *
 * Env:
 *   GSC_SA_KEY  (required) Service-Account-JSON (String) — dasselbe wie bei submit-sitemap.
 *   SITE_URL    (optional) GSC-Property, Default 'sc-domain:conjuexpert.app'.
 *   URLS        (optional) Komma-/Zeilen-getrennte Liste zu prüfender URLs (überschreibt Default).
 *
 * Läuft in CI (GitHub Action) mit dem Secret, NICHT in der Sandbox (kein Netz/Key).
 */
import crypto from 'node:crypto';

const SITE_URL = process.env.SITE_URL || 'sc-domain:conjuexpert.app';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const INSPECT = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';

// Default: die in der Search Console gemeldeten + wichtige Seiten.
const DEFAULT_URLS = [
  'https://conjuexpert.app/',
  'https://conjuexpert.app/blog/',
  'https://conjuexpert.app/blog/spanisch-verben-konjugieren/',
  'https://conjuexpert.app/blog/ser-vs-estar/',
  'https://conjuexpert.app/blog/reflexive-verben-spanisch/',
  'https://conjuexpert.app/konjugation/es/levantarse',
  'https://conjuexpert.app/konjugation/es/llamarse',
  'https://conjuexpert.app/konjugation/de/',
  'https://conjuexpert.app/konjugation/en/',
  'https://conjuexpert.app/konjugation/nl/',
  'https://conjuexpert.app/datenschutz.html',
  'https://conjuexpert.app/impressum.html',
];

function b64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function fail(msg) { console.error(`✗ ${msg}`); process.exit(1); }

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: sa.client_email, scope: SCOPE,
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
  if (!res.ok) fail(`Token-Anfrage fehlgeschlagen (${res.status}): ${await res.text()}`);
  const data = await res.json();
  if (!data.access_token) fail(`Kein access_token: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function liveStatus(url) {
  try {
    const r = await fetch(url, { method: 'GET', redirect: 'follow' });
    return String(r.status);
  } catch (e) {
    return 'ERR';
  }
}

async function inspect(token, url) {
  const live = await liveStatus(url); // echter aktueller HTTP-Status (CI hat Netz)
  const res = await fetch(INSPECT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE_URL }),
  });
  if (!res.ok) return { url, live, error: `HTTP ${res.status}: ${(await res.text()).slice(0, 160)}` };
  const r = (await res.json()).inspectionResult?.indexStatusResult || {};
  return {
    url,
    live,
    verdict: r.verdict || '—',
    coverage: r.coverageState || '—',
    robots: r.robotsTxtState || '—',
    indexing: r.indexingState || '—',
    fetch: r.pageFetchState || '—',
    lastCrawl: r.lastCrawlTime ? r.lastCrawlTime.slice(0, 10) : '—',
  };
}

const urls = (process.env.URLS || '').split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
const list = urls.length ? urls : DEFAULT_URLS;

const raw = process.env.GSC_SA_KEY;
if (!raw) fail('GSC_SA_KEY nicht gesetzt.');
let sa;
try { sa = JSON.parse(raw); } catch (e) { fail(`GSC_SA_KEY ist kein gültiges JSON: ${e.message}`); }
if (!sa.client_email || !sa.private_key) fail('GSC_SA_KEY: client_email/private_key fehlen.');

console.log(`→ Property: ${SITE_URL}`);
console.log(`→ Account : ${sa.client_email}`);
console.log(`→ URLs    : ${list.length}\n`);

const token = await getAccessToken(sa);
const rows = [];
for (const u of list) {
  const r = await inspect(token, u);
  rows.push(r);
  if (r.error) console.log(`✗ ${u}  (live:${r.live})\n    ${r.error}`);
  else console.log(`${r.verdict === 'PASS' ? '✅' : r.verdict === 'FAIL' ? '❌' : '🟡'} ${u}\n    live:${r.live} · GSC: ${r.coverage} · robots:${r.robots} · fetch:${r.fetch} · lastCrawl:${r.lastCrawl}`);
}

// GitHub-Job-Summary (Markdown-Tabelle)
const summary = process.env.GITHUB_STEP_SUMMARY;
if (summary) {
  const { writeFileSync } = await import('node:fs');
  const esc = (s) => String(s).replace(/\|/g, '\\|');
  const head = '## Search Console — Index-Status\n\n| Status | URL | live | GSC-Coverage | robots | letzter Crawl |\n|---|---|---|---|---|---|\n';
  const body = rows.map((r) => r.error
    ? `| ⚠️ | ${esc(r.url)} | ${esc(r.live)} | ${esc(r.error)} | — | — |`
    : `| ${r.verdict === 'PASS' ? '✅' : r.verdict === 'FAIL' ? '❌' : '🟡'} | ${esc(r.url)} | ${esc(r.live)} | ${esc(r.coverage)} | ${esc(r.robots)} | ${r.lastCrawl} |`
  ).join('\n');
  const indexed = rows.filter((r) => r.verdict === 'PASS').length;
  writeFileSync(summary, `${head}${body}\n\n**${indexed}/${rows.length} indexiert.**\n`, { flag: 'a' });
}

console.log('\nFertig.');
