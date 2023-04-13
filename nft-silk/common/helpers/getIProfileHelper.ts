export const returnCurrentNftOwnerProfile = async (
  userProfile: IProfile,
  currentNftOwner: string
): Promise<IProfile> => {
  if (userProfile && userProfile.walletAddress.toLowerCase() == currentNftOwner.toLowerCase()) {
    return userProfile;
  } else {
    let ownerNotRegistered: IProfile = {
      walletAddress: currentNftOwner,
      username: '',
      userRegistrationId: 0,
      email: '',
      location: '',
      about: '',
      isEmailVerified: false,
      notifications: [],
    };
    return ownerNotRegistered;
  }
};
