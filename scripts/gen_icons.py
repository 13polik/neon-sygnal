"""Tworzy ikony aplikacji do wyboru w ustawieniach (assets/icons).

- <nazwa>.png: 1024x1024 bez przezroczystości, dla iOS (expo-alternate-app-icons)
- thumb_<nazwa>.jpg: 160x160 miniatura do ekranu ustawień
Ikona „neon” jest też główną ikoną aplikacji (assets/icon.png).
Źródła: obrazy z AI w ai-raw/ (scripts/gen_ai_art.py).
Uruchom: python scripts/gen_icons.py
"""

import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
RAW = os.path.join(ROOT, 'ai-raw')
OUT = os.path.join(ROOT, 'assets', 'icons')
FONT = os.path.join(ROOT, 'node_modules', '@expo-google-fonts', 'chakra-petch', '700Bold', 'ChakraPetch_700Bold.ttf')
S = 1024

PINK = (255, 46, 136)
CYAN = (46, 242, 255)
RED = (255, 60, 80)
YELLOW = (255, 210, 63)
BLUE = (90, 150, 255)
GREEN = (60, 255, 140)
PURPLE = (190, 90, 255)
ICE = (200, 230, 255)
GOLD = (255, 190, 90)


def square_from(name, focus=0.5, top=0.0):
    img = Image.open(os.path.join(RAW, name)).convert('RGB')
    w, h = img.size
    side = min(w, h)
    # Obcinamy dolny pasek ze znakiem wodnym generatora
    side = int(side * 0.9)
    x = int((w - side) * focus)
    y = int((h * 0.92 - side) * top) if h * 0.92 > side else 0
    return img.crop((x, y, x + side, y + side)).resize((S, S), Image.LANCZOS)


def glow(img, draw_fn, radius=24, strength=1.6):
    lay = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(lay))
    b = np.array(lay.filter(ImageFilter.GaussianBlur(radius))).astype(np.float32)
    add = b[..., :3] * (b[..., 3:] / 255.0) * strength
    out = Image.fromarray((np.array(img).astype(np.float32) + add).clip(0, 255).astype(np.uint8))
    return Image.alpha_composite(out.convert('RGBA'), lay).convert('RGB')


def finish(img, color, darken=0.15):
    arr = np.array(img).astype(np.float32) * (1 - darken)
    y, x = np.ogrid[:S, :S]
    d = np.sqrt(((x - S / 2) / (S / 2)) ** 2 + ((y - S / 2) / (S / 2)) ** 2)
    arr *= (1 - 0.55 * np.clip(d - 0.55, 0, 1) ** 1.3)[..., None]
    img = Image.fromarray(arr.clip(0, 255).astype(np.uint8))
    return glow(img, lambda d: d.rounded_rectangle([60, 60, S - 60, S - 60], 150, outline=color + (255,), width=14), 22, 1.4)


def neon():
    y = np.linspace(0, 1, S)[:, None, None]
    arr = np.array([10, 8, 26]) * (1 - y) + np.array([46, 14, 54]) * y
    img = Image.fromarray(np.repeat(arr, S, axis=1).astype(np.uint8))
    d = ImageDraw.Draw(img)
    rng = np.random.default_rng(3)
    for _ in range(260):
        x0, y0 = rng.uniform(0, S), rng.uniform(0, S)
        d.line([(x0, y0), (x0 + 8, y0 + 46)], fill=(120, 140, 200), width=2)
    f = ImageFont.truetype(FONT, 620)
    img = glow(img, lambda d: d.text((S / 2, S / 2 - 40), 'N', font=f, fill=PINK + (255,), anchor='mm'), 30, 1.8)
    img = glow(img, lambda d: d.line([(250, 800), (774, 800)], fill=CYAN + (255,), width=26), 20, 1.6)
    return finish(img, CYAN, 0.0)


