import React, {FunctionComponent, useState, useEffect, useMemo, ReactNode, FC} from 'react';
import Link from 'next/link';
import { useMoralis } from 'react-moralis';
import { NFTCarousel } from '@components/nft-carousel';
import { Button } from '@components/button';
import { Icon } from '@components/icons';
import useTranslation from '@hooks/useTranslation';
import clsx from 'clsx';
import styles from './details-page.module.scss';
import { OwnedBy } from '@components/owned-by';
import { ChevronLeftIcon } from '@heroicons/react/solid';
import { numberFormat } from '@common/helpers/formatters';
import { CancelModalComponent } from '@components/marketplace/cancel-modal';
import { SellModalComponent } from '@components/marketplace/sell-modal';
import useAppStore from '@hooks/useAppStore';
import { BuyModalComponent } from '@components/marketplace/buy-modal';
import ReactTooltip from 'react-tooltip';
import useWalletStore from '@hooks/useWalletStore';
import useContractAddressStore, { ContractTypeEnum } from '@hooks/useContractAddressStore';
import { SyndicateModalComponent } from '@components/modals/syndicate-modal';
import { SyndicateReconstitutionModal } from '@components/modals/syndicate-reconstitution-modal';
import { MakeOfferModalComponent } from '@components/marketplace/make-offer-modal';
import { isSellDisabled, isBuyDisabled, isOfferDisabled, isSyndicateDisabled } from '@common/contractStateCfg';
import { getOpenSeaUrl } from '@common/getInformationPerNftCollectionEnum';

type NFTType = IAvatar | IHorse | ILand | IFarm;

export type DetailsPageProps = {
  currentNFT: NFTType;
  owner?: IProfile;
  ownedNFTs?: NFTType[];
  onSelectCarousel?: Function;
  carouselPlaceholder?: string;
  carouselLabel?: string;
  backUrl?: string;
  backLabel?: string;
  title?: any;
  subtitle?: any;
  children?: any;
  bgStyle?: any;
  fetchMoreOwnedNFTs?: Function;
  totalOwnedNFTs?: number;
  NFTTabsComponent?: ReactNode;
  [props: string]: any; // All other props
};

