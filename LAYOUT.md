# Depot Tool Superstore — release notes

**Depot Tool Superstore** (package `depot-tool-superstore`) is a Layout of the Selldone shop **Toolino** (xapi `toolino-Nz2AovCw`), built for **depot.selldone.shop**. It is a skin of the Layout base (see [`BASE.md`](BASE.md)): everything that makes it this Layout is `skins/depot/skin.json` and `skins/depot/photos/`; the code, the flows and the checks are the base's.

## Setup

| Area | What is set |
| --- | --- |
| Repo | `depot-layout`, branch `main`; remote `upstream` (selldone/storefront, fetch only, push disabled); `origin` = `selldone-custom-layouts/official-depot` once published (`scripts/publish-github.sh`) |
| Names | `manifest.json` and `selldone-layout.json` from the skin (`package` is permanent after the first upload; the `description` must be right on the FIRST upload, Selldone keeps it) |
| Dev server | port **9179**, shop `toolino-Nz2AovCw` (`.env`); `npm run serve` (launch entry `depot-layout`) |
| Skin | Signal red, Charcoal, Cobalt, Pine (brand `signal`), Barlow Condensed over Barlow, radius 10 / 6 px, basket word "cart" |
| Layout id | (after the first upload) |

## Home

1. **hero** (split): The shop's name and line on the left; the counter photo bleeding to the right edge of the frame, a framed inset across the seam with the best seller, the three most-ordered collections set large on the photo's dark corner (from Pralino).
2. **collections** (cards): The same four as a 2 × 2 grid of cards, the photo on top inside the card (Domino).
3. **journal** (photo, tint band): The four newest posts beside a tall photo with the big word 'Journal' (from Pralino; best last).

## Photos

| Slot | File | Size | In the build |
| --- | --- | --- | --- |
| hero | `skins/depot/photos/hero.webp` | 2400 × 1029 | yes |
| hero-sq | `skins/depot/photos/hero-sq.webp` | 900 × 900 | yes |
| promo-kit | `skins/depot/photos/promo-kit.webp` | 1280 × 720 | yes |
| promo-battery | `skins/depot/photos/promo-battery.webp` | 1280 × 720 | yes |
| promo-pickup | `skins/depot/photos/promo-pickup.webp` | 1280 × 720 | yes |
| promo-delivery | `skins/depot/photos/promo-delivery.webp` | 1280 × 720 | yes |
| about | `skins/depot/photos/about.webp` | 1440 × 960 | yes |
| contact | `skins/depot/photos/contact.webp` | 1200 × 800 | yes |
| empty | `skins/depot/photos/empty.webp` | 1200 × 800 | yes |
| each collection | `skins/depot/photos/col-<slug of its title>.webp` | 1040 × 780 | 10 file(s); a collection without one shows its best sellers on a plate |

## Checks

<!-- CHECKS:START -->
(none yet)
<!-- CHECKS:END -->

## Releases

| Version | Date | Layout | Deploy | What |
| --- | --- | --- | --- | --- |
