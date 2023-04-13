import create from 'zustand';
import createVanilla from 'zustand/vanilla';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { remove } from 'lodash-es';

import api from '@common/api';
import { vanillaStore as vanillaContractAddressStore } from '@hooks/useContractAddressStore';

const baseUrl = process?.env?.NEXT_PUBLIC_API_BASE;

interface ITransactionsState {
  connections: HubConnection[];
  addConnection: Function;
  removeConnection: Function;
  addTransactionResult: Function;
  setTransactionResults: Function;
  transactions: any[];
  watchTransaction: Function;
}

const useTransactionStore = createVanilla<ITransactionsState>((set, get) => ({
  connections: get()?.connections || [],
  addConnection: (connection: HubConnection) => {
    const connections = [...get()?.connections];
    connections.push(connection);
    set({ connections });
  },
  removeConnection: connection => {
    const connections = remove(get()?.connections, connection);
    set({ connections });
  },

  transactions: get()?.transactions || [],
  addTransactionResult: transaction => {
    set({
      transactions: [transaction, ...get()?.transactions],
    });
  },
  setTransactionResults: transactions =>
    set({
      transactions,
    }),
  watchTransaction: async hash => {
    const { data } = await api.get(`/api/transaction/watch/${hash}`);
  },
}));

// setup signalr connection on load
async function setupTransactionsConnection() {
  const state = useTransactionStore.getState();

  const connection = new HubConnectionBuilder()
    .withUrl(`${baseUrl}/hubs/transactions`)
    .withAutomaticReconnect()
    .build();

  if (connection) {
    state.addConnection(connection);

    connection
      .start()
      .then(() => {
        // index contracts come from BE web socket connection
        connection.on('IndexContracts', contracts => {
          vanillaContractAddressStore?.getState()?.setContractAddresses(contracts);
        });

        connection.on('Transaction', transaction => {
          state.addTransactionResult(transaction);
        });

        connection.on('Transactions', transactions => {
          state.setTransactionResults(transactions);
        });
      })
      .catch(error => {
        vanillaContractAddressStore?.getState()?.setRefreshContractAddresses(true);
        console.log(error);
      });
  } else {
    vanillaContractAddressStore?.getState()?.setRefreshContractAddresses(true);
  }
}

if (typeof window !== 'undefined') {
  setupTransactionsConnection();
}

export const vanillaStore = useTransactionStore;
// @ts-ignore-start
export default create<ITransactionsState>(useTransactionStore);
// @ts-ignore-end
