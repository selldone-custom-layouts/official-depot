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

## What makes it Depot

The look follows acmetools.com's tool superstore (home seen live; its other pages are behind a bot check that was not
bypassed, so they follow Acme's usual pattern). The design reference is `toolino-design/depot/*.html` in the workspace.

| Area | Where | What |
| --- | --- | --- |
| Header | `components/ly/shell/LyHeader.vue` | the red service strip (door delivery, pickup only with a point, pay on delivery only with COD; Track order, Pickup point, Help, language & currency), the wrench glyph and wordmark, the wide search (name, SKU, brand, spec), the account and the cart with its total; the navigation row: Shop all (mega menu: departments, quick links from each department's own spec, its first tools), Brands (the products' brands), Deals, What's new, the departments that fit, All departments; the phone menu |
| Footer | `components/ly/shell/LyFooter.vue` | the service band (every delivery way and cash on delivery from live settings), Shop / Departments / Help / Company, the Theme row, the legal row |
| Card | `components/ly/ui/LyCard.vue` | grid (brand plate, heart, SKU, stock, Kit / Bare tool, raised-cents price, saving, Add to cart, Compare tick), `h` (Explore band, batteries that fit), `row` (popular list) |
| Reads | `components/ly/depot/dp.ts` | brands, SKU, kit or bare tool (only the product's own "Battery Included" / "Power Package" rows), batteries that fit (own "Tool Platform" names the brand and voltage), a department's filters from its products' spec, key specs, price bands, way lines |
| Listing | `components/ly/shop/LyListing.vue` | breadcrumb and head (department name, line and photo), department chips, the deals band, a filter sidebar on every listing (departments, brand, kit or bare tool, the department's spec filters, price bands and boxes, on offer), five cards a row; `?brand=`, `?kit=kit|bare`, `?f=Key:Value|…` (the mega menu's quick links) |
| Product | `components/ly/product/LyProductOverview.vue`, `LyProductTabs.vue`, `pages/product/StorefrontPageProduct.vue` | three columns: gallery (never drawn wider than ~1.4 × its own pixels), key specs + kit note + in the box, the sticky buy box (price, saving, stock, how to get it from the shop's ways, add, compare, save, COD, returns); a sticky section bar: Overview, Specifications, Batteries that fit (bare tools), Reviews; Similar tools |
| Journal | `pages/blog/list/…`, `pages/blog/view/StorefrontPageBlogsView.vue` | "Tool talk"; a post shows its cover once: when the body opens with the cover picture (Selldone makes the body's first picture the cover), that copy leaves the body and its caption goes under the cover |
| Pages | `components/ly/depot/pages/` | `/brands` (every brand with its departments and tools), `/pickup-point` (the shop's own pickup point, its map, when to collect, cost and note; an honest empty state without one), `/help/delivery` (the shop's delivery ways, ways to pay, how a return starts) |
| Styles | `style/ly/dp.css` (shell, cards), `style/ly/dp-pages.css` (home, listing, product, journal, pages, the base pages' title band) | one colour family, 10 / 6 px, Barlow Condensed over Barlow, no line art |

## Home

1. **dp-hero** (board): the photo panel ("Tools for every job") with Shop now; beside it the live offers ("Up to n% off", three of them), else the newest tools; quick links (deals only with offers, what's new, kits / bare tools only when the spec has them, the pickup point only with one).
2. **dp-board** (promo): the departments with their own image; the kit promo (else Shop all tools); two brand banners (brands with live offers first); the popular list (Selldone's sells).
3. **dp-deals** (tiles): today's top deals, only with live offers.
4. **dp-trust** (band): the door way and the pickup point, the shop's line, cash on delivery (only with COD), compare.
5. **dp-depts** (tiles): every department as a photo tile (`col-<slug>`, else its own image cut out).
6. **dp-brands** (wall): every brand of the products, then All brands.
7. **dp-explore** (tabs): Featured, the largest departments, New products; horizontal cards on the family-dark band.
8. **dp-why** (five): specs first, kit or bare tool, door delivery, the pickup point (else order tracking), pay on delivery (only with COD).
9. **dp-story** (photo, tint band): the shop's own About page (or its description) beside the about photo; hidden without either.
10. **dp-journal** (cards): the four newest posts.

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
