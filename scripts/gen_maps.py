"""Renderuje realistyczne tła map (widok z góry) do assets/maps/*.jpg.

Czyta siatki i szyldy z src/maps.js, więc tło zawsze zgadza się z kolizjami.
Każde pole siatki ma TILE punktów; obraz jest w skali SCALE (ostry na ekranach Retina).
Uruchom: python scripts/gen_maps.py  (wymaga: pip install pillow numpy)
"""

import math
import os
import random
import re

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'assets', 'maps')
FONT = os.path.join(ROOT, 'node_modules', '@expo-google-fonts', 'chakra-petch', '700Bold', 'ChakraPetch_700Bold.ttf')
TILE = 40
SCALE = 2
T = TILE * SCALE

NEON = {'pink': (255, 46, 136), 'cyan': (46, 242, 255), 'yellow': (255, 210, 63)}


def read_maps():
    src = open(os.path.join(ROOT, 'src', 'maps.js'), encoding='utf-8').read()
    maps = {}
    for m in re.finditer(r"\n  (\w+): \{(.*?)\n  \},", src, re.S):
        body = m.group(2)
        grid = re.findall(r"'([#.\w$]+)'", re.search(r'grid: \[(.*?)\]', body, re.S).group(1))
        signs = [
            {'c': int(a), 'r': int(b), 'text': t, 'color': c}
            for a, b, t, c in re.findall(r"\{ c: (\d+), r: (\d+), text: '([^']*)', color: '(\w+)' \}", body)
        ]
        maps[m.group(1)] = {'grid': grid, 'signs': signs}
    return maps


def noise(w, h, rng, scale=1.0, blur=1.2):
    n = rng.normal(0, 1, (h, w)).astype(np.float32)
    img = Image.fromarray(((n * 40 * scale) + 128).clip(0, 255).astype(np.uint8))
    return np.array(img.filter(ImageFilter.GaussianBlur(blur))).astype(np.float32) - 128


def wall_rects(grid):
    rects, open_ = [], {}
    for r, row in enumerate(grid):
        nxt = {}
        c = 0
        while c < len(row):
            if row[c] != '#':
                c += 1
                continue
            c0 = c
            while c < len(row) and row[c] == '#':
                c += 1
            key = (c0, c - 1)
            if key in open_:
                open_[key]['h'] += 1
                nxt[key] = open_[key]
            else:
                rect = {'c': c0, 'r': r, 'w': c - c0, 'h': 1}
                rects.append(rect)
                nxt[key] = rect
        open_ = nxt
    return rects


def add_glow(img, layer, radius, strength=1.0):
    b = np.array(layer.filter(ImageFilter.GaussianBlur(radius))).astype(np.float32)
    add = b[..., :3] * (b[..., 3:] / 255.0) * strength
    return Image.fromarray((np.array(img).astype(np.float32) + add).clip(0, 255).astype(np.uint8))


def light_pool(arr, cx, cy, r, color, strength):
    h, w = arr.shape[:2]
    x0, x1 = max(0, int(cx - r)), min(w, int(cx + r))
    y0, y1 = max(0, int(cy - r)), min(h, int(cy + r))
    if x0 >= x1 or y0 >= y1:
        return
    yy, xx = np.ogrid[y0:y1, x0:x1]
    f = np.clip(1 - np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / r, 0, 1) ** 2 * strength
    arr[y0:y1, x0:x1] += f[..., None] * np.array(color, dtype=np.float32)


def is_wall(grid, c, r):
    return r < 0 or r >= len(grid) or c < 0 or c >= len(grid[0]) or grid[r][c] == '#'


