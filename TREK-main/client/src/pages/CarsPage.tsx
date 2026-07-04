import React, { useState } from 'react'
import { useTranslation } from '../i18n'
import { carsApi } from '../api/client'
import type { SearchCarDto } from '@trek/shared'
import TravelNavbar from '../components/Layout/TravelNavbar'

export default function CarsPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<SearchCarDto>({
    city: '',
    pickupDate: '',
    returnDate: '',
    passengers: 5,
    carType: '',
    transmission: '',
  })
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await carsApi.search(formData)
      setCars(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Car search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <TravelNavbar />
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{t('cars.title')}</h1>
      
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('cars.location')}</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              placeholder="Goa"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('cars.pickup')}</label>
            <input
              type="date"
              value={formData.pickupDate}
              onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('cars.return')}</label>
            <input
              type="date"
              value={formData.returnDate}
              onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('cars.passengers')}</label>
            <input
              type="number"
              min="1"
              value={formData.passengers}
              onChange={(e) => setFormData({...formData, passengers: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('cars.type')}</label>
            <select
              value={formData.carType}
              onChange={(e) => setFormData({...formData, carType: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
            >
              <option value="">Any</option>
              <option value="economy">Economy</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="luxury">Luxury</option>
              <option value="ev">Electric</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t('common.loading') : t('cars.search')}
        </button>
      </form>

      {error && <div className="text-red-600 bg-red-50 p-4 rounded-md mb-6">{error}</div>}

      <div className="space-y-4">
        {cars.map((car) => (
          <div key={car.id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex">
            <img
              src={car.imageUrl || 'https://placehold.co/200x150'}
              alt={car.vehicle}
              className="w-32 h-24 object-cover rounded mr-4"
            />
            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{car.company}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{car.vehicle}</p>
                  <p className="text-slate-500 text-sm">
                    {car.transmission} • {car.passengers} seats • {car.carType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{car.pricePerDay?.toLocaleString()}</p>
                  <p className="text-slate-500">{t('cars.perDay')}</p>
                  <button className="mt-2 py-1 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    {t('cars.book')}
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