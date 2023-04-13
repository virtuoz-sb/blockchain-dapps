import create from 'zustand';
import createVanilla from 'zustand/vanilla';
import { map } from 'lodash-es';

import api from '@common/api';
import { getUserTransactionByWallet } from '@common/api/portal/userTransaction';
import { vanillaStore as vanillaNotificationStore } from '@hooks/useNotificationStore';

interface IAppState {
  appLoaded: boolean;
  setAppLoaded: Function;

  profile: IProfile;
  getProfile: Function;
  setProfile: Function;

  transactions: IUserTransaction[];
  getTransactions: Function;

  showProfileModal: boolean;
  setShowProfileModal: Function;

  showEmailVerificationModal: boolean;
  setShowEmailVerificationModal: Function;

  isEmailJustVerified: boolean;
  setisEmailJustVerified: Function;

  showSettingsModal: boolean;
  setShowSettingsModal: Function;
  settingsModalDefaultTab: number;
  setSettingsModalDefaultTab: Function;

  showRedemptionModal: boolean;
  setShowRedemptionModal: Function;

  showFooter: boolean;
  setShowFooter: Function;
}

const useAppStore = createVanilla<IAppState>((set, get) => ({
  appLoaded: get()?.appLoaded || null,
  setAppLoaded: appLoaded => set({ appLoaded }),

  profile: get()?.profile || undefined,
  getProfile: async walletAddress => {
    try {
      if (walletAddress) {
        const { data: profile } = await api.get<IProfile>(`/api/userRegistration/byWallet/${walletAddress}`);
        set({ profile });

        vanillaNotificationStore.getState().getNotifications();

        return profile;
      }

      return undefined;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  },
  setProfile: profile => set({ profile }),

  showProfileModal: get()?.showProfileModal || false,
  setShowProfileModal: showProfileModal => set({ showProfileModal }),

  transactions: get()?.transactions || null,
  getTransactions: async (walletAddress, isActive = true) => {
    try {
      if (walletAddress) {
        const transactions = await getUserTransactionByWallet(walletAddress, isActive);

        set({ transactions });
        return transactions;
      }

      return null;
    } catch (error) {
      return null;
    }
  },

  showEmailVerificationModal: get()?.showEmailVerificationModal || false,
  setShowEmailVerificationModal: showEmailVerificationModal => set({ showEmailVerificationModal }),

  isEmailJustVerified: get()?.isEmailJustVerified || false,
  setisEmailJustVerified: isEmailJustVerified => set({ isEmailJustVerified }),

  showSettingsModal: get()?.showSettingsModal || false,
  setShowSettingsModal: showSettingsModal => set({ showSettingsModal }),

  settingsModalDefaultTab: get()?.settingsModalDefaultTab || 0,
  setSettingsModalDefaultTab: settingsModalDefaultTab => set({ settingsModalDefaultTab }),

  showRedemptionModal: get()?.showRedemptionModal || false,
  setShowRedemptionModal: showRedemptionModal => set({ showRedemptionModal }),

  showFooter: get()?.showFooter || true,
  setShowFooter: showFooter => set({ showFooter }),
}));

export const vanillaStore = useAppStore;
// @ts-ignore-start
export default create<IAppState>(useAppStore);
// @ts-ignore-end
