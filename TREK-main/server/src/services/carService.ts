import { Injectable, Logger } from '@nestjs/common';
import type { SearchCarDto, BookCarDto, RentalCar } from '@trek/shared';

@Injectable()
export class CarService {
  private readonly logger = new Logger(CarService.name);
  private apiKey: string | null = null;
  private apiHost: string | null = null;

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || null;
    this.apiHost = 'carRentalApis.p.rapidapi.com';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async searchCars(dto: SearchCarDto): Promise<RentalCar[]> {
    if (!this.apiKey) {
      return this.getMockCars(dto);
    }

    try {
      const url = `https://${this.apiHost}/search`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.apiHost,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: dto.city,
          pickup_date: dto.pickupDate,
          return_date: dto.returnDate,
          passengers: dto.passengers,
          transmission: dto.transmission,
          car_type: dto.carType,
        }),
      });

      if (!response.ok) {
        return this.getMockCars(dto);
      }

      const data = await response.json();
      return this.transformApiResponse(data);
    } catch (error) {
      this.logger.error('Car search failed', error);
      return this.getMockCars(dto);
    }
  }

  async bookCar(dto: BookCarDto): Promise<{ id: number; status: string }> {
    return {
      id: Math.floor(Math.random() * 10000),
      status: 'confirmed',
    };
  }

  private transformApiResponse(data: any): RentalCar[] {
    if (!Array.isArray(data)) return [];
    return data.map((car: any) => ({
      id: car.id || car.car_id || '',
      company: car.company || 'Unknown',
      vehicle: car.model || car.vehicle || 'Unknown',
      pickupCity: car.pickup_location || car.city || 'Unknown',
      pickupDate: car.pickup_date || '',
      returnDate: car.return_date || '',
      pricePerDay: parseFloat(car.price_per_day || car.price || 0),
      currency: 'USD',
      passengers: car.passengers || 5,
      transmission: car.transmission || 'automatic',
      carType: car.type || car.car_type || 'economy',
      imageUrl: car.image_url || '',
      available: car.available !== false,
    }));
  }

  private getMockCars(dto: SearchCarDto): RentalCar[] {
    const basePrice = 2500 + Math.random() * 1000;
    return [
      {
        id: 'car-1',
        company: 'Hertz',
        vehicle: 'Toyota Corolla',
        pickupCity: dto.city,
        pickupDate: dto.pickupDate,
        returnDate: dto.returnDate,
        pricePerDay: basePrice,
        currency: 'USD',
        passengers: 5,
        transmission: 'automatic',
        carType: 'economy',
        imageUrl: 'https://placehold.co/400x300?text=Toyota+Corolla',
        available: true,
      },
      {
        id: 'car-2',
        company: 'Europcar',
        vehicle: 'Toyota Innova',
        pickupCity: dto.city,
        pickupDate: dto.pickupDate,
        returnDate: dto.returnDate,
        pricePerDay: basePrice * 1.3,
        currency: 'USD',
        passengers: 7,
        transmission: 'automatic',
        carType: 'suv',
        imageUrl: 'https://placehold.co/400x300?text=Toyota+Innova',
        available: true,
      },
      {
        id: 'car-3',
        company: 'Budget',
        vehicle: 'Maruti Suzuki Celerio',
        pickupCity: dto.city,
        pickupDate: dto.pickupDate,
        returnDate: dto.returnDate,
        pricePerDay: basePrice * 0.7,
        currency: 'USD',
        passengers: 5,
        transmission: 'manual',
        carType: 'economy',
        imageUrl: 'https://placehold.co/400x300?text=Maruti+Celerio',
        available: true,
      },
    ];
  }
}