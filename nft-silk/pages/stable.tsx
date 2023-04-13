/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';

import { Button } from '@components/button';
import { StaticPage } from '@components/pages/static-page';
import { Loader } from '@components/loader';
import { HorsePage } from '@components/pages/horse-page';
import useAppStore from '@hooks/useAppStore';
import useContractAddressStore, { ContractTypeEnum } from '@hooks/useContractAddressStore';
import Account from '@components/ethereum/Account/Account';
import useTranslation from '@hooks/useTranslation';
import useWalletStore from '@hooks/useWalletStore';
import moment from 'moment';
import {
  getAllSyndicatedTokensIdForUserWallet,
  gethorseNFTVWStable,
  getTokenTypeByCollectionType,
} from '@common/api/portal/marketplace';
import { getAvatarTokensFromUserWalletAndMarketplace } from './avatar';
import {
  getNftImageFromS3,
  getNftImageThumbnailFromS3,
  getNftMetadataFromS3,
} from '@common/getInformationPerNftCollectionEnum';
import { find } from 'lodash-es';

const PAGE_SIZE = 50;

export const mapHorseGovernance = async (horse: IHorse, account): Promise<IHorse> => {
  const contractType = ContractTypeEnum.HorseGovernance;
  const currentGovernanceOwner = horse.governanceData.nftOwnerWalletAddress;
  let availQuantityToAcceptAnOffer = 0;

  if (currentGovernanceOwner && account && currentGovernanceOwner.toLocaleLowerCase() == account.toLocaleLowerCase()) {
    availQuantityToAcceptAnOffer = 1;
  }

  const horseGovernance: IHorse = {
    ...horse,
    image: getNftImageFromS3(contractType, horse.governanceData.tokenId, true),
    imageThumbnail: getNftImageThumbnailFromS3(contractType, horse.governanceData.tokenId),
    isForSale: horse.governanceData.isForSale,
    price: horse.governanceData.priceInETH,
    marketplaceItemId: horse.governanceData.marketPlaceItemId,
    collectionType: contractType,
    availableQuantityToAcceptAnOffer: availQuantityToAcceptAnOffer,
  };

  return horseGovernance;
};

export const mapHorsePartnership = async (horse: IHorse, userWalletAddress: string): Promise<IHorse> => {
  const contractType = ContractTypeEnum.HorsePartnership;
  let availQuantityToMakeAnOffer = 0;
  let availQuantityToAcceptAnOffer = 0;
  let availQuantityToSell = 0;
  let tokenOwnersList = [];

  horse.syndicateTab.forEach(syndicateShare => {
    if (syndicateShare.isGovernance == false) {
      if (userWalletAddress && syndicateShare.ownerWalletAddress.toLowerCase() != userWalletAddress.toLowerCase()) {
        availQuantityToMakeAnOffer = availQuantityToMakeAnOffer + syndicateShare.sharesQuantity;
      } else if (
        userWalletAddress &&
        syndicateShare.ownerWalletAddress.toLowerCase() == userWalletAddress.toLowerCase()
      ) {
        const listingsFromCurrentUser = horse.syndicateListingTab.filter(
          s => s.fromOwnerWalletAddress.toLowerCase() == userWalletAddress.toLowerCase()
        );
        let currentQuantityOfSyndicateTokenFromCurrentUser = syndicateShare.sharesQuantity;

        if (listingsFromCurrentUser && listingsFromCurrentUser.length > 0) {
          const totalQuantityFromListings = listingsFromCurrentUser.reduce((accumulator, tokens) => {
            return accumulator + tokens.quantity;
          }, 0);

          currentQuantityOfSyndicateTokenFromCurrentUser =
            currentQuantityOfSyndicateTokenFromCurrentUser - totalQuantityFromListings;
        }

        availQuantityToAcceptAnOffer = currentQuantityOfSyndicateTokenFromCurrentUser;
        availQuantityToSell = currentQuantityOfSyndicateTokenFromCurrentUser;
      }

      if (!tokenOwnersList.includes(syndicateShare.ownerWalletAddress)) {
        tokenOwnersList.push(syndicateShare.ownerWalletAddress);
      }
    }
  });

  console.log('current user wallet address', userWalletAddress);
  console.log('make offer qty', availQuantityToMakeAnOffer);
  console.log('accept offer qty', availQuantityToAcceptAnOffer);
  console.log('quantity available for sell', availQuantityToSell);
  console.log('quantity for sell current selected nft', horse.quantityForSale);
  console.log('token owners list', tokenOwnersList);

  const horsePartnership: IHorse = {
    ...horse,
    image: getNftImageFromS3(contractType, horse.tokenId, true),
    imageThumbnail: getNftImageThumbnailFromS3(contractType, horse.tokenId),
    tokenOwnersWalletAddressList: tokenOwnersList,
    isForSale: horse.partnershipData.isForSale,
    price: horse.partnershipData.priceInETH,
    marketplaceItemId: horse.partnershipData.marketPlaceItemId,
    collectionType: contractType,
    quantityForSale: horse.partnershipData.isForSale ? horse.partnershipData.quantityOfShares : availQuantityToSell,
    availableQuantityToMakeAnOffer: availQuantityToMakeAnOffer,
    availableQuantityToAcceptAnOffer: availQuantityToAcceptAnOffer,
    hasMultipleShares: true,
    availableQuantityToSell: availQuantityToSell,
  };

  return horsePartnership;
};

