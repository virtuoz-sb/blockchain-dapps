/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';

import { Button } from '@components/button';
import { Loader } from '@components/loader';
import { HorsePage } from '@components/pages/horse-page';
import { StaticPage } from '@components/pages/static-page';
import { useRouter } from 'next/router';
import useContractAddressStore from '@hooks/useContractAddressStore';
import useWalletStore from '@hooks/useWalletStore';
import useTranslation from '@hooks/useTranslation';
import { mapHorse, mapHorseGovernance, mapHorsePartnership } from '@pages/stable';
import { getUserRegistrationByWallet } from '@common/api/portal/userRegistration';
import { gethorseNFTVWStable } from '@common/api/portal/marketplace';
import { MarketplaceUrlTypeEnum } from '@common/getInformationPerNftCollectionEnum';
import { returnCurrentNftOwnerProfile } from '@common/helpers/getIProfileHelper';

const HorseMarketPage: NextPage = () => {
  const router = useRouter();

  const [currentHorse, setCurrentHorse] = useState<IHorse>();
  const [isLoading, showLoading] = useState(true);
  const [owner, setOwner] = useState<IProfile>();
  const { getContractAddress } = useContractAddressStore();
  const { getMarketplaceHorsesForSale, getAllNFTsForContract, getMarketplaceAvatarsForSale } = useWalletStore();
  const { isAuthenticated, isInitialized, Moralis, account } = useMoralis();
  const { native } = useMoralisWeb3Api();
  const [nftNotFound, setNftNotFound] = useState(false);
  const { t } = useTranslation();

  const getHorseDetails = async (horseId, horseType) => {
    if (!horseId) return;

    const horseModel = await (await gethorseNFTVWStable([horseId]))?.items[0];
    console.log('horse data from portal API', horseModel);

    if (!horseModel) {
      console.log("Can't find horse NFT");
      setNftNotFound(true);
      return;
    }

    const marketplaceItems: IFetchMarketItems[] = await getMarketplaceHorsesForSale(native);
    const nftMarketData: IFetchMarketItems = marketplaceItems.find(m => m.tokenId == horseId && m.sold == false);
    console.log('horses for sell from marketplace', nftMarketData);

    const currentNftOwner = nftMarketData ? nftMarketData.seller.toLowerCase() : horseModel.nftOwnerWalletAddress;

    let mappedHorse: IHorse = await mapHorse(
      Moralis,
      native,
      getContractAddress,
      getAllNFTsForContract,
      getMarketplaceAvatarsForSale,
      currentNftOwner,
      account,
      [horseModel]
    ).then(horses => {
      return horses[0];
    });

    console.log('Mapped Horse', mappedHorse);

    if (mappedHorse.isFractionalized) {
      if (horseType == MarketplaceUrlTypeEnum.horseGovernance) {
        mappedHorse = await mapHorseGovernance(mappedHorse, account);
        const currentGovernanceOwner = mappedHorse.governanceData.nftOwnerWalletAddress;
        const getProfileFromPortal = await getUserRegistrationByWallet(currentGovernanceOwner);
        const nftOwner = await returnCurrentNftOwnerProfile(getProfileFromPortal, currentGovernanceOwner);
        setOwner(nftOwner);
      } else {
        mappedHorse = await mapHorsePartnership(mappedHorse, account);
        const currentPartnershipOwner = mappedHorse.partnershipData.nftOwnerWalletAddress;
        const getProfileFromPortal = await getUserRegistrationByWallet(currentPartnershipOwner);
        const nftOwner = await returnCurrentNftOwnerProfile(getProfileFromPortal, currentPartnershipOwner);
        setOwner(nftOwner);
      }
    } else {
      const getProfileFromPortal = await getUserRegistrationByWallet(currentNftOwner);
      const nftOwner = await returnCurrentNftOwnerProfile(getProfileFromPortal, currentNftOwner);
      setOwner(nftOwner);
    }

    setCurrentHorse(mappedHorse);
    setNftNotFound(false);

    return;
  };

  useEffect(() => {
    showLoading(true);
    if (router?.query?.horseId && isInitialized) {
      if (isAuthenticated && !account) {
        return;
      }
      console.log('ACCOUNT LOGGED IN', account);
      getHorseDetails(router.query.horseId as string, router?.query?.type as string).then(() => showLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.query?.horseId, isInitialized, isAuthenticated, account]);

  return isLoading ? (
    <Loader />
  ) : nftNotFound ? (
    <StaticPage backgroundImage="/images/horse-bg.png">
      <img className="h-20 w-auto" src="/images/logos/silks.svg" alt="Silks" />
      <h1 className="font-bold text-3xl">{t('horse.notFound.title')}</h1>
      <p>{t('horse.notFound.subtitle')}</p>
      <Button
        color="market"
        onClick={() => {
          window.location.href = '/marketplace';
        }}
        fill="solid"
        notch="right"
      >
        {t('horse.notFound.button')}
      </Button>
    </StaticPage>
  ) : currentHorse?.tokenId ? (
    <HorsePage owner={owner} currentNFT={currentHorse} backUrl={'/marketplace'} />
  ) : (
    <div className="text-white">404</div>
  );
};

export default HorseMarketPage;
