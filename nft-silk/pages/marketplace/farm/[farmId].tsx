/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';
import { filter, find, map, some } from 'lodash-es';

import { Button } from '@components/button';
import { Loader } from '@components/loader';
import { FarmPage } from '@components/pages/farm-page';
import { StaticPage } from '@components/pages/static-page';
import { useRouter } from 'next/router';
import useContractAddressStore, { ContractTypeEnum } from '@hooks/useContractAddressStore';
import useWalletStore from '@hooks/useWalletStore';
import useTranslation from '@hooks/useTranslation';
import { getUserRegistrationByWallet } from '@common/api/portal/userRegistration';
import {
  getTokenMetadataByCollectionType,
  getStallFarmData,
  getTokenTypeByCollectionType,
} from '@common/api/portal/marketplace';
import HorseActionsProvider from '@components/horse-action/horse-actions-context';

import {
  getNftImageFromS3,
  getNftImageThumbnailFromS3,
  getNftMetadataFromS3,
} from '@common/getInformationPerNftCollectionEnum';

const mapFarm = async (
  farm: IFarmNFTsVWEntityModel,
  currentNftOwnerWalletAddress: string,
  currentLoggedUserWalletAddress: string
): Promise<IFarm> => {
  const contractType = ContractTypeEnum.Farm;
  const s3Metadata = await getNftMetadataFromS3(contractType, farm.tokenId);
  const tokenTypeCollection = await getTokenTypeByCollectionType(contractType);
  let availableQuantityToAcceptAnOffer = 0;

  if (
    currentLoggedUserWalletAddress &&
    currentNftOwnerWalletAddress.toLowerCase() == currentLoggedUserWalletAddress.toLowerCase()
  ) {
    availableQuantityToAcceptAnOffer = 1;
  }

  //console.log('farm avail. qty. accept offer', availableQuantityToAcceptAnOffer);

  return {
    properties: s3Metadata.properties
      .filter(f => !f.trait_type.toLowerCase().includes('land x') && !f.trait_type.toLowerCase().includes('land y'))
      .map(p => {
        return { type: p.display_type, name: p.trait_type, value: p.value };
      }),
    landCoordinates: mapPositions(s3Metadata),
    tokenOwnersWalletAddressList: [currentNftOwnerWalletAddress],
    tokenId: farm.tokenId,
    name: farm.name,
    image: getNftImageFromS3(contractType, farm.tokenId),
    imageThumbnail: getNftImageThumbnailFromS3(contractType, farm.tokenId),
    type: s3Metadata.properties?.find(p => p.trait_type.toLowerCase() == 'land type').value,
    marketplaceItemId: farm.marketPlaceItemId,
    price: farm.priceInETH,
    isForSale: farm.isForSale,
    coords: {
      x: parseInt(find(s3Metadata.properties, p => p.trait_type == 'Land X0').value),
      y: parseInt(find(s3Metadata.properties, p => p.trait_type == 'Land Y0').value),
    },
    isPublic: farm.isPublic,
    totalLandPieces: farm.totalPiecesLand,
    collectionName: tokenTypeCollection.collectionDetailName,
    collectionType: contractType,
    availableQuantityToAcceptAnOffer: availableQuantityToAcceptAnOffer,
    hasMultipleShares: false,
    addressInformation: {
      farmOwnerWalletAddress: currentNftOwnerWalletAddress,
      userWalletAddress: currentLoggedUserWalletAddress,
    },
  };
};

const mapPositions = (s3Metadata: INftMetadataModel): ICoordinateModel[] => {
  const coordsX = filter(s3Metadata.properties, p => p.trait_type.indexOf('Land X') > -1);
  const coordsY = filter(s3Metadata.properties, p => p.trait_type.indexOf('Land Y') > -1);

  return map(
    coordsX,
    (x, index) =>
      ({
        x: Number(x.value),
        y: Number(coordsY[index].value),
      } as ICoordinateModel)
  );
};

