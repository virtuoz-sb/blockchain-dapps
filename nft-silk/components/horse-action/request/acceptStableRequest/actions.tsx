import { confirmAction, processAction } from '../../helpers';
import { vanillaStore as vanillaWalletStore } from '@hooks/useWalletStore';
import { confirmStableHorse } from '@common/mock/mockStabledHorses';
const isTestMock = false;

//ACCEPT Request
//params id is index
const approveStableRequest = vanillaWalletStore.getState().approveStableRequest;

export async function confirm(actionDispatch, Moralis, params): Promise<any> {
  const { farmID, requestParams } = params;
  let approveRequestResponse = undefined;
  actionDispatch(processAction());
  try {
    approveRequestResponse = isTestMock
      ? await confirmStableHorse(params)
      : await approveStableRequest(Moralis, farmID, requestParams.id);
    //if undefined here could be error else get code - rejected or code 4001
    if (approveRequestResponse) {
      if (approveRequestResponse?.code === 4001) {
        //return and stop processing;
        actionDispatch(processAction(false));
        return approveRequestResponse;
      }
      actionDispatch(confirmAction({ success: true, actionResponse: approveRequestResponse }));
    } else {
      actionDispatch(confirmAction({ success: false, actionResponse: approveRequestResponse }));
    }
  } catch (error) {
    actionDispatch(confirmAction({ success: false, actionResponse: error }));
    approveRequestResponse = error;
    console.log('farm accept request error', error);
  }
  return approveRequestResponse;
}
