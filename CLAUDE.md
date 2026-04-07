# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static HTML/CSS/JS website for Restaurant Daphne, a Greek/Mediterranean restaurant in Bremen, Germany. No build tools, no framework, no package manager — files are served directly.

## Development

Open `index.html` in a browser, or serve the root directory with any static file server:

```bash
python -m http.server 8080
# or
npx serve .
```

There is no build step, no linting config, and no test suite.

## Architecture

### Files
- `index.html` — single-page site with anchor-based navigation (`#home`, `#about`, `#menu`, `#gallery`, `#contact`)
- `impressum.html` / `datenschutz.html` — standalone legal pages
- `css/style.css` — all styles, dark-themed with Greek aesthetics (CSS variables defined at top of file)
- `js/script.js` — all interactivity, runs inside a single `DOMContentLoaded` listener

### Key JS Sections in `script.js`
1. **Mobile nav toggle** — hamburger menu, closes on link click
2. **Scroll effects** — navbar `scrolled` class + sticky reservation bar visibility
3. **Active nav highlighting** — both top navbar and mobile bottom nav tab bar
4. **Gallery slider** — manual prev/next, dot navigation, touch/swipe, auto-advance every 5s
5. **Hero background slider** — separate auto-rotating background images every 6s
6. **Scroll-to-top button** — appears after 500px scroll
7. **Fade-in animations** — `IntersectionObserver` adds `.is-visible` to `.fade-in-section` elements
8. **Menu modals** — clicking a `.menu-cat-card` opens a modal populated from the `menuData` object (includes keyboard trap and Escape-to-close)
9. **Opening hours status** — `updateOpeningStatus()` runs on load and every 60s; computes open/closed state from current time

### Menu Data
All menu items are hardcoded in the `menuData` object in `js/script.js` (around line 241). Each key matches a `data-category` attribute on a `.menu-cat-card` in `index.html`. To add or update menu items, edit both the JS object and optionally the card description text in `index.html`.

### Opening Hours Logic
Hours are hardcoded in `updateOpeningStatus()` in `script.js`:
- Mon–Sat: 17:30–23:00
- Sun: 12:00–14:30

If hours change, update both the JS time comparisons **and** the visible text in the `.opening-hours-list` in `index.html`.

### CSS Variables
All design tokens (colors, fonts, shadows, transitions) are defined as CSS custom properties at the top of `style.css`. Primary palette: `--clr-azure` (Greek sea blue), `--clr-gold` (accent gold), dark backgrounds.

### External Dependencies (CDN, no local copy)
- Google Fonts: Playfair Display + Outfit
- Font Awesome 6.4.0
