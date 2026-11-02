"""Montuje realistyczny film intro (assets/video/intro.mp4) z kadrów AI i ożywia je ruchem.

Kadry: ai-raw/in_*.jpg (scripts/gen_ai_art.py, pionowe 720x1280). Każde ujęcie dostaje jazdę
kamery, drgania jak z ręki, kilka warstw deszczu, mgłę, migotanie neonów, poświatę i ziarno,
a wybrane także błyskawice, reflektor drona, puls chipu albo zakłócenia. Dźwięk jest syntezowany.
Uruchom: python scripts/gen_intro.py  (wymaga: pip install pillow numpy imageio-ffmpeg)
"""

import math
import os
import subprocess
import wave
from functools import lru_cache
from multiprocessing import Pool

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
RAW = os.path.join(ROOT, 'ai-raw')
OUT = os.path.join(ROOT, 'assets', 'video')
FONT = os.path.join(ROOT, 'node_modules', '@expo-google-fonts', 'chakra-petch', '700Bold', 'ChakraPetch_700Bold.ttf')
W, H, FPS = 720, 1280, 30
DUR = 38.0
SR = 32000
PLATE = 1.3  # zapas obrazu na jazdę kamery

PINK = np.array([255, 46, 136], np.float32)
CYAN = np.array([46, 242, 255], np.float32)
RED = np.array([255, 50, 60], np.float32)
WHITE = np.array([225, 230, 248], np.float32)

# Ujęcia: (początek, koniec, kadr, ruch kamery)
SHOTS = [
    (0.0, 5.2, 'in_storm', dict(z0=1.0, z1=1.12, x0=0.5, x1=0.5, y0=0.55, y1=0.45)),
    (5.0, 10.7, 'in_spires', dict(z0=1.05, z1=1.18, x0=0.5, x1=0.52, y0=0.32, y1=0.62)),
    (10.5, 16.2, 'in_aerial', dict(z0=1.0, z1=1.45, x0=0.5, x1=0.5, y0=0.5, y1=0.55, rot=4)),
    (16.0, 22.7, 'in_street', dict(z0=1.0, z1=1.22, x0=0.5, x1=0.5, y0=0.52, y1=0.5, shake=1.0)),
    (22.5, 27.7, 'in_drone', dict(z0=1.12, z1=1.05, x0=0.42, x1=0.58, y0=0.45, y1=0.45, shake=1.4)),
    (27.5, 31.7, 'in_chip', dict(z0=1.0, z1=1.3, x0=0.5, x1=0.5, y0=0.55, y1=0.55)),
    (31.5, 34.2, 'in_mira', dict(z0=1.1, z1=1.2, x0=0.5, x1=0.5, y0=0.45, y1=0.42)),
    (34.0, 38.0, 'in_title', dict(z0=1.0, z1=1.08, x0=0.5, x1=0.5, y0=0.5, y1=0.5)),
]
XF = 0.25  # długość przenikania między ujęciami (s)


def smooth(t):
    t = min(1.0, max(0.0, t))
    return t * t * (3 - 2 * t)


def seg(t, a, b):
    return smooth((t - a) / (b - a))


@lru_cache(maxsize=None)
def font(size):
    return ImageFont.truetype(FONT, size)


@lru_cache(maxsize=256)
def text_mask(lines, size, y, chars):
    lay = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(lay)
    for i, line in enumerate(lines):
        shown = line if chars is None else line[: max(0, chars - sum(len(l) for l in lines[:i]))]
        d.text((W / 2, y + i * size * 1.15), shown, font=font(size), fill=255, anchor='mm')
    return np.array(lay).astype(np.float32) / 255


def text_layer(lines, size, color, y, alpha=1.0, chars=None, glitch=0.0):
    if alpha <= 0:
        return np.zeros((H, W, 3), np.float32)
    if chars is not None:
        chars = max(0, min(chars, sum(len(l) for l in lines)))
    out = text_mask(tuple(lines), size, round(y), chars)[..., None] * color * alpha
    if glitch:
        sh = int(glitch * 14)
        out[..., 0] = np.roll(out[..., 0], sh, axis=1)
        out[..., 2] = np.roll(out[..., 2], -sh, axis=1)
    return out


