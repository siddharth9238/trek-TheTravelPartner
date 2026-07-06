import { Controller, Get, HttpException, Query, UseGuards } from '@nestjs/common';
import type { WeatherResult } from '@trek/shared';
import { WeatherService } from './weather.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiError } from '../../services/weatherService';
import { searchNominatim } from '../../services/mapsService';

/**
 * /api/weather — first migrated leaf module (the pilot).
 *
 * Behaviour is byte-identical to the legacy Express route (server/src/routes/
 * weather.ts): same paths, query params, status codes and `{ error }` bodies.
 *
 * Parity note: the "X is required" 400s and the 500 fallback messages are bespoke
 * strings, not the generic Zod-pipe envelope, so they are reproduced here exactly
 * rather than derived from the schema. The Zod contract/types live in
 * @trek/shared/weather and are used for typing; `lang` defaults to 'de' only when
 * the param is absent, matching the Express destructuring default.
 */
@Controller('weather') // <-- FIX: Changed from 'api/weather' to 'weather'
@UseGuards(JwtAuthGuard)
export class WeatherController {
  constructor(private readonly weather: WeatherService) {}

  @Get()
  async getWeather(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('location') location?: string,
    @Query('date') date?: string,
    @Query('lang') lang?: string,
  ): Promise<WeatherResult> {
    let finalLat = lat;
    let finalLng = lng;

    if (!finalLat || !finalLng) {
      if (!location) {
        throw new HttpException({ error: 'Latitude, longitude, or location is required' }, 400);
      }
      try {
        const results = await searchNominatim(location);
        if (!results || results.length === 0 || !results[0].lat || !results[0].lng) {
          throw new HttpException({ error: 'Could not find location' }, 404);
        }
        finalLat = String(results[0].lat);
        finalLng = String(results[0].lng);
      } catch (err) {
        const message = err instanceof HttpException ? err.message : 'Geocoding failed';
        throw new HttpException(typeof message === 'string' ? { error: message } : message, err instanceof HttpException ? err.getStatus() : 400);
      }
    }
    try {
      return await this.weather.get(finalLat, finalLng, date, lang ?? 'de');
    } catch (err: unknown) {
      throw toHttp(err, 'Weather error:', 'Error fetching weather data');
    }
  }

  @Get('detailed')
  async getDetailed(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('location') location?: string,
    @Query('date') date?: string,
    @Query('lang') lang?: string,
  ): Promise<WeatherResult> {
    let finalLat = lat;
    let finalLng = lng;

    if (!finalLat || !finalLng) {
      if (!location) {
        throw new HttpException({ error: 'Latitude, longitude, or location is required' }, 400);
      }
      try {
        const results = await searchNominatim(location);
        if (!results || results.length === 0 || !results[0].lat || !results[0].lng) {
          throw new HttpException({ error: 'Could not find location' }, 404);
        }
        finalLat = String(results[0].lat);
        finalLng = String(results[0].lng);
      } catch (err) {
        const message = err instanceof HttpException ? err.message : 'Geocoding failed';
        throw new HttpException(typeof message === 'string' ? { error: message } : message, err instanceof HttpException ? err.getStatus() : 400);
      }
    }
    if (!date) {
      throw new HttpException({ error: 'Date is required for detailed weather' }, 400);
    }
    try {
      return await this.weather.getDetailed(finalLat, finalLng, date, lang ?? 'de');
    } catch (err: unknown) {
      throw toHttp(err, 'Detailed weather error:', 'Error fetching detailed weather data');
    }
  }
}

/** Maps a thrown error to the same status + `{ error }` body the Express route sent. */
function toHttp(err: unknown, logPrefix: string, fallback: string): HttpException {
  if (err instanceof ApiError) {
    return new HttpException({ error: err.message }, err.status);
  }
  console.error(logPrefix, err);
  return new HttpException({ error: fallback }, 500);
}