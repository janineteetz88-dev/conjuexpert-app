# request-school-callback

Öffentliches Rückruf-Formular für Sprachschulen auf `/landing/sprachschulen/`.
Nach dem Vorbild von immobilien-bannewitz.de bewusst ohne festen Kalender-Slot:
die Schule wählt nur einen Wunschtag (Dienstag oder Donnerstag), wir rufen
zwischen 11:00 und 12:30 Uhr zurück und bestätigen den genauen Zeitpunkt
manuell. Das erspart jede Slot-Kollisions-Logik — es gibt keinen "belegten"
Termin, den zwei Schulen gleichzeitig buchen könnten.

## Ablauf
1. Formular sendet `POST` mit Name/Schule, E-Mail, optional Telefon, und dem
   gewählten Wunschtag.
2. Funktion validiert die Pflichtfelder, schreibt die Anfrage in
   `school_callback_requests` und schickt eine Benachrichtigungsmail über
   Resend an `kontakt@tb-kreiser.de` und `hello@conjuexpert.app`.
3. Rückruf und Terminbestätigung laufen danach manuell (Telefon/Mail) — kein
   automatischer Bestätigungsversand an die Schule.

## Deploy
```bash
supabase db push                                        # Migration 20260828_school_callback_requests.sql
supabase functions deploy request-school-callback --no-verify-jwt
# RESEND_API_KEY / EMAIL_FROM sind bereits gesetzt (send-email-hook nutzt sie).
```

## Anfragen einsehen
```sql
select name, email, phone, preferred_day, created_at
from school_callback_requests
order by created_at desc;
```
