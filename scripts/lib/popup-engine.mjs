/**
 * popup-engine.mjs
 *
 * Reine Entscheidungs-Logik für die Onboarding-/Trial-/Free-Pop-ups.
 * Quelle: Notion Dev-Spec §6 (Reise A — Takt), §9 (Free-Rotation).
 *
 * Kein DOM, kein State-Besitz: `selectPopup(state)` bekommt den aktuellen Zustand
 * und gibt die ID des EINEN anzuzeigenden Fensters zurück (oder null). Die UI-Schicht
 * rendert das Fenster und meldet „gezeigt/weggeklickt" über `notePromoShown(...)`
 * bzw. `noteFreeShown(...)` zurück (liefern reine State-Patches → unit-testbar).
 *
 * Frequenz-Cap (§6): immer nur EIN Fenster, Pause zwischen Werbe-Fenstern
 * (~5 Min ODER ~10 Klicks), abwechselnd Konto/Home-Screen, max. ~3 Werbe-Fenster
 * pro Besuch, Quiz-Hilfe zählt NICHT als Werbung, alles wegklickbar (UI-Sache).
 */

/* ─── Pop-up-IDs (= Keys in locales/*.json → popup.<ID>) ─────────────────── */
export const POPUP = {
  P0: "P0", P1: "P1", P2: "P2", P3: "P3", P4: "P4",
  P5: "P5", P5b: "P5b", P6: "P6", P7: "P7", P8: "P8", P9: "P9",
  K1: "K1", K2: "K2", K3: "K3",
  B_Fail: "B_Fail", T_End: "T_End", T_End_Anon: "T_End_Anon",
  PUSH: "PUSH", S1: "S1",
  FR1: "FR1", FR2: "FR2", FR3: "FR3", FR4: "FR4", FR5: "FR5",
};

/* ─── Frequenz-Cap-Konstanten (§6) ───────────────────────────────────────── */
export const PROMO_PAUSE_MS = 5 * 60 * 1000; // ~5 Minuten
export const PROMO_PAUSE_CLICKS = 10;        // ~10 Klicks
export const MAX_PROMOS_PER_VISIT = 3;       // max. ~3 Werbe-Fenster pro Besuch

// Werbe-Fenster, die dem Cap + Pause + Alternation unterliegen, mit Kategorie
// für das abwechselnde Anzeigen (Konto vs. Home-Screen).
const PROMO_CATEGORY = { P1: "konto", P8: "konto", P2: "home", P4: "home" };
// Die Standard-Reihenfolge der Free-Rotation (§9).
export const FREE_ROTATION = ["FR1", "FR2", "FR3", "FR4", "FR5"];
// Re-Offer/Upsell seltener zeigen (§9): zählt mit Bias, erscheint also später.
const FREE_REOFFER = new Set(["FR4", "FR5"]);

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function shown(state, id) {
  return Array.isArray(state.shownThisVisit) && state.shownThisVisit.includes(id);
}

function shownTrialEnd(state) {
  return shown(state, POPUP.T_End) || shown(state, POPUP.T_End_Anon);
}

/**
 * Darf gerade ein (gecapptes) Werbe-Fenster erscheinen? — §6:
 * unter Max-Limit UND Pause vorbei (Zeit ODER Klicks).
 */
export function canShowPromo(state) {
  const now = state.now ?? Date.now();
  if ((state.promosShownThisVisit || 0) >= MAX_PROMOS_PER_VISIT) return false;
  if (state.lastPromoAt == null) return true;
  const pauseOver =
    now - state.lastPromoAt >= PROMO_PAUSE_MS ||
    (state.clicksSinceLastPromo || 0) >= PROMO_PAUSE_CLICKS;
  return pauseOver;
}

/**
 * Nächstes Free-Rotations-Fenster (§9): nimmt das am seltensten gezeigte FR
 * (Re-Offer FR4/FR5 mit Bias → später), nie dasselbe wie zuletzt, deterministisch.
 */
export function nextFreePopup(state) {
  const rotation = state.freeRotation && state.freeRotation.length ? state.freeRotation : FREE_ROTATION;
  const history = state.freeShownIds || [];
  const last = history.length ? history[history.length - 1] : null;
  const count = (id) => history.filter((x) => x === id).length + (FREE_REOFFER.has(id) ? 1 : 0);

  const candidates = rotation.filter((id) => id !== last);
  const pool = candidates.length ? candidates : rotation;

  let best = pool[0];
  for (const id of pool) {
    if (count(id) < count(best) ||
        (count(id) === count(best) && rotation.indexOf(id) < rotation.indexOf(best))) {
      best = id;
    }
  }
  return best;
}

