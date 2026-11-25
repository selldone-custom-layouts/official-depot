# The Layout base

**What it is.** One storefront codebase for every custom Selldone Layout. A Layout is the base plus a skin
(`skins/<name>/skin.json` and `skins/<name>/photos/`). The base started as Pralino Classic Patisserie 1.0.7 (the last
Layout built by hand, live on pralino.selldone.shop, HEAD 615e2b6 of `pralino-layout`), with every Pralino name
moved into the skin system. Pralino came from Domino 1.0.2, Domino from Bakini Noir, Bakini from Medio and the Kalio
(Molino) base, all on selldone/storefront; their lessons are in `marketplace-guide.md` and the kits.

## Lineage of names

| Was (Pralino) | Is (base) |
| --- | --- |
| `components/pralino/`, `Pralino*.vue`, `Pr*.vue`, `pr.ts`, `pr-*.ts`, `pralino-*.ts` | `components/ly/`, `Ly*.vue`, `ly.ts`, `ly-*.ts` |
| `.pr` root class, `--pr-*` tokens, `html.pr-dark`, keyframes `pr-*` | `.ly`, `--ly-*`, `html.ly-dark`, `ly-*` (checked first: no `ly` class, token or identifier in the storefront, the six modules or Vuetify; `lb` was taken by the map's labels) |
| `style/pralino/{base,pages,pralino}.css`, `style/pralino-{theme,layout,sd}.scss` | `style/ly/{base,pages,look}.css`, `style/ly/variants.css` (new), `style/ly-{theme,layout,sd}.scss`, `style/ly-skin.gen.scss` (generated) |
| i18n keys `pralino.*`, files `pralino.{en,ar}.ts` | `ly.*`, `ly.{en,ar}.ts` |
| storage keys `pralino-theme`, `pralino-splash`, `pralino-splash-hold`, `pralino-dev-languages` | `<skin name>-theme`, `-splash`, `-splash-hold`, `-dev-languages` (so a Pralino skin keeps its keys) |
| photo slots `pralino-hero-back` … `pralino-footer`, `pralino-col-<slug>` in `assets/pralino/` | `hero-back` … `footer`, `col-<slug>` in `skins/<name>/photos/` |
| `PralinoHome.vue` (one 712-line component) | `components/ly/home/LyHome.vue` (the skin's sections in order), `home-data.ts` (the shared reads, unchanged), `sections/*.vue` |
| the Tan values written in `pralino-theme.scss` and `pralino-theme.ts` | computed from each palette's seed by `ly-family-core.ts` at `skin-apply` time (identical for Pralino's five palettes) |
| `scripts/pralino-prod-check.mjs`, `pralino-checkout-walk.mjs`, `card-edge-pr.cjs` | `scripts/prod-check.mjs`, `checkout-walk.mjs`, `card-edge-ly.cjs` (their defaults read the skin); since the Toychi sync also `tablet-probe.cjs` and `order-preview.cjs` |
| `scripts/pralino-css.cjs` (mockup → CSS generator) | removed: `style/ly/*.css` are now the base's own source |

`new-shop-kits/base/tools/derive-base.mjs` is the repeatable step that did the renaming; comments that say
`design/<page>.html` refer to the first Layout's mockup set (`pralino-design/` in the workspace).

## The skin

| Key | What it decides | Read by |
| --- | --- | --- |
| `name`, `package`, `title`, `description`, `summary`, `tagline`, `kind`, `tags` | names everywhere; `manifest.json` and `selldone-layout.json` (right on the FIRST upload: Selldone keeps the first description) | skin-apply, render-docs |
| `shop` { name, id, xapi, domain, currency, country, language } | the dev server's shop, the live domain the checks and the prod-bundle check use | `.env`, `checks/`, `scripts/lib/skin.cjs` |
| `github` { org, repo, topics } | `package.json` repository, README links, `publish-github.sh` | skin-apply, render-docs |
| `dev` { port, themeColors? } | the dev server port; the dev theme colours (default: from the brand palette) | `.env` |
| `palettes` { brand, mode, list[{ id, name, seed, light?, dark? }], showcaseShops } | the colour families, the switcher's palettes (action colours computed from the seed), the first paint | `skin.gen.ts`, `ly-skin.gen.scss` |
| `fonts` { display, text: { family, google, stack }, headingWeight } | the two faces, one Google request | `kalio-fonts.ts`, `ly-skin.gen.scss` |
| `shape` { panel, inner } | the radius scale (circle 50 % is fixed) | `ly-skin.gen.scss` |
| `wordmark` { case, italic, dot, sub, weight, tracking, size } | the header's wordmark, the splash's name, the loading screen's name | `ly-wordmark.ts`, `LyLogo.vue`, `LySplash.vue`, loader config |
| `basket` { one, many } | the basket word in the Layout's English and Selldone's English | `ly-words.ts` |
| `home` [{ section, variant, band? }] | the home's sections, their order, variants and tint (validated against `components/ly/home/sections.json`; two tints side by side are refused) | `LyHome.vue` |
| `photos` { <slot>: { size, art, note }, collections: { size } } | the slots, their sizes (checked) and the fallback art | `LyPhoto.vue`, skin-apply |
| `loading` { art, sub, name?, logo?, colours? } | the domain's custom loading screen (`scripts/loading/config.json` → `make-loading.cjs`) | skin-apply |
| `splash` { art } | the in-app splash's line art | `LySplash.vue` |
| `words` { en: {}, ar: {} } | any `t()` key's text, per language | `ly-words.ts` |
| `checks` { product, product2, category, search, article, compare, i18nIgnore, wait, phoneMenu, walkAdd } | test inputs for the checks (the shop's own ids), never in the Layout; `wait` the selector every page shows (default `.ly .ftr`), `phoneMenu` the widest window with the header's menu button (default 979, never under 740), `walkAdd` the walk's first add button | `checks/checks.env`, `checks/fast-checks.json`, the walk, the tablet probe |

## The home's section library (`components/ly/home/sections.json`)

| Section | Variants | Default tint |
| --- | --- | --- |
| `hero` | `split` (Pralino), `mirror` (Domino: photo left, words right; the photo is flipped so its calm corner stays under the words) | white |
| `about` | `numbers` (Pralino: numbers beside the story), `story` (Domino: centred story, no numbers) | tint |
| `counters` | `band` (Domino's cocoa counters on the family-dark band, without scallops) | dark band |
| `collections` | `rows` (Pralino's alternating photo rows), `cards` (Domino's 2 × 2 cards, photo on top) | white |
| `how` | `photo` | tint |
| `offer` | `ways` | white |
| `gallery` | `mosaic` | white |
| `selection` | `rows` | tint |
| `photoband` | `full` | photo |
| `marquee` | `names` | white |
| `journal` | `photo` | tint |

A new variant: a class on the section's root (`v-<variant>`) and its rules in `style/ly/variants.css`, or a new
component in `sections/` registered in `LyHome.vue`; then list it in `sections.json`.

## Dependencies

`modules/` (the six Selldone modules, with `patches/modules-{components,translate}.kalio.patch` applied) and
`node_modules/` are not in git. On this machine they are copied, never linked (Vite breaks behind a junction):

```powershell
robocopy <from>\modules <to>\modules /E /MT:32 /NFL /NDL /NJH /NJS /NP
robocopy <from>\node_modules <to>\node_modules /E /MT:32 /XD .vite /NFL /NDL /NJH /NJS /NP
```

The base's own copy came from `pralino-layout` (same `package.json` and lock); `new-layout.mjs` copies the base's
into each new Layout (about 2 minutes on the SSD; robocopy's exit codes 1–3 mean success). Elsewhere:
`npm run setup`, the two patches, `npm install --force`.

## Tools find Playwright and sharp

`PW` / `SHARP` (a path), else the installed package, else `../../kalio-marketplace/node_modules/<pkg>` (the
workspace's copy beside the Layout). No absolute paths anywhere in the repo.

## Rules for changing the base

- A fix that every Layout needs goes here, then into each Layout (they are separate repos: copy the commit).
- A Layout-only touch goes in that Layout's `style/ly-layout.scss` or its skin, never in `style/ly/*.css`.
- Keep `scripts/run-checks.sh` and `scripts/fast-checks.config.mjs` in step (same run names).
- Never write a shop's name, price, collection or address in code; never `vw` for anything that bleeds or aligns.

## The Toychi sync (25 Nov 2026): done

Generic fixes from the three Toychi Layouts (Storybook, Play Lab, Toy Fair; all scaffolded from 810fd2f) brought
back into the base, reconciled where they differed. Toychi's own look (headers, footers, listings,
`style/ly/{sb,pl,tf*}.css`, their home sections and retail pages, toy words and line art, the three-step checkout)
stays in those Layouts.

| Area | What the base does now | Commits |
| --- | --- | --- |
| Delivery ways | `ly.ts`: pickup only with a pickup point (`deliveryWays`, the bag, the product page, the facts); `pickupName` (a point named as one keeps its name); an untitled Truck is "<shop> truck delivery", two untitled couriers are told apart by their vehicle; `isLocalWay` (a way with no real limit, Selldone's 99999 km, reads "Delivered to your door"; the courier fact prefers the local one); `wayIconOf` (Truck and Car draw the `truck` icon everywhere, the order's "On the way" step too); `payName` (cash on delivery from the gateway's flag, in the Layout's words: drawer, top bar, product page, home, strip, About) | 9674062, a237bfb |
| Bag and checkout | the Delivery card and sheet say what to do before any way shows; that door delivery comes with the address, or does not reach this one and the pickup point instead; the bag's note follows the address (`nx_more_later`, `nx_door_note`); an older basket update's answer never overwrites a newer one | 22d35a7 |
| Page lock, contrast | `lockPage` (`html.ly-lock` beats Selldone's `html { overflow: auto !important }`); Selldone's pickup chip in the tint's own ink | ad10aa2 |
| Guests | saved items and the address book open for a guest and ask to sign in (no `requiresAuth` redirect); saved items as the Layout's cards; account pages titled for a guest | 3da80af |
| Right to left | the wordmark (and its dot) and the shop's own words in `unicode-bidi: plaintext`; a clamped name takes it on its inner link (on the clamped block the hidden overflow line ran past the card); blocks keep the page's right edge (zero specificity, so centred stays centred); the order's messages and payment and delivery lines; the written wordmark sub line through `t()`; the sign-in sheet's wordmark from the skin | de34449, 8281894, 69c4808 |
| Journal | `/blog/<id>-<slug>` (an article id or a blog id) opens the post and becomes its address. The cover over the title is not a base bug: the cover's pull is the title band's bottom padding minus 24 px at every width (Storybook's own band was shorter) | 4642043 |
| Tablets | the six-card rows three across up to 1200 px; the delivery ways fill their row (three across as before, two halve it, one fills it, from 1101 px); three posts stay three across from 761 to 979 px | 81917b7, 8c17ed0, f20b9e2 |
| Checks | `shape-check` reads the skin's radius and test pages; `tablet-probe.cjs`, `order-preview.cjs`; 820 in `run-checks.sh`, `fast-checks.config.mjs` and skin-apply's widths (in step); `checks.wait`, `checks.phoneMenu`, `checks.walkAdd` (skin, schema, `checks.env`, `fast-checks.json`); the currency check skips a width where the header shows its phone menu but the tool looks for the pill (820 here); the i18n check skips the shop's own words (article bodies, the shop's own pages, Selldone's payment window, `[data-shop-text]`); prod-check on a domain with no Layout pinned; one reconciled `checkout-walk.mjs` | 8428aa9, 4c22fb1, fe3a5b6 |
| Templates | README and wiki templates neutral (no bakery text); `{{col_photos}}` from the skin | 5c484b3, 7366790 |

Not ported: Toy Fair stops reading the pickup point as the shop's address (About, Contact, FAQ). The base's
"counter" model reads the point as the shop's place, and Pralino relies on it: the owner's open decision.

Found by the tests, not from the sync (the same on the base before it, 810fd2f, with a skin that has no photos on the
Toychi data): the journal section's giant faint word (`span.j-word`) reads 1.03–1.05:1 in dark mode when the journal
photo is missing (contrast, cart); the hero's long collection names ("Active & Outdoor Play") overlap the hero inset's
caption at 1440 with the hero photos missing (text-col). Both are left for the next base pass.

**Tested (25 Nov 2026)** on a throwaway Layout with a test skin on the Toychi shop (shop 16144, toychi.selldone.shop, no
Layout pinned there), deleted after:

- fast checks on dev (1440, 1024, 820, 390 and the wide widths; light, dark, every palette and the custom colours;
  Arabic): ring, card-edge, corner, circle, cart flow, currency, box, i18n, shape, underline, variant all 0 once the
  fixes below were in; the 34 left are the two pre-existing findings above (contrast 28 and cart 2: `j-word`;
  text-col 4: the hero list). The first run found three things that are fixed here: Selldone's English gateway name
  on the top bar in Arabic (i18n 19), plaintext on clamped card names (corner 7), the currency check at 820 (1).
- build 269 files; prod-check OK at 1440 and 390 through the domain's own loader;
- guest walks, nothing ordered, the bag emptied: `WALK_PLACE="Los Angeles, CA" WALK_WAY=truck` and `WALK_WAY=pickup`,
  each WALK OK at 1440, 820 and 390 (the truck "Delivered to your door", $49.00 to Selldone's payment window);
- the tablet probe: 768, 820, 1024, 1180 light and dark plus the phone menu at 390, 740, 979, 980: TOTAL 0 after the
  three-posts fix (the first pass found `.bgrid` 2 + 1 at 768);
- Pralino scaffolded with dependencies from 810fd2f and from this branch, both built (283 files): shots and pixel diff
  (`tools/shots.cjs`, `tools/diff.cjs`, 1440 and 390): home, collection, product and checkout 0 %; the bag 3.1 % and
  6.2 %, a 4 px shift under the bag's delivery note (a note that wraps keeps its icon on the first line). The first
  diff also caught three delivery ways falling 2 + 1 in the checkout's narrow column (fixed in f20b9e2).
