"""Bake the "effect" versions of the images that fly across the home page.

Every entry in assets/js/content.js written as
        { img: 'gd/img-9247', fx: 'halftone', ... }
gets a file  media/fx/gd--img-9247--halftone.webp.  The page shows the effect
version and fades to the real picture on hover.

Effects:  flute     ribbed-glass refraction (vertical ribs)
          halftone  print dots, 45 degree screen
          dither    chunky 1-bit ordered dither

Run from the site folder after changing which images fly:
        python3 tools/make_fx.py
Needs Python with Pillow and numpy.
"""
import os, re, sys
import numpy as np
from PIL import Image

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(SITE, 'media', 'fx')
WIDTH = 820
INK, PAPER = np.array([14, 14, 14], float), np.array([244, 242, 236], float)


def load(key):
    im = Image.open(os.path.join(SITE, 'media', key + '.webp')).convert('RGB')
    h = round(im.height * WIDTH / im.width)
    return np.asarray(im.resize((WIDTH, h), Image.LANCZOS), float)


def luma(a):
    return (a[..., 0] * 0.299 + a[..., 1] * 0.587 + a[..., 2] * 0.114) / 255.0


def flute(a, rib=20, squeeze=2.7):
    """Each rib shows a mirrored, squeezed slice of what is behind it."""
    h, w, _ = a.shape
    x = np.arange(w)
    centre = (x // rib + 0.5) * rib
    u = (x % rib) / rib                                  # 0..1 across one rib
    src = np.clip(centre - (u - 0.5) * rib * squeeze, 0, w - 1)
    lo = np.floor(src).astype(int); hi = np.minimum(lo + 1, w - 1); t = (src - lo)[None, :, None]
    out = a[:, lo] * (1 - t) + a[:, hi] * t
    shade = 0.80 + 0.26 * np.sin(np.pi * u) ** 0.8       # darker in the grooves
    spec = np.exp(-((u - 0.28) / 0.07) ** 2) * 26        # thin highlight on each rib
    return np.clip(out * shade[None, :, None] + spec[None, :, None], 0, 255)


def halftone(a, cell=7.0, angle=45.0):
    """Dots on a rotated grid; radius follows the darkness under each dot."""
    h, w, _ = a.shape
    s = 2                                                # supersample for smooth dots
    yy, xx = np.mgrid[0:h * s, 0:w * s] / s
    th = np.deg2rad(angle); c, sn = np.cos(th), np.sin(th)
    rx, ry = xx * c + yy * sn, -xx * sn + yy * c
    cx, cy = (np.floor(rx / cell) + 0.5) * cell, (np.floor(ry / cell) + 0.5) * cell
    px = np.clip(np.round(cx * c - cy * sn), 0, w - 1).astype(int)   # back to image space
    py = np.clip(np.round(cx * sn + cy * c), 0, h - 1).astype(int)
    lum = luma(a)
    dark = lum.mean() < 0.36                             # dark pictures: light dots on black
    tone = lum[py, px]
    amount = tone if dark else 1 - tone
    radius = np.sqrt(np.clip(amount, 0, 1)) * cell * 0.74
    dist = np.hypot(rx - cx, ry - cy)
    dot = np.clip((radius - dist) * s + 0.5, 0, 1)[..., None]
    fg, bg = (PAPER, INK) if dark else (INK, PAPER)
    big = bg * (1 - dot) + fg * dot
    return big.reshape(h, s, w, s, 3).mean(axis=(1, 3))


BAYER = np.array([[0, 32, 8, 40, 2, 34, 10, 42], [48, 16, 56, 24, 50, 18, 58, 26],
                  [12, 44, 4, 36, 14, 46, 6, 38], [60, 28, 52, 20, 62, 30, 54, 22],
                  [3, 35, 11, 43, 1, 33, 9, 41], [51, 19, 59, 27, 49, 17, 57, 25],
                  [15, 47, 7, 39, 13, 45, 5, 37], [63, 31, 55, 23, 61, 29, 53, 21]]) / 64.0


def dither(a, px=3):
    h, w, _ = a.shape
    small = np.asarray(Image.fromarray(a.astype(np.uint8)).resize((w // px, h // px), Image.LANCZOS), float)
    lum = np.clip((luma(small) - 0.5) * 1.25 + 0.5, 0, 1)
    sh, sw = lum.shape
    thresh = np.tile(BAYER, (sh // 8 + 1, sw // 8 + 1))[:sh, :sw]
    bit = (lum > thresh)[..., None]
    out = np.where(bit, PAPER, INK).astype(np.uint8)
    return np.asarray(Image.fromarray(out).resize((w, h), Image.NEAREST), float)


EFFECTS = {'flute': flute, 'halftone': halftone, 'dither': dither}


def main():
    text = open(os.path.join(SITE, 'assets', 'js', 'content.js'), encoding='utf-8').read()
    wanted = sorted(set(re.findall(r"img:\s*'([a-z0-9]+/[a-z0-9-]+)',\s*fx:\s*'(\w+)'", text)))
    os.makedirs(OUT, exist_ok=True)
    keep = set()
    for key, fx in wanted:
        if fx not in EFFECTS:
            print('unknown effect', fx, 'for', key); continue
        name = key.replace('/', '--') + '--' + fx + '.webp'
        keep.add(name)
        dest = os.path.join(OUT, name)
        if os.path.exists(dest) and '--force' not in sys.argv:
            continue
        img = EFFECTS[fx](load(key))
        Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(dest, 'WEBP', quality=78, method=4)
        print('made', name)
    for f in os.listdir(OUT):                            # drop effects no longer used
        if f not in keep:
            os.remove(os.path.join(OUT, f)); print('removed', f)
    print(len(keep), 'effect images')


if __name__ == '__main__':
    main()
