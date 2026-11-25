<!-- Depot: the brand wall (Acme's): every brand of the products as a tile in the family's colours, then "All brands". -->
<template>
  <section v-if="brandNames.length" :aria-label="t('dp.home.byBrand', 'Shop by brand')" class="dp-sec dp-brandwall">
    <div class="wrap">
      <dp-shead :more="t('dp.hdr.allBrands', 'All brands')" :title="t('dp.home.byBrand', 'Shop by brand')" :to="{ name: 'DpBrands' }" icon="layers" />
      <div class="dp-bw">
        <router-link v-for="(b, i) in brandNames.slice(0, 11)" :key="b" :class="['dp-bw-t', 's' + (i % 3)]" :to="brandTo(b)"><span class="brand-word"><bdi>{{ b }}</bdi></span></router-link>
        <router-link :to="{ name: 'DpBrands' }" class="dp-bw-t all"><span>{{ t("dp.hdr.allBrands", "All brands") }}</span><ly-icon name="arrow" /></router-link>
      </div>
    </div>
  </section>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import DpShead from "./DpShead.vue";
import dpHome from "./dp-home";

export default { name: "DpBrandWall", components: { LyIcon, DpShead }, mixins: [dpHome] };
</script>