def city(name, m, rng):
    grid = m['grid']
    W, H = len(grid[0]) * T, len(grid) * T
    nrng = np.random.default_rng(rng.randint(0, 9999))

    # Asfalt: ciemny, z fakturą i mokrymi plamami
    base = np.zeros((H, W, 3), np.float32) + np.array([20, 21, 28], np.float32)
    base += noise(W, H, nrng, 0.5, 1.0)[..., None] * 0.6
    wet = noise(W // 8, H // 8, nrng, 1.0, 2.5)
    wet = np.array(Image.fromarray((wet + 128).clip(0, 255).astype(np.uint8)).resize((W, H), Image.BILINEAR)).astype(np.float32) - 128
    base += np.clip(wet, 0, None)[..., None] * np.array([0.08, 0.1, 0.16])
    img = Image.fromarray(base.clip(0, 255).astype(np.uint8))
    d = ImageDraw.Draw(img)

    # Chodniki wzdłuż budynków i linie na środku szerokich ulic
    for r, row in enumerate(grid):
        for c, ch in enumerate(row):
            if ch == '#':
                continue
            x, y = c * T, r * T
            sw = 12
            if is_wall(grid, c, r - 1):
                d.rectangle([x, y, x + T, y + sw], fill=(42, 42, 50))
            if is_wall(grid, c, r + 1):
                d.rectangle([x, y + T - sw, x + T, y + T], fill=(42, 42, 50))
            if is_wall(grid, c - 1, r):
                d.rectangle([x, y, x + sw, y + T], fill=(42, 42, 50))
            if is_wall(grid, c + 1, r):
                d.rectangle([x + T - sw, y, x + T, y + T], fill=(42, 42, 50))
            horiz_road = is_wall(grid, c, r - 1) and is_wall(grid, c, r + 1)
            vert_road = is_wall(grid, c - 1, r) and is_wall(grid, c + 1, r)
            if horiz_road and not vert_road:
                for k in range(0, T, 26):
                    d.rectangle([x + k, y + T / 2 - 1, x + k + 12, y + T / 2 + 1], fill=(150, 140, 90))
            if vert_road and not horiz_road:
                for k in range(0, T, 26):
                    d.rectangle([x + T / 2 - 1, y + k, x + T / 2 + 1, y + k + 12], fill=(150, 140, 90))
            if rng.random() < 0.05:
                d.ellipse([x + 26, y + 26, x + 46, y + 46], fill=(30, 30, 34), outline=(56, 56, 60), width=2)
            if rng.random() < 0.08:
                d.rectangle([x + 10, y + 50, x + 24, y + 62], fill=(36, 50, 40))

    # Kałuże
    pud = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    pd = ImageDraw.Draw(pud)
    for r, row in enumerate(grid):
        for c, ch in enumerate(row):
            if ch != '#' and rng.random() < 0.18:
                x, y = c * T + rng.uniform(10, 50), r * T + rng.uniform(10, 50)
                w, h = rng.uniform(20, 60), rng.uniform(10, 26)
                pd.ellipse([x - w / 2, y - h / 2, x + w / 2, y + h / 2], fill=(70, 90, 130, 90))
    pud = pud.filter(ImageFilter.GaussianBlur(2))
    img = Image.alpha_composite(img.convert('RGBA'), pud).convert('RGB')

    # Cienie budynków na ulicy
    sh = Image.new('L', (W, H), 0)
    sd = ImageDraw.Draw(sh)
    rects = wall_rects(grid)
    for rc in rects:
        x0, y0 = rc['c'] * T, rc['r'] * T
        sd.rectangle([x0 + 14, y0 + 18, x0 + rc['w'] * T + 14, y0 + rc['h'] * T + 18], fill=150)
    sh = np.array(sh.filter(ImageFilter.GaussianBlur(10))).astype(np.float32) / 255
    arr = np.array(img).astype(np.float32) * (1 - sh[..., None] * 0.7)
    img = Image.fromarray(arr.clip(0, 255).astype(np.uint8))

    # Dachy
    d = ImageDraw.Draw(img)
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    roof_tones = [(48, 48, 56), (56, 50, 50), (44, 50, 58), (58, 56, 52), (40, 42, 50)]
    for i, rc in enumerate(rects):
        x0, y0 = rc['c'] * T, rc['r'] * T
        x1, y1 = x0 + rc['w'] * T, y0 + rc['h'] * T
        tone = roof_tones[i % len(roof_tones)]
        d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=tone)
        tex = noise(x1 - x0, y1 - y0, nrng, 0.35, 0.8)
        sub = np.array(img.crop((x0, y0, x1, y1))).astype(np.float32) + tex[..., None]
        img.paste(Image.fromarray(sub.clip(0, 255).astype(np.uint8)), (x0, y0))
        d = ImageDraw.Draw(img)
        d.rectangle([x0, y0, x1 - 1, y1 - 1], outline=tuple(min(255, v + 34) for v in tone), width=5)
        d.line([(x0 + 5, y1 - 6), (x1 - 6, y1 - 6)], fill=tuple(max(0, v - 18) for v in tone), width=4)
        area = (x1 - x0) * (y1 - y0)
        for _ in range(int(area / (T * T) * 1.6)):
            kind = rng.random()
            px = rng.uniform(x0 + 16, max(x0 + 17, x1 - 44))
            py = rng.uniform(y0 + 16, max(y0 + 17, y1 - 44))
            if kind < 0.35:
                d.rectangle([px, py, px + 26, py + 22], fill=(78, 80, 86), outline=(30, 30, 34), width=2)
                d.ellipse([px + 5, py + 3, px + 21, py + 19], fill=(40, 40, 46), outline=(100, 100, 106))
                d.line([(px + 13, py + 4), (px + 13, py + 18)], fill=(90, 90, 96), width=2)
            elif kind < 0.55:
                d.ellipse([px, py, px + 30, py + 30], fill=(70, 62, 56), outline=(36, 32, 30), width=3)
                d.ellipse([px + 8, py + 8, px + 22, py + 22], outline=(90, 80, 70), width=2)
            elif kind < 0.72:
                d.rectangle([px, py, px + 34, py + 18], fill=(26, 34, 50), outline=(80, 96, 120), width=2)
                for k in range(1, 4):
                    d.line([(px + k * 8.5, py), (px + k * 8.5, py + 18)], fill=(60, 74, 96), width=1)
            elif kind < 0.86:
                gd.rectangle([px, py, px + 18, py + 12], fill=(255, 220, 160, 200))
                d.rectangle([px, py, px + 18, py + 12], fill=(200, 180, 140))
            else:
                d.line([(px, py), (px + 30, py + 24)], fill=(110, 110, 116), width=2)
                gd.ellipse([px + 26, py + 20, px + 34, py + 28], fill=(255, 60, 80, 255))

    # Latarnie: ciepłe plamy światła na skrzyżowaniach i wzdłuż ulic
    arr = np.array(img).astype(np.float32)
    for r, row in enumerate(grid):
        for c, ch in enumerate(row):
            if ch != '#' and (c * 3 + r * 5) % 7 == 0:
                cx, cy = c * T + T / 2, r * T + T / 2
                color = (255, 190, 120) if (c + r) % 3 else (150, 200, 255)
                light_pool(arr, cx, cy, 120, color, 0.22)
    img = Image.fromarray(arr.clip(0, 255).astype(np.uint8))

    # Szyldy neonowe na krawędziach dachów i ich poświata na ulicy
    font = ImageFont.truetype(FONT, 20)
    for sgn in m['signs']:
        col = NEON[sgn['color']]
        x, y = sgn['c'] * T + 8, sgn['r'] * T + 26
        gd.text((x, y), sgn['text'], font=font, fill=col + (255,))
        tw = gd.textlength(sgn['text'], font=font)
        gd.rectangle([x - 6, y - 4, x + tw + 6, y + 26], outline=col + (120,), width=2)
        arr = np.array(img).astype(np.float32)
        light_pool(arr, x + tw / 2, y + 40, 150, col, 0.25)
        img = Image.fromarray(arr.clip(0, 255).astype(np.uint8))
    img = add_glow(img, glow, 8, 1.4)
    img = Image.alpha_composite(img.convert('RGBA'), glow).convert('RGB')
    return img


