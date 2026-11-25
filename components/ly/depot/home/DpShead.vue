<!-- Depot: a section head (an icon, the title set in the display face, a rule, and an optional "more" pill). -->
<template>
  <div class="dp-shead">
    <h2><ly-icon :name="icon" />{{ title }}</h2>
    <i aria-hidden="true"></i>
    <router-link v-if="to && more" :to="to" class="dp-more">{{ more }}<ly-icon name="arrow" /></router-link>
  </div>
</template>

<script>
import LyIcon from "../../LyIcon.vue";

export default {
  name: "DpShead",
  components: { LyIcon },
  props: {
    icon: { type: String, default: "grid" },
    title: { type: String, default: "" },
    more: { type: String, default: "" },
    to: { type: [Object, String], default: null },
  },
};
</script>
