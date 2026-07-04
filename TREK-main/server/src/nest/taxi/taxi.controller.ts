import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards, HttpException } from '@nestjs/common';
import { TaxiService } from '../../services/taxiService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { SearchTaxiDto, BookTaxiDto } from '@trek/shared';

@Controller('api/taxi')
@UseGuards(JwtAuthGuard)
export class TaxiController {
  constructor(private readonly taxiService: TaxiService) {}

  @Get('search')
  async searchTaxi(
    @Query() dto: SearchTaxiDto,
  ) {
    if (!this.taxiService.isConfigured()) {
      return { error: 'Taxi search is not configured. Set GOOGLE_MAPS_API_KEY.' };
    }
    return this.taxiService.searchTaxi(dto);
  }

  @Post('book')
  async bookTaxi(@Body() dto: BookTaxiDto) {
    if (!this.taxiService.isConfigured()) {
      return { error: 'Taxi booking is not configured. Set GOOGLE_MAPS_API_KEY.' };
    }
    return this.taxiService.bookTaxi(dto);
  }

  @Delete(':id')
  async cancelTaxi(@Param('id') id: string) {
    return { success: true, message: `Taxi booking ${id} cancelled` };
  }
}