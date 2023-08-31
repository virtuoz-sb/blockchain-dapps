<template>
  <v-popover offset="8" trigger="manual" :auto-hide="false" :open="isOpen" :class="[isDropdownOpen, isDarkClassess]" class="dropdown">
    <!-- PREVIEW -->
    <div class="flex items-center cursor-pointer" @click="isOpen = true">
      <!-- PREVIEW TITLE -->
      <div
        v-if="!!caption || placeholder"
        :class="[fontSizeClasses, !!placeholderClasses ? placeholderClasses : 'dropdown__preview-title']"
      >
        {{ !!caption ? caption : placeholder }}
      </div>

      <!-- PREVIEW EXPAND -->
      <div v-if="!!caption || placeholder" class="dropdown__preview-expand-wrap flex ml-4">
        <i :class="[{ 'transform rotate-180': isOpen }]" class="dropdown__preview-expand icon-arrow-expand" />
      </div>
    </div>

    <!-- CONTENT -->
    <template slot="popover">
      <div v-if="isOpen" :class="[isDarkClassess]" class="dropdown__content flex rounded-5 overflow-y-auto custom-scrollbar">
        <!-- CONTENT WRAP -->
        <ul :class="contentSizeClasses" class="dropdown__content-list-wrap flex flex-col overflow-y-auto custom-scrollbar">
          <!-- CONTENT ITEM -->
          <li
            v-for="item in options"
            :key="item[keyValue]"
            :class="disabledOptions && disabledOptions.includes(item[disabledKeyName]) && 'opacity-30 cursor-not-allowed select-none'"
            class="flex flex-col flex-shrink-0 cursor-pointer"
          >
            <div
              :class="[itemSizeClasses, disabledOptions && disabledOptions.includes(item[disabledKeyName]) && 'pointer-events-none']"
              class="dropdown__content-item flex items-center"
              @click="selectItem(item)"
            >
              <!-- CONTENT CHECKED -->
              <div
                :class="{ 'is-active': value.includes(item[keyLabel]) }"
                class="check-icon__wrap flex items-center justify-center flex-shrink-0 w-18 h-18 border border-solid border-grey-cl-400 rounded-full mr-7 cursor-pointer"
              >
                <i v-if="value.includes(item[keyLabel])" class="icon-check text-white text-xxs" />
              </div>

              <!-- CONTENT LABEL -->
              <div :class="[fontSizeClasses, { 'mr-6': item && item.img }]" class="dropdown__content-item-title flex">
                {{ item[keyLabel] }}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </template>

    <!-- BACKDROP -->
    <div v-if="isOpen" class="fixed top-0 left-0 right-0 bottom-0 w-full h-full z-110" @click.stop="isOpen = false" />
  </v-popover>
</template>

<script lang="ts">
const contentSizes: { [key: string]: string } = { xs: "size-xs", sm: "size-sm" };
const fontSizes: { [key: string]: string } = { xs: "text-xs", sm: "text-md md:text-sm" };
const itemSizes: { [key: string]: string } = { xs: "py-6 px-4", sm: "py-8 px-15" };

import { Component, Vue, Prop, Watch } from "vue-property-decorator";

@Component({ name: "AppDropdownBasic" })
export default class AppDropdownBasic extends Vue {
  /* PROPS */
  @Prop({ required: true }) value!: any;
  @Prop({ required: true }) options!: any[];
  @Prop({ default: "All" }) allOptionsSelectedText!: string;
  @Prop({ default: "label" }) keyLabel!: string;
  @Prop({ default: "value" }) keyValue!: string;
  @Prop({ default: "" }) placeholder!: string;
  @Prop({ default: "" }) placeholderClasses!: string;
  @Prop({ default: "sm" }) itemSize: string;
  @Prop({ required: false }) disabledOptions!: Array<number | string>; // array of disabled values for options.
  @Prop({ default: "value" }) disabledKeyName!: string; // in case of custom key-value disabled option won't work - so you need to specify this prop.
  @Prop({ default: false, type: Boolean }) dark!: boolean;
  @Prop({ default: false, type: Boolean }) disabled!: boolean;

  /* DATA */
  isOpen: boolean = false;

  /* COMPUTED */
  get caption() {
    if (this.value === null) return this.placeholder || "Select options";

    if (this.value.length === this.options.length) {
      return this.allOptionsSelectedText;
    }

    return this.value.map((v: any) => v).join(", ");
  }

  get isDisabled() {
    return this.disabled && "opacity-30 pointer-events-none";
  }

  get isDropdownOpen() {
    return this.isOpen && "is-opened";
  }

  get isDarkClassess() {
    return this.dark ? "is-dark" : "is-light";
  }

  get itemSizeClasses() {
    return itemSizes[this.itemSize];
  }

  get fontSizeClasses() {
    return fontSizes[this.itemSize];
  }

  get contentSizeClasses() {
    return contentSizes[this.itemSize];
  }

  /* METHODS */
  selectItem(item: any) {
    this.isOpen = false;
    const input = this.calcValue(item);

    this.$emit("input", item);
    this.$emit("change", item);
  }

  calcValue(item: any) {
    const exist = this.value.find((val: any) => val[this.keyValue] === item[this.keyValue]);
    let toReturn = null;
    if (exist) {
      toReturn = this.value.filter((val: any) => !(val[this.keyValue] === exist[this.keyValue]));
    } else {
      toReturn = [...this.value, item];
    }

    return toReturn;
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/shared/_app-dropdown-basic";

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
