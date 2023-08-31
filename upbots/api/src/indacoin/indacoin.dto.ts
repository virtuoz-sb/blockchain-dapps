export interface IndacoinTransactionDTO {
  userId: string;
  transactionId: string;
  requestId: string;
  status: string;
  extraStatus: string;
  curIn: string;
  curOut: string;
  blockchainHash: string;
  link: string;
  targetAddress: string;
  amountIn: number;
  amountOut: number;
  confirmedAt: Date;
  finishedAt: Date;
  createdAt: Date;
}
export interface CreateIndacoinDTO {
  transactionId: string;
  requestId: string;
  status: string;
  extraStatus: string;
  curIn: string;
  curOut: string;
  blockchainHash: string;
  link: string;
  targetAddress: string;
  amountIn: number;
  amountOut: number;
  confirmedAt: Date;
  finishedAt: Date;
  createdAt: Date;
}

export type UpdateIndacoinDTO = Partial<CreateIndacoinDTO>;
