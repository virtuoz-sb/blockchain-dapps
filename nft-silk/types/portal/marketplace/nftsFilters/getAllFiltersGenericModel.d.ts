interface IGetAllFiltersGenericModel {
  count: number;
  traits: IGetAllFiltersGenericTraits[];
}

interface IGetAllFiltersGenericTraits {
  traitType: string;
  name: string;
  filterType: string;
  values: IGetAllFiltersGenericTraitsValue[];
}

interface IGetAllFiltersGenericTraitsValue {
  value: string;
  count: number;
  rarity: number;
}
