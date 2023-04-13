import axios from 'axios';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { getTokens } from '@hooks/useAdminStore';

//API AXIOS INSTANCE FOR ADMIN - Cognito token handling

const baseUrl = process?.env?.NEXT_PUBLIC_API_BASE;

let instance = axios.create({ baseURL: baseUrl });

instance?.interceptors.request.use(
  async function (config: AxiosRequestConfig) {
    const session = await getTokens();

    try {
      const token = session.getAccessToken().getJwtToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        //console.log('INTERCEPT TOKEN', token, config, session);
      }
    } catch (error) {
      console.error('INTERCEPT TOKEN ERROR', error, config);
      //Auth.signOut()
      //log out / refresh
    }

    return config;
  },
  async function (error: AxiosError) {
    return Promise.reject(error);
  }
);

export default instance;
