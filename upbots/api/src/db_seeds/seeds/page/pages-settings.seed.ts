import PageSettings from "../../../settings/models/page/page-settings";

const settingsPagesSeeds: PageSettings[] = [
  {
    path: "/",
    name: "home",
    comingSoon: false,
  },
  {
    path: "/my-wallet",
    name: "portfolio",
    comingSoon: false,
  },
  {
    path: "/my-performance",
    name: "my-performance",
    comingSoon: true,
  },
  {
    path: "/new-trade",
    name: "manual-trade",
    comingSoon: false,
  },
  {
    path: "/my-bots",
    name: "my-bots",
    comingSoon: false,
  },
  {
    path: "/create-new-bot",
    name: "create-new-bot",
    comingSoon: false,
  },
  {
    path: "/bot-detail",
    name: "bot-detail",
    comingSoon: false,
  },
  {
    path: "/algo-bots",
    name: "algo-bots",
    comingSoon: false,
  },
  {
    path: "/algo-bot-detailed",
    name: "algo-bot-detailed",
    comingSoon: false,
  },

  {
    path: "/signal-providers",
    name: "signal-providers",
    comingSoon: true,
  },
  {
    path: "/learning",
    name: "learning",
    comingSoon: true,
  },
  {
    path: "/learning-course",
    name: "learning-course",
    comingSoon: true,
  },
  {
    path: "/copy-trading",
    name: "copy-trading",
    comingSoon: true,
  },
  {
    path: "/swap",
    name: "swap",
    comingSoon: false,
  },
  {
    path: "/staking",
    name: "staking",
    comingSoon: true,
  },
  {
    path: "/profile",
    name: "profile",
    comingSoon: false,
  },
  {
    path: "/keys",
    name: "keys",
    comingSoon: false,
  },
  {
    path: "/bot-performance",
    name: "bot-performance",
    comingSoon: true,
  },
  {
    path: "/ubxt-wallet",
    name: "ubxt-wallet",
    comingSoon: true,
  },
];

export default settingsPagesSeeds;
