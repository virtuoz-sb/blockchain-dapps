<template>
  <div class="trainings">
    <Card class="flex flex-col h-full bg-dark-200 rounded-3 overflow-y-auto custom-scrollbar" header-classes="flex items-center">
      <template slot="header-left">
        <span class="leading-md text-white">All Trainings</span>
      </template>

      <div slot="content" class="trainings__card-shadow relative h-full flex flex-col overflow-y-auto custom-scrollbar px-20 pt-20">
        <!-- TRAININGS FILTERS -->
        <slot name="filters" />

        <!-- TRAININGS CARDS -->
        <div class="relative h-full overflow-y-auto custom-scrollbar pt-20 pb-20">
          <div class="grid grid-cols-4 row-gap-40 col-gap-30 pt-20">
            <TrainingsCard :data="item" v-for="item in data" :key="item.id" />
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import TrainingsCard from "@/components/learning/trainings/TrainingsCard.vue";

@Component({ name: "Trainings", components: { TrainingsCard } })
export default class Trainings extends Vue {
  /* PROPS */
  @Prop({ required: true }) data!: any;
}
</script>

<style lang="scss" scoped>
.trainings {
  height: calc(100% - 186px);
  &__card-shadow {
    &:after {
      content: "";
      @apply absolute w-full h-56 bottom-0 left-0;
      background: linear-gradient(180deg, #161619 0%, rgba(22, 22, 25, 0) 0.01%, #161619 100%);
    }
  }
}
</style>
