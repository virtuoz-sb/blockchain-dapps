import { isOfferDisabled } from '@common/contractStateCfg';

//tab sets specific to NFT types

const base = ['properties', 'offers'];

const farm = ['properties', 'stables', 'coordinates', 'offers', 'requests'];

const syndicate = ['properties', 'offers', 'syndicate']; //listing HorsePartnership

const listing = ['properties', 'offers', 'syndicate', 'listing']; //listing HorsePartnership

const tabSets = {
  Land: base,
  Avatar: base,
  Horse: base,
  Farm: farm,
  HorseGovernance: syndicate,
  HorsePartnership: listing,
};
//need to set the right order
export function getTabsByType(type): NFTTabCFg[] {
  const tabs = tabSets[type] || base;
  //return Object.values(tabsCfg).filter(t => tabs.includes(t.id));
  let ret = [];
  tabs.forEach(t => tabsCfg[t].isEnabled && ret.push(tabsCfg[t]));
  return ret;
}

export type NFTType = IAvatar | IHorse | ILand | IFarm;

export type NFTTabCFg = {
  id: string;
  tId: string;
  type: string;
  isEnablled: boolean;
  depends?: string | [];
  hasCount?: boolean;
};

export const tabsCfg = {
  properties: {
    id: 'properties',
    tId: 'details.properties',
    type: 'general',
    isEnabled: true,
  },
  offers: {
    id: 'offers',
    tId: 'details.offers',
    type: 'general',
    isEnabled: !isOfferDisabled, //DISABLED GLOBALLY
    hasCount: true,
  },
  stables: {
    id: 'stables',
    tId: 'details.stable',
    type: 'Farm',
    depends: 'stakedHorses',
    isEnabled: true,
  },
  coordinates: {
    id: 'coordinates',
    tId: 'details.coordinates.tabTitle',
    type: 'Farm',
    isEnabled: true,
    hasCount: true,
  },

  requests: {
    id: 'requests',
    tId: 'details.stableRequests',
    type: 'Farm',
    depends: 'stableRequests',
    isEnabled: true,
    hasCount: true,
  },

  syndicate: {
    id: 'syndicate',
    tId: 'details.syndicate',
    type: 'HorseGovernance', //ContractTypeEnum.HorseGovernance || ContractTypeEnum.HorsePartnership
    isEnabled: true,
  },
  listing: {
    id: 'listing',
    tId: 'details.syndicateListing',
    type: 'HorsePartnership', //ContractTypeEnum.HorsePartnership
    isEnabled: true,
  },
};
