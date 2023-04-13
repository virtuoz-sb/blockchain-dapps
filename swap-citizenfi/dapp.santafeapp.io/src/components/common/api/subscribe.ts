import API from "../../../http-common";
const http = API.santafe

class SubscribeApi {
  create(data: any){
    return http.post(`/subscribe/create`, data);
  }
}

export default new SubscribeApi();