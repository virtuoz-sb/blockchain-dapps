import API from "../../../http-common";
import authHeader from './auth-header';
const http = API.santafe
class UserApi {
  getUserImage(data: any){
    return http.post(`/user/getUserImage`, data);
  }
  getUser(data: any){
    return http.post(`/user/getUser`, data);
  }
  save(data: any){
    return http.post(`/user/save`, data);
  }
  getLikedItems(data: any){
    return http.post(`/user/getLikedItems`, data);
  }
  getSigned(){
    return http.post(`/user/getSigned`, {}, { headers: authHeader() });
  }
  signIn(data: any){
    return http.post(`/user/signIn`, data);
  }
  signUp(data: any){
    return http.post(`/user/signUp`, data);
  }
  verifySignUp(data: any){
    return http.post(`/user/verifySignUp`, {}, {headers: {"x-access-token": data.token}});
  }
  saveByEmail(data: any){
    return http.post(`/user/saveByEmail`, data, { headers: authHeader() });
  }
  forgotPassword(data: any){
    return http.post(`/user/forgotPassword`, data);
  }

  reportItem(data: any){
    return http.post(`/user/reportItem`, data, { headers: authHeader() });
  }
  
  resetPassword(data: any){
    return http.post(`/user/resetPassword`, {email: data.email, password: data.password}, {headers: {"x-access-token": data.token}});
  }
}

export default new UserApi();