def sygnal():
    """Fale sygnału rozchodzące się z jednego punktu."""
    y = np.linspace(0, 1, S)[:, None, None]
    arr = np.array([6, 10, 24]) * (1 - y) + np.array([18, 8, 36]) * y
    img = Image.fromarray(np.repeat(arr, S, axis=1).astype(np.uint8))
    cx, cy = S / 2, 700
    img = glow(img, lambda d: d.ellipse([cx - 46, cy - 46, cx + 46, cy + 46], fill=PINK + (255,)), 30, 2.0)
    for i, col in enumerate([PINK, (150, 140, 255), CYAN]):
        r = 170 + i * 140
        img = glow(img, lambda d, r=r, col=col: d.arc([cx - r, cy - r, cx + r, cy + r], 225, 315, fill=col + (255,), width=34), 22, 1.6)
    return finish(img, PINK, 0.0)


def retro():
    """Zachodzące słońce nad siatką, w barwach gry."""
    y = np.linspace(0, 1, S)[:, None, None]
    arr = np.array([12, 6, 30]) * (1 - y) + np.array([70, 14, 70]) * y
    img = Image.fromarray(np.repeat(arr, S, axis=1).astype(np.uint8))
    horizon = 640
    sun = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    sa = np.zeros((S, S, 4), np.uint8)
    yy, xx = np.ogrid[:S, :S]
    disk = (xx - S / 2) ** 2 + (yy - 520) ** 2 < 300 ** 2
    t = np.clip((yy - 220) / 420, 0, 1)
    stripes = ~((yy > 470) & (((yy - 470) % 44) < 6 + (yy - 470) // 14))
    mask = disk & stripes & (yy < horizon)
    sa[..., 0] = 255
    sa[..., 1] = (210 * (1 - t) + 46 * t).astype(np.uint8)
    sa[..., 2] = (63 * (1 - t) + 136 * t).astype(np.uint8)
    sa[..., 3] = mask * 255
    sun = Image.fromarray(sa, 'RGBA')
    blur = np.array(sun.filter(ImageFilter.GaussianBlur(40))).astype(np.float32)
    base = np.array(img).astype(np.float32) + blur[..., :3] * (blur[..., 3:] / 255.0) * 1.2
    img = Image.alpha_composite(Image.fromarray(base.clip(0, 255).astype(np.uint8)).convert('RGBA'), sun).convert('RGB')
    d = ImageDraw.Draw(img)
    d.rectangle([0, horizon, S, S], fill=(14, 6, 26))

    def grid(dr):
        for k in range(1, 12):
            gy = horizon + (S - horizon) * (k / 11) ** 1.8
            dr.line([(0, gy), (S, gy)], fill=PINK + (255,), width=5)
        for k in range(-10, 11):
            dr.line([(S / 2 + k * 40, horizon), (S / 2 + k * 260, S)], fill=PINK + (255,), width=5)

    img = glow(img, grid, 10, 1.4)
    return finish(img, YELLOW, 0.0)


def save(name, img):
    img.save(os.path.join(OUT, name + '.png'))
    img.resize((160, 160), Image.LANCZOS).save(os.path.join(OUT, 'thumb_' + name + '.jpg'), quality=88)
    print('ok', name)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    main = neon()
    save('neon', main)
    main.save(os.path.join(ROOT, 'assets', 'icon.png'))
    save('mira', finish(square_from('p_mira.jpg'), PINK))
    save('wieza', finish(square_from('tower.jpg', 0.5), CYAN))
    save('sokol', finish(square_from('p_sokol.jpg'), RED))
    save('dolina', finish(square_from('street.jpg', 0.5), YELLOW))
    save('oko', finish(square_from('p_oko.jpg'), BLUE))
    save('pchla', finish(square_from('p_pchla.jpg'), GREEN))
    save('igla', finish(square_from('p_igla.jpg'), CYAN))
    save('gawron', finish(square_from('p_gawron.jpg'), PURPLE))
    save('teodor', finish(square_from('p_teodor.jpg'), RED))
    save('wren', finish(square_from('p_wren.jpg'), ICE))
    save('prezes', finish(square_from('p_prezes.jpg'), GOLD))
    save('iglica', finish(square_from('in_spires.jpg', 0.5, 0.1), PINK))
    save('chip', finish(square_from('in_chip.jpg', 0.5, 1.0), CYAN))
    save('poscig', finish(square_from('bike.jpg', 0.25), PINK))
    save('sygnal', sygnal())
    save('retro', retro())
