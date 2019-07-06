import { Controller, Get, Res } from '@nestjs/common';
import { ValidatorsService } from '../services/validators/validators.service'
import { Response } from 'express';

@Controller('validators')
export class AppController {
  constructor( private readonly validatorsService: ValidatorsService ) { }

  @Get()
  index(@Res() res: Response) {
    this.validatorsService
      .getValidatorsBlob().then((blob: string) => {
        res.send( JSON.parse(blob) );
      })
      .catch((error) => res.send('Error reading from Redis!'))
  }
}