import { z } from 'zod';

export const searchHotelDtoSchema = z.object({
  city: z.string().min(1, 'City is required'),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-in date must be YYYY-MM-DD'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-out date must be YYYY-MM-DD'),
  guests: z.number().min(1).max(32).default(2),
  rooms: z.number().min(1).max(32).default(1),
  cityId: z.string().optional(),
  currency: z.string().optional(),
});
export type SearchHotelDto = z.infer<typeof searchHotelDtoSchema>;

export const hotelResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  address: z.string(),
  city: z.string(),
  country: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().optional(),
  price: z.number(),
  currency: z.string().default('USD'),
  amenities: z.array(z.string()),
  imageUrl: z.string().optional(),
  available: z.boolean().default(true),
});
export type HotelResult = z.infer<typeof hotelResultSchema>;

export const hotelSearchResponseSchema = z.object({
  hotels: z.array(hotelResultSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
});
export type HotelSearchResponse = z.infer<typeof hotelSearchResponseSchema>;