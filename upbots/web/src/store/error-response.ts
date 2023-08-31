/**
 * Default api's error response type.
 * Must match what is returned by the api http-exception.filter.
 */
export interface ErrorResponse {
  code: number;
  timestamp: Date;
  path: string;
  method: string;
  message: string;
}
