import { useMoralis } from 'react-moralis';

import { Button } from '@components/button';
import { Icon } from '@components/icons';
import useContractAddressStore, { ContractTypeEnum } from '@hooks/useContractAddressStore';
import useWalletStore from '@hooks/useWalletStore';
import api from '@common/api';

export type MetaverseButtonProps = {
  land?: IFarm;
  className?: string;
};

export const MetaverseButton: React.FC<MetaverseButtonProps> = ({
  land,
  className = 'absolute right-0 bottom-0',
}: MetaverseButtonProps) => {
  const { chainId, Moralis } = useMoralis();
  const { getContractAddress } = useContractAddressStore();
  const { getAllNFTsForContract } = useWalletStore();

  const handleMetaverseClick = async () => {
    const scenery = land.isPublic ? 'publicFarm' : 'privateFarm';
    const avatarId = await getAvatarId();
    const horseData = await getHorsesData();
    const encodedYearlingData = btoa(JSON.stringify(horseData));
    const metaverseUrl = `${process.env.NEXT_PUBLIC_META_BASE_URL}/index.html?gender=M&scenery=${scenery}&farmID=${
      land.tokenId
    }${avatarId ? `&avatarID=${avatarId}` : ''}&horses=${normalizeBase64(encodedYearlingData)}`;
    window.open(metaverseUrl, '_blank');
  };

  //Normalize the Base64: Substitute endings '=' or '==' with '-' and '--'
  const normalizeBase64 = (base64string: string) => {
    let normalizedBase64string;
    if (base64string.slice(base64string.length - 2, base64string.length) === '==') {
      normalizedBase64string = base64string.slice(0, -2) + '--';
    } else if (base64string[base64string.length - 1] === '=') {
      normalizedBase64string = base64string.slice(0, -1) + '-';
    } else {
      normalizedBase64string = base64string;
    }
    return normalizedBase64string;
  };

  const getAvatarId = async () => {
    const avatarTokenAddress = await getContractAddress(ContractTypeEnum.Avatar);
    const avatarsFromWallet = await getAllNFTsForContract(Moralis, avatarTokenAddress, chainId);
    let avatarId;

    if (avatarsFromWallet && avatarsFromWallet.length > 0) {
      const firstAvatar = avatarsFromWallet.sort((a, b) => a.token_id - b.token_id)[0];
      avatarId = firstAvatar.token_id;
    }

    return avatarId;
  };

  const getHorsesData = async () => {
    const { data } = await api.get<IFarmStakedHorseModelResponse>(`/api/MarketPlace/GetStallFarmData/${land.tokenId}`);
    let horsesInfo = [];

    if (data.items && data.items.length > 0 && data.items[0].horsetokenID !== 0) {
      data.items.forEach((horseInfo, index) => {
        horsesInfo.push({
          horse_id: horseInfo.horsetokenID,
          horse_url: '',
        });
      });

      if (data.items[0].numberOfStallsOpen > 0) {
        for (let i = 0; i < data.items[0].numberOfStallsOpen; i++) {
          horsesInfo.push({});
        }
      }
    } else {
      for (let i = 0; i < data.items[0].numberOfStallsOpen; i++) {
        horsesInfo.push({});
      }
    }

    return {
      horses: horsesInfo,
    };
  };

  return (
    <Button
      fill="outline"
      icon={<Icon name="metaverse" color="var(--color-market)" />}
      color="market"
      notch="right"
      className={className}
      onClick={() => {
        handleMetaverseClick();
      }}
    ></Button>
  );
};
