import { Injectable, HttpService, OnModuleInit } from '@nestjs/common';
import * as http from 'http';
import Axios, { AxiosInstance } from 'axios';
import { GAIA_REST_URI } from './fetch.config.json';

@Injectable()
export class FetchService implements OnModuleInit {
  private httpAgent: http.Agent = new http.Agent({ maxSockets: 6, keepAlive: true });
  private axiosInstance: AxiosInstance = Axios.create({
    baseURL: GAIA_REST_URI,
    httpAgent: this.httpAgent,
  });
  private httpClient: HttpService = new HttpService(this.axiosInstance);

  constructor() { }

  onModuleInit() {
    // this.debugInterceptors();
  }

  public getHttpClient() {
    return this.httpClient;
  }

  private debugInterceptors() {
    // @aakatev Call in constructor to debug axious requests
    this.axiosInstance.interceptors.request.use(request => {
      console.log('Starting Request', request.url)
      return request;
    });
    this.axiosInstance.interceptors.response.use(response => {
      console.log('Response:', response.headers)
      return response;
    })
  }

}
