#!/usr/bin/env python3
"""make-bed.py <out.wav> [seconds] [style]
Erzeugt einen eigenen, lizenzfreien Musik-Bed — komplett selbst synthetisiert
(reine Mathematik, keine Samples). Styles: summer (Summer-House/Chill mit echter
Melodie + 8-Takt-Verlauf, Default), calm (Lo-Fi), bright (Pop), pulse (minimal).
Nur Python-Standardlib.
"""
import sys, math, wave, struct, random

SR = 44100
out = sys.argv[1] if len(sys.argv) > 1 else 'bed.wav'
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 15.0
STYLE = sys.argv[3] if len(sys.argv) > 3 else 'summer'
N = int(SR * DUR)
random.seed(7)

def env_ar(i, seg, atk, rel):
    if i < atk: return i / atk
    if i > seg - rel: return max(0.0, (seg - i) / rel)
    return 1.0

LPA = 0.5
LP_BUILD = False

# ---- SUMMER HOUSE / CHILL (with topline melody + 8-bar journey) ----
if STYLE == 'summer':
    BPM = 122.0
    beat = 60.0 / BPM
    bar = 4 * beat
    # 8-bar journey resolving to C: Fmaj7 G7 Em7 Am7 | Dm7 G7 Cmaj7 Cmaj7
    CH = [
        ([174.61,220.00,261.63,329.63], 87.31),   # Fmaj7 F2
        ([196.00,246.94,293.66,349.23], 98.00),    # G7   G2
        ([164.81,196.00,246.94,329.63], 82.41),    # Em7  E2
        ([220.00,261.63,329.63,392.00], 110.00),   # Am7  A2
        ([146.83,220.00,261.63,349.23], 73.42),    # Dm7  D2
        ([196.00,246.94,293.66,349.23], 98.00),    # G7   G2
        ([261.63,329.63,392.00,493.88], 65.41),    # Cmaj7 C2
        ([261.63,329.63,392.00,493.88], 65.41),    # Cmaj7 C2
    ]
    # topline melody per bar: (beat_pos, freq, dur_beats)  — moving, spacious
    C5,D5,E5,F5,G5,A5,C6 = 523.25,587.33,659.25,698.46,783.99,880.00,1046.50
    MEL = {
        0: [(0,E5,1),(1.5,G5,0.5),(2,A5,1),(3.5,G5,0.5)],
        1: [(0,A5,1),(1,G5,1),(2,E5,2)],
        2: [(0,D5,1),(1.5,E5,0.5),(2,G5,1.5)],
        3: [(0,E5,1),(1,D5,1),(2,C5,2)],
        4: [(0,E5,1),(1.5,G5,0.5),(2,A5,1),(3,C6,1)],
        5: [(0,A5,1),(1,G5,1),(2,E5,2)],
        6: [(0,F5,1),(1.5,E5,0.5),(2,D5,1.5)],
        7: [(0,C5,2)],
    }
    pad=[0.0]*N; bass=[0.0]*N; perc=[0.0]*N; lead=[0.0]*N
    nb = int(DUR / bar) + 1
    def chidx(t): return int(t // bar) % len(CH)

    # pad (soft, backing) — thins out during intro bar 0
    for b in range(nb):
        chord,_ = CH[b % len(CH)]
        s=int(b*bar*SR); e=min(N,int((b+1)*bar*SR)); seg=e-s
        atk=int(0.22*SR); rel=int(0.35*SR); g = 0.24 if b == 0 else 0.32
        for i in range(seg):
            t=i/SR; ev=env_ar(i,seg,atk,rel)*g; acc=0.0
            for f in chord:
                ph=2*math.pi*f*t; acc+=math.sin(ph)+0.2*math.sin(2*ph)
            pad[s+i]+=acc/(len(chord)*1.2)*ev

    # bass (off-beat bounce, fat + sub) + pluck — start at bar 1 (intro = no drums)
    nbeat=int(DUR/beat)+1
    for k in range(nbeat):
        t0=k*beat
        if t0 < bar: continue                       # skip intro bar
        _,root=CH[chidx(t0)]
        b0=int((t0+beat/2)*SR); blen=int(beat*0.5*SR)
        for i in range(blen):
            if b0+i>=N: break
            e=math.exp(-i/(0.14*SR)); ph=2*math.pi*root*(i/SR)
            bass[b0+i]+=0.78*e*(math.sin(ph)+0.25*math.sin(2*ph)+0.4*math.sin(ph/2))
        chord,_=CH[chidx(t0)]; note=chord[(k*2)%len(chord)]*2
        p0=int((t0+beat/2)*SR); plen=int(0.2*SR)
        for i in range(plen):
            if p0+i>=N: break
            e=math.exp(-i/(0.05*SR)); perc[p0+i]+=0.11*e*math.sin(2*math.pi*note*(i/SR))

    # drums: kick (from bar1) + clap 2&4 + off-beat hats (hats from bar0 for a lift)
    kb=0
    while kb*beat < DUR:
        t0=kb*beat; k0=int(t0*SR)
        if t0 >= bar:                               # kick + clap after intro
            for i in range(int(0.18*SR)):
                if k0+i>=N: break
                e=math.exp(-i/(0.045*SR)); f=118*math.exp(-i/(0.022*SR))+50
                perc[k0+i]+=0.88*e*math.sin(2*math.pi*f*(i/SR))
            if kb%4 in (1,3):
                prev=0.0
                for i in range(int(0.10*SR)):
                    if k0+i>=N: break
                    e=math.exp(-i/(0.032*SR)); n=random.uniform(-1,1); prev=n-0.3*prev
                    perc[k0+i]+=0.17*e*prev
        h0=int((t0+beat/2)*SR); prev=0.0
        for i in range(int(0.055*SR)):
            if h0+i>=N: break
            e=math.exp(-i/(0.016*SR)); n=random.uniform(-1,1); prev=n-0.6*prev
            perc[h0+i]+=0.12*e*prev
        kb+=1

    # topline melody (bright lead, vibrato) — enters at bar 1
    for b in range(nb):
        if b < 1: continue
        for (bp,freq,dl) in MEL.get(b % len(CH), []):
            t0=(b*4+bp)*beat; ln=int(dl*beat*SR); s0=int(t0*SR)
            atk=int(0.012*SR); rel=int(0.09*SR)
            for i in range(ln):
                if s0+i>=N: break
                t=i/SR; ev=env_ar(i,ln,atk,rel)
                vib=1+0.006*math.sin(2*math.pi*5*t)
                ph=2*math.pi*freq*vib*t
                lead[s0+i]+=0.2*ev*(math.sin(ph)+0.25*math.sin(2*ph)+0.1*math.sin(3*ph))

    # sidechain pump on pad+bass
    duck=[1.0]*N; tk=bar
    while tk < DUR:
        k0=int(tk*SR)
        for i in range(int(beat*SR)):
            if k0+i>=N: break
            duck[k0+i]=min(duck[k0+i],0.6+0.4*(i/(beat*SR)))
        tk+=beat
    buf=[0.0]*N
    for i in range(N):
        buf[i]=(pad[i]+bass[i])*duck[i]+perc[i]+lead[i]
    LPA=0.55; LP_BUILD=True

else:
    # ---- other styles (lo-fi / pop / minimal) ----
    PROG = {
        'calm':  [[261.63,329.63,392.00,493.88],[220.00,261.63,329.63,392.00],[174.61,220.00,261.63,329.63],[196.00,246.94,293.66,349.23]],
        'bright':[[261.63,329.63,392.00],[196.00,246.94,392.00],[220.00,261.63,329.63],[174.61,220.00,349.23]],
        'pulse': [[220.00,329.63,440.00],[246.94,349.23,493.88]],
    }
    STY = {
        'calm':  dict(bpm=78,  harm2=0.28, lpa=0.22, kick=0.55, padgain=0.50),
        'bright':dict(bpm=98,  harm2=0.5,  lpa=0.34, kick=0.60, padgain=0.42),
        'pulse': dict(bpm=104, harm2=0.18, lpa=0.30, kick=0.68, padgain=0.34),
    }.get(STYLE, dict(bpm=78, harm2=0.28, lpa=0.22, kick=0.55, padgain=0.50))
    CHORDS = PROG.get(STYLE, PROG['calm'])
    buf=[0.0]*N; CHORD_LEN=DUR/8.0
    for slot in range(8):
        chord=CHORDS[slot%len(CHORDS)]
        s=int(slot*CHORD_LEN*SR); e=min(N,int((slot+1)*CHORD_LEN*SR)); seg=e-s
        atk=int(0.18*SR); rel=int(0.5*SR)
        for i in range(seg):
            t=i/SR; ev=env_ar(i,seg,atk,rel)*0.9; acc=0.0
            for f in chord:
                ph=2*math.pi*f*t; acc+=math.sin(ph)+STY['harm2']*math.sin(2*ph)
            buf[s+i]+=acc/(len(chord)*(1+STY['harm2']))*STY['padgain']*ev
    beat=60.0/STY['bpm']; tk=0.0
    while tk < DUR:
        k0=int(tk*SR)
        for i in range(int(0.16*SR)):
            if k0+i>=N: break
            e=math.exp(-i/(0.045*SR)); f=95*math.exp(-i/(0.03*SR))+45
            buf[k0+i]+=STY['kick']*e*math.sin(2*math.pi*f*(i/SR))
        s0=int((tk+beat/2)*SR); prev=0.0
        for i in range(int(0.06*SR)):
            if s0+i>=N: break
            e=math.exp(-i/(0.02*SR)); n=random.uniform(-1,1); prev=prev+0.5*(n-prev)
            buf[s0+i]+=0.06*e*prev
        tk+=beat
    LPA=STY['lpa']

# time-varying low-pass (opens up over the first ~3s for a build) + fades + normalize
build = int(3.0 * SR)
y = 0.0
for i in range(N):
    a = LPA
    if LP_BUILD and i < build:
        a = 0.16 + (LPA - 0.16) * (i / build)
    y = y + a * (buf[i] - y); buf[i] = y
fi=int(0.3*SR); fo=int(0.8*SR)
for i in range(N):
    if i < fi: buf[i]*=i/fi
    if i > N-fo: buf[i]*=max(0.0,(N-i)/fo)
peak=max(1e-6,max(abs(v) for v in buf)); g=0.82/peak
with wave.open(out,'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<h', int(max(-1,min(1,v*g))*32767)) for v in buf))
print('OK', out, f'({DUR}s · {STYLE})')
