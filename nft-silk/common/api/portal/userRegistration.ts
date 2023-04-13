import api from '@common/api';

export const getUserRegistrationByWallet = async walletAddress => {
  try {
    const { data: userRegistration } = await api.get<IProfile>(`/api/userRegistration/byWallet/${walletAddress}`);
    if (userRegistration) {
      return userRegistration;
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
};

export const updateDefaultProfileAvatar = async (userRegistrationId, avatarTokenId) => {
  try {
    const payload: IUpdateDefaultProfileAvatarModel = {
      userRegistrationId: userRegistrationId,
      avatarTokenId: avatarTokenId,
    };
    const { data: userRegistration } = await api.put<IProfile>(
      `/api/userRegistration/UpdateDefaultProfileAvatar`,
      payload
    );
    if (userRegistration) {
      return userRegistration;
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
};
