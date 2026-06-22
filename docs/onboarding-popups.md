# Onboarding / Trial / Paywall — Pop-up- & Mail-Schicht

Umsetzung der Notion-Dev-Spec „🚀 Customer Journey & Onboarding — Endfassung".
**Eine Wahrheit** für das Wording: `locales/*.json`. Styling der Fenster:
`docs/popup-system.md`. CTAs: `docs/button-system.md`.

> Diese Schicht wird **in Teil-PRs** geliefert. Dieser PR ist **Teil 1: Fundament**
> (Strings, Entscheidungs-Logik, Feldmodell). Was noch offen ist, steht unten.

---

## 1. i18n — die Texte (Spec §11/§12)

- `locales/de.json` — **deutscher Master, zeichengenau** aus der Spec.
  - `popup.*` — P0–P9, K1/K2/K3 (inkl. K3a/b/c), B_Fail, T_End, T_End_Anon, PUSH, S1, FR1–FR5
  - `mail.*` — M1–M7, M_Login, A1–A6
- `locales/en|es|fr|nl.json` — **dieselben Keys**, Werte = 1:1-Kopie von DE +
  `_meta.status = "TODO"`. **Bewusst nicht maschinell übersetzt** (Spec §16.8).
- **Variablen** (echte Platzhalter): `{name}` [Name] · `{enddate}` [Enddatum/Uhrzeit] ·
  `{restzeit}` [Restzeit] · `{article_title}` · `{article_benefit}` · `{login_link}` ·
  `{email}` · `{datum}` · `{preis}` · `{streak_days}`.
- Begriff durchgehend **„Premiumtarif"**, Code **WILLKOMMEN**, Preise 24,99 € / 29,99 € / 2,99 €.

## 2. Entscheidungs-Logik (Spec §6 Takt, §9 Free-Rotation)

`scripts/lib/popup-engine.mjs` — **reine** Funktion, kein DOM, kein State-Besitz:

- `selectPopup(state)` → genau **eine** Pop-up-ID oder `null` (immer nur EIN Fenster).
- **Frequenz-Cap §6:** Pause zwischen Werbe-Fenstern (`PROMO_PAUSE_MS` ~5 Min **oder**
  `PROMO_PAUSE_CLICKS` ~10 Klicks), `MAX_PROMOS_PER_VISIT` (~3), **abwechselnd**
  Konto ↔ Home-Screen (`PROMO_CATEGORY`), Quiz-Hilfe zählt **nicht** als Werbung.
- **Verhaltens-Trigger:** `verbCount>=5 → P1`, `quizRounds>=12 → P2`,
  `exitIntent|nearTrialEnd → P3` (Letzte Chance, auch bei vollem Cap),
  `isReturnVisit → P8`, `lockedClick → P7`, `trialEndedUnseen → T_End | T_End_Anon`,
  `successMoment (anonym) → PUSH`.
- **Free-Rotation §9:** nur `plan==="free"`, `max 1/Sitzung` (`freeShownThisSession`),
  „nicht jede Sitzung" (`freeSessionEligible`, vom Aufrufer gewürfelt), nie zweimal
  hintereinander dasselbe, **Re-Offer (FR4/FR5) seltener** (`nextFreePopup`).
- Reine State-Patches für die UI: `notePromoShown`, `noteShown`, `noteFreeShown`, `noteClick`.
- Tests: `scripts/lib/popup-engine.test.mjs` (`node --test`, 21 grün).

### Erwarteter `state` (Auszug)
`onboardingDone, plan ('anonym'|'free'|'premium'), hasAccount, trialActive,
trialEndedUnseen, verbCount, quizRounds, isReturnVisit, hasProgress, exitIntent,
nearTrialEnd, lockedClick, successMoment, pushAsked, accountDeclined,
promosShownThisVisit, lastPromoAt, clicksSinceLastPromo, shownThisVisit[],
lastPromoCategory, now, freeShownThisSession, freeSessionEligible, freeShownIds[]`.

## 3. Feldmodell (Spec §13)

`supabase/migrations/20260622090000_onboarding_fields.sql` ergänzt `public.profiles`
(idempotent, **noch nicht angewendet**): `plan, onboarding_done, ziel_lang, niveau,
trial_start, feedback_given, welcome_code, code_expires_at (= premium_until),
review_prompt_shown, home_screen_prompt_state, free_quiz_rounds_today,
free_quiz_rounds_date`. Vorhanden: `premium_until` (EINE Uhr, §3), `native_lang`
(= Muttersprache), `created_at` (= account_created_at), `is_premium`.
Anonyme ohne Konto: Zustand am **Geräte-Token** (localStorage), Migration anonym→Konto.

---

## 4. Status — umgesetzt vs. offen

**✅ In diesem PR (Teil 1 — Fundament):**
- Alle Pop-up- + Mail-**Texte** (DE zeichengenau; EN/ES/FR/NL als TODO-Kopien).
- **Pop-up-Entscheidungs-Engine** inkl. Frequenz-Cap + Free-Rotation, unit-getestet.
- **Feldmodell**-Migration (SQL) + diese Doku.

**⏳ Offen (Folge-PRs):**
- **Teil 2 — UI-Verdrahtung:** Pop-up-Komponenten (nach `popup-system.md`) + zentraler
  `PopupHost` in `index.html`, der `selectPopup()` nutzt; Live-Hooks an die echten
  Ereignisse (verb_count, quiz_rounds, exit_intent, return_visit, Klick 🔒, Trial-Ende,
  Erfolgsmoment). Lokaler Geräte-Token-State.
- **Teil 3 — Mail-Versand:** Trigger über die bestehende Resend-Integration an
  Zeitstempel aus `premium_until` (Willkommen A/B bei Signup, Code nach Feedback /
  Fallback in „Letzter-Tag", Erinnerung −24 h, Letzter Tag −~3 h, M_Login bei Login,
  A1–A6 Abo-Pflege). HTML aus den Mail-Texten + CI-Shell der bestehenden
  `send-email-hook`/`emails/`-Pipeline; in JEDER Mail das **Enddatum** zeigen.
- **Übersetzungen** EN/ES/FR/NL (Spec §16.8) — bewusst Janine/Übersetzung.
- **Feldmodell-Migration anwenden** (Ops/MCP).

## 5. Abnahme-Bezug (Spec §15)
- EINE Uhr (`premium_until`); Mails nennen das Enddatum (`{enddate}`), nie „48/72 h".
- Willkommen **A** (Sofort-Signup, M1) vs. **B** (nach anonym, M2) — Auswahl im Versand (Teil 3).
- €5-Code-Mail/Pop-up **nur nach Feedback** (P5→P5b/M3); Code WILLKOMMEN, 24,99 €,
  gilt bis `premium_until`.
- **Keine** Belohnung an Store-Bewertung (nur nativer Prompt, ohne Reward).
- Jedes Pop-up wegklickbar; Frequenz-Cap greift (Engine + Tests).
