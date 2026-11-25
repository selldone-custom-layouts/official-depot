<!--
  Depot: the product's sections under the buy box (design depot.js product(): Acme's section tabs). A bar of anchors
  that stays under the header (Overview, Specifications, Batteries that fit (only for a bare tool with matching
  batteries in the shop), Reviews), then:

  - Overview: the product's own article (Selldone's), else its highlights (pros), else the first spec group;
  - Specifications: every spec group of the product in the shop's own order, with the SKU;
  - Batteries that fit: the products whose own "Tool Platform" names this tool's brand and voltage;
  - Reviews: with none yet, an honest card and the shop's rating criteria, each "No score yet" (never stars or
    numbers); "Write the first review" asks a guest to sign in and opens Selldone's own review box for a signed-in
    shopper. With reviews: Selldone's.
-->
<template>
  <div class="dp-pd-s">
    <nav :aria-label="t('ly.pd.detailsAria', 'Product details')" class="dp-ptabs">
      <div class="wrap dp-ptabs-in">
        <a v-for="tb in tabs" :key="tb.k" :href="'#' + tb.k" @click.prevent="go(tb.k)">{{ tb.label }}</a>
      </div>
    </nav>
    <div class="wrap">
      <section id="overview" aria-labelledby="h-overview" class="dp-psec">
        <h2 id="h-overview" class="dp-h">{{ t("dp.pd.overview", "Overview") }}</h2>
        <div v-if="articleBody" class="ly-pd-article dp-prose" data-shop-text v-html="articleBody"></div>
        <ul v-else-if="pros.length" class="dp-pros">
          <li v-for="(x, i) in pros" :key="i"><ly-icon name="check" /><span><b><bdi>{{ x[0] }}</bdi></b><template v-if="x[1]"> <bdi>{{ x[1] }}</bdi></template></span></li>
        </ul>
        <p v-else class="dp-ld">{{ t("dp.pd.noOverview", "The full specification is below.") }}</p>
      </section>

      <section id="specs" aria-labelledby="h-specs" class="dp-psec">
        <h2 id="h-specs" class="dp-h">{{ t("dp.pd.specs", "Specifications") }}</h2>
        <div class="dp-specs">
          <table v-for="g in groups" :key="g.group" class="dp-spec">
            <caption v-if="g.group"><bdi>{{ g.group }}</bdi></caption>
            <tbody>
              <tr v-for="r in g.rows" :key="r[0]">
                <th scope="row"><bdi>{{ r[0] }}</bdi></th>
                <td><bdi>{{ r[1] }}</bdi></td>
              </tr>
            </tbody>
          </table>
          <table v-if="product.sku" class="dp-spec">
            <tbody>
              <tr>
                <th scope="row">{{ t("ly.pd.sku", "SKU") }}</th>
                <td dir="ltr">{{ product.sku }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="fits.length" id="fits" aria-labelledby="h-fits" class="dp-psec">
        <h2 id="h-fits" class="dp-h">{{ t("dp.pd.fits", "Batteries that fit") }}</h2>
        <p class="dp-ld">{{ t("dp.pd.fitsP", "Matched by platform and voltage from each battery's own specification.") }}</p>
        <div class="dp-ex-g dp-fits-g">
          <ly-card v-for="q in fits" :key="q.id" :product="q" variant="h" />
        </div>
      </section>

      <section id="reviews" aria-labelledby="h-reviews" class="dp-psec">
        <h2 id="h-reviews" class="dp-h">{{ t("dp.pd.reviews", "Reviews") }}<template v-if="rated"> ({{ product.rate_count }})</template></h2>
        <div v-if="!rated" :class="['revs', { 'ly-solo': !criteria.length }]">
          <ly-empty :text="noReviewsText" :title="t('ly.pd.noReviewsT', 'No reviews yet')" icon="star">
            <template v-if="!writing" #acts>
              <button class="btn sm" type="button" @click="write">{{ user ? t("ly.pd.writeFirst", "Write the first review") : t("ly.pd.signInReview", "Sign in to write a review") }}</button>
            </template>
          </ly-empty>
          <div v-if="criteria.length" class="crit">
            <h3 class="pd-sub">{{ t("ly.pd.willScore", "What reviews will score") }}</h3>
            <ul>
              <li v-for="c in criteria" :key="c">
                <span><bdi>{{ c }}</bdi></span><span aria-hidden="true" class="crit-bar"></span><span class="crit-v">{{ t("ly.pd.noScore", "No score yet") }}</span>
              </li>
            </ul>
          </div>
        </div>
        <div v-if="rated || writing" class="ly-rv-sd"><kalio-reviews /></div>
      </section>
    </div>
  </div>
</template>

<script>
import LyIcon from "../LyIcon.vue";
import LyEmpty from "../ui/LyEmpty.vue";
import LyCard from "../ui/LyCard.vue";
import { fitsFor, kitOf } from "../depot/dp";
import { ly } from "../ly";
import KalioReviews from "../../kalio/product/KalioReviews.vue";
import { percentOff } from "../../kalio/kalio-catalog";
import { prosOf, ratingNames, specGroups, specValue, unitOf } from "../ly";
import { numberWord } from "./pd";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "LyProductTabs",
  components: { LyIcon, LyEmpty, LyCard, KalioReviews },
  props: { product: { type: Object, required: true } },
  data: () => ({ cur: "desc", writing: false, ly }),
  computed: {
    user() {
      return this.$store.getters.getUser;
    },
    rated() {
      return Number(this.product.rate_count) > 0;
    },
    criteria() {
      return ratingNames(this.product);
    },
    pros() {
      return prosOf(this.product).filter((x) => x[0] || x[1]);
    },
    groups() {
      return specGroups(this.product);
    },
    fits() {
      void this.ly.products.length;
      return kitOf(this.product)?.kind === "bare" ? fitsFor(this.product) : [];
    },
    tabs() {
      return [
        { k: "overview", label: t("dp.pd.overview", "Overview") },
        { k: "specs", label: t("dp.pd.specs", "Specifications") },
        ...(this.fits.length ? [{ k: "fits", label: t("dp.pd.fits", "Batteries that fit") }] : []),
        { k: "reviews", label: t("dp.pd.reviews", "Reviews") },
      ];
    },
    /* The lead: the finish, "Sold as one <unit>, and good with <pairing>",
       the saving. Words the product's own spec gives; nothing invented. */
    lead() {
      const p = this.product;
      const out = [];
      const finish = specValue(p, "Visual Finish") || specValue(p, "Surface");
      if (finish) out.push(finish.charAt(0).toUpperCase() + finish.slice(1).replace(/\.?$/, "."));
      const pairing = specValue(p, "Suggested Pairing");
      const unit = unitOf(p).toLowerCase();
      const off = percentOff(this.$store.getters.getShop, p);
      const sold = pairing ? t("ly.pd.soldPair", "Sold as one {unit}, and good with {pairing}.", { unit, pairing: pairing.toLowerCase() }) : t("ly.pd.sold", "Sold as one {unit}.", { unit });
      out.push(off > 0 ? `${sold} ${t("ly.pd.offIn", "{off}% off, already in the price.", { off })}` : sold);
      return out;
    },
    articleBody() {
      const body = this.product?.article_pack?.article?.body;
      return body && String(body).replace(/<[^>]*>/g, "").trim() ? body : null;
    },
    noReviewsText() {
      const n = this.criteria.length;
      if (!n) return t("ly.pd.noReviewsP0", "Be the first to review the {name}.", { name: this.product.title });
      return t("ly.pd.noReviewsP", "Be the first to review the {name}. Reviews are scored on the {n} points beside this note.", { name: this.product.title, n: numberWord(n).toLowerCase() });
    },
  },
  watch: {
    "product.id"() {
      this.cur = "desc";
      this.writing = false;
    },
  },
  methods: {
    t,
    /* "No reviews yet" in the buy box and the section bar scroll to their section. */
    open() {
      this.go("reviews");
    },
    go(k) {
      document.getElementById(k)?.scrollIntoView({ behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth", block: "start" });
    },
    write() {
      if (!this.user) {
        EventBus.$emit("need-login", true);
        return;
      }
      this.writing = true;
    },
  },
};
</script>
