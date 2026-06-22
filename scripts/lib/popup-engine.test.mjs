/**
 * Tests für die Pop-up-Entscheidungs-Engine (§6 Takt, §9 Free-Rotation).
 *   node --test scripts/lib/popup-engine.test.mjs
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  selectPopup, canShowPromo, nextFreePopup,
  notePromoShown, noteFreeShown,
  POPUP, PROMO_PAUSE_MS, PROMO_PAUSE_CLICKS, MAX_PROMOS_PER_VISIT,
} from "./popup-engine.mjs";

const base = (over = {}) => ({
  onboardingDone: true, plan: "anonym", hasAccount: false, trialActive: true,
  verbCount: 0, quizRounds: 0, promosShownThisVisit: 0, lastPromoAt: null,
  clicksSinceLastPromo: 0, shownThisVisit: [], lastPromoCategory: null,
  now: 1_000_000, ...over,
});

/* ── Startfenster + Premium ──────────────────────────────────────────────── */
test("erstes Öffnen → P0", () => {
  assert.equal(selectPopup(base({ onboardingDone: false })), POPUP.P0);
});
test("Premium → kein Werbe-/Free-Fenster", () => {
  assert.equal(selectPopup(base({ plan: "premium", verbCount: 9 })), null);
});

/* ── Verhaltens-Trigger (§6) ─────────────────────────────────────────────── */
test("5 Verben → P1 (Konto-Anstupser)", () => {
  assert.equal(selectPopup(base({ verbCount: 5 })), POPUP.P1);
});
test("unter 5 Verben → nichts Werbliches", () => {
  assert.equal(selectPopup(base({ verbCount: 4 })), null);
});
test("12 Runden → P2 (Home-Screen)", () => {
  assert.equal(selectPopup(base({ quizRounds: 12 })), POPUP.P2);
});
test("Klick auf 🔒 → P7 (auch ohne Trial)", () => {
  assert.equal(selectPopup(base({ plan: "free", trialActive: false, lockedClick: true })), POPUP.P7);
});
test("Trial vorbei mit Konto → T_End, anonym → T_End_Anon", () => {
  assert.equal(selectPopup(base({ trialActive: false, trialEndedUnseen: true, hasAccount: true, plan: "free" })), POPUP.T_End);
  assert.equal(selectPopup(base({ trialActive: false, trialEndedUnseen: true, hasAccount: false })), POPUP.T_End_Anon);
});
test("Exit-Intent ohne Konto → P3 (Letzte Chance)", () => {
  assert.equal(selectPopup(base({ exitIntent: true })), POPUP.P3);
});
test("Rückkehr ohne Konto mit Fortschritt → P8", () => {
  assert.equal(selectPopup(base({ isReturnVisit: true, hasProgress: true })), POPUP.P8);
});
test("Erfolgsmoment anonym → PUSH (einmal)", () => {
  assert.equal(selectPopup(base({ successMoment: true })), POPUP.PUSH);
  assert.equal(selectPopup(base({ successMoment: true, pushAsked: true })), null);
});

