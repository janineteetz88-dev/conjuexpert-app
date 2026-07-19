#!/usr/bin/env node
/**
 * Blotato social scheduler
 * ------------------------
 * Plant fällige Posts aus social-content/manifest.json über die Blotato-REST-API
 * ein (POST https://backend.blotato.com/v2/posts). Läuft im GitHub-Action-Runner
 * auf einem Cron — komplett unabhängig von einer laufenden Claude-Session oder dem
 * MCP-Connector. Ergebnisse werden in social-content/scheduled.json protokolliert,
 * damit kein Post doppelt eingeplant wird.
 *
 * Env:
 *   BLOTATO_API_KEY   (Pflicht)  – Blotato API-Key, als GitHub-Secret hinterlegt.
 *   LOOKAHEAD_DAYS    (optional) – wie viele Tage im Voraus eingeplant wird (Default 3).
 *   DRY_RUN           (optional) – "1" = nur anzeigen, nichts an Blotato senden.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const API_KEY = process.env.BLOTATO_API_KEY;
const DRY_RUN = process.env.DRY_RUN === '1';
if (!API_KEY && !DRY_RUN) {
  console.error('FEHLER: BLOTATO_API_KEY fehlt.');
  process.exit(1);
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const MANIFEST_PATH = join(ROOT, 'social-content', 'manifest.json');
const LEDGER_PATH = join(ROOT, 'social-content', 'scheduled.json');
const ENDPOINT = 'https://backend.blotato.com/v2/posts';
const LOOKAHEAD_DAYS = Number(process.env.LOOKAHEAD_DAYS || 3);

const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
let ledger = {};
try { ledger = JSON.parse(await readFile(LEDGER_PATH, 'utf8')); } catch { /* leeres Ledger ok */ }

const now = Date.now();
const horizon = now + LOOKAHEAD_DAYS * 24 * 3600 * 1000;
let changed = false;
let failures = 0;

for (const post of manifest.posts || []) {
  if (!post.id) { console.error('skip: Post ohne id'); continue; }
  if (ledger[post.id]) { console.log(`skip ${post.id}: bereits eingeplant`); continue; }

  const when = Date.parse(post.scheduledTime);
  if (Number.isNaN(when)) { console.error(`skip ${post.id}: ungültige scheduledTime`); failures++; continue; }
  if (when <= now) { console.log(`skip ${post.id}: liegt in der Vergangenheit`); continue; }
  if (when > horizon) { console.log(`defer ${post.id}: außerhalb ${LOOKAHEAD_DAYS}-Tage-Fenster`); continue; }

  const mediaUrls = (post.media || []).map((m) => `${post.mediaBaseUrl}/${m}`);
  const body = {
    post: {
      accountId: String(post.accountId),
      target: { targetType: post.platform },
      content: {
        platform: post.platform,
        text: post.caption,
        mediaUrls,
      },
    },
    scheduledTime: post.scheduledTime,
  };
  // Plattform-spezifische Pflichtfelder (bei Bedarf im Manifest setzen):
  if (post.mediaType) body.post.target.mediaType = post.mediaType;            // instagram: story|reel
  if (post.coverImageUrl) body.post.content.coverImageUrl = post.coverImageUrl; // eigenes Reel-Cover/Thumbnail
  if (post.platformOptions) Object.assign(body.post.target, post.platformOptions); // tiktok/youtube extras

  console.log(`plane ${post.id} -> ${post.platform} @ ${post.scheduledTime} (${mediaUrls.length} Medien)`);
  if (DRY_RUN) { console.log('  DRY_RUN: ' + JSON.stringify(body)); continue; }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'blotato-api-key': API_KEY },
      body: JSON.stringify(body),
    });
    const txt = await res.text();
    if (!res.ok) { console.error(`FEHLGESCHLAGEN ${post.id}: ${res.status} ${txt}`); failures++; continue; }
    let data = {}; try { data = JSON.parse(txt); } catch { /* nicht-JSON ok */ }
    ledger[post.id] = {
      scheduledAt: new Date().toISOString(),
      scheduledTime: post.scheduledTime,
      source: 'github-action',
      response: data,
    };
    changed = true;
    console.log(`OK ${post.id}: ${txt}`);
  } catch (err) {
    console.error(`FEHLER ${post.id}: ${err.message}`);
    failures++;
  }
}

if (changed) {
  await writeFile(LEDGER_PATH, JSON.stringify(ledger, null, 2) + '\n');
  console.log('Ledger aktualisiert.');
} else {
  console.log('Keine Änderungen.');
}

if (failures > 0) process.exit(1);
