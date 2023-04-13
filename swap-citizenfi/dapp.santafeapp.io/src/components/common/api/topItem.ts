import API from "../../../http-common";
const http = API.santafe

class TopItemApi {
  getAll() {
    return http.get("/trendingItem");
  }

  get(id:any) {
    return http.get(`/trendingItem/${id}`);
  }

  like(data: any){
    return http.post(`/token/like`, data);
  }
}

export default new TopItemApi();