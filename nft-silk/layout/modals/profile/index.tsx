/* eslint-disable @next/next/no-img-element */
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMoralis } from 'react-moralis';

import api from '@common/api';
import useAppStore from '@hooks/useAppStore';
import useTranslation from '@hooks/useTranslation';
import { Button } from '@components/button';
import { ConfirmModal } from '@components/modals/confirm-modal';
import { FullScreenModal } from '@components/modals/full-screen-modal';
import { Icon } from '@components/icons';

import ProfileForm from './form';

import styles from './profile.module.scss';

export type ProfileProps = {
  [props: string]: any;
};

export const Profile: FunctionComponent<ProfileProps> = ({ ...props }) => {
  const router = useRouter();
  const { emailId } = router.query;
  const { account } = useMoralis();
  const [verified, setVerified] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [emailAlreadyVerified, setEmailAlreadyVerified] = useState(false);
  const [showResendConfirm, setShowResendConfirm] = useState(false);

  const {
    profile,
    showProfileModal,
    setShowProfileModal,
    showEmailVerificationModal,
    setShowEmailVerificationModal,
    setShowSettingsModal,
    setProfile,
    isEmailJustVerified,
    setisEmailJustVerified,
  } = useAppStore();
  const trans = useTranslation();

  useEffect(() => {
    const verifyEmail = async () => {
      if (profile && emailId) {
        try {
          // user already verified, show verified page
          if (profile.isEmailVerified) {
            if (!isEmailJustVerified) {
              setEmailAlreadyVerified(true);
            }
          } else {
            // verify email address
            const response = await api.get(`/api/userRegistration/verify-email/${emailId}`);
            if (response.status == 200) {
              setProfile(response.data);
              setVerified(true);
              setisEmailJustVerified(true);
            } else {
              setVerified(false);
            }
          }
        } catch (error) {
          setVerified(false);
        }

        router.replace(router.pathname, undefined, { shallow: true });

        setShowProfileModal(true);
        onScrollToTop();
      }
    };

    verifyEmail();
  }, [emailId, profile, router, setShowProfileModal]);

  const onResendEmail = async () => {
    if (account) {
      try {
        await api.get(`/api/userRegistration/resend-verification-email/${account}`);
        setShowResendConfirm(true);
      } catch (error) {}
    }
  };

  const onCloseModal = () => {
    setShowModal(false);
    onScrollToTop();

    // some UI elements depend on these, setTimeout until after modal closes to not affect UI
    setTimeout(() => {
      setVerified(null);
      setShowProfileModal(false);
      setShowEmailVerificationModal(false);
    }, 300);
  };

  const onShowProfile = () => {
    setVerified(null);
    setShowEmailVerificationModal(false);
    setShowProfileModal(true);
    onScrollToTop();
  };

  useEffect(() => {
    if (showEmailVerificationModal || showProfileModal) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [showEmailVerificationModal, showProfileModal]);

  const onScrollToTop = () => {
    const modalTop = document.querySelector('#full-screen');
    modalTop?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <FullScreenModal
        className="overflow-y-auto"
        onClose={onCloseModal}
        isOpen={showModal}
        background="url('images/fullscreen-modal-background.png')"
      >
        <div className="flex justify-between items-center" id="full-screen">
          <img
            className="block h-10 w-auto ml-6 mt-4 opacity-0 sm:opacity-100"
            src="/images/logos/silks.svg"
            alt="Silks"
          />

          <div className={styles.profileImageHeader}>
            <div className="text-white z-10 pt-5 text-xl uppercase">{trans.t('profile.title')}</div>
          </div>

          <div className={`${styles.profileImageSubHeader} flex justify-center items-end`}>
            <div
              className="text-white z-10 flex justify-center items-center"
              style={{
                background: 'linear-gradient(180deg, #4583FF 0%, rgba(69, 131, 255, 0) 100%)',
                opacity: '0.8',
                transform: 'matrix(1, 0, 0, -1, 0, 0)',
                width: 67,
                height: 57,
              }}
            >
              <Icon name="user" className="h-6 w-6 mb-1" style={{ transform: 'matrix(1, 0, 0, -1, 0, 0)' }} />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div
            className="flex flex-col justify-center items-center text-white text-center max-w-screen-lg"
            style={{ marginTop: 125 }}
          >
            {emailAlreadyVerified === true && (
              <>
                <div className={styles.profileTitle}>{trans.t('profile.alreadyVerified.title')}</div>
                <div
                  className={`text-lg mb-5 ${styles.textLightGray}`}
                  dangerouslySetInnerHTML={{
                    __html: trans.t('profile.alreadyVerified.description'),
                  }}
                ></div>
                <div className="flex">
                  <Button
                    color="dark"
                    fill="solid"
                    notch="right"
                    chevrons="right"
                    className="mr-4 w-[368px]"
                    full={true}
                    onClick={() => {
                      onCloseModal();
                      setShowSettingsModal(true);
                    }}
                  >
                    {trans.t('profile.goToProfileSettings')}
                  </Button>
                </div>
                <div className="h-[150px]"></div>
              </>
            )}

            {verified === true && (
              <>
                <div className={styles.profileTitle}>{trans.t('profile.verified.title')}</div>

                <div
                  className={`text-lg mb-5 ${styles.textLightGray}`}
                  dangerouslySetInnerHTML={{
                    __html: trans.t('profile.verified.description'),
                  }}
                ></div>

                <div className="flex">
                  <Button
                    color="dark"
                    fill="solid"
                    notch="right"
                    chevrons="right"
                    className="mr-4 w-[368px]"
                    full={true}
                    onClick={() => {
                      onCloseModal();
                      setShowSettingsModal(true);
                    }}
                  >
                    {trans.t('profile.goToProfileSettings')}
                  </Button>
                </div>

                <div className="h-[150px]"></div>
              </>
            )}

            {verified === false && (
              <>
                <div className={styles.profileTitle}>{trans.t('profile.error.title')}</div>

                <div
                  className={`text-lg mb-5 ${styles.textLightGray}`}
                  dangerouslySetInnerHTML={{
                    __html: trans.t('profile.error.description', { email: profile?.email }),
                  }}
                ></div>

                <div className="flex">
                  <Button
                    color="dark"
                    fill="solid"
                    notch="left"
                    chevrons="left"
                    className="mr-4 w-[368px]"
                    full={true}
                    onClick={() => {
                      onShowProfile();
                    }}
                  >
                    {trans.t('profile.backToProfile')}
                  </Button>

                  <Button
                    color="primary"
                    fill="solid"
                    notch="right"
                    chevrons="right"
                    className="w-[368px]"
                    full={true}
                    onClick={() => {
                      onResendEmail();
                    }}
                  >
                    {trans.t('profile.resend')}
                  </Button>
                </div>

                <div className="h-[150px]"></div>
              </>
            )}

            {showEmailVerificationModal && (
              <>
                <div className={styles.profileTitle}>{trans.t('profile.verify.title')}</div>

                <div
                  className={`text-lg mb-5 ${styles.textLightGray}`}
                  dangerouslySetInnerHTML={{
                    __html: trans.t('profile.verify.description'),
                  }}
                ></div>

                <div className="flex">
                  <Button
                    color="dark"
                    fill="solid"
                    notch="left"
                    chevrons="left"
                    className="mr-4 w-[368px]"
                    full={true}
                    onClick={() => {
                      onShowProfile();
                    }}
                  >
                    {trans.t('profile.backToProfile')}
                  </Button>

                  <Button
                    color="primary"
                    fill="solid"
                    notch="right"
                    chevrons="right"
                    className="w-[368px]"
                    full={true}
                    onClick={() => {
                      onResendEmail();
                    }}
                  >
                    {trans.t('profile.resend')}
                  </Button>
                </div>

                <div className="h-[150px]"></div>
              </>
            )}

            {verified === null && !showEmailVerificationModal && !emailAlreadyVerified && (
              <ProfileForm
                onSuccess={() => {
                  setShowEmailVerificationModal(true);
                  onScrollToTop();
                }}
              ></ProfileForm>
            )}
          </div>
        </div>

        <div className="flex justify-center text-white py-20">
          <div className="max-w-screen-sm">
            <div className="relative pb-9">
              <div className={styles.infoDot}>
                <Icon name="info" className="h-5 w-5 ml-[10px] mt-[10px]" />
              </div>
              <hr className={styles.infoHr} />
            </div>

            <div
              className={`${styles.textLightGray} text-sm text-center`}
              dangerouslySetInnerHTML={{
                __html: trans.t('profile.info'),
              }}
            ></div>
          </div>
        </div>
      </FullScreenModal>

      <ConfirmModal
        isOpen={showResendConfirm}
        title="Verification Email Resent"
        confirmButtonText="Ok"
        onClose={() => {
          setShowResendConfirm(false);
        }}
      >
        {trans.t('profile.emailSent', { email: profile?.email })}
      </ConfirmModal>
    </>
  );
};
