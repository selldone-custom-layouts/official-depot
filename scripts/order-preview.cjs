// node scripts/order-preview.cjs <outdir> [widths=1440,390] — the order page and its messages, drawn on the dev server
// from a made-up order answered inside this test browser only (Storybook's scripts/order-preview.cjs made generic,
// Toychi sync 25 Nov 2026). Nothing is ordered: the order request never leaves the browser, chat posts and every
// /buy/ call are aborted. The checks can't reach the order page otherwise (it needs a real order).
// env: ORIGIN (default the skin's dev server), DARK=1, AR=1, CHAT=0 (no messages),
//      STATE=CheckQueue|PreparingOrder|SentOrder|ToCustomer, WAY=<a delivery type> (default the shop's first way to the
//      door), PRODUCTS=<id,id> (default the skin's checks.product and product2)
const { chromium } = require(process.env.PW || (() => { try { return require.resolve("playwright"); } catch { return require("path").resolve(__dirname, "../../kalio-marketplace/node_modules/playwright"); } })());
const fs = require("fs");
const path = require("path");
const FC = JSON.parse(fs.readFileSync(path.join(__dirname, "../checks/fast-checks.json"), "utf8"));
const { skin } = require("./lib/skin.cjs").readSkin(path.resolve(__dirname, ".."));
const OUT = process.argv[2] || ".shots/order";
const WIDTHS = (process.argv[3] || "1440,390").split(",").map(Number);
const ORIGIN = (process.env.ORIGIN || FC.dev).replace(/\/$/, "");
const IDS = (process.env.PRODUCTS || [skin.checks?.product, skin.checks?.product2].filter(Boolean).join(",")).split(",").filter(Boolean).map(Number);
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch();
  for (const W of WIDTHS) {
    const ctx = await b.newContext({ viewport: { width: W, height: W < 600 ? 844 : 900 }, userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36" });
    await ctx.addInitScript(([dark, ar, st, palette, shop, shopId]) => {
      if (shopId) window.__THEME_SWITCHER_SHOP__ = { id: shopId };
      try {
        localStorage.setItem(st.splash, "1");
        if (dark) localStorage.setItem(st.theme, JSON.stringify({ palette, mode: "dark" }));
        if (ar) { localStorage.setItem("local-shop-" + shop, "ar"); localStorage.setItem(st.devLanguages, "ar"); }
      } catch {}
    }, [process.env.DARK === "1", process.env.AR === "1", FC.storage, FC.brand, FC.shop, skin.shop.id || 0]);
    await ctx.route(/selldone\.com\/.*\/buy\//, (r) => r.abort());
    const p = await ctx.newPage();
    p.setDefaultTimeout(60000);
    p.on("pageerror", (e) => console.log("PAGEERROR", e.message.slice(0, 200)));
    await p.goto(ORIGIN + "/", { waitUntil: "load" });
    await p.waitForSelector(FC.wait || ".ly .ftr", { timeout: 90000 });
    await p.waitForTimeout(2500);
    /* the shop's own products and its first way to the door, read in the page */
    const live = await p.evaluate(async (ids) => {
      const out = [];
      for (const id of ids) {
        const r = await fetch(window.XAPI.GET_PRODUCT_INFO(window.$storefront.name, id));
        out.push(r.ok ? (await r.json()).product : null);
      }
      const shop = window.$global_store?.getters?.getShop || window.$storefront?.shop || {};
      const way = (shop.transportations || []).find((x) => x && x.enable !== false && x.type !== "Pickup");
      return { products: out.filter(Boolean), way: way?.type || "Motorbike", title: shop.title || "" };
    }, IDS);
    const now = new Date();
    const iso = (d) => d.toISOString().slice(0, 19).replace("T", " ");
    const items = live.products.map((x, i) => ({ id: i + 1, product_id: x.id, product: x, variant: null, variant_id: null, count: i === 0 ? 1 : 2, price: x.price, dis: 0, currency: x.currency || "USD", offer_amount: 0 }));
    const sum = items.reduce((s, it) => s + it.price * it.count, 0);
    const chat =
      process.env.CHAT === "0"
        ? []
        : [
            { body: "Hello! Could the order be wrapped as a gift?", date: iso(new Date(now - 50 * 60e3)) },
            { body: "Of course. We'll wrap it and add a blank card for your note.", date: iso(new Date(now - 35 * 60e3)), officer: { name: live.title || "Shop" } },
          ];
    const way = process.env.WAY || live.way;
    const basket = {
      id: 900001, type: "PHYSICAL", status: "COD", delivery_state: process.env.STATE || "PreparingOrder", currency: items[0]?.currency || "USD", code: "mock",
      created_at: iso(new Date(now - 2 * 3600e3)), updated_at: iso(now), reserved_at: iso(new Date(now - 2 * 3600e3)), delivery_at: null,
      price: sum, tax: 0, tax_included: false, tax_shipping: 0, delivery_price: 0, discount: 0,
      items,
      /* a made-up buyer (no shop's address) */
      receiver_info: { name: "Sample Buyer", address: "12 Sample Street", no: "4", city: "Sample City", state: "", postal: "00000", country: skin.shop.country || "US", phone: "+10000000000", location: null },
      delivery_info: { type: way, time_spans: ["Morning"] }, transportation: { type: way },
      payment: null, payment_type: "cod", chat, gift_cards: [], transactions_pending: [], vendor_orders: [], billing: null, user: null, customer: null, form: null,
    };
    await ctx.route(/\/baskets\/900001(\/|\?|$)/, (r) => {
      if (r.request().method() === "GET" && /\/baskets\/900001(\?|$)/.test(r.request().url())) return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ basket }) });
      return r.abort();
    });
    await p.evaluate((r) => window.$global_router.push(r), "/orders/physical/SM-900001");
    await p.waitForTimeout(8000);
    const tag = `${W}${process.env.DARK === "1" ? "-dark" : ""}${process.env.AR === "1" ? "-ar" : ""}${process.env.CHAT === "0" ? "-nochat" : ""}`;
    await p.screenshot({ path: path.join(OUT, `order-${tag}.png`), fullPage: true });
    console.log("order", tag, way, await p.evaluate(() => (document.querySelector(".ly .od, .ly-order, main")?.innerText || "").replace(/\s+/g, " ").slice(0, 260)));
    await ctx.close();
  }
  await b.close();
})();
