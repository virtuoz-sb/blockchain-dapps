import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { getAvatarDetail } from '@common/api/silks';
import { CopyClipboard } from '@components/copy-to-clipboard';
import { getEllipsisTxt } from '@common/helpers/formatters';
import useTranslation from '@hooks/useTranslation';

export type OwnedByProps = {
  avatarTokenId: number;
  userName: string;
  dynasty?: string;
  address: string;
  className?: string;
};

export const OwnedBy = ({ className, avatarTokenId, userName, dynasty, address }: OwnedByProps) => {
  const [avatarImageThumbnailUrl, setAvatarImageThumbnailUrl] = useState<string>();
  const { t } = useTranslation();

  const setAvatarInformation = async () => {
    const avatarData = await getAvatarDetail(avatarTokenId);
    setAvatarImageThumbnailUrl(avatarData.imageThumbnail);
  };

  useEffect(() => {
    if (avatarTokenId) {
      setAvatarInformation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarTokenId]);

  return (
    <div className={clsx('flex flex-row', className)}>
      <img
        className="h-10 w-10 rounded-full border-2 border-white/25 mr-2"
        src={avatarImageThumbnailUrl || '/images/no-avatar.png'}
        alt=""
      />
      <div className="text-xs flex flex-col justify-center">
        {userName ? (
          <>
            <span className="font-bold">
              {t('common.ownedBy')}
              <span className="text-blue-500 ml-2">{userName}</span>
              <span className="text-blue-500 ml-2">{dynasty ? `(${dynasty})` : ''}</span>
            </span>
            <span className="text-gray-400">{getEllipsisTxt(address, 10)}</span>
          </>
        ) : (
          <>
            <span className="font-bold">{t('common.ownedBy')}</span>
            <span className="text-gray-400">{getEllipsisTxt(address, 10)}</span>
          </>
        )}
      </div>
      {address && (
        <CopyClipboard textToCopy={address} className="ml-3 self-end" iconClassName="h-5 w-5 text-gray-400" />
      )}
    </div>
  );
};
