<template>
  <router-link v-bind="$attrs" class="link cursor-pointer">
    <span v-if="icon" :class="[icon, linkIconClass]" class="link__icon text-blue-cl-100 text-md mr-10" />
    <!-- SLOT -->
    <slot />
  </router-link>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component({ name: "AppLink" })
export default class AppLink extends Vue {
  /* PROPS */
  @Prop({ default: "" }) icon?: string;
  @Prop({ default: "" }) linkIconClass!: string;
}
</script>
