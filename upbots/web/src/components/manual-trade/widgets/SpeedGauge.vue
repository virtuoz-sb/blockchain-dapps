<template>
  <div class="md:h-full w-full">
    <div
      class="tech-widget speed-guage-widget flex-grow md:h-full w-full md:overflow-hidden px-10"
      :class="!$breakpoint.smAndDown && 'is-desktop'"
    />
  </div>
</template>

<script lang="ts">
// see: https://www.tradingview.com/widget/technical-analysis/
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

@Component({ name: "SpeedGauge" })
export default class SpeedGauge extends Vue {
  /* PROPS */
  @Prop({ default: "BINANCE:BTCUSDT" }) symbol: string;

  /* COMPUTED */
  get correctSymbol() {
    return this.symbol ? this.symbol.split("/").join("") : "";
  }

  get graphSettings() {
    return {
      symbol: this.correctSymbol,
      interval: "1h",
      width: "100%",
      colorTheme: "dark",
      isTransparent: true,
      height: "100%",
      showIntervalTabs: false,
      locale: "en",
      largeChartUrl: "http:///localhost:8000/largechart",
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
    tradingScript.setAttribute("src", "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js");
    let settingsString = JSON.stringify(this.graphSettings, null, 2);
    tradingScript.text = settingsString;
    let widgetEl = document.querySelector(".speed-guage-widget");
    if (widgetEl.children.length) {
      let oldGraph = document.querySelector(".speed-guage-widget").firstChild;
      widgetEl.removeChild(oldGraph);
    }
    widgetEl.appendChild(tradingScript);
  }
}
</script>

<style lang="scss" scoped>
.speed-guage-widget {
  &.is-desktop {
    height: 600px;

    @media (min-width: 1600px) {
      margin-top: -90px;
    }
    @media (min-width: 1890px) {
      margin-top: -98px;
    }
    @media (min-width: 2044px) {
      margin-top: -77px;
    }
    @media (min-width: 2140px) {
      margin-top: -55px;
    }
    @media (min-width: 2550px) {
      margin-top: -70px;
    }
    @media (max-width: 1599px) {
      margin-top: -110px;
    }
    @media (max-width: 1400px) {
      margin-top: -77px;
    }
    @media (max-width: 1303px) {
      margin-top: -97px;
    }
    @media (max-width: 1279px) {
      margin-top: -75px;
    }
    @media (max-width: 1242px) {
      margin-top: -100px;
    }
    @media (max-width: 1080px) {
      margin-top: -80px;
    }
    @media (max-width: 895px) {
      margin-top: -100px;
    }
    @media (max-width: 800px) {
      margin-top: -96px;
    }
  }
}
</style>
