import React, { useState } from 'react'
import { useTranslation } from '../i18n'
import { hotelsApi } from '../api/client'
import type { SearchHotelDto, HotelResult } from '@trek/shared'
import TravelNavbar from '../components/Layout/TravelNavbar'

export default function HotelsPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<SearchHotelDto>({
    city: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1,
  })
  const [hotels, setHotels] = useState<HotelResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await hotelsApi.search(formData)
      setHotels(response.hotels)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hotel search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <TravelNavbar />
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{t('hotels.title')}</h1>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('hotels.destination')}</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              placeholder="Goa, India"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('hotels.checkin')}</label>
            <input
              type="date"
              value={formData.checkIn}
              onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('hotels.checkout')}</label>
            <input
              type="date"
              value={formData.checkOut}
              onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('hotels.guests')}</label>
            <input
              type="number"
              min="1"
              value={formData.guests}
              onChange={(e) => setFormData({...formData, guests: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('hotels.rooms')}</label>
            <input
              type="number"
              min="1"
              value={formData.rooms}
              onChange={(e) => setFormData({...formData, rooms: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t('common.loading') : t('hotels.search')}
        </button>
      </form>

      {error && <div className="text-red-600 bg-red-50 p-4 rounded-md mb-6">{error}</div>}

      <div className="space-y-4">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex">
            <img
              src={hotel.imageUrl || 'https://placehold.co/200x150'}
              alt={hotel.name}
              className="w-32 h-24 object-cover rounded mr-4"
            />
            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{hotel.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{hotel.address}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1">{hotel.rating}</span>
                    <span className="text-slate-500 ml-1">({hotel.reviewCount} reviews)</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{hotel.price?.toLocaleString()}</p>
                  <p className="text-slate-500">{hotel.currency} / night</p>
                  
                  {/* THIS IS THE UPDATED BUTTON */}
                  <button 
                    onClick={() => {
                      const bookingUrl = (hotel as any).bookingUrl;
                      if (bookingUrl) {
                        window.open(bookingUrl, '_blank', 'noopener,noreferrer');
                      } else {
                        alert("Booking link unavailable.");
                      }
                    }}
                    className="mt-2 py-1 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {t('hotels.book')}
                  </button>
                  
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  )
}