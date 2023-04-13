/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';

import { Button } from '@components/button';
import { Loader } from '@components/loader';
import { AvatarPage } from '@components/pages/avatar-page';
import { StaticPage } from '@components/pages/static-page';
import { useRouter } from 'next/router';
import useContractAddressStore, { ContractTypeEnum } from '@hooks/useContractAddressStore';
import useWalletStore from '@hooks/useWalletStore';
import useTranslation from '@hooks/useTranslation';
import { mapAvatar } from '@pages/avatar';
import { getUserRegistrationByWallet } from '@common/api/portal/userRegistration';

const AvatarMarketPage: NextPage = () => {
  const router = useRouter();

  const [currentAvatar, setCurrentAvatar] = useState<IAvatar>();
  const [isLoading, showLoading] = useState(true);
  const [owner, setOwner] = useState<IProfile>();
  const { getContractAddress } = useContractAddressStore();
  const { getMarketplaceAvatarsForSale, getNftOwner, getNftCollectionName } = useWalletStore();
  const { Moralis, isInitialized, account, isAuthenticated } = useMoralis();
  const { native } = useMoralisWeb3Api();
  const [nftNotFound, setNftNotFound] = useState(false);
  const { t } = useTranslation();

  const getAvatarDetails = async avatarId => {
    if (!avatarId) return;

    const avatarTokenAddress = await getContractAddress(ContractTypeEnum.Avatar);
    const nftOwner = await getNftOwner(native, avatarTokenAddress, avatarId);

    const marketplaceItems: IFetchMarketItems[] = await getMarketplaceAvatarsForSale(native);
    const nftMarketData: IFetchMarketItems = marketplaceItems.find(m => m.tokenId == avatarId && m.sold == false);
    console.log('NFT MKT', nftMarketData);

    const currentNftOwner = nftMarketData ? nftMarketData.seller.toLowerCase() : nftOwner;

    if (!nftOwner) {
      console.log("Can't find NFT");
      setNftNotFound(true);
      return;
    }

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

    const nextAvatar = await mapAvatar(
      Moralis,
      [avatarId],
      nftMarketData ? [nftMarketData] : [],
      currentNftOwner,
      account
    );

    if (nextAvatar) {
      setCurrentAvatar(nextAvatar[0]);
      setNftNotFound(false);
    } else {
      setNftNotFound(true);
    }
    return;
  };

  const fromPage = useMemo(() => router.query.p, [router.query]);

  useEffect(() => {
    showLoading(true);
    if (router?.query?.avatarId && isInitialized) {
      if (isAuthenticated && !account) {
        return;
      }
      console.log('ACCOUNT LOGGED IN', account);

      const avatarId = router.query.avatarId as string;

      getAvatarDetails(avatarId).then(() => showLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.query?.avatarId, isInitialized, isAuthenticated, account]);

  return isLoading ? (
    <Loader />
  ) : nftNotFound ? (
    <StaticPage backgroundImage="/images/avatar-bg.png">
      <img className="h-20 w-auto" src="/images/logos/silks.svg" alt="Silks" />
      <h1 className="font-bold text-3xl">{t('avatar.notFound.title')}</h1>
      <p>{t('avatar.notFound.subtitle')}</p>
      <Button
        color="market"
        onClick={() => {
          window.location.href = '/marketplace';
        }}
        fill="solid"
        notch="right"
      >
        {t('avatar.notFound.button')}
      </Button>
    </StaticPage>
  ) : currentAvatar?.tokenId ? (
    <AvatarPage
      owner={owner}
      currentNFT={currentAvatar}
      subtitle={currentAvatar.collectionName}
      backUrl={fromPage ? `/marketplace?p=${fromPage}` : '/marketplace'}
    />
  ) : (
    <div className="text-white">404</div>
  );
};

export default AvatarMarketPage;
