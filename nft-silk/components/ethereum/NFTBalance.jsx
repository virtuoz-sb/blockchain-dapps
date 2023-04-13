/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { useMoralis, useNFTBalances } from 'react-moralis';
import { DocumentSearchIcon, PaperAirplaneIcon, ShoppingCartIcon } from '@heroicons/react/outline';

import { Card } from '@components/card';
import { DisplayModal } from '@components/modals/display-modal';
import { Skeleton } from '@components/skeleton';
import { Tooltip } from '@components/tooltip';

import { getExplorer } from '@common/helpers/networks';
import AddressInput from './AddressInput';
import { useVerifyMetadata } from '@hooks/moralis/useVerifyMetadata';

const styles = {
  NFTs: {
    display: 'flex',
    flexWrap: 'wrap',
    WebkitBoxPack: 'start',
    justifyContent: 'flex-start',
    margin: '0 auto',
    width: 'calc(100% - 200px)',
    gap: '10px',
  },
};

function NFTBalance() {
  const { data: NFTBalances } = useNFTBalances();
  const { isAuthenticated, Moralis, chainId } = useMoralis();
  const [visible, setVisibility] = useState(false);
  const [receiverToSend, setReceiver] = useState(null);
  const [amountToSend, setAmount] = useState(null);
  const [nftToSend, setNftToSend] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { verifyMetadata } = useVerifyMetadata();

  async function transfer(nft, amount, receiver) {
    console.log(nft, amount, receiver);
    const options = {
      type: nft?.contract_type?.toLowerCase(),
      tokenId: nft?.token_id,
      receiver,
      contractAddress: nft?.token_address,
    };

    if (options.type === 'erc1155') {
      options.amount = amount ?? nft.amount;
    }

    setIsPending(true);

    try {
      const tx = await Moralis.transfer(options);
      console.log(tx);
      setIsPending(false);
    } catch (e) {
      alert(e.message);
      setIsPending(false);
    }
  }

  const handleTransferClick = nft => {
    setNftToSend(nft);
    setVisibility(true);
  };

  const handleChange = e => {
    setAmount(e.target.value);
  };

  return (
    <div className="p-5 w-full">
      {isAuthenticated && (
        <div style={styles.NFTs}>
          {NFTBalances?.result ? (
            NFTBalances.result.map((nft, index) => {
              //Verify Metadata
              nft = verifyMetadata(nft);
              //console.log(nft);
              return (
                <Card
                  title={nft.name}
                  image={<img className="rounded-t-lg" src={nft?.image} alt="" style={{ height: '300px' }} />}
                  footer={
                    <>
                      <Tooltip message="View On Blockexplorer">
                        <DocumentSearchIcon
                          className="h-5 w-5"
                          onClick={() => window.open(`${getExplorer(chainId)}address/${nft.token_address}`, '_blank')}
                        />
                      </Tooltip>
                      <Tooltip message="Transfer NFT">
                        <PaperAirplaneIcon className="h-5 w-5" onClick={() => handleTransferClick(nft)} />
                      </Tooltip>
                      <Tooltip message="Sell On OpenSea">
                        <ShoppingCartIcon className="h-5 w-5" onClick={() => alert('OPENSEA INTEGRATION COMING!')} />
                      </Tooltip>
                    </>
                  }
                  key={index}
                >
                  <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{nft.token_address} </p>
                </Card>
              );
            })
          ) : (
            <Skeleton count={4} />
          )}
        </div>
      )}

      <DisplayModal
        title={`Transfer ${nftToSend?.name || 'NFT'}`}
        isOpen={visible}
        onClose={() => {
          setVisibility(false);
        }}
        onCancel={() => setVisibility(false)}
        onOk={() => transfer(nftToSend, amountToSend, receiverToSend)}
        confirmLoading={isPending}
        okText="Send"
      >
        <AddressInput autoFocus placeholder="Receiver" onChange={setReceiver} />
        {nftToSend && nftToSend.contract_type === 'erc1155' && (
          <input type="text" placeholder="amount to send" onChange={e => handleChange(e)} />
        )}
      </DisplayModal>
    </div>
  );
}

export default NFTBalance;
