interface IFarmStakedHorseModel {
  horsetokenID: number;
  farmTokenId: number;
  expireTermDate: Date;
  totalNumberOfStalls: number;
  numberOfStallsTaken: number;
  numberOfStallsOpen: number;
  horseName: string;
  farmName: string;
  auctionPrice: number;
  damName: string;
}

interface IFarmStakedHorseModelResponse {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  indexFrom: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  items: IFarmStakedHorseModel[];
}
