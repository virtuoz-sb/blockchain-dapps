import API from "../../../http-common";
const http = API.santafe

class RegistryApi {
  getAll() {
    return http.get("/registry");
  }

  get(id:any) {
    return http.get(`/registry/${id}`);
  }

  create(data:any) {
    return http.post("/registry", data);
  }

  search(query: any){
    return http.get("/registry/search?" + query);
  }

  getWhere(query: any){
    return http.post("/registry/getWhere" , query);
  }

  getSaleCollections(query: any){
    return http.post("/registry/getSaleCollections" , query);
  }

  visitRegistry(id: any){
    return http.post(`/registry/visitRegistry/${id}`);
  }

  mintToken(data: any){
    return http.post(`/registry/mintToken`, data);
  }

  like(id: any){
    return http.post(`/registry/like/${id}`);
  }
  
  getLatest(cnt: any){
    return http.get(`/registry/getLatest/${cnt}`);
  }

  getLastSome(data: any){
    return http.post(`/registry/getLastSome`, data);
  }

  getTrending(cnt: any){
    return http.get(`/registry/getTrending/${cnt}`);
  }

  update(id:any, data:any) {
    return http.post(`/registry/update/${id}`, data);
  }

  delete(id:any) {
    return http.delete(`/registry/${id}`);
  }

  deleteAll() {
    return http.delete(`/registry`);
  }

  findByTitle(title:any) {
    return http.get(`/registry?title=${title}`);
  }
}

export default new RegistryApi();