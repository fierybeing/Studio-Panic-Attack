# Studio Panic Attack — website

The portfolio of **Studio Panic Attack** (Ema Nova). Plain HTML, CSS and JavaScript:
**no build step, no framework, no npm install.** Any static host serves this folder
as-is: Cloudflare Pages, Vercel, Netlify, GitHub Pages, or your own server.

Built from three sources:
- **Figma Make "My Projects (Copy)"**: the structure (orbiting home page, Projects
  sidebar + scattered folders, one bespoke layout per category).
- **The Vercel / GitHub site**: the real content, images, event texts and the
  Swiss-knife outline.
- **The Wix site + Padlet notes**: the brief (mono font everywhere, ultramarine,
  Padlet-style Highlights, folder icons, Pinterest-style galleries, the
  Swiss-knife text loop, the Post-it contact form).

## Pages

| Address | What it is |
|---|---|
| `#/` | Home: a sphere of selected works (drag any way to spin, click one for its description). Scroll down for the statement with the 3D knot, four kinds of work with flying pictures and Explore links, featured pieces and a closing invitation. |
| `#/projects` | Ten folders on a desk, with the index on the left |
| `#/projects/events` … `#/projects/marketing` | The ten categories, each with its own layout |
| `#/highlights` | Padlet-style columns of taped photo stacks |
| `#/vocabulary` | The A–Z dictionary (A, B, C so far) |
| `#/about` | Dark opening with the portrait (letters scatter from the cursor, embers drift toward it), then disciplines, places, the knife text loop and the film strip |
| `#/contact` | Post-it contact form |

Click any picture to open it in the viewer (← → to browse, Esc to close).

## Editing content: one file

Everything you would want to change is in **`assets/js/content.js`**: texts,
titles, which images appear where, the home-page descriptions, email, socials,
CV link. You never need to touch the other files.

- **Email / socials:** `site.email`, `site.socials.instagram` etc. Empty ones stay hidden.
- **CV download:** put the PDF at `media/cv.pdf` and set `site.cv: 'media/cv.pdf'`.
- **Contact form straight to your inbox:** get a free key at web3forms.com and paste
  it into `site.web3formsKey`. Without a key, Send opens the visitor's mail app.
- **Images** are referenced by keys like `'gd/pegasus'`, meaning
  `media/gd/pegasus.webp` (large) and `media/gd/pegasus.t.webp` (thumbnail).

## The landing page sections

In `content.js`, under `home`:

- `works`: the pictures in the sphere, each with its description and project link.
- `manifesto`: the big statement beside the knot, and the pictures flying next to it.
- `sections`: the four kinds of work (number, title, text, `link` = project folder,
  and the flying pictures).
- `featured`: the four featured pieces; `outro`: the closing lines.

A flying picture looks like `{ img: 'gd/pegasus', fx: 'halftone', x: 30, y: 0, w: 38, d: 0.5, r: 3 }`:
`fx` is the effect it wears until you hover (`flute` ribbed glass, `halftone` print
dots, `dither` chunky pixels, or leave it out), `x` / `y` / `w` are its position and
width in % of its area, `d` is how fast it flies and `r` its tilt.

After changing an `img` or `fx`, bake the effect files (needs Python with Pillow and numpy):

```sh
python3 tools/make_fx.py
```

## Fonts

Three lines at the top of `assets/css/site.css` set every font on the site:

| Variable | Used for | Font | Licence |
|---|---|---|---|
| `--mono` | labels, headings, the big numbers | Geist Mono | SIL Open Font License (file in `assets/fonts`) |
| `--type` | the menu and running text | Courier Prime (typewriter) | SIL Open Font License (file in `assets/fonts`) |
| `--script` | big handwritten titles | Quiet Attempt | © Struvictory.art. Carried over from the previous site: check that you hold a licence for web use. |

## Adding new images

Run this from the site folder (needs Python with Pillow):

```sh
python3 tools/add_images.py web ~/Desktop/my-screenshot.png
```

It makes `media/web/my-screenshot.webp` plus a thumbnail and prints the key
(`'web/my-screenshot'`) to use in `content.js`. The first word is the group
(folder) name: use an existing one such as `gd`, `3d`, `photo`, `web`, or a new one.

Check that every key in `content.js` points at a real file:

```sh
node tools/check_keys.js .
```

`tools/build_media.py` is the script that converted the whole original library
(images and videos) from the old repo's `public/` folder. You only need it to
redo everything from scratch.

## Preview on your computer

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Publish on Cloudflare Pages (your own domain)

1. Cloudflare dashboard → **Workers & Pages → Create → Pages**.
2. Either **Connect to Git** and pick this repo/branch, or **Upload assets** and drag
   this whole folder in.
3. Build settings: framework **None**, build command **empty**, output directory **`/`**.
4. After the first deploy: **Custom domains → Set up a domain** → type your domain.
   If the domain is already on Cloudflare, the DNS record is added for you.

`_headers` makes Cloudflare cache images and fonts.

## Publish on Vercel

Import the repo. `vercel.json` already says "no build, serve the folder as-is".

## Folder map

```
index.html              the one HTML page
assets/css/site.css     all styling
assets/js/content.js    ← all text + image lists (edit this)
assets/js/core.js       helpers, viewer, router
assets/js/fx.js         everything that moves: grid floor, flying pictures, knot, scattering letters, embers
assets/js/projects.js   Projects page + the ten category layouts
assets/js/pages.js      Home, Highlights, Vocabulary, About, Contact
assets/js/media.js      auto-generated image sizes (don't edit)
assets/js/knife.js      Swiss-knife outline for the text loop
assets/fonts/           Geist Mono (SIL Open Font License)
media/                  optimised images (.webp) and videos (.mp4)
media/fx/               effect versions of the flying pictures (made by tools/make_fx.py)
tools/                  scripts: add images, bake effects, check keys, rebuild media; the Figma cut-outs
```
