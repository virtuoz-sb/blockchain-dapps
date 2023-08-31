<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({ name: "CryptoCoinChecker" })
export default class CryptoCoinChecker extends Vue {
  /* PROPS */
  @Prop({ required: true }) data: any;

  /* DATA */
  localCoins: string[] = [
    "UBXT",
    "AAVE",
    "SOL",
    "YFI",
    "BUILD",
    "ESD",
    "SNX",
    "WETH",
    "FARM",
    "GRT",
    "NU",
    "USDN",
    "TBTC",
    "QUSD",
    "PERL",
    "KUN",
    "cUSDC",
    "cDAI",
    "BAL",
    "3Crc",
    "AVAX",
    "BUSD",
    "DAI",
  ];

  cryptoCoinsData: { [key: string]: string } = {
    UBXT: "ubxt-logo",
    AAVE: "aave-logo",
    SOL: "solana-logo",
    YFI: "yfi-logo",
    BUILD: "build-logo",
    ESD: "esd-logo",
    SNX: "snx-logo",
    WETH: "weth-logo",
    FARM: "farm-logo",
    GRT: "grt-logo",
    NU: "nu-logo",
    USDN: "usdn-logo",
    TBTC: "tbtc-logo",
    QUSD: "qusd-logo",
    PERL: "perl-logo",
    KUN: "kun-logo",
    cUSDC: "cusdc-logo",
    cDAI: "cdai-logo",
    BAL: "bal-logo",
    "3Crc": "3crc-logo",
    AVAX: "avax-logo",
    BUSD: "busd-logo",
    DAI: "dai-logo",
  };

  /* COMPUTED */
  get isExistCoin() {
    return this.localCoins.includes(this.data);
  }

  get srcCoin() {
    return this.cryptoCoinsData[this.data];
  }

  /* RENDER */
  render() {
    return this.$scopedSlots.default({
      coinName: this.data,
      isExist: this.isExistCoin,
      srcCoin: this.srcCoin,
    });
  }
}
</script>