export const mapHorse = async (
  Moralis,
  MoralisWeb3API,
  getContractAddress,
  getAllNFTsForContract,
  getMarketplaceAvatarsForSale,
  currentNftOwnerWalletAddress: string,
  currentLoggedUserWalletAddress: string,
  horsesList: IGetHorseNftVWStableItemModel[],
  marketplaceItems: IFetchMarketItems[] = undefined
): Promise<IHorse[]> => {
  const contractType = ContractTypeEnum.Horse;
  const tokenTypeCollection = await getTokenTypeByCollectionType(contractType);
  let horsesModel: IHorse[] = [];

  const avatarsTokensList = await getAvatarTokensFromUserWalletAndMarketplace(
    Moralis,
    MoralisWeb3API,
    getContractAddress,
    getAllNFTsForContract,
    getMarketplaceAvatarsForSale,
    currentNftOwnerWalletAddress,
    marketplaceItems
  );

  console.log('map horse, current wallet address', currentNftOwnerWalletAddress);

  for (const horse of horsesList) {
    let syndicateRulesMet = false;
    let reconstituteRulesMet = false;
    let availableQuantityToAcceptAnOffer = 0;

    if (
      currentLoggedUserWalletAddress &&
      currentNftOwnerWalletAddress.toLowerCase() == currentLoggedUserWalletAddress.toLowerCase()
    ) {
      availableQuantityToAcceptAnOffer = 1;

      if (horse.isFractionalized) {
        let quantityOfSharesTheCurrentUserOwn = horse.syndicateTab
          .filter(s => s.ownerWalletAddress.toLowerCase() == currentNftOwnerWalletAddress.toLowerCase())
          .reduce((sum, current) => sum + current.sharesQuantity, 0);
        reconstituteRulesMet = quantityOfSharesTheCurrentUserOwn == 10 ? true : false;
      } else {
        if (avatarsTokensList && avatarsTokensList.length > 0 && horse.isStabled) {
          syndicateRulesMet = true;
        }
      }
    }

    const s3Metadata = await getNftMetadataFromS3(contractType, horse.tokenId);

    //console.log('reconstitute rules', horse.tokenId, reconstituteRulesMet, horse.syndicateTab, userWalletAddress);
    //console.log('syndicate rules', horse.tokenId, syndicateRulesMet);

    const horseMap: IHorse = {
      ...horse,
      iframeUrl: s3Metadata.animation_url,
      properties: s3Metadata.properties.map(p => {
        return { type: p.display_type, name: p.trait_type, value: p.value };
      }),
      image: getNftImageFromS3(contractType, horse.tokenId, true),
      imageThumbnail: getNftImageThumbnailFromS3(contractType, horse.tokenId),
      tokenOwnersWalletAddressList: [currentNftOwnerWalletAddress],
      marketplaceItemId: horse.marketplaceItemId,
      price: horse.price,
      isForSale: horse.isForSale,
      collectionName: tokenTypeCollection.collectionDetailName,
      collectionType: contractType,
      farmName: horse.farmName,
      farmLink: horse.farmTokenId ? `/marketplace/farm/${horse.farmTokenId}` : '',
      isFractionalized: horse.isFractionalized,
      isSyndicateRulesMet: syndicateRulesMet,
      isReconstituteRulesMet: reconstituteRulesMet,
      governanceData: horse.governanceData,
      partnershipData: horse.partnershipData,
      syndicateTab: horse.syndicateTab,
      syndicateListingTab: horse.syndicateListingTab,
      availableQuantityToAcceptAnOffer: availableQuantityToAcceptAnOffer,
      hasMultipleShares: false,
    };

    horsesModel.push(horseMap);
  }

  return horsesModel;
};

