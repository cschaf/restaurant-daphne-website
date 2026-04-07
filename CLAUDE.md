# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static HTML/CSS/JS website for Restaurant Daphne, a Greek/Mediterranean restaurant in Bremen, Germany. No build tools, no framework, no package manager — files are served directly.

## Deployment

Die Seite wird automatisch via GitHub Actions auf GitHub Pages deployed (`.github/workflows/deploy.yml`). Jeder Push auf `main` löst ein neues Deployment aus.

**GitHub Pages Kompatibilität ist Pflicht.** Das bedeutet:
- Keine serverseitigen Skripte (PHP, Node.js, etc.)
- Keine relativen Pfade mit führendem `/` — stattdessen relative Pfade verwenden (`assets/images/foo.jpg` statt `/assets/images/foo.jpg`), da die Seite unter einem Unterverzeichnis-Pfad laufen kann
- Keine Build-Tools einführen ohne den Workflow entsprechend anzupassen

Die Seite ist nach Aktivierung erreichbar unter: `https://cschaf.github.io/restaurant-daphne-website/`

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

## Design System

Alle Design-Tokens sind als CSS Custom Properties am Anfang von `css/style.css` definiert. **Immer diese Variablen verwenden — niemals Hex-Werte direkt im HTML oder CSS hardcoden.**

### Farben

| Variable | Wert | Verwendung |
|---|---|---|
| `--clr-azure` | `#004b87` | Primärfarbe (Griechisches Meeresblau), Buttons, Akzente |
| `--clr-azure-light` | `#0066b8` | Hover-Zustände auf blauen Elementen |
| `--clr-gold` | `#D4AF37` | Zweite Akzentfarbe, Überschriften-Highlights, Icons |
| `--clr-gold-light` | `#f5d76e` | Hover-Zustände auf goldenen Elementen |
| `--clr-white` | `#ffffff` | Reines Weiß |
| `--clr-bg-dark` | `#0f172a` | Haupt-Sektionshintergrund (dunkles Blauschwarz) |
| `--clr-bg-inner` | `#111111` | Hintergrund für Karten und Container-Boxen |
| `--clr-text-main` | `#f8fafc` | Primärer Fließtext (hell auf dunklem Hintergrund) |
| `--clr-text-light` | `#94a3b8` | Sekundärer Text, Beschreibungen, Hinweise |

### Typografie

| Variable | Wert | Verwendung |
|---|---|---|
| `--font-heading` | `'Playfair Display', serif` | Alle Überschriften (`h1`–`h6`) |
| `--font-body` | `'Outfit', sans-serif` | Fließtext, Navigation, Buttons, Labels |

- Überschriften: `font-weight: 600`, `line-height: 1.2`
- Fließtext: `font-size: 16px` (Basis), `line-height: 1.6`

### Layout

| Variable | Wert |
|---|---|
| `--max-width` | `1200px` (maximale Container-Breite) |
| `--header-height` | `80px` |

### Schatten

| Variable | Wert |
|---|---|
| `--shadow-sm` | `0 2px 4px rgba(0,0,0,0.05)` |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` |

### Transitions

| Variable | Wert |
|---|---|
| `--transition-fast` | `0.2s ease` |
| `--transition-norm` | `0.3s ease` |
| `--transition-slow` | `0.5s ease` |

### Externe Abhängigkeiten (CDN, keine lokale Kopie)
- Google Fonts: Playfair Display + Outfit
- Font Awesome 6.4.0

## Qualitätsregeln

Diese Regeln wurden aus vergangenen Issues abgeleitet und müssen bei jeder Änderung eingehalten werden.

### Accessibility (WCAG 2.1 AA)
- **Focus-Visible**: `:focus-visible` ist global mit `outline: 2px solid var(--clr-gold)` definiert. Neue interaktive Elemente dürfen diesen Stil nicht überschreiben (`outline: none` ist verboten).
- **prefers-reduced-motion**: Neue CSS-Animationen/Transitions müssen im `@media (prefers-reduced-motion: reduce)`-Block am Ende von `css/style.css` deaktiviert werden. Neue JS-Intervalle (Auto-Slides etc.) dürfen nur starten, wenn `!prefersReducedMotion`.
- **Semantisches HTML**: Klickbare Elemente müssen `<button>` oder `<a>` sein — keine Click-Handler auf `<div>`/`<span>`. Ausnahme: Wenn ein `<div>` interaktiv sein muss, braucht es `role="button"` und `tabindex="0"` sowie einen `keydown`-Handler für Enter/Space.
- **ARIA**: Dekorative Icons bekommen `aria-hidden="true"`. Buttons mit Toggle-Zustand brauchen `aria-expanded`. `<iframe>`-Elemente brauchen ein `title`-Attribut. Bilder in verlinkten Elementen brauchen beschreibendes `alt`.

### Mobile / Touch
- **Mindest-Tappfläche 44px**: Kleine visuelle Elemente (Dots, Icons) dürfen die Tappfläche per `::after { inset: -16px }` vergrößern, ohne das visuelle Design zu verändern.
- **Safe Area (iPhone Notch)**: Elemente, die am unteren Rand fixiert sind (`position: fixed; bottom: ...`), müssen `env(safe-area-inset-bottom)` berücksichtigen: `bottom: calc(Xpx + env(safe-area-inset-bottom))`.

### Performance
- **Hero-Bild Preload**: Das erste sichtbare Hero-Hintergrundbild ist per `<link rel="preload" as="image">` vorgeladen. Wird das Bild gewechselt, muss auch der Preload-Link aktualisiert werden.
- **Intervalle pausieren**: Auto-Slide-Intervalle laufen nicht im Hintergrund. Der `visibilitychange`-Listener in `js/script.js` pausiert und startet sie. Neue Intervalle müssen dort ebenfalls registriert werden.

### Code-Qualität
- **Keine Inline-Styles**: Farben, Abstände und andere Design-Werte gehören in CSS-Klassen oder CSS-Variablen — nicht als `style="..."`-Attribut im HTML.
- **Button-Hierarchie**: Die primäre CTA ("Tisch reservieren") ist visuell dominanter als sekundäre Aktionen. Neue Buttons müssen dieser Hierarchie folgen (`.btn-primary` > `.btn-secondary` / `.btn-outline-gold`).
- **Animationsdauer**: Scroll- und Erscheinen-Animationen liegen im Bereich 150–400ms. Neue Animationen nicht länger als `0.4s` setzen.
