import API from "../../../http-common";

const http = API.santafe_meta
class SantaV2 {
  mint(data: any){
    return http.post(`/santaV2/mint`, data);
  }
  
  getRetrieve(data: any){
    return http.post(`/santaV2/retrieve/get`, data);
  }
  successRetrieve(data: any){
    return http.post(`/santaV2/retrieve/success`, data);
  }
}

export default new SantaV2();