<!--
  Depot: the hero (design depot.js home(), Acme's top board): the big photo panel with the line and "Shop now"; beside
  it the live offers ("Up to n% off" with three of them), else the newest tools; under them the quick links (deals
  only with live offers, what's new, kits and bare tools only when the products' own spec has them, the pickup point
  only with one, else delivery and returns). On a phone the photo sits above the words.
-->
<template>
  <section :aria-label="t('dp.home.heroAria', 'Featured')" class="dp-sec-h dp-hero">
    <div class="wrap">
      <div class="dp-hero-g">
        <router-link :class="['dp-hero-main', { nophoto: !photo }]" :to="shopTo">
          <picture v-if="photo">
            <source v-if="photoSq" :srcset="photoSq" media="(max-width: 560px)" />
            <img :src="photo" alt="" class="dp-hero-img" decoding="async" fetchpriority="high" />
          </picture>
          <span v-else-if="best[0]" aria-hidden="true" class="dp-hero-cut"><img :src="img(best[0])" alt="" /></span>
          <span class="dp-hero-t">
            <span class="dp-kick">{{ t("dp.home.heroKick", "Tools for every job") }}</span>
            <b>{{ t("dp.home.heroH", "Drill, cut, sand, measure, fix") }}</b>
            <span class="dp-hero-d">{{ t("dp.home.heroP", "Every tool with its full spec sheet. Compare before you buy.") }}</span>
            <span class="btn">{{ t("dp.home.shopNow", "Shop now") }}<ly-icon name="arrow" /></span>
          </span>
        </router-link>
        <router-link v-if="offers.length" :to="dealsTo" class="dp-hero-deal">
          <span class="dp-kick">{{ t("dp.home.liveOffers", "Live offers") }}</span>
          <b>{{ t("dp.home.upTo", "Up to {n}% off", { n: offMax }) }}</b>
          <span>{{ t("dp.home.offersP", "Price drops on tools across the shop") }}</span>
          <span class="dp-hero-imgs"><span v-for="p in offers.slice(0, 3)" :key="p.id" class="dp-pic"><img :src="img(p)" alt="" /></span></span>
          <span class="btn sm dp-btn-w">{{ t("dp.home.seeDeals", "See the deals") }}</span>
        </router-link>
        <router-link v-else-if="newest.length" :to="newTo" class="dp-hero-deal">
          <span class="dp-kick">{{ t("dp.home.justIn", "Just in") }}</span>
          <b>{{ t("dp.hdr.whatsNew", "What's new") }}</b>
          <span>{{ t("dp.home.newP", "The newest tools in the shop") }}</span>
          <span class="dp-hero-imgs"><span v-for="p in newest.slice(0, 3)" :key="p.id" class="dp-pic"><img :src="img(p)" alt="" /></span></span>
          <span class="btn sm dp-btn-w">{{ t("dp.home.seeNew", "See what's new") }}</span>
        </router-link>
      </div>
      <nav :aria-label="t('dp.home.quick', 'Quick links')" class="dp-quick">
        <router-link v-for="q in quick" :key="q.k" :to="q.to"><ly-icon :name="q.icon" />{{ q.label }}</router-link>
      </nav>
    </div>
  </section>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import dpHome from "./dp-home";

export default {
  name: "DpHero",
  components: { LyIcon },
  mixins: [dpHome],
  computed: {
    photo() {
      return this.slot("hero");
    },
    photoSq() {
      return this.slot("hero-sq");
    },
    quick() {
      void this.region.language;
      const out = [];
      if (this.offers.length) out.push({ k: "deals", icon: "tag", label: this.t("ly.hdr.deals", "Deals"), to: this.dealsTo });
      out.push({ k: "new", icon: "bolt", label: this.t("dp.hdr.whatsNew", "What's new"), to: this.newTo });
      if (this.kits.length) out.push({ k: "kit", icon: "box", label: this.t("dp.ftr.kits", "Tool kits"), to: this.kitTo("kit") });
      if (this.bares.length) out.push({ k: "bare", icon: "battery", label: this.t("dp.home.bare", "Bare tools"), to: this.kitTo("bare") });
      if (this.point) out.push({ k: "pickup", icon: "store", label: this.t("dp.hdr.pickupPoint", "Pickup point"), to: { name: "DpPickup" } });
      else out.push({ k: "help", icon: "truck", label: this.t("dp.hdr.delivery", "Delivery and returns"), to: { name: "DpDelivery" } });
      return out;
    },
  },
};
</script>
