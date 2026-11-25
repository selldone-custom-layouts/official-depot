/*
 * Depot: the home's shared reads (every components/ly/depot/home/Dp*.vue uses this mixin). Only live data: the
 * shop's departments, products, offers, brands, delivery ways and pickup point. A section that has nothing to show
 * hides itself; nothing names a product, brand, department or price.
 */
import { bySells, catImage, catTitle, catTo, deliveryWays, inCat, isLocalWay, ly, money, priceView, productImage, productTo, shopFacts, wayIconOf } from "../../ly";
import { catalogueRoute, dealsRoute, percentOff } from "../../../kalio/kalio-catalog";
import { collectionPhoto, slotPhoto } from "../../ly-photos";
import { currentCurrency, regionState } from "../../../region-switcher/region";
import { brands, byBrand, firstPickupPoint, kitOf, newestOf, offersOf, shortTitle, wayNote } from "../dp";
import { t } from "../../../kalio/i18n/kalio-i18n";

export default {
  props: {
    variant: { type: String, default: "" },
    band: { type: Boolean, default: false },
  },

  data: () => ({ ly, region: regionState }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    currency() {
      return currentCurrency();
    },
    shopName() {
      const n = this.shop?.title || "";
      return n.charAt(0).toUpperCase() + n.slice(1);
    },
    cats() {
      return this.ly.cats.filter((c) => inCat(c.id).length);
    },
    products() {
      return this.ly.products;
    },
    offers() {
      void this.currency;
      return offersOf(this.shop);
    },
    offMax() {
      return this.offers.length ? Math.max(...this.offers.map((p) => this.off(p))) : 0;
    },
    newest() {
      return newestOf();
    },
    best() {
      return bySells(this.products);
    },
    kits() {
      return this.products.filter((p) => kitOf(p)?.kind === "kit");
    },
    bares() {
      return this.products.filter((p) => kitOf(p)?.kind === "bare");
    },
    brandNames() {
      return brands();
    },
    ways() {
      return deliveryWays(this.shop);
    },
    doorWays() {
      return this.ways.filter((w) => !w.pickup);
    },
    point() {
      return firstPickupPoint(this.shop);
    },
    cod() {
      const f = shopFacts(this.shop);
      return !!(f.gateway?.cod || (f.gateways || []).some((g) => g.cod) || this.ways.some((w) => w.cod));
    },
    shopTo() {
      return catalogueRoute({ sort: "featured" });
    },
    dealsTo() {
      return dealsRoute();
    },
    newTo() {
      return catalogueRoute({ sort: "newest" });
    },
  },

  methods: {
    t,
    money,
    catTitle,
    catTo,
    productTo,
    shortTitle,
    byBrand,
    isLocalWay,
    wayIcon: wayIconOf,
    pv(p) {
      void this.currency;
      return priceView(this.shop, p);
    },
    off(p) {
      void this.currency;
      return percentOff(this.shop, p);
    },
    img(p, small = false) {
      return productImage(p, small ? 128 : null);
    },
    catImg(c) {
      const own = catImage(c, 128);
      if (own) return own;
      const top = bySells(inCat(c.id))[0];
      return top ? productImage(top, 128) : null;
    },
    colPhoto(c) {
      return collectionPhoto(c);
    },
    slot(name) {
      return slotPhoto(name);
    },
    brandTo(b) {
      return catalogueRoute({ brand: b });
    },
    kitTo(kind) {
      return catalogueRoute({ kit: kind });
    },
    note(w) {
      void this.region.language;
      return wayNote(w, t);
    },
  },
};
