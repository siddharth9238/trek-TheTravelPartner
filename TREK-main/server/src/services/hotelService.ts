import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import type { SearchHotelDto, HotelResult, HotelSearchResponse } from '@trek/shared';

@Injectable()
export class HotelService {
  private readonly logger = new Logger(HotelService.name);
  private apiKey: string | null = null;
  private apiHost: string | null = null;
  private readonly baseUrl = 'https://booking-com.p.rapidapi.com/v1';

  constructor() {
    this.apiKey = process.env.HOTEL_API_KEY || process.env.RAPIDAPI_KEY || null;
    this.apiHost = process.env.HOTEL_API_HOST || 'booking-com.p.rapidapi.com';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  private getHeaders() {
    return {
      'X-RapidAPI-Key': this.apiKey,
      'X-RapidAPI-Host': this.apiHost,
      'Content-Type': 'application/json',
    };
  }

  async searchDestinations(searchQuery: string) {
    try {
      this.logger.log(`Proxying location query: ${searchQuery}`);

      // FIX: Changed 'query' to 'name', strictly required by the /hotels/locations endpoint
      const params = new URLSearchParams({
        name: searchQuery,
        locale: 'en-gb',
      });

      const response = await fetch(`${this.baseUrl}/hotels/locations?${params.toString()}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      let data;
      if (!response.ok) {
        // Fallback for older API versions that might use /locations/search and 'query'
        const fallbackParams = new URLSearchParams({
          query: searchQuery,
          locale: 'en-gb'
        });
        
        const fallbackResponse = await fetch(`${this.baseUrl}/locations/search?${fallbackParams.toString()}`, {
          method: 'GET',
          headers: this.getHeaders(),
        });
        
        if (!fallbackResponse.ok) {
          throw new Error(`API error: ${response.status} & Fallback error: ${fallbackResponse.status}`);
        }
        data = await fallbackResponse.json();
      } else {
        data = await response.json();
      }

      // Securely extract the locations array
      const payload = (data ?? {}) as any;
      const locations = Array.isArray(payload) ? payload : (payload.result || payload.results || payload.data || []);

      return locations.map((loc: any) => ({
        id: loc.dest_id || loc.hotel_id || loc.id,
        name: loc.name || loc.city_name || loc.title,
        country: loc.country_name || loc.country || '',
        type: loc.dest_type || 'city',
      }));
    } catch (error: any) {
      this.logger.error(`Location search failed: ${error.message}`);
      throw new HttpException(`Booking API Error: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getLiveAvailability(attractionId: string, date: string, currency: string = 'USD') {
    if (!attractionId) {
      throw new Error('attractionId is required');
    }

    try {
      const params = new URLSearchParams({
        attraction_id: attractionId,
        date: date,
        locale: 'en-gb',
        currency: currency,
      });

      const response = await fetch(`${this.baseUrl}/attractions/availability?${params.toString()}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
    } catch (error: any) {
      throw new HttpException(`Booking API Availability Error: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async searchHotels(dto: SearchHotelDto): Promise<HotelSearchResponse> {
    if (!this.apiKey) {
      throw new Error('Hotel search is not configured. Set RAPIDAPI_KEY.');
    }

    const params: Record<string, string> = {
      checkin_date: dto.checkIn,
      checkout_date: dto.checkOut,
      adults_number: dto.guests?.toString() || '1',
      room_number: dto.rooms?.toString() || '1',
      dest_type: 'city',
      locale: 'en-gb',
      filter_by_currency: dto.currency || 'USD',
      order_by: 'popularity',
      units: 'metric',
    };

    if (dto.cityId) {
      params.dest_id = dto.cityId;
    } else if (dto.city) {
      const locations = await this.searchDestinations(dto.city);
      if (locations.length > 0) {
        params.dest_id = locations[0].id;
      } else {
        throw new Error(`Location not found: ${dto.city}`);
      }
    }

    try {
      const searchParams = new URLSearchParams(params);
      const url = `https://${this.apiHost}/v1/hotels/search?${searchParams.toString()}`;
      this.logger.log(`Searching hotels: ${url}`);

      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hotel API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Pass the dto so we can use dates for the booking links
      const hotels = this.transformRapidApiResponse(data, dto);

      return {
        hotels,
        meta: {
          total: hotels.length,
          page: 1,
          limit: 25,
        },
      };
    } catch (error) {
      this.logger.error('Hotel search failed', error);
      throw error;
    }
  }

  private transformRapidApiResponse(data: any, dto: SearchHotelDto): HotelResult[] {
    if (!data) return [];
    
    // FIX: Safely extract the array from the Booking.com JSON wrapper
    const hotelArray = Array.isArray(data) ? data : (data.result || data.results || data.data || []);
    
    if (!Array.isArray(hotelArray)) return [];

    return hotelArray.map((hotel: any) => {
      // Safely extract the hotel name
      const hotelName = hotel.name || hotel.hotel_name || 'Unknown Hotel';
      
      // Generate a dynamic booking link if the API doesn't provide one directly
      const generatedLink = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotelName)}&checkin=${dto.checkIn}&checkout=${dto.checkOut}`;
      const finalUrl = hotel.url || hotel.link || generatedLink;

      // Extract price safely depending on the API version's payload structure
      let hotelPrice = 0;
      if (hotel.min_total_price) hotelPrice = hotel.min_total_price;
      else if (hotel.gross_price) hotelPrice = hotel.gross_price;
      else if (hotel.price_breakdown?.gross_price) hotelPrice = hotel.price_breakdown.gross_price;
      else if (hotel.price) hotelPrice = parseFloat(hotel.price);

      return {
        id: hotel.id || hotel.hotel_id || Math.random().toString(),
        name: hotelName,
        description: hotel.description || '',
        address: hotel.address || hotel.location || hotel.address_trans || '',
        city: hotel.city || hotel.city_trans || '',
        country: hotel.country || hotel.country_trans || '',
        latitude: parseFloat(hotel.latitude) || 0,
        longitude: parseFloat(hotel.longitude) || 0,
        // Target specific Booking.com fields for rating and images
        rating: parseFloat(hotel.review_score || hotel.rating) || 0,
        reviewCount: hotel.review_score_word ? `${hotel.review_score_word} (${hotel.review_nr} reviews)` : (hotel.review_count || 0),
        price: hotelPrice,
        currency: hotel.currencycode || hotel.currency || 'USD',
        amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
        imageUrl: hotel.main_photo_url || hotel.max_photo_url || hotel.image_url || hotel.photo || '',
        available: hotel.is_free_cancellable ? true : (hotel.available !== false),
        
        // Deep link for the frontend
        bookingUrl: finalUrl,
      } as any;
    });
  }
}