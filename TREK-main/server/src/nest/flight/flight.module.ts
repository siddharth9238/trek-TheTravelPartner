import { Module } from '@nestjs/common';
import { FlightController } from './flight.controller';
import { FlightService } from '../../services/flightService';

@Module({
  controllers: [FlightController],
  providers: [FlightService],
  exports: [FlightService],
})
export class FlightModule {}