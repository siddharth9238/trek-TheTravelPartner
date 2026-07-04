import { Controller, Get, Query, UseGuards, HttpException } from '@nestjs/common';
import { HotelService } from '../../services/hotelService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { SearchHotelDto, HotelSearchResponse } from '@trek/shared';

@Controller('api/hotels')
@UseGuards(JwtAuthGuard)
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Get('search')
  async search(
    @Query() dto: SearchHotelDto,
  ): Promise<HotelSearchResponse> {
    if (!this.hotelService.isConfigured()) {
      throw new HttpException(
        { error: 'Hotel search is not configured. Set HOTEL_API_KEY or RAPIDAPI_KEY in server environment.' },
        503,
      );
    }

    if (!dto.city || !dto.checkIn || !dto.checkOut) {
      throw new HttpException(
        { error: 'City, check-in date, and check-out date are required' },
        400,
      );
    }

    try {
      return await this.hotelService.searchHotels(dto);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Hotel search failed';
      throw new HttpException({ error: message }, 500);
    }
  }
}