import API from "../../../http-common";
const http = API.santafe

class ArtistApi {
  get(data: any){
    return http.post(`/artist/get`, data);
  }
}

export default new ArtistApi();