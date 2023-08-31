/**
 * technical (internal) order event
 */
export default interface OrderEventPayload extends OrderEventData {
  exDelay: number; // do not expose
  error: string; // do not expose technical error (only error reason)
  source: string;
}

/**
 * public visible properties
 */
export interface OrderEventData {
  exOrderId: string;
  orderTrack: string;
  status: string;
  type: string;
  side: string;
  sbl: string;
  exch: string;
  qOrig: string;
  qExec: string;
  qRem: string;
  qExecCumul: string;
  accountRef: string;
  userId: string;
  pAsk: string;
  pExec: string;
  cumulQuoteCost: string;
  botName: string;
  initiator: string;
  errorReason: string;
}

/* payload example
{"exOrderId":"04fcf98c-1a07-e954-5899-173373fd5514","orderTrack":"5f52582a802e746e2e04d569","status":"FILLED","type":"MARKET","price":"10237","side":"BUY","sbl":"XBTUSD","exch":"bitmex_test","qOrig":"1","qExec":"1","qRem":"0","exDelay":159,"accountRef":"","userId":""}
{"exOrderId":"4515634335","orderTrack":"6011235d424873c9bf61e676","status":"FILLED", "type":"MARKET","side":"BUY","sbl":"BTCUSDT","exch":"binance","qOrig":"0.00037400","qExec":"0.00037400","qRem":"0","exDelay":632,"accountRef":"5fb502d4ab795dc3b223d62b","userId":"5ef31aef22ebd022d3b01b7d","source":"o","pAsk":"0.00000000","pExec":"31647.39","cumulQuoteCost":"11.83612386","initiator":"direct"}
{"exOrderId":"","orderTrack":"6011320d424873c9bf61e67a","status":"ERROR","type":"LIMIT","side":"SELL","sbl":"BTCUSDT","exch":"binance","exDelay":606,"accountRef":"5fb502d4ab795dc3b223d62b","userId":"5ef31aef22ebd022d3b01b7d","source":"o","initiator":"direct","error":"\u003cAPIError\u003e code=-2010, msg=Account has insufficient balance for requested action.","errorReason":"-2010"}
*/
