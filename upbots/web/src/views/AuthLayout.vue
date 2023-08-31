<template>
  <div
    class="w-full overflow-y-auto custom-scrollbar"
    :class="!$breakpoint.smAndDown ? 'bg-kuroi-black-opacity shadow-150' : 'bg-kuroi-black md:bg-transparent'"
  >
    <div class="auth__container w-full h-full flex flex-col mx-auto pt-70 md:pt-25 pb-25 px-24 overflow-y-auto custom-scrollbar">
      <div class="md:flex flex-col flex-grow justify-center md:h-auto">
        <h2 v-if="title" class="text-30 md:text-xxl2 text-white font-medium text-center mb-8">{{ title }}</h2>
        <p v-if="subtitle" class="text-sm text-white text-center mb-45 md:mb-34">{{ subtitle }}</p>
        <div class="md:bg-abyssal-anchorfish-blue md:p-60 rounded-10">
          <!-- FORM SLOT -->
          <slot />
        </div>
      </div>

      <!-- FOOTER -->
      <div class="flex items-center justify-center flex-shrink-0 flex-col md:flex-row text-white text-center mt-25">
        <div class="flex items-center">
          <span class="flex mr-2">&copy;</span>
          <span class="flex pr-0 md:pr-5">{{ new Date().getFullYear() }} Copyright UBX Software LLC</span>
        </div>
        <!-- <ul class="flex items-center">
          <router-link
            v-for="item in links"
            :key="item.id"
            :to="item.route"
            tag="li"
            exact
            class="auth__link-item flex items-center justify-start relative cursor-pointer first:pl-0 md:first:pl-8 pl-8 ml-8 first:ml-0"
          >
            <span class="border-b text-white">
              {{ item.label }}
            </span>
          </router-link>
        </ul> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "AuthLayout" })
export default class AuthLayout extends Vue {
  /* PROPS */
  @Prop({ default: "" }) title!: String;
  @Prop({ default: "" }) subtitle!: String;

  /* DATA */
  // links: any[] = [
  //   { id: 1, route: "/", label: "About" },
  //   { id: 2, route: "/", label: "Terms" },
  //   { id: 3, route: "/", label: "Licenses" },
  // ];
}
</script>

<style lang="scss" scoped>
.auth {
  &__container {
    max-width: 580px;
  }
  &__link-item {
    &:before {
      content: "";
      @apply absolute left-0 bg-white w-2 h-2 rounded-full;
    }
  }
  @media (max-width: 767px) {
    &__link-item {
      &:first-child {
        &:before {
          content: none;
        }
      }
    }
  }
}
</style>
