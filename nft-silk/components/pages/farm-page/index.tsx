import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import styles from './farm-page.module.scss';
import DetailsPage from '@components/pages/details-page';
import useTranslation from '@hooks/useTranslation';
import { Icon } from '@components/icons';
import { MetaverseButton } from '@components/metaverse-button';
import HorseActions from '@components/horse-action';
import FarmNFTTabs from './farm-nft-tabs';

export type FarmPageProps = {
  currentNFT: IFarm;
  owner?: IProfile;
  ownedNFTs?: IFarm[];
  onSelectCarousel?: Function;
  coordinates?: ICoordinateModel[];
  stakedHorses?: IStakedHorse[];
  stableRequests?: IStableRequest[];
  backUrl?: string;
  backLabel?: string;
  currentPrice?: number;
  subtitle?: any;
  openSlots?: number;
};

const renderSubtitle = (t, farm: IFarm) => (
  <div className="flex flex-row gap-2 text-xs mt-2">
    <div className="font-bold">{farm.totalLandPieces} Acre Farm</div>
  </div>
);

export const FarmPage: FunctionComponent<FarmPageProps> = props => {
  const { t } = useTranslation();

  const { stakedHorses, stableRequests, coordinates } = props;

  return (
    <>
      <HorseActions />
      <DetailsPage
        currentNFT={props.currentNFT}
        owner={props.owner}
        backUrl={props.backUrl}
        backLabel={props.backLabel}
        bgStyle={styles.background}
        title={
          <div className="inline-flex items-center">
            <>
              {props.currentNFT.name}
              {props.currentNFT.isPublic ? (
                <>
                  <span className="inline-flex items-center h-8 px-3 py-0.5 ml-16 rounded-full text-xs font-medium bg-green-400">
                    <Icon name="padlockOpen" className="h-2 w-4 mr-1 mb-2" />
                    {t('farm.public')}
                  </span>
                  <span className="inline-flex items-center h-8 w-max px-3 py-0.5 ml-2 rounded-full text-xs font-medium border-2 border-green-500 text-green-500">
                    {props.openSlots} {t('farm.openSlots')}
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center h-8 px-3 py-0.5 ml-16 rounded-full text-xs font-medium bg-orange-400">
                  <Icon name="padlock" className="h-2 w-3 mr-1 mb-2" />
                  {t('farm.private')}
                </span>
              )}
            </>
          </div>
        }
        subtitle={renderSubtitle(t, props.currentNFT)}
        NFTTabsComponent={
          <FarmNFTTabs
            currentNFT={props.currentNFT}
            stakedHorses={stakedHorses}
            stableRequests={stableRequests}
            coordinates={coordinates}
          />
        }
      >
        <div className={clsx('align-center justify-center sm:max-w-full pt-10', styles.farm)}>
          <div>
            <img src={props.currentNFT.image} className={styles.farmImage} alt="" />
          </div>
          <div className="flex items-center justify-center mt-4">
            <MetaverseButton className="" land={props.currentNFT} />
            <span className="ml-4 text-yellow-300 font-bold">
              VISIT LAND <br />
              IN METAVERSE
            </span>
          </div>
        </div>
      </DetailsPage>
    </>
  );
};