const OwnedStablePage: NextPage = () => {
  const { isAuthenticated, isInitialized, Moralis, chainId, account } = useMoralis();
  const { native } = useMoralisWeb3Api();
  const { getProfile } = useAppStore();
  const { getContractAddress } = useContractAddressStore();
  const { getAllNFTsForContract, getMarketplaceHorsesForSale, getMarketplaceAvatarsForSale } = useWalletStore();
  const { t } = useTranslation();

  const [currentHorse, setCurrentHorse] = useState<IHorse>();
  const [horses, setHorses] = useState([]);
  const [allHorseIds, setAllHorseIds] = useState([]);
  const [isLoading, showLoading] = useState(true);
  const [realTotalHorses, setRealTotalHorses] = useState(999999);
  const [owner, setOwner] = useState<IProfile>();

  const returnMappedHorses = async (horseResults: IGetHorseNftVWStableItemModel[]): Promise<IHorse[]> => {
    let horsesModel = await mapHorse(
      Moralis,
      native,
      getContractAddress,
      getAllNFTsForContract,
      getMarketplaceAvatarsForSale,
      account,
      account,
      horseResults
    );

    let syndicatedHorses: IHorse[] = [];

    for (let i = horsesModel.length - 1; i >= 0; --i) {
      const horse = horsesModel[i];
      if (horse.isFractionalized) {
        let hasData = false;

        if (horse.governanceData) {
          syndicatedHorses.push(await mapHorseGovernance(horse, account));
          hasData = true;
        }

        if (horse.partnershipData) {
          syndicatedHorses.push(await mapHorsePartnership(horse, account));
          hasData = true;
        }

        if (hasData) {
          horsesModel.splice(i, 1);
        }
      }
    }

    let horsesData = horsesModel.concat(syndicatedHorses);

    horsesData = horsesData.sort(function (a, b) {
      return b.tokenId - a.tokenId;
    });

    const horseDataPromises = horsesData.map(async (horse) => {
      return {
        ...horse,
        sex: find(horse.properties, (p) => p.name?.toLowerCase() === 'sex')?.value,
        sireName: find(horse.properties, (p) => p.name?.toLowerCase() === 'sire' )?.value,
        damName: find(horse.properties, (p) => p.name?.toLowerCase() === 'broodmare' )?.value,
        damSireName: find(horse.properties, (p) => p.name?.toLowerCase() === 'broodmare sire' )?.value,
        auctionPrice: find(horse.properties, (p) => p.name?.toLowerCase() === 'auction price' )?.value,
      }
    })

    const horseDataResults = await Promise.all(horseDataPromises);
    return horseDataResults;
  };

  const returnMarketplaceItems = async (): Promise<IFetchMarketItems[]> => {
    let marketplaceItems: IFetchMarketItems[] = await getMarketplaceHorsesForSale(native);
    marketplaceItems = marketplaceItems.filter(m => m.sold == false && m.seller.toLowerCase() == account.toLowerCase());
    // console.log('marketplace item result, ', marketplaceItems);
    return marketplaceItems;
  };

  const fetchMoreHorses = async () => {
    if (horses.length < allHorseIds.length) {
      const sortedHorseIds = allHorseIds.slice(horses.length, horses.length + PAGE_SIZE);

      const horseResults = (await gethorseNFTVWStable(sortedHorseIds, 9999, owner.walletAddress))?.items;
      console.log('horse results portal api', horseResults);

      if (horseResults) {
        let nextHorses = [];
        for (const horseId of sortedHorseIds) {
          const horseAlreadyHere = horses.find(h => h.tokenId == horseId);
          if (horseAlreadyHere) continue;
          const horseToAdd = horseResults.find(h => h.tokenId == horseId);
          if (horseToAdd) nextHorses.push(horseToAdd);
        }

        if (nextHorses.length == 0) setRealTotalHorses(horses.length);

        nextHorses = await returnMappedHorses(nextHorses);

        setHorses([...horses, ...nextHorses]);
      }
    }
  };

  const init = async () => {
    let currentUserWallet = '';
    const user = await getProfile(account);
    if (user) {
      setOwner(user);
      currentUserWallet = user.walletAddress;
    } else {
      let ownerNotRegistered: IProfile = {
        walletAddress: account,
        username: '',
        userRegistrationId: 0,
        email: '',
        location: '',
        about: '',
        isEmailVerified: false,
        notifications: [],
      };
      setOwner(ownerNotRegistered);
      currentUserWallet = account;
    }

    let nftTokenIdsFromUserWallet = [];
    const horseTokenAddress = await getContractAddress(ContractTypeEnum.Horse);
    const horsesFromWallet = await getAllNFTsForContract(Moralis, horseTokenAddress, chainId);
    const horseIds: [] =
      horsesFromWallet
        ?.sort((a, b) => moment(a.last_metadata_sync).diff(b.last_metadata_sync, 'seconds'))
        .map(h => h.token_id) || [];
    // console.log('horses ids from wallet result', avatarsFromWallet);

    const marketplaceItems = await returnMarketplaceItems();

    const syndicatedTokens = await getAllSyndicatedTokensIdForUserWallet(currentUserWallet);
    console.log('syndicated tokens', syndicatedTokens);

    horseIds.forEach(h => {
      nftTokenIdsFromUserWallet.push(h);
    });

    marketplaceItems.forEach(mktItem => {
      if (!nftTokenIdsFromUserWallet.includes(mktItem.tokenId)) {
        nftTokenIdsFromUserWallet.push(mktItem.tokenId);
      }
    });

    if (syndicatedTokens) {
      syndicatedTokens.forEach(syndicateToken => {
        if (!nftTokenIdsFromUserWallet.includes(syndicateToken)) {
          nftTokenIdsFromUserWallet.push(syndicateToken);
        }
      });
    }

    console.log('horse tokenId list', nftTokenIdsFromUserWallet);

    nftTokenIdsFromUserWallet = nftTokenIdsFromUserWallet.sort(function (a, b) {
      return b - a;
    });
    setAllHorseIds(nftTokenIdsFromUserWallet);

    if (nftTokenIdsFromUserWallet && nftTokenIdsFromUserWallet.length > 0) {
      let horseResults = await (
        await gethorseNFTVWStable(nftTokenIdsFromUserWallet.slice(0, PAGE_SIZE), 9999, currentUserWallet)
      )?.items;
      console.log('horse results portal api', horseResults);

      const horsesModel = await returnMappedHorses(horseResults);

      if (horsesModel.length < PAGE_SIZE) setRealTotalHorses(horsesModel.length);
      console.log('Before set horses', horsesModel);
      setHorses(horsesModel);
      setCurrentHorse(horsesModel[0]);
    } else {
      setHorses([]);
      setCurrentHorse(null);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) {
        if (account) {
          init().then(() => showLoading(false));
        }
      } else {
        showLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isInitialized, account]);

  const handleSelectHorse = (horse: IHorse) => {
    setCurrentHorse(horse);
  };

  if (isLoading) return <Loader />;

  return isAuthenticated && currentHorse?.tokenId ? (
    <HorsePage
      currentNFT={currentHorse}
      owner={owner}
      ownedNFTs={horses}
      onSelectCarousel={handleSelectHorse}
      fetchMoreOwnedNFTs={fetchMoreHorses}
      totalOwnedNFTs={Math.min(allHorseIds.length, realTotalHorses)}
    />
  ) : isAuthenticated ? (
    <StaticPage className="mx-auto w-full max-h-full" backgroundImage="/images/no-racehorse-owned.png">
      <img className="h-20 w-auto" src="/images/logos/silks.svg" alt="Silks" />
      <h1 className="font-bold text-3xl">{t('horse.noHorse.title')}</h1>
      <p>{t('horse.noHorse.subtitle')}</p>
      <Button
        color="market"
        onClick={() => {
          window.location.href = '/marketplace';
        }}
        fill="solid"
        notch="right"
      >
        {t('horse.noHorse.button')}
      </Button>
    </StaticPage>
  ) : (
    <StaticPage backgroundVideo={`${process.env.NEXT_PUBLIC_ASSETS_BASE_URL}/video/silks-intro.mp4`}>
      <img className="h-20 w-auto" src="/images/logos/silks.svg" alt="Silks" />
      <h1 className="font-bold text-3xl">{t('horse.disconnected.title')}</h1>
      {/* <p>{t('horse.disconnected.subtitle')}</p> */}
      <Account />
    </StaticPage>
  );
};

export default OwnedStablePage;
