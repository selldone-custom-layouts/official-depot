/*
 * The guest checkout walk on a live shop, up to Selldone's payment window. Never further.
 * (Galio's galio-checkout-walk.mjs with the Layout's markup; the three Toychi walks reconciled, 25 Nov 2026.)
 *
 * For each width (1440 desktop, 820 tablet, 390 phone), in a fresh browser (so a fresh guest basket):
 *   home → one piece in the bag (the first card's add button, or WALK_ADD) → the bag drawer (waits up to 15 s for
 *   the shop's answer to the add) → its Checkout (found by its role and words) → contact (fake) → (no way before
 *   an address, a courier's radius: the address sheet first) → every delivery way the shop offers, one after the
 *   other, found by its name as the list changes (and a window when the way has windows) → the delivery sheet
 *   ("Compare the options") → the address sheet as the shop has it (map on: a pin or a searched place, then the
 *   details, in two steps on a phone; map off: the form), fake details, Save → for each way: "Place order", which
 *   only opens Selldone's payment window → a screenshot → the window's ✕. At the end the bag is emptied again.
 *
 * Three modes:
 *   every way            (default) the address at the map's centre, then each way to the payment window;
 *   a door way far away  WALK_PLACE="Los Angeles, CA" WALK_WAY=truck: the place is searched in the address sheet
 *                        first (a way limited to a radius around the shop is then out, a way with no limit in),
 *                        the walk waits for the ways that reach it, and only the named way goes on;
 *   the pickup alone     WALK_WAY=pickup: no address is entered at all.
 *
 * Nothing is ordered: nothing inside the payment window is touched but its ✕, and every Selldone /buy/
 * call is blocked here as a second guard (it would be logged as BLOCKED).
 *
 * Usage: node --use-system-ca scripts/checkout-walk.mjs [base] [out-folder]
 *   base default the skin's live domain (skins/<name>/skin.json shop.domain) · out default .shots/walk
 *   WIDTHS=1440,820,390 · MODE=light|dark · WALK_PLACE · WALK_WAY=<pattern> · WALK_ADD=<css> (else the skin's
 *   checks.walkAdd, else the first visible add button on the home) · WALK_POSTAL (a postal code when the sheet has none)
 *   PW=<path to playwright's index.js> (default: the "playwright" package)
 * Prints every step, then "WALK OK" or "WALK PROBLEMS n".
 */
import { createRequire as __cr } from "node:module";
const { shopUrl: __shopUrl, readSkin: __readSkin } = __cr(import.meta.url)("./lib/skin.cjs");
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const BASE = (process.argv[2] || __shopUrl()).replace(/\/$/, "");
const OUT = path.resolve(process.argv[3] || ".shots/walk");
const WIDTHS = (process.env.WIDTHS || "1440,820,390").split(",").map(Number);
const MODE = process.env.MODE || "light";
const PLACE = process.env.WALK_PLACE || "";
const ONLY = process.env.WALK_WAY ? new RegExp(process.env.WALK_WAY, "i") : null;
/* a walk for the pickup point alone: the pattern names pickup and no way to the door */
const PICKUP_ONLY = !!ONLY && ONLY.test("pickup") && ["courier", "truck", "van", "delivery", "post", "shipping"].every((x) => !ONLY.test(x));
/* the skin's theme key, brand palette and the selector every page shows (checks/fast-checks.json, from the skin) */
const FC = JSON.parse(fs.readFileSync(new URL("../checks/fast-checks.json", import.meta.url), "utf8"));
const CK = (() => {
  try {
    return __readSkin().skin.checks || {};
  } catch {
    return {};
  }
})();
const WAIT = FC.wait || ".ly .ftr";
const ADD = process.env.WALK_ADD || CK.walkAdd || ".ly .srow .add, .ly .pc button.add, .ly button.add";
fs.mkdirSync(OUT, { recursive: true });

/* PW may name the package's folder or its index.js */
const pwFile = (p) => (fs.existsSync(p) && fs.statSync(p).isDirectory() ? path.join(p, "index.js") : p);
const pw = process.env.PW ? await import(pathToFileURL(pwFile(process.env.PW)).href) : await import("playwright");
const chromium = pw.chromium || pw.default?.chromium;
const browser = await chromium.launch();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let problems = 0;
const bad = (w, msg) => {
  problems++;
  console.log(`  PROBLEM ${w}: ${msg}`);
};
const slug = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 28);
const nameOf = (line) => line.split(" | ")[0];

