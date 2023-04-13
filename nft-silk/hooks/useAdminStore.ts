import create from 'zustand';
import createVanilla from 'zustand/vanilla';
import { get as lGet } from 'lodash-es';
import { Auth } from 'aws-amplify';

export function getAuthenticatedUser() {
  return Auth.currentAuthenticatedUser().then(user => user);
}

export function getTokens() {
  return Auth.currentSession().then(session => session);
}

export function signOutUser() {
  return Auth.signOut();
}

interface IAdminState {
  isAdminActive: boolean;
  setAdminActive: Function;
  checkAuthenticatedUser: Function;
  adminProfile: IAdminUser;
  setAdminProfile: Function;
  adminAccessToken?: string;
  setAdminAccessToken: Function;
  unAuthenticate: Function;
  logoutUser: Function;
}

type AdminCheckResult = Promise<
  | {
      success: boolean;
      authUser: any;
    }
  | {
      success: boolean;
      authUser?: undefined;
    }
  | {
      success: boolean;
    }
>;

type SignOutResult = Promise<
  | {
      success: boolean;
      message: string;
      error?: undefined;
    }
  | {
      success: boolean;
      message: string;
      error: any;
    }
>;

const useAdminStore = createVanilla<IAdminState>((set, get) => ({
  isAdminActive: get()?.isAdminActive || false,
  setAdminActive: isAdminActive => set({ isAdminActive }),
  adminProfile: get()?.adminProfile || null,
  setAdminProfile: adminProfile => set({ adminProfile }),
  adminAccessToken: get()?.adminAccessToken || null,
  setAdminAccessToken: adminAccessToken => set({ adminAccessToken }),
  unAuthenticate: () => {
    set({ isAdminActive: false });
    set({ adminAccessToken: null });
    set({ adminProfile: null });
  },
  logoutUser: async (): SignOutResult => {
    try {
      await signOutUser();
      get().unAuthenticate();
      return { success: true, message: 'LOGOUT SUCCESS' };
    } catch (error) {
      //get().unAuthenticate();
      return {
        success: false,
        message: 'LOGOUT FAIL',
        error: error,
      };
    }
  },
  checkAuthenticatedUser: async (): AdminCheckResult => {
    try {
      const authUser = await getAuthenticatedUser();
      if (authUser) {
        const { attributes, username, signInUserSession } = authUser;
        //silks-support | silks-admin
        const groups = lGet(signInUserSession, 'accessToken.payload.cognito:groups', []);
        //getExpiration, getJwtToken(), getRefreshToken, refreshSession
        const accessToken = signInUserSession.getAccessToken();
        //console.log('User', authUser, attributes, groups, accessToken);
        set({ adminProfile: { username, attributes, groups } });
        set({ adminAccessToken: accessToken?.getJwtToken() });
        set({ isAdminActive: true });
        return { success: true, authUser };
      } else {
        get().unAuthenticate();
        return { success: false };
      }
    } catch (error) {
      console.log('NO USER', error);
      get().unAuthenticate();
      return { success: false };
    }
  },
}));
//group
//'silks-support' | 'silks-admin'
//selector const isManage = useAdminStore(state => state.isAdminActive && state.adminProfile.groups.includes('silks-admin'));

export const vanillaStore = useAdminStore;
// @ts-ignore-start
export default create<IAdminState>(useAdminStore);
// @ts-ignore-end
