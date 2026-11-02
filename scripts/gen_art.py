"""Generuje ilustracje scen do assets/scenes/*.jpg.

Wszystko jest rysowane kodem (bez zewnętrznych obrazków), w jednym stylu:
neony z poświatą, deszcz, odbicia w kałużach, sylwetki postaci.
Uruchom: python scripts/gen_art.py  (wymaga: pip install pillow numpy)
"""

import math
import os
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 750, 420
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'assets', 'scenes')
FONT = os.path.join(ROOT, 'node_modules', '@expo-google-fonts', 'chakra-petch', '700Bold', 'ChakraPetch_700Bold.ttf')

PINK = (255, 46, 136)
CYAN = (46, 242, 255)
PURPLE = (138, 92, 255)
YELLOW = (255, 210, 63)
RED = (255, 60, 80)
ORANGE = (255, 130, 40)
GREEN = (61, 255, 154)
WHITE = (235, 242, 255)
INK = (6, 6, 12)


def font(size):
    return ImageFont.truetype(FONT, int(size))


class Scene:
    def __init__(self, seed):
        self.rng = random.Random(seed)
        self.img = Image.new('RGB', (W, H), INK)

    # --- podstawy ---

    def draw(self):
        return ImageDraw.Draw(self.img)

    def layer(self):
        return Image.new('RGBA', (W, H), (0, 0, 0, 0))

    def over(self, lay):
        self.img = Image.alpha_composite(self.img.convert('RGBA'), lay).convert('RGB')

    def grad(self, top, bottom, y0=0, y1=H, x0=0, x1=W):
        arr = np.array(self.img).astype(np.float32)
        t = np.linspace(0, 1, y1 - y0)[:, None]
        col = np.array(top) * (1 - t) + np.array(bottom) * t
        arr[y0:y1, x0:x1, :] = col[:, None, :]
        self.img = Image.fromarray(arr.clip(0, 255).astype(np.uint8))

    def glow(self, lay, radius=10, strength=1.2, sharp=True):
        b = np.array(lay.filter(ImageFilter.GaussianBlur(radius))).astype(np.float32)
        add = b[..., :3] * (b[..., 3:] / 255.0) * strength
        self.img = Image.fromarray((np.array(self.img).astype(np.float32) + add).clip(0, 255).astype(np.uint8))
        if sharp:
            self.over(lay)

    def light(self, cx, cy, r, color, strength=0.7, sy=1.0):
        y, x = np.ogrid[:H, :W]
        d = np.sqrt((x - cx) ** 2 + ((y - cy) / sy) ** 2) / r
        f = np.clip(1 - d, 0, 1) ** 2 * strength
        arr = np.array(self.img).astype(np.float32) + f[..., None] * np.array(color)
        self.img = Image.fromarray(arr.clip(0, 255).astype(np.uint8))

    def fog(self, y0, y1, color, alpha=90):
        lay = self.layer()
        d = ImageDraw.Draw(lay)
        mid = (y0 + y1) / 2
        for y in range(int(y0), int(y1)):
            a = int(alpha * (1 - abs(y - mid) / ((y1 - y0) / 2)))
            d.line([(0, y), (W, y)], fill=color + (max(0, a),))
        self.over(lay)

    # --- elementy miasta ---

    def skyline(self, base_y, hmin, hmax, wmin, wmax, color, win=None, win_p=0.22, gap=(0, 8), x0=-20, x1=W + 20):
        d = self.draw()
        lay = self.layer()
        wd = ImageDraw.Draw(lay)
        x = x0
        while x < x1:
            w = self.rng.randint(wmin, wmax)
            h = self.rng.randint(hmin, hmax)
            d.rectangle([x, base_y - h, x + w, H], fill=color)
            if self.rng.random() < 0.3:
                d.rectangle([x + w * 0.4, base_y - h - 14, x + w * 0.45, base_y - h], fill=color)
            if win:
                for wy in range(base_y - h + 6, base_y - 4, 9):
                    for wx in range(x + 4, x + w - 4, 7):
                        if self.rng.random() < win_p:
                            wd.rectangle([wx, wy, wx + 2, wy + 3], fill=self.rng.choice(win) + (210,))
            x += w + self.rng.randint(*gap)
        if win:
            self.glow(lay, 3, 0.9)

    def spires(self, n, color, top=(0, 50), widths=(24, 60), base=H, lights=True):
        d = self.draw()
        lay = self.layer()
        ld = ImageDraw.Draw(lay)
        for _ in range(n):
            x = self.rng.randint(-20, W)
            w = self.rng.randint(*widths)
            t = self.rng.randint(*top)
            d.polygon([(x, base), (x + w, base), (x + w * 0.8, t + 40), (x + w * 0.55, t), (x + w * 0.45, t), (x + w * 0.2, t + 40)], fill=color)
            d.line([(x + w * 0.5, t), (x + w * 0.5, t - 30)], fill=color, width=2)
            for wy in range(t + 50, base, 14):
                if self.rng.random() < 0.5:
                    ld.line([(x + w * 0.3, wy), (x + w * 0.7, wy)], fill=(120, 140, 220, 90))
            if lights:
                ld.ellipse([x + w * 0.5 - 2, t - 32, x + w * 0.5 + 2, t - 28], fill=RED + (255,))
        self.glow(lay, 4, 1.2)

    def ground(self, y, color=(10, 10, 18)):
        self.draw().rectangle([0, y, W, H], fill=color)

    def reflect(self, y, strength=0.5, blur=2.5):
        arr = np.array(self.img).astype(np.float32)
        h = H - y
        src = arr[max(0, y - h):y][::-1].copy()
        for i in range(src.shape[0]):
            src[i] = np.roll(src[i], int(3 * math.sin(i * 0.45)), axis=0)
        refl = np.array(Image.fromarray(src.clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(blur))).astype(np.float32)
        n = refl.shape[0]
        fade = np.linspace(strength, 0.08, n)[:, None, None]
        arr[y:y + n] = arr[y:y + n] * (1 - fade) + refl * fade
        self.img = Image.fromarray(arr.clip(0, 255).astype(np.uint8))

    def rain(self, n=500, color=(170, 200, 255), alpha=80, length=(10, 26), slant=3, y0=-20, y1=H):
        lay = self.layer()
        d = ImageDraw.Draw(lay)
        for _ in range(n):
            x = self.rng.uniform(-30, W)
            y = self.rng.uniform(y0, y1)
            ln = self.rng.uniform(*length)
            d.line([(x, y), (x + slant * ln / 10, y + ln)], fill=color + (self.rng.randint(alpha // 3, alpha),), width=1)
        self.over(lay)

    def neon(self, text, x, y, size, color, vertical=False, board=True, radius=None, strength=1.5):
        f = font(size)
        if board:
            d = self.draw()
            if vertical:
                d.rectangle([x - 6, y - 6, x + size + 6, y + len(text) * size * 1.05 + 4], fill=(14, 12, 22))
            else:
                tw = self.draw().textlength(text, font=f)
                d.rectangle([x - 8, y - 4, x + tw + 8, y + size * 1.25], fill=(14, 12, 22))
        lay = self.layer()
        d = ImageDraw.Draw(lay)
        if vertical:
            for i, ch in enumerate(text):
                d.text((x, y + i * size * 1.05), ch, font=f, fill=color + (255,))
        else:
            d.text((x, y), text, font=f, fill=color + (255,))
        self.glow(lay, radius or max(4, size * 0.45), strength)
        core = self.layer()
        cd = ImageDraw.Draw(core)
        light = tuple(min(255, c + 120) for c in color)
        if vertical:
            for i, ch in enumerate(text):
                cd.text((x, y + i * size * 1.05), ch, font=f, fill=light + (150,))
        else:
            cd.text((x, y), text, font=f, fill=light + (150,))
        self.over(core)

    def strip(self, x0, y0, x1, y1, color, width=3, radius=8, strength=1.3):
        lay = self.layer()
        ImageDraw.Draw(lay).line([(x0, y0), (x1, y1)], fill=color + (255,), width=width)
        self.glow(lay, radius, strength)

    def figure(self, x, feet, h, color=(4, 4, 8), hood=False, rim=None, coat=True, arms=False):
        sw = h * 0.3
        sy = feet - h * 0.8
        r = h * 0.075

        def shapes(dx, d, fill):
            body = [
                (x - sw / 2 + dx, sy), (x + sw / 2 + dx, sy),
                (x + sw * (0.48 if coat else 0.38) + dx, feet - h * 0.32),
                (x + sw * 0.32 + dx, feet), (x + sw * 0.07 + dx, feet),
                (x + dx, feet - h * 0.3),
                (x - sw * 0.07 + dx, feet), (x - sw * 0.32 + dx, feet),
                (x - sw * (0.48 if coat else 0.38) + dx, feet - h * 0.32),
            ]
            d.polygon(body, fill=fill)
            d.rectangle([x - r * 0.6 + dx, sy - r * 0.8, x + r * 0.6 + dx, sy + 2], fill=fill)
            if hood:
                d.polygon([(x - r * 1.35 + dx, sy - r * 0.2), (x + r * 1.35 + dx, sy - r * 0.2), (x + r * 1.1 + dx, sy - r * 2.3), (x + dx, sy - r * 2.9), (x - r * 1.1 + dx, sy - r * 2.3)], fill=fill)
            else:
                d.ellipse([x - r + dx, sy - r * 2.6, x + r + dx, sy - r * 0.6], fill=fill)
            if arms:
                d.polygon([(x + sw / 2 + dx, sy + 2), (x + sw / 2 + h * 0.2 + dx, sy + h * 0.12), (x + sw / 2 + h * 0.19 + dx, sy + h * 0.17), (x + sw / 2 - 2 + dx, sy + h * 0.12)], fill=fill)

        if rim:
            lay = self.layer()
            shapes(2, ImageDraw.Draw(lay), rim + (255,))
            shapes(-2, ImageDraw.Draw(lay), rim + (200,))
            self.glow(lay, 3, 0.8)
        shapes(0, self.draw(), color)

    def heads(self, y, n, color=(4, 4, 8), size=(9, 13), spread=W):
        d = self.draw()
        for _ in range(n):
            x = self.rng.uniform(-10, spread + 10)
            yy = y + self.rng.uniform(-8, 10)
            s = self.rng.uniform(*size)
            d.ellipse([x - s, yy - s * 2.2, x + s, yy - s * 0.2], fill=color)
            d.polygon([(x - s * 2.2, yy + s * 4), (x - s * 1.6, yy), (x + s * 1.6, yy), (x + s * 2.2, yy + s * 4)], fill=color)

    def finish(self, name, tint=None, vignette=0.6, grain=5, blur=0):
        if blur:
            self.img = self.img.filter(ImageFilter.GaussianBlur(blur))
        arr = np.array(self.img).astype(np.float32)
        y, x = np.ogrid[:H, :W]
        dist = np.sqrt(((x - W / 2) / (W / 2)) ** 2 + ((y - H / 2) / (H / 2)) ** 2)
        arr *= (1 - vignette * np.clip(dist - 0.45, 0, 1) ** 1.4)[..., None]
        if tint:
            color, amount = tint
            arr = arr * (1 - amount) + (255 - (255 - arr) * (255 - np.array(color)) / 255) * amount
        arr[::3] *= 0.94
        arr += np.random.default_rng(len(name)).normal(0, grain, arr.shape)
        Image.fromarray(arr.clip(0, 255).astype(np.uint8)).save(os.path.join(OUT, name + '.jpg'), quality=82, optimize=True, progressive=True)
        print('ok', name)


# --- sceny ---

def city_base(s, horizon=300, sky=((10, 8, 30), (60, 20, 70)), haze=PINK):
    s.grad(sky[0], sky[1], 0, horizon)
    s.light(W * 0.5, horizon, 420, haze, 0.35, 0.5)
    s.spires(7, (22, 20, 46), top=(-10, 40), base=horizon)
    s.fog(horizon - 160, horizon - 40, (90, 40, 110), 60)
    s.skyline(horizon, 60, 150, 30, 70, (16, 14, 30), win=[CYAN, PINK, YELLOW, (200, 200, 255)], win_p=0.18)
    s.ground(horizon, (9, 9, 16))


def street(name='street', variant=None, seed=1):
    s = Scene(seed)
    hz = 290
    city_base(s, hz)
    d = s.draw()
    d.polygon([(0, 0), (150, 40), (150, hz + 10), (0, hz + 40)], fill=(12, 10, 20))
    d.polygon([(W, 0), (W - 160, 30), (W - 160, hz + 10), (W, hz + 40)], fill=(12, 10, 20))
    s.neon('MAKARON', 30, 70, 30, PINK, vertical=True)
    s.neon('NEON 99', W - 120, 50, 26, CYAN, vertical=True)
    s.neon('HALCYON', 300, 120, 22, YELLOW)
    s.strip(150, hz + 10, 0, hz + 40, PINK, 2, 6, 0.8)
    s.strip(W - 160, hz + 10, W, hz + 40, CYAN, 2, 6, 0.8)
    if variant == 'bike':
        for y, c in [(hz + 30, PINK), (hz + 48, CYAN), (hz + 62, YELLOW), (hz + 80, PINK)]:
            s.strip(-10, y, W + 10, y + s.rng.randint(-6, 6), c, 2, 10, 1.4)
        lay = s.layer()
        ld = ImageDraw.Draw(lay)
        ld.polygon([(330, hz + 70), (420, hz + 70), (440, hz + 52), (360, hz + 40), (310, hz + 55)], fill=(4, 4, 8, 255))
        ld.ellipse([300, hz + 58, 340, hz + 98], fill=(4, 4, 8, 255))
        ld.ellipse([410, hz + 58, 450, hz + 98], fill=(4, 4, 8, 255))
        s.over(lay)
        s.light(450, hz + 60, 70, YELLOW, 0.9)
        s.figure(380, hz + 52, 70, hood=True)
    else:
        s.figure(W * 0.5, hz + 70, 110, hood=True, rim=PINK if variant != 'drone' else RED)
    if variant == 'drone':
        lay = s.layer()
        ld = ImageDraw.Draw(lay)
        ld.polygon([(440, 110), (300, hz + 80), (620, hz + 80)], fill=RED + (55,))
        s.glow(lay, 14, 0.8)
        d = s.draw()
        d.polygon([(425, 100), (455, 100), (465, 110), (415, 110)], fill=(30, 30, 40))
        d.line([(400, 96), (480, 96)], fill=(50, 50, 60), width=3)
        s.light(440, 112, 40, RED, 1.2)
        s.figure(200, hz + 60, 90, hood=True, rim=RED)
        s.figure(250, hz + 66, 96, hood=True, rim=RED)
    s.reflect(hz, 0.55)
    s.rain(650)
    s.finish(name)


def roofs():
    s = Scene(3)
    hz = 250
    s.grad((8, 8, 26), (50, 20, 60), 0, hz)
    s.light(W * 0.6, hz, 420, PURPLE, 0.4, 0.5)
    s.spires(9, (24, 22, 50), top=(-20, 30), base=hz)
    s.skyline(hz, 40, 120, 20, 50, (18, 16, 32), win=[CYAN, PINK, YELLOW], win_p=0.25)
    d = s.draw()
    d.polygon([(0, 300), (300, 280), (330, H), (0, H)], fill=(8, 8, 14))
    d.polygon([(420, 320), (W, 300), (W, H), (400, H)], fill=(8, 8, 14))
    for x in (60, 140, 520, 640):
        d.rectangle([x, 270 if x < 300 else 285, x + 40, 300 if x < 300 else 310], fill=(14, 14, 22))
    d.line([(600, 300), (600, 220)], fill=(14, 14, 22), width=3)
    d.line([(585, 235), (615, 235)], fill=(14, 14, 22), width=2)
    s.strip(0, 300, 300, 280, CYAN, 2, 6, 0.8)
    s.figure(360, 250, 80, hood=True, rim=PINK)
    s.rain(700, slant=5)
    s.finish('roofs')


def bar():
    s = Scene(4)
    s.grad((22, 10, 20), (10, 6, 12))
    d = s.draw()
    for row in (110, 165):
        d.rectangle([60, row, W - 60, row + 6], fill=(40, 28, 30))
        lay = s.layer()
        ld = ImageDraw.Draw(lay)
        x = 70
        while x < W - 80:
            h = s.rng.randint(26, 46)
            c = s.rng.choice([GREEN, ORANGE, CYAN, PINK, YELLOW])
            ld.rectangle([x, row - h, x + 10, row], fill=c + (120,))
            ld.rectangle([x + 3, row - h - 10, x + 7, row - h], fill=c + (100,))
            x += s.rng.randint(16, 26)
        s.glow(lay, 6, 0.9)
    s.neon('POD POMPĄ', 260, 22, 34, PINK)
    for lx in (150, 375, 600):
        d = s.draw()
        d.line([(lx, 0), (lx, 70)], fill=(30, 20, 20), width=2)
        d.polygon([(lx - 22, 82), (lx + 22, 82), (lx + 12, 68), (lx - 12, 68)], fill=(40, 30, 20))
        s.light(lx, 90, 160, ORANGE, 0.5, 0.8)
    s.figure(470, 330, 190, coat=False, rim=ORANGE)
    d = s.draw()
    d.rectangle([0, 290, W, H], fill=(26, 16, 14))
    d.rectangle([0, 286, W, 292], fill=(90, 60, 40))
    lay = s.layer()
    ImageDraw.Draw(lay).rectangle([330, 276, 360, 286], fill=CYAN + (255,))
    s.glow(lay, 10, 1.6)
    s.light(345, 282, 60, CYAN, 0.6)
    s.finish('bar')


def laundry():
    s = Scene(5)
    s.grad((16, 22, 30), (8, 10, 16))
    s.strip(0, 18, W, 18, (210, 240, 255), 6, 18, 1.2)
    s.light(W / 2, 0, 500, (120, 170, 200), 0.35, 0.4)
    d = s.draw()
    d.rectangle([0, 150, W, 330], fill=(30, 36, 44))
    for i, x in enumerate(range(20, W, 120)):
        d.rectangle([x, 160, x + 100, 320], fill=(46, 52, 62))
        lay = s.layer()
        ImageDraw.Draw(lay).ellipse([x + 18, 190, x + 82, 254], fill=(140, 220, 255, 140 if i % 2 else 80))
        s.glow(lay, 8, 0.9)
        d = s.draw()
        d.ellipse([x + 24, 196, x + 76, 248], outline=(200, 230, 255), width=2)
    d.rectangle([0, 330, W, H], fill=(14, 16, 20))
    s.neon('PRALNIA 24H', 40, 70, 30, CYAN)
    s.figure(560, 400, 150, hood=True, rim=CYAN)
    lay = s.layer()
    ImageDraw.Draw(lay).rectangle([600, 330, 618, 340], fill=PINK + (255,))
    s.glow(lay, 14, 2.0)
    s.light(609, 335, 120, PINK, 0.7)
    s.reflect(330, 0.35)
    s.finish('laundry')


def sluza():
    s = Scene(6)
    s.grad((10, 10, 22), (16, 14, 28))
    d = s.draw()
    d.rectangle([40, 0, W - 40, H], fill=(28, 24, 30))
    for row in range(5):
        for col in range(7):
            x = 70 + col * 92
            y = 20 + row * 72
            if row == 4 and col in (3,):
                continue
            lit = s.rng.random() < 0.8
            d.rectangle([x, y, x + 56, y + 48], fill=(8, 10, 16))
            if lit:
                lay = s.layer()
                ImageDraw.Draw(lay).rectangle([x + 2, y + 2, x + 54, y + 46], fill=(60, 120, 255, 170))
                s.glow(lay, 8, 0.8)
                d = s.draw()
                d.ellipse([x + 20, y + 16, x + 36, y + 32], fill=(6, 6, 12))
                d.polygon([(x + 8, y + 48), (x + 16, y + 32), (x + 40, y + 32), (x + 48, y + 48)], fill=(6, 6, 12))
    d = s.draw()
    d.rectangle([330, 300, 420, H], fill=(10, 8, 8))
    s.light(375, 360, 90, ORANGE, 0.8)
    s.figure(375, H - 4, 90, coat=True, color=(6, 4, 4))
    s.neon('WIEŻA', 480, 330, 34, PINK, board=False, radius=6, strength=1.0)
    s.rain(450)
    s.finish('sluza')


def clinic():
    s = Scene(7)
    s.grad((8, 18, 16), (6, 10, 10))
    s.neon('+', 40, 20, 90, GREEN, board=False)
    s.neon('KLINIKA IGŁA', 180, 40, 30, GREEN)
    d = s.draw()
    for row in (150, 200):
        d.rectangle([30, row, 230, row + 4], fill=(30, 40, 40))
        lay = s.layer()
        ld = ImageDraw.Draw(lay)
        for x in range(40, 220, 22):
            ld.rectangle([x, row - 26, x + 14, row], fill=s.rng.choice([GREEN, CYAN, YELLOW]) + (90,))
        s.glow(lay, 5, 0.7)
    lay = s.layer()
    ImageDraw.Draw(lay).ellipse([400, 60, 560, 110], fill=(220, 250, 255, 230))
    s.glow(lay, 20, 1.2)
    d = s.draw()
    d.line([(480, 0), (480, 62)], fill=(40, 50, 50), width=4)
    lay = s.layer()
    ImageDraw.Draw(lay).polygon([(410, 105), (550, 105), (640, 330), (320, 330)], fill=(200, 255, 240, 40))
    s.over(lay)
    d = s.draw()
    d.polygon([(370, 300), (600, 280), (610, 300), (380, 320)], fill=(20, 26, 26))
    d.rectangle([470, 310, 490, 380], fill=(16, 20, 20))
    s.figure(660, 390, 190, rim=GREEN, arms=True)
    lay = s.layer()
    ld = ImageDraw.Draw(lay)
    for i in range(5):
        ld.line([(676 + 0, 330 - 40 + i * 3), (700 + i * 3, 312 - 40 + i * 4)], fill=(200, 220, 230, 255), width=2)
    s.glow(lay, 3, 1.0)
    s.ground(390, (8, 12, 12))
    s.finish('clinic')


def tower():
    s = Scene(8)
    s.grad((6, 6, 20), (40, 18, 60))
    s.light(W / 2, H + 60, 600, PINK, 0.45, 0.4)
    s.skyline(H, 20, 70, 20, 50, (14, 12, 26), win=[PINK, CYAN, YELLOW], win_p=0.3)
    d = s.draw()
    cx = 380
    top = 30
    for side in (-1, 1):
        d.line([(cx + side * 120, H), (cx + side * 12, top)], fill=(70, 56, 96), width=5)
    y = H
    w = 120
    toggle = 1
    while y > top + 20:
        ny = y - 34
        nw = 12 + (ny - top) / (H - top) * 108
        d.line([(cx - w, y), (cx + nw, ny)] if toggle > 0 else [(cx + w, y), (cx - nw, ny)], fill=(60, 48, 84), width=3)
        d.line([(cx - nw, ny), (cx + nw, ny)], fill=(60, 48, 84), width=2)
        y, w, toggle = ny, nw, -toggle
    d.line([(cx, top), (cx, 0)], fill=(70, 56, 96), width=3)
    for (lx, ly) in [(cx, 4), (cx - 60, 220), (cx + 60, 220), (cx - 30, 120), (cx + 30, 120)]:
        lay = s.layer()
        ImageDraw.Draw(lay).ellipse([lx - 4, ly - 4, lx + 4, ly + 4], fill=RED + (255,))
        s.glow(lay, 10, 2.0)
    d = s.draw()
    d.rectangle([cx - 70, 250, cx + 70, 300], fill=(18, 16, 26))
    lay = s.layer()
    ld = ImageDraw.Draw(lay)
    for i in range(4):
        ld.rectangle([cx - 60 + i * 32, 260, cx - 36 + i * 32, 280], fill=CYAN + (180,))
    s.glow(lay, 8, 1.0)
    s.figure(cx + 40, 300, 60, rim=CYAN)
    s.rain(380, alpha=60)
    s.finish('tower')


def metro():
    s = Scene(9)
    s.grad((14, 12, 12), (6, 6, 8))
    d = s.draw()
    for y in range(0, 260, 22):
        d.line([(0, y), (W, y)], fill=(26, 24, 22), width=1)
    for x in range(0, W, 34):
        d.line([(x, 0), (x, 260)], fill=(26, 24, 22), width=1)
    d.ellipse([440, 60, 760, 400], fill=(2, 2, 4))
    s.neon('SZCZURY', 60, 40, 30, RED, board=False, radius=5, strength=0.9)
    d = s.draw()
    d.rectangle([0, 260, W, H], fill=(10, 14, 16))
    for bx in (110, 330, 560):
        d.rectangle([bx - 18, 220, bx + 18, 270], fill=(30, 24, 18))
        lay = s.layer()
        ld = ImageDraw.Draw(lay)
        for _ in range(16):
            fx = bx + s.rng.uniform(-14, 14)
            ld.polygon([(fx - 6, 222), (fx + 6, 222), (fx + s.rng.uniform(-4, 4), 222 - s.rng.uniform(12, 40))], fill=s.rng.choice([ORANGE, YELLOW, RED]) + (220,))
        s.glow(lay, 10, 1.6)
        s.light(bx, 215, 160, ORANGE, 0.6)
    d = s.draw()
    d.rectangle([215, 190, 275, 262], fill=(12, 8, 8))
    d.rectangle([205, 150, 285, 200], fill=(18, 12, 10))
    s.figure(245, 262, 110, rim=ORANGE)
    s.reflect(262, 0.6, 3)
    s.finish('metro')


def station():
    s = Scene(10)
    s.grad((150, 170, 190), (60, 70, 90), 0, 200)
    s.grad((30, 34, 44), (14, 16, 22), 200, H)
    for y in (24, 60):
        s.strip(0, y, W, y, (240, 250, 255), 4, 14, 0.9)
    d = s.draw()
    d.rounded_rectangle([40, 120, W + 40, 250], 30, fill=(225, 232, 240))
    d.rectangle([40, 200, W + 40, 210], fill=CYAN)
    for x in range(90, W, 90):
        d.rounded_rectangle([x, 140, x + 60, 185], 8, fill=(40, 50, 66))
    s.neon('KOLEJ · IGLICE', 240, 280, 26, CYAN)
    s.figure(160, 380, 120, hood=True, rim=CYAN)
    s.reflect(250, 0.4)
    s.finish('station')


def train(name='train', agent=False):
    s = Scene(11 if not agent else 12)
    s.grad((30, 30, 40), (14, 14, 20))
    for i, x in enumerate((30, 280, 530)):
        s.grad((255, 200, 140), (120, 160, 220), 50, 200, x, x + 190)
        d = s.draw()
        for _ in range(4):
            cx = x + s.rng.uniform(10, 180)
            cy = s.rng.uniform(130, 190)
            d.ellipse([cx - 40, cy - 14, cx + 40, cy + 14], fill=(240, 236, 240))
        if i == 1:
            s.light(x + 120, 80, 120, (255, 230, 170), 0.9)
    d = s.draw()
    d.rectangle([0, 200, W, H], fill=(22, 22, 30))
    for x in range(0, W, 120):
        d.rounded_rectangle([x + 10, 240, x + 100, 330], 10, fill=(40, 30, 50))
    s.strip(0, 230, W, 230, CYAN, 2, 8, 0.8)
    if agent:
        s.figure(470, 400, 230, color=(18, 18, 24), rim=RED)
        lay = s.layer()
        ImageDraw.Draw(lay).ellipse([474, 205, 482, 213], fill=RED + (255,))
        s.glow(lay, 10, 2.5)
    else:
        s.figure(600, 420, 240, hood=True, rim=(255, 220, 170))
    s.finish(name)


def corridor(name, dark=False):
    s = Scene(13)
    vx, vy = W / 2, 190
    if dark:
        s.grad((14, 4, 8), (6, 2, 4))
    else:
        s.grad((210, 225, 235), (150, 170, 185))
    d = s.draw()
    base = (40, 10, 16) if dark else (235, 242, 248)
    d.polygon([(0, 0), (W, 0), (vx + 60, vy - 40), (vx - 60, vy - 40)], fill=(20, 6, 10) if dark else (245, 250, 252))
    d.polygon([(0, H), (W, H), (vx + 60, vy + 40), (vx - 60, vy + 40)], fill=(10, 4, 6) if dark else (190, 205, 215))
    d.rectangle([vx - 60, vy - 40, vx + 60, vy + 40], fill=(30, 8, 12) if dark else (255, 255, 255))
    for t in (0.0, 0.35, 0.6, 0.8):
        x0 = t * (vx - 60)
        d.line([(x0, t * (vy - 40)), (x0, H - t * (H - vy - 40))], fill=(60, 20, 26) if dark else (170, 190, 200), width=2)
        d.line([(W - x0, t * (vy - 40)), (W - x0, H - t * (H - vy - 40))], fill=(60, 20, 26) if dark else (170, 190, 200), width=2)
    for i in range(6):
        t = i / 6
        y = t * (vy - 40) + 6
        x0 = t * (vx - 60) + 40
        if not dark:
            s.strip(x0, y, W - x0, y, (255, 255, 255), 3, 8, 0.6)
    if dark:
        for (x, y) in [(90, 60), (W - 90, 60), (vx, vy - 50)]:
            s.light(x, y, 180, RED, 0.9)
        d = s.draw()
        for (x, y) in [(220, 360), (520, 380)]:
            d.polygon([(x - 18, y), (x, y - 12), (x + 18, y), (x, y + 8)], fill=(40, 40, 46))
        s.figure(vx, 360, 150, color=(4, 2, 2), hood=True, rim=RED)
    else:
        d = s.draw()
        for (x, y) in [(260, 140), (480, 120)]:
            d.polygon([(x - 12, y), (x, y - 8), (x + 12, y), (x, y + 6)], fill=(40, 46, 60))
            s.light(x, y + 10, 30, RED, 0.8)
        s.figure(vx - 80, 380, 160, color=(20, 24, 34), hood=True)
    s.finish(name, vignette=0.45)


def lab():
    s = Scene(14)
    s.grad((200, 220, 230), (130, 150, 165))
    d = s.draw()
    for x in range(0, W, 150):
        d.rectangle([x, 0, x + 4, 300], fill=(160, 180, 190))
    d.rectangle([0, 300, W, H], fill=(170, 185, 195))
    for x in (60, 220):
        d.rectangle([x, 150, x + 120, 230], fill=(20, 30, 40))
        lay = s.layer()
        ld = ImageDraw.Draw(lay)
        for i in range(5):
            ld.line([(x + 10, 165 + i * 12), (x + 10 + s.rng.randint(40, 100), 165 + i * 12)], fill=CYAN + (220,), width=3)
        s.glow(lay, 4, 1.0)
    lay = s.layer()
    ImageDraw.Draw(lay).text((470, 70), 'MIRA', font=font(60), fill=PINK + (140,))
    s.glow(lay, 16, 1.2)
    s.figure(560, 400, 230, color=(236, 240, 244), rim=(150, 170, 180), coat=True)
    s.finish('lab', vignette=0.4)


def server():
    s = Scene(15)
    s.grad((4, 10, 20), (2, 4, 10))
    vx, vy = W / 2, 200
    d = s.draw()
    for side in (-1, 1):
        for i in range(6):
            t0, t1 = i / 6, (i + 0.8) / 6
            x0 = vx + side * (W / 2) * (1 - t0)
            x1 = vx + side * (W / 2) * (1 - t1)
            y0a, y0b = vy - (vy - 10) * (1 - t0), vy + (H - vy - 10) * (1 - t0)
            y1a, y1b = vy - (vy - 10) * (1 - t1), vy + (H - vy - 10) * (1 - t1)
            d.polygon([(x0, y0a), (x1, y1a), (x1, y1b), (x0, y0b)], fill=(14, 20, 30))
            lay = s.layer()
            ld = ImageDraw.Draw(lay)
            for _ in range(int(60 * (1 - t0) + 8)):
                u = s.rng.random()
                xx = x0 + (x1 - x0) * u
                ya = y0a + (y1a - y0a) * u
                yb = y0b + (y1b - y0b) * u
                yy = s.rng.uniform(ya + 6, yb - 6)
                r = 1.6 * (1 - t0) + 0.6
                ld.ellipse([xx - r, yy - r, xx + r, yy + r], fill=s.rng.choice([GREEN, GREEN, CYAN, RED]) + (255,))
            s.glow(lay, 3, 1.1)
    s.fog(150, 260, (40, 80, 140), 50)
    s.figure(vx, 330, 110, hood=True, rim=CYAN)
    lay = s.layer()
    ImageDraw.Draw(lay).rectangle([vx + 14, 270, vx + 30, 276], fill=PINK + (255,))
    s.glow(lay, 10, 2.0)
    s.finish('server')


def archive():
    s = Scene(16)
    s.grad((30, 26, 20), (12, 10, 8))
    d = s.draw()
    for i, x in enumerate(range(-20, W, 110)):
        top = 60 + (i % 2) * 10
        d.rectangle([x, top, x + 96, 360], fill=(70, 66, 56))
        for y in range(top + 10, 350, 48):
            d.rectangle([x + 8, y, x + 88, y + 40], fill=(86, 82, 70))
            d.rectangle([x + 40, y + 16, x + 56, y + 22], fill=(40, 38, 32))
    d.rectangle([0, 360, W, H], fill=(18, 16, 12))
    s.light(380, 40, 300, (255, 220, 160), 0.6)
    d = s.draw()
    for _ in range(18):
        x = s.rng.uniform(100, 650)
        y = s.rng.uniform(365, 410)
        d.polygon([(x, y), (x + 30, y - 4), (x + 34, y + 14), (x + 4, y + 18)], fill=(200, 196, 180))
    s.figure(380, 400, 150, rim=(255, 220, 160))
    lay = s.layer()
    ImageDraw.Draw(lay).rectangle([400, 300, 412, 306], fill=PINK + (255,))
    s.glow(lay, 12, 2.0)
    s.finish('archive')


def ramp():
    s = Scene(17)
    s.grad((30, 4, 10), (6, 2, 4))
    d = s.draw()
    for i in range(7):
        y = 60 + i * 52
        rx = 340 - i * 30
        d.ellipse([W / 2 - rx, y - 30, W / 2 + rx, y + 30], outline=(70, 20, 26), width=10)
    for (x, y) in [(120, 40), (W - 120, 40), (W / 2, 200)]:
        s.light(x, y, 220, RED, 0.8)
    lay = s.layer()
    ld = ImageDraw.Draw(lay)
    pts = [(W / 2 + (340 - t * 30) * math.cos(t * 1.6), 60 + t * 52 + 30 * math.sin(t * 1.6)) for t in np.linspace(0, 6, 80)]
    ld.line(pts, fill=CYAN + (255,), width=4)
    s.glow(lay, 10, 1.8)
    s.figure(140, 360, 140, color=(16, 16, 22), rim=RED)
    lay = s.layer()
    ImageDraw.Draw(lay).ellipse([140 - 2, 212, 146, 220], fill=RED + (255,))
    s.glow(lay, 8, 2.0)
    s.finish('ramp')


def mem_kitchen():
    s = Scene(18)
    s.grad((120, 70, 70), (60, 30, 40))
    d = s.draw()
    d.rectangle([420, 50, 640, 220], fill=(255, 210, 170))
    d.line([(530, 50), (530, 220)], fill=(120, 70, 60), width=6)
    d.line([(420, 135), (640, 135)], fill=(120, 70, 60), width=6)
    s.light(530, 135, 300, (255, 200, 150), 0.6)
    d = s.draw()
    d.rectangle([60, 240, 330, H], fill=(70, 40, 40))
    d.rectangle([60, 236, 330, 246], fill=(140, 90, 80))
    for x in (110, 220):
        d.ellipse([x - 30, 228, x + 30, 244], fill=(40, 24, 24))
    lay = s.layer()
    ld = ImageDraw.Draw(lay)
    for sx in (100, 120, 210, 228):
        pts = [(sx + 8 * math.sin(y / 14), y) for y in range(110, 228, 4)]
        ld.line(pts, fill=(255, 255, 255, 70), width=3)
    s.glow(lay, 8, 0.6)
    s.figure(250, 400, 200, color=(50, 24, 30), rim=(255, 200, 160))
    s.finish('mem_kitchen', tint=(PINK, 0.25), blur=1.5, vignette=0.8)


def mem_tower():
    s = Scene(19)
    s.grad((250, 160, 150), (120, 70, 140))
    s.light(600, 300, 400, (255, 220, 180), 0.8)
    d = s.draw()
    d.rectangle([0, 300, W, H], fill=(60, 30, 60))
    d.line([(0, 300), (W, 300)], fill=(40, 20, 40), width=8)
    for x in range(20, W, 60):
        d.line([(x, 300), (x, 350)], fill=(40, 20, 40), width=5)
    s.figure(300, 300, 170, color=(50, 24, 50), coat=False)
    s.figure(420, 300, 140, color=(50, 24, 50), coat=False)
    lay = s.layer()
    ld = ImageDraw.Draw(lay)
    x = 120
    for sym in '.-.  .-.  .-.':
        if sym == '.':
            ld.ellipse([x, 80, x + 14, 94], fill=WHITE + (255,))
            x += 28
        elif sym == '-':
            ld.rounded_rectangle([x, 80, x + 44, 94], 7, fill=WHITE + (255,))
            x += 58
        else:
            x += 20
    s.glow(lay, 12, 1.4)
    s.finish('mem_tower', tint=(PINK, 0.2), blur=1.2, vignette=0.8)


def mem_clinic():
    s = Scene(20)
    s.grad((235, 235, 240), (190, 190, 200))
    d = s.draw()
    d.rectangle([0, 300, W, H], fill=(205, 205, 212))
    d.rectangle([180, 250, 560, 270], fill=(170, 170, 180))
    lay = s.layer()
    ImageDraw.Draw(lay).rounded_rectangle([320, 200, 420, 248], 8, fill=CYAN + (220,))
    s.glow(lay, 14, 1.0)
    s.figure(520, 400, 260, color=(245, 245, 250), rim=(160, 160, 170))
    s.finish('mem_clinic', tint=(PINK, 0.2), blur=1.4, vignette=0.85)


def dawn():
    s = Scene(21)
    s.grad((40, 30, 90), (255, 150, 120), 0, 300)
    s.light(W * 0.7, 300, 380, (255, 220, 160), 0.9, 0.6)
    s.spires(4, (60, 40, 80), top=(20, 60), base=300, lights=False)
    d = s.draw()
    cx = 140
    d.line([(cx - 50, 300), (cx, 60)], fill=(40, 26, 50), width=5)
    d.line([(cx + 50, 300), (cx, 60)], fill=(40, 26, 50), width=5)
    lay = s.layer()
    ld = ImageDraw.Draw(lay)
    for r in (40, 80, 130, 190, 260):
        ld.arc([cx - r, 60 - r, cx + r, 60 + r], 200, 340, fill=CYAN + (220 - r // 2,), width=3)
    s.glow(lay, 8, 1.4)
    s.ground(300, (30, 20, 40))
    s.heads(330, 70, color=(14, 10, 20), size=(8, 12))
    s.heads(380, 50, color=(8, 6, 12), size=(12, 16))
    s.finish('dawn', vignette=0.4)


def cell():
    s = Scene(22)
    s.grad((16, 16, 22), (6, 6, 10))
    lay = s.layer()
    ImageDraw.Draw(lay).rectangle([330, 50, 430, 120], fill=(200, 220, 255, 255))
    s.glow(lay, 20, 1.0)
    lay = s.layer()
    ImageDraw.Draw(lay).polygon([(330, 120), (430, 120), (560, H), (220, H)], fill=(160, 180, 220, 50))
    s.over(lay)
    d = s.draw()
    for x in range(345, 430, 20):
        d.line([(x, 50), (x, 120)], fill=(10, 10, 14), width=5)
    for x in range(0, W, 70):
        d.line([(x, 0), (x, H)], fill=(4, 4, 6), width=14)
    s.figure(380, 410, 140, color=(10, 10, 14), coat=False)
    s.finish('cell')


def whiteroom():
    s = Scene(23)
    s.grad((245, 245, 248), (200, 205, 212))
    d = s.draw()
    d.rectangle([0, 300, W, H], fill=(215, 218, 224))
    d.rectangle([220, 260, 520, 280], fill=(180, 184, 190))
    lay = s.layer()
    ImageDraw.Draw(lay).ellipse([355, 244, 385, 262], fill=CYAN + (255,))
    s.glow(lay, 12, 1.4)
    s.figure(600, 400, 260, color=(250, 250, 252), rim=(170, 175, 185))
    s.finish('whiteroom', vignette=0.5)


def network():
    s = Scene(24)
    s.grad((4, 4, 14), (10, 4, 24))
    lay = s.layer()
    ld = ImageDraw.Draw(lay)
    pts = [(s.rng.uniform(0, W), s.rng.uniform(0, H)) for _ in range(60)]
    for i, p in enumerate(pts):
        for q in pts[i + 1:]:
            if math.dist(p, q) < 110:
                ld.line([p, q], fill=s.rng.choice([CYAN, PINK, PURPLE]) + (120,), width=1)
    for p in pts:
        ld.ellipse([p[0] - 3, p[1] - 3, p[0] + 3, p[1] + 3], fill=WHITE + (255,))
    s.glow(lay, 6, 1.5)
    s.light(W / 2, H / 2, 260, PINK, 0.5)
    s.finish('network')


def billboard():
    s = Scene(25)
    city_base(s, 330, sky=((8, 8, 24), (40, 18, 50)))
    d = s.draw()
    d.rectangle([150, 30, 600, 230], fill=(240, 236, 245))
    lay = s.layer()
    ld = ImageDraw.Draw(lay)
    ld.ellipse([210, 60, 330, 200], fill=(255, 200, 220, 255))
    ld.text((360, 80), 'HALCYON', font=font(36), fill=(60, 40, 80, 255))
    ld.text((360, 130), 'MIRA', font=font(48), fill=PINK + (255,))
    ld.text((360, 186), 'twoja asystentka', font=font(18), fill=(90, 80, 110, 255))
    s.over(lay)
    s.light(375, 130, 320, (255, 230, 250), 0.35)
    s.figure(560, 400, 90, hood=True, rim=PINK)
    s.reflect(330, 0.5)
    s.rain(600)
    s.finish('billboard')


def ash():
    s = Scene(26)
    s.grad((16, 14, 28), (4, 4, 8))
    s.light(375, 150, 260, PINK, 0.35)
    d = s.draw()
    hand = (34, 30, 44)
    d.polygon([(250, H), (330, 250), (450, 240), (520, 300), (560, H)], fill=hand)
    d.polygon([(330, 250), (460, 238), (488, 200), (430, 196), (318, 214)], fill=hand)
    for i, fx in enumerate(range(330, 470, 34)):
        d.rounded_rectangle([fx, 150 + (i % 2) * 10, fx + 26, 222], 12, fill=hand)
    s.strip(318, 214, 330, 250, PINK, 2, 4, 0.6)
    lay = s.layer()
    ld = ImageDraw.Draw(lay)
    for _ in range(70):
        x = s.rng.gauss(400, 70)
        y = s.rng.uniform(20, 200)
        sz = s.rng.uniform(3, 11)
        ld.polygon([(x, y), (x + sz, y + sz * 0.4), (x + sz * 0.6, y + sz)], fill=s.rng.choice([CYAN, PINK, WHITE, PINK]) + (s.rng.randint(120, 255),))
    s.glow(lay, 7, 1.8)
    s.rain(500, alpha=60)
    s.finish('ash')


def flatline():
    s = Scene(27)
    s.grad((20, 8, 30), (8, 4, 12))
    lay = s.layer()
    ld = ImageDraw.Draw(lay)
    for _ in range(40):
        x = s.rng.uniform(0, W)
        y = s.rng.uniform(0, 260)
        r = s.rng.uniform(10, 40)
        ld.ellipse([x - r, y - r, x + r, y + r], fill=s.rng.choice([PINK, CYAN, YELLOW, PURPLE]) + (s.rng.randint(40, 120),))
    s.glow(lay, 14, 1.2, sharp=False)
    s.img = s.img.filter(ImageFilter.GaussianBlur(4))
    s.ground(300, (8, 8, 12))
    s.reflect(300, 0.6, 5)
    pts = []
    for x in range(0, W + 10, 10):
        y = 210
        if 300 < x < 360:
            y = 210 - 60 * math.sin((x - 300) / 60 * math.pi)
        pts.append((x, y))
    s.strip(0, 210, 0, 210, RED, 1, 1, 0)
    lay = s.layer()
    ImageDraw.Draw(lay).line(pts, fill=RED + (255,), width=3)
    s.glow(lay, 10, 1.8)
    s.finish('flatline', vignette=0.8)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    street()
    street('drone', 'drone', 2)
    street('bike', 'bike', 3)
    roofs()
    bar()
    laundry()
    sluza()
    clinic()
    tower()
    metro()
    station()
    train()
    train('agent', agent=True)
    corridor('iglica')
    corridor('blackout', dark=True)
    lab()
    server()
    archive()
    ramp()
    mem_kitchen()
    mem_tower()
    mem_clinic()
    dawn()
    cell()
    whiteroom()
    network()
    billboard()
    ash()
    flatline()
