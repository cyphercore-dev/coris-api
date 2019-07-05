import { Injectable } from '@nestjs/common';
import * as validatorsSet from './init.config.json';
import { RedisService } from '../redis/redis.service.js';

@Injectable()
export class InitService {
  constructor(private redisService: RedisService) { }

  public initAddressSet() {
    this.redisService.getRedisInstance()
      .sadd('validators_set', validatorsSet)
      .then((result) => console.log(`Addresses added: ${result}`))
      .catch(console.log);
  }
}
