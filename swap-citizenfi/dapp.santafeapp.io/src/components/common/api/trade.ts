import API from "../../../http-common";
const http = API.santafe
class TradeApi {
    getLatestData(){
        return http.post(`/trade/getLatestData`);
    }
    getNewTrades(data: any){
        return http.post(`/trade/getNewTrades`, data);
    }
    searchKey(data: any){
        return http.post(`/trade/searchKey`, data);
    }
}

export default new TradeApi();