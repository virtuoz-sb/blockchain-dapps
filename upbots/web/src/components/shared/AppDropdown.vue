<template>
  <v-popover offset="8" trigger="manual" :open="isOpen" :auto-hide="false">
    <!-- DROPDOWN TITLE (DOTS) -->
    <div v-if="dots" class="flex items-center cursor-pointer" @click.stop="isOpen = true">
      <i class="icon-dots text-white text-md" />
    </div>

    <!-- DROPDOWN TITLE (TEXT || ICON) -->
    <div v-else class="flex items-center cursor-pointer" @click="isOpen = true">
      <span :class="placeholderClass">{{ !!caption ? caption : placeholder }}</span>
      <img v-if="icon" :src="value && value.img" class="max-w-14 ml-6" />
      <span class="dropdown__expand icon-arrow-expand text-grey-cl-920 ml-6" :class="{ 'transform rotate-180': isOpen }" />
    </div>

    <!-- DROPDOWN CONTENT -->
    <template slot="popover">
      <div v-if="isOpen" class="dropdown__content text-white bg-dark-cl-300 shadow-20 rounded-5 overflow-y-auto custom-scrollbar md:top-20">
        <ul class="flex flex-col max-h-90 my-7 overflow-y-auto custom-scrollbar">
          <li
            v-for="item in options"
            :key="item[keyValue]"
            class="dropdown__item flex items-center text-grey-cl-920 hover:text-white whitespace-no-wrap cursor-pointer"
            :class="disabledOptions && disabledOptions.includes(item.exchange) && 'opacity-30 cursor-not-allowed select-none'"
          >
            <div
              class="flex items-center w-full py-6 px-20"
              :class="disabledOptions && disabledOptions.includes(item.exchange) && 'pointer-events-none'"
              @click="selectItem(item)"
            >
              <div
                v-if="multiple"
                class="check-icon__wrap flex items-center justify-center flex-shrink-0 w-18 h-18 border border-solid border-grey-cl-400 rounded-full mr-7 cursor-pointer"
                :class="{ 'is-active': value.includes(item.name) }"
              >
                <span v-if="value.includes(item.name)" class="icon-check text-white text-xxs" />
              </div>
              <div class="flex items-center w-full h-full">
                <span class="text-sm" :class="{ 'mr-6': icon }">{{ item[keyLabel] }}</span>
                <img v-if="icon" class="w-14 ml-auto" :src="item.img" />
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
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { GroupItems } from "@/models/interfaces";
import { AnySrvRecord } from "dns";

@Component({ name: "AppDropdown" })
export default class AppDropdown extends Vue {
  /* PROPS */
  @Prop({ required: true }) value!: GroupItems[] | GroupItems | any;
  @Prop({ required: true }) options!: GroupItems[];
  @Prop({ required: false }) disabledOptions!: any[];
  @Prop({ default: false, type: Boolean }) multiple!: boolean;
  @Prop({ default: "" }) placeholder!: string;
  @Prop({ default: "text-white" }) placeholderClass!: string;
  @Prop({ default: "label" }) keyLabel!: string;
  @Prop({ default: "value" }) keyValue!: string;
  @Prop({ default: false, type: Boolean }) dots!: boolean;
  @Prop({ default: false, type: Boolean }) icon!: boolean;

  /* DATA */
  isOpen: boolean = false;

  /* COMPUTED */
  get caption() {
    if (this.value === null) return this.placeholder || "Select options";

    return this.multiple ? this.value.map((v: any) => v).join(", ") : this.value[this.keyLabel];
  }

  /* METHODS */
  selectItem(item: AnySrvRecord) {
    this.isOpen = false;
    const input = this.multiple ? this.calcValue(item) : item;

    this.$emit("input", input);
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

<style lang="scss">
.v-popover {
  @apply flex;
}

.tooltip {
  @apply z-120;
}

.dropdown {
  &__item {
    &:hover {
      @apply bg-grey-cl-400;
      @media (max-width: 767px) {
        background: rgba(71, 76, 87, 0.2);
      }
    }
  }
  &__expand {
    font-size: 6px;
    transition: all 0.3s linear;
  }
}
</style>
