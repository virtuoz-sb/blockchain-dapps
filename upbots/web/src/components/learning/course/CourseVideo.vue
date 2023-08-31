<template>
  <div class="course-video flex flex-col md:mb-30 md:mb-40 md:pt-16">
    <div class="flex flex-col w-full h-full">
      <img :src="data.img" alt="video" class="flex flex-col w-full h-full object-cover" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "CourseVideo" })
export default class CourseVideo extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any[];
}
</script>

<style lang="scss" scoped>
.course-video {
  height: 460px;
  @media (max-width: 1024px) {
    height: 290px;
  }
  @media (max-width: 767px) {
    height: 190px;
  }
}
</style>
