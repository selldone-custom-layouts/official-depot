<!--
  A journal post (design/article-b.html, pages-read.js
  article): the title band (Home · Journal · Post; the post's title; the
  date and "<shop> journal"), the cover rising out of the band, then one
  centred reading column: the post's own description as the lead, its text
  (its links are the only underlined words on the site), ONE panel with
  the pastries the post links to (its /product/<id> links, read live; at
  most four, "Add all" in the panel's head), the Share row (Copy link,
  Email, More), the journal's card with the shop's mark, the comments
  (Selldone's; signing in opens the sheet), and "More from the journal".
-->
<template>
  <div class="ly ly-article">
    <template v-if="article">
      <!-- Depot: the breadcrumb, "Tool talk", the title and the date, then the wide cover. Selldone makes the body's
           first picture the post's cover, so a body that opens with it would show it twice: that copy leaves the body
           and its caption goes under the cover (marketplace-guide.md, the owner's rule of 25 Nov 2026). -->
      <div class="wrap dp-lwrap dp-art-h">
        <nav :aria-label="t('dp.ls.crumbs', 'Breadcrumb')" class="dp-crumbs">
          <router-link :to="{ path: '/' }">{{ t("dp.ls.home", "Home") }}</router-link><ly-icon cls="sep" name="right" /><router-link :to="journalRoute()">{{ t("dp.ftr.journal", "Tool talk") }}</router-link
          ><ly-icon cls="sep" name="right" /><span aria-current="page"><bdi>{{ article.title }}</bdi></span>
        </nav>
        <span class="dp-kick">{{ t("dp.ftr.journal", "Tool talk") }}</span>
        <h1 class="dp-art-t"><bdi>{{ article.title }}</bdi></h1>
        <p class="art-m"><time v-if="article.created_at" :datetime="article.created_at">{{ fmtDate(article.created_at) }}</time></p>
      </div>
      <article :aria-label="article.title" class="artl dp-artl">
        <div class="wrap">
          <figure v-if="cover" class="art-cov dp-art-cov">
            <img :alt="lead.alt" :src="cover" :srcset="coverSrcset" fetchpriority="high" height="900" sizes="(max-width: 1160px) 96vw, 1040px" width="1600" @error="dropSrcset" />
            <figcaption v-if="lead.cap" data-shop-text dir="auto">{{ lead.cap }}</figcaption>
          </figure>
          <div class="art-col">
            <p v-if="lede" class="art-lead">{{ lede }}</p>
            <div v-if="body" class="art-body" @click="bodyClick" v-html="body"></div>
            <ly-sample-tag v-else :text="t('ly.rd.onlySummary', 'Only this post’s summary is in the shop for now.')" />

            <section v-if="products.length" :class="['ap', { one: products.length === 1 }]" aria-labelledby="ap-h">
              <div class="ap-hd">
                <div>
                  <p class="eyebrow">{{ t("ly.rd.named", "Named in this post") }}</p>
                  <h2 id="ap-h" class="ap-t">{{ t("ly.rd.shopPost", "Shop this post") }}</h2>
                </div>
                <button v-if="products.length > 1" :aria-disabled="adding ? 'true' : undefined" class="btn sm" type="button" @click="adding || addAll()">
                  <ly-icon :name="added ? 'check' : 'bag'" /><span>{{ added ? t("ly.rd.inBag", "In your bag") : t("ly.rd.addAll", "Add all") }}</span>
                </button>
              </div>
              <ul class="ap-l">
                <li v-for="p in products" :key="p.id" class="apc">
                  <router-link :to="productTo(p)" aria-hidden="true" class="apc-pl" tabindex="-1"><img :src="productImage(p)" alt="" loading="lazy" /></router-link>
                  <router-link :to="productTo(p)" class="apc-n">{{ p.title }}</router-link>
                  <p class="apc-p">
                    <span class="now money">{{ money(pv(p).now) }}</span><template v-if="pv(p).was">{{ " " }}<s class="was money">{{ money(pv(p).was) }}</s></template>
                  </p>
                  <div class="apc-a"><ly-add :label="t('ly.rd.add', 'Add')" :product="p" /></div>
                </li>
              </ul>
            </section>

            <div :aria-label="t('ly.rd.share', 'Share')" class="share" role="group">
              <span class="share-k">{{ t("ly.rd.share", "Share") }}</span>
              <button class="btn quiet sm" type="button" @click="copyLink">
                <ly-icon :name="copied ? 'check' : 'link'" />{{ copied ? t("ly.rd.copied", "Link copied") : t("ly.rd.copy", "Copy link") }}
              </button>
              <a :href="mailto" class="btn quiet sm"><ly-icon name="mail" />{{ t("ly.rd.email", "Email") }}</a>
              <button v-if="canShare" class="btn quiet sm" type="button" @click="shareMore"><ly-icon name="share" />{{ t("ly.rd.more", "More") }}</button>
            </div>

            <div class="auth">
              <ly-mark />
              <div>
                <b>{{ t("dp.ftr.journal", "Tool talk") }}</b>
                <p>{{ t("dp.art.about", "Guides from the shop: choosing, using and caring for your tools.") }}</p>
                <router-link :to="journalRoute()" class="qlink">{{ t("ly.rd.allPosts", "All posts") }}<ly-icon cls="flip-rtl" name="arrow" /></router-link>
              </div>
            </div>

            <section aria-labelledby="cm-h" class="cmts">
              <h2 id="cm-h" class="ap-t">{{ t("ly.rd.comments", "Comments") }}</h2>
              <s-article-comments :article-id="article.id" :article-user-id="article.user_id" class="ly-comments" is-selldone is-shop>
                <template v-slot:login>
                  <ly-empty :text="t('ly.rd.comFirstP', 'Sign in to leave the first comment on this post.')" :title="t('ly.rd.comFirstT', 'No comments yet')" icon="chat">
                    <template #acts
                      ><button class="btn sm" type="button" @click="signIn">{{ t("ly.rd.comSignIn", "Sign in to comment") }}</button></template
                    >
                  </ly-empty>
                </template>
              </s-article-comments>
            </section>
          </div>
        </div>
      </article>
    </template>

    <template v-else-if="busy">
      <ly-pt :crumbs="[{ label: t('ly.rd.journal', 'Journal'), to: journalRoute() }, { label: t('ly.rd.post', 'Post') }]" art="whisk" art2="croissant" cls="art-pt" />
      <div class="artl" role="status">
        <div class="wrap"><div class="art-cov ly-cov-none"></div></div>
      </div>
    </template>

    <template v-else>
      <ly-pt :crumbs="[{ label: t('ly.rd.journal', 'Journal'), to: journalRoute() }, { label: t('ly.rd.post', 'Post') }]" :title="t('ly.rd.goneT', 'We can’t find this post')" art="whisk" art2="croissant" cls="compact" />
      <section class="sec-s">
        <div class="wrap">
          <ly-empty :text="t('ly.rd.goneP', 'The link may be old, or the post has moved. Every other post is in the journal.')" :title="t('ly.rd.goneT', 'We can’t find this post')" cls="boxed" icon="search" tag="h2">
            <template #acts
              ><router-link :to="journalRoute()" class="btn">{{ t("ly.rd.backJournal", "Back to the journal") }}</router-link></template
            >
          </ly-empty>
        </div>
      </section>
    </template>

    <section v-if="more.length" aria-labelledby="mp-h" class="sec-s more-p">
      <div class="wrap">
        <header class="sec-hd sm">
          <p class="eyebrow">{{ t("ly.rd.keepReading", "Keep reading") }}</p>
          <h2 id="mp-h" class="h2">{{ t("ly.rd.moreH", "More from the journal") }}</h2>
        </header>
        <div class="bgrid">
          <ly-post v-for="b in more" :key="b.id" :post="b" />
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import SArticleComments from "@selldone/components-vue/article/comment/SArticleComments.vue";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { StorefrontSeo } from "../../../helpers/StorefrontSeo";
import LyIcon from "@app-storefront/components/ly/LyIcon.vue";
import LyArt from "@app-storefront/components/ly/LyArt.vue";
import LyAdd from "@app-storefront/components/ly/LyAdd.vue";
import LyPost from "@app-storefront/components/ly/read/LyPost.vue";
import LyPt from "@app-storefront/components/ly/ui/LyPt.vue";
import LyEmpty from "@app-storefront/components/ly/ui/LyEmpty.vue";
import LyMark from "@app-storefront/components/ly/ui/LyMark.vue";
import LySampleTag from "@app-storefront/components/ly/ui/LySampleTag.vue";
import { ly, fmtDate, loadDm, money, priceView, productImage, productTo, shopFacts } from "@app-storefront/components/ly/ly";
import { plainText, shortAddress } from "@app-storefront/components/ly/read/rd";
import { addCount, basketLine, mayBuy } from "@app-storefront/components/kalio/kalio-basket";
import { dropSrcset, photoSrcset } from "@app-storefront/components/kalio/kalio-catalog";
import { journalPage, journalPost, journalRoute, postRoute, productsIn } from "@app-storefront/components/kalio/pages/kalio-journal";
import { currentCurrency } from "@app-storefront/components/region-switcher/region";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

/** The product ids a story's text links to, in order, once each. */
function linkedIds(html: string): number[] {
  const ids: number[] = [];
  for (const m of String(html || "").matchAll(/href="[^"]*\/product\/(\d+)[^"]*"/g)) {
    const id = Number(m[1]);
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

export default {
  name: "StorefrontPageBlogsView",
  components: { SArticleComments, LyIcon, LyArt, LyAdd, LyPost, LyPt, LyEmpty, LyMark, LySampleTag },
  inject: ["$shop"],

  data: () => ({
    article: null as any,
    busy: false,
    more: [] as any[],
    adding: false,
    added: false,
    copied: false,
    ly,
    canShare: typeof navigator !== "undefined" && !!navigator.share,
    seoNavigation: StorefrontSeo.captureNavigation(),
  }),

  computed: {
    blogId() {
      return this.$route.params.blog_id;
    },
    shop() {
      return this.$store.getters.getShop;
    },
    /* The shop's text, with the editor's leftovers taken out. */
    /* The body without its opening picture when that picture is the cover (see the template), with the picture's alt
       and caption kept for the cover. A body that opens with words, or with another picture, is left as it is. */
    lead() {
      const html = String(this.article?.body || "")
        .replace(/\scontenteditable="[^"]*"/g, "")
        .replace(/src="http:/g, 'src="');
      const out = { html, alt: "", cap: "" };
      const image = this.article?.image;
      if (!image || !html || typeof document === "undefined") return out;
      const key = (u: string) => String(u || "").split(/[?#]/)[0].replace(/\.(png|jpe?g|webp)\d+\.(png|jpe?g|webp)$/i, ".$1").split("/").pop()!.toLowerCase();
      const root = document.createElement("div");
      root.innerHTML = html;
      const img = root.querySelector("img");
      if (!img || key(img.getAttribute("src") || "") !== key(image)) return out;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n: Node | null;
      while ((n = walker.nextNode())) if (img.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_PRECEDING && (n.textContent || "").trim()) return out;
      let box: Element = img.closest("figure") || img;
      const wrap = box.parentElement;
      if (wrap && wrap !== root && wrap.children.length === 1) box = wrap;
      out.alt = img.getAttribute("alt") || "";
      out.cap = (box.querySelector?.("figcaption")?.textContent || "").trim();
      box.remove();
      out.html = root.innerHTML;
      return out;
    },
    body() {
      return this.lead.html;
    },
    cover() {
      const image = this.article?.image;
      return image ? window.CDN.GET_SHOP_IMAGE_PATH(image, null) : null;
    },
    coverSrcset() {
      return photoSrcset(this.cover);
    },
    /* The description, unless it is only the first words of the text. */
    lede() {
      const d = plainText(this.article?.description);
      if (!d) return "";
      const start = plainText(this.article?.body).slice(0, 40);
      return start && d.startsWith(start) ? "" : d;
    },
    /* The pastries the story links to (else the ones it names), at most four. */
    products() {
      if (!this.article) return [];
      const byId = new Map(this.ly.products.map((p: any) => [p.id, p]));
      const linked = linkedIds(this.article.body)
        .map((id) => byId.get(id))
        .filter(Boolean)
        .slice(0, 4);
      if (linked.length) return linked;
      return productsIn(this.article.body, this.ly.products, 4);
    },
    shopName() {
      const n = String(this.shop?.title || "");
      return n.charAt(0).toUpperCase() + n.slice(1);
    },
    crumbs() {
      return [{ label: t("ly.rd.journal", "Journal"), to: journalRoute() }, { label: t("ly.rd.post", "Post") }];
    },
    /* "Notes from the counter at 1 The Embarcadero, San Francisco." */
    counterLine() {
      const at = shortAddress(shopFacts(this.shop));
      return at ? t("ly.rd.notesAt", "Notes from the counter at {place}.", { place: at }) : t("ly.rd.notes", "Notes from the counter.");
    },
    mailto() {
      return `mailto:?subject=${encodeURIComponent(this.article?.title || "")}&body=${encodeURIComponent(location.href)}`;
    },
  },

  watch: {
    blogId() {
      this.load();
    },
    "$route.fullPath"() {
      this.seoNavigation = StorefrontSeo.captureNavigation();
    },
  },

  created() {
    loadDm();
    this.load();
  },

  methods: {
    t,
    money,
    fmtDate,
    productImage,
    productTo,
    journalRoute,
    dropSrcset,
    pv(p: any) {
      void currentCurrency();
      return priceView(this.shop, p);
    },
    load() {
      const asked = this.blogId;
      this.busy = true;
      this.article = null;
      this.more = [];
      /* The post's own address is /blog/<slug>-<blog id>. An address that starts with a number (/blog/<id>-<slug>, an
         article id or a blog id) still opens the post: the number is tried as the blog id, then looked up among the
         journal's posts as an article id; the address then becomes the post's own (Toy Fair d20c173, Storybook 98b73d5). */
      const lead = /^(\d+)(?:-|$)/.exec(String(asked || ""));
      const num = lead ? lead[1] : asked;
      journalPost(num)
        .catch((err: any) => {
          if (!lead) throw err;
          return journalPage({ page: 1, limit: 60 }).then(({ articles }: any) => {
            const hit = (articles || []).find((a: any) => String(a.id) === num || String(a.parent_id) === num);
            if (!hit) throw err;
            return journalPost(hit.parent_id || hit.id);
          });
        })
        .then((data: any) => {
          if (asked !== this.blogId) return;
          if (lead && data?.article) this.$router.replace(postRoute(data.article)).catch(() => {});
          this.article = data.article;
          this.setPageTitle?.(data.article.title);
          StorefrontSeo.updateArticle(data.article, this.$store.getters.getShop, this.seoNavigation);
          journalPage({ page: 1, limit: 4 })
            .then(({ articles }: any) => {
              if (asked === this.blogId) this.more = (articles || []).filter((a: any) => a.id !== data.article.id).slice(0, 3);
            })
            .catch(() => {});
        })
        .catch(() => {})
        .finally(() => {
          if (asked === this.blogId) this.busy = false;
        });
    },
    /* A link inside the story to this shop opens in the app. */
    bodyClick(e: MouseEvent) {
      const a = (e.target as HTMLElement)?.closest?.("a") as HTMLAnchorElement | null;
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      let url: URL;
      try {
        url = new URL(a.getAttribute("href") || "", location.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin) return;
      const m = /\/product\/(\d+)/.exec(url.pathname);
      e.preventDefault();
      if (m) this.$router.push(productTo({ id: Number(m[1]) }));
      else this.$router.push(url.pathname + url.search + url.hash).catch(() => {});
    },
    async addAll() {
      if (!mayBuy(this)) return;
      this.adding = true;
      try {
        for (const p of this.products) {
          if (!(p.quantity > 0)) continue;
          if (basketLine(this, p)?.count > 0) continue;
          await addCount(this, p, null, 1);
        }
        this.added = true;
        setTimeout(() => (this.added = false), 1500);
      } finally {
        this.adding = false;
      }
    },
    copyLink() {
      const done = () => {
        this.copied = true;
        setTimeout(() => (this.copied = false), 1500);
      };
      try {
        navigator.clipboard?.writeText(location.href).then(done, done);
      } catch {
        done();
      }
    },
    shareMore() {
      navigator.share?.({ title: document.title, url: location.href }).catch(() => {});
    },
    signIn() {
      EventBus.$emit("need-login", true);
    },
  },
};
</script>
