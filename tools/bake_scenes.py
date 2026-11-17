"""Bake the drawn scenes (tools/scenes/*.html) into the images the site uses.

    python3 tools/bake_scenes.py            # all scenes
    python3 tools/bake_scenes.py castle     # one

Needs Python with Pillow and Playwright, plus Chrome or Chromium:
    pip install pillow playwright && python3 -m playwright install chromium
The scenes are drawn as SVG with heavy filters (clay, fabric, plaster); baking
them once keeps the site fast and makes them look the same in every browser.
"""
import sys, os, io, asyncio, json, shutil
from PIL import Image
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
OUT = os.path.join(SITE, 'media', 'scene')

# name -> (html, scale, [ (file, visible layers, crop or None, opaque, max width) ])
JOBS = {
    'castle': ('castle.html', 2.0, [
        ('castle-set', None, None, True, 2200),
        ('castle-cut', ['L-castle', 'L-front'], (180, 20, 1020, 900), False, 900),
    ]),
    'realm': ('realm.html', 1.4, [
        ('realm-room', ['L-room'], None, True, 2200),
        ('realm-tent', ['L-tent'], None, False, 2200),
        ('realm-curtain-l', ['L-curtain-l'], 'curtainL', False, 900),
        ('realm-curtain-r', ['L-curtain-r'], 'curtainR', False, 900),
        ('realm-ties', ['L-ties'], 'ties', False, 1200),
        ('realm-front', ['L-front'], None, False, 2200),
        ('realm-cut', ['L-tent', 'L-curtain-l', 'L-curtain-r', 'L-front', 'L-floorcut'], 'cut', False, 900),
    ]),
}

def chrome():
    for c in ('/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'):
        if os.path.exists(c): return c
    return None

async def bake(names):
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        exe = chrome()
        b = await p.chromium.launch(executable_path=exe, args=['--no-sandbox']) if exe else await p.chromium.launch()
        for name in names:
            html, scale, outs = JOBS[name]
            ctx = await b.new_context(device_scale_factor=scale, viewport={'width': 1600, 'height': 1000})
            pg = await ctx.new_page()
            await pg.goto('file://' + os.path.join(HERE, 'scenes', html))
            await pg.wait_for_timeout(400)
            info = await pg.evaluate('window.SCENE')
            await pg.set_viewport_size({'width': info['w'], 'height': info['h']})
            for fname, layers, crop, opaque, maxw in outs:
                await pg.evaluate("""(layers) => { document.querySelectorAll('svg > g[id^="L-"]').forEach(g => {
                    g.style.display = (!layers || layers.includes(g.id)) ? '' : 'none'; }); }""", layers)
                await pg.wait_for_timeout(150)
                png = await pg.locator('#s').screenshot(omit_background=not opaque, timeout=120000)
                im = Image.open(io.BytesIO(png))
                if crop:
                    box = info['crops'][crop] if isinstance(crop, str) else crop
                    x, y, w, h = (box if len(box) == 4 and isinstance(crop, str) else (box[0], box[1], box[2] - box[0], box[3] - box[1]))
                    im = im.crop((round(x * scale), round(y * scale), round((x + w) * scale), round((y + h) * scale)))
                im = im.convert('RGB') if opaque else im.convert('RGBA')
                if fname.endswith('-cut'):           # soften the hard edges of a cut-out
                    from PIL import ImageDraw, ImageFilter, ImageChops
                    m = Image.new('L', im.size, 0); d = ImageDraw.Draw(m)
                    d.ellipse((-im.width * 0.12, -im.height * 0.5, im.width * 1.12, im.height * 0.985), fill=255)
                    m = m.filter(ImageFilter.GaussianBlur(im.width * 0.03))
                    im.putalpha(ImageChops.multiply(im.getchannel('A'), m))
                if im.width > maxw: im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
                path = os.path.join(OUT, fname + '.webp')
                im.save(path, 'WEBP', quality=82 if opaque else 86, method=6)
                print('%-18s %5dx%-5d %4d KB' % (fname, im.width, im.height, os.path.getsize(path) // 1024))
            with open(os.path.join(OUT, name + '.json'), 'w') as f: json.dump(info, f)
            await ctx.close()
        await b.close()

if __name__ == '__main__':
    asyncio.run(bake(sys.argv[1:] or list(JOBS)))
