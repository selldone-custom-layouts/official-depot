<!--
  Depot: the promo board (Acme's: departments list, a big promo, two brand banners, the popular list). The departments
  with their own image; the kit promo only when the products' own spec has kits (else "Shop all tools"); two brand
  banners from the brands with live offers ("Save up to n%"), else the brands with the most tools; the popular list:
  the best sellers (Selldone's sells), the shop's order on a tie.
-->
<template>
  <section v-if="cats.length" :aria-label="t('dp.home.boardAria', 'Shop the store')" class="dp-sec-h dp-board">
    <div class="wrap dp-board-g">
      <aside class="dp-trend">
        <h3><ly-icon name="grid" />{{ t("dp.home.shopDepts", "Shop departments") }}</h3>
        <ul>
          <li v-for="c in cats" :key="c.id">
            <router-link :to="catTo(c)"
              ><span class="dp-pic"><img v-if="catImg(c)" :src="catImg(c)" alt="" loading="lazy" /></span><span><bdi>{{ catTitle(c) }}</bdi></span><ly-icon cls="chev" name="right"
            /></router-link>
          </li>
        </ul>
      </aside>
      <div class="dp-board-c">
        <router-link :to="kits.length ? kitTo('kit') : shopTo" class="dp-promo">
          <img v-if="promoPhoto" :src="promoPhoto" alt="" loading="lazy" />
          <span class="dp-promo-t">
            <span class="dp-kick">{{ kits.length ? t("dp.ftr.kits", "Tool kits") : t("dp.home.shopAllK", "Shop all") }}</span>
            <b>{{ kits.length ? t("dp.home.kitH", "Battery and charger in the box") : t("dp.home.allH", "Every tool with its full spec sheet") }}</b>
            <span>{{ kits.length ? t("dp.home.kitP", "Cordless kits ready to work the day they arrive.") : t("dp.home.allP", "Compare like with like, then choose how it reaches you.") }}</span>
            <span class="btn sm">{{ kits.length ? t("dp.home.shopKits", "Shop kits") : t("dp.ftr.allTools", "Shop all tools") }}<ly-icon name="arrow" /></span>
          </span>
        </router-link>
        <div v-if="banners.length" class="dp-board-2">
          <router-link v-for="(b, i) in banners" :key="b.name" :class="['dp-bb', i ? 's1' : 's0']" :to="b.to">
            <span class="brand-word"><bdi>{{ b.name }}</bdi></span>
            <b>{{ b.off ? t("dp.home.saveUpTo", "Save up to {n}%", { n: b.off }) : t("dp.home.shopBrand", "Shop the brand") }}</b>
            <span class="dp-bb-d">{{ b.off ? t("dp.home.onSelect", "on select {brand} tools", { brand: b.name }) : t("dp.home.brandP", "{brand} tools across the shop", { brand: b.name }) }}</span>
            <span v-if="b.top" aria-hidden="true" class="dp-pic"><img :src="img(b.top)" alt="" loading="lazy" /></span>
            <span class="btn sm dp-btn-w">{{ t("dp.home.shopNow", "Shop now") }}</span>
          </router-link>
        </div>
      </div>
      <aside class="dp-trend prod">
        <h3><ly-icon name="star" />{{ t("dp.home.popular", "Popular right now") }}</h3>
        <div class="dp-trend-p">
          <ly-card v-for="p in best.slice(0, 7)" :key="p.id" :product="p" variant="row" />
        </div>
      </aside>
    </div>
  </section>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import LyCard from "../../ui/LyCard.vue";
import dpHome from "./dp-home";
import { bySells } from "../../ly";
import { dealsRoute } from "../../../kalio/kalio-catalog";

export default {
  name: "DpBoard",
  components: { LyIcon, LyCard },
  mixins: [dpHome],
  computed: {
    promoPhoto() {
      return this.kits.length ? this.slot("promo-kit") : this.slot("promo-delivery") || this.slot("promo-kit");
    },
    banners() {
      const withOffers = this.brandNames
        .map((name) => {
          const on = this.offers.filter((p) => String(p.brand || "").trim() === name);
          return { name, on, off: on.length ? Math.max(...on.map((p) => this.off(p))) : 0 };
        })
        .filter((x) => x.on.length)
        .sort((a, b) => b.on.length - a.on.length || b.off - a.off)
        .map((x) => ({ name: x.name, off: x.off, top: x.on[0], to: { ...dealsRoute(), query: { ...(dealsRoute().query || {}), brand: x.name } } }));
      const rest = this.brandNames
        .filter((n) => !withOffers.find((x) => x.name === n))
        .map((name) => ({ name, list: this.byBrand(name) }))
        .sort((a, b) => b.list.length - a.list.length)
        .map((x) => ({ name: x.name, off: 0, top: bySells(x.list)[0], to: this.brandTo(x.name) }));
      return [...withOffers, ...rest].slice(0, 2);
    },
  },
};
</script>
