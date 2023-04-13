/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';

import { Button } from '@components/button';
import { Loader } from '@components/loader';
import { LandPage } from '@components/pages/land-page';
import { StaticPage } from '@components/pages/static-page';
import { useRouter } from 'next/router';
import { ContractTypeEnum } from '@hooks/useContractAddressStore';
import useWalletStore from '@hooks/useWalletStore';
import useTranslation from '@hooks/useTranslation';
import { getUserRegistrationByWallet } from '@common/api/portal/userRegistration';
import { getTokenMetadataByCollectionType, getTokenTypeByCollectionType } from '@common/api/portal/marketplace';
import {
  getNftImageFromS3,
  getNftImageThumbnailFromS3,
  getNftMetadataFromS3,
} from '@common/getInformationPerNftCollectionEnum';

const mapLand = async (
  land: ILandNFTsVWEntityModel,
  currentNftOwnerWalletAddress: string,
  currentLoggedUserWalletAddress: string
): Promise<ILand> => {
  const contractType = ContractTypeEnum.Land;
  const s3Metadata = await getNftMetadataFromS3(contractType, land.tokenId);
  const tokenTypeCollection = await getTokenTypeByCollectionType(contractType);
  let availableQuantityToAcceptAnOffer = 0;

  if (
    currentLoggedUserWalletAddress &&
    currentNftOwnerWalletAddress.toLowerCase() == currentLoggedUserWalletAddress.toLowerCase()
  ) {
    availableQuantityToAcceptAnOffer = 1;
  }

  console.log('land avail. qty. accept offer', availableQuantityToAcceptAnOffer);

  return {
    tokenOwnersWalletAddressList: [currentNftOwnerWalletAddress],
    tokenId: land.tokenId,
    name: '1 Acre Land',
    image: getNftImageFromS3(contractType, land.tokenId, true),
    imageThumbnail: getNftImageThumbnailFromS3(contractType, land.tokenId),
    type: s3Metadata.properties?.find(p => p.trait_type == 'Land Type').value,
    marketplaceItemId: land.marketPlaceItemId,
    price: land.priceInETH,
    isForSale: land.isForSale,
    coords: {
      x: land.xCoordinate,
      y: land.yCoordinate,
    },
    properties: s3Metadata.properties?.map(t => {
      return { name: t.trait_type, type: t.trait_type, value: t.value, rarity: 0 };
    }),
    collectionName: tokenTypeCollection.collectionDetailName,
    collectionType: contractType,
    availableQuantityToAcceptAnOffer: availableQuantityToAcceptAnOffer,
    hasMultipleShares: false,
  };
};

const LandMarketPage: NextPage = () => {
  const router = useRouter();

  const [currentLand, setCurrentLand] = useState<ILand>();
  const [isLoading, showLoading] = useState(true);
  const [owner, setOwner] = useState<IProfile>();
  const { getMarketplaceLandsForSale } = useWalletStore();
  const { isInitialized, account, isAuthenticated } = useMoralis();
  const { native } = useMoralisWeb3Api();
  const [nftNotFound, setNftNotFound] = useState(false);
  const { t } = useTranslation();

  const getLandDetails = async landId => {
    if (!landId) return;

    const contractType = ContractTypeEnum.Land;
    const getLand: ILandNFTsVWEntityModel[] = await getTokenMetadataByCollectionType(contractType, landId);
    console.log('land data from portal API', getLand);

    if (!getLand || getLand.length == 0) {
      console.log("Can't find land NFT");
      setNftNotFound(true);
      return;
    }

    const landModel = getLand[0];

    const marketplaceItems: IFetchMarketItems[] = await getMarketplaceLandsForSale(native);
    const nftMarketData: IFetchMarketItems = marketplaceItems.find(m => m.tokenId == landId && m.sold == false);
    console.log('lands for sell from marketplace', nftMarketData);

    const currentNftOwner = nftMarketData ? nftMarketData.seller.toLowerCase() : landModel.nftOwnerWalletAddress;

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

    setCurrentLand(await mapLand(landModel, currentNftOwner, account));
    setNftNotFound(false);

    return;
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
    if (router?.query?.landId && isInitialized) {
      if (isAuthenticated && !account) {
        return;
      }
      console.log('ACCOUNT LOGGED IN', account);

      getLandDetails(router.query.landId as string).then(() => showLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.query?.landId, isInitialized, isAuthenticated, account]);

  return isLoading ? (
    <Loader />
  ) : nftNotFound ? (
    <StaticPage backgroundImage="/images/land-bg.png">
      <img className="h-20 w-auto" src="/images/logos/silks.svg" alt="Silks" />
      <h1 className="font-bold text-3xl">{t('land.notFound.title')}</h1>
      <p>{t('land.notFound.subtitle')}</p>
      <Button
        color="market"
        onClick={() => {
          window.location.href = '/marketplace';
        }}
        fill="solid"
        notch="right"
      >
        {t('land.notFound.button')}
      </Button>
    </StaticPage>
  ) : currentLand?.tokenId ? (
    <LandPage owner={owner} currentNFT={currentLand} backUrl={backUrl} backLabel={backLabel} />
  ) : (
    <div className="text-white">404</div>
  );
};

export default LandMarketPage;
