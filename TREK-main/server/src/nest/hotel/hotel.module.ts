import { Module } from '@nestjs/common';
import { HotelController } from './hotel.controller';
import { HotelService } from '../../services/hotelService';

@Module({
  controllers: [HotelController],
  providers: [HotelService],
  exports: [HotelService],
})
export class HotelModule {}