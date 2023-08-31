<template>
  <div class="flex flex-col flex-grow-1 relative px-20">
    <div v-for="item in filteredData" :key="item.id" class="flex flex-col flex-shrink-0 mb-30 md:mb-0 last:mb-0">
      <div class="flex items-center justify-between w-full">
        <div class="flex md:items-center flex-col md:flex-row w-full">
          <div class="web-hook__title-wrap flex w-full pr-20">
            <span class="text-sm leading-xs text-white">{{ item.title }}</span>
          </div>
          <div class="web-hook__desc relative">
            <pre class="web-hook__pre text-xs text-grey-cl-100 w-full">{{ item.desc }}</pre>
          </div>
        </div>
        <div class="web-hook__btn-wrap pl-10 md:pl-40">
          <app-button type="light-green" class="web-hook__btn">Copy</app-button>
        </div>
      </div>

      <div v-if="!$breakpoint.smAndDown" class="web-hook__line w-full mt-10" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "WebHook" })
export default class WebHook extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any[];
  @Prop({ required: true }) stratType: string;

  /* COMPUTED */
  get filteredData() {
    //"Start Long"
    //"Start Short"
    //"Close Position"
    if (this.data) {
      return this.data.filter((x) => {
        //avoid Start Short for long only bot data
        if (x.title.includes("Short") && this.stratType === "Long") {
          return false;
        }
        //avoid Start Long for Short only bot data
        if (x.title.includes("Long") && this.stratType === "Short") {
          return false;
        }
        return true;
      });
    }
    return [];
  }
}
</script>

<style lang="scss" scoped>
.web-hook {
  &__title-wrap {
    max-width: 100px;
  }

  &__btn {
    min-width: 106px;
  }

  &__pre {
    white-space: pre-line;
  }

  @media (min-width: 768px) {
    &__desc {
      &:after {
        content: "";
        @apply absolute right-0 w-full h-px shadow-30;
        bottom: -11px;
        background: linear-gradient(0deg, rgba(110, 212, 202, 0.3) 0%, rgba(36, 129, 155, 0.3) 100%);
      }
    }
    &__line {
      @apply h-px;
      background-image: linear-gradient(to right, rgba(52, 56, 64, 0) 0%, #343840 12.36%, #343840 88.4%, rgba(52, 56, 64, 0) 100%);
    }
  }
}
</style>
