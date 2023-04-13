import React, { FunctionComponent, useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import DetailsPage from '@components/pages/details-page';
import { IFrameViewButton } from '@components/iframe-view-button';
import useTranslation from '@hooks/useTranslation';
import { Icon } from '@components/icons';
import { ContractTypeEnum } from '@hooks/useContractAddressStore';
import styles from './horse-page.module.scss';
import { Button } from '@components/button';
import { getHorseInfo } from '@common/api/portal/marketplace';
import HorseNFTTabs from './horse-nft-tabs';

const HORSE_PLACEHOLDER_IMAGE: string = '/images/horse-placeholder.jpg';

export type HorsePageProps = {
  currentNFT: IHorse;
  owner?: IProfile;
  ownedNFTs?: IHorse[];
  onSelectCarousel?: Function;
  backUrl?: string;
  subtitle?: any;
  totalOwnedNFTs?: number;
  fetchMoreOwnedNFTs?: Function;
};

export const HorsePage: FunctionComponent<HorsePageProps> = props => {
  const [totalOwners, setTotalOwners] = useState(0);
  const [moreInfo, setMoreInfo] = useState<string | undefined>(undefined);
  const { t } = useTranslation();
  const isCollection = useMemo(() => Boolean(props.ownedNFTs), [props.ownedNFTs]);

  useEffect(() => {
    if (props.currentNFT) {
      getTotalOwners();
      getMoreInfo(props.currentNFT.tokenId);
      //console.log("CURRENT NFT CHANGE", props.currentNFT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currentNFT]);

  const getMoreInfo = async (tokenId: number) => {
    const horseInfo = await getHorseInfo(tokenId);
    if (horseInfo.more_Information && horseInfo.more_Information !== '') {
      setMoreInfo(horseInfo.more_Information);
    }
  };

  const getTotalOwners = async () => {
    let totalOwners = [];
    if (
      props.currentNFT.collectionType == ContractTypeEnum.HorsePartnership &&
      props.currentNFT.syndicateTab.length > 0
    ) {
      props.currentNFT.syndicateTab.forEach(syndicate => {
        if (!totalOwners.includes(syndicate.owner)) {
          totalOwners.push(syndicate.owner);
        }
      });
    }
    setTotalOwners(totalOwners.length);
  };

  return (
    <DetailsPage
      currentNFT={props.currentNFT}
      owner={props.owner}
      ownedNFTs={props.ownedNFTs}
      fetchMoreOwnedNFTs={props.fetchMoreOwnedNFTs}
      totalOwnedNFTs={props.totalOwnedNFTs}
      onSelectCarousel={props.onSelectCarousel}
      NFTTabsComponent={<HorseNFTTabs currentNFT={props.currentNFT} isCollection={isCollection} />}
      backUrl={props.backUrl}
      carouselPlaceholder={HORSE_PLACEHOLDER_IMAGE}
      carouselLabel={t('horse.carouselLabelListMyHorses')}
      title={
        props.currentNFT.isFractionalized && (
          <div className="inline-flex items-center">
            {props.currentNFT.name}
            {props.currentNFT.collectionType == ContractTypeEnum.HorseGovernance ? (
              <span className="inline-flex items-center h-8 px-3 py-0.5 ml-16 rounded-full text-xs font-medium bg-purple-700">
                <Icon name="governance" className="h-3 w-5 mr-1 mb-2" />
                {t('horse.governance')}
              </span>
            ) : (
              <span className="inline-flex items-center h-8 px-3 py-0.5 ml-16 rounded-full text-xs font-medium bg-rose-900">
                <Icon name="partnership" className="h-2 w-4 mr-1 mb-2" />
                {t('horse.partnership')}
              </span>
            )}
          </div>
        )
      }
      subtitle={
        <>
          <div className="flex flex-row gap-4">
            <span>{props.currentNFT.collectionName}</span>
            <span className="font-normal">#{props.currentNFT.tokenId}</span>

            <div>
              <span className="font-normal">{t('horse.farm')}: </span>
              {props.currentNFT.farmLink ? (
                <a href={props.currentNFT.farmLink} className="text-blue underline">
                  {props.currentNFT.farmName}
                </a>
              ) : (
                <span className="text-blue">{t('horse.communityFarm')}</span>
              )}
            </div>
          </div>
          {props.currentNFT.collectionType == ContractTypeEnum.HorsePartnership && (
            <div className="mt-3 flex items-center space-x-2">
              <Icon name="owners" className="h-6 w-6 pt-1" />
              <p className="text-gray-300 font-medium">{totalOwners} owners</p>
            </div>
          )}
        </>
      }
    >
      <div className={clsx('align-center justify-center sm:max-w-full pt-10', styles.horse)}>
        <div>
          <img src={props.currentNFT.image} className={styles.horseImage} alt="horse" />
        </div>
      </div>

      <div className="absolute left-0 gap-3 top-20 flex flex-col z-10 bg-gradient-to-b from-blue-700 to-transparent p-2 rounded hover:w-[160px]">
        <IFrameViewButton src={props.currentNFT?.iframeUrl} type="avatar" />
        {moreInfo && (
          <div className="group relative">
            <Button
              fill="outline"
              color="default"
              notch="right"
              icon={<Icon name={'learn-more'} />}
              onClick={() => window.open(moreInfo, '_blank')}
            />
            <div className="absolute top-4 left-[4rem] text-white text-xs whitespace-nowrap hidden group-hover:block">
              {t('horse.learnMore')}
            </div>
          </div>
        )}
      </div>
    </DetailsPage>
  );
};
