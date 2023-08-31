<template>
  <div class="training-card flex flex-col shadow-20 rounded-5 px-10 pb-15">
    <div class="training-card__img-wrap h-120 mb-15 rounded-5">
      <img :src="data.img" :alt="data.img" class="h-full w-full object-cover rounded-5" />
    </div>
    <h3 class="text-xl font-semibold text-white mb-5">{{ data.title }}</h3>
    <p class="training-card__description text-sm mb-10">{{ data.description }}</p>
    <ul class="flex items-center mb-12">
      <li
        v-for="(item, index) in data.keywords"
        :key="index"
        class="training-card__list-item relative text-xs text-grey-cl-100 pl-5 ml-5 first:pl-0 first:ml-0"
      >
        {{ item }}
      </li>
    </ul>
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center">
        <AppRating :value="data.rating" class="text-base" />
        <p class="ml-10 text-xs text-grey-cl-300">{{ data.rating }}</p>
      </div>
      <div class="flex items-center">
        <span class="training-card__full-price relative text-sm leading-xs text-grey-cl-100 mr-10">{{ 200 | toCurrency("USD", 0) }}</span>
        <span class="text-xl1 leading-xs text-blue-cl-400 text-shadow-4">{{ 100 | toCurrency("USD", 0) }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "TrainingsCard" })
export default class TrainingsCard extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: object;
}
</script>

<style lang="scss" scoped>
.training-card {
  background: rgba(42, 43, 47, 0.7);
  &__img-wrap {
    margin-top: -20px;
  }
  &__description {
    color: #dedede;
    opacity: 0.7;
  }
  &__list-item {
    &:first-child {
      &:after {
        content: none;
      }
    }
    &:after {
      content: "";
      @apply absolute h-2 w-2 bg-grey-cl-100 rounded-full;
      top: 7px;
      left: -1px;
    }
  }
  &__full-price {
    &:after {
      content: "";
      @apply absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-px bg-grey-cl-100;
    }
  }
}
</style>
