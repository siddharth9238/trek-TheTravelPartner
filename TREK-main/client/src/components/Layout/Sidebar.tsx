import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from '../../i18n'
import {
  Home, Briefcase, CalendarDays, BedDouble, Shield, Settings,
  Plane, MapPin, Car, CloudSun, Bot, Mic, Map, BarChart3,
  X,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

interface NavItem {
  name: string
  href: string
  icon: typeof Home
  divider?: boolean
  adminOnly?: boolean
}

const navigation: Record<string, NavItem[]> = {
  main: [
    { name: 'nav.dashboard', href: '/dashboard', icon: Home },
  ],
  bookings: [
    { name: 'nav.myTrips', href: '/dashboard', icon: Briefcase, divider: true },
    { name: 'nav.vacay', href: '/vacay', icon: CalendarDays },
    { name: 'nav.atlas', href: '/atlas', icon: Map },
  ],
  travel: [
    { name: 'nav.flights', href: '/flights', icon: Plane },
    { name: 'nav.hotels', href: '/hotels', icon: BedDouble },
    { name: 'nav.taxi', href: '/taxi', icon: MapPin },
    { name: 'nav.cars', href: '/cars', icon: Car },
    { name: 'nav.weather', href: '/weather', icon: CloudSun },
  ],
  aiFeatures: [
    { name: 'nav.aiPlanner', href: '/ai', icon: Bot },
    { name: 'nav.voiceAssistant', href: '/voice-assistant', icon: Mic },
  ],
  insights: [
    { name: 'nav.analytics', href: '/analytics', icon: BarChart3 },
  ],
  account: [
    { name: 'nav.settings', href: '/settings', icon: Settings },
    { name: 'nav.admin', href: '/admin', icon: Shield, adminOnly: true },
  ],
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const isActive = (href: string) => location.pathname === href
  const isDashboardActive = location.pathname === '/dashboard' || location.pathname.startsWith('/trips/')

  const handleLinkClick = () => {
    onClose()
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <>
{open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 overflow-y-auto transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden={!open}
      >
         <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={handleLinkClick}>
            <img src="/logo-dark.svg" alt="TREK" className="h-8 dark:hidden" />
            <img src="/logo-light.svg" alt="TREK" className="hidden dark:block h-8" />
            <span className="font-bold text-xl text-white">TREK</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors md:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-2 space-y-1">
          {Object.entries(navigation).map(([groupName, items]) => {
            const hasActiveItem = items.some(item => {
              if (item.adminOnly && !user?.role?.includes('admin')) return false
              if (item.divider) return false
              return isActive(item.href) || isDashboardActive
            })

            return (
              <div key={groupName} className="space-y-1">
{groupName !== 'main' && groupName !== 'account' && (
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-3 py-2">
                    {t(`nav.${groupName}`)}
                  </div>
                )}
                {items.map((item) => {
                  if (item.adminOnly && !user?.role?.includes('admin')) return null
                  if (item.divider) {
                    return <div key={item.name} className="border-t border-zinc-800 my-2" />
                  }

                  const active = isActive(item.href) || (item.href === '/dashboard' && isDashboardActive)

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                        active
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{t(item.name)}</span>
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}