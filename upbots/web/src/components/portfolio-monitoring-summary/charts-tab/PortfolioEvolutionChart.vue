<template>
  <div class="flex flex-col w-full h-full" :class="!portfolioEvolutionData ? 'blured' : null">
    <!-- PORTFOLIO EVOLUTION -->
    <div ref="wrap" class="line-chart-wrap h-full w-full mb-20" :class="chartClasses">
      <!-- LINE CHART -->
      <template v-if="isMounted">
        <LineChart
          v-if="dataSets"
          class="evolution-line-chart__wrap relative"
          :style="wrapStyles"
          :chart-data="dataSets"
          :options="options"
        />

        <p v-else class="flex items-center justify-center text-iceberg w-full h-full">
          <span>No Data Available</span>
        </p>
      </template>
    </div>

    <router-link v-if="!portfolioEvolutionData" :to="'/keys'" class="balances__btn-wrap absolute top-1/2 left-1/2 z-100">
      <AppButton type="light-green" class="add-wallet-btn w-full">Add a wallet</AppButton>
    </router-link>

    <div v-if="dataSets" class="flex items-center justify-between flex-shrink-0 w-full h-40 px-20 pb-10">
      <AppItemsGroup
        v-model="portfolioSelectedQuantity"
        :items="quantityValues"
        class="portfolio-evolution__items-group h-40 text-sm"
        no-top-border
        no-bottom-border
        no-bottom-highlight
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { GroupItems } from "@/models/interfaces";
import moment from "moment";

const user = namespace("userModule");

import LineChart from "@/components/charts/LineChart.vue";

@Component({ name: "PortfolioEvolutionChart", components: { LineChart } })
export default class PortfolioEvolutionChart extends Vue {
  /* VUEX */
  @user.State selectedQuantity!: string;
  @user.Action fetchPortfolioEvolution!: any;
  @user.Mutation setSelectedQuantity!: any;

  /* PROPS */
  @Prop({ required: true }) portfolioEvolutionData: any;
  @Prop({ required: true }) activeCurrenciesNames: any[];
  @Prop({ default: "" }) chartClasses: string;
  @Prop({ required: true }) quantityValues: GroupItems[];
  @Prop({ required: true }) chartFakeData: any[];
  @Prop({ required: true }) chartFakeLabels: string[];
  @Prop({ required: true }) options: any;

  /* RERS */
  $refs!: {
    wrap: HTMLElement;
  };

  /* DATA */
  isMounted = false;

  /* COMPUTED */
  get dataSets() {
    if (this.portfolioEvolutionData) {
      return {
        datasets: this.portfolioEvolutionData.datasets,
        labels: this.portfolioEvolutionData.labels.map((el: any) => {
          return moment(el).format("MM-DD");
        }),
      };
    } else {
      return { datasets: this.chartFakeData, labels: this.chartFakeLabels };
    }
  }

  get wrapStyles() {
    return this.isMounted ? { height: `${this.$refs.wrap.offsetHeight}px` } : null;
  }

  get portfolioSelectedQuantity() {
    return this.selectedQuantity;
  }

  set portfolioSelectedQuantity(value) {
    this.setSelectedQuantity(value);
    // fetch evolution data with new DateRange
    this.fetchPortfolioEvolution();
  }

  /* HOOKS */
  mounted() {
    this.isMounted = true;
  }
}
</script>

<style lang="scss" scoped>
.portfolio-evolution {
  &__items-group {
    @apply w-auto;
  }
}

.line-chart-wrap {
  height: calc(100% - 60px);
}

.balances {
  &__btn-wrap {
    transform: translate(-50%);
  }
}

.blured {
  &:after {
    content: "";
    @apply absolute left-0 bottom-0 w-full h-full select-none cursor-not-allowed;
    background: rgba(27, 49, 58, 0.8);
  }
}
</style>
