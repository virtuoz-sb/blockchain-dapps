import { useEffect, useState, useMemo, useCallback, FunctionComponent } from 'react';
import { useMoralis } from 'react-moralis';
import clsx from 'clsx';

import useTranslation from '@hooks/useTranslation';
import { Button } from '@components/button';
import { Loader } from '@components/loader';
import { Drawer } from '@components/modals/drawer';
import { getNftImageThumbnail } from '@common/getInformationPerNftCollectionEnum';
import { ContractTypeEnum } from '@hooks/useContractAddressStore';
import { ActionButton } from '@components/table/cells';
import { TableSkeleton } from '@components/table/helpers';
import { confirmStableHorse } from '@common/mock/mockStabledHorses';
import HorseList from '@components/horse-list';
import { StableActionButton } from '../action-button';
//import useHorses, { useHorseNFTTokenIds } from '@components/horse-list/useHorses';
import useOwnedHorses from '@components/horse-list/useOwnedHorses';
import ActionDrawer from '../action-drawer';
import useWalletStore from '@hooks/useWalletStore';

const contractType = ContractTypeEnum.Horse;

const successTimeout = 5000;

export type StableActionProps = {
  currentNFT: IFarm;
  owner?: IProfile;
  getStakedHorses: (farmId) => void;
  //ownedNFTs?: IFarm[];
  //stakedHorses?: IStakedHorse[];
};

const altSkeletonCol = { containerClassName: 'w-12 space-y-4' };
const horseSkeletonCols = [altSkeletonCol, altSkeletonCol, '', altSkeletonCol, '', '', '', '', '', ''];

const renderLabelValue = (label, val, cls = '') => (
  <div className={clsx('font-medium text-white', cls)}>
    <span className="mr-2 font-normal text-[color:var(--color-light-gray)]">{label}:</span>
    <span>{val}</span>
  </div>
);

const renderLabelValueSmall = (label, val, cls = '') => (
  <div className={clsx('text-white text-sm flex flex-col font-medium', cls)}>
    <span className="text-xs font-normal text-[color:var(--color-light-gray)]">{label}</span>
    <span>{val}</span>
  </div>
);

////

const initialActionState = {
  rowIndex: null,
  rowData: null,
  isActionActive: false,
  isActionConfirmed: false,
  message: '',
};

function setRowActionState(row: any, action?: string) {
  if (!row) {
    return { ...initialActionState };
  }
  const { original, index } = row;
  return {
    rowData: { ...original?.record },
    message: `${action}: ${original?.name}`,
    isActionActive: true,
    isActionConfirmed: false,
    rowIndex: index,
  };
}
//test Stable action confirm
//close in 5 seconds sfter confirmed?
//requires initial API call for stable data?
function StableConfirm({
  rowAction,
  isActionProcessing = false,
  onHandleClose,
  currentNFT,
  isOwner = false,
}: {
  rowAction: any;
  currentNFT?: any;
  isActionProcessing?: boolean;
  onHandleClose?: Function;
  isOwner?: boolean;
}) {
  const { Moralis } = useMoralis();
  const { isActionActive, isActionConfirmed, rowData } = rowAction;
  const { t } = useTranslation();
  const imageURL = rowData?.imageThumbnail;
  const { getFarmParams } = useWalletStore();
  const [farmParams, setFarmParams] = useState<IFarmParams>();

  //close after confirmed and 5 seconds
  useEffect(() => {
    let idle;
    if (isActionConfirmed) {
      idle = setTimeout(() => onHandleClose(false), successTimeout);
    }
    //return clearTimeout(idle);
  }, [isActionConfirmed, onHandleClose]);

  useEffect(() => {
    const getParams = async () => {
      const params = await getFarmParams(Moralis, currentNFT.tokenId);
      setFarmParams(params);
      console.log('paramssssssss', params);
    };
    getParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNFT]);

  return (
    <ActionDrawer
      title={isActionConfirmed ? t('horseaction.success') : t('horseaction.stable.action')}
      subtitle={isActionConfirmed ? null : renderLabelValue(t('horseaction.horse'), rowData?.name)}
      isActionActive={isActionActive}
      onHandleClose={() => onHandleClose(false)}
      contentCls={isActionConfirmed ? 'text-center' : 'max-w-sm text-left'}
    >
      <div>
        {isActionConfirmed ? (
          <div className="mt-9 flex flex-col items-center">
            <div className="h-52 w-52">
              <img
                src={imageURL ? `${process.env.NEXT_PUBLIC_API_BASE}${imageURL}` : getNftImageThumbnail(contractType)}
                className="w-full h-full rounded"
                alt={rowData?.name}
              />
            </div>
            <div className="mt-4">
              <div className="font-medium text-white text-lg">{`${rowData?.name} ${t('horseaction.stable.isStabled')} ${
                currentNFT?.name
              }`}</div>
              <div className="font-normal px-8 text-[color:var(--color-light-gray)]">
                {t('horseaction.stable.submitted')}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h3 className="text-3xl font-bold leading-tight text-white">{t('horseaction.terms')}</h3>
              <div className="flex space-x-4 whitespace-nowrap">
                {renderLabelValue(t('horseaction.farm'), currentNFT?.name)}
                {renderLabelValue(t('horseaction.region'), currentNFT?.type)}
              </div>
            </div>
            <div className="mb-8">
              <div className="font-medium text-[color:var(--color-light-gray)] mb-3">{t('horseaction.period')}</div>
              <div className="flex flex-col gap-6 ml-3">
                {farmParams && renderLabelValueSmall(t('horseaction.full'), `${farmParams.maxTerm} months`)}
                {farmParams && renderLabelValueSmall(t('horseaction.stableFee'), `${farmParams.ownerFee}%`)}
                {farmParams && renderLabelValueSmall(t('horseaction.deStableFee'), `${farmParams.destablingFee} ETH`)}
              </div>
            </div>
            {!isOwner && (
              <div className="text-sm text-[color:var(--color-light-gray)]">{t('horseaction.stable.ownerNofee')}</div>
            )}
            <div className="pt-6 flex justify-between">
              <Button
                color="primary"
                fill="solid"
                notch="left"
                chevrons="left"
                className="mr-3 flex-1"
                uppercase
                full
                autoFocus
                onClick={() => onHandleClose(false)}
                data-test="stable-modal-cancel"
              >
                {t('horseaction.cancel')}
              </Button>
              <Button
                color="primary"
                uppercase
                className="flex-1"
                full
                fill="outline"
                chevrons="right"
                notch="right"
                onClick={() => onHandleClose(rowData, currentNFT, farmParams.maxTerm)}
                data-test="stable-modal-confirm"
              >
                {t('horseaction.confirm')}
              </Button>
            </div>
          </div>
        )}
        {isActionProcessing && <Loader />}
      </div>
    </ActionDrawer>
  );
}

