import React, { useState } from 'react'
import { useTranslation } from '../i18n'
import { flightsApi } from '../api/client'
import type { SearchFlightDto, FlightResult } from '@trek/shared'
import TravelNavbar from '../components/Layout/TravelNavbar'

export default function FlightsPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<SearchFlightDto>({
    from: '',
    to: '',
    date: '',
    returnDate: '',
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: 'economy',
  })
  const [flights, setFlights] = useState<FlightResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await flightsApi.search(formData)
      setFlights(response.flights)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Flight search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <TravelNavbar />
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{t('flights.title')}</h1>
      
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('flights.from')}</label>
              <input
                type="text"
                value={formData.from}
                onChange={(e) => setFormData({...formData, from: e.target.value})}
                placeholder="JFK"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('flights.to')}</label>
              <input
                type="text"
                value={formData.to}
                onChange={(e) => setFormData({...formData, to: e.target.value})}
                placeholder="LAX"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('flights.departure')}</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('flights.return')}</label>
              <input
                type="date"
                value={formData.returnDate}
                onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('flights.passengers')}</label>
              <input
                type="number"
                min="1"
                value={formData.adults}
                onChange={(e) => setFormData({...formData, adults: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('flights.cabin')}</label>
              <select
                value={formData.cabinClass}
                onChange={(e) => setFormData({...formData, cabinClass: e.target.value as any})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
              >
                <option value="economy">{t('flights.economy')}</option>
                <option value="premium_economy">Premium Economy</option>
                <option value="business">{t('flights.business')}</option>
                <option value="first">{t('flights.first')}</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? t('common.loading') : t('flights.search')}
          </button>
        </form>

        {error && <div className="text-red-600 bg-red-50 p-4 rounded-md mb-6">{error}</div>}

        <div className="space-y-4">
          {flights.map((flight) => (
            <div key={flight.flightNumber} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{flight.airline}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{flight.flightNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{flight.price?.toLocaleString()}</p>
                  <p className="text-slate-500">{flight.currency}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div>
                  <p className="text-xl font-bold">{flight.departure?.time}</p>
                  <p className="text-slate-600">{flight.departure?.airport}</p>
                </div>
                <div className="flex-1 mx-4 text-center">
                  <p className="text-slate-500 text-sm">{flight.duration}</p>
                  <div className="w-full h-0.5 bg-slate-300 dark:bg-slate-600 my-2"></div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{flight.arrival?.time}</p>
                  <p className="text-slate-600">{flight.arrival?.airport}</p>
                </div>
              </div>
              
              {/* THIS IS THE UPDATED BUTTON */}
              <button
                onClick={() => {
                  const bookingUrl = (flight as any).bookingUrl;
                  if (bookingUrl) {
                    window.open(bookingUrl, '_blank', 'noopener,noreferrer');
                  } else {
                    setSelectedFlight(flight);
                  }
                }}
                className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t('flights.book')}
              </button>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}