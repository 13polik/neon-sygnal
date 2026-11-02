"""Generuje muzykę i efekty dźwiękowe do assets/audio/*.wav.

Wszystko jest syntezowane kodem. Pętle muzyczne są liczone cyklicznie
(filtry i pogłos przez FFT), więc zapętlają się bez przeskoku.
Uruchom: python scripts/gen_audio.py  (wymaga: pip install numpy)
"""

import os
import wave

import numpy as np

SR = 22050
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'assets', 'audio')
rng = np.random.default_rng(7)


def hz(note):
    """Nuta MIDI na częstotliwość."""
    return 440.0 * 2 ** ((note - 69) / 12)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def saw(f, t):
    return 2 * ((f * t) % 1) - 1


def tri(f, t):
    return 2 * np.abs(2 * ((f * t) % 1) - 1) - 1


def env(n, a, r, sustain=1.0):
    e = np.ones(n) * sustain
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, sustain, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def lowpass(x, cutoff, q=0.0):
    """Cykliczny filtr dolnoprzepustowy w dziedzinie częstotliwości."""
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    resp = 1 / np.sqrt(1 + (f / cutoff) ** 4)
    if q:
        resp *= 1 + q * np.exp(-((f - cutoff) / (cutoff * 0.15)) ** 2)
    return np.fft.irfft(spec * resp, len(x))


def bandpass(x, lo, hi):
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    spec[(f < lo) | (f > hi)] *= 0.05
    return np.fft.irfft(spec, len(x))


def reverb(x, sec=2.5, mix=0.35):
    """Cykliczny pogłos: splot z zanikającym szumem (ogon zawija się na początek pętli)."""
    n = len(x)
    ir = np.zeros(n)
    m = int(sec * SR)
    ir[:m] = rng.normal(0, 1, m) * np.exp(-np.linspace(0, 6, m))
    ir = lowpass(ir, 3500)
    ir /= np.sqrt(np.sum(ir ** 2))
    wet = np.fft.irfft(np.fft.rfft(x) * np.fft.rfft(ir), n)
    return x * (1 - mix) + wet * mix * 3


def place(buf, sig, start):
    """Wkleja dźwięk do pętli od sekundy start, zawijając koniec na początek."""
    i = int(start * SR) % len(buf)
    idx = (np.arange(len(sig)) + i) % len(buf)
    np.add.at(buf, idx, sig)


