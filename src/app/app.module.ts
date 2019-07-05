import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { ValidatorsService } from '../services/validators/validators.service';
import { FetchService } from '../services/http/fetch.service';
import { RedisService } from '../services/redis/redis.service';
import { ScheduleModule } from 'nest-schedule';
import { ScheduleService } from '../services/schedule/schedule.service';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.register(),
  ],
  controllers: [
    AppController
  ],
  providers: [
    ValidatorsService,
    FetchService,
    RedisService,
    ScheduleService
  ]
})
export class AppModule {}
