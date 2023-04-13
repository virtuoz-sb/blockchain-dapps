import { initAction, confirmAction, processAction } from '../helpers';
import { vanillaStore as vanillaWalletStore } from '@hooks/useWalletStore';
import { confirmStableHorse } from '@common/mock/mockStabledHorses';
const isTestMock = false;

const getFarmParams = vanillaWalletStore.getState().getFarmParams;
const stableHorse = vanillaWalletStore.getState().stableHorse;

export async function init(actionDispatch, Moralis, farmID): Promise<any> {
  let farmParams = undefined;
  actionDispatch(processAction());
  try {
    farmParams = isTestMock ? await confirmStableHorse(farmID) : await getFarmParams(Moralis, farmID);
    if (farmParams) {
      actionDispatch(initAction({ success: true, actionParams: farmParams }));
    } else {
      actionDispatch(initAction({ success: false, actionParams: farmParams }));
    }
  } catch (error) {
    actionDispatch(initAction({ success: false, actionParams: error }));
    farmParams = error;
    console.log('farm params error', error);
  }
  return farmParams;
}

export async function confirm(actionDispatch, Moralis, params): Promise<any> {
  const { horseID, farmID, farmTerm } = params;
  let stableHorseResponse = undefined;
  actionDispatch(processAction());
  try {
    stableHorseResponse = isTestMock
      ? await confirmStableHorse(params)
      : await stableHorse(Moralis, horseID, farmID, farmTerm);
    //if undefined here could be error else get code - rejected or code 4001
    if (stableHorseResponse) {
      if (stableHorseResponse?.code === 4001) {
        //return and stop processing;
        actionDispatch(processAction(false));
        return stableHorseResponse;
      }
      actionDispatch(confirmAction({ success: true, actionResponse: stableHorseResponse }));
    } else {
      actionDispatch(confirmAction({ success: false, actionResponse: stableHorseResponse }));
    }
  } catch (error) {
    actionDispatch(confirmAction({ success: false, actionResponse: error }));
    stableHorseResponse = error;
    console.log('farm confirm error', error);
  }
  return stableHorseResponse;
}
