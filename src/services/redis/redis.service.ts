import { Injectable } from '@nestjs/common';
import * as REDIS_CONFIG from './redis.config.json';
import Redis from "ioredis";


@Injectable()
export class RedisService {
  private redisInstance = new Redis(REDIS_CONFIG);
  
  public getRedisInstance() { return this.redisInstance; }
}
