import { Icon } from '@components/icons';

export const connectors = [
  {
    title: 'Metamask',
    icon: <Icon name="metamask" />,
    connectorId: 'metamask',
    priority: 1,
  },
  {
    title: 'WalletConnect',
    icon: <Icon name="wallet" />,
    connectorId: 'walletconnect',
    priority: 2,
  },
  {
    title: 'Venly',
    icon: <Icon name="venly" />,
    connectorId: 'venly',
    priority: 3,
  },
  // {
  //   title: "Trust Wallet",
  //   icon: TrustWallet,
  //   connectorId: "injected",
  //   priority: 3,
  // },
  // {
  //   title: "MathWallet",
  //   icon: MathWallet,
  //   connectorId: "injected",
  //   priority: 999,
  // },
  // {
  //   title: "TokenPocket",
  //   icon: TokenPocket,
  //   connectorId: "injected",
  //   priority: 999,
  // },
  // {
  //   title: "SafePal",
  //   icon: SafePal,
  //   connectorId: "injected",
  //   priority: 999,
  // },
  // {
  //   title: "Coin98",
  //   icon: Coin98,
  //   connectorId: "injected",
  //   priority: 999,
  // },
];
