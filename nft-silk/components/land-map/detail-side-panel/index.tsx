import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMoralis } from 'react-moralis';
import { filter } from 'lodash-es';
import clsx from 'clsx';

import api from '@common/api';
import { Icon } from '@components/icons';
import { Button } from '@components/button';
import { OwnedBy } from '@components/owned-by';
import { Skeleton } from '@components/skeleton';
import useTranslation from '@hooks/useTranslation';
import useAppStore from '@hooks/useAppStore';
import useWalletStore from '@hooks/useWalletStore';
import useContractAddressStore, { ContractTypeEnum } from '@hooks/useContractAddressStore';

import styles from './detail-side-panel.module.scss';
import { BuyModalWithoutDataComponent } from '@components/marketplace/buy-modal';
import { MetaverseButton } from '@components/metaverse-button';
import { isBuyDisabled } from '@common/contractStateCfg';

export type DetailSidePanelProps = {
  land: ILand | IFarm;
  isOpen: boolean;
  onClose: (value) => void;
  onDevelopFarm: (land: ILand) => void;
};

export const DetailSidePanel = ({ land, isOpen, onClose, onDevelopFarm, ...props }: DetailSidePanelProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isFarm, setIsFarm] = useState<boolean>(false);
  const [tokenImage, setTokenImage] = useState<string>(null);
  const [tokenName, setTokenName] = useState<string>(null);
  const [tokenOwnerAddress, setTokenOwnerAddress] = useState<string>(null);
  const [tokenOwner, setTokenOwner] = useState<any>(null);
  const [tokenPrice, setTokenPrice] = useState<number>(null);
  const [tokenPriceUsd, setTokenPriceUsd] = useState<number>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPriceLoading, setIsPriceLoading] = useState<boolean>(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const { chainId, Moralis } = useMoralis();
  const { profile } = useAppStore();
  const { getContractAddress } = useContractAddressStore();
  const { getNFTByTokenId, getNFTMetadata, getTokenPrice, getAllNFTsForContract, getEthInUsdWithoutTokenPrice } =
    useWalletStore();

  const handleAboutLandClick = () => {
    const type = 'isPublic' in land ? 'farm' : 'land';
    router.push(`/map/${type}/${land.tokenId}`);
  };

  useEffect(() => {
    const isFarmLand = land && 'isPublic' in land;

    const getTokenData = async tokenId => {
      try {
        const tokenContractAddress = await getContractAddress(
          isFarmLand ? ContractTypeEnum.Farm : ContractTypeEnum.Land
        );
        const tokenData = await getNFTByTokenId(Moralis, tokenContractAddress, tokenId, chainId);

        if (tokenData?.owner_of) {
          console.log(tokenData);

          setTokenOwnerAddress(tokenData?.owner_of);
          await getOwnerData(tokenData?.owner_of);

          if (!isFarmLand) {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        setTokenName('');
        setIsLoading(false);
      }
    };

    const getTokenApiData = async tokenId => {
      try {
        const { data } = await api.get<IFarm>(`api/${isFarmLand ? 'farmnfts' : 'landnfts/land'}/${tokenId}`);

        if (data) {
          if (isFarmLand) {
            if (data?.name) {
              // remove silksfarm wrapping of name
              let name = data.name.replace('SILKSFARM (', '');

              if (name.lastIndexOf(')') === name.length - 1) {
                name = name.slice(0, -1);
              }

              setTokenName(name);
            } else {
              let count = filter(data.properties, p => p.trait_type.toLowerCase().indexOf('land x') > -1).length;
              setTokenName(`${count} ${t('landUnitDetail.defaultFarmTitle')}`);
            }
          }

          setTokenImage(data?.image || land?.image);
        }
      } catch (error) {
        if (isFarmLand) {
          setTokenName(t('landUnitDetail.defaultFarmTitle'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    const getOwnerData = async walletAddress => {
      try {
        if (walletAddress !== null && walletAddress !== profile?.walletAddress) {
          const { data } = await api.get<IProfile>(`/api/userRegistration/byWallet/${walletAddress}`);

          if (data) {
            setTokenOwner(data);
          }
        } else {
          setTokenOwner(profile);
        }
      } catch (error) {}

      setIsLoading(false);
    };

    const getPriceUsd = async () => {
      try {
        const priceData = await getEthInUsdWithoutTokenPrice(Moralis, land.price);

        setTokenPriceUsd(priceData);
      } catch (error) {
        setTokenPriceUsd(null);
      } finally {
        setIsPriceLoading(false);
      }
    };

    setTokenImage(null);
    setTokenOwnerAddress(null);
    setTokenOwner(null);
    setTokenPrice(null);
    setTokenName(null);
    setTokenPriceUsd(null);
    setIsFarm(isFarmLand);

    setIsLoading(true);
    setIsPriceLoading(true);

    if (land?.tokenId) {
      if (!isFarmLand) {
        setTokenName(t('landUnitDetail.defaultLandTitle'));
      }

      getTokenData(land.tokenId);
      getTokenApiData(land.tokenId);

      if (land.price) {
        getPriceUsd();
        setTokenPrice(land.price);
      } else {
        setIsPriceLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [land]);

  useEffect(() => {
    if (!isOpen) {
      setTokenOwnerAddress(null);
      setTokenOwner(null);
      setTokenName(null);
      setTokenPriceUsd(null);
      setTokenPrice(null);
    }
  }, [isOpen]);

  return (
    <div className={clsx(styles.container, { [styles.open]: isOpen })}>
      <div
        className={clsx(
          'flex flex-col text-white p-4 pb-8 text-left bg-blue-700 overflow-auto transform transition-all'
        )}
      >
        <div className="cursor-pointer z-40 mt-1 fixed right-0">
          <Icon
            name="close"
            className="inline-block w-4 h-4 mr-3"
            color="var(--color-gray)"
            onClick={() => {
              onClose(null);
            }}
            data-test="modal-close"
          />
        </div>

        <div className="flex flex-row gap-4">
          <div className={clsx('font-bold text-2xl', styles.title, { [styles.farmTitle]: isFarm })}>
            {tokenName || <Skeleton className="w-[175px]" />}
          </div>
          {land && isFarm && (
            <span
              className={clsx(
                'h-[32px] text-white text-xs rounded-full px-2 flex flex-row items-center',
                (land as IFarm).isPublic == false ? 'bg-orange-500' : 'bg-green-500'
              )}
            >
              {(land as IFarm).isPublic == false ? (
                <>
                  <Icon name="lock-closed" className="w-3 h-3 mr-1" />
                  {t('landUnitDetail.private')}
                </>
              ) : (
                <>
                  <Icon name="lock-open" className="w-4 h-4 mr-1" />
                  {t('landUnitDetail.public')}
                </>
              )}
            </span>
          )}
        </div>

        <div className="flex flex-row gap-2 text-xs mt-2">
          {!isFarm && land?.coords && <div className="font-bold">{land.coords?.x + ', ' + land.coords?.y}</div>}
          {land?.type && (
            <div>
              {t('landUnitDetail.region')}: <span className="font-bold">{land.type}</span>
            </div>
          )}
        </div>

        <div className="mt-2 relative">
          {tokenImage && (
            <>
              <img src={tokenImage} alt="" width={isFarm ? '325px' : 'auto'} />
              {isFarm && <MetaverseButton land={land as IFarm} />}
            </>
          )}
          {!tokenImage && <Skeleton height={isFarm ? 325 : 388} />}
        </div>

        <div className="h-[48px]">
          {tokenOwnerAddress && !isLoading && (
            <OwnedBy
              className="mt-2"
              avatarTokenId={tokenOwner?.defaultAvatar}
              address={tokenOwnerAddress}
              userName={tokenOwnerAddress === profile?.walletAddress ? t('details.you') : tokenOwner?.username || ' '}
              dynasty={tokenOwner?.dynastyName || ''}
            />
          )}
          {isLoading && land?.tokenId && (
            <div className="flex flex-row mt-1">
              <Skeleton circle={true} className="w-[40px] h-[40px]" />

              <div className="text-xs flex flex-col justify-center ml-3">
                <Skeleton className="w-[150px]" />
                <Skeleton className="w-[150px]" />
              </div>
            </div>
          )}
        </div>

        {isPriceLoading ? (
          <></>
        ) : tokenPrice ? (
          <div className="flex flex-row items-end mt-6">
            <div className="mb-1">
              <img src="/images/eth.svg" alt="Eth" />
            </div>
            <div className="ml-2">
              <div className="text-gray-400 text-xs font-bold">{t('landUnitDetail.currentPrice')}</div>
              <div>
                <span className="text-xl font-bold mr-2">{`${tokenPrice}`}</span>
                {tokenPriceUsd && `(${tokenPriceUsd})`}
              </div>
            </div>
          </div>
        ) : (
          <div className="ml-12 mt-2">{t('landUnitDetail.unlisted')}</div>
        )}

        {/* {!isFarm && land?.isOwned && (
          <Button
            color="primary"
            fill="solid"
            notch="none"
            className="mt-3"
            short={true}
            full={true}
            onClick={() => {
              onDevelopFarm(land);
            }}
          >
            {t('landUnitDetail.developFarm')}
          </Button>
        )} */}

        <div className="flex flex-row justify-around items-center mt-3">
          <Button
            color="primary"
            fill="solid"
            notch="both"
            className="mr-4"
            onClick={() => {
              handleAboutLandClick();
            }}
          >
            {t('landUnitDetail.aboutLand')}
          </Button>
          {!isBuyDisabled && tokenPrice && (
            <>
              <Button
                color="market"
                fill="solid"
                notch="both"
                className=""
                onClick={() => setIsBuyModalOpen(!isBuyModalOpen)}
              >
                {t('landUnitDetail.buyNow')}
              </Button>
              <BuyModalWithoutDataComponent
                isOpen={isBuyModalOpen}
                isOpenEvent={setIsBuyModalOpen}
                contractType={land.collectionType}
                tokenId={land.tokenId}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
