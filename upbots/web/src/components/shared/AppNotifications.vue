<template>
  <notifications position="top center" :width="$breakpoint.smAndDown ? '100%' : '600'">
    <template slot="body" slot-scope="props">
      <div
        class="notification__wrap flex items-center justify-between sm:rounded-8 px-20 py-14 sm:mt-20 mx-auto"
        :class="props.item.type ? `is-${props.item.type}` : 'bg-grey-cl-200'"
      >
        <div class="flex items-center">
          <i class="text-white mr-10" :class="props.item.type ? `icon-${props.item.type}` : null" />
          <span v-if="props.item.type" class="text-white text-md leading-xs font-semibold mr-8 capitalize">{{ props.item.type }}:</span>
          <span class="text-white text-md leading-xs">{{ props.item.text }}</span>
        </div>
        <div class="flex">
          <i class="icon-cross text-white cursor-pointer" @click="props.close" />
        </div>
      </div>
    </template>
  </notifications>
</template>

<script>
// Posible types for Notification: "error", "success", "warning", "info".
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

@Component({ name: "AppNotifications" })
export default class AppNotifications extends Vue {
  /* COMPUTED */
  get width() {
    return this.$breakpoint.smAndDown ? "100%" : "600";
  }
}
</script>

<style lang="scss" scoped>
.notification {
  &__wrap {
    min-height: 58px;
    &.is-success {
      @apply bg-success;
    }
    &.is-error {
      @apply bg-error;
    }
    &.is-warning {
      @apply bg-warning;
    }
    &.is-info {
      @apply bg-info;
    }
  }
}
.icon-info {
  font-size: 30px;
}
.icon-warning {
  font-size: 30px;
}
.icon-error {
  font-size: 30px;
}
.icon-success {
  font-size: 20px;
}
</style>
