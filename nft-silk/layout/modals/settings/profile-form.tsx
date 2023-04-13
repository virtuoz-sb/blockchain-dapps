import React, { FunctionComponent, useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';

import api from '@common/api';
import useWalletStore from '@hooks/useWalletStore';
import useAppStore from '@hooks/useAppStore';
import useTranslation from '@hooks/useTranslation';
import { Button } from '@components/button';
import { TextArea } from '@components/inputs/text-area';
import { TextInput } from '@components/inputs/text-input';

import styles from './settings.module.scss';
import { NFTCarouselV2, NFTCarouselV2Item } from '@components/nft-carousel/nft-carousel-v2';
import { getAvatarTokensFromUserWalletAndMarketplace } from '@pages/avatar';
import useContractAddressStore from '@hooks/useContractAddressStore';
import { getAvatarDetail2 } from '@common/api/silks';
import { Loader } from '@components/loader';

const carousel_avatars_page_size = 25;

export type ProfileSettingsFormProps = {
  onSuccess: Function;
};

const ProfileSettingsForm: FunctionComponent<ProfileSettingsFormProps> = ({ onSuccess }) => {
  const { getContractAddress } = useContractAddressStore();
  const { getAllNFTsForContract, getMarketplaceAvatarsForSale } = useWalletStore();
  const { getProfile, profile } = useAppStore();
  const { Moralis, isAuthenticated, isInitialized, account } = useMoralis();
  const { native } = useMoralisWeb3Api();
  const { t } = useTranslation();

  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [isLoadingFullScreen, setIsLoadingFullScreen] = useState<boolean>();
  const [carouselAllAvatarIds, setCarouselAllAvatarIds] = useState([]);
  const [carouselAvatars, setCarouselAvatars] = useState([]);

  const ProfileSettingsSchema = Yup.object().shape({
    dynastyName: Yup.string()
      .min(3, t('settings.profile.errors.dynastyNameMin'))
      .max(25, t('settings.profile.errors.dynastyNameMax')),
  });

  const initialValues = {
    dynastyName: profile?.dynastyName || '',
    username: profile?.username || '',
    location: profile?.location || '',
    about: profile?.about || '',
    email: profile?.email || '',
    walletAddress: profile?.walletAddress || '',
    defaultProfileAvatarTokenId: profile?.defaultProfileAvatarTokenId || '',
  };

  const onSubmit = async (values, { setFieldError }) => {
    try {
      const response = await api.put('/api/userRegistration', {
        ...values,
        userRegistrationId: profile.userRegistrationId,
      });

      await getProfile(values.walletAddress);

      onSuccess();
    } catch (error) {
      const errorMessage = error?.response?.data?.errorMessage;

      // look for specific error messages from BE to show FE validation errors
      if (errorMessage) {
        if (errorMessage.indexOf('UserRegistration.IX_UserRegistration_DynastyName') > -1) {
          setFieldError('dynastyName', t('settings.profile.errors.dynastyNameExists'));
        }
      }

      const errors = error?.response?.data?.errors;

      if (errors) {
      }
    }
  };

  const fetchMoreAvatars = async () => {
    if (carouselAvatars.length < carouselAllAvatarIds.length) {
      const newSortedAvatarsIds = carouselAllAvatarIds.slice(
        carouselAvatars.length,
        carouselAvatars.length + carousel_avatars_page_size
      );
      const newAvatarResults = await getAvatarDetail2(newSortedAvatarsIds);

      if (newAvatarResults && newAvatarResults.totalItems && newAvatarResults.totalItems > 0) {
        let nextAvatars: NFTCarouselV2Item[] = [];

        for (const avatarData of newAvatarResults.items) {
          const avatarAlreadyOnCarousel = carouselAvatars.find(a => a.tokenId == avatarData.tokenId);

          if (avatarAlreadyOnCarousel) continue;

          nextAvatars.push({
            tokenId: avatarData.tokenId,
            imageThumbnail: avatarData.imageThumbnail,
          });
        }

        nextAvatars = nextAvatars.sort(function (a, b) {
          return b.tokenId - a.tokenId;
        });

        setCarouselAvatars([...carouselAvatars, ...nextAvatars]);
      }
    }
  };

  const initializeCarousel = async () => {
    let marketplaceItems: IFetchMarketItems[] = await getMarketplaceAvatarsForSale(native);
    let nftTokenIdsFromUserWallet = await getAvatarTokensFromUserWalletAndMarketplace(
      Moralis,
      native,
      getContractAddress,
      getAllNFTsForContract,
      getMarketplaceAvatarsForSale,
      account,
      marketplaceItems
    );

    let avatars: NFTCarouselV2Item[] = [];

    if (nftTokenIdsFromUserWallet && nftTokenIdsFromUserWallet.length > 0) {
      nftTokenIdsFromUserWallet = nftTokenIdsFromUserWallet.sort(function (a, b) {
        return b - a;
      });
      setCarouselAllAvatarIds(nftTokenIdsFromUserWallet);

      let isDefaultAvatarFoundOrNotExists = false;

      while (isDefaultAvatarFoundOrNotExists == false) {
        const sortedAvatarsIds = nftTokenIdsFromUserWallet.slice(
          avatars.length,
          avatars.length + carousel_avatars_page_size
        );

        const avatarMetadata = await getAvatarDetail2(sortedAvatarsIds);

        if (avatarMetadata && avatarMetadata.totalItems && avatarMetadata.totalItems > 0) {
          avatarMetadata.items.forEach(avatarMetadata => {
            avatars.push({
              tokenId: avatarMetadata.tokenId,
              imageThumbnail: avatarMetadata.imageThumbnail,
            });
          });

          if (profile?.defaultProfileAvatarTokenId > 0) {
            const avatarAlreadyOnCarousel = avatars.find(a => a.tokenId == profile.defaultProfileAvatarTokenId);

            if (avatarAlreadyOnCarousel) {
              isDefaultAvatarFoundOrNotExists = true;
            }
          } else {
            isDefaultAvatarFoundOrNotExists = true;
          }
        } else {
          isDefaultAvatarFoundOrNotExists = true;
        }
      }

      if (avatars.length > 0) {
        avatars = avatars.sort(function (a, b) {
          return b.tokenId - a.tokenId;
        });

        setCarouselAvatars(avatars);
      }
    } else {
      avatars.push({
        tokenId: null,
        imageThumbnail: '/images/avatar-placeholder.jpg',
      });
      setCarouselAvatars(avatars);
    }
  };

  useEffect(() => {
    if (isInitialized && isAuthenticated && account && profile && isFirstLoad) {
      setIsFirstLoad(false);
      setIsLoadingFullScreen(true);
      initializeCarousel().then(() => setIsLoadingFullScreen(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isAuthenticated, account, profile.defaultProfileAvatarTokenId]);

  return (
    <>
      {isLoadingFullScreen ? (
        <Loader />
      ) : (
        <>
          <div className={styles.settingsTitle}>{t('settings.profile.title')}</div>

          <div className={`text-lg mb-3 ${styles.textLightGray}`}>{t('settings.profile.subtitle')}</div>

          <Formik
            enableReinitialize
            onSubmit={onSubmit}
            initialValues={initialValues}
            validationSchema={ProfileSettingsSchema}
          >
            {({ dirty, isSubmitting, isValid, setFieldValue }) => {
              return (
                <Form className="w-3/4 mx-auto" data-test="settings-form">
                  <div className="flex flex-col">
                    <div className="w-[750px] mx-auto mb-12">
                      {carouselAvatars?.length > 0 && (
                        <div>
                          <div className={styles.carousel} />
                          <div className="pt-6 text-xl font-medium text-gray-100">
                            {t('settings.profile.primaryAvatarSelection')}
                          </div>
                          <div className="mr-4 ml-4">
                            <NFTCarouselV2
                              defaultSelected={profile?.defaultProfileAvatarTokenId}
                              items={carouselAvatars}
                              fetchMoreDataFunction={fetchMoreAvatars}
                              totalItems={carouselAllAvatarIds.length}
                              enableAutoFetchMoreData={true}
                              formikSetFieldValueFunction={setFieldValue}
                              formikSetFieldValueFieldName="defaultProfileAvatarTokenId"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <TextInput
                      id="defaultProfileAvatarTokenId"
                      name="defaultProfileAvatarTokenId"
                      data-test="defaultProfileAvatarTokenId"
                      editable={false}
                      className="hidden"
                    />
                    <TextInput
                      name="dynastyName"
                      placeholder={
                        initialValues.dynastyName
                          ? t('settings.profile.dynastyNameLabel')
                          : t('settings.profile.dynastyNameLabelEmpty')
                      }
                      isAutofocus
                      data-test="dynasty-name"
                      maxLength={25}
                    />
                    <TextInput
                      name="username"
                      placeholder={t('settings.profile.usernameLabel')}
                      data-test="username"
                      editable={false}
                    />
                    <TextInput
                      name="location"
                      placeholder={t('settings.profile.locationLabel')}
                      maxLength="30"
                      data-test="location"
                    />

                    <TextArea
                      name="about"
                      placeholder={t('settings.profile.aboutLabel')}
                      rows={6}
                      data-test="about"
                      maxLength={500}
                    />

                    <div className="flex flex-col pt-5 pb-20 items-center">
                      <div className="flex">
                        <Button
                          color="primary"
                          fill="solid"
                          notch="right"
                          chevrons="right"
                          buttonType="submit"
                          className="w-[170px]"
                          full={true}
                          disabled={!dirty || !isValid || isSubmitting}
                        >
                          {t('settings.profile.updateButton')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </>
      )}
    </>
  );
};

export default ProfileSettingsForm;
