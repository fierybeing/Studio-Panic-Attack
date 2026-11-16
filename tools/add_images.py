"""Add new images to the site without rebuilding everything.

Usage (run from the site folder):
    python3 tools/add_images.py <group> <image> [<image> ...]

Example:
    python3 tools/add_images.py web ~/Desktop/my-site.png
    -> media/web/my-site.webp + media/web/my-site.t.webp
    -> use the key 'web/my-site' in assets/js/content.js

The originals are kept in tools/extra/<group>/ so a full rebuild with
build_media.py picks them up again. Needs Python with Pillow.
"""
import os, re, sys, json, shutil
from PIL import Image, ImageOps

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(SITE, 'assets', 'js', 'media.js')


def slug(name):
    base = os.path.splitext(os.path.basename(name))[0].lower()
    return re.sub(r'[^a-z0-9]+', '-', base).strip('-')[:48] or 'file'


def convert(src, group, name):
    out = os.path.join(SITE, 'media', group)
    os.makedirs(out, exist_ok=True)
    im = ImageOps.exif_transpose(Image.open(src))
    alpha = 'A' in im.convert('RGBA').getbands() and im.convert('RGBA').getchannel('A').getextrema()[0] < 250
    im = im.convert('RGBA' if alpha else 'RGB')
    w, h = im.size
    big = im.copy(); big.thumbnail((1800, 1800), Image.LANCZOS)
    big.save(os.path.join(out, name + '.webp'), 'WEBP', quality=80, method=4)
    small = im.copy(); small.thumbnail((640, 1400), Image.LANCZOS)
    small.save(os.path.join(out, name + '.t.webp'), 'WEBP', quality=72, method=4)
    return {'w': w, 'h': h, 'a': 1 if alpha else 0}


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    group = slug(sys.argv[1])
    text = open(MANIFEST, encoding='utf-8').read()
    start = text.index('{'); end = text.rindex('}') + 1
    data = json.loads(text[start:end])
    keep = os.path.join(SITE, 'tools', 'extra', group)
    os.makedirs(keep, exist_ok=True)
    for src in sys.argv[2:]:
        name = slug(src)
        dest = os.path.join(keep, name + os.path.splitext(src)[1].lower())
        if os.path.abspath(src) != os.path.abspath(dest):
            shutil.copyfile(src, dest)
        data['images'][group + '/' + name] = convert(dest, group, name)
        print("added  '%s/%s'" % (group, name))
    with open(MANIFEST, 'w', encoding='utf-8') as fh:
        fh.write(text[:start] + json.dumps(data, indent=1, sort_keys=True) + text[end:])


if __name__ == '__main__':
    main()
