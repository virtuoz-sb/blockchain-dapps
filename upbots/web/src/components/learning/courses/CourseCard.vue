<template>
  <div
    class="flex flex-col items-center self-start md:flex-shrink-0 md:mr-30 last:mr-0 cursor-pointer"
    @click="$router.push('/learning-course')"
  >
    <div class="card__img relative w-40 h-40 rounded-5">
      <img :src="data.img" :alt="data.alt" class="h-full w-full object-cover" />
      <div
        v-if="isProgress"
        class="progress-line absolute bottom-0 left-0 w-full"
        :class="{ 'rounded-t-5': data.isDone === 100 }"
        :style="`height: ${data.isDone}%`"
      />
      <div v-if="isProgress" class="progress-number absolute top-1/2 left-1/2 text-white text-base font-semibold">{{ data.isDone }}%</div>
    </div>
    <p class="progress-title w-full text-white text-sm leading-xs font-semibold mt-5 text-center">{{ data.title }}</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "CourseCard" })
export default class CourseCard extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: object;
  @Prop({ default: false, type: Boolean }) isProgress: boolean;
}
</script>

<style lang="scss" scoped>
.progress-title {
  max-width: 100px;
}

.progress-number {
  transform: translate(-50%, -50%);
}

.progress-line {
  background: #24819b;
  opacity: 0.7;
  box-shadow: 0px 0px 5px rgba(74, 172, 179, 0.5);
  @apply rounded-b-5;
}
</style>
