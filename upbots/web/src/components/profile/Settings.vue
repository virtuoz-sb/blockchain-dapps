<template>
  <div class="flex items-center w-full py-15 px-10">
    <div class="flex items-center mr-5">
      <span class="text-sm leading-md text-iceberg">Dashboard Currency:</span>
    </div>
    <AppDropdownBasic v-model="selectedCurrency" :options="availableCurrencyList" size="sm" dark />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { availableFilterCurrency } from "@/models/default-models";

const user = namespace("userModule");

@Component({ name: "Settings" })
export default class Settings extends Vue {
  /* VUEX */
  @user.State favoriteCurrency: any;
  @user.Mutation setFavoriteCurrency: any;

  /* DATA */
  availableCurrencyList = availableFilterCurrency();

  /* COMPUTED */
  get selectedCurrency() {
    return this.favoriteCurrency;
  }

  set selectedCurrency(value) {
    this.setFavoriteCurrency(value);
  }
}
</script>
