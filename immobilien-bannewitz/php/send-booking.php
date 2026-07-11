<?php
/**
 * Terminanfrage-Handler für Kontakt-1 / Kontakt-2 (immobilien-bannewitz.de)
 * Empfängt die Antworten aus dem mehrstufigen Formular per POST (JSON) und
 * verschickt eine E-Mail an die Maklerin. Läuft mit PHP mail() auf All-Inkl-
 * Standardhosting, ohne zusätzliche Zugangsdaten.
 */

declare(strict_types=1);

// ---- Konfiguration ---------------------------------------------------
$recipientEmail = 'info@immobilien-bannewitz.de';
$siteName       = 'immobilien-bannewitz.de';
// Erlaubte Ursprünge für CORS (nur relevant, falls das Formular je von einer
// anderen Domain als All-Inkl aus angesprochen wird).
$allowedOrigins = [
    'https://www.immobilien-bannewitz.de',
    'https://immobilien-bannewitz.de',
];

// ---- Hilfsfunktionen ---------------------------------------------------
function respond(int $status, array $payload): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function cleanField(string $value, int $maxLength = 300): string {
    $value = trim($value);
    $value = str_replace(["\r", "\n"], ' ', $value); // Header-Injection verhindern
    if (function_exists('mb_substr')) {
        $value = mb_substr($value, 0, $maxLength);
    } else {
        $value = substr($value, 0, $maxLength);
    }
    return $value;
}

// ---- CORS / Methode ---------------------------------------------------
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

// ---- Eingabe lesen (JSON oder klassisches Formular) --------------------
$raw = file_get_contents('php://input');
$data = json_decode((string) $raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

// ---- Spam-Schutz: Honeypot-Feld muss leer sein --------------------------
if (!empty($data['website'] ?? '')) {
    // Bot hat das versteckte Feld ausgefüllt – so tun, als wäre alles ok.
    respond(200, ['ok' => true]);
}

// ---- Pflichtfelder prüfen -----------------------------------------------
$name    = cleanField((string) ($data['name'] ?? ''), 120);
$contact = cleanField((string) ($data['contact'] ?? ''), 160);

if ($name === '' || $contact === '') {
    respond(422, ['ok' => false, 'error' => 'missing_required_fields']);
}

// ---- Restliche Angaben aus dem Quiz-Flow --------------------------------
$fields = [
    'art'     => 'Immobilienart',
    'ort'     => 'Ort',
    'flaeche' => 'Wohn-/Grundfläche',
    'zustand' => 'Zustand',
    'nutzung' => 'Nutzung',
    'zeit'    => 'Verkaufszeitpunkt',
    'day'     => 'Wunschtag',
    'time'    => 'Wunschuhrzeit',
];

$lines = [];
foreach ($fields as $key => $label) {
    $val = cleanField((string) ($data[$key] ?? ''), 200);
    if ($val !== '') {
        $lines[] = $label . ': ' . $val;
    }
}

$formSource = cleanField((string) ($data['source'] ?? 'Kontaktformular'), 60);

// ---- E-Mail zusammenstellen ---------------------------------------------
$subject = 'Neue Terminanfrage über ' . $siteName;
$bodyLines = array_merge(
    ["Neue Terminanfrage über {$formSource} auf {$siteName}:", ''],
    $lines,
    ['', 'Name: ' . $name, 'Telefon/E-Mail: ' . $contact]
);
$body = implode("\n", $bodyLines);

$fromAddress = 'noreply@' . preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'immobilien-bannewitz.de');
$headers = [
    'From: ' . $siteName . ' <' . $fromAddress . '>',
    'Reply-To: ' . $recipientEmail,
    'Content-Type: text/plain; charset=UTF-8',
];

$mailSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$sent = @mail($recipientEmail, $mailSubject, $body, implode("\r\n", $headers));

if (!$sent) {
    respond(500, ['ok' => false, 'error' => 'mail_failed']);
}

respond(200, ['ok' => true]);
