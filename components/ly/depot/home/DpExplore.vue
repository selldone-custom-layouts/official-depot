<!-- Depot: "Explore products" on the family-dark band (Acme's tabbed band): Featured (the live offers, else the best
     sellers), the departments with the most tools, New products; horizontal cards, eight a tab. -->
<template>
  <section v-if="tabs.length" :aria-label="t('dp.home.explore', 'Explore products')" class="dp-explore">
    <div class="wrap">
      <dp-shead :title="t('dp.home.explore', 'Explore products')" icon="box" />
      <div :aria-label="t('dp.home.explore', 'Explore products')" class="dp-tabs" role="tablist">
        <button v-for="x in tabs" :id="'dpx-' + x.k" :key="x.k" :aria-controls="'dpxp-' + x.k" :aria-selected="x.k === cur ? 'true' : 'false'" role="tab" type="button" @click="cur = x.k">
          <bdi>{{ x.label }}</bdi>
        </button>
      </div>
      <div v-for="x in tabs" v-show="x.k === cur" :id="'dpxp-' + x.k" :key="x.k" :aria-labelledby="'dpx-' + x.k" class="dp-ex-g" role="tabpanel">
        <ly-card v-for="p in x.items" :key="p.id" :product="p" variant="h" />
      </div>
    </div>
  </section>
</template>

<script>
import DpShead from "./DpShead.vue";
import LyCard from "../../ui/LyCard.vue";
import dpHome from "./dp-home";
import { bySells, inCat } from "../../ly";

export default {
  name: "DpExplore",
  components: { DpShead, LyCard },
  mixins: [dpHome],
  data: () => ({ cur: "feat" }),
  computed: {
    tabs() {
      void this.region.language;
      if (!this.products.length) return [];
      const depts = [...this.cats].sort((a, b) => inCat(b.id).length - inCat(a.id).length).slice(0, 5);
      return [
        { k: "feat", label: this.t("dp.home.featured", "Featured"), items: (this.offers.length >= 4 ? this.offers : this.best).slice(0, 8) },
        ...depts.map((c) => ({ k: "c" + c.id, label: this.catTitle(c), items: bySells(inCat(c.id)).slice(0, 8) })),
        { k: "new", label: this.t("dp.home.newProducts", "New products"), items: this.newest.slice(0, 8) },
      ].filter((x) => x.items.length);
    },
  },
};
</script>
