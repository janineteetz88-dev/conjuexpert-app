# book-school-call

Öffentliches Buchungstool für 20-Minuten-Kennenlerngespräche mit Sprachschulen
(Di–Do, 11:00/11:20/11:40/12:00), verlinkt vom Formular auf
`/landing/sprachschulen/`. Kein Google Calendar — feste Slot-Liste plus
Mail-Benachrichtigung an `kontakt@tb-kreiser.de` und `hello@conjuexpert.app`.

## Ablauf
1. Formular sendet `POST` mit Schule, Ansprechpartner:in, E-Mail, optional
   Telefon/Modell-Interesse/Nachricht, plus gewähltem Datum + Uhrzeit.
2. Funktion validiert Slot (Di–Do, nur die vier festen Uhrzeiten, nicht in der
   Vergangenheit), schreibt die Buchung in `school_call_bookings` und schickt
   eine Benachrichtigungsmail über Resend.
3. Ein `unique (slot_date, slot_time)`-Constraint verhindert Doppelbuchungen —
   bei Konflikt kommt `409` mit einer Nutzer-Fehlermeldung zurück.

## Deploy
```bash
supabase db push                              # Migration 20260828_school_call_bookings.sql
supabase functions deploy book-school-call --no-verify-jwt
# RESEND_API_KEY / EMAIL_FROM sind bereits gesetzt (send-email-hook nutzt sie).
```

## Gebuchte Termine einsehen
Kein eigenes Dashboard — einfach die Tabelle abfragen:
```sql
select school_name, contact_name, email, phone, slot_date, slot_time, interested_model, message, created_at
from school_call_bookings
order by slot_date, slot_time;
```

## Bewusst nicht eingebaut
- Keine Bestätigungsmail an die Schule selbst — nur die interne Benachrichtigung.
  Leicht ergänzbar, falls gewünscht.
- Keine Möglichkeit, eine Buchung wieder zu stornieren/verschieben — bei so
  wenigen erwarteten Buchungen reicht dafür vorerst eine kurze Mail hin und her.
