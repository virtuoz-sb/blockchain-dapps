<template>
  <div class="buttons-group flex" :class="buttonTypes">
    <div
      v-for="item in items"
      :key="item.value"
      class="buttons-group__item flex justify-center items-center w-full cursor-pointer"
      :class="[customClasses, active === item.value && 'is-active']"
      :is-grouped="true"
      @click="selectValue(item)"
    >
      <span>{{ item.label }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Model } from "vue-property-decorator";
import { GroupItems } from "@/models/interfaces";

/* BUTTONS TYPES */
const types = Object.freeze({
  outlined: "is-outlined",
  filled: "is-filled",
});

@Component({ name: "AppButtonsGroup" })
export default class AppButtonsGroup extends Vue {
  /* MODEL */
  @Model("value") active!: string;

  /* PROPS */
  @Prop({ required: true, validator: (prop) => prop.length > 1 }) items!: GroupItems[];
  @Prop({ default: "" }) customClasses: string;
  @Prop({ default: "outlined" }) type: string;

  /* DATA */
  types: { [key: string]: string } = types;

  /* COMPUTED */
  get buttonTypes() {
    return this.types[this.type];
  }

  /* METHODS */
  selectValue(item: any) {
    this.$emit("value", item.value);
    this.$emit("change", item);
  }
}
</script>

<style lang="scss" scoped>
.buttons-group {
  &.is-outlined {
    @apply z-1;

    &:last-child {
      @apply rounded-r-5;
    }

    &:first-child {
      @apply rounded-l-5;
    }

    .buttons-group {
      &__item {
        @apply text-grey-cl-100 border-2 border-solid border-grey-cl-400 -ml-2;
        &:first-child {
          @apply ml-0;
        }
        &.is-active {
          @apply border-tradewind text-white shadow-30 z-2;
        }
      }
    }
  }

  &.is-filled {
    @apply h-40 bg-blue-dianne rounded-full p-2;

    .buttons-group {
      &__item {
        @apply text-white leading-xs p-5;
        &.is-active {
          @apply bg-puerto-rico rounded-full;
        }
        &:not(.is-active) {
          @apply text-opacity-70;
          transition: 0.1s;

          &:hover {
            @apply text-opacity-100;
          }
        }
      }
    }
  }
}
</style>
