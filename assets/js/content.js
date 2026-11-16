/* ════════════════════════════════════════════════════════════════════════
   STUDIO PANIC ATTACK — ALL SITE CONTENT LIVES IN THIS FILE.

   Edit text, titles and image lists here; you never need to touch app.js.
   Images are referenced by "group/name" keys. Each key maps to two files:
       media/<group>/<name>.webp     (large)
       media/<group>/<name>.t.webp   (thumbnail)
   To add new images, drop the originals in the matching source folder and
   re-run tools/build_media.py (see README.md).
   ════════════════════════════════════════════════════════════════════════ */

window.SPA_CONTENT = {

  site: {
    name: 'Studio Panic Attack',
    owner: 'Ema Nova',
    email: 'MayDay@studiopanicattack.com',
    tagline: 'Swiss knife of art & design',
    statement: 'Chaotic space of creativity & multidisciplinary ideas exploring the limits of the human curiosity.',
    year: 2026,
    /* Fill these in to show the links (empty = hidden). */
    socials: { instagram: '', linkedin: '', soundcloud: '', tumblr: '' },
    /* Put your CV at  media/cv.pdf  and set this to 'media/cv.pdf' to show the download button. */
    cv: '',
    /* Optional: a free access key from web3forms.com makes the contact form send
       straight to your inbox. Left empty, the form opens the visitor's mail app. */
    web3formsKey: ''
  },

  nav: [
    { label: 'Home', route: '' },
    { label: 'Projects', route: 'projects' },
    { label: 'Highlights', route: 'highlights' },
    { label: 'Vocabulary', route: 'vocabulary' },
    { label: 'About', route: 'about' },
    { label: 'Contact', route: 'contact' }
  ],

  /* ── HOME: the orbiting cloud of selected works ───────────────────────── */
  home: {
    eyebrow: 'Selected works / 2020—2026',
    sub: 'An orbiting index of images, objects and experiments',
    /* Click an image on the home page to see its description and a link to its project.
       link = the slug of a project folder below (events, installations, ux-ui, graphic-design,
       3d, video-motion, projection, digital-art, photography, marketing). */
    works: [
      { img: 'hl/cemetery-scene20', title: 'Cemetery Scene', category: '3D environment', year: '', link: '3d',
        desc: 'A night-time world lit by chandeliers — an environment I’d like to visit in real life, or in The Sims.' },
      { img: 'hl/glasserrorscrnshot', title: 'Internal HTTP 500 Error', category: 'Poster', year: '', link: 'graphic-design',
        desc: 'Type and inflated 3D letterforms colliding on a poster — design beyond the traditional format.' },
      { img: 'hl/img-3760', title: 'Chrome Ribbon', category: '3D typography', year: '', link: '3d',
        desc: 'A letterform pulled into a soft, liquid ribbon of chrome.' },
      { img: 'hl/holistic-art-mag-vol-0-cover-page', title: 'Holistic Art Magazine', category: 'Editorial', year: '2022', link: 'graphic-design',
        desc: 'Cover of Vol. 0 — a magazine about how art shapes human development. Burgas, Bulgaria × Bergen, Norway.' },
      { img: 'hl/000008390027-26a', title: 'Night Tube', category: 'Photography, 35mm', year: '', link: 'photography',
        desc: 'Shot on an Olympus film camera — candid moments, light and shadow, one frame at a time.' },
      { img: 'hl/img-9754-min', title: 'Pink Structure', category: '3D sculpture', year: '', link: '3d',
        desc: 'An abstract object study — organic and inorganic at the same time.' },
      { img: 'hl/img-3330', title: 'Easy Living', category: 'Poster', year: '', link: 'graphic-design',
        desc: 'Repetition, blackletter and a loud red-and-yellow palette.' },
      { img: 'hl/img-4285', title: 'Three Heads', category: '3D characters', year: '', link: '3d',
        desc: 'Character modelling — giving each face its own look and personality.' },
      { img: 'hl/img-2471', title: 'Chaos', category: 'Digital art', year: '', link: 'digital-art',
        desc: 'Fine art and digital technique combined into one emblem.' },
      { img: 'hl/levelsequence-1-0011', title: 'Overgrown', category: '3D environment', year: '', link: '3d',
        desc: 'High-poly nature with foliage so realistic you’d think it’s a photo.' },
      { img: 'hl/chrome-type-bw-4', title: 'Chrome Type', category: '3D typography', year: '', link: 'graphic-design',
        desc: 'Expressive typography that lives between 2D lettering and 3D objects.' },
      { img: 'hl/img-4269', title: 'Checkerboard TV', category: 'Mixed media', year: '', link: 'graphic-design',
        desc: 'Illustration layered over photography and old screens.' },
      { img: 'hl/untitled5', title: 'Winter Cabin', category: '3D environment', year: '', link: '3d',
        desc: 'A charming low-poly scene, lit for dusk.' },
      { img: 'hl/img-3335', title: 'Ultramarine', category: 'Graphic design', year: '', link: 'graphic-design',
        desc: 'Hand-drawn line work floating on a field of ultramarine.' },
      { img: 'hl/img-9790-min-edited', title: 'Wax Block', category: '3D sculpture', year: '', link: '3d',
        desc: 'A sculpted object with something glowing inside.' },
      { img: 'ev/treasure-hunt', title: 'Gravröset Treasure Hunt', category: 'Events / campaign', year: '', link: 'events',
        desc: 'A treasure-hunt campaign for the festival I co-organise, with tickets and merch as rewards.' },
      { img: 'proj/img-2778', title: 'Dome Projection', category: 'Projection mapping', year: '', link: 'projection',
        desc: 'Turning a space into a landscape where anything is possible.' },
      { img: 'fig/geodome', title: 'Geodome', category: 'Installation', year: '', link: 'installations',
        desc: 'A pink geodesic structure built for a festival environment.' }
    ]
  },

  /* ── PROJECTS: the ten folders ────────────────────────────────────────── */
  categories: [

    /* 1 ─ EVENTS */
    {
      slug: 'events', layout: 'events',
      title: 'Events',
      intro: 'I design experiences that get people to interact — with each other, with a space, or with an idea. Most of my work sits between events, art, and community.',
      events: [
        {
          title: 'Gravröset', tag: 'Festival + events',
          text: ['I co-organise a music festival with a team — shaping the concept, brand identity, activities, marketing, and overall experience.'],
          bullets: [
            'Built a treasure-hunt campaign to drive engagement (tickets + merch as rewards).',
            'Created Post Mortem — a winter event focused on revival, community, and energy during the darker season.',
            'Organised a fundraiser event with artists + produced merch (silkscreen prints, 3D-printed pieces).',
            'Exhibited an interactive sculpture (“Blob”) at the festival as Studio Meteor.',
            'Currently working on a bar collaboration / takeover event.'
          ],
          images: ['ev/treasure-hunt', 'gd/pegasus', 'typo/logo-ema-260305']
        },
        {
          title: 'Rumtiden Idea Lab', tag: 'Events, installations, builds',
          text: [
            'I work hands-on across both events and physical / interactive projects — from early concept to building and setup.',
            'This can mean anything from concept, designing parts in 3D and producing them (3D printing, laser cutting), to wiring and programming with Arduino / Raspberry Pi, to setting up full spatial experiences with light, projection, and analogue tech. I’m usually involved across the whole process: idea → build → install → run.'
          ],
          bullets: [
            'Build and assist on interactive installations (digital + physical).',
            'Work with projection & mapping (Resolume, MadMapper, LEDs, multi-projector setups).',
            'Use analogue tech + experimental setups to create tactile, responsive experiences.',
            'Handle technical setup on-site (projectors, lighting, spatial layout, troubleshooting).'
          ],
          images: ['proj/img-2778']
        },
        {
          title: 'Kulturhuset Cyklopen', tag: 'Community workshops',
          text: ['I design and run hands-on workshops that turn into shared experiences.'],
          bullets: [
            'Paper-mâché workshop in collaboration with Gravröset — sculptures later exhibited at the festival.',
            'Pop-up Christmas-card workshop (simple, social, seasonal).',
            'Volunteered at Open Atelier workshops, and at Cyklopen’s anniversary party.'
          ],
          images: []
        },
        {
          title: 'Fabel + Rumtiden for ICA Innovation', tag: 'KTH Reaktorhallen',
          text: [
            'One of the larger productions I worked on — a full experience built inside KTH’s Reaktorhallen. Guests were brought into an experience.',
            'Entry started with a descent via elevator that played an introduction video, where guests were given capes to shift them into a shared role (once people blend in, they participate more). In the main hall, we ran an initiation ritual: guests received NFC talismans, scanned them, and were sorted into 4 teams. Each group was sent into a different room — each one designed around a specific theme and task. I designed two of the rooms and contributed to the others.',
            'One example: the Curiosity room. Guests sat down with an unlit candle and a “matchbox” with no matches. They drew a tarot card (two decks: light vs more provocative questions). The question triggered a discussion — once it landed, the box revealed a hidden match. They lit the candle — the idea was that curiosity unlocks something.',
            'All rooms followed that kind of logic — simple mechanics, but built to shift behaviour and get people to open up.'
          ],
          bullets: [
            'Dance ritual (“danceoki”) — a projected monk leading movements that everyone followed.',
            'Live organ playing between transitions to control pace and atmosphere.',
            'Costumes, projection, and spatial design used throughout to keep it cohesive.',
            'Structured in phases — guided at first, then more open and social later.'
          ],
          images: []
        },
        {
          title: 'Post Mortem', tag: 'Gravröset afterparty · Dec 2024 · winter event',
          text: [
            'I created the full concept and experience design for Post Mortem, which took place at Reimersholme. The festival normally happens outdoors during summer, so I wanted this event to feel like the opposite side of the same world — colder, darker, but still alive underneath.',
            'The name came from that idea: during winter everything feels dead for a while, and this was meant to feel like one night of revival. Crawling out of the frozen ground to reconnect, dance, and bring back the energy of summer for a few hours.',
            'The goal wasn’t just “a winter party” — it was to make the night feel like you’d teleported to a summer day back on the festival grounds. Something between a gathering, ritual, concert, and underground club night.'
          ],
          bullets: [
            'Full event concept & narrative.',
            'Atmosphere and thematic direction.',
            'Artist curation and lineup identity.',
            'Communication and promotional material.',
            'Spatial feeling and audience experience.',
            'Building a sense of community around the event.'
          ],
          images: ['gd/print-poster-4', 'gd/img-0669', 'gd/artist-frame-2', 'gd/artist-frame-5']
        },
        {
          title: 'And more', tag: 'New Year’s party, release parties, and more',
          text: [],
          bullets: [],
          images: ['ev/img-3380', 'ev/img-2309']
        },
        {
          title: 'Some of my ideas', tag: 'Concepts looking for a home',
          text: [
            'Connection activities — like Bingo with Names, a simple but powerful icebreaker where guests fill out a name card by talking to others. Fast, fun, and perfect for sparking genuine connections, especially at networking events.',
            'Immersive product release — think product meets AR / VR. Visitors explore items physically and virtually, revealing layers of meaning and emotion through motion or spatial sound. Ideal for art shows.',
            'AR interactive adventures — inspired by narrative games. Guests follow a digital “spirit” through a physical space, uncovering clues, stories, experiences, and emotional beats. An AR treasure hunt using QR codes and augmented reality to engage guests in quests — riddles, puzzles, escape-room-inspired missions throughout your venue.',
            'Themed party planning — immersive party themes complete with soundscapes, visuals, and guest interactions. From a fairy-forest-themed music gig with movement-interactive projection mapping, to a retro 1960s bash with a quest, a secret drink prize, personalised badges, a message board and analogue technology.'
          ],
          bullets: [],
          images: ['hl/epicenter-treasure-hunt'],
          cta: 'Want to bring one of these ideas to life — or co-create something wild and new? Let’s talk.'
        }
      ]
    },

    /* 2 ─ INSTALLATIONS */
    {
      slug: 'installations', layout: 'installations',
      title: 'Interactive Installations & Creative Technology',
      heading: ['Installations &', 'Interactive Technology'],
      intro: 'Creating engagement through interactive technology projects that push towards unconventional methods of connection; explore my latest work showcasing dynamic experiences designed to captivate and inspire.',
      index: 'Touchy Photome · Spinny lampshade · Rumigabi · Lasercut zoetrope · Kaleidoscope · Sculpture Coral Platon · Conference Hakan · Prototypes',
      meta: 'Stockholm · 2025',
      /* x / y are % of the canvas, w is % of the canvas width. */
      items: [
        { img: 'fig/lamp', title: 'Spinny lampshade', desc: '', x: 80, y: 1, w: 12, card: 'left' },
        { img: 'fig/geodome', title: 'Geodome', desc: '', x: 22, y: 34, w: 29, card: 'right' },
        { img: 'fig/blob', title: 'Blob', desc: 'Interactive sculpture, exhibited at Gravröset festival as Studio Meteor.', x: 55, y: 33, w: 19, card: 'right' },
        { img: 'fig/tree', title: 'Blue sculpture', desc: '', x: 4, y: 46, w: 12, card: 'right' },
        { img: 'fig/screen', title: 'Music displays at DICE / EA', desc: '', x: 27, y: 73, w: 32, card: 'right' },
        { img: 'fig/sign', title: 'Bar Rosa scen — festival signage', desc: '', x: 84, y: 36, w: 12, card: 'left' },
        { img: 'imt/img-9639', title: 'Forest, red light', desc: '', x: 64, y: 67, w: 14, card: 'left', photo: true }
      ]
    },

    /* 3 ─ UX/UI */
    {
      slug: 'ux-ui', layout: 'uxui',
      title: 'UX/UI & Digital Products',
      intro: 'Digital experiences and products that combine strategy, interaction and visual design. From research to prototype to final product.',
      body: [
        'A collection of dynamic website prototypes crafted using platforms like Figma, Wix, WordPress, Elementor, and Adobe Dreamweaver. Each project is meticulously designed to deliver intuitive user experiences and visually stunning interfaces.',
        'I specialise in creating websites with interactive elements, leveraging visual coding techniques to incorporate motion graphics seamlessly. From subtle animations to bold transitions, every interaction is carefully crafted to enhance user engagement and elevate the browsing experience.',
        'Innovative approaches like integrating 3D models into websites add depth and immersion, pushing the boundaries of traditional web design.'
      ],
      items: [
        { img: 'ux/skjermbilde-2024-05-19-191532', title: 'Epicenter Stockholm — Home', meta: '2024 / Website' },
        { img: 'ux/skjermbilde-2024-05-19-191908', title: 'Epicenter Stockholm — Our story', meta: '2024 / Website' },
        { img: 'ux/skjermbilde-2024-05-19-192023', title: 'Epicenter Stockholm — Clusters', meta: '2024 / Website' },
        { img: 'ux/skjermbilde-2024-05-19-192201', title: 'Epicenter Stockholm — The month’s events', meta: '2024 / Website' },
        { img: 'ux/skjermbilde-2024-05-19-192042', title: 'Epicenter Stockholm — Story, detail', meta: '2024 / Website' },
        { img: 'hl/epicenter-treasure-hunt', title: 'Epicenter Treasure Hunt', meta: 'Concept / Web app + AR' }
      ],
      facts: [
        ['Tools', 'Figma, Wix, WordPress, Elementor, Adobe Dreamweaver'],
        ['Focus', 'Interaction, motion, 3D on the web']
      ]
    },

    /* 4 ─ GRAPHIC DESIGN */
    {
      slug: 'graphic-design', layout: 'columns',
      title: 'Graphic Design & Visual Identity',
      heading: ['Graphic', 'Design &', 'Identity'],
      eyebrow: 'Selected projects',
      hint: 'Scroll sideways to read each project as a complete system.',
      columns: [
        {
          name: 'Gravröset', kind: 'Festival identity', year: '2023—',
          summary: 'Identity, posters and social content for the music festival I co-organise — from the hand-drawn wordmark to lineup posters, artist frames and the Post Mortem winter edition.',
          scope: 'Logotype / Posters / Social media / Print / Merch',
          images: ['gd/artboard-6', 'gd/print-poster-4', 'gd/artist-frame-1', 'gd/artist-frame-2', 'gd/artist-frame-3', 'gd/artist-frame-4', 'gd/artist-frame-5', 'gd/pegasus', 'gd/img-0669', 'typo/logo-ema-260305', 'gd/paper-portfolio-journal-9']
        },
        {
          name: 'Posters & print', kind: 'Posters, mock-ups, experiments', year: '',
          summary: 'A diverse collection of graphic design projects. Each piece showcases a unique blend of renowned and niche styles, reflecting my experimentation and versatility in graphic design.',
          scope: 'Photoshop / Illustrator / InDesign / Procreate / Figma / ASCII / Nomad Sculpt',
          images: ['gd/glasserrorscrnshot', 'gd/img-3330', 'gd/img-3335', 'gd/img-9247', 'gd/img-9089', 'gd/img-3371', 'gd/img-4269-1', 'gd/img-4258', 'gd/img-4263']
        },
        {
          name: 'Typography', kind: 'Letterforms, 2D and 3D', year: '',
          summary: 'Expressive typography, spanning both 3D and 2D dimensions. From graphic and sophisticated letterforms to dynamic three-dimensional compositions, my typography explores the intersection of art and design.',
          scope: 'Photoshop / Illustrator / Procreate / Maya / Blender / Nomad Sculpt',
          images: ['typo/img-1032', 'typo/chrome-type-bw-4', 'typo/img-3762', 'typo/img-3763', 'typo/img-8930', 'typo/img-8967', 'typo/img-8971', 'typo/img-8974', 'typo/img-8976-1', 'typo/img-8977', 'typo/img-8926', 'typo/img-3759', 'typo/img-3761', 'typo/img-3764']
        },
        {
          name: 'Holistic Art Magazine', kind: 'Magazine · Burgas, Bulgaria × Bergen, Norway', year: 'Aug 2022',
          summary: 'Holistic comes to provide you with knowledge and visual understanding of how art is an inseparable part of the many processes of human development and evolution. Each volume is dedicated to a new topic that explains trends and movements, their roots and contributions — a journal of time.',
          scope: 'Art direction / Editorial design / Typography',
          images: ['hl/holistic-art-mag-vol-0-cover-page', 'hl/img-3327', 'hol/holistic-letter-from-the-editor-3d-article', 'hol/holistic-letter-from-the-editor-3d-article2', 'typo/img-1027']
        },
        {
          name: 'Product & brand', kind: 'Product design & brand identity', year: '',
          summary: 'Anything from 3D concept design mockups, to store interior design.',
          scope: '3D mock-ups / Sketches / Packaging / Merch',
          images: ['prod/jolly-smile-design', 'prod/jolly-smile-design-2', 'prod/paper-portfolio-journal-3']
        }
      ]
    },

    /* 5 ─ 3D */
    {
      slug: '3d', layout: 'threed',
      title: '3D, Product Design & Game Assets',
      heading: '3D & Product',
      sub: 'Objects / Worlds / Game assets',
      intro: 'A diverse collection of 3D models crafted using Autodesk Maya, Blender, Unreal Engine 5, ZBrush, Daz, Unity, Cinema 4D, After Effects, and Nomad Sculpt — everything from high-poly nature environments with foliage so realistic you’d think it’s a photo, to charming low-poly scenes.',
      rows: [
        {
          title: 'Cemetery Scene', kind: 'Environment', what: 'Night-time world, lit by chandeliers',
          text: 'I love crafting environments I’d like to visit in real life or see in The Sims. Who needs a camera when you have Blender?',
          images: ['3d/cemetery-scene20', '3d/cemetery-scene1', '3d/cemetery-scene2', '3d/cemetery-scene16', '3d/cemetery-scene18', '3d/cemetery-scene18-3', '3d/cemetery-scene32-2', '3d/arc2-1']
        },
        {
          title: 'Chrome Type', kind: '3D lettering', what: 'Sculpted, liquid and chrome letterforms',
          text: 'Dynamic three-dimensional compositions where type becomes an object.',
          images: ['3d/img-3760', '3d/chrome-type-3d-15', '3d/chrome-type-bw-4', '3d/img-3759', '3d/img-3761', '3d/img-8930', '3d/img-8926', '3d/img-8967', '3d/img-8971', '3d/img-8974', '3d/img-8976-1', '3d/img-8977', '3d/img-3764', '3d/img-8105', '3d/img-9712-min']
        },
        {
          title: 'Sculptural forms', kind: 'Object studies', what: 'Abstract organic and inorganic objects',
          text: 'Whether organic or inorganic, I enjoy the challenge and creativity involved in bringing each object to life.',
          images: ['3d/img-9754-min', '3d/img-9790-min', '3d/img-9791-min', '3d/img-9793-min', '3d/img-9748-min', '3d/img-9794-min', '3d/img-9796-min', '3d/img-9800-min', '3d/img-9826-min', '3d/img-9805-min', '3d/img-1033', '3d/img-1034', '3d/img-4281']
        },
        {
          title: 'Characters', kind: 'Character modelling', what: 'Heads, bodies and topology',
          text: 'Creating characters and bringing them to life with unique looks and personalities is one of my passions.',
          images: ['3d/img-4285', '3d/img-4270', '3d/img-4276', '3d/img-4279', '3d/g1', '3d/g2', '3d/g3', '3d/gal4', '3d/gal5', '3d/gal1', '3d/gal2', '3d/gal3']
        },
        {
          title: 'Worlds', kind: 'Environments & game assets', what: 'High-poly nature, low-poly scenes',
          text: '3D modeling allows me to bring my ideas to life like nothing else. I relish in creating my own worlds and sharing them with others.',
          images: ['3d/levelsequence-1-0011', '3d/untitled5', '3d/seashack', '3d/buildings1copy', '3d/skjermbilde-2024-05-07-011311', '3d/skjermbilde-2024-05-07-011443', '3d/skjermbilde-2024-05-07-011643', '3d/matalowpoly1', '3d/litnei', '3d/rustycementt', '3d/grassmesh', '3d/underwater13', '3d/underwater7']
        },
        {
          title: 'Jolly Smile', kind: 'Product design', what: 'Packaging and product mock-ups',
          text: 'Anything from 3D concept design mockups, to store interior design.',
          images: ['3d/jolly-smile-design', '3d/jolly-smile-design-2']
        }
      ],
      sims: {
        title: 'Sims custom content',
        text: 'As the world’s biggest fan of Sims, I’ve dedicated myself to crafting custom content for Sims 2, 3, and 4, breathing new life into virtual worlds and enriching gameplay experiences for fellow enthusiasts. From clothing and accessories to furniture and architectural elements, each piece is infused with love, care, and an intimate understanding of the game’s community and culture.'
      }
    },

    /* 6 ─ VIDEO & MOTION */
    {
      slug: 'video-motion', layout: 'video',
      title: 'Video & Motion',
      intro: 'Captivating motion graphics, 2D and 3D animations, and engaging videos I’ve created or captured.',
      videos: [
        { video: 'a-letter', title: 'A letter…', kind: '3D animation' },
        { video: 'animewater', title: 'Animewater', kind: 'Motion' },
        { video: 'the-lovers-i', title: 'The Lovers I', kind: 'Loop' },
        { video: 'done-downloaded-from-ig', title: 'Done', kind: 'Video' },
        { video: 'epic-motion', title: 'Epic motion', kind: 'Motion graphics' }
      ]
    },

    /* 7 ─ PROJECTION */
    {
      slug: 'projection', layout: 'projection',
      title: 'Projection, VJ & Light',
      intro: 'Bringing visions to life by projecting them into reality. Projection mapping allows me to convert a space into a magical landscape where everything is possible — a dragon coming out the wall, a waterfall, nothing is beyond limits. Makes it possible to convert a 3D environment into a staged scene in real life.',
      meta: '2021 — present · London, Stockholm, Berlin, Burgas, and more',
      items: [
        { video: 'img-2766', title: 'Dome, take 1' },
        { video: 'img-2765', title: 'Dome, take 2' },
        { video: 'img-2767', title: 'Dome, take 3' },
        { img: 'proj/img-2776', title: 'Dome, still 1' },
        { video: 'img-2769-1', title: 'Dome, take 4' },
        { video: 'img-2781', title: 'Dome, take 5' },
        { img: 'proj/img-2778', title: 'Dome, still 2' },
        { video: 'img-2769', title: 'Dome, take 6' },
        { video: 'img-2771', title: 'Dome, take 7' },
        { video: 'img-2780', title: 'Dome, take 8' }
      ]
    },

    /* 8 ─ DIGITAL ART */
    {
      slug: 'digital-art', layout: 'digital',
      title: 'Digital Art & Experiments',
      intro: 'Experimental media that blends fine art, sketching, photography, graffiti and 3D modelling — traditional technique combined with digital tools.',
      field: ['da/img-2471', 'da/img-4308', 'da/img-4265', 'da/img-4297', 'da/img-4304', 'da/img-4303', 'da/img-4307', 'da/img-4298', 'da/img-4316', 'da/img-4311', 'da/img-4296', 'da/img-4312', 'da/img-4288', 'da/img-4305', 'da/img-4313', 'da/img-4299', 'da/img-4294', 'da/img-4306', 'da/img-4301', 'da/img-4287', 'da/img-4317'],
      fieldNote: 'Studies pinned to a dot field. Drag them around.',
      stackTitle: 'AI & experiments',
      stackText: 'Generative tools as a sketchbook: Krea, Adobe Firefly, DALL-E, Midjourney, Pika, Magnific and more — blended with my graphic design practice. And trying different mediums, whether it’s crayons, a camera, a printer, or a bottle of ketchup.',
      stack: ['ai/fakt-org', 'ai/metttfcoral', 'ai/firefly-inflated-puffy-shapes-made-of-white-soft', 'exp/bralala2']
    },

    /* 9 ─ PHOTOGRAPHY */
    {
      slug: 'photography', layout: 'photography',
      title: 'Photography',
      intro: 'A world captured through the lens of an Olympus film camera and a Nikon D3000. From candid snapshots to carefully composed scenes — the play of light and shadow, the intimacy of human connections, moments frozen in time, one frame at a time.',
      photos: ['photo/000008390027-26a', 'photo/img-4238', 'photo/000008390021-20a', 'photo/000008390032-31a', 'photo/img-4145', 'photo/000008390034-33a-copy-2', 'photo/aa020a', 'photo/img-4239', 'photo/000008390023-22a', 'photo/000008390035-34a']
    },

    /* 10 ─ MARKETING */
    {
      slug: 'marketing', layout: 'marketing',
      title: 'Marketing Campaigns, SoMe & Communication',
      intro: 'Companies I’d love to work with, and companies I’ve worked with.',
      projects: [
        {
          name: 'Gravröset', year: '', tags: ['Campaign', 'Social', 'Print'],
          cards: [
            { img: 'mkt/paper-portfolio-journal-9', caption: 'Social media content + print design' },
            { text: 'Built a treasure-hunt campaign to drive engagement — tickets and merch as rewards.' },
            { img: 'ev/treasure-hunt', caption: 'Treasure hunt map' },
            { img: 'gd/img-0669', caption: 'Poster in the wild' },
            { img: 'gd/pegasus', caption: 'Lineup announcement' }
          ]
        },
        {
          name: 'FAKT', year: '', tags: ['Social', 'Magazine', 'Product'],
          cards: [
            { img: 'mkt/paper-portfolio-journal-3', caption: 'Social media, magazine, merch and product design' },
            { img: 'ai/fakt-org', caption: 'Key visual' },
            { img: 'ai/metttfcoral', caption: 'Key visual, coral' },
            { img: 'typo/img-3763', caption: 'Wordmark, chrome' }
          ]
        },
        {
          name: 'Scan me!', year: '', tags: ['Poster', 'QR', 'Guerrilla'],
          cards: [
            { img: 'mkt/img-2834', caption: '“Scan me! I promise I’m not a virus”' },
            { text: 'Connection first: campaigns that start with a small, curious interaction.' },
            { img: 'ev/img-3380', caption: 'Love Affair — Epicenter Stockholm' }
          ]
        }
      ]
    }
  ],

  /* ── HIGHLIGHTS: Padlet-style board of photo stacks ───────────────────── */
  highlights: {
    title: 'Some of my work…',
    intro: 'Some of my favourite pieces that I’ve created so far, as a multidisciplinary artist.',
    columns: [
      {
        name: '3D worlds',
        stacks: [
          { label: 'Cemetery Scene', category: '3D environment', text: 'A night-time world lit by chandeliers. I love crafting environments I’d like to visit in real life or see in The Sims.', images: ['hl/cemetery-scene20', '3d/cemetery-scene1', '3d/cemetery-scene32-2'] },
          { label: 'Overgrown', category: '3D environment', text: 'High-poly nature with foliage so realistic you’d think it’s a photo.', images: ['hl/levelsequence-1-0011', '3d/skjermbilde-2024-05-07-011311'] },
          { label: 'Winter cabin', category: '3D environment', text: 'A charming low-poly scene.', images: ['hl/untitled5'] }
        ]
      },
      {
        name: 'Objects',
        stacks: [
          { label: 'Sculptural forms', category: '3D sculpture', text: 'Whether organic or inorganic, I enjoy the challenge and creativity involved in bringing each object to life.', images: ['hl/img-9754-min', 'hl/img-9790-min-edited', 'hl/img-9791-min'] },
          { label: 'Three heads', category: '3D characters', text: 'Creating characters and bringing them to life with unique looks and personalities is one of my passions.', images: ['hl/img-4285', '3d/img-4276'] },
          { label: 'Chrome Type', category: '3D typography', text: 'Expressive typography, spanning both 3D and 2D dimensions.', images: ['hl/chrome-type-bw-4', 'hl/img-3760', 'hl/img-9089'] }
        ]
      },
      {
        name: 'Graphic',
        stacks: [
          { label: 'Internal HTTP 500 Error', category: 'Poster', text: 'Design beyond the traditional format.', images: ['hl/glasserrorscrnshot'] },
          { label: 'Easy Living', category: 'Poster', text: '', images: ['hl/img-3330', 'hl/img-3335'] },
          { label: 'Holistic Art Magazine', category: 'Editorial · Aug 2022', text: 'A magazine with a unique purpose — a journal of time. Burgas, Bulgaria × Bergen, Norway.', images: ['hl/holistic-art-mag-vol-0-cover-page', 'hl/img-3327', 'hl/hp2-1'] }
        ]
      },
      {
        name: 'Art & film',
        stacks: [
          { label: '35mm', category: 'Photography, film', text: 'A world captured through the lens of an Olympus film camera.', images: ['hl/000008390027-26a', 'photo/000008390035-34a', 'photo/000008390034-33a-copy-2'] },
          { label: 'Chaos', category: 'Digital art', text: '', images: ['hl/img-2471'] },
          { label: 'Stupid games, bad ideas', category: 'Mixed media', text: 'Photography drawn over, cut out and re-staged.', images: ['hl/img-4258', 'hl/img-4263', 'hl/img-4269'] }
        ]
      },
      {
        name: 'Events',
        stacks: [
          { label: 'Gravröset Treasure Hunt', category: 'Campaign', text: 'A treasure-hunt campaign to drive engagement, with tickets and merch as rewards.', images: ['ev/treasure-hunt', 'hl/epicenter-treasure-hunt'] },
          { label: 'Post Mortem', category: 'Winter event · Dec 2024', text: 'Colder, darker, but still alive underneath — one night of revival at Reimersholme.', images: ['gd/print-poster-4', 'gd/artist-frame-1', 'gd/img-0669'] }
        ]
      }
    ]
  },

  /* ── VOCABULARY ───────────────────────────────────────────────────────── */
  vocabulary: {
    title: 'Vocabulary',
    intro: 'A small dictionary of the words and shapes that keep coming back in my work. Read it like a moodboard — by letter, by image, or by the thing that catches your eye.',
    entries: [
      { letter: 'A', word: 'Aesthetic', img: 'vocab/firefly-inflated-puffy-shapes-made-of-white-soft', def: 'Soft, inflated, slightly off — the cotton-cloud language. Forms that look pinched-by-hand, that feel like they’d give if you squeezed them.' },
      { letter: 'B', word: 'Bloom', img: 'vocab/letter-b', def: 'A controlled overgrowth — letters, plants and ideas that spread out beyond their frame and almost spill onto the next thing.' },
      { letter: 'C', word: 'Curiosity', img: 'vocab/letter-c', def: 'Built into every project as a mechanic. Hide a match in a box. Put a question on a card. Let people unlock the next bit themselves.' }
    ],
    outro: 'More entries coming. The dictionary keeps growing — just like the practice.'
  },

  /* ── ABOUT ────────────────────────────────────────────────────────────── */
  about: {
    title: 'About',
    sub: 'Welcome to my universe',
    body: [
      'I’m a Stockholm-based designer working across events, graphic design, 3D, interactive media and the occasional weird experiment that doesn’t fit anywhere else. Studio Panic Attack is the umbrella for it all — a playground for visual systems, immersive nights and things that get people talking to each other.',
      'I like working hands-on, from concept and 3D to wiring up sensors, running projection mapping or printing posters. I care about how an idea actually feels in a room, not just on a screen.'
    ],
    disciplines: ['Events', 'Graphic design', '3D', 'Interactive media', 'Projection & VJ', 'UX/UI', 'Photography', 'Typography'],
    places: ['Stockholm', 'London', 'Berlin', 'Burgas', 'Bergen']
  },

  /* ── CONTACT ──────────────────────────────────────────────────────────── */
  contact: {
    title: 'Let’s talk.',
    intro: 'Got an idea, a project, an event you want to make weirder? Drop it on the Post-it. I read everything.'
  }
};
