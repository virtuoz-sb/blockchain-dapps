import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { useMoralis } from 'react-moralis';

import { BuyModalComponent } from './buy-modal';
import styles from './card.marketplace.module.scss';

import { Icon } from '@components/icons';
import useTranslation from '@hooks/useTranslation';

import { ContractTypeEnum } from '@hooks/useContractAddressStore';
import useAppStore from '@hooks/useAppStore';
import { getNftImageThumbnail, getNftMarketplaceDetailRoute } from '@common/getInformationPerNftCollectionEnum';
import { isBuyDisabled } from '@common/contractStateCfg';

export type MarketplaceCardModel = {
  cardModel: ICardModel;
  onImageClick?: any;
  onBtnClick?: any;
  type: ContractTypeEnum;
};

export interface ICardModel {
  id: number;
  name: string;
  image: string;
  isForSale: boolean;
  marketPlaceItemId?: number;
  priceETH?: number;
  priceDollar?: number;
  nftOwnerWalletAddress?: string;
  contractType: ContractTypeEnum;
  contractName?: string;
  fromPage?: number;
  sharesQuantity?: number;
}

export const MarketplaceCard: FunctionComponent<MarketplaceCardModel> = ({
  cardModel,
  onBtnClick = null,
  onImageClick = null,
  type,
}) => {
  const [buyNowActive, setBuyNowActive] = useState<boolean>(false);
  const [isNftOwnerTheCurrentUser, setIsNftOwnerTheCurrentUser] = useState<Boolean>(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const marketplaceDetailLink = useRef<string>(getNftMarketplaceDetailRoute(type, cardModel.id));

  const { profile } = useAppStore();
  const { isInitialized, account } = useMoralis();

  const trans = useTranslation();

  const handleBuyNowButton = async isEnabled => {
    if (!isBuyDisabled && cardModel.isForSale && !isNftOwnerTheCurrentUser) {
      setBuyNowActive(isEnabled);
    }
  };

  const buyButtonDisplayOrNot = async () => {
    if (cardModel.isForSale) {
      const userProfile = await profile;
      let nftOwnerIsTheCurrentUser = false;

      if (userProfile) {
        nftOwnerIsTheCurrentUser =
          cardModel.nftOwnerWalletAddress.toLowerCase() == userProfile.walletAddress.toLowerCase() ? true : false;
      } else if (account) {
        nftOwnerIsTheCurrentUser =
          cardModel.nftOwnerWalletAddress.toLowerCase() == account.toLowerCase() ? true : false;
      }

      setIsNftOwnerTheCurrentUser(nftOwnerIsTheCurrentUser);
    }
  };

  useEffect(() => {
    if (isInitialized && account) {
      buyButtonDisplayOrNot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, account]);

  return (
    <div>
      <div className="relative mt-3 ml-3">
        <div
          className={clsx('h-52 w-52', styles.notched, {
            [styles.btnBuyNowHoverActive]: buyNowActive,
          })}
        >
          <Link href={marketplaceDetailLink.current}>
            <a>
              <button
                onMouseEnter={() => handleBuyNowButton(true)}
                onMouseLeave={() => handleBuyNowButton(false)}
                className="w-full h-full"
              >
                <img
                  src={cardModel.image || getNftImageThumbnail(type)}
                  className="w-full h-full rounded-md"
                  alt="cardItem"
                />
              </button>
            </a>
          </Link>
        </div>
        <div className="-bottom-3 sm:absolute">
          <button
            onMouseEnter={() => handleBuyNowButton(true)}
            onMouseLeave={() => handleBuyNowButton(false)}
            onClick={() => {
              if (onBtnClick) {
                onBtnClick();
              } else if (buyNowActive) {
                setIsBuyModalOpen(!isBuyModalOpen);
              }
            }}
            className={clsx('', styles.btnBuyNow, {
              [styles.btnBuyNowHoverActive]: buyNowActive,
            })}
          >
            {buyNowActive ? 'BUY NOW' : `#${cardModel.id}`}
          </button>
          <BuyModalComponent
            isOpen={isBuyModalOpen}
            isOpenEvent={setIsBuyModalOpen}
            contractType={cardModel.contractType}
            contractName={cardModel.contractName}
            tokenId={cardModel.id}
            tokenName={cardModel.name}
            tokenImageThumbnailUrl={cardModel.image}
            sellerWalletAddress={cardModel.nftOwnerWalletAddress}
            marketPlaceItemId={cardModel.marketPlaceItemId}
            totalInETH={cardModel.priceETH}
            quantityOfShares={cardModel.sharesQuantity}
          />
        </div>
      </div>
      <div className="min-h-[50px]">
        <div className={clsx('relative mt-5 ml-3', cardModel.isForSale ? '' : 'hidden')}>
          <div className="text-x text-gray-300 font-medium ml-9">current price</div>
          <div className="flex items-center text-white">
            <Icon name={'eth-gray-rounded'} className="h-7 w-7" />
            <span className="ml-2 text-xl font-bold">{cardModel.priceETH}</span>
            <span className="ml-2 text-x">({cardModel.priceDollar})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
