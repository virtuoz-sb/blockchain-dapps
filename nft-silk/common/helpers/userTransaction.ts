import { forEach } from 'lodash-es';

import api from '@common/api';
import { getAbi } from '@common/abi';
import { vanillaStore as vanillaAppStore } from '@hooks/useAppStore';
import { vanillaStore as vanillaContractAddressStore } from '@hooks/useContractAddressStore';
import { vanillaStore as vanillaWalletStore } from '@hooks/useWalletStore';

export const handleUserTransactions = async (Moralis, walletAddress, chainId) => {
  try {
    const { getTransactions } = vanillaAppStore?.getState();
    const { pollTransaction } = vanillaWalletStore?.getState();
    const { getContractAddressType } = vanillaContractAddressStore?.getState();

    const transactions = await getTransactions(walletAddress);

    // loop over open transactions, make call to smart contracts to complete transactions
    forEach(transactions, async trans => {
      const contractType = await getContractAddressType(trans.contractAddress);

      switch (trans.functionName) {
        case 'manualfulfill':
          try {
            const contractAbi = getAbi(contractType);

            if (contractAbi?.[trans.functionName]) {
              const abi = {
                chain: chainId,
                contractAddress: trans.contractAddress,
                functionName: trans.functionName,
                abi: contractAbi?.[trans.functionName],
              };

              const fulfill = await pollTransaction(Moralis, abi);

              await api.put(`/api/userTransaction/field`, {
                id: trans.userTransactionId,
                fieldName: 'IsActive',
                fieldValue: false,
              });
            }
          } catch (error) {
            // error code 4001 means user rejected transaction, set to inactive
            if (error?.code === 4001) {
              await api.put(`/api/userTransaction/field`, {
                id: trans.userTransactionId,
                fieldName: 'IsActive',
                fieldValue: false,
              });
            }

            console.error(error);
          }

          break;

        default:
          break;
      }
    });
  } catch (error) {
    return undefined;
  }
};
