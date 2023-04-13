const farmAbis = {
  farmParams: [
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      name: 'farmParams',
      outputs: [
        {
          internalType: 'uint256',
          name: 'minTerm',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'maxTerm',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'ownerFee',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'destablingFee',
          type: 'uint256',
        },
        {
          internalType: 'bool',
          name: 'openFarm',
          type: 'bool',
        },
        {
          internalType: 'uint256',
          name: 'stableID',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ],

  manualfulfill: [
    {
      inputs: [],
      name: 'manualfulfill',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],

  setApprovalForAll: [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'operator',
          type: 'address',
        },
        {
          internalType: 'bool',
          name: 'approved',
          type: 'bool',
        },
      ],
      name: 'setApprovalForAll',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],

  stableHorse: [
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'horseID',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'farmID',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'stableTerm',
          type: 'uint256',
        },
      ],
      name: 'stableHorse',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
  ],

  wrapLandToFarmReq: [
    {
      inputs: [
        {
          internalType: 'uint256[]',
          name: 'ids',
          type: 'uint256[]',
        },
        {
          internalType: 'string',
          name: 'farmName',
          type: 'string',
        },
        {
          internalType: 'uint256',
          name: 'minTerm',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'maxTerm',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'destablingFee',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'ownerFee',
          type: 'uint256',
        },
        {
          internalType: 'bool',
          name: 'openFarm',
          type: 'bool',
        },
        {
          internalType: 'uint256',
          name: 'stableID',
          type: 'uint256',
        },
      ],
      name: 'wrapLandtoFarmReq',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],

  checkStableRequests: [
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'farmID',
          type: 'uint256',
        },
      ],
      name: 'checkStableRequests',
      outputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'horseID',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'farmID',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'requester',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'stableTerm',
              type: 'uint256',
            },
          ],
          internalType: 'struct Farm.StableRequest[]',
          name: '',
          type: 'tuple[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ],

  approveRequest: [
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'farmID',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'reqnum',
          type: 'uint256',
        },
      ],
      name: 'approveRequest',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],

  removeRequest: [
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'farmID',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'reqnum',
          type: 'uint256',
        },
      ],
      name: 'removeRequest',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],

  destable: [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "horseID",
          type: "uint256"
        }
      ],
      name: "destable",
      outputs: [],
      stateMutability: "payable",
      type: "function"
    },
  ]
};

export default farmAbis;
