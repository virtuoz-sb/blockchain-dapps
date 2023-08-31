<template>
  <div class="flex flex-col h-full overflow-y-auto custom-scrollbar relative">
    <div class="lessons__item-wrap flex flex-col flex-grow py-10 overflow-y-auto custom-scrollbar z-1">
      <div class="flex flex-col flex-grow">
        <div
          class="lessons__item flex items-center justify-between py-4 px-20 cursor-pointer"
          v-for="(item, index) in data.lessonsList"
          :key="index"
        >
          <div class="flex items-center">
            <div
              class="w-16 h-16 border-solid rounded-full mr-30"
              :class="item.isDone ? 'bg-blue-cl-400' : 'border border-solid border-grey-cl-400'"
            />
            <div class="flex flex-col">
              <span class="text-base text-white mb-2">{{ item.title }}</span>
              <span class="text-grey-cl-400 text-sm">{{ item.subtitle }}</span>
            </div>
          </div>
          <div class="flex transform rotate-270">
            <span class="icon-arrow-expand text-grey-cl-400 text-xxs" />
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="data.isAllow"
      class="lessons__inactive absolute top-0 left-0 w-full flex flex-col items-center justify-center p-20 z-1 cursor-not-allowed"
    >
      <i class="icon-lock text-blue-cl-400 mb-15" />
      <span class="lessons__inactive-text text-blue-cl-400 text-shadow-4 text-xl1 font-semibold text-center mx-auto">
        Enroll this course for unlock
      </span>
    </div>

    <div class="px-20 pb-20 relative z-2">
      <AppButton type="light-green" class="w-full">{{ data.price }}</AppButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "Lessons" })
export default class Lessons extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: object;
}
</script>

<style lang="scss" scoped>
.lessons {
  &__item {
    transition: ease-in-out 0.5s;
    &:hover {
      background: rgba(168, 168, 168, 0.05);
    }
  }
  &__inactive {
    @apply h-full;
    background: rgba(0, 0, 0, 0.7);
  }
  &__inactive-text {
    max-width: 185px;
  }
}

.icon-lock {
  font-size: 78px;
}
</style>
