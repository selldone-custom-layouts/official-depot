/*
 * Depot: the tool superstore's own reads of the live catalogue (design: toolino-design/designs/depot.js and
 * shared/core.js). Nothing here names a product, brand, department or price of one shop: every value comes from
 * the products' own fields (brand, sku, spec, pros) and the shop's settings, so another shop gets its own.
 *
 * - brands: the products' own brand field, A to Z;
 * - kit or bare tool: only from a cordless tool's own spec rows ("Battery Included", "Power Package"); a tool
 *   without those rows is neither;
 * - batteries that fit a bare tool: products whose own "Tool Platform" names the tool's brand and voltage;
 * - key specs: the department's filter keys first, then the product's own highlights (pros);
 * - the filters of a department: spec keys most of its products share, with a few values each (never a key that
 *   is different on every product, never a sentence).
 */
import { bySells, inCat, ly, priceView, specGroups } from "../ly";
import { percentOff } from "../../kalio/kalio-catalog";

/** Every spec row of a product as one map (key -> text). */
export function specMap(p: any): Record<string, string> {
  const m: Record<string, string> = {};
  for (const g of specGroups(p)) for (const [k, v] of g.rows) if (!(k in m)) m[k] = v;
  return m;
}

export function specOf(p: any, re: RegExp): { key: string; value: string } | null {
  const m = specMap(p);
  const k = Object.keys(m).find((x) => re.test(x));
  return k ? { key: k, value: m[k] } : null;
}

