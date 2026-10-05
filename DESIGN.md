# Design: Outbound Operators

The client supplied their own design for this customer-facing site on 2026-10-05, as a
static HTML mock titled "EasyCRM API Documentation" carrying the **OUTBOUND OPERATORS**
wordmark. `src/css/custom.css` applies it to Docusaurus; this file records what the mock
specified so a future change can be checked against it without the mock to hand.

## Tokens

| Token | Light | Dark |
|---|---|---|
| black (ink, hero, active nav, code background) | `#090608` | page background |
| blue (primary, links, list markers) | `#4c6cf8` (links `#3d5ef0`) | links `#8aa0fb` |
| lime (accent: active dot, code labels, crumbs, GET pill, warning bar) | `#caf659` | same |
| soft surface | `#f0f0f0` / `#f7f7f7` | `#151216` / `#100d11` |
| muted text | `#55525a` | `#a8a5ab` |
| rule / border | `#e3e3e6` | `#2a262b` |
| note callout | `#eef1fe` background, blue bar | `#141a33` |

## Type

- Headings and UI: **Montserrat** 300/400/500/600/700. The wordmark is weight 300, letter-spaced.
- Body: **Open Sans** 300/400/600 at 17px, line height 1.65.
- Code: system monospace at 14px, line height 1.7.

Both fonts are self-hosted via `@fontsource/montserrat` and `@fontsource/open-sans`. The mock
loaded them from Google Fonts, which this site deliberately does not do (no third-party requests).

## Structure the mock asked for

- Top bar 68px: ring mark, two-line wordmark `OUTBOUND / OPERATORS`, a thin divider, then
  `EasyCRM API Documentation`; nav links right-aligned; theme toggle in a bordered square.
- Sidebar 272px; active item is a black pill with a lime dot (blue pill in dark mode).
- Every page opens with a **black hero**: lime breadcrumbs, 46px title, faint ring mark on the
  right, 22px rounded bottom corners.
- Code blocks: black card, 14px radius, lime language label; keys blue, strings lime, numbers white.
- Tables inside a 14px rounded frame with a quiet grey header row.
- Callouts: note is a soft blue card with a blue bar; warning is a black card with a lime bar.
- Footer centred: "EasyCRM API Documentation - last built <year>".
- Endpoint pages: `GET` pill in lime on black; version badge in lime.

## Known gaps versus the mock

- The hero is built from the breadcrumbs bar plus the page's first `h1`. A lead paragraph inside
  the hero (the mock's `.lead`) would need the `DocItem/Layout` theme component swizzled.
- The mock's screenshots are placeholders; none are shipped here.
