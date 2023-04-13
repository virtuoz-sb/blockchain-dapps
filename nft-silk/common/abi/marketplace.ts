const makretplaceAbis = {
  acceptOffer: [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'nftContract',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'tokenID',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'index',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'quantity',
          type: 'uint256',
        },
      ],
      name: 'acceptOffer',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],

  createMarketItem: [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'nftContract',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'tokenID',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'price',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'quantity',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'exp',
          type: 'uint256',
        },
      ],
      name: 'createMarketItem',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],

  createMarketSale: [
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'itemID',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'quantity',
          type: 'uint256',
        },
      ],
      name: 'createMarketSale',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
  ],

  deleteMarketItem: [
    {
      inputs: [{ internalType: 'uint256', name: 'itemID', type: 'uint256' }],
      name: 'deleteMarketItem',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],

  deleteOffer: [
    {
      inputs: [
        { internalType: 'address', name: 'nftContract', type: 'address' },
        { internalType: 'uint256', name: 'tokenID', type: 'uint256' },
        { internalType: 'uint256', name: 'index', type: 'uint256' },
      ],
      name: 'deleteOffer',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],

  fetchMarketItemsbyAddress: [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'tokenAddress',
          type: 'address',
        },
      ],
      name: 'fetchMarketItemsbyAddress',
      outputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'itemID',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'nftContract',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'tokenID',
              type: 'uint256',
            },
            {
              internalType: 'address payable',
              name: 'seller',
              type: 'address',
            },
            {
              internalType: 'address payable',
              name: 'owner',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'price',
              type: 'uint256',
            },
            {
              internalType: 'bool',
              name: 'sold',
              type: 'bool',
            },
            {
              internalType: 'uint256',
              name: 'quantity',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'exp',
              type: 'uint256',
            },
          ],
          internalType: 'struct Marketplace.MarketItem[]',
          name: '',
          type: 'tuple[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ],

  floorPrices: [
    {
      inputs: [{ internalType: 'string', name: 'collectionType', type: 'string' }],
      name: 'floorPrices',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ],

  makeOffer: [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'nftContract',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'tokenID',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'quantity',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'exp',
          type: 'uint256',
        },
      ],
      name: 'makeOffer',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
  ],
};

export default makretplaceAbis;
