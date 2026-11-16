"""Builds the optimised media folder + manifest for the static site.

Usage: python3 build_media.py <repo public dir> <figma dir> <site dir>
Every original image becomes  media/<group>/<slug>.webp   (long side <= 1800)
                         and  media/<group>/<slug>.t.webp (width <= 640)
Videos become media/video/<slug>.mp4 (<=720p H.264) + <slug>.webp poster.
A manifest (assets/js/media.js) records intrinsic sizes so layouts never jump.
"""
import os, re, sys, json, hashlib, subprocess
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps

PUB, FIG, SITE = sys.argv[1], sys.argv[2], sys.argv[3]
MEDIA = os.path.join(SITE, 'media')
DER = re.compile(r'\.(480|1080|1920)\.(webp|avif)$|\.lqip\.txt$', re.I)
IMG = re.compile(r'\.(png|jpe?g|webp)$', re.I)
VID = re.compile(r'\.(mp4|mov)$', re.I)

GROUPS = {
    'ev': '2. Projects/1. Events',
    'gd': '2. Projects/2. Graphic Design',
    '3d': '2. Projects/3. 3D',
    'imt': '2. Projects/4. Interactive Media Technology',
    'prod': '2. Projects/5. Product Design & Brand Identity',
    'typo': '2. Projects/6. Typography',
    'ai': '2. Projects/7. AI',
    'da': '2. Projects/8. Digital Art',
    'mkt': '2. Projects/9. Marketing Campaigns',
    'ux': '2. Projects/11. UX`UI',
    'hol': '2. Projects/12. Holistic Art Magazine',
    'photo': '2. Projects/13. Photography',
    'proj': '2. Projects/15. Projection Mapping + VJ + Lights',
    'exp': '2. Projects/16. Experimental',
    'hl': '3. Highlights',
    'vocab': '4. Vocabulary',
    'about': '5. About',
    'contact': '6. Contact',
    'logo': 'logo',
}
VIDEO_DIRS = ['2. Projects/10. mp4', '2. Projects/15. Projection Mapping + VJ + Lights',
              '2. Projects/3. 3D', '3. Highlights', 'landing']


def slug(name):
    base = os.path.splitext(name)[0].lower()
    base = re.sub(r'[^a-z0-9]+', '-', base).strip('-')
    return base[:48] or 'file'


def md5(path):
    h = hashlib.md5()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def trim_alpha(im):
    """Crop fully transparent margins (used for the cut-out objects)."""
    if im.mode != 'RGBA':
        return im
    bbox = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    return im.crop(bbox) if bbox else im


def process_image(src, group, name, trim=False):
    out_dir = os.path.join(MEDIA, group)
    os.makedirs(out_dir, exist_ok=True)
    big = os.path.join(out_dir, name + '.webp')
    small = os.path.join(out_dir, name + '.t.webp')
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)
    has_alpha = im.mode in ('RGBA', 'LA', 'P') and 'A' in im.convert('RGBA').getbands() \
        and im.convert('RGBA').getchannel('A').getextrema()[0] < 250
    im = im.convert('RGBA' if has_alpha else 'RGB')
    if trim:
        im = trim_alpha(im)
    w, h = im.size
    if not (os.path.exists(big) and os.path.exists(small)):
        b = im.copy(); b.thumbnail((1800, 1800), Image.LANCZOS)
        b.save(big, 'WEBP', quality=80, method=4)
        s = im.copy(); s.thumbnail((640, 1400), Image.LANCZOS)
        s.save(small, 'WEBP', quality=72, method=4)
    return {'w': w, 'h': h, 'a': 1 if has_alpha else 0}


def process_video(src, name):
    out_dir = os.path.join(MEDIA, 'video')
    os.makedirs(out_dir, exist_ok=True)
    mp4 = os.path.join(out_dir, name + '.mp4')
    poster = os.path.join(out_dir, name + '.webp')
    if not os.path.exists(mp4):
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src,
                        '-vf', "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))',format=yuv420p",
                        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '27',
                        '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', mp4], check=True)
    if not os.path.exists(poster):
        tmp = poster + '.png'
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '0.6', '-i', mp4, '-frames:v', '1', tmp], check=True)
        im = Image.open(tmp).convert('RGB'); im.thumbnail((960, 960)); im.save(poster, 'WEBP', quality=74)
        os.remove(tmp)
    pr = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                         'stream=width,height:format=duration', '-of', 'json', mp4],
                        capture_output=True, text=True)
    j = json.loads(pr.stdout)
    st = j['streams'][0]
    return {'w': st['width'], 'h': st['height'], 'd': round(float(j['format']['duration']), 1)}


def main():
    manifest, videos, seen, jobs = {}, {}, {}, []
    for group, rel in GROUPS.items():
        d = os.path.join(PUB, rel)
        used = set()
        for f in sorted(os.listdir(d)):
            p = os.path.join(d, f)
            if not os.path.isfile(p) or DER.search(f) or not IMG.search(f):
                continue
            if 'sims-green-triangle' in f:
                continue
            s = slug(f)
            while s in used:
                s += '-b'
            used.add(s)
            key = group + '/' + s
            h = md5(p)
            if h in seen:                       # identical file already exported
                manifest[key] = {'alias': seen[h]}
                continue
            seen[h] = key
            jobs.append((key, p, group, s, False))
    for f in sorted(os.listdir(FIG)):
        s = slug(f)
        jobs.append(('fig/' + s, os.path.join(FIG, f), 'fig', s, True))

    extra = os.path.join(SITE, 'tools', 'extra')      # images added later with add_images.py
    if os.path.isdir(extra):
        for group in sorted(os.listdir(extra)):
            gd = os.path.join(extra, group)
            if not os.path.isdir(gd):
                continue
            for f in sorted(os.listdir(gd)):
                if IMG.search(f):
                    jobs.append((group + '/' + slug(f), os.path.join(gd, f), group, slug(f), False))

    def run(job):
        key, p, group, s, trim = job
        try:
            return key, process_image(p, group, s, trim)
        except Exception as e:                  # keep going, report at the end
            return key, {'error': str(e)}

    with ThreadPoolExecutor(2) as ex:
        for key, info in ex.map(run, jobs):
            if 'error' in info:
                print('IMAGE FAILED', key, info['error'])
            else:
                manifest[key] = info
    for key, info in list(manifest.items()):   # resolve aliases to real sizes
        if 'alias' in info:
            target = manifest.get(info['alias'])
            if target and 'w' in target:
                manifest[key] = dict(target, src=info['alias'])
            else:
                del manifest[key]

    vseen = {}
    for rel in VIDEO_DIRS:
        d = os.path.join(PUB, rel)
        for f in sorted(os.listdir(d)):
            p = os.path.join(d, f)
            if not VID.search(f):
                continue
            h = md5(p)
            if h in vseen:
                continue
            s = slug(re.sub(r'^\d+\s*-\s*', '', f))
            while s in videos:
                s += '-b'
            vseen[h] = s
            try:
                videos[s] = process_video(p, s)
                print('video', s, videos[s])
            except Exception as e:
                print('VIDEO FAILED', f, e)

    out = os.path.join(SITE, 'assets', 'js', 'media.js')
    with open(out, 'w') as fh:
        fh.write('/* AUTO-GENERATED by tools/build_media.py. Intrinsic sizes of every media file. */\n')
        fh.write('window.SPA_MEDIA = ' + json.dumps({'images': manifest, 'videos': videos}, indent=1, sort_keys=True) + ';\n')
    print('images', len(manifest), 'videos', len(videos))


if __name__ == '__main__':
    main()
