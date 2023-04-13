import React, {FC, FunctionComponent, ReactNode, useEffect, useMemo, useRef, useState} from 'react';
import clsx from 'clsx';

import styles from './nft-carousel.module.scss';
import useTranslation from '@hooks/useTranslation';
import { Button } from '@components/button';
import { Loader } from '@components/loader';
import HorseList from '@components/horse-list';
import {Drawer} from "@components/modals/drawer";
import { Icon } from '@components/icons';

const PLACEHOLDER_IMAGE: string = '/images/avatar-placeholder.jpg';

export type NFTCarouselProps = {
  items: any[];
  defaultSelectedId?: number;
  LabelComponent?: FC;
  placeholder?: string;
  className?: string;
  onSelect: Function;
  fetchMoreData: any;
  totalItems: number;
  showStableTable: boolean;
  onStableTableClose: Function;
};

export const NFTCarousel: FunctionComponent<NFTCarouselProps> = ({
  items,
  className,
  placeholder = PLACEHOLDER_IMAGE,
  LabelComponent,
  defaultSelectedId,
  onSelect,
  fetchMoreData,
  totalItems,
  showStableTable,
  onStableTableClose,
  ...domProps
}) => {
  const [isFetchMoreDataExecuting, setIsFetchMoreDataExecuting] = useState(false);

  const refCarousel = useRef(null);
  const defaultIndex = items && items.length > 0 ? items.findIndex(x => x.id == defaultSelectedId) : 0;
  const [currentIndex, setCurrentIndex] = useState(defaultIndex > 0 ? defaultIndex : 0);
  const { t } = useTranslation();

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      handleSelect(currentIndex + 1);
      scrollTo(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      handleSelect(currentIndex - 1);
      scrollTo(currentIndex - 1);
    }
  };

  const handleSelect = index => {
    onSelect(items[index]);
    setCurrentIndex(index);
  };

  const scrollTo = index => {
    const item = document.querySelector('#carousel-item-' + index);
    item?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  useEffect(() => {
    setIsFetchMoreDataExecuting(false);
  }, [items?.length]);

  const actionColumn = useMemo(
    () => ({
      cell: ({row}) => {
        const {
          original: {
            moreInformation: moreInfo
          }
        } = row;
        return (
          <div className={'flex justify-end px-3'} onClick={async () => {
            window.open(moreInfo, '_blank')
          }}>
            <Icon name={'arrow-ne'} color='#4583FF' className="w-3 mr-1 mb-2"/>
          </div>
        )
      },
    }),
    []
  );

  return (
    <div className={className}>
      {items?.length && (
        <div className="flex flex-row mt-6 mb-20 sm:mb-0">
          <div>
            <LabelComponent/>
            <div className="flex flex-row pl-0 pt-2">
              <button
                className={clsx(
                  'mr-4 flex w-8 h-8 items-center justify-center bg-blue-900 rounded-full pr-0.5 hover:outline-2 hover:outline hover:outline-blue-500',
                  currentIndex == 0 && 'opacity-50 hover:outline-0'
                )}
                onClick={handlePrevious}
                disabled={currentIndex == 0}
              >
                <div className="w-2 h-2 flex items-center justify-center">
                  <svg viewBox="0 0 7 12" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M5.57128 11.761L0.24513 6.57577C-0.0817094 6.25758 -0.0817093 5.74169 0.24513 5.4235L5.57128 0.238277C5.89812 -0.0799142 6.42803 -0.0799141 6.75487 0.238277C7.08171 0.556469 7.08171 1.07236 6.75487 1.39055L2.02051 5.99963L6.75487 10.6087C7.08171 10.9269 7.08171 11.4428 6.75487 11.761C6.42803 12.0792 5.89812 12.0792 5.57128 11.761Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </button>
              <button
                className={clsx(
                  'flex w-8 h-8 items-center justify-center bg-blue-900 rounded-full pl-0.5 hover:outline-2 hover:outline hover:outline-blue-500',
                  currentIndex == items?.length - 1 && 'opacity-50 hover:outline-0'
                )}
                onClick={handleNext}
                disabled={currentIndex == items?.length - 1}
              >
                <div className="w-2 h-2 flex items-center justify-center">
                  <svg viewBox="0 0 7 12" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M1.42872 11.7614L6.75487 6.57614C7.08171 6.25794 7.08171 5.74206 6.75487 5.42386L1.42872 0.238644C1.10188 -0.079548 0.571968 -0.0795479 0.245129 0.238644C-0.0817108 0.556835 -0.0817108 1.07272 0.245129 1.39091L4.97949 6L0.245129 10.6091C-0.0817099 10.9273 -0.0817099 11.4432 0.24513 11.7614C0.571969 12.0795 1.10188 12.0795 1.42872 11.7614Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
          <div
            ref={refCarousel}
            className={clsx(
              'relative flex gap-3 snap-mandatory snap-x overflow-x-auto overflow-y-hidden pb-2',
              styles.nftCarousel
            )}
          >
            {items.map((nft: any, index: number) => (
              <div
                id={`carousel-item-${index}`}
                key={`${nft.tokenId}_${index}`}
                className={clsx(index == currentIndex && styles.active, 'snap-start')}
              >
                <div className={clsx('shrink-0 h-24 w-24 rounded-sm', styles.notched)}>
                  <button className="w-full h-full" onClick={() => handleSelect(index)}>
                    <img src={nft?.imageThumbnail || placeholder} className="rounded-sm" alt="nft thumbnail" />
                  </button>
                </div>
              </div>
            ))}
            {items.length < totalItems && (
              <div className="h-full flex items-center">
                <Button
                  disabled={isFetchMoreDataExecuting ? true : false}
                  onClick={() => {
                    setIsFetchMoreDataExecuting(true);
                    fetchMoreData();
                  }}
                  color="primary"
                >
                  {isFetchMoreDataExecuting ? (
                    <Loader fullscreen={false} customHeight={3} customWidth={3} />
                  ) : (
                    <span className="text-xs">More</span>
                  )}
                </Button>
              </div>
            )}
          </div>
          <Drawer
            title={t('horselist.actions.stableTitle')}
            isOpen={showStableTable}
            onClose={() => onStableTableClose()}
            width="max-w-[1440px]"
            containerCls="mt-32 mx-2.5"
          >
            <HorseList data={items} actionColumn={actionColumn}/>
          </Drawer>
        </div>
      )}
    </div>
  );
};
