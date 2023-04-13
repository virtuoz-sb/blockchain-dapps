const horsePartnershipAbis = {
  fractionalize: [
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'horseID',
          type: 'uint256',
        },
      ],
      name: 'fractionalize',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],

  reconstitute: [
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'horseID',
          type: 'uint256',
        },
      ],
      name: 'reconstitute',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
};

export default horsePartnershipAbis;
