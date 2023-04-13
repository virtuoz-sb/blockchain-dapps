import api from '@common/api';

export const getFarmById = async farmId => {
  const { data: farmModel } = await api.get<IFarmNftsModel>(`/api/farmnfts/${farmId}`);

  console.log('getFarmById response', farmModel);

  if (farmModel) {
    return farmModel;
  } else {
    return undefined;
  }
};