//test Stable Action
//is active? determine actions; isOwner
const StableAction: FunctionComponent<StableActionProps> = ({ currentNFT, owner, getStakedHorses }) => {
  //currentNFT, owner
  // is owned farm owner is account currentNFT.nftOwnerWalletAddress === account || owner.walletAddress
  //account === owner.walletAddress
  //const isMounted = useRef<boolean>(false);
  const { isAuthenticated, account } = useMoralis();
  const [isSignedIn, setIsSignedIn] = useState(null);
  const [actionState, setActionState] = useState({ ...initialActionState });
  const [isActionProcessing, setIsActionProcessing] = useState<boolean>(false);
  // const { allHorseIds, getHorseIds } = useHorseNFTTokenIds();

  //this will be hook to get the horses data - mocked for now = pass params TBD
  const { tableState, resetTable, fetchHorses } = useOwnedHorses();
  const { Moralis } = useMoralis();
  const { stableHorse, getFarmParams } = useWalletStore();
  const { isTableActive, isLoading, data } = tableState;

  const { t } = useTranslation();

  //currentNFT?.nftOwnerWalletAddress not added to farm props
  // is the farm owner the current user
  const isUserCurrentNFTOwner = useMemo(
    () => (owner?.walletAddress && account ? account.toLowerCase() == owner?.walletAddress.toLowerCase() : false),
    [account, owner?.walletAddress]
  );

  const handleStableConfirmAction = useCallback(
    async (horseData, nft, stableTerms) => {
      if (horseData) {
        setIsActionProcessing(true);
        const stableHorseResponse = await stableHorse(Moralis, horseData.tokenId, nft.tokenId, stableTerms);
        console.log('stableHorseResponse', stableHorseResponse);
        confirmStableHorse({ data: { horseData, nft } })
          .then(res => {
            console.log('Stable Data Confirm', res);
            setActionState(prev => {
              return { ...prev, isActionConfirmed: true, message: 'Success' };
            });
            getStakedHorses(nft.tokenId);
          })
          .finally(() => setIsActionProcessing(false));
      } else {
        setActionState(setRowActionState(null));
      }
    },
    [getStakedHorses, Moralis, stableHorse]
  );

  const actionColumn = useMemo(
    () => ({
      cell: ({ row }) => {
        const aTxt = t('horseaction.stable.action');
        const disabled = row?.original?.record?.isStabled || false;
        const handleStable = () => {
          const newState = setRowActionState(row, aTxt);
          //setOpen(false);
          resetTable();
          setActionState(newState);
          //console.log('TOGGLE ACTION', row, table, table, table.getSelectedRowModel());
        };
        return <ActionButton onHandleAction={handleStable} actionTxt={aTxt} disabled={disabled} />;
      },
    }),
    [resetTable, t]
  );

  useEffect(() => {
    setIsSignedIn(isAuthenticated);
  }, [isAuthenticated]);

  /* useEffect(() => {
    if (!isMounted.current && isAuthenticated) {
      isMounted.current = true;
      getHorseIds()
        .then(ids => {
          console.log('GET HORSE IDS', ids);
        })
        .catch(error => {
          console.log('error', error);
        });
    }
  }, [getHorseIds, isAuthenticated]); */

  return (
    isSignedIn && (
      <>
        <StableActionButton actionTxt={t('horseaction.stable.action')} onHandleAction={() => fetchHorses()} />

        <Drawer
          title={t('horseaction.stable.title')}
          isOpen={isTableActive}
          onClose={() => resetTable()}
          width="max-w-[1440px]"
          //containerCls="mt-32"
          wrapperCls="right-0 sm:right-2 top-0 sm:top-28 md:top-32 2xl:top-36"
        >
          {isTableActive && isLoading && <TableSkeleton rowsCount={5} columns={horseSkeletonCols} />}
          {isTableActive && !isLoading && <HorseList data={data} actionColumn={actionColumn} />}
        </Drawer>
        <StableConfirm
          rowAction={actionState}
          onHandleClose={handleStableConfirmAction}
          currentNFT={currentNFT}
          isActionProcessing={isActionProcessing}
          isOwner={isUserCurrentNFTOwner}
        />
      </>
    )
  );
};

export default StableAction;
