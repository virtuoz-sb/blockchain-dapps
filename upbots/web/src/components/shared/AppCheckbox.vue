<template>
  <div class="flex items-center cursor-pointer" @click="$emit('click')">
    <div class="checkbox__wrap relative flex-shrink-0 h-16 w-16 border border-solid rounded-3" :class="value && 'active'">
      <input
        :id="_uid"
        class="absolute w-full h-full m-0 opacity-0 cursor-pointer z-20"
        type="checkbox"
        :checked="value"
        :class="customClass"
        @input="$emit('input', $event.target.checked)"
      />
      <div v-if="value" class="flex items-center justify-center w-full h-full">
        <i class="icon-check text-blue-cl-400 text-xs z-10" />
      </div>
    </div>
    <label @click.stop class="text-sm leading-xs text-grey-cl-920 pl-10 cursor-pointer" :for="_uid">
      <!-- S L O T -->
      <slot />
    </label>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "AppCheckbox" })
export default class AppCheckbox extends Vue {
  /* PROPS */
  @Prop({ default: "" }) customClass!: string;
  @Prop({ default: false }) value!: boolean;
}
</script>

<style lang="scss" scoped>
.checkbox {
  &__wrap {
    @apply border-san-juan;
    &:hover {
      color: #215f7c;
      .icon-check {
        color: #215f7c;
      }
    }
    &.active {
      border-color: #366366;
      .icon-check {
        color: #366366;
      }
    }
  }
}
</style>