def save(name, x, peak=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    data = (x * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print('ok', name, f'{len(x) / SR:.1f}s')


def pad_note(note, dur, a=1.5, r=2.0, cutoff=1400):
    t = t_axis(dur)
    f = hz(note)
    x = sum(saw(f * d, t + ph) for d, ph in [(1, 0), (1.004, 0.3), (0.996, 0.7)]) / 3
    return lowpass(x, cutoff) * env(len(t), a, r)


def pluck(note, dur=0.4, shape=tri, decay=8):
    t = t_axis(dur)
    return shape(hz(note), t) * np.exp(-t * decay)


def kick(dur=0.35):
    t = t_axis(dur)
    f = 50 + 90 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def hat(dur=0.06):
    t = t_axis(dur)
    return bandpass(rng.normal(0, 1, len(t)), 6000, 10000) * np.exp(-t * 60)


def rain_bed(sec, level=0.12):
    n = rng.normal(0, 1, int(sec * SR))
    n = bandpass(n, 1500, 8000)
    drops = np.zeros(len(n))
    for _ in range(int(sec * 25)):
        i = rng.integers(0, len(n) - 400)
        drops[i:i + 400] += rng.normal(0, 1, 400) * np.exp(-np.arange(400) / 40) * rng.uniform(0.2, 1)
    return (n * 0.6 + bandpass(drops, 2000, 9000) * 0.4) * level / np.std(n)


def music_ambient():
    """Spokojna pętla: Am - F - C - G, 80 BPM, deszcz w tle."""
    bar = 60 / 80 * 4
    length = bar * 8
    buf = np.zeros(int(length * SR))
    chords = [(57, 60, 64, 69), (53, 57, 60, 65), (48, 55, 60, 64), (55, 59, 62, 67)]
    pads = np.zeros_like(buf)
    for i, ch in enumerate(chords):
        for n in ch:
            place(pads, pad_note(n, bar * 2 + 1.5), i * bar * 2)
    bass = np.zeros_like(buf)
    for i, ch in enumerate(chords):
        for b in range(8):
            if b % 2 == 0 or b == 5:
                place(bass, lowpass(saw(hz(ch[0] - 24), t_axis(0.5)), 300) * np.exp(-t_axis(0.5) * 5), i * bar * 2 + b * bar / 4)
    arp = np.zeros_like(buf)
    step = bar / 8
    for i, ch in enumerate(chords):
        seq = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12, ch[1] + 12, ch[3] + 12, ch[2] + 24]
        for k in range(16):
            if rng.random() < 0.8:
                place(arp, pluck(seq[k % 8], 0.5) * 0.6, i * bar * 2 + k * step)
    echo = np.roll(arp, int(step * 3 * SR)) * 0.4
    mix = reverb(pads * 0.35 + arp * 0.18 + echo * 0.18, 3.0, 0.45) + bass * 0.35 + rain_bed(length, 0.05)
    save('music_ambient', mix, 0.6)


def music_tension():
    """Napięta pętla do minigier: Dm, 120 BPM, puls basu i hi-haty."""
    beat = 60 / 120
    length = beat * 32
    buf = np.zeros(int(length * SR))
    roots = [50, 50, 46, 48]
    for bi, root in enumerate(roots):
        for s in range(16):
            tpos = bi * beat * 8 + s * beat / 2
            place(buf, lowpass(saw(hz(root - 12), t_axis(0.22)), 600, 1.5) * np.exp(-t_axis(0.22) * 10) * 0.5, tpos)
        for b in range(8):
            place(buf, kick() * (0.9 if b % 2 == 0 else 0.0), bi * beat * 8 + b * beat)
        for s in range(16):
            place(buf, hat() * (0.25 if s % 2 else 0.12), bi * beat * 8 + s * beat / 2)
    lead = np.zeros_like(buf)
    motif = [62, 65, 69, 67, 65, 62, 60, 62]
    for k, n in enumerate(motif * 2):
        place(lead, pluck(n + 12, 0.35, saw, 10) * 0.3, k * beat * 2 + beat)
    pads = np.zeros_like(buf)
    for bi, root in enumerate(roots):
        for n in (root, root + 3, root + 7):
            place(pads, pad_note(n + 12, beat * 8 + 0.5, 0.3, 0.5, 900), bi * beat * 8)
    mix = buf + reverb(lowpass(lead, 2500) + pads * 0.25, 1.5, 0.35)
    save('music_tension', mix, 0.6)


def sfx():
    t = t_axis
    save('sfx_tap', lowpass(tri(1200, t(0.05)) * np.exp(-t(0.05) * 90), 4000), 0.5)
    ok = np.zeros(int(0.6 * SR))
    for i, n in enumerate((72, 76, 79, 84)):
        place(ok, pluck(n, 0.4, tri, 7), i * 0.07)
    save('sfx_ok', reverb(np.concatenate([ok, np.zeros(SR // 2)]), 0.8, 0.3), 0.7)
    bad = saw(110, t(0.35)) * 0.5 + saw(116, t(0.35)) * 0.5
    save('sfx_bad', lowpass(bad, 900) * env(len(bad), 0.005, 0.15), 0.7)
    coin = np.concatenate([pluck(88, 0.08, tri, 20), pluck(93, 0.3, tri, 12)])
    save('sfx_pickup', coin, 0.55)
    shard = np.zeros(int(1.4 * SR))
    for i, n in enumerate((76, 81, 83, 88, 91, 95)):
        place(shard, pluck(n, 0.8, tri, 4) * 0.5, i * 0.09)
    save('sfx_shard', reverb(np.concatenate([shard, np.zeros(SR)]), 2.0, 0.5), 0.7)
    tt = t(0.9)
    alarm = np.sign(np.sin(2 * np.pi * (700 + 300 * (np.sin(2 * np.pi * 4 * tt) > 0)) * tt))
    save('sfx_alarm', lowpass(alarm, 2500) * env(len(tt), 0.01, 0.2), 0.55)
    tt = t(2.2)
    boom = np.sin(2 * np.pi * np.cumsum(40 + 60 * np.exp(-tt * 6)) / SR) * np.exp(-tt * 2)
    swell = lowpass(rng.normal(0, 1, len(tt)), 1200) * np.exp(-((tt - 0.2) / 0.5) ** 2) * 0.3
    save('sfx_chapter', reverb(boom + swell, 2.0, 0.4), 0.8)
    tt = t(0.25)
    hit = lowpass(rng.normal(0, 1, len(tt)), 1500) * np.exp(-tt * 25) + kick(0.25) * 0.8
    save('sfx_hit', hit, 0.8)
    tt = t(0.2)
    block = bandpass(rng.normal(0, 1, len(tt)), 2500, 7000) * np.exp(-tt * 30) + tri(1800, tt) * np.exp(-tt * 35) * 0.6
    save('sfx_block', block, 0.7)
    ending = np.zeros(int(4 * SR))
    for i, n in enumerate((57, 60, 64, 69, 72)):
        place(ending, pad_note(n, 3.5, 0.6, 2.0, 2000) * 0.4, i * 0.12)
    save('sfx_ending', reverb(ending, 2.5, 0.5), 0.7)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    sfx()
    music_ambient()
    music_tension()
