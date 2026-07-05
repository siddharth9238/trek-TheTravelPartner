import React, { useEffect, useState } from 'react'
import { useTranslation } from '../i18n'
import { Plane, Hotel, MapPin } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3005';

interface AnalyticsData {
  totalTrips: number
  visitedCountries: string[]
  totalSpent: number
  flights: { count: number; totalAmount: number; averagePrice: number }
  hotels: { count: number; totalAmount: number; averagePrice: number }
  topCategories: { category: string; amount: number }[]
  recentTrips: { id: number; title: string; totalSpent: number }[]
}

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/ai/analytics`, { method: 'POST' })
      const result = await response.json()
      setData(result)
    } catch (e) {
      const defaultData: AnalyticsData = {
        totalTrips: 0,
        visitedCountries: [],
        totalSpent: 0,
        flights: { count: 0, totalAmount: 0, averagePrice: 0 },
        hotels: { count: 0, totalAmount: 0, averagePrice: 0 },
        topCategories: [],
        recentTrips: []
      }
      setData(defaultData)
    } finally {
      setLoading(false)
    }
  }

  const renderBarChart = (items: { name: string; value: number }[], color: string = '#3b82f6') => {
    const maxVal = Math.max(...items.map(i => i.value), 1)
    return (
      <div className="flex items-end gap-2 h-48">
        {items.map(item => (
          <div key={item.name} className="flex-1 flex flex-col items-center">
            <div
              className="rounded-t transition-all duration-200 hover:scale-[1.02]"
              style={{
                height: `${(item.value / maxVal) * 100}%`,
                backgroundColor: color,
                minHeight: '20px',
                minWidth: '30px',
              }}
            />
            <div className="mt-2 text-center">
              <div className="font-semibold text-sm">{item.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{item.name}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="md:pl-64 p-4 md:p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{t('analytics.title')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
              <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const flightsData = data ? [
    { name: 'Total', value: data.flights.count },
    { name: 'Spent', value: Math.round(data.flights.totalAmount / 100) },
    { name: 'Avg', value: Math.round(data.flights.averagePrice) }
  ] : []

  const hotelsData = data ? [
    { name: 'Total', value: data.hotels.count },
    { name: 'Spent', value: Math.round(data.hotels.totalAmount / 100) },
    { name: 'Avg', value: Math.round(data.hotels.averagePrice) }
  ] : []

  return (
    <div className="md:pl-64 p-4 md:p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{t('analytics.title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Flights</p>
              <p className="text-2xl font-bold">{data?.flights.count ?? 0}</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm">Trips booked this year</p>
          {data && data.flights.totalAmount > 0 && (
            <div className="mt-3">
              <p className="text-xs text-slate-400">Total spent: ${Math.round(data.flights.totalAmount)}</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
              <Hotel className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Hotels</p>
              <p className="text-2xl font-bold">{data?.hotels.count ?? 0}</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm">Nights stayed this year</p>
          {data && data.hotels.totalAmount > 0 && (
            <div className="mt-3">
              <p className="text-xs text-slate-400">Total spent: ${Math.round(data.hotels.totalAmount)}</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Destinations</p>
              <p className="text-2xl font-bold">{data?.visitedCountries.length ?? 0}</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm">Countries visited</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Flights Spending</h3>
          <div className="h-48">
            {flightsData.length > 0 ? renderBarChart(flightsData, '#3b82f6') : (
              <div className="flex items-center justify-center h-full text-slate-500">
                No flight data
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Hotels Spending</h3>
          <div className="h-48">
            {hotelsData.length > 0 ? renderBarChart(hotelsData, '#10b981') : (
              <div className="flex items-center justify-center h-full text-slate-500">
                No hotel data
              </div>
            )}
          </div>
        </div>

        {data && data.totalSpent > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Total Spending Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-300">Total Spent</p>
                <p className="text-2xl font-bold">${Math.round(data.totalSpent)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-300">Trips</p>
                <p className="text-2xl font-bold">{data.totalTrips}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-300">Destinations</p>
                <p className="text-2xl font-bold">{data.visitedCountries.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}