import readEnv from "../../utilities/readenv.util";

export default () => ({
  auth: {
    clientId: readEnv("ARKANE_CLIENT_ID"),
    secret: readEnv("ARKANE_CLIENT_SECRET"),
    host: readEnv("ARKANE_LOGIN_HOST"),
    grantType: "client_credentials",
  },
  api: {
    baseURL: readEnv("ARKANE_API_HOST"),
  },
  cacheKey: "arkane-capsule-cache",
  ubxt: {
    // ethereum main chain
    eth: readEnv("UBXT_TOKEN"),
    // binance smart chain (side-chain)
    bsc: readEnv("BUBXT_TOKEN"),
    // token peg for BUBXT
    peg: readEnv("BUBXT_PEG"),
  },
  gasReserve: {
    pincode: readEnv("ARKANE_GAS_RESERVE_PIN"),
    chain: {
      BSC: {
        walletId: readEnv("ARKANE_GAS_RESERVE_BSC_ID"),
        // fixed gas price (minimal for BSC)
        gasPrice: "23000000000",
        // transaction confirmation time in seconds
        txEta: 3,
        // prevents frequent refills
        multiplier: 3,
      },
      ETHEREUM: {
        // backup gas price (more than avg)
        gasPrice: "80000000000",
        walletId: readEnv("ARKANE_GAS_RESERVE_ETH_ID"),
        multiplier: 1.2,
      },
    },
  },
});
