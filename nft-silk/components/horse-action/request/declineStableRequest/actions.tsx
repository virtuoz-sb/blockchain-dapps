import { confirmAction, processAction } from '../../helpers';
import { vanillaStore as vanillaWalletStore } from '@hooks/useWalletStore';
import { confirmStableHorse } from '@common/mock/mockStabledHorses';
const isTestMock = false;

//DECLINE Request

const rejectStableRequest = vanillaWalletStore.getState().rejectStableRequest;

export async function confirm(actionDispatch, Moralis, params): Promise<any> {
  const { farmID, requestParams } = params;
  let cancelRequestResponse = undefined;
  actionDispatch(processAction());
  try {
    cancelRequestResponse = isTestMock
      ? await confirmStableHorse(params)
      : await rejectStableRequest(Moralis, farmID, requestParams.id);
    //if undefined here could be error else get code - rejected or code 4001
    if (cancelRequestResponse) {
      if (cancelRequestResponse?.code === 4001) {
        //return and stop processing;
        actionDispatch(processAction(false));
        return cancelRequestResponse;
      }
      actionDispatch(confirmAction({ success: true, actionResponse: cancelRequestResponse }));
    } else {
      actionDispatch(confirmAction({ success: false, actionResponse: cancelRequestResponse }));
    }
  } catch (error) {
    actionDispatch(confirmAction({ success: false, actionResponse: error }));
    cancelRequestResponse = error;
    console.log('farm decline request error', error);
  }
  return cancelRequestResponse;
}
