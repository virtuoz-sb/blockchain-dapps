<template>
  <div class="flex flex-col h-full md:h-auto pt-20 pb-10 px-20 overflow-y-auto md:overflow-y-visible custom-scrollbar">
    <h3 class="text-xl1 text-white mb-10">{{ data.aboutAuthor.title }}</h3>
    <p class="text-sm text-grey-cl-100 mb-10">{{ data.aboutAuthor.description }}</p>
    <ul class="flex flex-col mb-25">
      <li
        class="point-gradient text-grey-cl-100 text-sm leadning-xs mb-10 last:mb-0"
        v-for="(item, index) in data.aboutAuthor.list"
        :key="index"
      >
        {{ item }}
      </li>
    </ul>
    <div class="flex items-start">
      <p class="lex flex-shrink-0 text-base text-white mr-15 mb-10">What you will learn:</p>
      <div class="flex items-center flex-wrap">
        <span
          v-for="(item, index) in data.aboutAuthor.learnList"
          :key="index"
          class="flex flex-shrink-0 bg-blue-cl-100 text-sm leading-xs text-white mr-10 last:mr-0 px-8 py-3 rounded-5 mb-10"
        >
          {{ item }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "AboutAuthor" })
export default class AboutAuthor extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: object;
}
</script>
