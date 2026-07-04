import { Module } from '@nestjs/common';
import { TaxiController } from './taxi.controller';
import { TaxiService } from '../../services/taxiService';

@Module({
  controllers: [TaxiController],
  providers: [TaxiService],
  exports: [TaxiService],
})
export class TaxiModule {}