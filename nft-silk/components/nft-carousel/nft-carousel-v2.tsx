import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import styles from './nft-carousel-v2.module.scss';
import useTranslation from '@hooks/useTranslation';
import { Button } from '@components/button';
import { Loader } from '@components/loader';
import { Icon } from '@components/icons';

const PLACEHOLDER_IMAGE: string = '/images/avatar-placeholder.jpg';

export type NFTCarouselV2Item = {
  tokenId: number;
  imageThumbnail: string;
};

export type NFTCarouselV2Props = {
  items: NFTCarouselV2Item[];
  defaultSelected?: number;
  className?: string;
  onSelectFunction?: Function;
  fetchMoreDataFunction: any;
  enableAutoFetchMoreData: boolean;
  totalItems: number;
  formikSetFieldValueFunction?: Function;
  formikSetFieldValueFieldName?: string;
};

export const NFTCarouselV2: FunctionComponent<NFTCarouselV2Props> = ({
  items,
  className,
  defaultSelected,
  onSelectFunction,
  fetchMoreDataFunction,
  enableAutoFetchMoreData,
  totalItems,
  formikSetFieldValueFunction,
  formikSetFieldValueFieldName,
  ...domProps
}) => {
  const [isFetchMoreDataExecuting, setIsFetchMoreDataExecuting] = useState(false);

  const refCarousel = useRef(null);
  const [currentIndex, setCurrentIndex] = useState<number>();
  const { t } = useTranslation();

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      handleSelect(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      handleSelect(currentIndex - 1);
    }
  };

  const handleSelect = index => {
    setCurrentIndex(index);

    if (onSelectFunction) {
      onSelectFunction(items[index].tokenId);
    }

    if (formikSetFieldValueFunction) {
      formikSetFieldValueFunction(formikSetFieldValueFieldName, items[index].tokenId);
    }
  };

  const scrollTo = index => {
    const item = document.querySelector('#nft-carousel-v2-item-' + index);
    item?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  useEffect(() => {
    setIsFetchMoreDataExecuting(false);
  }, [items?.length]);

  useEffect(() => {
    if (items && items.length > 0 && isFetchMoreDataExecuting == false) {
      if (defaultSelected == undefined) {
        handleSelect(0);
      } else {
        const defaultIndex = items.findIndex(x => x.tokenId == defaultSelected);
        if (defaultIndex != -1) {
          setCurrentIndex(defaultIndex);
        } else {
          setCurrentIndex(0);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSelected, items]);

  useEffect(() => {
    if (currentIndex) {
      scrollTo(currentIndex);

      if (
        enableAutoFetchMoreData &&
        isFetchMoreDataExecuting == false &&
        items.length - currentIndex <= 5 &&
        items.length < totalItems
      ) {
        setIsFetchMoreDataExecuting(true);
        setTimeout(fetchMoreDataFunction, 1000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  function delay(timeInMilisecond) {
    return new Promise(resolve => setTimeout(resolve, timeInMilisecond));
  }

  const emptyCarouselCard = () => {
    return (
      <div className="flex items-end">
        <div className="snap-start flex items-center justify-center h-32 w-32">
          <Icon name="emptyCarouselCard" className="h-32 w-32" />
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {items?.length && (
        <div className="flex flex-row mt-1 mb-20 sm:mb-0">
          <div className="flex items-center justify-center">
            <button
              type="button"
              className={clsx(
                'mr-4 flex w-16 h-16 items-center justify-center bg-blue-900 rounded-full pr-0.5 hover:outline-2 hover:outline hover:outline-blue-500',
                currentIndex == 0 && 'opacity-50 hover:outline-0'
              )}
              onClick={handlePrevious}
              disabled={currentIndex == 0}
            >
              <div className="w-2 h-2 flex items-center justify-center">
                <Icon name="arrow-white-left" className="h-3 w-3" />
              </div>
            </button>
          </div>
          <div
            ref={refCarousel}
            className={clsx(
              'relative flex gap-10 snap-mandatory snap-x overflow-x-hidden overflow-y-hidden pb-2 h-auto'
            )}
          >
            <>
              {emptyCarouselCard()}
              {items.map((nft: any, index: number) => (
                <div id={`nft-carousel-v2-item-${index}`} key={`${nft.tokenId}_${index}`} className="flex items-end">
                  <div
                    className={clsx(
                      index == currentIndex ? 'h-52 w-52' : 'h-32 w-32',
                      'snap-start flex items-center justify-center'
                    )}
                  >
                    <div className={clsx(index == currentIndex && styles.selectedNft)} />

                    <div className="z-0">
                      <img
                        src={nft?.imageThumbnail || PLACEHOLDER_IMAGE}
                        className="h-32 w-32 rounded-md"
                        alt="nft thumbnail"
                      />
                      {index == currentIndex && <p className="mt-3 font-medium">{t('nft-carousel-v2.primary')}</p>}
                    </div>
                  </div>
                </div>
              ))}

              {enableAutoFetchMoreData
                ? isFetchMoreDataExecuting && (
                    <div className="h-full flex items-center mt-6">
                      <Loader fullscreen={false} customHeight={5} customWidth={5} />
                    </div>
                  )
                : items.length < totalItems && (
                    <div className="h-full flex items-center mt-6">
                      <Button
                        disabled={isFetchMoreDataExecuting ? true : false}
                        onClick={() => {
                          setIsFetchMoreDataExecuting(true);
                          fetchMoreDataFunction();
                        }}
                        color="primary"
                      >
                        {isFetchMoreDataExecuting ? (
                          <Loader fullscreen={false} customHeight={3} customWidth={3} />
                        ) : (
                          <span className="text-xs">{t('nft-carousel-v2.more')}</span>
                        )}
                      </Button>
                    </div>
                  )}

              {emptyCarouselCard()}
            </>
          </div>
          <div className="flex items-center justify-center">
            <button
              type="button"
              className={clsx(
                'ml-4 flex w-16 h-16 items-center justify-center bg-blue-900 rounded-full pl-0.5 hover:outline-2 hover:outline hover:outline-blue-500',
                currentIndex == items?.length - 1 && 'opacity-50 hover:outline-0'
              )}
              onClick={handleNext}
              disabled={currentIndex == items?.length - 1}
            >
              <div className="w-2 h-2 flex items-center justify-center">
                <Icon name="arrow-white-right" className="h-3 w-3" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
