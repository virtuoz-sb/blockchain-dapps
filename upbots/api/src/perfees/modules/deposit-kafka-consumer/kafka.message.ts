/* eslint-disable max-classes-per-file */
export class DepositPayload {
  public symbol: string;

  public to: string;

  public value: number;

  public txhash: string;

  public explorer: string;

  public confirmations: number;

  public userId: any;

  create?(symbol, to, value, txhash, explorer, confirmations, userId): DepositPayload {
    return {
      symbol,
      to,
      value,
      txhash,
      explorer,
      confirmations,
      userId,
    };
  }
}

type SASLMechanismOptionsMap = {
  plain: { username: string; password: string };
};

export type SASLMechanism = keyof SASLMechanismOptionsMap;
type SASLMechanismOptions<T> = T extends SASLMechanism ? { mechanism: T } & SASLMechanismOptionsMap[T] : never;
export type SASLOptions = SASLMechanismOptions<SASLMechanism>;

export declare class DepositConfig {
  clientId: string;

  brokers: string[];

  groupId: string;

  sasl?: SASLOptions;
}
