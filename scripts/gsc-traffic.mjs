/**
 * gsc-traffic.mjs
 *
 * Fragt die Google-Search-Console-Suchanalyse ab (Klicks, Impressionen,
 * Position) für die letzten N Tage: Gesamtsumme, Verlauf pro Tag,
 * Top-Suchanfragen und Top-Seiten. Gibt eine Konsolen-Tabelle aus plus
 * Markdown ins GitHub-Job-Summary.
 *
 * Env:
 *   GSC_SA_KEY  (required) Service-Account-JSON (String) — dasselbe wie bei submit-sitemap.
 *   SITE_URL    (optional) GSC-Property, Default 'sc-domain:conjuexpert.app'.
 *   DAYS        (optional) Zeitraum in Tagen, Default 28.
 *
 * Läuft in CI (GitHub Action) mit dem Secret, NICHT in der Sandbox (kein Netz/Key).
 */
import crypto from 'node:crypto';
import fs from 'node:fs';

const SITE_URL = process.env.SITE_URL || 'sc-domain:conjuexpert.app';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const DAYS = Math.max(1, parseInt(process.env.DAYS || '28', 10) || 28);

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

async function query(token, body) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) fail(`Suchanalyse fehlgeschlagen (${res.status}): ${(await res.text()).slice(0, 300)}`);
  return (await res.json()).rows || [];
}

function iso(d) { return d.toISOString().slice(0, 10); }

async function main() {
  const raw = process.env.GSC_SA_KEY;
  if (!raw) fail('GSC_SA_KEY fehlt.');
  let sa;
  try { sa = JSON.parse(raw); } catch { fail('GSC_SA_KEY ist kein gültiges JSON.'); }
  const token = await getAccessToken(sa);

  // GSC-Daten hängen ~2 Tage nach → Enddatum = vorgestern.
  const end = new Date(Date.now() - 2 * 86400000);
  const start = new Date(end.getTime() - (DAYS - 1) * 86400000);
  const range = { startDate: iso(start), endDate: iso(end) };

  const byDate = await query(token, { ...range, dimensions: ['date'], rowLimit: 500 });
  const byQuery = await query(token, { ...range, dimensions: ['query'], rowLimit: 15 });
  const byPage = await query(token, { ...range, dimensions: ['page'], rowLimit: 15 });

  const sum = (k) => byDate.reduce((a, r) => a + (r[k] || 0), 0);
  const clicks = sum('clicks'), impressions = sum('impressions');
  const pos = byDate.length ? (byDate.reduce((a, r) => a + (r.position || 0) * (r.impressions || 0), 0) / Math.max(1, impressions)) : 0;

  const lines = [];
  lines.push(`# GSC-Suchanalyse ${range.startDate} → ${range.endDate} (${DAYS} Tage)`);
  lines.push('');
  lines.push(`**Klicks: ${clicks} · Impressionen: ${impressions} · Ø-Position: ${pos ? pos.toFixed(1) : '—'}**`);
  lines.push('');
  lines.push('## Verlauf (Tage mit Impressionen)');
  lines.push('| Datum | Klicks | Impressionen |');
  lines.push('|---|---|---|');
  byDate.filter(r => (r.impressions || 0) > 0).forEach(r => lines.push(`| ${r.keys[0]} | ${r.clicks || 0} | ${r.impressions || 0} |`));
  lines.push('');
  lines.push('## Top-Suchanfragen');
  lines.push('| Anfrage | Klicks | Impr. | Pos. |');
  lines.push('|---|---|---|---|');
  byQuery.forEach(r => lines.push(`| ${r.keys[0]} | ${r.clicks || 0} | ${r.impressions || 0} | ${(r.position || 0).toFixed(1)} |`));
  lines.push('');
  lines.push('## Top-Seiten');
  lines.push('| Seite | Klicks | Impr. | Pos. |');
  lines.push('|---|---|---|---|');
  byPage.forEach(r => lines.push(`| ${r.keys[0].replace('https://conjuexpert.app', '')} | ${r.clicks || 0} | ${r.impressions || 0} | ${(r.position || 0).toFixed(1)} |`));

  const out = lines.join('\n');
  console.log(out);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, out + '\n');
}

main().catch(e => fail(e && e.message || String(e)));
