#!/usr/bin/env python3
"""make-bed.py <out.wav> [seconds]
Erzeugt einen eigenen, ruhigen Lo-Fi-Musik-Bed (warme Rhodes-artige Akkorde +
weicher Kick + dezenter Shaker). Komplett selbst synthetisiert -> gehoert uns,
also lizenzfrei. Nur Python-Standardlib.
"""
import sys, math, wave, struct, random

SR = 44100
out = sys.argv[1] if len(sys.argv) > 1 else 'bed.wav'
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 15.0
N = int(SR * DUR)
random.seed(7)

# --- warm chord progression (Cmaj7 · Am7 · Fmaj7 · G7), looped ---
CHORDS = [
    [261.63, 329.63, 392.00, 493.88],   # Cmaj7
    [220.00, 261.63, 329.63, 392.00],   # Am7
    [174.61, 220.00, 261.63, 329.63],   # Fmaj7
    [196.00, 246.94, 293.66, 349.23],   # G7
]
CHORD_LEN = DUR / 8.0                    # 8 chord slots over the clip
buf = [0.0] * N

# pad: fundamental + soft 2nd harmonic, gentle attack/release per chord
for slot in range(8):
    chord = CHORDS[slot % len(CHORDS)]
    start = int(slot * CHORD_LEN * SR)
    end = min(N, int((slot + 1) * CHORD_LEN * SR))
    seg = end - start
    atk = int(0.18 * SR); rel = int(0.5 * SR)
    for i in range(seg):
        t = i / SR
        # envelope
        if i < atk: env = i / atk
        elif i > seg - rel: env = max(0.0, (seg - i) / rel)
        else: env = 1.0
        env *= 0.9
        s = 0.0
        for f in chord:
            ph = 2 * math.pi * f * t
            s += math.sin(ph) + 0.28 * math.sin(2 * ph)
        buf[start + i] += (s / (len(chord) * 1.28)) * 0.5 * env

# soft kick every beat (~78 BPM) and a quiet shaker on the offbeat
beat = 60.0 / 78.0
tk = 0.0
while tk < DUR:
    k0 = int(tk * SR)
    klen = int(0.16 * SR)
    for i in range(klen):
        if k0 + i >= N: break
        e = math.exp(-i / (0.045 * SR))
        f = 95 * math.exp(-i / (0.03 * SR)) + 45   # pitch drop
        buf[k0 + i] += 0.55 * e * math.sin(2 * math.pi * f * (i / SR))
    # offbeat shaker (filtered noise)
    s0 = int((tk + beat / 2) * SR)
    slen = int(0.06 * SR)
    prev = 0.0
    for i in range(slen):
        if s0 + i >= N: break
        e = math.exp(-i / (0.02 * SR))
        n = random.uniform(-1, 1)
        prev = prev + 0.5 * (n - prev)             # soften
        buf[s0 + i] += 0.06 * e * prev
    tk += beat

# one-pole low-pass to warm it up, then fade in/out + normalize
a = 0.22
y = 0.0
for i in range(N):
    y = y + a * (buf[i] - y)
    buf[i] = y
fi = int(0.4 * SR); fo = int(0.8 * SR)
for i in range(N):
    if i < fi: buf[i] *= i / fi
    if i > N - fo: buf[i] *= max(0.0, (N - i) / fo)
peak = max(1e-6, max(abs(v) for v in buf))
g = 0.82 / peak
with wave.open(out, 'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, v * g)) * 32767)) for v in buf))
print('OK', out, f'({DUR}s)')
