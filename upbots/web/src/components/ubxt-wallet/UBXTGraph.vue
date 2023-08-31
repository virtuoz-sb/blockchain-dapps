<template>
  <div class="ubxt-widget md:h-full w-full overflow-hidden" />
</template>

<script lang="ts">
// see https://fr.tradingview.com/widget/mini-chart/
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

@Component({ name: "SpeedGauge" })
export default class SpeedGauge extends Vue {
  /* PROPS */
  @Prop({ default: "FTX:UBXTUSD" }) symbol: string;

  /* COMPUTED */
  get correctSymbol() {
    return this.symbol ? this.symbol.split("/").join("") : "";
  }

  get graphSettings() {
    return {
      symbol: this.correctSymbol,
      width: "100%",
      height: "100%",
      locale: "fr",
      dateRange: "1M",
      colorTheme: "dark",
      trendLineColor: "rgba(111, 168, 220, 1)",
      underLineColor: "rgba(55, 166, 239, 0.15)",
      isTransparent: true,
      autosize: false,
      largeChartUrl: "",
    };
  }

  /* WATCHERS */
  @Watch("symbol")
  handler() {
    this.createGraph();
  }

  /* HOOKS */
  mounted() {
    this.createGraph();
  }

  /* METHODS */
  createGraph() {
    let tradingScript = document.createElement("script");
    tradingScript.async = true;
    tradingScript.type = "text/javascript";
    tradingScript.setAttribute("class", "trade-graphic");
    tradingScript.setAttribute("src", "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js");
    let settingsString = JSON.stringify(this.graphSettings, null, 2);
    tradingScript.text = settingsString;
    let widgetEl = document.querySelector(".ubxt-widget");
    if (widgetEl.children.length) {
      let oldGraph = document.querySelector(".ubxt-widget").firstChild;
      widgetEl.removeChild(oldGraph);
    }
    widgetEl.appendChild(tradingScript);
  }
}
</script>

<style lang="scss" scoped>
.ubxt-widget {
  @media (max-width: 767px) {
    min-height: 400px;
  }
}
</style>
