<!--
  Depot: the superstore footer (design depot.js footer()):

  - the service band on the brand colour: every delivery way the shop runs (its icon, name and line, from the shop's
    own settings; pickup only with a pickup point) and cash on delivery when the shop takes it;
  - the family-dark body: the glyph and the wordmark with one line about the shop, then Shop (all tools, deals,
    brands, compare, tool kits when the products' own spec has kits), Departments (the first six), Help (delivery and
    returns, the pickup point, track order, help and FAQ, contact) and Company (about, the journal, terms, privacy);
  - the Theme band (the owner's rule of 10 November 2026: palettes, a custom colour and Light / Dark, only in the
    footer, only on the Layout's showcase shop);
  - the legal row: the copyright, the shop's social links, Selldone's cookie settings and the "made with" credit.
-->
<template>
  <div class="ly ly-ftrwrap">
    <footer class="ftr dp-foot">
      <div v-if="ways.length || cod" class="dp-foot-svc">
        <div class="wrap dp-svc">
          <div v-for="w in ways" :key="w.id">
            <ly-icon :name="wayIcon(w.type)" /><span><b><bdi>{{ w.title }}</bdi></b><small>{{ note(w) }}</small></span>
          </div>
          <div v-if="cod">
            <ly-icon name="cash" /><span><b>{{ t("ly.pay.cod", "Cash on delivery") }}</b><small>{{ codLine }}</small></span>
          </div>
        </div>
      </div>

      <div class="wrap dp-foot-in">
        <div class="dp-foot-brand">
          <router-link :to="{ path: '/' }" class="dp-logo"><span aria-hidden="true" class="dp-mark"><ly-icon name="wrench" /></span><span class="ftr-wm"><bdi>{{ shopName }}</bdi></span></router-link>
          <p>{{ t("dp.ftr.line", "Hand and power tools by department, brand and spec. Compare before you buy, then have it delivered or collect it.") }}</p>
        </div>
        <nav :aria-label="t('ly.ftr.shop', 'Shop')" class="ftr-col">
          <h3>{{ t("ly.ftr.shop", "Shop") }}</h3>
          <ul class="ftr-l">
            <li><router-link :to="shopTo">{{ t("dp.ftr.allTools", "Shop all tools") }}</router-link></li>
            <li><router-link :to="dealsTo">{{ t("ly.hdr.deals", "Deals") }}</router-link></li>
            <li v-if="hasBrands"><router-link :to="{ name: 'DpBrands' }">{{ t("dp.hdr.brands", "Brands") }}</router-link></li>
            <li><router-link :to="{ name: r.COMPARISON_PAGE }">{{ t("dp.ftr.compare", "Compare") }}</router-link></li>
            <li v-if="hasKits"><router-link :to="kitsTo">{{ t("dp.ftr.kits", "Tool kits") }}</router-link></li>
          </ul>
        </nav>
        <nav v-if="cats.length" :aria-label="t('dp.hdr.departments', 'Departments')" class="ftr-col">
          <h3>{{ t("dp.hdr.departments", "Departments") }}</h3>
          <ul class="ftr-l">
            <li v-for="c in cats.slice(0, 6)" :key="c.id">
              <router-link :to="catTo(c)"><bdi>{{ catTitle(c) }}</bdi></router-link>
            </li>
          </ul>
        </nav>
        <nav :aria-label="t('dp.hdr.help', 'Help')" class="ftr-col">
          <h3>{{ t("dp.hdr.help", "Help") }}</h3>
          <ul class="ftr-l">
            <li><router-link :to="{ name: 'DpDelivery' }">{{ t("dp.hdr.delivery", "Delivery and returns") }}</router-link></li>
            <li v-if="point"><router-link :to="{ name: 'DpPickup' }">{{ t("dp.hdr.pickupPoint", "Pickup point") }}</router-link></li>
            <li><router-link :to="{ name: r.HISTORY_ORDERS_PHYSICAL }">{{ t("dp.hdr.track", "Track order") }}</router-link></li>
            <li><router-link :to="faqTo">{{ t("dp.hdr.faq", "Help and FAQ") }}</router-link></li>
            <li><router-link :to="{ name: r.SHOP_CONTACT_US }">{{ t("dp.ftr.contact", "Contact us") }}</router-link></li>
          </ul>
        </nav>
        <nav :aria-label="t('dp.ftr.company', 'Company')" class="ftr-col">
          <h3>{{ t("dp.ftr.company", "Company") }}</h3>
          <ul class="ftr-l">
            <li><router-link :to="{ name: r.SHOP_PROFILE_PAGE_ABOUT_US }">{{ t("dp.ftr.about", "About us") }}</router-link></li>
            <li><router-link :to="blogTo">{{ t("dp.ftr.journal", "Tool talk") }}</router-link></li>
            <li><router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">{{ t("dp.ftr.terms", "Terms of service") }}</router-link></li>
            <li><router-link :to="{ name: r.SHOP_PROFILE_PAGE_PRIVACY }">{{ t("dp.ftr.privacy", "Privacy policy") }}</router-link></li>
          </ul>
        </nav>
      </div>

      <!-- The theme switcher (the owner, 10 November 2026: in the footer on every Layout), only on the showcase shop. -->
      <div v-if="theme.enabled" class="dts-row">
        <div class="wrap dts-in"><theme-switcher-row /></div>
      </div>

      <div class="ftr-bot">
        <div class="wrap fb-in">
          <span>© {{ year }} <bdi>{{ shopName }}</bdi></span>
          <div class="fb-end">
            <s-storefront-social-buttons class="ly-social"></s-storefront-social-buttons>
            <s-footer-section-gdpr class="ly-gdpr"></s-footer-section-gdpr>
            <s-footer-section-selldone class="ly-made"></s-footer-section-selldone>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import LyIcon from "../LyIcon.vue";
import ThemeSwitcherRow from "../../theme-switcher/ThemeSwitcherRow.vue";
import { themeState } from "../../theme-switcher/theme-switcher";
import SStorefrontSocialButtons from "@selldone/components-vue/storefront/social/SStorefrontSocialButtons.vue";
import SFooterSectionGdpr from "@selldone/components-vue/storefront/footer/section/gdpr/SFooterSectionGdpr.vue";
import SFooterSectionSelldone from "@selldone/components-vue/storefront/footer/section/selldone/SFooterSectionSelldone.vue";
import { catTitle, catTo, deliveryWays, loadDm, ly, shopFacts, wayIconOf } from "../ly";
import { catalogueRoute, dealsRoute } from "../../kalio/kalio-catalog";
import { journalRoute } from "../../kalio/pages/kalio-journal";
import { currencies, regionState } from "../../region-switcher/region";
import { brands, firstPickupPoint, kitOf, wayNote } from "../depot/dp";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "LyFooter",
  components: { LyIcon, ThemeSwitcherRow, SStorefrontSocialButtons, SFooterSectionGdpr, SFooterSectionSelldone },
  data: () => ({ theme: themeState, ly, region: regionState }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    r() {
      return window.$storefront.routes;
    },
    facts() {
      return shopFacts(this.shop);
    },
    ways() {
      return deliveryWays(this.shop);
    },
    cod() {
      const f = this.facts;
      return !!(f.gateway?.cod || (f.gateways || []).some((g) => g.cod) || this.ways.some((w) => w.cod));
    },
    codLine() {
      void this.region.language;
      const n = currencies().length;
      return n > 1 ? t("dp.ftr.codN", "In {n} currencies", { n }) : t("dp.ftr.cod1", "Pay when your order arrives");
    },
    point() {
      return firstPickupPoint(this.shop);
    },
    shopName() {
      const n = this.shop?.title || "";
      return n.charAt(0).toUpperCase() + n.slice(1);
    },
    year() {
      return new Date().getFullYear();
    },
    cats() {
      return this.ly.cats;
    },
    hasBrands() {
      return brands().length > 0;
    },
    hasKits() {
      return this.ly.products.some((p) => kitOf(p)?.kind === "kit");
    },
    shopTo() {
      return catalogueRoute({ sort: "featured" });
    },
    dealsTo() {
      return dealsRoute();
    },
    kitsTo() {
      return catalogueRoute({ kit: "kit" });
    },
    blogTo() {
      return journalRoute();
    },
    faqTo() {
      return this.$router.hasRoute("ShopFAQ") ? { name: "ShopFAQ" } : { name: this.r.SHOP_CONTACT_US };
    },
  },
  created() {
    loadDm();
  },
  methods: {
    t,
    catTitle,
    catTo,
    wayIcon: wayIconOf,
    note(w) {
      void this.region.language;
      return wayNote(w, t);
    },
  },
};
</script>
