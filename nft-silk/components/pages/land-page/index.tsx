import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import styles from './land-page.module.scss';
import DetailsPage from '@components/pages/details-page';
import DefaultNFTTabs from '@components/nft-types/nft-tabs/default-NFT-tabs';
import useTranslation from '@hooks/useTranslation';

export type LandPageProps = {
  currentNFT: ILand;
  owner?: IProfile;
  ownedNFTs?: ILand[];
  onSelectCarousel?: Function;
  backUrl?: string;
  backLabel?: string;
  currentPrice?: number;
  subtitle?: any;
};

const renderSubtitle = (t, land) => (
  <div className="flex flex-row gap-2 text-xs mt-2">
    <div className="font-bold">{land.coords?.x + ', ' + land.coords?.y}</div>
    <div className="">
      {t('land.region')}: <span className="font-bold">{land.type}</span>
    </div>
  </div>
);

export const LandPage: FunctionComponent<LandPageProps> = props => {
  const { t } = useTranslation();

  return (
    <DetailsPage
      currentNFT={props.currentNFT}
      owner={props.owner}
      backUrl={props.backUrl}
      backLabel={props.backLabel || t('details.backToMarketplace')}
      bgStyle={styles.background}
      subtitle={renderSubtitle(t, props.currentNFT)}
      NFTTabsComponent={<DefaultNFTTabs currentNFT={props.currentNFT} />}
    >
      <div className={clsx('align-center justify-center sm:max-w-full pt-10', styles.land)}>
        <div>
          <img src={props.currentNFT.image} className={styles.landImage} alt="" />
        </div>
      </div>
    </DetailsPage>
  );
};
