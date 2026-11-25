<!--
  Depot: delivery and returns, from the shop's own settings: each delivery way the shop runs (its name, where it
  reaches, its fee or "free", its windows and days, cash on delivery), the pickup point (only with one), the ways to
  pay (the shop's gateways) and how a return starts (from the order page). Nothing invented: a way without windows
  says nothing about windows; no fee is guessed.
-->
<template>
  <div class="ly dp-page dp-help-p">
    <div class="wrap dp-lwrap">
      <nav :aria-label="t('dp.ls.crumbs', 'Breadcrumb')" class="dp-crumbs">
        <router-link :to="{ path: '/' }">{{ t("dp.ls.home", "Home") }}</router-link><ly-icon cls="sep" name="right" /><span aria-current="page">{{ t("dp.hdr.delivery", "Delivery and returns") }}</span>
      </nav>
      <div class="dp-lhead plain">
        <h1 class="dp-lh1">{{ t("dp.hdr.delivery", "Delivery and returns") }}</h1>
        <p class="dp-ld">{{ t("dp.dl.lead", "How your order reaches you, what it costs and how to return it. The fee for your address is always shown at checkout before you pay.") }}</p>
      </div>

      <section :aria-label="t('dp.dl.ways', 'Delivery ways')" class="dp-psec dp-dl">
        <h2 class="dp-h">{{ t("dp.dl.ways", "Delivery ways") }}</h2>
        <div v-if="ways.length" class="dp-dl-g">
          <article v-for="w in ways" :key="w.id" class="dp-dl-c">
            <span class="dp-disc"><ly-icon :name="wayIcon(w.type)" /></span>
            <div>
              <h3><bdi>{{ w.title }}</bdi></h3>
              <p class="dp-ld">{{ note(w) }}</p>
              <dl>
                <div><dt>{{ t("dp.dl.fee", "Fee") }}</dt><dd>{{ fee(w) }}</dd></div>
                <div v-if="w.windows.length"><dt>{{ t("dp.dl.windows", "Delivery windows") }}</dt><dd>{{ w.windows.map(windowWord).join(", ") }}</dd></div>
                <div v-if="w.cod"><dt>{{ t("dp.dl.payment", "Payment") }}</dt><dd>{{ t("ly.pay.cod", "Cash on delivery") }}</dd></div>
              </dl>
              <router-link v-if="w.pickup" :to="{ name: 'DpPickup' }" class="qlink">{{ t("dp.dl.seePoint", "See the pickup point") }}<ly-icon name="arrow" /></router-link>
            </div>
          </article>
        </div>
        <ly-empty v-else :text="t('dp.dl.noneP', 'The shop shows its delivery ways at checkout.')" :title="t('dp.dl.noneT', 'Delivery ways come at checkout')" icon="truck" />
      </section>

      <section v-if="gateways.length" :aria-label="t('dp.dl.pay', 'Ways to pay')" class="dp-psec">
        <h2 class="dp-h">{{ t("dp.dl.pay", "Ways to pay") }}</h2>
        <ul class="dp-buy-n dp-dl-pay">
          <li v-for="g in gateways" :key="g.code || g.name"><ly-icon name="cash" /><span><b>{{ payName(g) }}</b><small v-if="g.description" data-shop-text dir="auto">{{ g.description }}</small></span></li>
        </ul>
      </section>

      <section :aria-label="t('dp.dl.returns', 'Returns')" class="dp-psec">
        <h2 class="dp-h">{{ t("dp.dl.returns", "Returns") }}</h2>
        <div class="dp-dl-r">
          <p>{{ t("dp.dl.returnsP", "Returns follow the shop's return policy for each product. To start a return or ask about one, open your order and message the shop from the order page.") }}</p>
          <router-link :to="{ name: r.HISTORY_ORDERS_PHYSICAL }" class="btn sm">{{ t("dp.dl.myOrders", "Your orders") }}</router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import LyEmpty from "../../ui/LyEmpty.vue";
import { deliveryWays, money, payName, shopFacts, wayIconOf } from "../../ly";
import { windowWord } from "../../buy/ly-cart";
import { regionState } from "../../../region-switcher/region";
import { wayNote } from "../dp";
import { t } from "../../../kalio/i18n/kalio-i18n";

export default {
  name: "DpDeliveryPage",
  components: { LyIcon, LyEmpty },
  data: () => ({ region: regionState }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    r() {
      return window.$storefront.routes;
    },
    ways() {
      return deliveryWays(this.shop);
    },
    gateways() {
      return shopFacts(this.shop).gateways || [];
    },
  },
  created() {
    this.setPageTitle?.(t("dp.hdr.delivery", "Delivery and returns"));
  },
  methods: {
    t,
    payName,
    windowWord,
    wayIcon: wayIconOf,
    note(w) {
      void this.region.language;
      return wayNote(w, t);
    },
    fee(w) {
      void this.region.currency;
      if (w.free || (!w.fee && !w.freeOver)) return t("dp.pk.free", "Free");
      const base = w.fee ? money(w.fee) : t("dp.dl.atCheckout", "Shown at checkout");
      return w.freeOver ? t("dp.dl.freeOver", "{fee}, free over {amount}", { fee: base, amount: money(w.freeOver, true) }) : base;
    },
  },
};
</script>
