export default interface OrderAuditQuery {
  page: number;
  /** number of items per page */
  pageSize: number;

  botId?: string;
  botCycle?: number;
  signalCorrelation?: string;
}
