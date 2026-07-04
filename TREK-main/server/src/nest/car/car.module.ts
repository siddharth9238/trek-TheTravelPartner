import { Module } from '@nestjs/common';
import { CarController } from './car.controller';
import { CarService } from '../../services/carService';

@Module({
  controllers: [CarController],
  providers: [CarService],
  exports: [CarService],
})
export class CarModule {}