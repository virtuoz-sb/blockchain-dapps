/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';

import { Button } from '@components/button';
import { StaticPage } from '@components/pages/static-page';
import { Loader } from '@components/loader';
import { AvatarPage } from '@components/pages/avatar-page';
import useAppStore from '@hooks/useAppStore';
import useContractAddressStore, { ContractTypeEnum } from '@hooks/useContractAddressStore';
import Account from '@components/ethereum/Account/Account';
import useTranslation from '@hooks/useTranslation';
import useWalletStore from '@hooks/useWalletStore';
import { getAvatarDetail } from '@common/api/silks';
import { getTokenTypeByCollectionType } from '@common/api/portal/marketplace';

const PAGE_SIZE = 50;

export const mapAvatar = async (
  Moralis,
  avatarTokenIds: any[],
  avatarMarketplaceItems: IFetchMarketItems[],
  currentNftOwnerWalletAddress: string,
  currentLoggedUserWalletAddress: string
): Promise<IAvatar[]> => {
  let avatarList: IAvatar[] = [];
  const contractType = ContractTypeEnum.Avatar;
  const tokenTypeCollection = await getTokenTypeByCollectionType(contractType);

  for (const avatarTokenId of avatarTokenIds) {
    let availableQuantityToAcceptAnOffer = 0;
    const avatarMarketData =
      avatarMarketplaceItems && avatarMarketplaceItems.length > 0
        ? avatarMarketplaceItems.find(m => m.tokenId == avatarTokenId && m.sold == false)
        : undefined;

    if (
      currentLoggedUserWalletAddress &&
      currentNftOwnerWalletAddress.toLowerCase() == currentLoggedUserWalletAddress.toLowerCase()
    ) {
      availableQuantityToAcceptAnOffer = 1;
    }
    console.log('avatar avail. qty. accept offer', availableQuantityToAcceptAnOffer);

    const avatarData = await getAvatarDetail(avatarTokenId);

    avatarList.push({
      tokenOwnersWalletAddressList: [currentNftOwnerWalletAddress],
      tokenId: avatarData.tokenId,
      name: avatarData.name,
      imageThumbnail: avatarData.imageThumbnail,
      marketplaceItemId: avatarMarketData ? parseInt(avatarMarketData.itemId) : undefined,
      price: avatarMarketData
        ? parseFloat(parseFloat(Moralis.Units.FromWei(avatarMarketData.priceWeiUnit)).toFixed(4))
        : undefined,
      isForSale: avatarMarketData ? !avatarMarketData.sold : false,
      properties: avatarData?.traits?.map(t => {
        return { name: t.name, type: t.traitType, value: t.value, rarity: t.rarity };
      }),
      crest: avatarData.crest,
      posedAvatar: avatarData.posedAvatar,
      avatarIframe: avatarData.avatarIframe,
      horseIframe: avatarData.horseIframe,
      glbAvatar: avatarData.glbAvatar,
      glbHorse: avatarData.glbHorse,
      collectionName: tokenTypeCollection.collectionDetailName,
      collectionType: contractType,
      availableQuantityToAcceptAnOffer: availableQuantityToAcceptAnOffer,
      hasMultipleShares: false,
    });
  }

  return avatarList;
};

export const getAvatarTokensFromUserWalletAndMarketplace = async (
  Moralis,
  MoralisWeb3API,
  getContractAddress,
  getAllNFTsForContract,
  getMarketplaceAvatarsForSale,
  userWalletAddress: string,
  marketplaceAvatars: IFetchMarketItems[] = undefined
): Promise<any[]> => {
  let nftTokenIdsFromUserWallet = [];
  const avatarTokenAddress = await getContractAddress(ContractTypeEnum.Avatar);
  const avatarsFromWallet: GetNFTsForContractResultModel[] = await getAllNFTsForContract(Moralis, avatarTokenAddress);
  console.log('avatars in user wallet - result', avatarsFromWallet);

  let marketplaceItems: IFetchMarketItems[] = marketplaceAvatars
    ? marketplaceAvatars
    : await getMarketplaceAvatarsForSale(MoralisWeb3API);
  marketplaceItems = marketplaceItems.filter(
    m => m.sold == false && m.seller.toLowerCase() == userWalletAddress.toLowerCase()
  );
  console.log('avatar for sale in marketplace - result, ', marketplaceItems);

  if (avatarsFromWallet && avatarsFromWallet.length > 0) {
    const avatarsFromWalletTokenIds = avatarsFromWallet.map(a => a.token_id);

    nftTokenIdsFromUserWallet = nftTokenIdsFromUserWallet.concat(avatarsFromWalletTokenIds);
  }

  if (marketplaceItems && marketplaceItems.length > 0) {
    marketplaceItems?.forEach(mktItem => {
      if (!nftTokenIdsFromUserWallet.includes(mktItem.tokenId)) {
        nftTokenIdsFromUserWallet.push(mktItem.tokenId);
      }
    });
  }
  console.log('avatar - user wallet + marketplace - merge result', nftTokenIdsFromUserWallet);

  if (nftTokenIdsFromUserWallet && nftTokenIdsFromUserWallet.length > 0) {
    return nftTokenIdsFromUserWallet;
  } else {
    return undefined;
  }
};

