import API from "../../../http-common";

const http = API.santafe_meta
class Santa {
  isWhiteList(address: string){
    return http.get(`/whitelist/` + address);
  }
}

export default new Santa();