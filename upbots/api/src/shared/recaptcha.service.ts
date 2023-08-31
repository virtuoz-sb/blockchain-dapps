import { Injectable, HttpService } from "@nestjs/common";
/* eslint-disable import/no-extraneous-dependencies */
import { AxiosResponse, AxiosRequestConfig } from "axios";
import { RegisterDTO } from "../auth/auth.dto";
import { ReCAPTCHAResponse } from "../types/recaptcha";

@Injectable()
export default class RecaptchaService {
  constructor(private readonly http: HttpService) {}

  async decodeCaptcha(cred: RegisterDTO): Promise<AxiosResponse<ReCAPTCHAResponse>> {
    const data = {
      secret: `${process.env.RECAPTCHA_SECRET_KEY}`,
      response: cred.captcha,
    };
    const conf: AxiosRequestConfig = { params: data };
    return this.http.post<ReCAPTCHAResponse>(`${process.env.RECAPTCHA_VALIDATE_API}`, null, conf).toPromise();
    /*  const conf: AxiosRequestConfig = { params: data };
    return new Promise((resolve, reject) => {
      axios
        .post<ReCAPTCHAResponse>(`${process.env.RECAPTCHA_VALIDATE_API}`, null, conf)
        .then(response => {
          const res = response && response.data;
          resolve(res);
        })
        .catch((error: AxiosError) => {
          const res = error && error.response && error.response.data;
          reject(error);
        });
    }); */
  }
}