const FarmMarketPage: NextPage = () => {
  const router = useRouter();

  const [currentFarm, setCurrentFarm] = useState<IFarm>();
  const [isLoading, showLoading] = useState(true);
  const [owner, setOwner] = useState<IProfile>();
  const [coordinates, setCoordinates] = useState<ICoordinateModel[]>();
  const [stakedHorses, setStakedHorses] = useState<IStakedHorse[]>();
  const [stableRequests, setStableRequests] = useState<IStableRequest[]>();
  const [ownsLandOrFarms, setOwnsLandOrFarms] = useState(false);
  const [openSlots, setOpenSlots] = useState(0);
  //NOTE using calculations in setIsFarmOrLandOwner; versus account === owner.walletAddress
  const [isUserFarmOwner, setIsUserFarmOwner] = useState(false);
  const { getContractAddress } = useContractAddressStore();
  const { getMarketplaceFarmsForSale, getNFTsForContract, checkStableRequests } = useWalletStore();
  const { Moralis, isInitialized, isAuthenticated, chainId, account } = useMoralis();
  const { native } = useMoralisWeb3Api();
  const [nftNotFound, setNftNotFound] = useState(false);
  const { t } = useTranslation();

  const getStakedHorses = async farmId => {
    const { stakedHorses, openSlots } = await getStallFarmData(farmId);
    setStakedHorses(stakedHorses);
    setOpenSlots(openSlots);
    return stakedHorses;
  };

  const getStableRequests = async farmId => {
    const stableRequests = await checkStableRequests(Moralis, farmId);
    setStableRequests(stableRequests);
    return stableRequests;
  };

  const getFarmDetails = async farmId => {
    if (!farmId) return;

    getStakedHorses(farmId);
    setIsFarmOrLandOwner(farmId);
    getStableRequests(farmId);
    const contractType = ContractTypeEnum.Farm;
    const getFarm: IFarmNFTsVWEntityModel[] = await getTokenMetadataByCollectionType(contractType, farmId);
    console.log('farm data from portal API', getFarm);

    if (!getFarm || getFarm.length == 0) {
      console.log("Can't find farm NFT");
      setNftNotFound(true);
      return;
    }

    const farmModel = getFarm[0];

    const marketplaceItems: IFetchMarketItems[] = await getMarketplaceFarmsForSale(native);
    const nftMarketData: IFetchMarketItems = marketplaceItems.find(m => m.tokenId == farmId && m.sold == false);
    //console.log('farms for sell from marketplace', nftMarketData);

    const currentNftOwner = nftMarketData ? nftMarketData.seller.toLowerCase() : farmModel.nftOwnerWalletAddress;

    const getProfileFromPortal = await getUserRegistrationByWallet(currentNftOwner);
    if (getProfileFromPortal) {
      setOwner(getProfileFromPortal);
    } else {
      let ownerNotRegistered: IProfile = {
        walletAddress: currentNftOwner,
        username: '',
        userRegistrationId: 0,
        email: '',
        location: '',
        about: '',
        isEmailVerified: false,
        notifications: [],
      };
      setOwner(ownerNotRegistered);
    }

    const mappedFarm = await mapFarm(farmModel, currentNftOwner, account);
    setCurrentFarm(mappedFarm);
    setCoordinates(mappedFarm.landCoordinates);
    setNftNotFound(false);

    return;
  };

  const setIsFarmOrLandOwner = async farmId => {
    if (isInitialized) {
      try {
        const landContractAddress = await getContractAddress(ContractTypeEnum.Land);
        const farmContractAddress = await getContractAddress(ContractTypeEnum.Farm);

        const results = await Promise.all([
          getNFTsForContract(Moralis, landContractAddress, chainId),
          getNFTsForContract(Moralis, farmContractAddress, chainId),
        ]);
        //get own farm from results
        const ownFarm =
          some(results[0]?.result, ['token_id', farmId]) || some(results[1]?.result, ['token_id', farmId]);
        //console.log('Own Farm', ownFarm);
        setIsUserFarmOwner(ownFarm);

        setOwnsLandOrFarms(results[0].total > 0 || results[1].total > 0);
      } catch (error) {
        setOwnsLandOrFarms(false);
        setIsUserFarmOwner(false);
      }
    }
  };

  const backUrl = useMemo(() => {
    return router.pathname.startsWith('/marketplace') ? '/marketplace' : '/map';
  }, [router?.pathname]);
  const backLabel = useMemo(() => {
    return router.pathname.startsWith('/marketplace') ? t('details.backToMarketplace') : t('land.backToMap');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.pathname]);

  useEffect(() => {
    showLoading(true);
    if (router?.query?.farmId && isInitialized) {
      if (isAuthenticated && !account) {
        return;
      }
      //console.log('ACCOUNT LOGGED IN', account);

      getFarmDetails(router.query.farmId as string).then(() => showLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.query?.farmId, isInitialized, isAuthenticated, account]);

  return isLoading ? (
    <Loader />
  ) : nftNotFound ? (
    <StaticPage backgroundImage="/images/farm-bg.png">
      <img className="h-20 w-auto" src="/images/logos/silks.svg" alt="Silks" />
      <h1 className="font-bold text-3xl">{t('farm.notFound.title')}</h1>
      <p>{t('farm.notFound.subtitle')}</p>
      <Button
        color="market"
        onClick={() => {
          window.location.href = '/marketplace';
        }}
        fill="solid"
        notch="right"
      >
        {t('farm.notFound.button')}
      </Button>
    </StaticPage>
  ) : currentFarm?.tokenId ? (
    <HorseActionsProvider
      currentNFT={currentFarm}
      isFarmOrLandOwner={ownsLandOrFarms}
      isFarmReady={!isLoading}
      isUserFarmOwner={isUserFarmOwner}
      stakedHorses={stakedHorses}
      getStakedHorses={getStakedHorses}
      stableRequests={stableRequests}
      getStableRequests={getStableRequests}
    >
      <FarmPage
        owner={owner}
        currentNFT={currentFarm}
        coordinates={coordinates}
        stakedHorses={stakedHorses}
        stableRequests={stableRequests}
        backUrl={backUrl}
        backLabel={backLabel}
        openSlots={openSlots}
      />
    </HorseActionsProvider>
  ) : (
    <div className="text-white">404</div>
  );
};

export default FarmMarketPage;