def office(name, m, rng):
    grid = m['grid']
    W, H = len(grid[0]) * T, len(grid) * T
    nrng = np.random.default_rng(rng.randint(0, 9999))
    base = np.zeros((H, W, 3), np.float32) + np.array([205, 212, 220], np.float32)
    base += noise(W, H, nrng, 0.12, 0.8)[..., None]
    img = Image.fromarray(base.clip(0, 255).astype(np.uint8))
    d = ImageDraw.Draw(img)
    for x in range(0, W, T // 2):
        d.line([(x, 0), (x, H)], fill=(190, 198, 206), width=1)
    for y in range(0, H, T // 2):
        d.line([(0, y), (W, y)], fill=(190, 198, 206), width=1)
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for r, row in enumerate(grid):
        for c, ch in enumerate(row):
            if ch == '#':
                continue
            x, y = c * T, r * T
            if (c + r) % 4 == 0:
                gd.rectangle([x + 20, y + 34, x + 60, y + 46], fill=(255, 255, 255, 110))
            if rng.random() < 0.06:
                d.ellipse([x + 46, y + 10, x + 70, y + 34], fill=(60, 120, 80), outline=(40, 80, 50), width=2)

    sh = Image.new('L', (W, H), 0)
    sd = ImageDraw.Draw(sh)
    rects = wall_rects(grid)
    for rc in rects:
        x0, y0 = rc['c'] * T, rc['r'] * T
        sd.rectangle([x0 + 6, y0 + 8, x0 + rc['w'] * T + 6, y0 + rc['h'] * T + 8], fill=120)
    sh = np.array(sh.filter(ImageFilter.GaussianBlur(6))).astype(np.float32) / 255
    img = Image.fromarray((np.array(img).astype(np.float32) * (1 - sh[..., None] * 0.35)).clip(0, 255).astype(np.uint8))
    d = ImageDraw.Draw(img)
    for i, rc in enumerate(rects):
        x0, y0 = rc['c'] * T, rc['r'] * T
        x1, y1 = x0 + rc['w'] * T, y0 + rc['h'] * T
        thick = rc['w'] == 1 or rc['h'] == 1
        d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(64, 70, 82))
        d.rectangle([x0 + 4, y0 + 4, x1 - 5, y1 - 5], fill=(84, 90, 104))
        if not thick and rc['w'] >= 2 and rc['h'] >= 2:
            for k in range(rng.randint(1, 3)):
                px = rng.uniform(x0 + 14, x1 - 60)
                py = rng.uniform(y0 + 14, y1 - 44)
                d.rectangle([px, py, px + 44, py + 28], fill=(150, 156, 166), outline=(110, 116, 126), width=2)
                gd.rectangle([px + 8, py + 6, px + 22, py + 16], fill=(46, 242, 255, 200))
        gd.rectangle([x0, y0, x1 - 1, y1 - 1], outline=(46, 242, 255, 70), width=2)
    for sgn in m['signs']:
        font = ImageFont.truetype(FONT, 18)
        gd.text((sgn['c'] * T + 8, sgn['r'] * T + 28), sgn['text'], font=font, fill=NEON[sgn['color']] + (255,))
    img = add_glow(img, glow, 6, 0.9)
    img = Image.alpha_composite(img.convert('RGBA'), glow).convert('RGB')
    return img


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    maps = read_maps()
    for name, m in maps.items():
        rng = random.Random(name)
        img = office(name, m, rng) if name == 'iglica' else city(name, m, rng)
        img.save(os.path.join(OUT, name + '.jpg'), quality=80, optimize=True, progressive=True)
        print('ok', name, img.size)
