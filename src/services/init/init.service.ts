import { Injectable } from '@nestjs/common';
import * as validators from './init.config.json';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class InitService {
  constructor(private redisService: RedisService) { 
    this.initAddressSet();
  }

  public initAddressSet() {
    this.redisService.getRedisInstance()
      .sadd('validators_set', validators.set)
      .then((result) => console.log(`Addresses added: ${result}`))
      .catch(console.log);
  }
}
