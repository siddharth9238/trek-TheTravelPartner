import React, { useState, useEffect } from 'react'
import { useTranslation } from '../i18n'

export default function WeatherPage() {
  const { t } = useTranslation()
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [destination, setDestination] = useState('Paris, FR')

  const searchWeather = async () => {
    setLoading(true)
    setError(null)
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/weather/detailed?location=${encodeURIComponent(destination)}&date=${today}&lang=en`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Weather request failed with status ${response.status}`)
      }
      const data = await response.json()
      setWeather(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch weather')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    searchWeather()
  }, [])

  return (
    <div className="md:pl-64 p-4 md:p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{t('weather.title')}</h1>
      
      <div className="max-w-2xl">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={t('weather.searchPlaceholder')}
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700"
            />
            <button
              onClick={searchWeather}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '...' : 'Go'}
            </button>
          </div>
          
          {error && <div className="text-red-600 bg-red-50 p-4 rounded-md mb-4">{error}</div>}
          
          {weather && !weather.error && (
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">{weather.temp}°C</div>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-2">{weather.main}</p>
              <p className="text-slate-500">{weather.description}</p>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div>
                  <p className="text-2xl font-bold">{weather.humidity ?? weather.hourly?.[0]?.humidity ?? 0}%</p>
                  <p className="text-slate-500 text-sm">Humidity</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{weather.wind_max ?? weather.hourly?.[0]?.wind ?? 0} km/h</p>
                  <p className="text-slate-500 text-sm">Wind</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{weather.precipitation_sum ?? 0} mm</p>
                  <p className="text-slate-500 text-sm">Precip.</p>
                </div>
              </div>
              {weather.temp_max && weather.temp_min && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                  <p className="text-slate-500">High: {weather.temp_max}°C | Low: {weather.temp_min}°C</p>
                </div>
              )}
            </div>
          )}
          
          {weather?.error && (
            <div className="text-center text-slate-500">
              <p>Weather data not available for this location/date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}