import { z } from 'zod';

export const searchCarDtoSchema = z.object({
  city: z.string().min(1, 'City is required'),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pickup date must be YYYY-MM-DD'),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Return date must be YYYY-MM-DD'),
  passengers: z.number().min(1).max(8).default(5),
  transmission: z.enum(['automatic', 'manual', 'any']).default('any'),
  carType: z.enum(['economy', 'suv', 'luxury', 'electric', 'any']).default('any'),
});
export type SearchCarDto = z.infer<typeof searchCarDtoSchema>;

export const bookCarDtoSchema = z.object({
  tripId: z.number().min(1, 'Trip ID is required'),
  company: z.string().min(1, 'Company is required'),
  vehicle: z.string().min(1, 'Vehicle is required'),
  pickupCity: z.string().min(1, 'Pickup city is required'),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pickup date must be YYYY-MM-DD'),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Return date must be YYYY-MM-DD'),
  pricePerDay: z.number().min(0, 'Price must be non-negative'),
  status: z.enum(['confirmed', 'pending', 'cancelled']).default('confirmed'),
});
export type BookCarDto = z.infer<typeof bookCarDtoSchema>;

export const rentalCarSchema = z.object({
  id: z.string(),
  company: z.string(),
  vehicle: z.string(),
  pickupCity: z.string(),
  pickupDate: z.string(),
  returnDate: z.string(),
  pricePerDay: z.number(),
  currency: z.string().default('USD'),
  passengers: z.number().optional(),
  transmission: z.string().optional(),
  carType: z.string().optional(),
  imageUrl: z.string().optional(),
  available: z.boolean().default(true),
});
export type RentalCar = z.infer<typeof rentalCarSchema>;

export const cancelCarDtoSchema = z.object({
  reason: z.string().optional(),
});
export type CancelCarDto = z.infer<typeof cancelCarDtoSchema>;