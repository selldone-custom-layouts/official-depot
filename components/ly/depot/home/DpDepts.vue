<!-- Depot: the departments as photo tiles with a caption bar (Acme's "Top categories"): the skin's photo for the
     department (col-<slug>), else the department's own image cut out on white. -->
<template>
  <section v-if="cats.length" :aria-label="t('dp.home.topDepts', 'Top departments')" class="dp-sec dp-depts-s">
    <div class="wrap">
      <dp-shead :more="t('dp.home.byDept', 'Shop by department')" :title="t('dp.home.topDepts', 'Top departments')" :to="shopTo" icon="grid" />
      <div :class="['dp-cat-g', 'n' + cats.length]">
        <router-link v-for="c in cats" :key="c.id" :to="catTo(c)" class="dp-cat">
          <span class="dp-cat-ph"><img v-if="colPhoto(c)" :src="colPhoto(c)" alt="" loading="lazy" /><img v-else-if="catImg(c)" :src="catImg(c)" alt="" class="cut" loading="lazy" /></span>
          <b><bdi>{{ catTitle(c) }}</bdi></b>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
import DpShead from "./DpShead.vue";
import dpHome from "./dp-home";

export default { name: "DpDepts", components: { DpShead }, mixins: [dpHome] };
</script>
