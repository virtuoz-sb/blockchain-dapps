interface ISilksGetAvatarFilterTraitModel {
  count: number;
  value: string;
  rarity: number;
}

interface ISilksGetAvatarFilterTraitsModel {
  name: string;
  traitType: string;
  values: ISilksGetAvatarFilterTraitModel[];
}

interface ISilksGetAvatarFilterModel {
  count: number;
  traits: ISilksGetAvatarFilterTraitsModel[];
}
