<template>
  <div
    class="grid grid-cols-3 row-gap-25 md:row-gap-0 col-gap-40 md:col-gap-0 px-20 overflow-y-auto md:flex md:items-start md:h-full md:mx-20 md:my-16 md:px-0 md:overflow-y-visible md:overflow-auto custom-scrollbar"
  >
    <!-- COURSE CARD -->
    <CourseCard :data="item" v-for="(item, index) in data" :key="index" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import CourseCard from "@/components/learning/courses/CourseCard.vue";

@Component({ name: "CompletedCourses", components: { CourseCard } })
export default class CompletedCourses extends Vue {
  /* DATA */
  data: any[] = [
    { isDone: 72, img: require("@/assets/images/learning/completed-courses/course-img-1.png"), title: "Blockchain for beginners" },
    { isDone: 100, img: require("@/assets/images/learning/completed-courses/course-img-2.png"), title: "Digital payments (Crypto)" },
  ];
}
</script>
