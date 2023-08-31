export interface AdminAlgoBotSubscription {
  id: string;
  botId: string;
  apiKeyRef: string;
  enabled: boolean;
  isOwner: boolean;
  botRunning: boolean;
  stratType: string;
  createdAt: Date;
  updatedAt: Date;
  cycleSequence: number;
  status: number;
  accountPercent: number;
  errorReason: string;
  user: string;
}