/* ─── Kern: welches Fenster (wenn überhaupt)? ────────────────────────────── */

/**
 * @param {object} state  Zustand (siehe README/onboarding-popups.md, §13-Felder)
 * @returns {string|null} Pop-up-ID oder null
 */
export function selectPopup(state) {
  const s = state || {};

  // 0) Erstes Öffnen → Startfenster/Onboarding (nicht cap-relevant).
  if (!s.onboardingDone) return POPUP.P0;

  // Premium: keine Werbe-/Free-Fenster (Abo-Pflege läuft über eigene Trigger).
  if (s.plan === "premium") return null;

  // 1) Nutzer-initiiert / Statuswechsel — NICHT dem Werbe-Cap unterworfen,
  //    aber je einmal pro Besuch.
  if (s.lockedClick && !shown(s, POPUP.P7)) return POPUP.P7;            // Klick auf 🔒

  if (s.trialEndedUnseen && !shownTrialEnd(s)) {                         // Trial vorbei
    return s.hasAccount ? POPUP.T_End : POPUP.T_End_Anon;
  }

  if ((s.exitIntent || s.nearTrialEnd) && !s.hasAccount && s.trialActive && !shown(s, POPUP.P3)) {
    return POPUP.P3;                                                     // Letzte Chance (immer erlaubt)
  }

  if (s.successMoment && s.plan === "anonym" && !s.pushAsked && !shown(s, POPUP.PUSH)) {
    return POPUP.PUSH;                                                   // Erinnerung erlauben (anon)
  }

  // 2) Gecappte Werbe-Nudges (Konto/Home), §6 — abwechselnd, mit Pause & Limit.
  if (canShowPromo(s)) {
    const candidates = [];
    if (s.plan === "anonym" && !s.hasAccount && s.trialActive) {
      if ((s.verbCount || 0) >= 5 && !shown(s, POPUP.P1)) candidates.push(POPUP.P1);   // 5 Verben
      if ((s.quizRounds || 0) >= 12 && !shown(s, POPUP.P2)) candidates.push(POPUP.P2); // 12 Runden
    }
    if (s.accountDeclined && !shown(s, POPUP.P4)) candidates.push(POPUP.P4);           // Home-Fallback
    if (s.isReturnVisit && !s.hasAccount && s.hasProgress && !shown(s, POPUP.P8)) {
      candidates.push(POPUP.P8);                                                       // Willkommen-zurück
    }
    if (candidates.length) {
      // Alternation: bevorzugt anderer Typ als zuletzt (Konto ↔ Home).
      const alt = candidates.find((id) => PROMO_CATEGORY[id] !== s.lastPromoCategory);
      return alt || candidates[0];
    }
  }

  // 3) Free-Rotation (§9): nur Free, max. 1/Sitzung, nicht jede Sitzung.
  if (s.plan === "free" && !s.freeShownThisSession && s.freeSessionEligible) {
    return nextFreePopup(s);
  }

  return null;
}

/* ─── Reine State-Patches für die UI-Schicht ─────────────────────────────── */

/** Nach Anzeige eines gecappten Werbe-Fensters. */
export function notePromoShown(state, id, now = Date.now()) {
  const cat = PROMO_CATEGORY[id] || null;
  return {
    promosShownThisVisit: (state.promosShownThisVisit || 0) + 1,
    lastPromoAt: now,
    clicksSinceLastPromo: 0,
    lastPromoCategory: cat || state.lastPromoCategory || null,
    shownThisVisit: [...(state.shownThisVisit || []), id],
  };
}

/** Nach Anzeige eines kontextuellen/nutzer-initiierten Fensters (kein Cap). */
export function noteShown(state, id) {
  return { shownThisVisit: [...(state.shownThisVisit || []), id] };
}

/** Nach Anzeige eines Free-Rotations-Fensters. */
export function noteFreeShown(state, id) {
  return {
    freeShownThisSession: true,
    freeShownIds: [...(state.freeShownIds || []), id],
  };
}

/** Klick-Zähler hochsetzen (für die ~10-Klick-Pause). */
export function noteClick(state) {
  return { clicksSinceLastPromo: (state.clicksSinceLastPromo || 0) + 1 };
}

export const PROMO_CATEGORY_MAP = PROMO_CATEGORY;
