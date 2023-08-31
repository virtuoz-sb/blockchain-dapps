<template>
  <div
    class="grid grid-cols-3 row-gap-25 md:row-gap-0 col-gap-40 md:col-gap-0 px-20 overflow-y-auto md:flex md:items-start md:h-full md:mx-20 md:my-16 md:px-0 md:overflow-y-visible md:overflow-auto custom-scrollbar"
  >
    <div class="card__img-wrap flex md:flex-shrink-0 md:mr-30 last:mr-0 mx-auto md:mx-0" v-for="(item, index) in data" :key="index">
      <img :src="item.img" :alt="item.alt" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "MyAchievements" })
export default class MyAchievements extends Vue {
  /* DATA */
  data: any[] = [
    { img: require("@/assets/images/learning/my-course-badges/badges-img-1.png"), alt: "badges-1" },
    { img: require("@/assets/images/learning/my-course-badges/badges-img-2.png"), alt: "badges-2" },
  ];
}
</script>

<style lang="scss" scoped>
.card {
  &__img-wrap {
    max-width: 56px;
  }
}
</style>
