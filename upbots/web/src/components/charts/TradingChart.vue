<template>
  <div id="tradingview_acd56" class="chart-widget" />
</template>

<script lang="ts">
// see https://www.tradingview.com/widget/advanced-chart/
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

@Component({ name: "TradingChart" })
export default class TradingChart extends Vue {
  /* PROPS */
  @Prop({ type: Boolean, default: false }) clean: boolean;
  @Prop({ default: "BITMEX:XBTUSD" }) symbol: string; // "BINANCE:BTCUSDT"

  /* DATA */
  chart: null;

  /* WATCHERS */
  @Watch("symbol")
  handler(newVal: string, oldVal: string) {
    this.chart = this.createGraph(newVal);
  }

  /* HOOKS */
  mounted() {
    let tvscript = document.createElement("script");
    tvscript.async = true;
    tvscript.onload = (event) => {
      this.chart = this.createGraph(this.symbol);
    };

    tvscript.setAttribute("src", "https://s3.tradingview.com/tv.js");
    document.head.appendChild(tvscript);
  }

  /* METHODS */
  createGraph(symbol: string) {
    if (!(window as any).TradingView) return;

    if (this.clean) {
      const simpleSettings = new (window as any).TradingView.widget({
        autosize: true,
        symbol: symbol,
        timezone: "Etc/UTC",
        theme: "Dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#C4C4C4",
        enable_publishing: false,
        withdateranges: true, //bottom toolbar
        // range: "4h",
        interval: "120",
        //   "interval": "D",
        // hide_top_toolbar: true,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        // watchlist: ["BITTREX:BTCUSD", "BINANCE:XTZBTC"],
        details: false,
        hotlist: false,
        calendar: false,
        // news: ["stocktwits", "headlines"],
        // studies: ["BB@tv-basicstudies"],
        container_id: "tradingview_acd56", // the div where the graph will be defined
      });
      return simpleSettings;
    }

    const graphSettings = new (window as any).TradingView.widget({
      autosize: true,
      symbol: symbol,
      timezone: "Etc/UTC",
      theme: "Dark",
      style: "1",
      locale: "en",
      toolbar_bg: "#C4C4C4",
      enable_publishing: false,
      withdateranges: true, //bottom toolbar
      // range: "4h",
      interval: "120",
      //   "interval": "D",
      // hide_top_toolbar: true,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      // watchlist: ["BITTREX:BTCUSD", "BINANCE:XTZBTC"],
      details: false,
      hotlist: false,
      calendar: false,
      // news: ["stocktwits", "headlines"],
      // studies: ["BB@tv-basicstudies"],
      container_id: "tradingview_acd56", // the div where the graph will be defined
    });
    return graphSettings;
  }
}
</script>
