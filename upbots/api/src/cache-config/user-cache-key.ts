/* eslint-disable import/prefer-default-export */
export function formatUserCacheKey(userId, reqUrl: string): string {
  return `_${userId}${reqUrl}`;
}