/* ── Frequenz-Cap (§6) ───────────────────────────────────────────────────── */
test("Pause: direkt nach einem Werbe-Fenster kein zweites (Zeit nicht um, < 10 Klicks)", () => {
  const s = base({ verbCount: 5, quizRounds: 12, promosShownThisVisit: 1, lastPromoAt: 1_000_000, clicksSinceLastPromo: 3, shownThisVisit: ["P1"], lastPromoCategory: "konto" });
  assert.equal(canShowPromo(s), false);
  assert.equal(selectPopup(s), null);
});
test("Pause vorbei nach ~5 Min → nächstes Werbe-Fenster", () => {
  const s = base({ verbCount: 5, quizRounds: 12, promosShownThisVisit: 1, lastPromoAt: 1_000_000, now: 1_000_000 + PROMO_PAUSE_MS, clicksSinceLastPromo: 0, shownThisVisit: ["P1"], lastPromoCategory: "konto" });
  assert.equal(canShowPromo(s), true);
  // Alternation: zuletzt „konto" (P1) → jetzt „home" (P2) bevorzugt
  assert.equal(selectPopup(s), POPUP.P2);
});
test("Pause vorbei nach ~10 Klicks → nächstes Werbe-Fenster", () => {
  const s = base({ verbCount: 5, promosShownThisVisit: 1, lastPromoAt: 1_000_000, now: 1_000_001, clicksSinceLastPromo: PROMO_PAUSE_CLICKS, shownThisVisit: ["P2"], lastPromoCategory: "home" });
  assert.equal(canShowPromo(s), true);
  assert.equal(selectPopup(s), POPUP.P1); // P1 noch nicht gezeigt
});
test("Max ~3 Werbe-Fenster pro Besuch", () => {
  const s = base({ verbCount: 5, quizRounds: 12, promosShownThisVisit: MAX_PROMOS_PER_VISIT, lastPromoAt: 1, now: 9_999_999 });
  assert.equal(canShowPromo(s), false);
  assert.equal(selectPopup(s), null);
});
test("Letzte Chance (P3) erscheint auch bei erreichtem Cap", () => {
  const s = base({ exitIntent: true, promosShownThisVisit: MAX_PROMOS_PER_VISIT, lastPromoAt: 1, now: 2 });
  assert.equal(selectPopup(s), POPUP.P3);
});
test("notePromoShown setzt Cap-Status korrekt", () => {
  const patch = notePromoShown(base(), POPUP.P1, 5000);
  assert.equal(patch.promosShownThisVisit, 1);
  assert.equal(patch.lastPromoAt, 5000);
  assert.equal(patch.clicksSinceLastPromo, 0);
  assert.equal(patch.lastPromoCategory, "konto");
  assert.deepEqual(patch.shownThisVisit, ["P1"]);
});

/* ── Free-Rotation (§9) ──────────────────────────────────────────────────── */
test("Free: max 1/Sitzung — bereits gezeigt → null", () => {
  assert.equal(selectPopup(base({ plan: "free", trialActive: false, freeSessionEligible: true, freeShownThisSession: true })), null);
});
test("Free: nicht jede Sitzung — nicht eligible → null", () => {
  assert.equal(selectPopup(base({ plan: "free", trialActive: false, freeSessionEligible: false })), null);
});
test("Free: eligible → erstes Rotations-Fenster (FR1)", () => {
  assert.equal(selectPopup(base({ plan: "free", trialActive: false, freeSessionEligible: true, freeShownIds: [] })), POPUP.FR1);
});
test("Free-Rotation: nie dasselbe zweimal hintereinander, Re-Offer (FR4/FR5) seltener", () => {
  let history = [];
  const pick = () => { const id = nextFreePopup({ freeShownIds: history }); history.push(id); return id; };
  const seq = Array.from({ length: 12 }, pick);
  // kein direkter Doppelschlag
  for (let i = 1; i < seq.length; i++) assert.notEqual(seq[i], seq[i - 1], "kein Doppel: " + seq.join(","));
  // alle Fenster kommen vor, FR4/FR5 aber nachrangig
  assert.ok(seq.includes("FR4") && seq.includes("FR5"), "FR4/FR5 erscheinen: " + seq.join(","));
  const c = (id) => seq.filter((x) => x === id).length;
  // Re-Offer/Upsell nicht häufiger als ein normaler Tipp (= seltener)
  assert.ok(c("FR4") <= c("FR1") && c("FR5") <= c("FR1"), "Re-Offer seltener: " + seq.join(","));
});
test("noteFreeShown markiert Sitzung + Historie", () => {
  const patch = noteFreeShown(base({ freeShownIds: ["FR1"] }), POPUP.FR2);
  assert.equal(patch.freeShownThisSession, true);
  assert.deepEqual(patch.freeShownIds, ["FR1", "FR2"]);
});
