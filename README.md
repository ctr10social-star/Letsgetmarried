# Letsgetmarried-C&P

A single-page, scroll-driven wedding invitation for Priyadarshini & Chirag.
Vanilla HTML/CSS/JS, no build step, no framework, no bundler.

## 1. Deploy to GitHub Pages

1. Create a new repository named **`Letsgetmarried-C-P`** on GitHub (or any
   name you like — see step 5 if you rename it).
2. Push these files to the `main` branch, at the repo root:
   ```bash
   git init
   git add .
   git commit -m "Wedding invitation"
   git branch -M main
   git remote add origin https://github.com/<your-username>/Letsgetmarried-C-P.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Branch: **main**, folder: **/ (root)**. Save.
6. GitHub will publish at `https://<your-username>.github.io/Letsgetmarried-C-P/`
   within a minute or two. The site already uses relative paths, so it
   works correctly from that subpath — no changes needed.

If you rename the repo, nothing in the code has to change — every asset
reference is relative (`assets/...`, `styles.css`, `main.js`), never
absolute from `/`.

### Custom domain (optional — not used here)
1. Add a `CNAME` file at the repo root containing just your domain, e.g.
   `ourwedding.com`.
2. In **Settings → Pages → Custom domain**, enter the same domain and save.
3. Point your domain's DNS `A`/`ALIAS` records at GitHub Pages per
   [GitHub's instructions](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).

## 2. Where each personalized value lives

| What | File | Where |
|---|---|---|
| Names, monogram, hero blessing | `index.html` | `#scene-title` |
| Parents' names (invitation line) | `index.html` | `#scene-kolam` → `.opening-line` |
| Parents' names (blessings panel) | `index.html` | `#scene-blessings` → `.parents-row` |
| Muhurtam date/time/venue/address | `index.html` | `#scene-muhurtam` → `.event-details` |
| Reception date/time/venue/address | `index.html` | `#scene-reception` → `.event-details` |
| Google Maps links | `index.html` | `.maps-link href` in each event card |
| RSVP WhatsApp number & pre-filled text | `index.html` | `#whatsapp-rsvp href` (the `wa.me/<number>?text=...` URL) |
| RSVP-by date | `index.html` | `#scene-rsvp` → `.rsvp-sub` |
| Calendar (.ics) event details | `main.js` | inside `calendarBtn.addEventListener` |
| Colour palette | `styles.css` | `:root` custom properties at the top |
| Fonts | `index.html` `<head>` + `styles.css` `--font-display` / `--font-body` |
| Page title / share preview text | `index.html` `<head>` — `<title>`, `og:title`, `og:description` |
| Share preview image | `assets/og.png` (regenerate if you change the design) |
| Site story copy ("We met by chance"...) | `index.html` → `#scene-climb` → `.vignette` |

## 3. Adding or removing an event scene

Each event is a `<section class="scene scene--event">` containing one
`.event-card`. To add a new one (e.g. a Sangeet):

1. Duplicate the `#scene-muhurtam` block in `index.html`.
2. Give the `<section>` a new `id`, update the motif SVG, heading, and
   the `<dl class="event-details">` fields.
3. Update the `<time datetime="...">` attribute — this keeps the page
   correct for screen readers and calendar exports even with JS off.
4. No JS changes are required: reveal-on-scroll is handled generically
   by the `.reveal` / `.event-card` classes via `IntersectionObserver`.

To remove a scene, delete its `<section>` block. Nothing else references
it by index, so the story simply flows past the remaining scenes.

## 4. Background music

Per the brief, audio ships **off by default** and stays muted until the
visitor taps the sound button. The repo does not include an audio file.
To add one:

1. Drop a licensed MP3 at `assets/temple-bells.mp3` (this exact path is
   already wired up in `main.js`).
2. Keep it short and loop-friendly — it loops automatically once
   unmuted, and also plays once at the gopuram's crown-landing moment.
3. If you use a different filename, update the `audio.src` line near
   the top of the "Mute / unmute" section in `main.js`.

## 5. Structure

```
index.html      → semantic markup + inline SVG art for all 9 scenes
styles.css      → design tokens (palette, type scale), layout, motion library
main.js         → scroll engine (rAF + IntersectionObserver), controls, .ics export
assets/og.png   → 1200×630 share-preview image
404.html        → styled not-found page
.nojekyll       → tells GitHub Pages not to run Jekyll processing
```

## 6. Accessibility & resilience notes

- Works with CSS and JS both disabled: all content is real HTML
  (`h1`/`h2`, `time`, `address`, `dl`) in document order.
- `prefers-reduced-motion` is respected automatically; there's also a
  manual "Reduce motion" toggle in the top-right controls for visitors
  who want to turn it off regardless of their OS setting.
- Skip link jumps straight to the event details for keyboard and
  screen-reader users who don't want to sit through the animated intro.
- All scroll-linked animation reads a single cached `scrollY` inside one
  `requestAnimationFrame` loop, and only ever animates `transform` and
  `opacity` — no per-frame layout thrashing.

## What I'd improve next

- Commission real illustrated artwork for the niche figures and fauna
  (peacock, parrots, squirrel, cow) — the current shapes are simplified
  placeholders that keep the file light and dependency-free, not final
  linework.
- Add a real recorded temple-bell/nadaswaram clip at
  `assets/temple-bells.mp3` (currently absent by design).
- If guest photos are added later, lazy-load them and keep the "under
  1.5 MB excluding photos" budget explicit in a comment near the
  `<img>` tags you add.
- Consider a lightweight serverless RSVP log (e.g. a Google Form linked
  from the WhatsApp fallback) if you want a guest list beyond WhatsApp
  replies.

## >>> EDIT <<<

- **RSVP-by date** (`#scene-rsvp` → `.rsvp-sub`) is set to **15 November
  2026** — a placeholder three weeks before the Muhurtam. Change it to
  whatever date you actually want.
- **Background music file** is not included — see section 4.
- **Dress code** lines on both event cards are my best-guess phrasing
  ("Traditional South Indian attire..." / "Indian formal or evening
  wear...") — replace with your actual guidance if you have one.
