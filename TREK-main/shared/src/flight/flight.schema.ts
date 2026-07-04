import { z } from 'zod';

export const searchFlightDtoSchema = z.object({
  from: z.string().min(3, 'Origin airport code required'),
  to: z.string().min(3, 'Destination airport code required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adults: z.number().min(1).max(9).default(1),
  children: z.number().min(0).max(9).default(0),
  infants: z.number().min(0).max(9).default(0),
  cabinClass: z.enum(['economy', 'premium_economy', 'business', 'first']).default('economy'),
});
export type SearchFlightDto = z.infer<typeof searchFlightDtoSchema>;

export const flightResultSchema = z.object({
  airline: z.string(),
  airlineCode: z.string(),
  flightNumber: z.string(),
  departure: z.object({
    airport: z.string(),
    airportCode: z.string(),
    time: z.string(),
    date: z.string(),
  }),
  arrival: z.object({
    airport: z.string(),
    airportCode: z.string(),
    time: z.string(),
    date: z.string(),
  }),
  duration: z.string(),
  durationMinutes: z.number(),
  stops: z.number(),
  stopDetails: z.array(z.object({
    airport: z.string(),
    airportCode: z.string(),
    duration: z.string(),
  })).optional(),
  price: z.number(),
  currency: z.string().default('USD'),
  availableSeats: z.number().optional(),
  bookingClass: z.string(),
});
export type FlightResult = z.infer<typeof flightResultSchema>;

export const flightSearchResponseSchema = z.object({
  flights: z.array(flightResultSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
});
export type FlightSearchResponse = z.infer<typeof flightSearchResponseSchema>;