for (const W of WIDTHS) {
  const H = W < 768 ? 844 : W < 1100 ? 1180 : 900;
  console.log(`\n=== ${W}×${H} ${MODE}${PLACE ? " · " + PLACE : ""}${ONLY ? " · " + process.env.WALK_WAY : ""}`);
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: W < 768, hasTouch: W < 768 });
  await ctx.addInitScript(
    ([key, palette, mode]) => {
      try {
        localStorage.setItem(key, JSON.stringify({ palette, mode }));
      } catch {}
    },
    [FC.storage.theme, FC.brand, MODE],
  );
  const page = await ctx.newPage();
  const errors = [];
  const blocked = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 240)));
  await page.route(
    (u) => !/^(localhost|127\.0\.0\.1)$/.test(u.hostname) && /\/buy\//.test(u.pathname),
    (r) => {
      blocked.push(r.request().method() + " " + r.request().url());
      return r.abort();
    },
  );
  const shot = async (name, full = false) => {
    const file = path.join(OUT, `walk-${W}-${name}.png`);
    await page.screenshot({ path: file, fullPage: full });
    console.log(`  shot ${path.basename(file)}`);
    return file;
  };
  const push = (to) => page.evaluate((p) => window.$global_router.push(p).catch(() => {}), to);
  const visible = (sel) => page.locator(sel).filter({ visible: true }).first();
  const ways = () => page.locator("#co-delivery .mcs label.mc");
  /* a way's card by its exact name: the list changes under the walk (an address brings a truck in, choosing pickup
     puts the counter in as the receiver), so an index goes stale */
  const wayCard = async (name) => {
    const i = await page.evaluate((name) => [...document.querySelectorAll("#co-delivery .mcs label.mc")].findIndex((b) => (b.querySelector(".mc-t")?.textContent || "").trim() === name), name);
    return i >= 0 ? ways().nth(i) : null;
  };
  const wayOn = (name) =>
    page.evaluate((name) => !![...document.querySelectorAll("#co-delivery .mcs label.mc")].find((l) => l.querySelector(".mc-t")?.textContent?.trim() === name)?.querySelector("input")?.checked, name);
  const listWays = () =>
    page.evaluate(() =>
      [...document.querySelectorAll("#co-delivery .mcs label.mc")].map((b) => [b.querySelector(".mc-t"), b.querySelector(".mc-f"), b.querySelector(".mc-n")].map((x) => x?.textContent?.trim() || "").join(" | ")),
    );
  /* after the address the bill comes back with the ways that reach it: wait for a change (up to 15 s) */
  const waitWays = async (before) => {
    let now = [];
    for (let k = 0; k < 10; k++) {
      await sleep(1500);
      now = await listWays();
      if (now.length !== before.length || now.some((x, i) => nameOf(x) !== nameOf(before[i] || ""))) break;
    }
    return now;
  };

  try {
    // ── home and one piece in the bag
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForSelector(WAIT, { timeout: 90000 });
    await page.locator(ADD).filter({ visible: true }).first().waitFor({ timeout: 60000 });
    await sleep(2500);
    const addBtn = visible(ADD);
    await addBtn.scrollIntoViewIfNeeded();
    const piece = await addBtn.evaluate((b) => b.closest(".pc, .srow, li, article")?.querySelector(".pc-t, .s-t, h3")?.textContent?.trim() || "");
    await addBtn.click();
    console.log(`  added one piece: ${piece || "(the first card)"}`);
    await sleep(2500);

    // ── the bag drawer
    await visible(".bag-btn").click();
    await page.waitForSelector("#drawer .dw-acts", { state: "visible", timeout: 20000 }).catch(() => {});
    /* the drawer lists the basket's lines once the shop's server has answered the add (2-3.5 s on a live shop, the
       add button counts at once): wait up to 15 s rather than read an empty drawer */
    await page.waitForFunction(() => document.querySelectorAll("#drawer .dw-list > li").length > 0, null, { timeout: 15000, polling: 250 }).catch(() => {});
    await sleep(800);
    const drawerLines = await page.evaluate(() => document.querySelectorAll("#drawer .dw-list > li").length);
    console.log(`  bag drawer open, ${drawerLines} line(s)`);
    if (!drawerLines) bad(W, "the drawer shows no line after adding a piece");
    await shot("01-drawer");
    /* Checkout by its role and words, not its place among the drawer's buttons (Layouts put View bag first) */
    let go = page.locator("#drawer").getByRole("link", { name: /check\s?out/i }).first();
    if (!(await go.count())) go = page.locator("#drawer .dw-acts a.btn:not(.quiet)").first();
    await go.click();
    await page.waitForSelector("#co-details", { timeout: 45000 });
    await sleep(3500);
    console.log(`  checkout: ${await page.evaluate(() => location.pathname + location.search)}`);
    await shot("02-checkout", true);

    // ── contact (fake)
    const email = page.locator("#co-email");
    if (!(await email.count())) bad(W, "no email field");
    else if (await email.isDisabled()) bad(W, "the guest email field is disabled (no guest checkout?)");
    else {
      await email.fill("ly.walk@example.com");
      await email.blur();
    }
    const phone = page.locator("#co-phone");
    if (await phone.count()) {
      await phone.fill("+1 415 555 0199");
      await phone.blur();
    }
    await sleep(2500);

    // ── the address sheet as the shop has it (map on: a pin at the map's centre or a searched place, then the
    //    details; map off: the form)
    const addressSheet = async () => {
      const addrBtn = page.locator("#co-address .addr-add, #co-address .addr-card .qlink").first();
      if (!(await addrBtn.count())) {
        bad(W, "no address card to open");
        return false;
      }
      await addrBtn.scrollIntoViewIfNeeded();
      await addrBtn.click();
      await page.waitForSelector(".k-addr__grid", { timeout: 20000 });
      await sleep(4000);
      const hasMap = await page.evaluate(() => !!document.querySelector(".k-addr__map"));
      console.log(`  address sheet open, map ${hasMap ? "on" : "off"} (the shop's option)`);
      await shot(`05-address-map-${hasMap ? "on" : "off"}`);
      if (PLACE) {
        const q = page.locator(".k-addr__search input").filter({ visible: true }).first();
        if (!(await q.count())) bad(W, "no address search field in the sheet");
        else {
          await q.click();
          await q.pressSequentially(PLACE, { delay: 40 });
          await page.waitForSelector(".k-addr__results li button", { state: "visible", timeout: 20000 }).catch(() => {});
          const hit = page.locator(".k-addr__results li button").filter({ visible: true }).first();
          if (!(await hit.count())) bad(W, `the address search found nothing for "${PLACE}"`);
          else {
            console.log(`  searched "${PLACE}": ${(await hit.innerText()).replace(/\s+/g, " ").trim().slice(0, 100)}`);
            await hit.click();
            await sleep(5000);
          }
        }
      } else if (hasMap) {
        await page.locator(".k-addr__pin svg").click().catch(() => {});
        await sleep(5000);
        const found = await page.evaluate(() => document.querySelector(".k-addr__found b")?.textContent?.trim());
        console.log(`  pin placed; address under it: ${found}`);
      }
      /* a phone shows the sheet in two steps: the map, then (Continue) the details */
      if (await page.evaluate(() => !!document.querySelector(".k-addr__grid.-step-map"))) {
        await page.locator(".k-sheet__foot .k-sheet__go").click();
        await sleep(1500);
      }
      const fill = async (sel, v, force = false) => {
        const el = page.locator(sel).first();
        if (!(await el.count())) return;
        if (force || !(await el.inputValue())) await el.fill(v);
      };
      await fill('.k-addr__field input[autocomplete="street-address"]', "12 Walk Street");
      await fill('.k-addr__field input[placeholder="No."]', "12");
      await fill('.k-addr__field input[autocomplete="name"]', "Test Walk", true);
      await fill('.k-addr__field input[autocomplete="tel"]', "+1 415 555 0199", true);
      await fill('.k-addr__field input[autocomplete="address-level2"]', PLACE ? PLACE.split(",")[0] : "Walk City");
      await fill('.k-addr__field input[autocomplete="postal-code"]', process.env.WALK_POSTAL || "94105");
      await fill(".k-addr__field textarea", "Ring twice (test walk)", true);
      await sleep(800);
      await shot("06-address-details");
      await page.locator(".k-sheet__foot .k-sheet__go").click();
      await sleep(5000);
      const left = await page.evaluate(() => !!document.querySelector(".k-addr__grid"));
      const missing = await page.evaluate(() => document.querySelector(".k-addr__missing")?.textContent?.trim());
      if (left) bad(W, `the address sheet stayed open after Save${missing ? ": " + missing : ""}`);
      const set = await page.evaluate(() => (document.querySelector("#co-address .addr-card")?.textContent || "(no address card)").replace(/\s+/g, " ").trim());
      console.log(`  address saved: ${set}`);
      await shot("07-address-set", true);
      return !left;
    };

    // ── every delivery way (the ways to the door that depend on the address come once it is in: then the address
    //    comes first, unless the walk is for the pickup point alone)
    let list = await listWays();
    let addressDone = false;
    if (!PICKUP_ONLY && (PLACE || !list.length || (await page.locator("#co-address .addr-add").count()))) {
      if (!list.length) {
        const none = await page.evaluate(() => document.querySelector("#co-delivery .ly-ship-none")?.textContent?.trim());
        console.log(`  no way before an address; the Delivery card says: ${none || "(nothing)"}`);
        if (!none) bad(W, "the Delivery card shows no way and says nothing about it");
      } else console.log(`  before an address: ${list.map(nameOf).join(" / ")}; the address first${PLACE ? " (" + PLACE + ")" : ""}`);
      addressDone = await addressSheet();
      list = await waitWays(list);
    }
    console.log(`  delivery ways (${list.length}):`);
    list.forEach((w, i) => console.log(`    ${i + 1}. ${w}`));
    if (!list.length) bad(W, "the Delivery card shows no way");
    if (new Set(list.map(nameOf)).size < list.length) bad(W, "two delivery ways have the same name");
    const note = await page.evaluate(() => [...document.querySelectorAll("#co-delivery .ly-ship-more, #co-delivery .ly-ship-none")].map((x) => x.textContent.trim()).join(" / "));
    if (note) console.log(`  the Delivery card says: ${note}`);
    const wayInfo = [];
    for (const line of list) {
      const name = nameOf(line);
      /* a walk for one way tries only that way (choosing pickup puts the counter in place of the home address) */
      if (ONLY && !ONLY.test(name)) continue;
      const card = await wayCard(name);
      if (!card) {
        bad(W, `way "${name}" left the list`);
        continue;
      }
      await card.scrollIntoViewIfNeeded();
      await card.click();
      await sleep(3500);
      /* a basket update still on its way (the contact just typed) can answer over the choice: choose once more */
      if (!(await wayOn(name))) {
        console.log("    (not chosen yet: once more)");
        await (await wayCard(name))?.click();
        await sleep(3500);
      }
      const st = await page.evaluate((name) => {
        const c = [...document.querySelectorAll("#co-delivery .mcs label.mc")].find((b) => (b.querySelector(".mc-t")?.textContent || "").trim() === name);
        const chips = [...document.querySelectorAll("#co-delivery .wins .wchip")];
        return {
          checked: !!c?.querySelector("input")?.checked,
          icon: c?.querySelector(".mc-ic svg")?.getAttribute("data-name") || c?.querySelector(".mc-ic svg")?.innerHTML.length || 0,
          chips: chips.map((x) => x.textContent.trim() + (x.disabled ? " (off)" : "")),
          date: !!document.querySelector("#co-delivery .ly-ship-date input"),
          addressH: document.querySelector("#co-address h2")?.textContent?.trim(),
          receipt: (document.querySelector("#co-pay")?.innerText || "").replace(/\s+/g, " ").match(/(Delivery|Pickup|Shipping)[^$]*\$?[\d.,]*|Free/i)?.[0] || "",
        };
      }, name);
      console.log(`  way "${name}": checked=${st.checked} windows=[${st.chips.join(", ")}]${st.date ? " date-field" : ""} address-card="${st.addressH}" receipt="${st.receipt}"`);
      if (!st.checked) bad(W, `way "${name}" did not become the chosen one`);
      /* a way without windows must not carry the window of the way before it */
      if (!st.chips.length && / · (Morning|Noon|Afternoon|Evening|Night|Instant)/.test(st.receipt)) bad(W, `way "${name}" has no windows but the receipt names one: "${st.receipt}"`);
      const firstChip = page.locator("#co-delivery .wins .wchip:not([disabled])").first();
      if (await firstChip.count()) {
        await firstChip.click();
        await sleep(2500);
        const on = await page.evaluate(() => document.querySelector("#co-delivery .wins .wchip[aria-checked='true']")?.textContent?.trim());
        console.log(`    window chosen: ${on || "NONE"}`);
        if (!on) bad(W, `way "${name}": a window did not stay chosen`);
      }
      wayInfo.push({ name, pickup: /pickup/i.test(st.addressH || "") });
      await page.locator("#co-delivery").screenshot({ path: path.join(OUT, `walk-${W}-03-way${wayInfo.length}-${slug(name)}.png`) });
      console.log(`  shot walk-${W}-03-way${wayInfo.length}-${slug(name)}.png`);
    }
    /* the ways once these were chosen (a pickup point's place can bring a far-reaching way in: Play Lab) */
    if (!ONLY) {
      const added = (await listWays()).map(nameOf).filter((n) => !wayInfo.some((x) => x.name === n));
      if (added.length) console.log(`  ways after choosing: ${added.join(", ")} added`);
      for (const n of added) wayInfo.push({ name: n, pickup: false });
    }

    // ── the delivery sheet
    const cmp = page.locator("#co-delivery [aria-controls=dlvm]");
    if (await cmp.count()) {
      await cmp.click();
      await page.waitForSelector("#dlvm .dls .dl, #dlvm .ly-ship-none", { state: "visible", timeout: 15000 }).catch(() => bad(W, "the delivery sheet shows no way and does not say why"));
      await sleep(1500);
      const rows = await page.evaluate(() => [...document.querySelectorAll("#dlvm .dls .dl .dl-t b")].map((b) => b.textContent.replace(/\s+/g, " ").trim()));
      console.log(`  delivery sheet: ${rows.length} row(s): ${rows.join(" / ")}`);
      await shot("04-delivery-sheet");
      const done = page.locator("#dlvm .btn").filter({ hasText: /done/i }).first();
      if (await done.count()) await done.click();
      else await page.keyboard.press("Escape");
      await sleep(1200);
    }

    // ── a way that needs an address, then the address sheet (unless it came first, or the walk is pickup only)
    const home = wayInfo.find((w) => !w.pickup);
    if (addressDone || PICKUP_ONLY) {
      /* nothing to do */
    } else if (home) {
      await (await wayCard(home.name))?.click();
      await sleep(3000);
      const firstChip = page.locator("#co-delivery .wins .wchip:not([disabled])").first();
      if (await firstChip.count()) {
        await firstChip.click();
        await sleep(2000);
      }
      await addressSheet();
    } else bad(W, "no way that needs an address");

    // ── each way (WALK_WAY: the ways it names): Place order → the payment window → its ✕
    const chosen = ONLY ? wayInfo.filter((w) => ONLY.test(w.name)) : wayInfo;
    if (ONLY) console.log(`  to the payment window (${process.env.WALK_WAY}): ${chosen.map((w) => w.name).join(", ") || "none"}`);
    if (ONLY && !chosen.length) bad(W, `no way matches "${process.env.WALK_WAY}"`);
    /* the ways to the door first, a pickup last (a pickup point in the receiver hides a courier whose radius does not
       reach it, until a way to the door brings the buyer's own address back) */
    chosen.sort((a, b) => Number(a.pickup) - Number(b.pickup));
    for (const w of chosen) {
      if (!(await wayCard(w.name))) {
        for (const o of wayInfo.filter((x) => !x.pickup && x.name !== w.name)) {
          const oc = await wayCard(o.name);
          if (oc) {
            await oc.click();
            await sleep(4000);
            break;
          }
        }
      }
      const card = await wayCard(w.name);
      if (!card) {
        bad(W, `way "${w.name}" is not in the list at Place order`);
        continue;
      }
      await card.scrollIntoViewIfNeeded();
      await card.click();
      await sleep(3500);
      const chip = page.locator("#co-delivery .wins .wchip:not([disabled])").first();
      if ((await chip.count()) && !(await page.locator("#co-delivery .wins .wchip[aria-checked='true']").count())) {
        await chip.click();
        await sleep(2500);
      }
      const place = page.locator("#co-pay button.place");
      if (!(await place.count())) {
        bad(W, `way "${w.name}": no Place order button (${await page.evaluate(() => document.querySelector("#co-pay .rc-note")?.textContent?.trim())})`);
        continue;
      }
      const label = (await place.textContent()).replace(/\s+/g, " ").trim();
      await place.scrollIntoViewIfNeeded();
      await place.click();
      const opened = await page
        .waitForSelector(".s--storefront-master-payment-dialog .v-card", { state: "visible", timeout: 20000 })
        .then(() => true)
        .catch(() => false);
      if (!opened) {
        const miss = await page.evaluate(() => [...document.querySelectorAll(".co-alert li, .co-alert, #co-pay .rc-note")].map((x) => x.textContent.replace(/\s+/g, " ").trim()).join(" ; "));
        bad(W, `way "${w.name}": "${label}" did not open the payment window (${miss})`);
        await shot(`09-noplace-${slug(w.name)}`, true);
        continue;
      }
      await sleep(3500);
      const pay = await page.evaluate(() => {
        const d = document.querySelector(".s--storefront-master-payment-dialog");
        const r = d.getBoundingClientRect();
        return { text: d.innerText.replace(/\s+/g, " ").trim().slice(0, 300), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], over: d.scrollWidth > d.clientWidth + 1 };
      });
      console.log(`  way "${w.name}": "${label}" → payment window [${pay.box}]${pay.over ? " SIDE-SCROLL" : ""}: ${pay.text}`);
      if (pay.box[2] > W + 1 || pay.box[0] < -1) bad(W, `payment window is off the screen: ${pay.box}`);
      /* when the button names an amount, it and the payment window's total are the same bill (a stale bill shows
         another; the base's check had a broken pattern, /$[d.,]+/, and never compared) */
      const btnTotal = (label.match(/(\d[\d.,]*\d)/) || [])[1];
      const payTotal = (pay.text.match(/TOTAL PAYMENT\s*\D{0,4}(\d[\d.,]*\d)/i) || [])[1];
      if (btnTotal && payTotal && btnTotal !== payTotal) bad(W, `way "${w.name}": the button says ${btnTotal}, the payment window ${payTotal}`);
      await shot(`10-payment-${slug(w.name)}`);
      const x = page.locator(".s--storefront-master-payment-dialog .v-toolbar .v-btn").last();
      if (await x.count()) await x.click();
      else await page.keyboard.press("Escape");
      await page.waitForSelector(".s--storefront-master-payment-dialog .v-card", { state: "hidden", timeout: 10000 }).catch(() => bad(W, "the payment window did not close with its ✕"));
      await sleep(1500);
    }
  } catch (e) {
    bad(W, "walk stopped: " + e.message.split("\n")[0]);
    await shot("99-stopped", true).catch(() => {});
  }

  // ── leave the guest bag empty
  try {
    await push("/basket/PHYSICAL");
    await sleep(3500);
    for (let i = 0; i < 6; i++) {
      const x = await page.$(".ly-cartpage .cr-rm");
      if (!x) break;
      await x.click();
      await sleep(2500);
    }
    const left = await page.evaluate(() => document.querySelectorAll(".ly-cartpage .cr-rm").length);
    console.log(`  bag emptied: ${left ? left + " line(s) LEFT" : "yes"}`);
    if (left) bad(W, "the bag is not empty at the end");
    await shot("11-bag-empty");
  } catch (e) {
    bad(W, "emptying the bag: " + e.message.split("\n")[0]);
  }
  if (errors.length) bad(W, "page errors: " + errors.join(" | "));
  if (blocked.length) bad(W, "BLOCKED buy calls (the walk pressed something it must not): " + blocked.join(" | "));
  await ctx.close();
}
await browser.close();
console.log(problems ? `\nWALK PROBLEMS ${problems}` : "\nWALK OK");
process.exit(problems ? 1 : 0);
