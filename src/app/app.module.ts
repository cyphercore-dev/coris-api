import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { ValidatorsService } from '../services/validators/validators.service';
import { FetchService } from '../services/http/fetch.service';
import { RedisService } from '../services/redis/redis.service';

@Module({
  imports: [
    HttpModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    ValidatorsService,
    FetchService,
    RedisService
  ]
})
export class AppModule {}
