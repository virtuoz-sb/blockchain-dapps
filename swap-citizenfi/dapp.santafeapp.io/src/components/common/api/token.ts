import API from "../../../http-common";
import authHeader from './auth-header';
const http = API.santafe

class TokenApi {
  getFavourite(data: any){
    return http.post(`/token/getFavourite`, data, { headers: authHeader() });
  }
  getFavouriteArr(registry: any){
    return http.post(`/token/getFavouriteArr/${registry}`, {}, { headers: authHeader() });
  }
  getMyItems(registry: any){
    return http.post(`/token/getMyTokens/${registry}`,{}, { headers: authHeader() });
  }
  getItems(data: any){
    return http.post(`/token/getTokens`, data, { headers: authHeader() });
  }
  getItem(data: any){
    return http.post(`/token/getItem`, data, { headers: authHeader() });
  }
  getTokensFromRegistry(data: any){
    return http.post(`/token/getTokensFromRegistry`, data, { headers: authHeader() });
  }
  getNewItems(data: any){
    return http.post(`/token/getNewItems`, data, { headers: authHeader() });
  }
  getTopLikedItems(data: any){
    return http.post(`/token/getTopLikedItems`, data, { headers: authHeader() });
  }
  getTokensFromIds(data: any){
    return http.post(`/token/getTokensFromIds`, data, { headers: authHeader() });
  }
  putOnSale(data: any){
    return http.post(`/token/putOnSale`, data, { headers: authHeader() });
  }
  transferTo(data: any){
    return http.post(`/token/transferTo`, data, { headers: authHeader() });
  }
  getRelatedTokens(data: any){
    return http.post(`/token/getRelatedTokens`, data, { headers: authHeader() });
  }
}

export default new TokenApi();