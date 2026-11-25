<!--
  Depot: the pickup point, from the shop's own Pickup way (Selldone's pickup points): its name, address, phone and the
  shop's own note, its place on a map, when to collect (the way's own days and windows) and what it costs. A shop
  without a pickup point gets an honest empty state, never an invented store or hours.
-->
<template>
  <div class="ly dp-page dp-pickup-p">
    <div class="wrap dp-lwrap">
      <nav :aria-label="t('dp.ls.crumbs', 'Breadcrumb')" class="dp-crumbs">
        <router-link :to="{ path: '/' }">{{ t("dp.ls.home", "Home") }}</router-link><ly-icon cls="sep" name="right" /><span aria-current="page">{{ t("dp.hdr.pickupPoint", "Pickup point") }}</span>
      </nav>
      <template v-if="point">
        <div class="dp-lhead plain">
          <span class="dp-kick">{{ t("dp.pk.kick", "Order online, collect in person") }}</span>
          <h1 class="dp-lh1"><bdi>{{ name }}</bdi></h1>
          <p class="dp-ld">{{ t("dp.pk.lead", "Choose the pickup point at checkout. The shop tells you when your order is ready.") }}</p>
        </div>
        <div class="dp-pk-g">
          <div class="dp-pk-map"><ly-map :line="address" :location="point.location || null" :title="name" :zoom="15" /></div>
          <div class="dp-pk-i">
            <ul class="dp-buy-n">
              <li v-if="address"><ly-icon name="pin" /><span><b>{{ t("dp.pk.address", "Address") }}</b><small><bdi>{{ address }}</bdi></small></span></li>
              <li v-if="point.phone"><ly-icon name="phone" /><span><b>{{ t("dp.pk.phone", "Phone") }}</b><small><a :href="'tel:' + String(point.phone).replace(/[^\d+]/g, '')" dir="ltr">{{ point.phone }}</a></small></span></li>
              <li v-if="when"><ly-icon name="clock" /><span><b>{{ t("dp.pk.when", "When to collect") }}</b><small>{{ when }}</small></span></li>
              <li><ly-icon name="cash" /><span><b>{{ t("dp.pk.cost", "Cost") }}</b><small>{{ cost }}</small></span></li>
              <li v-if="point.message"><ly-icon name="info" /><span><b>{{ t("dp.pk.note", "A note from the shop") }}</b><small data-shop-text dir="auto">{{ point.message }}</small></span></li>
            </ul>
            <a v-if="directions" :href="directions" class="btn sm" rel="noopener" target="_blank"><ly-icon name="locate" />{{ t("dp.pk.directions", "Directions") }}</a>
          </div>
        </div>
      </template>
      <ly-empty v-else :text="t('dp.pk.noneP', 'This shop delivers to your door. Delivery ways and fees are shown at checkout.')" :title="t('dp.pk.noneT', 'No pickup point')" cls="boxed" icon="store">
        <template #acts><router-link :to="{ name: 'DpDelivery' }" class="btn">{{ t("dp.hdr.delivery", "Delivery and returns") }}</router-link></template>
      </ly-empty>
    </div>
  </div>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import LyEmpty from "../../ui/LyEmpty.vue";
import LyMap from "../../read/LyMap.vue";
import { deliveryWays, money, pickupName } from "../../ly";
import { windowWord } from "../../buy/ly-cart";
import { regionState } from "../../../region-switcher/region";
import { firstPickupPoint } from "../dp";
import { t } from "../../../kalio/i18n/kalio-i18n";

const WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default {
  name: "DpPickupPage",
  components: { LyIcon, LyEmpty, LyMap },
  data: () => ({ region: regionState }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    point() {
      return firstPickupPoint(this.shop);
    },
    way() {
      return deliveryWays(this.shop).find((w) => w.pickup) || null;
    },
    name() {
      return pickupName(this.point);
    },
    address() {
      const p = this.point || {};
      return [p.address, p.city, [p.state, p.postal].filter(Boolean).join(" ")].filter(Boolean).join(", ");
    },
    when() {
      void this.region.language;
      const w = this.way;
      if (!w) return "";
      const lang = document.documentElement.lang || "en";
      const dayName = (d) => {
        const i = WEEK.indexOf(d);
        if (i < 0) return d;
        try {
          return new Intl.DateTimeFormat(lang, { weekday: "long" }).format(new Date(Date.UTC(2024, 0, 1 + i)));
        } catch {
          return d;
        }
      };
      const days = w.days.length === 7 ? t("dp.pk.everyDay", "Every day") : w.days.map(dayName).join(", ");
      const wins = w.windows.map(windowWord).join(", ");
      return [days, wins].filter(Boolean).join(" · ");
    },
    cost() {
      void this.region.currency;
      const w = this.way;
      return !w || w.free || !w.fee ? t("dp.pk.free", "Free") : money(w.fee);
    },
    directions() {
      const loc = this.point?.location;
      return loc?.lat ? `https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=16/${loc.lat}/${loc.lng}` : "";
    },
  },
  created() {
    this.setPageTitle?.(t("dp.hdr.pickupPoint", "Pickup point"));
  },
  methods: { t },
};
</script>
