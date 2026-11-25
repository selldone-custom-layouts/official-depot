<!-- Depot: today's top deals as tiles in the family's colours (only while the shop has live offers): the brand, the
     tool on a white plate, "Save $x" and its short name, the biggest saving first. -->
<template>
  <section v-if="offers.length" :aria-label="t('dp.home.topDeals', 'Today\'s top deals')" class="dp-sec dp-deals">
    <div class="wrap">
      <dp-shead :more="t('dp.home.allDeals', 'Shop all deals')" :title="t('dp.home.topDeals', 'Today\'s top deals')" :to="dealsTo" icon="tag" />
      <div class="dp-tiles">
        <router-link v-for="(p, i) in offers.slice(0, 7)" :key="p.id" :class="['dp-tile', 's' + (i % 3)]" :to="productTo(p)">
          <span v-if="p.brand" class="brand-plate"><bdi>{{ p.brand }}</bdi></span>
          <span class="dp-pic"><img :src="img(p)" alt="" loading="lazy" /></span>
          <b>{{ t("dp.home.saveAmt", "Save {amount}", { amount: money(pv(p).save) }) }}</b>
          <span class="dp-tile-n"><bdi>{{ shortTitle(p) }}</bdi></span>
          <ly-icon name="arrow" />
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import DpShead from "./DpShead.vue";
import dpHome from "./dp-home";

export default { name: "DpDeals", components: { LyIcon, DpShead }, mixins: [dpHome] };
</script>
