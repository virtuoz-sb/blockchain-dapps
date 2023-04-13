import api from '@common/api';

export const getUserTransactionByWallet = async (walletAddress, isActive = true): Promise<IUserTransaction[]> => {
  try {
    const { data: transactions } = await api.get<IApiList>(`/api/userTransaction/byWallet/${walletAddress}`, {
      params: { isActive },
    });

    if (transactions && transactions?.items) {
      return transactions.items;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};
