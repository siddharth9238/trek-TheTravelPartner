import { Injectable, Logger } from '@nestjs/common';
import type { SearchTaxiDto, BookTaxiDto, TaxiResult } from '@trek/shared';

@Injectable()
export class TaxiService {
  private readonly logger = new Logger(TaxiService.name);
  private apiKey: string | null = null;
  private baseUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || null;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async searchTaxi(dto: SearchTaxiDto): Promise<TaxiResult[]> {
    if (!this.apiKey) {
      return this.getMockTaxiResults(dto);
    }

    try {
      const origin = encodeURIComponent(dto.pickup);
      const destination = encodeURIComponent(dto.drop);
      const url = `${this.baseUrl}?origins=${origin}&destinations=${destination}&key=${this.apiKey}`;

      const response = await fetch(url);
      if (!response.ok) {
        return this.getMockTaxiResults(dto);
      }

      const data = (await response.json()) as { rows?: { elements?: { distance?: { text?: string; value?: number }; duration?: { text?: string } }[] }[] };
      const element = data.rows?.[0]?.elements?.[0];
      
      if (!element) {
        return this.getMockTaxiResults(dto);
      }

      const distance = element.distance?.text || '5 km';
      const duration = element.duration?.text || '15 min';
      const fare = this.calculateFare(element.distance?.value || 5000);

      return [
        {
          id: 'std-1',
          type: 'Standard',
          fare,
          duration,
          distance,
          eta: '5-10 min',
        },
        {
          id: 'suv-1',
          type: 'SUV',
          fare: fare * 1.5,
          duration: this.subtractMinutes(duration, 5),
          distance,
          eta: '3-5 min',
        },
      ];
    } catch (error) {
      this.logger.error('Taxi search failed', error);
      return this.getMockTaxiResults(dto);
    }
  }

  async bookTaxi(dto: BookTaxiDto): Promise<{ id: number; status: string }> {
    // In production, this would save to database
    // For now, return mock booking
    return {
      id: Math.floor(Math.random() * 10000),
      status: 'confirmed',
    };
  }

  private calculateFare(distanceMeters: number): number {
    const baseFare = 100;
    const perKmRate = 15;
    const distanceKm = distanceMeters / 1000;
    return Math.round(baseFare + distanceKm * perKmRate);
  }

  private subtractMinutes(duration: string, minutes: number): string {
    const match = duration.match(/(\d+)\s*min/);
    if (match) {
      const mins = parseInt(match[1], 10) - minutes;
      return `${Math.max(1, mins)} min`;
    }
    return duration;
  }

  private getMockTaxiResults(dto: SearchTaxiDto): TaxiResult[] {
    const fare = Math.floor(Math.random() * 2000) + 1500;
    return [
      {
        id: 'std-1',
        type: 'Standard',
        fare,
        duration: '25 min',
        distance: '12.5 km',
        eta: '5-10 min',
      },
      {
        id: 'suv-1',
        type: 'SUV',
        fare: fare + 500,
        duration: '20 min',
        distance: '12.5 km',
        eta: '3-5 min',
      },
    ];
  }
}