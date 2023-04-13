interface Abi {
  inputs: AbiInputOutput[];
  name: string;
  outputs: AbiInputOutput[];
  stateMutability: string;
  type: string;
}

interface AbiInputOutput {
  internalType: string;
  name: string;
  type: string;
}