def blur_small(arr, radius):
    img = Image.fromarray(arr.clip(0, 255).astype(np.uint8))
    small = img.resize((W // 4, H // 4), Image.BILINEAR).filter(ImageFilter.GaussianBlur(radius))
    return np.array(small.resize((W, H), Image.BILINEAR)).astype(np.float32)


# --- przygotowanie kadrów ---

def load_plate(name):
    img = Image.open(os.path.join(RAW, name + '.jpg')).convert('RGB')
    w, h = img.size
    img = img.crop((0, 0, w, int(h * 0.93)))  # bez znaku wodnego generatora
    pw, ph = int(W * PLATE), int(H * PLATE)
    scale = max(pw / img.width, ph / img.height)
    img = img.resize((int(img.width * scale) + 1, int(img.height * scale) + 1), Image.LANCZOS)
    left, top = (img.width - pw) // 2, (img.height - ph) // 2
    img = img.crop((left, top, left + pw, top + ph))
    arr = np.array(img).astype(np.float32)
    mx, mn = arr.max(axis=2), arr.min(axis=2)
    sat = (mx - mn) / (mx + 1)
    neon = np.clip((sat - 0.45) * 3, 0, 1) * np.clip((mx - 120) / 100, 0, 1)
    return img, Image.fromarray((neon * 255).astype(np.uint8))


@lru_cache(maxsize=None)
def plate(name):
    return load_plate(name)


rng = np.random.default_rng(2091)
RAIN_FAR = [(rng.uniform(0, W), rng.uniform(0, H), rng.uniform(14, 26), rng.uniform(900, 1300)) for _ in range(380)]
RAIN_NEAR = [(rng.uniform(0, W), rng.uniform(0, H), rng.uniform(40, 80), rng.uniform(1700, 2300)) for _ in range(70)]
GRAIN = [np.random.default_rng(i).normal(0, 5, (H, W, 1)).astype(np.float32) for i in range(6)]


@lru_cache(maxsize=1)
def fog_tex():
    r = np.random.default_rng(7)
    acc = np.zeros((H * 2, W), np.float32)
    for oct_, amp in [(6, 1.0), (12, 0.5), (24, 0.25)]:
        n = r.random((oct_ * 2, oct_)).astype(np.float32)
        acc += np.array(Image.fromarray((n * 255).astype(np.uint8)).resize((W, H * 2), Image.BICUBIC)).astype(np.float32) / 255 * amp
    return np.clip((acc / 1.75 - 0.35) * 1.8, 0, 1)


@lru_cache(maxsize=1)
def vignette():
    y, x = np.ogrid[:H, :W]
    d = np.sqrt(((x - W / 2) / (W / 2)) ** 2 + ((y - H / 2) / (H / 2)) ** 2)
    return (1 - 0.55 * np.clip(d - 0.55, 0, 1) ** 1.4)[..., None].astype(np.float32)


@lru_cache(maxsize=4)
def radial(cx, cy, radius):
    y, x = np.ogrid[:H, :W]
    d = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
    return (np.clip(1 - d / radius, 0, 1) ** 2)[..., None].astype(np.float32)


# --- efekty ---

def camera(img, neon, p, t, cam):
    z = cam['z0'] + (cam['z1'] - cam['z0']) * smooth(p)
    cx = cam['x0'] + (cam['x1'] - cam['x0']) * smooth(p)
    cy = cam['y0'] + (cam['y1'] - cam['y0']) * smooth(p)
    sh = cam.get('shake', 0.4)
    ox = (math.sin(t * 2.3) + 0.5 * math.sin(t * 5.1)) * 4 * sh
    oy = (math.sin(t * 1.9 + 1) + 0.5 * math.sin(t * 4.3)) * 4 * sh
    pw, ph = img.size
    cw, ch = min(W * PLATE / z, pw), min(H * PLATE / z, ph)
    left = min(max(0, cx * pw - cw / 2 + ox), pw - cw)
    top = min(max(0, cy * ph - ch / 2 + oy), ph - ch)
    box = (left, top, left + cw, top + ch)
    frame = img.resize((W, H), Image.BILINEAR, box=box)
    mask = neon.resize((W, H), Image.BILINEAR, box=box)
    rot = cam.get('rot', 0) * smooth(p)
    if rot:
        inner = (W * 0.06, H * 0.06, W * 0.94, H * 0.94)
        frame = frame.rotate(rot, resample=Image.BILINEAR).resize((W, H), Image.BILINEAR, box=inner)
        mask = mask.rotate(rot, resample=Image.BILINEAR).resize((W, H), Image.BILINEAR, box=inner)
    return np.array(frame).astype(np.float32), np.array(mask).astype(np.float32)[..., None] / 255


def neon_flicker(frame, mask, t, seed):
    r = math.sin(t * 13 + seed) * math.sin(t * 7.3 + seed * 2)
    flick = 1.0 if r > -0.85 else 0.35
    bright = 1.0 + 0.25 * math.sin(t * 3 + seed)
    lit = frame * mask
    frame = frame - lit + lit * flick * bright
    return frame + blur_small(lit, 5) * 0.9 * flick


def bloom(frame):
    return frame + blur_small(np.clip(frame - 175, 0, None), 6) * 0.8


def rain(frame, t, strength=1.0):
    img = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(img)
    for layer, a, width in ((RAIN_FAR, 70, 1), (RAIN_NEAR, 110, 2)):
        for x, y, ln, sp in layer:
            yy = (y + t * sp) % (H + 100) - 50
            xx = (x + yy * 0.15) % W
            d.line([(xx, yy), (xx + ln * 0.15, yy + ln)], fill=int(a * strength), width=width)
    r = np.array(img.filter(ImageFilter.GaussianBlur(0.6)), np.float32)[..., None]
    return frame + r * np.array([0.8, 0.9, 1.0], np.float32)


def splashes(frame, t, y_from=0.72):
    img = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(img)
    r = np.random.default_rng(int(t * 12))
    for _ in range(40):
        x = r.uniform(0, W)
        y = r.uniform(H * y_from, H)
        s = r.uniform(3, 10) * (y / H)
        d.ellipse([x - s * 2, y - s * 0.5, x + s * 2, y + s * 0.5], outline=120, width=1)
    return frame + np.array(img, np.float32)[..., None] * 0.6


def fog(frame, t, amount, speed=40):
    if amount <= 0:
        return frame
    off = int(t * speed) % H
    f = fog_tex()[off:off + H][..., None]
    return frame * (1 - f * amount) + np.array([150, 150, 175], np.float32) * f * amount


def glitch(frame, t, amount):
    r = np.random.default_rng(int(t * 30))
    out = frame.copy()
    for _ in range(int(6 * amount)):
        y0 = int(r.uniform(0, H - 40))
        h = int(r.uniform(6, 40))
        out[y0:y0 + h] = np.roll(out[y0:y0 + h], int(r.uniform(-60, 60) * amount), axis=1)
    sh = int(10 * amount)
    out[..., 0] = np.roll(out[..., 0], sh, axis=1)
    out[..., 2] = np.roll(out[..., 2], -sh, axis=1)
    return out


def with_text(frame, light, radius=5, strength=1.6):
    return frame + light + blur_small(light, radius) * strength


# --- ujęcia ---

def render_shot(i, t):
    a, b, name, cam = SHOTS[i]
    p = (t - a) / (b - a)
    img, neon = plate(name)
    frame, mask = camera(img, neon, p, t, cam)
    frame = neon_flicker(frame, mask, t, i)

    if name == 'in_storm':
        frame *= 0.75
        flash = max(0.0, 1 - abs(t - 1.6) * 7) + 0.7 * max(0.0, 1 - abs(t - 3.0) * 9) + 0.4 * max(0.0, 1 - abs(t - 3.25) * 12)
        frame = frame * (1 + flash * 0.5) + flash * np.array([40, 45, 70], np.float32)
        frame = rain(frame, t, 1.0)
        fade = 1 - seg(t, 4.3, 5.0)
        light = text_layer(['NOWA WISŁA'], 64, CYAN, H * 0.42, seg(t, 0.4, 1.0) * fade, chars=int((t - 0.3) * 14))
        light += text_layer(['ROK 2091'], 38, PINK, H * 0.42 + 72, seg(t, 1.3, 1.8) * fade)
        frame = with_text(frame, light)
    elif name == 'in_spires':
        frame = fog(frame, t, 0.18 + 0.5 * seg(t, 9.0, 10.7), 25)
        frame += radial(round(W * 0.7), round(H * 0.35), 520) * np.array([255, 200, 140], np.float32) * 0.35
    elif name == 'in_aerial':
        frame = fog(frame, t, 0.45 * (1 - seg(t, 10.5, 12.5)), 90)
        frame = rain(frame, t, 1.1)
    elif name == 'in_street':
        frame = rain(frame, t, 1.2)
        frame = splashes(frame, t)
        frame = fog(frame, t, 0.08, 20)
    elif name == 'in_drone':
        sweep = math.sin((t - 22.5) * 1.3)
        cx, cy = W * 0.5, H * 0.32
        tx = W * 0.5 + sweep * W * 0.45
        cone = Image.new('L', (W, H), 0)
        ImageDraw.Draw(cone).polygon([(cx - 10, cy), (cx + 10, cy), (tx + 170, H), (tx - 170, H)], fill=70)
        frame += np.array(cone.filter(ImageFilter.GaussianBlur(14)), np.float32)[..., None] / 255 * RED * 1.1
        alarm = max(0.0, 1 - abs(t - 26.9) * 3)
        frame = frame * (1 + alarm * 0.6) + alarm * RED * 0.5
        frame = rain(frame, t, 1.1)
    elif name == 'in_chip':
        pulse = 0.5 + 0.5 * math.sin((t - 27.5) * 7.3)
        frame += radial(W // 2, round(H * 0.55), 380) * PINK * 0.55 * pulse
        frame = rain(frame, t, 0.6)
    elif name == 'in_mira':
        g = 0.4 + 0.6 * (1 if int(t * 11) % 4 == 0 else 0)
        frame = glitch(frame, t, g)
        light = text_layer(['Proszę… nie oddawaj mnie im.'], 34, PINK, H * 0.82, 1.0, chars=int((t - 31.6) * 18), glitch=g * 0.4)
        light += text_layer(['— Mira'], 26, CYAN, H * 0.82 + 52, seg(t, 33.2, 33.6))
        frame = with_text(frame, light, 5, 1.5)
    elif name == 'in_title':
        frame *= 0.45
        frame = rain(frame, t, 0.8)
        q = t - 34
        on1 = 0 if q < 0.4 else (0.3 if q < 0.55 else (1 if q < 0.7 or q > 0.85 else 0.2))
        on2 = 0 if q < 1.0 else (0.4 if q < 1.15 else 1)
        light = text_layer(['NEON'], 150, PINK, H / 2 - 110, on1, glitch=0.6 if 0.4 < q < 0.6 else 0)
        light += text_layer(['SYGNAŁ'], 120, CYAN, H / 2 + 40, on2, glitch=0.5 if 1.0 < q < 1.2 else 0)
        light += text_layer(['Jeden chip. Jeden głos w twojej głowie.'], 26, WHITE, H / 2 + 190, seg(t, 35.8, 36.5))
        frame = with_text(frame, light, 7, 2.2)
    return frame


def render(t):
    active = [i for i, (a, b, _, _) in enumerate(SHOTS) if a <= t < b] or [len(SHOTS) - 1]
    if len(active) == 2:
        i, j = active
        k = smooth((t - SHOTS[j][0]) / XF)
        frame = render_shot(i, t) * (1 - k) + render_shot(j, t) * k
    else:
        frame = render_shot(active[0], t)
    frame = bloom(frame)
    frame = frame * vignette() + GRAIN[int(t * FPS) % len(GRAIN)]
    frame *= seg(t, 0, 0.6) * (1 - seg(t, 37.0, 38.0))
    return frame.clip(0, 255).astype(np.uint8)


def render_index(i):
    return render(i / FPS)


# --- dźwięk ---

def make_audio(path):
    n = int(DUR * SR)
    t = np.arange(n) / SR
    out = np.zeros(n, np.float32)
    r = np.random.default_rng(5)

    def bp(x, lo, hi):
        spec = np.fft.rfft(x)
        f = np.fft.rfftfreq(len(x), 1 / SR)
        spec[(f < lo) | (f > hi)] *= 0.03
        return np.fft.irfft(spec, len(x)).astype(np.float32)

    def env(a, b, fade=1.0):
        return np.clip(np.minimum((t - a) / fade, (b - t) / fade), 0, 1).astype(np.float32)

    def norm(x):
        return x / (np.abs(x).max() + 1e-9)

    rain_bed = norm(bp(r.normal(0, 1, n).astype(np.float32), 1200, 9000))
    out += rain_bed * (0.2 * env(0, 5.2, 0.8) + 0.08 * env(5, 10.7, 1) + 0.22 * env(10.5, 38, 2))
    thunder = norm(bp(r.normal(0, 1, n).astype(np.float32), 25, 260))
    for tt, a in ((1.65, 1.0), (3.05, 0.7)):
        out += thunder * np.exp(-np.clip(t - tt, 0, None) * 1.2) * (t > tt) * a
    wind = norm(bp(r.normal(0, 1, n).astype(np.float32), 150, 1400))
    out += wind * (0.2 * env(5, 10.7, 1.5) + 0.45 * env(9.5, 13, 1.2))

    chords = [(5.0, [57, 60, 64]), (10.5, [53, 57, 60]), (16.0, [48, 55, 64]), (22.5, [52, 56, 59]), (27.5, [50, 53, 57])]
    for i, (start, notes) in enumerate(chords):
        end = chords[i + 1][0] if i + 1 < len(chords) else 34.0
        e = env(start, end + 1.2, 1.2)
        for m in notes:
            f = 440 * 2 ** ((m - 69) / 12)
            for det in (0.997, 1.003):
                out += (2 * ((t * f * det) % 1) - 1) * e * 0.016

    for s0 in (17.0, 20.0):
        e = env(s0, s0 + 3.0, 0.8)
        f = 700 + 250 * np.sin(2 * np.pi * 0.8 * (t - s0))
        out += np.sin(2 * np.pi * np.cumsum(f) / SR) * e * 0.03

    e = env(22.5, 27.7, 0.6)
    out += (np.sin(2 * np.pi * 110 * t) + 0.5 * np.sin(2 * np.pi * 220.5 * t)) * e * 0.05
    for bt in np.arange(23, 27.5, 0.55):
        out += np.sin(2 * np.pi * 1800 * t) * np.exp(-np.clip(t - bt, 0, None) * 40) * (t > bt) * 0.06
    out += np.sign(np.sin(2 * np.pi * 850 * t)) * env(26.6, 27.4, 0.1) * 0.08

    for bt in np.arange(27.7, 31.5, 0.86):
        for off in (0, 0.18):
            tt = np.clip(t - bt - off, 0, None)
            out += np.sin(2 * np.pi * (55 + 40 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 12) * (t > bt + off) * 0.45

    blips = norm(bp(r.normal(0, 1, n).astype(np.float32), 2000, 8000))
    gate = (np.floor(t * 11) % 4 == 0).astype(np.float32)
    out += blips * gate * env(31.5, 34.0, 0.2) * 0.12

    tt = np.clip(t - 34.4, 0, None)
    out += np.sin(2 * np.pi * np.cumsum(40 + 80 * np.exp(-tt * 8)) / SR) * np.exp(-tt * 1.6) * (t > 34.4) * 0.8
    e = env(34.4, 38, 2.0)
    for m in (57, 64, 69, 72, 76):
        out += np.sin(2 * np.pi * 440 * 2 ** ((m - 69) / 12) * t) * e * 0.05

    out = norm(out) * 0.85 * (1 - np.clip((t - 37.2) / 0.8, 0, 1))
    stereo = np.stack([out, np.roll(out, 90)], axis=1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((stereo * 32767).astype(np.int16).tobytes())


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    wav = os.path.join(OUT, '_intro.wav')
    mp4 = os.path.join(OUT, 'intro.mp4')
    make_audio(wav)
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    proc = subprocess.Popen(
        [ff, '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
         '-i', wav, '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-profile:v', 'main', '-level', '3.1',
         '-movflags', '+faststart', '-c:a', 'aac', '-ar', '44100', '-b:a', '128k', '-shortest', mp4],
        stdin=subprocess.PIPE,
    )
    total = int(DUR * FPS)
    with Pool(3) as pool:
        for i, frame in enumerate(pool.imap(render_index, range(total), chunksize=6)):
            proc.stdin.write(frame.tobytes())
            if i % 60 == 0:
                print(f'klatka {i}/{total}', flush=True)
    proc.stdin.close()
    proc.wait()
    os.remove(wav)
    print('gotowe', mp4, os.path.getsize(mp4) // 1024, 'KB')
