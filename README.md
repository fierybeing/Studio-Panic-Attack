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
| `#/` | Home: an orbit of selected works. Click one for its description and a link to its project. Drag to spin. |
| `#/projects` | Ten folders on a desk, with the index on the left |
| `#/projects/events` … `#/projects/marketing` | The ten categories, each with its own layout |
| `#/highlights` | Padlet-style columns of taped photo stacks |
| `#/vocabulary` | The A–Z dictionary (A, B, C so far) |
| `#/about` | About, disciplines, places, the knife text loop, the film strip |
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

## Adding new images or videos

1. Put the originals in the source folders of the old repo (`public/2. Projects/…`),
   or add a folder to `GROUPS` in `tools/build_media.py`.
2. Run (needs Python with Pillow, plus ffmpeg for video):
   `python3 tools/build_media.py <old-repo>/public tools/figma-cutouts .`
3. Use the new keys in `content.js`.
4. Check every key resolves: `node tools/check_keys.js .`

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
assets/js/projects.js   Projects page + the ten category layouts
assets/js/pages.js      Home, Highlights, Vocabulary, About, Contact
assets/js/media.js      auto-generated image sizes (don't edit)
assets/js/knife.js      Swiss-knife outline for the text loop
assets/fonts/           Geist Mono (SIL Open Font License)
media/                  optimised images (.webp) and videos (.mp4)
tools/                  scripts to rebuild media + the Figma cut-outs
```