const OwnedAvatarPage: NextPage = () => {
  const { getContractAddress } = useContractAddressStore();
  const { getAllNFTsForContract, getMarketplaceAvatarsForSale } = useWalletStore();
  const { getProfile } = useAppStore();
  const { Moralis, isAuthenticated, isInitialized, account } = useMoralis();
  const { native } = useMoralisWeb3Api();
  const { t } = useTranslation();

  const [owner, setOwner] = useState<IProfile>();
  const [allAvatarIds, setAllAvatarIds] = useState([]);
  const [currentAvatar, setCurrentAvatar] = useState<IAvatar>();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, showLoading] = useState(true);

  const fetchMoreAvatars = async () => {
    if (avatars.length < allAvatarIds.length) {
      const newSortedAvatarsIds = allAvatarIds.slice(avatars.length, avatars.length + PAGE_SIZE);

      const marketplaceItems: IFetchMarketItems[] = await getMarketplaceAvatarsForSale(native);

      const newAvatarResults = await mapAvatar(Moralis, newSortedAvatarsIds, marketplaceItems, account, account);
      console.log('avatar next page results', newAvatarResults);

      if (newAvatarResults) {
        let nextAvatars = [];

        for (const avatarData of newAvatarResults) {
          const avatarAlreadyOnCarousel = avatars.find(h => h.tokenId == avatarData.tokenId);

          if (avatarAlreadyOnCarousel) continue;

          nextAvatars.push(avatarData);
        }

        setAvatars([...avatars, ...nextAvatars]);
      }
    }
  };

  const init = async () => {
    // console.log('account wallet address', account);
    let userWalletAddress = undefined;
    const user = await getProfile(account);
    if (user) {
      setOwner(user);
      userWalletAddress = user.walletAddress;
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
      userWalletAddress = account;
    }

    let marketplaceItems: IFetchMarketItems[] = await getMarketplaceAvatarsForSale(native);
    let nftTokenIdsFromUserWallet = await getAvatarTokensFromUserWalletAndMarketplace(
      Moralis,
      native,
      getContractAddress,
      getAllNFTsForContract,
      getMarketplaceAvatarsForSale,
      userWalletAddress,
      marketplaceItems
    );

    if (nftTokenIdsFromUserWallet && nftTokenIdsFromUserWallet.length > 0) {
      nftTokenIdsFromUserWallet = nftTokenIdsFromUserWallet.sort(function (a, b) {
        return b - a;
      });
      setAllAvatarIds(nftTokenIdsFromUserWallet);

      let avatarList = await mapAvatar(
        Moralis,
        nftTokenIdsFromUserWallet.slice(0, PAGE_SIZE),
        marketplaceItems,
        account,
        account
      );

      setAvatars(avatarList);
      setCurrentAvatar(avatarList[0]);
      showLoading(false);
    } else {
      setAvatars([]);
      setCurrentAvatar(null);
      showLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) {
        if (account) {
          init();
        }
      } else {
        showLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isInitialized, account]);

  const handleSelectAvatar = (avatar: IAvatar) => {
    setCurrentAvatar(avatar);
  };

  if (isLoading) return <Loader />;

  return isAuthenticated && currentAvatar?.tokenId ? (
    <AvatarPage
      currentNFT={currentAvatar}
      subtitle={currentAvatar.collectionName}
      owner={owner}
      ownedNFTs={avatars}
      onSelectCarousel={handleSelectAvatar}
      fetchMoreOwnedNFTs={fetchMoreAvatars}
      totalOwnedNFTs={allAvatarIds.length}
    />
  ) : isAuthenticated ? (
    <StaticPage backgroundImage="/images/avatar-bg.png">
      <img className="h-20 w-auto" src="/images/logos/silks.svg" alt="Silks" />
      <h1 className="font-bold text-3xl">{t('avatar.noAvatar.title')}</h1>
      <p>{t('avatar.noAvatar.subtitle')}</p>
      <Button
        color="market"
        onClick={() => {
          window.location.href = '/marketplace';
        }}
        fill="solid"
        notch="right"
      >
        {t('avatar.noAvatar.button')}
      </Button>
    </StaticPage>
  ) : (
    <StaticPage backgroundVideo={`${process.env.NEXT_PUBLIC_ASSETS_BASE_URL}/video/silks-intro.mp4`}>
      <img className="h-20 w-auto" src="/images/logos/silks.svg" alt="Silks" />
      <h1 className="font-bold text-3xl">{t('avatar.disconnected.title')}</h1>
      {/* <p>{t('avatar.disconnected.subtitle')}</p> */}
      <Account />
    </StaticPage>
  );
};

export default OwnedAvatarPage;
