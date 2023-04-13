import React, { FunctionComponent, useState, Suspense, useRef, useEffect } from 'react';
import { Button } from '@components/button';
import { Icon } from '@components/icons';
import { FullScreenModal } from '@components/modals/full-screen-modal';
import useTranslation from '@hooks/useTranslation';

export type IFrameViewButtonProps = {
  src: string;
  type: 'horse' | 'avatar';
};

export const IFrameViewButton: FunctionComponent<IFrameViewButtonProps> = ({ src, type }) => {
  const { t } = useTranslation();
  const [showIFrame, setShowIFrame] = useState(false);

  const iconName = type == 'horse' ? 'stripes' : '3d';
  const hoverText = type == 'horse' ? t('3dmodal.viewTheSilks') : t('3dmodal.viewIn3D');

  return (
    <>
      <div className="group relative">
        <Button
          fill="outline"
          color="default"
          notch="right"
          icon={<Icon name={iconName} />}
          onClick={() => setShowIFrame(true)}
        />
        <div className="absolute top-4 left-[4rem] text-white text-xs whitespace-nowrap hidden group-hover:block">
          {hoverText}
        </div>
      </div>
      <FullScreenModal isOpen={showIFrame} onClose={() => setShowIFrame(false)}>
        <iframe className="w-full h-[calc(100%-48px)] mt-12" src={src} frameBorder="no" />
      </FullScreenModal>
    </>
  );
};
