<!-- Depot: the journal ("Tool talk"): the shop's four newest posts with their cover, date and title; hidden without posts. -->
<template>
  <section v-if="posts.length" :aria-label="t('dp.ftr.journal', 'Tool talk')" class="dp-sec dp-journal">
    <div class="wrap">
      <dp-shead :more="t('dp.home.allPosts', 'All posts')" :title="t('dp.ftr.journal', 'Tool talk')" :to="blogTo" icon="order" />
      <div class="dp-jg">
        <router-link v-for="b in posts" :key="b.id" :to="postRoute(b)" class="dp-jc">
          <span class="dp-photo"><img v-if="b.image" :src="postImg(b)" alt="" loading="lazy" /></span>
          <time v-if="b.created_at" :datetime="b.created_at">{{ fmtDate(b.created_at) }}</time>
          <b><bdi>{{ b.title }}</bdi></b>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
import DpShead from "./DpShead.vue";
import dpHome from "./dp-home";
import { fmtDate } from "../../ly";
import { journalPage, journalRoute, postRoute } from "../../../kalio/pages/kalio-journal";

export default {
  name: "DpJournal",
  components: { DpShead },
  mixins: [dpHome],
  data: () => ({ posts: [] }),
  computed: {
    blogTo() {
      return journalRoute();
    },
  },
  mounted() {
    journalPage({ page: 1, limit: 12 })
      .then(({ articles }) => {
        const list = (articles || []).slice().sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
        this.posts = list.slice(0, 4);
      })
      .catch(() => (this.posts = []));
  },
  methods: {
    fmtDate,
    postRoute,
    postImg(b) {
      return window.CDN.GET_SHOP_IMAGE_PATH(b.image, null);
    },
  },
};
</script>
