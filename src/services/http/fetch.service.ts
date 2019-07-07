import { Injectable, HttpService, OnModuleInit } from '@nestjs/common';
import * as http from 'http';
import * as Agent from 'agentkeepalive';
import Axios, { AxiosInstance } from 'axios';
import { GAIA_REST_URI } from './fetch.config.json';

@Injectable()
export class FetchService implements OnModuleInit {
  private httpAgent: http.Agent;
  private axiosInstance: AxiosInstance;
  private httpClient: HttpService;

  constructor() {
    this.httpAgent = new Agent.default({
      maxSockets: 15,
      maxFreeSockets: 15,
      timeout: 60000, // active socket keepalive for 60 seconds
      freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
    });

    this.axiosInstance = Axios.create({
      baseURL: GAIA_REST_URI,
      httpAgent: this.httpAgent,
    });

        // @aakatev Call in constructor to debug axious requests
        this.axiosInstance.interceptors.request.use(request => {
          console.log('Starting Request', request.url)
          return request;
        });
        this.axiosInstance.interceptors.response.use(response => {
          console.log('Response:', response.headers)
          return response;
        })

    this.httpClient = new HttpService(this.axiosInstance);
  }

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
