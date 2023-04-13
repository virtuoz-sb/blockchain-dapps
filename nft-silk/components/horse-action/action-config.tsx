import { ActionButton } from '@components/table/cells';
import StableOwnedConfirm from './stableOwned';
import DeStableOwnedConfirm from './deStableOwned';
import StableUserConfirm from './stableUser';
import DeStableUserConfirm from './deStableUser';
import CancelStableUserConfirm from './cancelStableUser';
import { StableActionButton, DeStableActionButton } from './action-button';

export const horseActionsContent = {
  stableOwned: {
    id: 'stableOwned',
    actionConfirm: StableOwnedConfirm,
    button: StableActionButton,
    //THIS WILL NOT WORK AS REQUESTS will not be this farm
    //need to account for stable requests as well as isStabled ; horse data does not currently include request status
    //meta here is stable requests mapped by horseIds
    renderActionColumn: (onAction, t, meta) => {
      return {
        cell: ({ row }) => {
          const aTxt = t('horseaction.stableOwned.action');
          const request = meta ? meta[row.original.record.tokenId] || null : null;
          const disabled = request ? true : row?.original?.record?.isStabled || false;

          return <ActionButton onHandleAction={() => onAction(row, meta)} actionTxt={aTxt} disabled={disabled} />;
        },
      };
    },
  },
  deStableOwned: {
    id: 'deStableOwned',
    actionConfirm: DeStableOwnedConfirm,
    button: DeStableActionButton,
    renderActionColumn: (onAction, t, meta) => {
      return {
        cell: ({ row }) => {
          const aTxt = t('horseaction.deStableOwned.confirm');
          //tbd
          const horse = row?.original?.record;
          const enabled = horse.isStabled && horse.farmTokenId === meta.tokenId;
          return <ActionButton onHandleAction={() => onAction(row, meta)} actionTxt={aTxt} disabled={!enabled} />;
        },
      };
    },
  },
  stableUser: {
    id: 'stableUser',
    actionConfirm: StableUserConfirm,
    button: StableActionButton,
    //need to account for stable requests as well as isStabled ; horse data does not currently include request status
    //meta here is stable requests mapped by horseIds
    renderActionColumn: (onAction, t, meta) => {
      return {
        cell: ({ row }) => {
          const aTxt = t('horseaction.stableUser.action');
          //tbd
          const request = meta ? meta[row.original.record.tokenId] || null : null;
          const disabled = request ? true : row?.original?.record?.isStabled || false;
          return <ActionButton onHandleAction={() => onAction(row, meta)} actionTxt={aTxt} disabled={disabled} />;
        },
      };
    },
  },
  cancelStableUser: {
    id: 'cancelStableUser',
    actionConfirm: CancelStableUserConfirm,
    button: DeStableActionButton,
    renderActionColumn: (onAction, t, meta) => {
      //meta here is stable requests mapped by horseIds
      return {
        cell: ({ row }) => {
          const aTxt = t('horseaction.cancelStableUser.action');
          //check request
          const request = meta ? meta[row.original.record.tokenId] || null : null;
          return (
            <ActionButton
              onHandleAction={() => onAction(row, request)}
              actionTxt={aTxt}
              disabled={request ? false : true}
            />
          );
        },
      };
    },
  },
  deStableUser: {
    id: 'deStableUser',
    actionConfirm: DeStableUserConfirm,
    button: DeStableActionButton,
    renderActionColumn: (onAction, t, meta) => {
      return {
        cell: ({ row }) => {
          const aTxt = t('horseaction.deStableUser.confirm');
          //tbd
          const horse = row?.original?.record;
          const enabled = horse.isStabled && horse.farmTokenId === meta.tokenId;
          return <ActionButton onHandleAction={() => onAction(row, meta)} actionTxt={aTxt} disabled={!enabled} />;
        },
      };
    },
  },
};

//stableUserCancel
export const horseActionsCfg = {
  stableOwned: {
    id: 'stableOwned',
    requiresFarmOwner: true,
    type: 'stable',
    hasHorseList: true,
    isEnabled: true,
    isPublicOnly: false,
  },
  deStableOwned: {
    id: 'deStableOwned',
    requiresFarmOwner: true,
    type: 'deStable',
    hasHorseList: true,
    isEnabled: true,
    isPublicOnly: false,
  },
  stableUser: {
    id: 'stableUser',
    requiresFarmOwner: false,
    type: 'stable',
    hasHorseList: true,
    isEnabled: true,
    isPublicOnly: true,
  },
  cancelStableUser: {
    id: 'cancelStableUser',
    requiresFarmOwner: false,
    type: 'request',
    hasHorseList: true,
    isEnabled: true,
    isPublicOnly: true,
  },
  deStableUser: {
    id: 'deStableUser',
    requiresFarmOwner: false,
    type: 'deStable',
    hasHorseList: true,
    isEnabled: true,
    isPublicOnly: true,
  },
};

export function getHorseActionContent(id: string, prop?: string) {
  const ret = horseActionsContent[id] || null;
  return ret && prop ? ret[prop] : ret;
}

export function getHorseActionCfg(id) {
  return horseActionsCfg[id] || null;
}

export function getHorseActions(asArray = true): any {
  return asArray ? Object.values(horseActionsCfg) : horseActionsCfg;
}
