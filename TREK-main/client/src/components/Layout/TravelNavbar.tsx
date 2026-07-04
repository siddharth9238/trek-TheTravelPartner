import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plane, Hotel, Car, Brain, Mic, Home, MapPin } from 'lucide-react'
import { useTranslation } from '../../i18n'

const travelNavItems = [
  { to: '/dashboard', labelKey: 'nav.myTrips', icon: Home },
  { to: '/flights', labelKey: 'nav.flights', icon: Plane },
  { to: '/hotels', labelKey: 'nav.hotels', icon: Hotel },
  { to: '/taxi', labelKey: 'nav.taxi', icon: MapPin },
  { to: '/cars', labelKey: 'nav.cars', icon: Car },
  { to: '/ai', labelKey: 'nav.aiPlanner', icon: Brain },
  { to: '/voice-assistant', labelKey: 'nav.voiceAssistant', icon: Mic },
]

export default function TravelNavbar() {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <nav className="bg-zinc-900 dark:bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-1 py-2 overflow-x-auto">
          {travelNavItems.map((item) => {
            const isActive = location.pathname === item.to || 
              (item.to !== '/dashboard' && location.pathname.startsWith(item.to))
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{t(item.labelKey)}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}