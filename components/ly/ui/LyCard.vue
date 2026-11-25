<!--
  Depot: the product card of a tool superstore (design depot.js card()). Three shapes, one look:

  - grid (default): the brand plate and the save heart on top, the tool on a white plate, the name (two lines), the
    SKU, the stock and "Kit" / "Bare tool" (only from the product's own spec), the price with its cents raised and the
    struck was-price, the saving, then "Add to cart" (− n + in place) beside a Compare tick (Selldone's comparison);
  - h: the Explore band's horizontal card: the brand plate and a flag, the name, then the photo beside the SKU, the
    stock, the price with the saving and a small Add;
  - row: a compact line (photo, name, price) for the home's popular list and the mega menu.

  The brand plate opens the brand's tools. Nothing names a product, brand or price: all from the live record.
-->
<template>
  <a v-if="variant === 'row'" :class="['dp-row', cls]" :href="href" @click.prevent="go">
    <span class="dp-pic"><img :src="thumb" alt="" decoding="async" loading="lazy" /></span>
    <span class="dp-row-b"
      ><span class="dp-row-t"><bdi>{{ product.title }}</bdi></span
      ><span class="dp-row-p"><dp-money :amount="pv.now" /><span v-if="pv.off > 0" class="dp-off sm">{{ t("dp.card.off", "{n}% off", { n: pv.off }) }}</span></span></span
    >
  </a>

  <article v-else-if="variant === 'h'" :class="['dp-hc', cls]" :style="delay != null ? { '--d': delay + 'ms' } : null">
    <div class="dp-hc-top">
      <router-link v-if="brand" :to="brandTo" class="brand-plate"><bdi>{{ brand }}</bdi></router-link>
      <span v-if="pv.off > 0" class="dp-flag">{{ t("dp.card.priceDrop", "Price drop") }}</span>
      <span v-else-if="kit" class="dp-flag dp-flag-m">{{ kitWord }}</span>
    </div>
    <h3 class="dp-hc-t">
      <router-link :to="to"><bdi>{{ product.title }}</bdi></router-link>
    </h3>
    <div class="dp-hc-g">
      <router-link :to="to" aria-hidden="true" class="dp-pic" tabindex="-1"><img :loading="eager ? 'eager' : 'lazy'" :src="img" alt="" decoding="async" height="320" width="320" @error="dropSrcset" /></router-link>
      <div class="dp-hc-i">
        <span v-if="sku" class="dp-sku" dir="ltr">{{ t("dp.card.sku", "SKU") }}# {{ sku }}</span>
        <span :class="['dp-stock', stockCls]"><ly-icon v-if="stock > 0" name="check" />{{ stockWord }}</span>
        <div class="dp-pr"><dp-money :amount="pv.now" /><span v-if="pv.off > 0" class="dp-off"><ly-icon name="tag" />{{ t("dp.card.off", "{n}% off", { n: pv.off }) }}</span></div>
        <div class="dp-hc-add"><ly-add :label="t('dp.card.add', 'Add')" :product="product" /></div>
      </div>
    </div>
  </article>

  <article v-else :class="['pc', 'dp-card', cls]" :style="delay != null ? { '--d': delay + 'ms' } : null">
    <div class="dp-card-top">
      <router-link v-if="brand" :to="brandTo" class="brand-plate"><bdi>{{ brand }}</bdi></router-link>
      <span v-else></span>
      <button
        :aria-label="isSaved ? t('dp.card.unsave', 'Remove {name} from saved', { name: product.title }) : t('dp.card.save', 'Save {name}', { name: product.title })"
        :aria-pressed="isSaved ? 'true' : 'false'"
        :class="['dp-heart', { on: isSaved }]"
        type="button"
        @click="save"
      >
        <ly-icon name="heart" />
      </button>
    </div>
    <router-link :to="to" aria-hidden="true" class="dp-pic" tabindex="-1">
      <img
        :loading="eager ? 'eager' : 'lazy'"
        :src="img"
        :srcset="srcset"
        alt=""
        decoding="async"
        draggable="false"
        height="640"
        sizes="(max-width: 760px) 44vw, 240px"
        width="640"
        @error="dropSrcset"
      />
    </router-link>
    <button :aria-label="t('ly.card.quick', 'Quick view: {name}', { name: product.title })" aria-controls="qv" class="dp-qv" type="button" @click="quick($event)">
      <ly-icon name="eye" />
    </button>
    <h3 class="pc-t dp-card-t">
      <router-link :to="to"><bdi>{{ product.title }}</bdi></router-link>
    </h3>
    <span v-if="sku" class="dp-sku" dir="ltr">{{ t("dp.card.sku", "SKU") }}# {{ sku }}</span>
    <div class="dp-card-m">
      <span :class="['dp-stock', stockCls]"><ly-icon v-if="stock > 0" name="check" />{{ stockWord }}</span>
      <span v-if="kit" :class="['dp-kit', kit.kind]">{{ kitWord }}</span>
    </div>
    <div class="dp-pr"><dp-money :amount="pv.now" /><s v-if="pv.was" class="was money">{{ money(pv.was) }}</s></div>
    <div class="dp-card-off">
      <span v-if="pv.off > 0" class="dp-off"><ly-icon name="tag" />{{ t("dp.card.saveAmt", "Save {amount}", { amount: money(pv.save) }) }}</span>
    </div>
    <div class="dp-card-b">
      <div class="pc-add"><ly-add :label="t('dp.card.addCart', 'Add to cart')" :product="product" /></div>
      <label class="dp-cmp">
        <span class="cbx-w"><input :checked="comparing" class="cbx" type="checkbox" @change="toggleCompare" /><ly-icon cls="cbx-i" name="check" /></span>
        <span>{{ t("dp.card.compare", "Compare") }}</span>
      </label>
    </div>
  </article>
</template>

<script>
import LyIcon from "../LyIcon.vue";
import LyAdd from "../LyAdd.vue";
import DpMoney from "../depot/DpMoney.vue";
import { money, openQuick, priceView, productImage, productTo } from "../ly";
import { catalogueRoute, dropSrcset, productSrcset } from "../../kalio/kalio-catalog";
import { saved, toggleSaved } from "../../bakini/bakini";
import { currentCurrency } from "../../region-switcher/region";
import { kitOf, skuOf } from "../depot/dp";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "LyCard",
  components: { LyIcon, LyAdd, DpMoney },
  props: {
    product: { type: Object, required: true },
    variant: { type: String, default: "grid" },
    noCat: Boolean,
    eager: Boolean,
    cls: { type: [String, Array, Object], default: "" },
    delay: { type: Number, default: null },
  },
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    pv() {
      void currentCurrency();
      return priceView(this.shop, this.product);
    },
    to() {
      return productTo(this.product);
    },
    href() {
      return this.$router.resolve(this.to).href;
    },
    img() {
      return productImage(this.product);
    },
    thumb() {
      return productImage(this.product, 128);
    },
    srcset() {
      return productSrcset(this.product);
    },
    brand() {
      return String(this.product.brand || "").trim();
    },
    brandTo() {
      return catalogueRoute({ brand: this.brand });
    },
    sku() {
      return skuOf(this.product);
    },
    kit() {
      return kitOf(this.product);
    },
    kitWord() {
      return this.kit?.kind === "kit" ? t("dp.kit.kit", "Kit") : t("dp.kit.bare", "Bare tool");
    },
    stock() {
      return Number(this.product.quantity) || 0;
    },
    stockCls() {
      return this.stock <= 0 ? "out" : this.stock <= 5 ? "low" : "in";
    },
    stockWord() {
      if (this.stock <= 0) return t("dp.stock.out", "Out of stock");
      if (this.stock <= 5) return t("dp.stock.low", "Only {n} left", { n: this.stock });
      return t("dp.stock.in", "In stock");
    },
    isSaved() {
      return saved[this.product.id] ?? !!this.product.wishlist;
    },
    comparing() {
      return (this.$store.getters.getProductsComparison || []).some((p) => p.id === this.product.id);
    },
  },
  methods: {
    t,
    money,
    dropSrcset,
    go() {
      this.$router.push(this.to);
    },
    quick(e) {
      openQuick(this.product, e.currentTarget);
    },
    save() {
      toggleSaved(this, this.product);
    },
    toggleCompare() {
      if (this.comparing) this.removeFromProductComparison(this.product, null);
      else this.addToProductComparison(this.product, null, true);
    },
  },
};
</script>
