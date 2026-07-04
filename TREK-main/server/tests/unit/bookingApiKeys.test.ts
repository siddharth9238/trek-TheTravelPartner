import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FlightService } from '../../src/services/flightService';
import { HotelService } from '../../src/services/hotelService';

describe('booking API services', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('uses HOTEL_API_KEY for hotel searches when provided', async () => {
    process.env.HOTEL_API_KEY = 'hotel-key';
    process.env.HOTEL_API_HOST = 'booking.example.com';
    delete process.env.RAPIDAPI_KEY;

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(''),
      json: vi.fn().mockResolvedValue([]),
    });
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    const service = new HotelService();
    await service.searchHotels({
      city: 'Paris',
      checkIn: '2026-12-01',
      checkOut: '2026-12-02',
      guests: 2,
      rooms: 1,
      cityId: '12345',
    } as any);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('https://booking.example.com/v1/hotels/search');
    expect(url).toContain('dest_id=12345');
    expect((init as RequestInit).headers).toMatchObject({ 'X-RapidAPI-Key': 'hotel-key' });
  });

  it('uses AVIATION_API_KEY and passes flight search params', async () => {
    process.env.AVIATION_API_KEY = 'flight-key';
    process.env.FLIGHT_API_HOST = 'flight.example.com';
    delete process.env.RAPIDAPI_KEY;

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(''),
      json: vi.fn().mockResolvedValue([]),
    });
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    const service = new FlightService();
    await service.searchFlights({
      from: 'AMS',
      to: 'LHR',
      date: '2026-12-10',
      adults: 1,
      children: 0,
      infants: 0,
      cabinClass: 'economy',
    } as any);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('https://flight.example.com/flights');
    expect(url).toContain('from=AMS');
    expect(url).toContain('to=LHR');
    expect(url).toContain('date=2026-12-10');
    expect((init as RequestInit).headers).toMatchObject({ 'X-RapidAPI-Key': 'flight-key' });
  });
});
