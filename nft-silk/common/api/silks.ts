import api from '@common/api';

export const getAvatarDetail = async tokenId => {
  try {
    const { data: result } = await api.get<IAssetsModel>(
      `${process.env.NEXT_PUBLIC_AWS_API_URL}/collection/genesis/${tokenId}/assets`
    );

    if (result) {
      return result;
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
};

export const getAvatarDetail2 = async (tokenIds: any[]): Promise<ISilksGetAvatarModel> => {
  try {
    let pageSize = tokenIds.length;
    let queryString = `?pageSize=${pageSize}&search[stringTraits][0][name]=token_id`;
    let valueCount = 0;

    if (tokenIds && tokenIds.length > 0) {
      tokenIds.forEach(tokenId => {
        queryString = queryString.concat(`&search[stringTraits][0][values][${valueCount}]=${tokenId}`);
        valueCount++;
      });
    } else {
      return undefined;
    }

    const { data: result } = await api.get<ISilksGetAvatarModel>(
      `${process.env.NEXT_PUBLIC_AWS_API_URL}/collection/genesis${queryString}`
    );

    if (result) {
      return result;
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
};
