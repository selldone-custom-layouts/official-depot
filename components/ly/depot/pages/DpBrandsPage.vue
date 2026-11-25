<!--
  Depot: every brand of the shop's products (the products' own brand field), each as a tile with its name, the
  departments it covers and four of its tools; "Shop <brand>" opens its listing. A shop whose products have no brand
  gets an honest empty state.
-->
<template>
  <div class="ly dp-page dp-brands-p">
    <div class="wrap dp-lwrap">
      <nav :aria-label="t('dp.ls.crumbs', 'Breadcrumb')" class="dp-crumbs">
        <router-link :to="{ path: '/' }">{{ t("dp.ls.home", "Home") }}</router-link><ly-icon cls="sep" name="right" /><span aria-current="page">{{ t("dp.hdr.brands", "Brands") }}</span>
      </nav>
      <div class="dp-lhead plain">
        <h1 class="dp-lh1">{{ t("dp.br.h", "Shop by brand") }}</h1>
        <p class="dp-ld">{{ t("dp.br.p", "Every brand in the shop, with the departments it covers.") }}</p>
      </div>
      <div v-if="!ly.ready" aria-hidden="true" class="dp-br-g"><div v-for="i in 4" :key="i" class="dp-br ly-skel"></div></div>
      <div v-else-if="list.length" class="dp-br-g">
        <section v-for="(b, i) in list" :key="b.name" :aria-label="b.name" class="dp-br">
          <router-link :class="['dp-bw-t', 's' + (i % 3)]" :to="brandTo(b.name)"><span class="brand-word"><bdi>{{ b.name }}</bdi></span></router-link>
          <div class="dp-br-c">
            <router-link v-for="c in b.cats" :key="c.id" :to="catTo(c, b.name)" class="chip"><bdi>{{ catTitle(c) }}</bdi></router-link>
          </div>
          <div class="dp-br-p">
            <router-link v-for="p in b.top" :key="p.id" :aria-label="p.title" :to="productTo(p)" class="dp-pic"><img :src="img(p)" alt="" loading="lazy" /></router-link>
          </div>
          <router-link :to="brandTo(b.name)" class="btn sm">{{ t("dp.br.shop", "Shop {brand}", { brand: b.name }) }}<ly-icon name="arrow" /></router-link>
        </section>
      </div>
      <ly-empty v-else :text="t('dp.br.noneP', 'The shop’s products do not name a brand yet.')" :title="t('dp.br.noneT', 'No brands yet')" cls="boxed" icon="tag">
        <template #acts><router-link :to="allTo" class="btn">{{ t("dp.ftr.allTools", "Shop all tools") }}</router-link></template>
      </ly-empty>
    </div>
  </div>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import LyEmpty from "../../ui/LyEmpty.vue";
import { bySells, catTitle, catTo as catRoute, loadDm, ly, productImage, productTo } from "../../ly";
import { catalogueRoute } from "../../../kalio/kalio-catalog";
import { brands, byBrand } from "../dp";
import { t } from "../../../kalio/i18n/kalio-i18n";

export default {
  name: "DpBrandsPage",
  components: { LyIcon, LyEmpty },
  data: () => ({ ly }),
  computed: {
    list() {
      return brands().map((name) => {
        const ps = byBrand(name);
        const ids = new Set(ps.map((p) => p.category_id));
        return { name, cats: this.ly.cats.filter((c) => ids.has(c.id)), top: bySells(ps).slice(0, 4) };
      });
    },
    allTo() {
      return catalogueRoute({ sort: "featured" });
    },
  },
  created() {
    loadDm();
    this.setPageTitle?.(t("dp.hdr.brands", "Brands"));
  },
  methods: {
    t,
    catTitle,
    productTo,
    img(p) {
      return productImage(p);
    },
    brandTo(b) {
      return catalogueRoute({ brand: b });
    },
    catTo(c, b) {
      return { ...catRoute(c), query: { brand: b } };
    },
  },
};
</script>
