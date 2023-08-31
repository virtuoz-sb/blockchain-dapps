<template>
  <div class="flex flex-col w-full py-15 px-10">
    <div class="flex items-center mb-10">
      <div class="flex mr-10">
        <span class="text-sm leading-xs text-iceberg">
          {{ !is2FAEnabled ? "We advise making your account completely secure by enabling 2FA" : "Activated" }}
        </span>
      </div>
      <div
        v-if="is2FAEnabled"
        class="check-icon__wrap flex items-center justify-center flex-shrink-0 w-18 h-18 border border-solid border-grey-cl-400 rounded-full mr-7 is-active"
      >
        <i class="icon-check text-white text-xxs" />
      </div>
    </div>
    <div>
      <AppButton type="light-green" size="xs" class="w-full" @click="$emit('click')">
        {{ !is2FAEnabled ? "Enable 2FA" : "Remove 2FA" }}
      </AppButton>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";

const fromAuth = namespace("authModule");

@Component({ name: "TwoFactorAuthentication" })
export default class TwoFactorAuthentication extends Vue {
  /* VUEX */
  @fromAuth.Getter is2FAEnabled!: any;
}
</script>

<style lang="scss" scoped>
.check-icon {
  &__wrap {
    &.is-active {
      @apply shadow-30 border-none;
      background: linear-gradient(225deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%), #27adc5;
      background-blend-mode: overlay, normal;
    }
  }
}
</style>
