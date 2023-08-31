<template>
  <div class="flex items-center mb-7 last:mb-0 px-20">
    <div class="table__col-1 flex items-center pr-10">
      <div class="relative text-grey-cl-400 cursor-pointer mr-3" @click="addFavouritePair(data)">
        <div aria-hidden="true" class="icon-star text-xs" />
        <div
          :class="data.isFavourite ? 'w-full' : 'w-0'"
          class="front-stars is-single absolute top-0 flex gradient-1 text-xs overflow-hidden"
        >
          <span aria-hidden="true" class="icon-star" />
        </div>
      </div>

      <div class="flex text-xs leading-xs ml-7 cursor-pointer" @click="$emit('select')">
        <span class="text-white">{{ data && data.baseCurrency }}</span>
        <span class="text-grey-cl-920">{{ data && "/" }}</span>
        <span class="text-grey-cl-920">{{ data && data.quoteCurrency }}</span>
      </div>
    </div>

    <div class="table__col-2 flex pr-8">
      <span class="text-xs leading-xs text-white">{{ lastPricedFormatted }}</span>
    </div>

    <div class="table__col-3 flex">
      <AppPercentageSpan class="text-xs leading-xs" :data="change" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
const userSetting = namespace("userSettingsModule");

@Component({ name: "PairItem" })
export default class PairItem extends Vue {
  /* VUEX */
  @userSetting.State favourite: string;
  @userSetting.Action addFavouritePair: any;

  /* PROPS */
  @Prop({ required: true }) exchange: string;
  @Prop({ required: true }) data: any;
  @Prop({ required: true }) lastPrice: number;
  @Prop({ required: true }) change: any;

  /* COMPUTED */
  get lastPricedFormatted() {
    if (!this.lastPrice) {
      return "N/A";
    } else if (parseFloat(this.lastPrice.toFixed(2)) !== 0) {
      return this.lastPrice.toFixed(2);
    } else {
      let i = 3;
      while (parseFloat(this.lastPrice.toFixed(i)) === 0) i++;
      return this.lastPrice.toFixed(i);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/components/shared/_star.scss";

.table {
  &__col-1 {
    width: 50%;
  }
  &__col-2 {
    width: 27%;
  }
  &__col-3 {
    width: 23%;
  }
}
</style>
