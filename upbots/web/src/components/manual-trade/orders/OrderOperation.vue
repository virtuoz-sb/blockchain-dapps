<template>
  <div class="operation flex flex-col order-operation bg-dark-cl-300 mt-20">
    <div
      v-for="(operation, index) of operations"
      :key="index"
      class="operation flex flex-col justify-between w-full text-grey-cl-920 border-b border-grey-cl-400 md:border-b-0 px-20 md:px-0 pt-12 md:py-0"
      @click="collapse(index)"
    >
      <div class="flex w-full justify-between items-center pb-12 md:pb-0">
        <div class="flex md:text-xs md:leading-xs">
          <div class="flex items-center">
            <span>{{ index + 1 }}.</span>
          </div>
          <div v-for="(item, index) in operation" :key="index" class="flex items-center border-r border-grey px-5 last:border-r-0">
            <p class="truncate max-w-26">{{ item }}</p>
          </div>
        </div>
        <div class="flex items-center">
          <div class="flex max-w-50 w-full mr-10">
            <span class="truncate text-white text-sm leading-md">{{ operation.totalValue }}</span>
          </div>
          <div v-if="!collapsed || (isCollapse && index === collapsedIndex)" class="flex operation-icons text-blue-cl-100">
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
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { Tab } from "@/models/interfaces";

@Component({ name: "OrderOperation" })
export default class OrderOperation extends Vue {
  /* PROPS */
  @Prop({ required: true }) operations!: Tab;
  @Prop({ type: Boolean, default: false }) collapsed: boolean;

  /* DATA */
  isCollapse: boolean = false;
  collapsedIndex: number | undefined;

  /* METHODS */
  collapse(index: number) {
    this.isCollapse = !this.isCollapse;
    this.collapsedIndex = index;
  }
}
</script>

<style lang="scss" scoped>
.order-operation {
  @media (min-width: 1279px) {
    .operation {
      @apply flex-row mb-20;
      &:last-child {
        margin-bottom: 0;
      }
    }
    .operation-icons-text {
      @apply hidden;
    }
  }

  @media (max-width: 1279px) and (min-width: 768px) {
    .operation-icons {
      padding: 15px 0;
    }
    .operation-icons-text {
      display: inline;
    }
  }
}
</style>
