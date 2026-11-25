<!-- Depot: "Why shop <shop>" (Acme's): specs first; kit or bare tool (only when the products' spec says so); door
     delivery (from the shop's ways); the pickup point (only with one) else order tracking; pay on delivery (only when
     the shop takes cash on delivery). -->
<template>
  <section :aria-label="t('dp.home.why', 'Why shop {shop}', { shop: shopName })" class="dp-sec dp-why">
    <div class="wrap">
      <h2 class="dp-h dp-why-h">{{ t("dp.home.why", "Why shop {shop}", { shop: shopName }) }}</h2>
      <div :class="['dp-why-g', 'n' + items.length]">
        <div v-for="x in items" :key="x.k">
          <span class="dp-disc"><ly-icon :name="x.icon" /></span>
          <b>{{ x.h }}</b>
          <p>{{ x.p }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import dpHome from "./dp-home";

export default {
  name: "DpWhy",
  components: { LyIcon },
  mixins: [dpHome],
  computed: {
    items() {
      void this.region.language;
      const t = this.t;
      const out = [{ k: "specs", icon: "compare", h: t("dp.why.specs", "Specs first"), p: t("dp.why.specsP", "Every tool lists its full specification, so you can compare like with like.") }];
      if (this.kits.length || this.bares.length) out.push({ k: "kit", icon: "battery", h: t("dp.why.kit", "Kit or bare tool"), p: t("dp.why.kitP", "Each cordless tool says whether the battery and charger are in the box.") });
      if (this.doorWays.length) out.push({ k: "door", icon: "truck", h: t("dp.hdr.toDoor", "Delivered to your door"), p: t("dp.why.doorP", "Delivery to your address, with the fee shown before you pay.") });
      if (this.point) out.push({ k: "pickup", icon: "store", h: t("dp.why.pickup", "Or collect it"), p: t("dp.why.pickupP", "Choose the pickup point at checkout and collect when it's ready.") });
      else out.push({ k: "track", icon: "order", h: t("dp.why.track", "Track every order"), p: t("dp.why.trackP", "Follow your order and message the shop from the order page.") });
      if (this.cod) out.push({ k: "cod", icon: "cash", h: t("dp.hdr.payOnDelivery", "Pay on delivery"), p: t("dp.why.codP", "Pay in cash when your order arrives.") });
      return out;
    },
  },
};
</script>
