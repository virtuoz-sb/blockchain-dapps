<template>
  <v-popover
    offset="8"
    trigger="manual"
    :auto-hide="false"
    :open="isOpen"
    :class="[isDropdownOpen, dropdownListStyle, isDarkClassess, isDotsClasses, previewClassess, isTruncate]"
    class="dropdown"
  >
    <!-- PREVIEW DOTS -->
    <div v-if="dots" class="dropdown__dots-wrap flex items-center cursor-pointer" @click.stop="isOpen = true">
      <i class="dropdown__dots icon-dots text-iceberg text-md" />
    </div>

    <!-- PREVIEW TITLE -->
    <template v-if="!dots">
      <div
        v-if="!!caption || placeholder"
        :class="[fontSizeClasses, !!placeholderClasses ? placeholderClasses : 'dropdown__preview-title']"
        class="truncate cursor-pointer"
        @click="isOpen = true"
      >
        {{ !!caption ? caption : placeholder }}
      </div>
    </template>

    <!-- PREVIEW DEFAULT -->
    <div v-if="!dots" :class="[isDisabled]" class="dropdown__preview flex items-center cursor-pointer" @click="isOpen = true">
      <!-- PREVIEW IMG -->
      <div v-if="value && value.img" class="dropdown__preview-img-wrap flex">
        <img :src="value && value.img" class="dropdown__preview-img w-12 max-w-12 h-12 ml-6" />
      </div>

      <!-- PREVIEW EXPAND -->
      <div v-if="!!caption || placeholder" class="dropdown__preview-expand-wrap flex ml-4">
        <i :class="[{ 'transform rotate-180': isOpen }]" class="dropdown__preview-expand icon-arrow-expand" />
      </div>
    </div>

    <!-- CONTENT -->
    <template slot="popover">
      <div
        v-if="isOpen"
        :class="[isDarkClassess, dropdownListStyle]"
        class="dropdown__content flex rounded-5 overflow-y-auto custom-scrollbar"
      >
        <!-- CONTENT WRAP -->
        <ul :class="contentSizeClasses" class="dropdown__content-list-wrap flex flex-col overflow-y-auto custom-scrollbar">
          <!-- ADD SCROLL-BAR -->
          <component :is="dropdownContentTag" :ops="dropdownContentTag === 'custom-scroll' && scrollData">
            <!-- CONTENT ITEM -->
            <li
              v-for="item in options"
              :key="item[keyValue]"
              :class="disabledOptions && disabledOptions.includes(item[disabledKeyName]) && 'opacity-30 cursor-not-allowed select-none'"
              class="flex flex-col flex-shrink-0 cursor-pointer"
            >
              <div
                class="dropdown__content-item flex items-center"
                :class="[itemSizeClasses, disabledOptions && disabledOptions.includes(item[disabledKeyName]) && 'pointer-events-none']"
                @click="selectItem(item)"
              >
                <!-- TEMPLATE IF STATE LIST -->
                <template v-if="list">
                  <div v-if="item && item.headerLabel" class="flex flex-col mr-4">
                    <span v-for="(item, index) in 3" :key="index" class="dropdown__list-icon w-7 h-px bg-grey-cl-920 mb-2 last:mb-0" />
                  </div>
                  <div v-else class="flex flex-col mr-4">
                    <span class="dropdown__list-icon w-7 h-px bg-grey-cl-920" />
                  </div>
                </template>

                <!-- CONTENT LABEL -->
                <span class="dropdown__content-item-title flex" :class="[fontSizeClasses, { 'mr-6': item && item.img }]">
                  {{ item[keyLabel] }}
                </span>

                <!-- CONTENT IMG -->
                <img v-if="item && item.img" class="w-14 max-w-14 ml-auto" :src="item.img" />
              </div>
            </li>
          </component>
        </ul>
      </div>
    </template>

    <!-- BACKDROP -->
    <div v-if="isOpen" class="fixed top-0 left-0 right-0 bottom-0 w-full h-full z-110" @click.stop="isOpen = false" />
  </v-popover>
</template>

<script lang="ts">
const contentSizes: { [key: string]: string } = { xs: "size-xs", sm: "size-sm" };
const fontSizes: { [key: string]: string } = { xs: "text-xs", sm: "text-base md:text-sm" };
const itemSizes: { [key: string]: string } = { xs: "py-6 px-4", sm: "py-10 px-20" };

import { Component, Vue, Prop, Watch } from "vue-property-decorator";

@Component({ name: "AppDropdownBasic" })
export default class AppDropdownBasic extends Vue {
  /* PROPS */
  @Prop({ required: true }) value!: any;
  @Prop({ required: true }) options!: any[];
  @Prop({ default: "label" }) keyLabel!: string;
  @Prop({ default: "value" }) keyValue!: string;
  @Prop({ default: "" }) placeholder!: string;
  @Prop({ default: "" }) placeholderClasses!: string;
  @Prop({ default: "sm" }) itemSize: string;
  @Prop({ required: false }) disabledOptions!: Array<number | string>; // array of disabled values for options.
  @Prop({ default: "value" }) disabledKeyName!: string; // in case of custom key-value disabled option won't work - so you need to specify this prop.
  @Prop({ default: false, type: Boolean }) truncate!: boolean;
  @Prop({ default: false, type: Boolean }) dots!: boolean;
  @Prop({ default: false, type: Boolean }) dark!: boolean;
  @Prop({ default: false, type: Boolean }) list!: boolean;
  @Prop({ default: false, type: Boolean }) disabled!: boolean;
  @Prop({ default: "ul", type: String }) dropdownContentTag: string;

  /* DATA */
  isOpen: boolean = false;

  previewClassess: string = "";

  /* COMPUTED */
  get caption() {
    if (this.value === null) return this.placeholder || "Select options";

    return this.value[this.keyLabel];
  }

  get dropdownListStyle() {
    if (!this.dots && this.list) {
      this.previewClassess = "py-3 px-4";
      return "dropdown-list";
    } else {
      return null;
    }
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

  get isDotsClasses() {
    return this.dots ? "is-dots" : null;
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

  get isTruncate() {
    return this.truncate && "is-truncate overflow-hidden block";
  }

  // FOR CUSTOM SCROLLBAR
  get scrollData() {
    return {
      rail: {
        gutterOfSide: this.$breakpoint.smAndDown ? "0px" : "5px",
        gutterOfEnds: "2px",
      },

      bar: {
        background: "#378C9C",
        keepShow: true,
        size: "6px",
        hight: "100px",
      },

      scrollPanel: {
        easing: "easeInQuad",
        speed: 100,
      },

      vuescroll: {
        wheelScrollDuration: 1500,
        wheelDirectionReverse: false,
      },
    };
  }

  /* HOOKS */
  created() {
    if (typeof this.value === "string") {
      throw new Error("binding value or v-model of [AppDropdownBasic.vue] must be implemented by ItemGroup model");
    }
  }

  /* METHODS */
  selectItem(item: any) {
    this.isOpen = false;

    this.$emit("input", item);
    this.$emit("change", item);
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/shared/_app-dropdown-basic";

// style for truncate preview title
::v-deep.dropdown {
  > div {
    display: flex !important;
    @apply items-center;
  }
}
</style>
