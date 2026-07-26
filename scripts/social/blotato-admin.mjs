#!/usr/bin/env node
/**
 * Blotato admin helper — geplante Posts auflisten / stornieren.
 * -----------------------------------------------------------------
 * NUR für manuelle Korrekturen (workflow_dispatch). Ändert nichts am Ledger.
 *
 * Env:
 *   BLOTATO_API_KEY  (Pflicht)
 *   MODE             'list' (read-only) | 'delete'
 *   ID               (bei delete) Schedule-/Post-ID
 *   PATHSEG          (optional) API-Segment für delete, Default 'posts'
 */
const API_KEY = process.env.BLOTATO_API_KEY;
const MODE = process.env.MODE || 'list';
const ID = process.env.ID || '';
const PATHSEG = process.env.PATHSEG || 'posts';
const BASE = 'https://backend.blotato.com/v2';
const H = { 'Content-Type': 'application/json', 'blotato-api-key': API_KEY };

if (!API_KEY) { console.error('FEHLER: BLOTATO_API_KEY fehlt.'); process.exit(1); }

const show = async (label, res) => {
  const txt = await res.text();
  console.log(`\n=== ${label} -> ${res.status} ${res.statusText} ===`);
  console.log(txt.length > 6000 ? txt.slice(0, 6000) + ' …[gekürzt]' : txt);
  return txt;
};

if (MODE === 'list') {
  // read-only: mehrere Kandidaten-Endpunkte probieren, bis einer die geplanten Posts liefert
  const candidates = ['posts', 'schedules', 'scheduled-posts', 'posts/scheduled'];
  for (const c of candidates) {
    try { await show(`GET /${c}`, await fetch(`${BASE}/${c}`, { headers: H })); }
    catch (e) { console.log(`\n=== GET /${c} -> FEHLER ${e.message} ===`); }
  }
} else if (MODE === 'delete') {
  if (!ID) { console.error('FEHLER: ID fehlt für delete.'); process.exit(1); }
  const url = `${BASE}/${PATHSEG}/${ID}`;
  // DELETE ohne Body: KEIN Content-Type:application/json senden, sonst 400
  // ("Body cannot be empty when content-type is set to 'application/json'").
  const res = await fetch(url, { method: 'DELETE', headers: { 'blotato-api-key': API_KEY } });
  const txt = await show(`DELETE /${PATHSEG}/${ID}`, res);
  if (!res.ok) { console.error('Löschen fehlgeschlagen.'); process.exit(1); }
  console.log('OK gelöscht:', ID);
} else {
  console.error('Unbekannter MODE:', MODE); process.exit(1);
}
