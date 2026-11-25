<!-- Depot: the shop's story on the tint band: the about photo, "About us", the shop's name and its own About page
     (its first paragraphs), else its description; hidden when the shop has written neither. -->
<template>
  <section v-if="paras.length" :aria-label="t('dp.ftr.about', 'About us')" class="dp-story">
    <div class="wrap dp-story-in">
      <div class="dp-photo"><img v-if="slot('about')" :src="slot('about')" alt="" loading="lazy" /><img v-else-if="best[0]" :src="img(best[0])" alt="" class="cut" loading="lazy" /></div>
      <div>
        <span class="dp-kick">{{ t("dp.ftr.about", "About us") }}</span>
        <h2 class="dp-h dp-story-h"><bdi>{{ shopName }}</bdi></h2>
        <div class="dp-story-t" data-shop-text>
          <p v-for="(p, i) in paras" :key="i" dir="auto">{{ p }}</p>
        </div>
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_ABOUT_US }" class="btn sm quiet">{{ t("dp.home.learnMore", "Learn more") }}</router-link>
      </div>
    </div>
  </section>
</template>

<script>
import dpHome from "./dp-home";
import { ownText, shopProfile } from "../../read/rd";

export default {
  name: "DpStory",
  mixins: [dpHome],
  data: () => ({ about: "" }),
  computed: {
    r() {
      return window.$storefront.routes;
    },
    /* the About page's paragraphs (headings left out), two at most; else the shop's description */
    paras() {
      if (this.about) {
        const box = document.createElement("div");
        box.innerHTML = this.about;
        const ps = [...box.querySelectorAll("p")].map((p) => p.textContent.trim()).filter((x) => x.length > 20);
        if (ps.length) return ps.slice(0, 2);
      }
      const d = String(this.shop?.description || "").trim();
      return d.length > 20 ? [d] : [];
    },
  },
  mounted() {
    shopProfile(window.$storefront.name, "about-us").then((p) => {
      const html = p?.body || "";
      this.about = ownText(html) ? html : "";
    });
  },
};
</script>
