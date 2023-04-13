import { init } from '../stableOwned/actions';
import { confirmAction, processAction } from '../helpers';
import { vanillaStore as vanillaWalletStore } from '@hooks/useWalletStore';
import { confirmStableHorse } from '@common/mock/mockStabledHorses';
const isTestMock = false;

export { init };

//DESTABLE
const deStableHorse = vanillaWalletStore.getState().deStableHorse;

export async function confirm(actionDispatch, Moralis, params): Promise<any> {
  const { horseID } = params;
  let deStableHorseResponse = undefined;
  actionDispatch(processAction());
  try {
    deStableHorseResponse = isTestMock ? await confirmStableHorse(params) : await deStableHorse(Moralis, horseID);
    //if undefined here could be error else get code - rejected or code 4001
    if (deStableHorseResponse) {
      if (deStableHorseResponse?.code === 4001) {
        //return and stop processing;
        actionDispatch(processAction(false));
        return deStableHorseResponse;
      }
      actionDispatch(confirmAction({ success: true, actionResponse: deStableHorseResponse }));
    } else {
      actionDispatch(confirmAction({ success: false, actionResponse: deStableHorseResponse }));
    }
  } catch (error) {
    actionDispatch(confirmAction({ success: false, actionResponse: error }));
    deStableHorseResponse = error;
    console.log('farm confirm error', error);
  }
  return deStableHorseResponse;
}
