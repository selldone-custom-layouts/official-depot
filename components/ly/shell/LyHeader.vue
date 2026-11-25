<!--
  Depot: the tool superstore's header (design depot.js header(), after acmetools.com's):

  - the service strip on the brand colour: door delivery (the truck way, in the shop's own words), pickup (only when
    the shop has a pickup point, with its city) and pay on delivery (only with a cash-on-delivery gateway or way);
    on the end side Track order, Pickup point, Help and the language & currency pill;
  - the header: the wrench glyph and the shop's wordmark, the wide search (suggestions from the live catalogue while
    typing: name, SKU, brand and spec; Enter opens every result), the account ("Welcome · Sign in | New account", or
    the shopper's name) and the cart with its count and total;
  - the navigation row: "Shop all" (a mega menu: every department with its own image; beside the one pointed at, quick
    links from its products' own specification and its first tools), "Brands" (the products' own brands), the Deals
    and What's new pills, the departments that fit on one row and "All departments";
  - phone (≤ 979 px): the menu button, the wordmark, the account and the cart; the search under them; the menu is a
    panel from the start side (Deals, Brands, the departments, help, sign in, language & currency). No bottom bar.

  Every layer opens on a click and closes on a second click, Esc, a click outside or a page change (ly.ts layers).
-->
<template>
  <div v-if="!$store.getters.getIsNative" class="ly ly-hdrwrap dp-hdrwrap">
    <a class="skip" href="#main" @click.prevent="skip">{{ t("ly.hdr.skip", "Skip to content") }}</a>

    <div class="dp-util">
      <div class="wrap dp-util-in">
        <ul class="dp-perks">
          <li v-if="doorWay"><ly-icon :name="wayIcon(doorWay.type)" /><span>{{ doorLine }}</span></li>
          <li v-if="point" class="dp-hide-sm"><ly-icon name="store" /><span>{{ pickupLine }}</span></li>
          <li v-if="cod" class="dp-hide-sm"><ly-icon name="cash" /><span>{{ t("dp.hdr.payOnDelivery", "Pay on delivery") }}</span></li>
        </ul>
        <nav :aria-label="t('dp.hdr.serviceNav', 'Shop services')" class="dp-util-r">
          <router-link :to="ordersTo" class="dp-hide-sm"><ly-icon name="order" />{{ t("dp.hdr.track", "Track order") }}</router-link>
          <router-link v-if="point" :to="{ name: 'DpPickup' }" class="dp-hide-sm"><ly-icon name="pin" />{{ t("dp.hdr.pickupPoint", "Pickup point") }}</router-link>
          <router-link :to="{ name: 'ShopFAQ' }" class="dp-hide-sm"><ly-icon name="info" />{{ t("dp.hdr.help", "Help") }}</router-link>
          <button
            v-if="regionOn"
            :key="regionKey"
            :aria-expanded="is('rgp') ? 'true' : 'false'"
            :aria-label="t('ly.hdr.regionAria', 'Language and currency: {value}', { value: regionShort })"
            aria-controls="rgp"
            class="dp-region rs-pick__btn"
            type="button"
            @click="toggle('rgp', $event)"
          >
            <ly-icon name="globe" /><span dir="ltr">{{ regionShort }}</span><ly-icon cls="chev" name="down" />
          </button>
        </nav>
      </div>
    </div>

    <header id="hdr" class="hdr dp-head">
      <div class="wrap dp-head-in">
        <button
          :aria-expanded="is('menu') ? 'true' : 'false'"
          :aria-label="t('ly.hdr.menu', 'Menu')"
          aria-controls="menu"
          class="dp-ib menu-btn"
          type="button"
          @click="toggle('menu', $event)"
        >
          <ly-icon name="menu" />
        </button>
        <router-link :aria-label="t('ly.logo.homeOf', '{name}, home', { name: shopName })" :to="{ path: '/' }" class="dp-logo">
          <span aria-hidden="true" class="dp-mark"><ly-icon name="wrench" /></span>
          <ly-logo :to="null" />
        </router-link>

        <!-- Search: suggestions while typing (the live catalogue); Enter opens every result. -->
        <div id="srch" :class="['dp-search', { open: is('srch') && !!query }]" role="search">
          <form class="dp-sf" @submit.prevent="submit()">
            <label class="sr" for="dp-q">{{ t("dp.hdr.searchLabel", "Search tools, brands and specs") }}</label>
            <input
              id="dp-q"
              ref="q"
              :placeholder="t('dp.hdr.searchPh', 'Search tools, brands, specs')"
              :value="q"
              autocomplete="off"
              enterkeyhint="search"
              type="search"
              @focus="onFocus"
              @input="onInput($event.target.value)"
              @keydown.down.prevent="move(1)"
              @keydown.up.prevent="move(-1)"
            />
            <button :aria-label="t('ly.hdr.search', 'Search')" class="dp-sgo" type="submit"><ly-icon name="search" /></button>
          </form>
          <div v-if="is('srch') && query" class="dp-sout">
            <ul v-if="hits.length" class="srch-list" role="listbox">
              <li v-for="(p, i) in hits" :key="p.id">
                <router-link :class="{ hl: i === cursor }" :to="productTo(p)" role="option">
                  <span class="th"><img :src="thumb(p)" alt="" /></span>
                  <span class="tx"
                    ><b><bdi>{{ p.title }}</bdi></b><small><bdi>{{ catTitle(catOf(p.category_id)) }}</bdi><template v-if="p.sku"> · <span dir="ltr">{{ p.sku }}</span></template></small></span
                  >
                  <span class="money">{{ money(priceView(shop, p).now) }}</span>
                </router-link>
              </li>
            </ul>
            <p v-if="!hits.length" class="srch-hint">{{ t("ly.hdr.noMatch", "Nothing matches “{q}”. Try another word.", { q: query }) }}</p>
            <router-link v-else :to="searchTo(query)" class="srch-all">{{ t("ly.hdr.allFor", "See every result for “{q}”", { q: query }) }}<ly-icon name="arrow" /></router-link>
          </div>
        </div>

        <router-link :to="accountTo" class="dp-acct">
          <ly-icon name="user" />
          <span class="dp-acct-t"
            ><b>{{ signedIn ? userName : t("dp.hdr.welcome", "Welcome") }}</b><small>{{ signedIn ? t("dp.hdr.yourAccount", "Your account") : t("dp.hdr.signInNew", "Sign in | New account") }}</small></span
          >
        </router-link>
        <button
          :aria-expanded="is('drawer') ? 'true' : 'false'"
          :aria-label="t('ly.hdr.bagAria', { one: 'Bag, {n} piece', other: 'Bag, {n} pieces' }, { n: units })"
          aria-controls="drawer"
          class="dp-cart bag-btn"
          type="button"
          @click="toggle('drawer', $event)"
        >
          <span class="dp-cart-i"><ly-icon name="cart" /><span v-if="units" class="count">{{ units > 99 ? "99+" : units }}</span></span>
          <span class="dp-cart-t"><b>{{ t("dp.hdr.myCart", "My cart") }}</b><small class="money">{{ money(cartTotal) }}</small></span>
        </button>
      </div>

      <nav :aria-label="t('dp.hdr.depts', 'Shop departments')" class="dp-nav">
        <div class="wrap dp-nav-in">
          <button :aria-expanded="is('dd-shop') ? 'true' : 'false'" aria-controls="dd-shop" class="dp-all" type="button" @click="toggle('dd-shop', $event)">
            <ly-icon name="menu" />{{ t("dp.hdr.shopAll", "Shop all") }}
          </button>
          <button v-if="brandList.length" :aria-expanded="is('dd-brands') ? 'true' : 'false'" aria-controls="dd-brands" class="dp-all dp-brands-btn" type="button" @click="toggle('dd-brands', $event)">
            <ly-icon name="tag" />{{ t("dp.hdr.brands", "Brands") }}<ly-icon cls="chev" name="down" />
          </button>
          <router-link :to="dealsTo" class="dp-pill deals"><ly-icon name="tag" />{{ t("ly.hdr.deals", "Deals") }}</router-link>
          <router-link :to="newTo" class="dp-pill new"><ly-icon name="bolt" />{{ t("dp.hdr.whatsNew", "What's new") }}</router-link>
          <div ref="row" class="dp-depts">
            <router-link v-for="c in cats" :key="c.id" :aria-current="onCat(c) ? 'page' : undefined" :to="catTo(c)"><bdi>{{ catTitle(c) }}</bdi></router-link>
          </div>
          <router-link :to="shopTo" class="dp-alld">{{ t("dp.hdr.allDepts", "All departments") }}</router-link>
        </div>

        <!-- Shop all: every department; beside the one pointed at, its quick links and first tools. -->
        <div id="dd-shop" :class="['dd', 'dp-mega', { open: is('dd-shop') }]">
          <div class="wrap dp-mega-in">
            <ul class="dp-mega-l">
              <li v-for="c in cats" :key="c.id">
                <button :aria-pressed="megaCat && megaCat.id === c.id ? 'true' : 'false'" type="button" @click="megaId = c.id" @focus="megaId = c.id" @mouseenter="megaId = c.id">
                  <span class="dp-pic"><img v-if="catImg(c)" :src="catImg(c)" alt="" loading="lazy" /></span><span><bdi>{{ catTitle(c) }}</bdi></span><ly-icon cls="chev" name="right" />
                </button>
              </li>
            </ul>
            <div v-if="megaCat" class="dp-mega-r">
              <div class="dp-mega-h">
                <p class="dp-mega-t"><bdi>{{ catTitle(megaCat) }}</bdi></p>
                <router-link :to="catTo(megaCat)" class="btn sm quiet">{{ t("dp.hdr.shopDept", "Shop the department") }}</router-link>
              </div>
              <div v-if="megaQuick.length" class="dp-mega-q">
                <div v-for="f in megaQuick" :key="f.key">
                  <p class="dp-mega-k"><bdi>{{ f.key }}</bdi></p>
                  <router-link v-for="v in f.values" :key="v" :to="catTo(megaCat, { f: f.key + ':' + v })"><bdi>{{ v }}</bdi></router-link>
                </div>
              </div>
              <div class="dp-mega-p">
                <router-link v-for="p in megaItems" :key="p.id" :to="productTo(p)">
                  <span class="dp-pic"><img :src="full(p)" alt="" loading="lazy" /></span><span class="dp-mega-pt"><bdi>{{ p.title }}</bdi></span><b class="money">{{ money(priceView(shop, p).now) }}</b>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Brands: the products' own brands, each with its newest tool. -->
        <div v-if="brandList.length" id="dd-brands" :class="['dd', 'dp-brands', { open: is('dd-brands') }]">
          <div class="wrap dp-brands-in">
            <router-link v-for="b in brandList" :key="b.name" :to="brandTo(b.name)">
              <span class="dp-pic"><img v-if="b.top" :src="thumb(b.top)" alt="" loading="lazy" /></span><span class="dp-brand-n"><b><bdi>{{ b.name }}</bdi></b><small>{{ t("dp.hdr.toolsN", { one: "{n} tool", other: "{n} tools" }, { n: b.n }) }}</small></span>
            </router-link>
            <router-link :to="{ name: 'DpBrands' }" class="dp-brands-all">{{ t("dp.hdr.allBrands", "All brands") }}<ly-icon name="arrow" /></router-link>
          </div>
        </div>
      </nav>
    </header>

    <teleport to="body">
      <div :dir="rtl ? 'rtl' : 'ltr'" class="ly ly-layers">
        <div v-if="regionOn" id="rgp" ref="rgp" :aria-label="t('region.title', 'Language & currency')" :class="['rgp', 'rs-pop', { open: is('rgp') }]" :style="rgpPos" role="dialog">
          <p class="dd-h">{{ regionTitle }}</p>
          <region-chips :key="regionKey" @picked="closeLayer()" />
          <p v-if="regionNote" class="rgp-note">{{ regionNote }}</p>
        </div>

        <!-- The phone menu: a panel from the start side. -->
        <nav id="menu" :aria-label="t('ly.hdr.menu', 'Menu')" :class="['panel', 'menu', 'dp-menu', { open: is('menu') }]">
          <div class="pn-hd">
            <span class="pn-t">{{ t("dp.hdr.shopAll", "Shop all") }}</span>
            <button :aria-label="t('ly.hdr.closeMenu', 'Close menu')" class="ibtn x" type="button" @click="closeLayer()"><ly-icon name="close" /></button>
          </div>
          <div class="dp-menu-top">
            <router-link :to="dealsTo" class="dp-pill deals"><ly-icon name="tag" />{{ t("ly.hdr.deals", "Deals") }}</router-link>
            <router-link :to="newTo" class="dp-pill new"><ly-icon name="bolt" />{{ t("dp.hdr.whatsNew", "What's new") }}</router-link>
            <router-link v-if="brandList.length" :to="{ name: 'DpBrands' }" class="dp-pill"><ly-icon name="layers" />{{ t("dp.hdr.brands", "Brands") }}</router-link>
          </div>
          <p class="dp-menu-h">{{ t("dp.hdr.departments", "Departments") }}</p>
          <ul class="pn-list dp-menu-cats">
            <li v-for="c in menuCats" :key="c.id">
              <router-link :to="catTo(c)">
                <span class="th"><img v-if="catImg(c)" :src="catImg(c)" alt="" loading="lazy" /></span><span><bdi>{{ catTitle(c) }}</bdi></span><ly-icon cls="chev" name="right" />
              </router-link>
            </li>
            <li v-if="menuRest.length">
              <button :aria-expanded="moreOpen ? 'true' : 'false'" class="pn-more" type="button" @click="moreOpen = !moreOpen">
                <span class="th"><ly-icon :name="moreOpen ? 'up' : 'down'" /></span
                ><span>{{ moreOpen ? t("ly.hdr.fewer", "Show fewer") : t("ly.hdr.more", "Show {n} more", { n: menuRest.length }) }}</span>
              </button>
            </li>
          </ul>
          <p class="dp-menu-h">{{ t("dp.hdr.help", "Help") }}</p>
          <ul class="dp-menu-links">
            <li><router-link :to="ordersTo"><ly-icon name="order" />{{ t("dp.hdr.track", "Track order") }}</router-link></li>
            <li v-if="point"><router-link :to="{ name: 'DpPickup' }"><ly-icon name="store" />{{ t("dp.hdr.pickupPoint", "Pickup point") }}</router-link></li>
            <li><router-link :to="{ name: 'DpDelivery' }"><ly-icon name="truck" />{{ t("dp.hdr.delivery", "Delivery and returns") }}</router-link></li>
            <li><router-link :to="{ name: 'ShopFAQ' }"><ly-icon name="info" />{{ t("dp.hdr.faq", "Help and FAQ") }}</router-link></li>
            <li><router-link :to="compareTo"><ly-icon name="compare" />{{ t("dp.hdr.compare", "Compare tools") }}</router-link></li>
            <li><router-link :to="savedTo"><ly-icon name="heart" />{{ t("dp.hdr.saved", "Saved tools") }}</router-link></li>
            <li><router-link :to="accountTo"><ly-icon name="user" />{{ signedIn ? t("ly.hdr.account", "Account") : t("dp.hdr.signIn", "Sign in") }}</router-link></li>
          </ul>
          <button v-if="regionOn" :key="regionKey" aria-controls="langsheet" class="pn-rg rs-row dp-menu-rg" type="button" @click="openLayer('langsheet', $event.currentTarget)">
            <ly-icon name="globe" /><span>{{ t("region.title", "Language & currency") }}</span><span class="pn-rg-v" dir="ltr">{{ regionShort }}</span><ly-icon cls="chev" name="right" />
          </button>
        </nav>

        <!-- The language & currency sheet (phone). -->
        <div v-if="regionOn" id="langsheet" :aria-label="t('region.title', 'Language & currency')" :class="['ly-sheet', 'rs-sheet', { open: is('langsheet') }]" aria-modal="true" role="dialog">
          <div class="pn-hd">
            <h2 class="pn-t">{{ t("region.title", "Language & currency") }}</h2>
            <button :aria-label="t('ly.hdr.close', 'Close')" class="ibtn x" type="button" @click="closeLayer()"><ly-icon name="close" /></button>
          </div>
          <div class="sh-body">
            <region-chips :key="regionKey" />
            <p v-if="regionNote" class="rgp-note">{{ regionNote }}</p>
            <button class="btn block" type="button" @click="closeLayer()">{{ t("region.done", "Done") }}</button>
          </div>
        </div>

        <div :class="['scrim', { open: scrim }]" @click="closeLayer()"></div>
        <ly-bag-drawer />
      </div>
      <ly-quick-view />
    </teleport>
  </div>
</template>

<script>
import LyLogo from "../LyLogo.vue";
import LyIcon from "../LyIcon.vue";
import LyBagDrawer from "./LyBagDrawer.vue";
import LyQuickView from "../ui/LyQuickView.vue";
import RegionChips from "../../region-switcher/RegionChips.vue";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { catalogueRoute, dealsRoute } from "../../kalio/kalio-catalog";
import { currencies, currentCurrency, currentLanguage, hasChoice, isRtl, regionState, showLanguages } from "../../region-switcher/region";
import {
  bySells,
  catImage,
  catOf,
  catTitle,
  catTo as catRoute,
  closeLayer,
  closeOnRoute,
  deliveryWays,
  inCat,
  isLocalWay,
  isModal,
  layer,
  loadDm,
  ly,
  money,
  openLayer,
  priceView,
  productImage,
  productTo,
  shopFacts,
  toggleLayer,
  wayIconOf,
  wireLayers,
} from "../ly";
import { shownCount } from "../../kalio/kalio-basket";
import { brands, byBrand, facetsOf, firstPickupPoint } from "../depot/dp";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "LyHeader",
  components: { LyLogo, LyIcon, LyBagDrawer, LyQuickView, RegionChips },
  props: {
    showSearch: { type: Boolean, default: true },
  },
  emits: ["search", "clear"],

  data: () => ({ q: "", cursor: -1, moreOpen: false, rgpPos: {}, megaId: null, layer, ly, region: regionState }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    rtl() {
      void this.region.language;
      return isRtl();
    },
    cats() {
      return this.ly.cats;
    },
    ways() {
      return deliveryWays(this.shop);
    },
    /* The way that reaches the door with no real limit (a truck), else the courier in town. */
    doorWay() {
      return this.ways.find((w) => !w.pickup && !isLocalWay(w) && w.type !== "Global" && w.type !== "Post") || this.ways.find((w) => !w.pickup) || null;
    },
    doorLine() {
      void this.region.language;
      const w = this.doorWay;
      if (!w) return "";
      if (w.type === "Global" || w.type === "Post") return t("dp.hdr.ships", "Ships to your address");
      return isLocalWay(w) ? t("dp.hdr.within", "Delivered within {km} km", { km: w.distance }) : t("dp.hdr.toDoor", "Delivered to your door");
    },
    point() {
      return firstPickupPoint(this.shop);
    },
    pickupLine() {
      void this.region.language;
      const city = String(this.point?.city || "").trim();
      return city ? t("dp.hdr.pickupIn", "Pickup in {city}", { city }) : t("dp.hdr.pickup", "Pickup available");
    },
    cod() {
      const f = shopFacts(this.shop);
      return !!(f.gateway?.cod || (f.gateways || []).some((g) => g.cod) || this.ways.some((w) => w.cod));
    },
    signedIn() {
      return !!this.$store.getters.getUser;
    },
    userName() {
      const u = this.$store.getters.getUser || {};
      return String(u.name || "").split(/\s+/)[0] || t("ly.hdr.account", "Account");
    },
    basket() {
      return this.getBaskets().find((b) => b?.type === "PHYSICAL") || this.getBaskets().find((b) => b?.items?.length) || null;
    },
    units() {
      return this.getBaskets().reduce((sum, b) => sum + (b?.items || []).reduce((n, it) => n + (it.count || 0), 0), 0);
    },
    /* The cart's total now (the items' prices after their savings), as the drawer sums it. */
    cartTotal() {
      void this.region.currency;
      let total = 0;
      for (const it of this.basket?.items || []) {
        const n = shownCount(it.product || { id: it.product_id }, it);
        total += (it.price || 0) * n - (it.offer_amount || 0);
      }
      return Math.max(0, total);
    },
    scrim() {
      return !!this.layer.open && isModal(this.layer.open);
    },
    regionKey() {
      return t("region.title", "Language & currency") + this.region.words;
    },
    regionOn() {
      void this.shop;
      return hasChoice();
    },
    regionShort() {
      void this.region.currency;
      void this.region.language;
      void this.shop;
      return `${currentLanguage().toUpperCase()} · ${currentCurrency()}`;
    },
    regionTitle() {
      void this.shop;
      return showLanguages() ? t("region.title", "Language & currency") : t("region.currency", "Currency");
    },
    regionNote() {
      void this.shop;
      if (currencies().length <= 1 && !showLanguages()) return "";
      return t("region.note", "Prices everywhere change at once: cards, filters, bag and checkout.");
    },
    shopName() {
      const n = this.shop?.title || "";
      return n.charAt(0).toUpperCase() + n.slice(1);
    },
    menuCats() {
      return this.cats.length <= 8 || this.moreOpen ? this.cats : this.cats.slice(0, 6);
    },
    menuRest() {
      return this.cats.length <= 8 ? [] : this.cats.slice(6);
    },
    megaCat() {
      return this.cats.find((c) => c.id === this.megaId) || this.cats[0] || null;
    },
    /* Three quick-link columns from the department's own filters, five values each. */
    megaQuick() {
      const c = this.megaCat;
      if (!c) return [];
      return facetsOf(inCat(c.id))
        .slice(0, 3)
        .map((f) => ({ key: f.key, values: f.values.slice(0, 5) }));
    },
    megaItems() {
      return this.megaCat ? bySells(inCat(this.megaCat.id)).slice(0, 4) : [];
    },
    brandList() {
      return brands().map((name) => {
        const list = byBrand(name);
        return { name, n: list.length, top: bySells(list)[0] || null };
      });
    },
    query() {
      return this.q.trim();
    },
    hits() {
      const q = this.query.toLowerCase();
      if (!q) return [];
      const words = q.split(/\s+/).filter(Boolean);
      const score = (p) => {
        const title = String(p.title || "").toLowerCase();
        const hay = (title + " " + String(p.sku || "") + " " + String(p.brand || "") + " " + catTitle(catOf(p.category_id)) + " " + Object.values(p.spec || {}).flat().join(" ")).toLowerCase();
        let s = 0;
        for (const w of words) {
          if (title.includes(w)) s += 3;
          else if (hay.includes(w)) s += 1;
          else return 0;
        }
        return s;
      };
      return this.ly.products
        .map((p) => ({ p, s: score(p) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s || (b.p.sells || 0) - (a.p.sells || 0))
        .slice(0, 6)
        .map((x) => x.p);
    },
    r() {
      return window.$storefront.routes;
    },
    dealsTo() {
      return dealsRoute();
    },
    shopTo() {
      return catalogueRoute({ sort: "featured" });
    },
    newTo() {
      return catalogueRoute({ sort: "newest" });
    },
    savedTo() {
      return { name: this.r.USER_FAVORITES_PAGE };
    },
    compareTo() {
      return { name: this.r.COMPARISON_PAGE };
    },
    ordersTo() {
      return { name: this.r.HISTORY_ORDERS_PHYSICAL };
    },
    accountTo() {
      return { name: "KalioAccountHome" };
    },
  },

  watch: {
    "layer.open"(id) {
      if (id === "rgp") this.$nextTick(() => this.place());
      if (id !== "menu" && id !== "langsheet") this.moreOpen = false;
    },
    query() {
      this.cursor = -1;
    },
    cats() {
      this.$nextTick(() => this.fitRow());
    },
    "$route.query.search": {
      handler(v) {
        this.q = v ? String(v) : "";
      },
      immediate: true,
    },
  },

  created() {
    loadDm();
    wireLayers();
    closeOnRoute(this.$router);
  },

  mounted() {
    this.onResize = () => {
      if (this.layer.open === "rgp") this.place();
      this.fitRow();
    };
    window.addEventListener("resize", this.onResize, { passive: true });
    document.fonts?.ready?.then(() => this.fitRow());
    this.$nextTick(() => this.fitRow());
    this.openBag = () => openLayer("drawer");
    EventBus.$on("bakini:open-cart", this.openBag);
    EventBus.$on("ly:open-bag", this.openBag);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
    EventBus.$off("bakini:open-cart", this.openBag);
    EventBus.$off("ly:open-bag", this.openBag);
  },

  methods: {
    t,
    money,
    priceView,
    catTitle,
    catOf,
    productTo,
    openLayer,
    closeLayer,
    wayIcon: wayIconOf,
    catTo(c, query = null) {
      const to = catRoute(c);
      return query ? { ...to, query } : to;
    },
    brandTo(b) {
      return catalogueRoute({ brand: b });
    },
    is(id) {
      return this.layer.open === id;
    },
    toggle(id, e) {
      toggleLayer(id, e?.currentTarget || null);
    },
    onCat(c) {
      return this.$route?.params?.category_name === c.name;
    },
    catImg(c) {
      const own = catImage(c, 128);
      if (own) return own;
      const top = bySells(inCat(c.id))[0];
      return top ? productImage(top, 128) : null;
    },
    thumb(p) {
      return productImage(p, 128);
    },
    /* the full photo where it is shown wider than 64px (the 128px thumbnail would be stretched) */
    full(p) {
      return productImage(p);
    },
    /* Department links past the first row are hidden by CSS: also out of the tab order. */
    fitRow() {
      const row = this.$refs.row;
      if (!row) return;
      const links = [...row.children];
      for (const a of links) {
        a.style.visibility = "";
        a.removeAttribute("tabindex");
        a.removeAttribute("aria-hidden");
      }
      const top = links[0]?.offsetTop ?? 0;
      for (const a of links)
        if (a.offsetTop > top) {
          a.style.visibility = "hidden";
          a.setAttribute("tabindex", "-1");
          a.setAttribute("aria-hidden", "true");
        }
    },
    onFocus() {
      if (this.query && this.layer.open !== "srch") openLayer("srch", this.$refs.q);
    },
    onInput(v) {
      this.q = v;
      if (this.query && this.layer.open !== "srch") openLayer("srch", this.$refs.q);
    },
    place() {
      const btn = document.querySelector('[aria-controls="rgp"]');
      const el = this.$refs.rgp;
      if (!btn || !el) return;
      const r = btn.getBoundingClientRect();
      const w = el.offsetWidth || 300;
      const left = Math.max(12, Math.min(window.innerWidth - w - 12, r.right - w));
      this.rgpPos = { top: `${r.bottom + 8}px`, left: `${left}px` };
    },
    move(d) {
      const n = this.hits.length;
      if (!n) return;
      if (this.layer.open !== "srch") openLayer("srch", this.$refs.q);
      this.cursor = (this.cursor + d + n) % n;
    },
    searchTo(q) {
      return { name: this.r.SHOP_PAGE, query: { search: q } };
    },
    submit() {
      if (this.cursor >= 0 && this.hits[this.cursor]) {
        this.$router.push(productTo(this.hits[this.cursor]));
        return;
      }
      const text = this.query;
      closeLayer(true);
      this.$refs.q?.blur();
      if (!text) return this.$emit("clear");
      this.$emit("search", { search: text, search_type: null });
    },
    skip() {
      const m = document.getElementById("main") || document.querySelector("main");
      if (m) {
        m.setAttribute("tabindex", "-1");
        m.focus();
      }
    },
  },
};
</script>
