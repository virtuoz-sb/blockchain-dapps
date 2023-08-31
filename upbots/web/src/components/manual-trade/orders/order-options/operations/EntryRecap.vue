<template>
  <div
    class="operation flex flex-col justify-between w-full text-grey-cl-920 border-b border-grey-cl-400 md:border-b-0 px-20 md:px-0 pt-12 md:py-0"
  >
    <div class="flex w-full justify-between items-center pb-12 md:pb-0">
      <div class="flex md:text-xs md:leading-xs">
        <div class="flex items-center">
          <span>{{ index + 1 }}.</span>
        </div>
        <div class="flex items-center border-r border-grey px-5 last:border-r-0">
          <p class="truncate max-w-40">{{ data.adaptationsType.value }}</p>
        </div>
        <div class="flex items-center border-r border-grey px-5 last:border-r-0">
          <p class="truncate max-w-40">{{ data.amount }}</p>
        </div>
        <div class="flex items-center border-r border-grey px-5 last:border-r-0">
          <p class="truncate max-w-40">{{ data.rangeValue }}%</p>
        </div>
      </div>
      <div class="flex items-center">
        <div class="flex max-w-50 w-full mr-10">
          <span class="truncate text-white text-sm leading-md">{{ data.totalValue }}</span>
        </div>
        <div class="flex operation-icons text-blue-cl-100">
          <div class="flex items-center cursor-pointer mr-10" @click="$emit('edit', index)">
            <i class="icon-edit text-xl1 md:text-base" />
          </div>
          <div class="flex items-center cursor-pointer" @click="$emit('remove', index)">
            <i class="icon-trash text-xl1 md:text-base" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

@Component({ name: "EntryRecap" })
export default class EntryRecap extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any;
  @Prop({ required: true, type: Number }) index: number;
}
</script>

<style lang="scss" scoped>
.operation {
  @media (min-width: 1279px) {
    @apply flex-row mb-20;
    &:last-child {
      margin-bottom: 0;
    }
  }
}
.operation-icons-text {
  @media (min-width: 1279px) {
    @apply hidden;
  }
}

.operation-icons {
  @media (max-width: 1279px) and (min-width: 768px) {
    padding: 15px 0;
  }
}
.operation-icons-text {
  @media (max-width: 1279px) and (min-width: 768px) {
    display: inline;
  }
}
</style>
