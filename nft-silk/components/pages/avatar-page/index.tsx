import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { IFrameViewButton } from '@components/iframe-view-button';
import useTranslation from '@hooks/useTranslation';
import DetailsPage from '@components/pages/details-page';
import DefaultNFTTabs from '@components/nft-types/nft-tabs/default-NFT-tabs';

import styles from './avatar-page.module.scss';
import { updateDefaultProfileAvatar } from '@common/api/portal/userRegistration';
import useAppStore from '@hooks/useAppStore';

const AVATAR_PLACEHOLDER_IMAGE: string = '/images/avatar-placeholder.jpg';

export type AvatarPageProps = {
  currentNFT: IAvatar;
  owner?: IProfile;
  ownedNFTs?: IAvatar[];
  onSelectCarousel?: Function;
  backUrl?: string;
  currentPrice?: number;
  subtitle?: any;
  totalOwnedNFTs?: number;
  fetchMoreOwnedNFTs?: Function;
};

export const AvatarPage: FunctionComponent<AvatarPageProps> = props => {
  const isCollection = useMemo(() => Boolean(props.ownedNFTs), [props.ownedNFTs]);

  const [isPrimaryButtonDisabled, setIsPrimaryButtonDisabled] = useState<boolean>();
  const [owner, setOwner] = useState<IProfile>();

  const { profile, getProfile } = useAppStore();
  const { t } = useTranslation();

  const updateDefaultProfileAvatarTokenId = async (userRegistrationId, avatarTokenId) => {
    const profile = await updateDefaultProfileAvatar(userRegistrationId, avatarTokenId);

    if (profile) {
      await getProfile(profile.walletAddress);
    }
  };

  useEffect(() => {
    if (profile?.walletAddress.toLowerCase() == props.owner?.walletAddress.toLowerCase()) {
      setOwner(profile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.defaultProfileAvatarTokenId]);

  useEffect(() => {
    if (props.owner) {
      setOwner(props.owner);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DetailsPage
      currentNFT={props.currentNFT}
      owner={owner}
      ownedNFTs={props.ownedNFTs}
      fetchMoreOwnedNFTs={props.fetchMoreOwnedNFTs}
      totalOwnedNFTs={props.totalOwnedNFTs}
      onSelectCarousel={props.onSelectCarousel}
      backUrl={props.backUrl}
      title={
        <>
          <div className="flex mt-4">
            <div className="font-bold text-4xl">{props.currentNFT.name}</div>
            {owner?.userRegistrationId > 0 && props.backUrl == undefined && (
              <div className="flex items-center justify-center">
                {owner.defaultProfileAvatarTokenId && owner.defaultProfileAvatarTokenId == props.currentNFT.tokenId ? (
                  <button
                    className="ml-4 flex items-center justify-center outline outline-1 outline-blue text-xs text-white bg-blue p-2 h-7 rounded"
                    disabled={true}
                  >
                    {t('avatar.primary')}
                  </button>
                ) : (
                  <button
                    className="ml-4 flex items-center justify-center outline outline-1 outline-blue text-xs text-blue p-2 h-7 rounded hover:text-white hover:bg-blue"
                    disabled={isPrimaryButtonDisabled}
                    onClick={async () => {
                      setIsPrimaryButtonDisabled(true);
                      updateDefaultProfileAvatarTokenId(owner.userRegistrationId, props.currentNFT.tokenId).then(() =>
                        setIsPrimaryButtonDisabled(false)
                      );
                    }}
                  >
                    {t('avatar.setAsPrimary')}
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      }
      subtitle={props.subtitle}
      carouselPlaceholder={AVATAR_PLACEHOLDER_IMAGE}
      carouselLabel={t('avatar.carouselLabel')}
      bgStyle={clsx(styles.backdrop, styles.comb)}
      NFTTabsComponent={<DefaultNFTTabs currentNFT={props.currentNFT} isCollection={isCollection} />}
    >
      <>
        <div className={styles.avatarSilkContent}>
          <img src={props.currentNFT?.crest} alt="Crest" />
        </div>
        <img
          className={clsx('absolute bottom-0 sm:max-w-[900px] max-h-full', styles.avatar)}
          src={props.currentNFT?.posedAvatar}
          alt="avatar"
        />

        <div className="absolute left-0 gap-3 top-20 flex flex-col z-10 bg-gradient-to-b from-blue-700 to-transparent p-2 pl-0 rounded hover:w-[160px]">
          <IFrameViewButton src={props.currentNFT?.horseIframe} type="horse" />
          <IFrameViewButton src={props.currentNFT?.avatarIframe} type="avatar" />
        </div>
      </>
    </DetailsPage>
  );
};
