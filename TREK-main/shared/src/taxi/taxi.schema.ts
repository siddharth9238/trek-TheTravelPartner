import { z } from 'zod';

export const searchTaxiDtoSchema = z.object({
  pickup: z.string().min(1, 'Pickup location is required'),
  drop: z.string().min(1, 'Drop location is required'),
  pickupTime: z.string().optional(),
  passengers: z.number().min(1).max(8).default(1),
});
export type SearchTaxiDto = z.infer<typeof searchTaxiDtoSchema>;

export const bookTaxiDtoSchema = z.object({
  tripId: z.number().min(1, 'Trip ID is required'),
  pickup: z.string().min(1, 'Pickup location is required'),
  drop: z.string().min(1, 'Drop location is required'),
  fare: z.number().min(0, 'Fare must be non-negative'),
  distance: z.number().optional(),
  duration: z.number().optional(),
});
export type BookTaxiDto = z.infer<typeof bookTaxiDtoSchema>;

export const taxiResultSchema = z.object({
  id: z.string(),
  type: z.string(),
  fare: z.number(),
  duration: z.string(),
  distance: z.string(),
  eta: z.string(),
  driver: z.string().optional(),
  plate: z.string().optional(),
  rating: z.number().optional(),
});
export type TaxiResult = z.infer<typeof taxiResultSchema>;

export const cancelTaxiDtoSchema = z.object({
  reason: z.string().optional(),
});
export type CancelTaxiDto = z.infer<typeof cancelTaxiDtoSchema>;