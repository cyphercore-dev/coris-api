import { Injectable} from '@nestjs/common';
import { NestSchedule, Cron } from 'nest-schedule';
import { ValidatorsService } from '../validators/validators.service';
import { CRON_INTERVAL } from './schedule.config.json'

@Injectable()
export class ScheduleService extends NestSchedule {    
  constructor(
    // @Inject(forwardRef(() => ValidatorsService))
    private readonly validatorsService: ValidatorsService,
  ) {
    super();
    console.log("SCHEDULER STARTED!");
  }

  @Cron(CRON_INTERVAL)
  async cronJob() {
    this.validatorsService.initValidators();
  }

}