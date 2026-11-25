<!-- Depot: the service band on the family-dark band: how orders reach the buyer (the shop's own ways), the shop's
     line in the middle, cash on delivery (only when the shop takes it) and "Compare the specs". -->
<template>
  <section :aria-label="t('dp.home.trustAria', 'Shopping with us')" class="dp-trust">
    <div class="wrap dp-trust-in">
      <div v-for="w in shown" :key="w.id"><ly-icon :name="wayIcon(w.type)" /><span>{{ note(w) }}</span></div>
      <div class="dp-trust-mid"><span>{{ t("dp.home.trustMid", "Tools, brands and specs in one place") }}</span></div>
      <div v-if="cod"><ly-icon name="cash" /><span>{{ t("ly.pay.cod", "Cash on delivery") }}</span></div>
      <div><ly-icon name="compare" /><span>{{ t("dp.home.cmpSpecs", "Compare the specs") }}</span></div>
    </div>
  </section>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import dpHome from "./dp-home";

export default {
  name: "DpTrust",
  components: { LyIcon },
  mixins: [dpHome],
  computed: {
    /* the door way with no real limit, then the pickup point (else the next way) */
    shown() {
      const door = this.doorWays.find((w) => !this.isLocalWay(w)) || this.doorWays[0];
      const pick = this.ways.find((w) => w.pickup) || this.doorWays.find((w) => w !== door);
      return [door, pick].filter(Boolean);
    },
  },
};
</script>
