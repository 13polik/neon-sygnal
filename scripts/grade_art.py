"""Przycina i ujednolica obrazy z AI (scripts/gen_ai_art.py) do formatu gry.

- sceny: obcina dolny pasek ze znakiem wodnym, skaluje do 750x392 -> assets/scenes
- portrety (p_*): kadr bez znaku wodnego, 240x240 -> assets/portraits
Wspólny wygląd: lekki kontrast, chłodne cienie, winieta i ziarno.
Uruchom: python scripts/grade_art.py [folder z surowymi obrazami]
"""

import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SCENES = os.path.join(ROOT, 'assets', 'scenes')
PORTRAITS = os.path.join(ROOT, 'assets', 'portraits')
NAMES = ['mira', 'bruno', 'oko', 'kret', 'wren', 'sokol', 'igla', 'halina', 'pchla', 'sroka', 'gawron', 'prezes', 'teodor']


def grade(img, vignette=0.5, grain=3.0, seed=0):
    img = ImageEnhance.Contrast(img).enhance(1.06)
    arr = np.array(img).astype(np.float32)
    lum = arr.mean(axis=2, keepdims=True) / 255
    arr += (1 - lum) * np.array([-4, 0, 8])
    h, w = arr.shape[:2]
    y, x = np.ogrid[:h, :w]
    d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2)
    arr *= (1 - vignette * np.clip(d - 0.5, 0, 1) ** 1.5)[..., None]
    arr += np.random.default_rng(seed).normal(0, grain, arr.shape)
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8))


def fallback_portrait(name):
    """Zastępczy portret (sylwetka), gdy generator nie dostarczył obrazu."""
    img = Image.new('RGB', (240, 240), (16, 14, 28))
    d = ImageDraw.Draw(img)
    d.ellipse([80, 50, 160, 140], fill=(40, 36, 60))
    d.ellipse([40, 140, 200, 300], fill=(40, 36, 60))
    return img.filter(ImageFilter.GaussianBlur(1))


def main():
    raw = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'ai-raw')
    os.makedirs(SCENES, exist_ok=True)
    os.makedirs(PORTRAITS, exist_ok=True)
    for i, f in enumerate(sorted(os.listdir(raw))):
        key, ext = os.path.splitext(f)
        if ext.lower() not in ('.jpg', '.jpeg', '.png'):
            continue
        img = Image.open(os.path.join(raw, f)).convert('RGB')
        w, h = img.size
        if key.startswith('p_'):
            side = int(min(w, h) * 0.875)
            img = img.crop(((w - side) // 2, 0, (w - side) // 2 + side, side)).resize((240, 240), Image.LANCZOS)
            grade(img, 0.35, 2.0, i).save(os.path.join(PORTRAITS, key[2:] + '.jpg'), quality=85)
        else:
            img = img.crop((0, 0, w, int(h * 0.93))).resize((750, 392), Image.LANCZOS)
            grade(img, 0.5, 3.0, i).save(os.path.join(SCENES, key + '.jpg'), quality=82, optimize=True, progressive=True)
        print('ok', key)
    for name in NAMES:
        path = os.path.join(PORTRAITS, name + '.jpg')
        if not os.path.exists(path):
            fallback_portrait(name).save(path, quality=85)
            print('fallback', name)


if __name__ == '__main__':
    main()
