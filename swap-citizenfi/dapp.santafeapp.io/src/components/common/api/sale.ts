import API from "../../../http-common";
// import authHeader from './auth-header';
const http = API.santafe
class SaleApi {
  putOnSale(data: any){
    return http.post(`/sale/create`, data);
  }
  getLiveAuctionList(){
    return http.post(`/sale/getLiveAuctionList`);
  }
  getFixedSaleList(data: any){
    return http.post(`/sale/getFixedSaleList`, data);
  }
  getSaleData(data: any){
    return http.post(`/sale/getSaleData`, data);
  }
  buySale(data: any){
    return http.post(`/sale/buySale`, data);
  }
  placeBid(data: any){
    return http.post(`/sale/placeBid`, data);
  }
  cancelOrder(data: any){
    return http.post(`/sale/cancelOrder`, data);
  }
  getSaleList(data: any){
    return http.post(`/sale/getSaleList`, data);
  }
  getRelatedSaleList(data: any){
    return http.post(`/sale/getRelatedSaleList`, data);
  }
  getTotalRows(){
    return http.post(`/sale/getTotalRows`);
  }
}

export default new SaleApi();