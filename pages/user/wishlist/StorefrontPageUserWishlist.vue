<!--
  Saved items, inside the account: the products the shopper saved with a card's heart, as the Layout's own cards
  (LyCard), eight at a time with "Show more". Saving belongs to a signed-in account (Selldone's wishlist): a guest is
  asked to sign in here (the page is no longer behind requiresAuth, which sent a guest home when the shop has no
  guest checkout), and an account with nothing saved is sent to the catalogue. Live data only: Selldone's own list
  (products, only_in_wishlist). From Storybook's and Play Lab's pages (Toychi sync, 25 Nov 2026).
-->
<template>
  <div class="acc-p ly-saved">
    <div class="ly-saved-hd">
      <h2 class="h3x">{{ t("account.section.saved", "Saved") }}</h2>
      <p v-if="user && total" class="co-p">{{ t("ly.saved.count", { one: "{n} saved item", other: "{n} saved items" }, { n: total }) }}</p>
    </div>

    <ly-empty v-if="!user" :text="t('ly.saved.signP', 'Tap the heart on a product to keep it here. Saved items stay with your account.')" :title="t('ly.saved.signT', 'Sign in to see what you saved')" cls="boxed" icon="heart">
      <template #acts>
        <button class="btn" type="button" @click="signIn">{{ t("ly.acc.signIn", "Sign in") }}</button>
        <router-link :to="shopTo" class="btn quiet">{{ t("ly.saved.browse", "Browse the shop") }}</router-link>
      </template>
    </ly-empty>

    <div v-else-if="!loaded" :aria-label="t('ly.saved.loading', 'Loading what you saved')" class="ly-od-load" role="status"><span class="ly-od-sk -row"></span></div>

    <ly-empty v-else-if="!products.length" :text="t('ly.saved.emptyP', 'Tap the heart on any product to keep it here for later.')" :title="t('ly.saved.emptyT', 'Nothing saved yet')" cls="boxed" icon="heart">
      <template #acts>
        <router-link :to="shopTo" class="btn">{{ t("ly.saved.browse", "Browse the shop") }}</router-link>
      </template>
    </ly-empty>

    <template v-else>
      <div :class="['grid', 'ly-saved-grid', { dim: busy }]">
        <ly-card v-for="p in products" :key="p.id" :product="p" />
      </div>
      <div v-if="products.length < total" class="ly-saved-more">
        <button :aria-disabled="busy ? 'true' : undefined" class="btn quiet" type="button" @click="busy || fetch(products.length)">{{ t("ly.saved.more", "Show more") }}</button>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { t } from "../../../components/kalio/i18n/kalio-i18n";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import LyCard from "../../../components/ly/ui/LyCard.vue";
import LyEmpty from "../../../components/ly/ui/LyEmpty.vue";
import { catalogueRoute } from "../../../components/kalio/kalio-catalog";

const PAGE = 8;

export default {
  name: "StorefrontPageUserWishlist",
  components: { LyCard, LyEmpty },
  inject: ["$shop"],
  data: () => ({
    products: [] as any[],
    total: 0,
    busy: false,
    loaded: false,
  }),
  computed: {
    user() {
      return this.USER();
    },
    shopTo() {
      return catalogueRoute({});
    },
  },
  watch: {
    /* a guest signs in on this page: the list */
    user(u) {
      if (u && !this.loaded) this.fetch(0);
    },
  },
  created() {
    this.setPageTitle(t("account.pageTitle.saved", "Saved"));
    if (this.user) this.fetch(0);
  },
  methods: {
    t,
    signIn() {
      EventBus.$emit("need-login", true);
    },
    fetch(offset: number) {
      if (!this.user) return;
      this.busy = true;
      const take = ({ products, total }: any) => {
        const list = Array.isArray(products) ? products : [];
        this.products = offset ? [...this.products, ...list.filter((p: any) => !this.products.some((x: any) => x.id === p.id))] : list;
        this.total = Number(total) || this.products.length;
      };
      window.$storefront.products
        .optimize(60)
        .list("*", offset, PAGE, { dir: "*", only_in_wishlist: true, products_only: true, with_total: true })
        .cache(take)
        .then(take)
        .catch(() => {
          if (!offset) this.products = [];
        })
        .then(() => {
          this.busy = false;
          this.loaded = true;
        });
    },
  },
};
</script>