const DetailsPage: FunctionComponent<DetailsPageProps> = ({
  currentNFT,
  owner,
  ownedNFTs,
  onSelectCarousel,
  backUrl,
  backLabel,
  title,
  subtitle,
  children,
  carouselPlaceholder,
  carouselLabel,
  bgStyle,
  fetchMoreOwnedNFTs,
  totalOwnedNFTs,
  NFTTabsComponent,
  //...domProps
}) => {
  const [contractAddress, setContractAddress] = useState();
  const [totalInUSD, setTotalInUSD] = useState<number>();
  const { t } = useTranslation();
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSyndicateModalOpen, setIsSyndicateModalOpen] = useState(false);
  const [isSyndicateReconstitutionModal, setIsSyndicateReconstitutionModal] = useState(false);
  const [isMakeOfferModalOpen, setIsMakeOfferModalOpen] = useState(false);
  const { Moralis, account, isInitialized } = useMoralis();
  const { getEthInUsdWithoutTokenPrice } = useWalletStore();
  const { profile } = useAppStore();
  const { getContractAddress } = useContractAddressStore();
  const [showStableTable, setShowStableTable] = useState(false);

  const isOwner = useMemo(
    () =>
      profile?.walletAddress == owner?.walletAddress || account
        ? account.toLowerCase() == owner?.walletAddress.toLowerCase()
        : false,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile?.walletAddress, owner?.walletAddress]
  );

  const getPriceUsd = async price => {
    try {
      const priceData = await getEthInUsdWithoutTokenPrice(Moralis, price);
      //console.log('GET PRICE DATA', price, priceData);
      setTotalInUSD(priceData);
    } catch (error) {
      setTotalInUSD(null);
    } finally {
      //setIsPriceLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized && currentNFT) {
      getPriceUsd(currentNFT.price);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, currentNFT.price]);

  const getContractAddressInformation = async () => {
    const contractAddress = await getContractAddress(currentNFT.collectionType);
    setContractAddress(contractAddress);
  };

  useEffect(() => {
    if (currentNFT) {
      getContractAddressInformation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNFT]);

  const syndicateButton = () => {
    if (isSyndicateDisabled) return null;
    return (
      currentNFT.isSyndicateRulesMet &&
      backUrl != '/marketplace' && (
        <>
          <Button
            full
            fill="solid"
            color="primary"
            icon={<Icon name="syndicate" className="h-5 w-5 -mt-1" />}
            className="w-48 mt-4"
            onClick={() => {
              setIsSyndicateModalOpen(!isSyndicateModalOpen);
            }}
          >
            {t('details.syndicate')}
          </Button>
          <SyndicateModalComponent
            isOpen={isSyndicateModalOpen}
            isOpenEvent={setIsSyndicateModalOpen}
            imageURL={currentNFT.imageThumbnail}
            tokenId={currentNFT.tokenId}
            name={currentNFT.name}
            collectionType={currentNFT.collectionType}
          />
        </>
      )
    );
  };

  const reconstituteButton = () => {
    if (isSyndicateDisabled) return null;
    return (
      currentNFT.isReconstituteRulesMet &&
      currentNFT.collectionType == ContractTypeEnum.HorseGovernance &&
      backUrl != '/marketplace' && (
        <>
          <Button
            full
            fill="solid"
            color="primary"
            className="w-48 mt-4"
            onClick={() => {
              setIsSyndicateReconstitutionModal(!isSyndicateReconstitutionModal);
            }}
          >
            {t('details.reconstitute')}
          </Button>
          <SyndicateReconstitutionModal
            isOpen={isSyndicateReconstitutionModal}
            isOpenEvent={setIsSyndicateReconstitutionModal}
            imageURL={currentNFT.imageThumbnail}
            tokenId={currentNFT.tokenId}
            name={currentNFT.name}
            collectionType={currentNFT.collectionType}
          />
        </>
      )
    );
  };

  const makeOfferButton = () => {
    if (isOfferDisabled) return null;
    return (
      <>
        <Button
          full
          fill="solid"
          color="primary"
          icon={<Icon name="money" className="h-5 w-5 -mt-1" />}
          className="w-48 mt-4"
          onClick={() => {
            setIsMakeOfferModalOpen(!isMakeOfferModalOpen);
          }}
        >
          {t('details.makeOffer')}
        </Button>
        <MakeOfferModalComponent
          isOpen={isMakeOfferModalOpen}
          isOpenEvent={setIsMakeOfferModalOpen}
          tokenId={currentNFT.tokenId}
          tokenName={currentNFT.name}
          tokenImageThumbnailUrl={currentNFT.imageThumbnail}
          contractType={currentNFT.collectionType}
          quantityForSale={currentNFT.availableQuantityToMakeAnOffer}
          tokenOwnersWalletAddressList={currentNFT.tokenOwnersWalletAddressList}
        />
      </>
    );
  };

  const sellButton = quantityForSale => {
    if (isSellDisabled) return null;
    return (
      <>
        <Button
          full
          fill="solid"
          color="market"
          className="w-32 mt-4 mb-4 sm:mb-0"
          onClick={() => {
            setIsSellModalOpen(!isSellModalOpen);
          }}
        >
          {t('details.sell')}
        </Button>
        <SellModalComponent
          isOpen={isSellModalOpen}
          isOpenEvent={setIsSellModalOpen}
          tokenId={currentNFT.tokenId}
          tokenName={currentNFT.name}
          tokenImageThumbnailUrl={currentNFT.imageThumbnail}
          contractType={currentNFT.collectionType}
          contractName={currentNFT.collectionName}
          quantityOfShares={quantityForSale}
        />
      </>
    );
  };

  const cancelButton = totalInUSD => {
    if (isSellDisabled) return null;
    return (
      <>
        <Button
          full
          fill="solid"
          color="primary"
          className="mt-4 mb-4 sm:mb-0"
          onClick={() => {
            setIsCancelModalOpen(!isCancelModalOpen);
          }}
        >
          {t('details.cancelListing')}
        </Button>

        <CancelModalComponent
          isOpen={isCancelModalOpen}
          isOpenEvent={setIsCancelModalOpen}
          contractName={currentNFT?.collectionName}
          marketplaceId={currentNFT?.marketplaceItemId}
          tokenId={currentNFT?.tokenId}
          contractType={currentNFT.collectionType}
          tokenName={currentNFT.name}
          tokenImageThumbnailUrl={currentNFT.imageThumbnail}
          totalInETH={currentNFT.price}
          totalInUSD={totalInUSD}
        />
      </>
    );
  };

  const openSeaButton = () => {
    return (
      <>
        <a target="_blank" href={getOpenSeaUrl(contractAddress, currentNFT.tokenId)} rel="noreferrer">
          <Button
            full
            fill="solid"
            color="market"
            icon={<Icon name="eth" className="h-4 w-4  -mt-1" />}
            className="mt-4 mb-4 sm:mb-0"
          >
            {t('details.buyOnOpenSea')}
          </Button>
        </a>
      </>
    );
  };

  const LabelComponent: FC = () => {
    const enableHorseListView = currentNFT.collectionType === ContractTypeEnum.Horse;
    return (
      <div className={`font-bold w-28 text-blue${enableHorseListView?' hover:text-white':''}`}>
        {enableHorseListView && (
          <a href="#" onClick={() => setShowStableTable(true)}>
            {carouselLabel || t('carouselLabel')}{' (' + totalOwnedNFTs + ')'}
          </a>
        )}
        {!enableHorseListView && (
          <>
            {carouselLabel || t('carouselLabel')}{' (' + totalOwnedNFTs + ')'}
          </>
        )}
      </div>
    )
  }

  const onStableTableClose = () => {
    setShowStableTable(false);
  }

  return (
    <>
      <ReactTooltip id="comingSoonTooltip" place="bottom" type="dark" effect="solid">
        <span>Coming Soon!</span>
      </ReactTooltip>
      <div className={clsx('px-10 flex flex-col sm:flex-row', styles.pageDetail, bgStyle)}>
        <div className={clsx('max-w-full', 'sm:max-w-[55%]', styles.leftSide)}>{children}</div>
        <div className={clsx('max-w-full ml-0', 'sm:ml-12 sm:max-w-[45%]', styles.traits)}>
          <div className="text-white pt-12 z-10 flex flex-col items-start">
            {backUrl && (
              <div className="flex items-center mb-4">
                <ChevronLeftIcon className="h-4 w-4 flex-shrink-0 text-gray-200" aria-hidden="true" />
                <Link href={backUrl}>
                  <a className="ml-4 text-xs text-gray-200 hover:text-gray-500">
                    {backLabel || t('details.backToMarketplace')}
                  </a>
                </Link>
              </div>
            )}
            <div className="text-xs">
              {owner && currentNFT.collectionType != ContractTypeEnum.HorsePartnership && (
                <OwnedBy
                  avatarTokenId={owner?.defaultProfileAvatarTokenId}
                  address={owner?.walletAddress}
                  userName={isOwner ? t('details.you') : owner?.username}
                  dynasty={owner?.dynastyName}
                />
              )}
            </div>

            <div className="font-bold text-4xl mt-4">{title || currentNFT?.name}</div>
            {subtitle && <div className="font-semibold text-gray-200 mt-2"> {subtitle}</div>}

            {!isOwner ? (
              !currentNFT?.isForSale ? (
                <>
                  <div className="mt-2 font-bold text-2xl text-white">{t('details.notForSale')}</div>
                  <div className="flex flex-row items-start w-full space-x-3">
                    {currentNFT.availableQuantityToSell && currentNFT.availableQuantityToSell > 0
                      ? sellButton(currentNFT.availableQuantityToSell)
                      : ''}
                    {openSeaButton()}
                    {makeOfferButton()}
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-4 text-xs text-gray-300 font-medium">{t('details.currentPrice')}</div>
                  <div className="mt-2 text-white">
                    <span className="font-bold text-2xl text-white">ETH {numberFormat(currentNFT?.price, 4)}</span>
                    <span className="ml-2 text-gray-200">(${totalInUSD})</span>
                  </div>
                  <div className="flex flex-row items-start w-full space-x-3">
                    <>
                      {currentNFT.availableQuantityToSell && currentNFT.availableQuantityToSell > 0
                        ? sellButton(currentNFT.availableQuantityToSell)
                        : ''}
                      {openSeaButton()}
                      {!isBuyDisabled && (
                        <>
                          <Button
                            full
                            fill="solid"
                            color="market"
                            icon={<Icon name="eth" className="h-4 w-4  -mt-1" />}
                            className="w-48 mt-4"
                            onClick={() => {
                              setIsBuyModalOpen(!isBuyModalOpen);
                            }}
                          >
                            {t('details.buyNow')}
                          </Button>
                          <BuyModalComponent
                            isOpen={isBuyModalOpen}
                            isOpenEvent={setIsBuyModalOpen}
                            contractType={currentNFT.collectionType}
                            contractName={currentNFT?.collectionName}
                            tokenId={currentNFT.tokenId}
                            tokenName={currentNFT.name}
                            tokenImageThumbnailUrl={currentNFT.imageThumbnail}
                            sellerWalletAddress={owner?.walletAddress}
                            marketPlaceItemId={currentNFT?.marketplaceItemId}
                            totalInETH={currentNFT.price}
                            quantityOfShares={currentNFT.quantityForSale}
                          />
                        </>
                      )}
                      {makeOfferButton()}
                    </>
                  </div>
                </>
              )
            ) : isOwner && currentNFT.isForSale ? (
              <>
                <div className="mt-4 text-xs text-gray-300 font-medium">{t('details.currentPrice')}</div>
                <div className="mt-2 text-white">
                  <span className="font-bold text-2xl text-white">ETH {numberFormat(currentNFT?.price, 4)}</span>
                  <span className="ml-2 text-gray-200">(${totalInUSD})</span>
                </div>
                <div className="flex flex-row items-start w-full space-x-3">
                  {currentNFT.availableQuantityToSell && currentNFT.availableQuantityToSell > 0
                    ? sellButton(currentNFT.availableQuantityToSell)
                    : ''}
                  {cancelButton(totalInUSD)}
                  {syndicateButton()}
                  {reconstituteButton()}
                  {currentNFT.tokenOwnersWalletAddressList.length > 1 && makeOfferButton()}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-row items-start w-full space-x-3">
                  {sellButton(currentNFT.quantityForSale)}
                  {syndicateButton()}
                  {reconstituteButton()}
                  {currentNFT.tokenOwnersWalletAddressList.length > 1 && makeOfferButton()}
                </div>
              </>
            )}

            <div className="w-full ">
              {NFTTabsComponent && NFTTabsComponent}
              {ownedNFTs?.length > 0 && (
                <NFTCarousel
                  items={ownedNFTs}
                  onSelect={onSelectCarousel}
                  defaultSelectedId={currentNFT?.tokenId}
                  placeholder={carouselPlaceholder}
                  LabelComponent={LabelComponent}
                  fetchMoreData={fetchMoreOwnedNFTs}
                  totalItems={totalOwnedNFTs}
                  showStableTable={showStableTable}
                  onStableTableClose={onStableTableClose}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsPage;
