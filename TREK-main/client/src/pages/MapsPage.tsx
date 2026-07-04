import React, { useState } from 'react'
import { useTranslation } from '../i18n'

export default function MapsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [places, setPlaces] = useState<any[]>([])

  const searchPlaces = async (query: string) => {
    if (!query.trim()) return
    try {
      const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setPlaces(data.predictions || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="md:pl-64 p-4 md:p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{t('maps.title')}</h1>
      
      <div className="max-w-2xl">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              searchPlaces(e.target.value)
            }}
            placeholder={t('maps.searchPlaceholder')}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 mb-4"
          />
          
          <div className="space-y-2">
            {places.map((place) => (
              <button
                key={place.place_id}
                className="w-full text-left p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
              >
                {place.description}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}