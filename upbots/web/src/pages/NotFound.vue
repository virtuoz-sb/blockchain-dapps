<template>
  <GeneralLayout title="Not Found" />
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import GeneralLayout from "@/views/GeneralLayout.vue";

@Component({ name: "NotFound", components: { GeneralLayout } })
export default class NotFound extends Vue {}
</script>
