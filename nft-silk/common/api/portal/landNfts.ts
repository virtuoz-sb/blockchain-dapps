import api from '@common/api';

export const getLandById = async landId => {
  const { data: landModel } = await api.get<ILandResponseModel>(`/api/landnfts/land/${landId}`);

  console.log('getLandById response', landModel);

  if (landModel) {
    return landModel;
  } else {
    return undefined;
  }
};
