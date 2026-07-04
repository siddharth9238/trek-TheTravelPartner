import { Controller, Get, Query, Param, UseGuards, HttpException } from '@nestjs/common';
import { FlightService } from '../../services/flightService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { SearchFlightDto, FlightSearchResponse, FlightResult } from '@trek/shared';

@Controller('api/flights')
@UseGuards(JwtAuthGuard)
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Get('search')
  async search(
    @Query() dto: SearchFlightDto,
  ): Promise<FlightSearchResponse> {
    if (!this.flightService.isConfigured()) {
      throw new HttpException(
        { error: 'Flight search is not configured. Set AVIATION_API_KEY or RAPIDAPI_KEY in server environment.' },
        503,
      );
    }

    if (!dto.from || !dto.to || !dto.date) {
      throw new HttpException(
        { error: 'Origin (from), destination (to), and date are required' },
        400,
      );
    }

    try {
      return await this.flightService.searchFlights(dto);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Flight search failed';
      throw new HttpException({ error: message }, 500);
    }
  }

  @Get('arrivals/:icaoCode')
  async getArrivals(
    @Param('icaoCode') icaoCode: string,
    @Query('hoursAgo') hoursAgo?: number,
    @Query('hoursAhead') hoursAhead?: number,
  ): Promise<FlightResult[]> {
    if (!this.flightService.isConfigured()) {
      throw new HttpException(
        { error: 'Flight search is not configured. Set RAPIDAPI_KEY in server environment.' },
        503,
      );
    }

    if (!icaoCode) {
      throw new HttpException(
        { error: 'ICAO code is required' },
        400,
      );
    }

    try {
      return await this.flightService.getAirportFlights(icaoCode, 'arrivals');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get arrivals';
      throw new HttpException({ error: message }, 500);
    }
  }

  @Get('departures/:icaoCode')
  async getDepartures(
    @Param('icaoCode') icaoCode: string,
    @Query('hoursAgo') hoursAgo?: number,
    @Query('hoursAhead') hoursAhead?: number,
  ): Promise<FlightResult[]> {
    if (!this.flightService.isConfigured()) {
      throw new HttpException(
        { error: 'Flight search is not configured. Set RAPIDAPI_KEY in server environment.' },
        503,
      );
    }

    if (!icaoCode) {
      throw new HttpException(
        { error: 'ICAO code is required' },
        400,
      );
    }

    try {
      return await this.flightService.getAirportFlights(icaoCode, 'departures');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get departures';
      throw new HttpException({ error: message }, 500);
    }
  }
}