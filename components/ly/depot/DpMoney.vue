<!--
  Depot: an amount as a tool superstore writes it, the currency sign and the cents raised ("$176⁰⁰"), in the
  visitor's currency. The whole amount stays one left-to-right piece and its spoken label is the plain amount.
-->
<template>
  <span :aria-label="text" class="money dp-money" dir="ltr" role="text"
    ><span aria-hidden="true"
      ><sup v-if="parts.sign" class="dp-m-s">{{ parts.sign }}</sup>{{ parts.main }}<sup v-if="parts.cents" class="dp-m-c">{{ parts.cents }}</sup
      ><span v-if="parts.tail" class="dp-m-t">{{ parts.tail }}</span></span
    ></span
  >
</template>

<script>
import { money } from "../ly";
import { currentCurrency } from "../../region-switcher/region";

export default {
  name: "DpMoney",
  props: { amount: { type: Number, default: 0 } },
  computed: {
    text() {
      void currentCurrency();
      return money(this.amount);
    },
    /* "$1,234.56" -> $ · 1,234 · 56; "1.234,56 €" -> 1.234 · 56 · € ; an amount without cents keeps its whole text */
    parts() {
      const s = String(this.text).replace(/[⁦-⁩‎‏]/g, "");
      const m = s.match(/^([^\d]*?)\s*(\d[\d.,\s  ]*?)[.,](\d{2})\s*([^\d]*)$/);
      if (!m) return { sign: "", main: s, cents: "", tail: "" };
      return { sign: m[1].trim(), main: m[2], cents: m[3], tail: m[4].trim() };
    },
  },
};
</script>