/** The brands of the shop's products, A to Z. */
export function brands(): string[] {
  return [...new Set(ly.products.map((p) => String(p.brand || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function byBrand(b: string): any[] {
  return ly.products.filter((p) => String(p.brand || "").trim() === b);
}

/** "NX-D20C": the product's own SKU, else none. */
export function skuOf(p: any): string {
  return String(p?.sku || "").trim();
}

/** The title without its leading brand ("20V Compact Drill Driver Kit"). */
export function shortTitle(p: any): string {
  const t = String(p?.title || "");
  const b = String(p?.brand || "").trim();
  return b && t.toLowerCase().startsWith(b.toLowerCase() + " ") ? t.slice(b.length).trim() : t;
}

export interface KitInfo {
  kind: "kit" | "bare";
  text: string;
}

const KIT_ROW = /batter(y|ies)( pack)? included|power package/i;
const CORDLESS = /cordless|rechargeable|battery/i;

/** Kit (battery and charger in the box) or bare tool, from the product's own spec rows only. */
export function kitOf(p: any): KitInfo | null {
  const m = specMap(p);
  const row = Object.keys(m).find((k) => KIT_ROW.test(k));
  if (!row) return null;
  const src = specOf(p, /^power source$/i)?.value || "";
  const v = m[row];
  if (!CORDLESS.test(src + " " + v)) return null;
  if (/sold separately|^no\b|not included|^none$/i.test(v)) return { kind: "bare", text: v };
  if (/\d(\.\d)?\s*ah|battery and charger|integrated|^yes\b/i.test(v)) return { kind: "kit", text: v };
  return null;
}

/** The tool's voltage (20 from "20 V max"), else null. */
export function voltOf(p: any): number | null {
  const v = specOf(p, /^voltage$/i)?.value || "";
  const m = v.match(/(\d+(?:\.\d+)?)\s*V\b/i);
  return m ? Number(m[1]) : null;
}

/** The products whose own "Tool Platform" names this tool's brand and voltage (the batteries and chargers that fit). */
export function fitsFor(p: any): any[] {
  const v = voltOf(p);
  const b = String(p?.brand || "").trim();
  if (!v || !b) return [];
  const re = new RegExp("\\b" + String(v).replace(".", "\\.") + "\\s*V", "i");
  return ly.products.filter((q) => {
    if (q.id === p.id) return false;
    const pf = specOf(q, /^tool platform$/i)?.value || "";
    return pf.toLowerCase().includes(b.toLowerCase()) && re.test(pf);
  });
}

/** The items "in the box", from the product's own "Included Items" row. */
export function inBoxOf(p: any): string[] {
  const v = specOf(p, /^(included items|in the box|what'?s in the box|package contents)$/i)?.value || "";
  return v
    .split(/,\s*|;\s*/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/* A spec value this long is a note, not a filter value. */
const LONG = 40;

export interface Facet {
  key: string;
  values: string[];
}

/** A department's filters from its products' own spec: keys at least half of them share, with 2 to 12 values,
    never a key whose value differs on every product (a model line, a speed range), never a sentence. In the
    merchant's own spec order. */
export function facetsOf(list: any[]): Facet[] {
  const n = list.length;
  if (!n) return [];
  const order: string[] = [];
  const map = new Map<string, Map<string, number>>();
  for (const p of list) {
    for (const g of specGroups(p)) {
      for (const [k, v] of g.rows) {
        if (!map.has(k)) {
          map.set(k, new Map());
          order.push(k);
        }
        const vals = map.get(k)!;
        vals.set(v, (vals.get(v) || 0) + 1);
      }
    }
  }
  const out: Facet[] = [];
  for (const k of order) {
    if (KIT_ROW.test(k) || /^(included items|in the box|tool platform)$/i.test(k)) continue;
    const vals = map.get(k)!;
    const covered = [...vals.values()].reduce((a, b) => a + b, 0);
    const values = [...vals.keys()];
    if (covered < Math.ceil(n / 2)) continue;
    if (values.length < 2 || values.length > 12) continue;
    if (n >= 4 && values.length >= n) continue;
    if (values.some((v) => v.length > LONG)) continue;
    out.push({ key: k, values: values.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) });
  }
  return out;
}

/** The department's key specs for a card or the buy box: its filter keys first (not the "type" row), then the
    product's own highlights. */
export function keySpecs(p: any, n = 3, facetKeys: string[] | null = null): [string, string][] {
  const m = specMap(p);
  const keys = facetKeys || facetsOf(inCat(p.category_id)).map((f) => f.key);
  const out: [string, string][] = [];
  for (const k of keys) if (m[k] && out.length < n && !/\btype$/i.test(k)) out.push([k, m[k]]);
  const pros = p?.pros && typeof p.pros === "object" && !Array.isArray(p.pros) ? p.pros : {};
  for (const [k, v] of Object.entries(pros)) if (out.length < n && v && !out.find((x) => x[0] === k)) out.push([k, String(v)]);
  for (const [k, v] of Object.entries(m)) if (out.length < n && !out.find((x) => x[0] === k) && v.length <= LONG && !KIT_ROW.test(k)) out.push([k, v]);
  return out.slice(0, n);
}

/** The products on a live offer, the biggest saving (percent) first. */
export function offersOf(shop: any): any[] {
  return ly.products.filter((p) => percentOff(shop, p) > 0).sort((a, b) => percentOff(shop, b) - percentOff(shop, a) || priceView(shop, b).save - priceView(shop, a).save || a.id - b.id);
}

/** The newest products first. */
export function newestOf(): any[] {
  return [...ly.products].sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")) || b.id - a.id);
}

/** Most sold first, the shop's order on a tie. */
export function popularOf(): any[] {
  return bySells(ly.products);
}

/** Four round price bands that split the live prices (quartiles), each { min, max } (the last open-ended). */
export function priceBands(prices: number[]): { min: number; max: number | null }[] {
  const s = [...prices].filter((x) => x > 0).sort((a, b) => a - b);
  if (s.length < 4) return [];
  const round = (v: number) => {
    const step = v < 50 ? 10 : v < 200 ? 25 : v < 1000 ? 50 : 100;
    return Math.max(step, Math.round(v / step) * step);
  };
  const cuts = [...new Set([0.25, 0.5, 0.75].map((q) => round(s[Math.floor(q * (s.length - 1))])))].sort((a, b) => a - b);
  const out: { min: number; max: number | null }[] = [];
  let lo = 0;
  for (const c of cuts) {
    if (c <= lo) continue;
    out.push({ min: lo, max: c });
    lo = c;
  }
  out.push({ min: lo, max: null });
  return out.length > 1 ? out : [];
}

/** A short line about a delivery way ("Delivered to your door", "Within 30 km of the shop", "Free · collect when it's ready"). */
export function firstPickupPoint(shop: any): any | null {
  const tr = (shop?.transportations || []).find((x: any) => x && x.enable !== false && x.type === "Pickup");
  return tr && Array.isArray(tr.pickups) && tr.pickups.length ? tr.pickups[0] : null;
}

/** A delivery way's short line in the Layout's words: door delivery with no real limit, a radius, shipping, or the
    pickup point (free when it costs nothing). */
export function wayNote(w: any, tr: (k: string, d: string, v?: any) => string): string {
  if (!w) return "";
  if (w.pickup) return w.free || !w.fee ? tr("dp.way.pickupFree", "Free · collect when it's ready") : tr("dp.way.pickup", "Collect when it's ready");
  if (w.type === "Global" || w.type === "Post") return tr("dp.way.ship", "Shipped to your address");
  const d = Number(w.distance) || 0;
  if (d > 0 && d < 1000) return tr("dp.way.within", "Within {km} km of the shop", { km: d });
  return tr("dp.way.door", "Delivered to your door");
}
