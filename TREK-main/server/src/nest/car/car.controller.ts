import { Controller, Get, Post, Delete, Query, Body, UseGuards, HttpException } from '@nestjs/common';
import { CarService } from '../../services/carService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { SearchCarDto, BookCarDto } from '@trek/shared';

@Controller('api/car')
@UseGuards(JwtAuthGuard)
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Get('search')
  async searchCars(@Query() dto: SearchCarDto) {
    if (!this.carService.isConfigured()) {
      return { error: 'Car search is not configured. Set RAPIDAPI_KEY.' };
    }
    return this.carService.searchCars(dto);
  }

  @Post('book')
  async bookCar(@Body() dto: BookCarDto) {
    if (!this.carService.isConfigured()) {
      return { error: 'Car booking is not configured. Set RAPIDAPI_KEY.' };
    }
    return this.carService.bookCar(dto);
  }

  @Delete(':id')
  async cancelCar(@Query('id') id: string) {
    return { success: true, message: `Car booking ${id} cancelled` };
  }
}