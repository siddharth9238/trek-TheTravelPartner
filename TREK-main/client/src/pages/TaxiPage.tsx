import React, { useState } from 'react'
import { useTranslation } from '../i18n'
import { taxiApi } from '../api/client'
import type { SearchTaxiDto } from '@trek/shared'
import TravelNavbar from '../components/Layout/TravelNavbar'

export default function TaxiPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<SearchTaxiDto>({
    pickup: '',
    drop: '',
    pickupTime: '',
  })
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await taxiApi.search(formData)
      setResults(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Taxi search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <TravelNavbar />
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{t('taxi.title')}</h1>
      
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('taxi.pickup')}</label>
            <input
              type="text"
              value={formData.pickup}
              onChange={(e) => setFormData({...formData, pickup: e.target.value})}
              placeholder="Airport, Hotel, etc."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('taxi.drop')}</label>
            <input
              type="text"
              value={formData.drop}
              onChange={(e) => setFormData({...formData, drop: e.target.value})}
              placeholder="Destination"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('taxi.time')}</label>
            <input
              type="datetime-local"
              value={formData.pickupTime}
              onChange={(e) => setFormData({...formData, pickupTime: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t('common.loading') : t('taxi.search')}
        </button>
      </form>

      {error && <div className="text-red-600 bg-red-50 p-4 rounded-md mb-6">{error}</div>}

      <div className="space-y-4">
        {results.map((taxi) => (
          <div key={taxi.id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">{taxi.type} Taxi</h3>
              <p className="text-slate-600 dark:text-slate-400">
                {taxi.distance} • {taxi.duration} • ETA: {taxi.eta}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">{taxi.fare?.toLocaleString()}</p>
              <button className="mt-1 py-1 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                {t('taxi.book')}
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  )
}