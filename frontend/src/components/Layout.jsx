import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ChatBot from './ChatBot.jsx'
import { NavIcon } from './Icons.jsx'
import { api, APP_NAME, getUserLabel } from '../api'

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/incomes', label: 'Gelirler', icon: 'income' },
  { to: '/expenses', label: 'Giderler', icon: 'expense' },
  { to: '/invoices', label: 'Faturalar', icon: 'invoice' },
  { to: '/family', label: 'Aile Bütçesi', icon: 'family' },
  { to: '/ai', label: 'FinansKoç AI', icon: 'ai' },
  { to: '/settings', label: 'Ayarlar', icon: 'settings' },
]

export default function Layout({ children, user, onLogout }) {
  const location = useLocation()
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    api.getDashboardStats()
      .then((stats) => setAlertCount(stats.alert_count || 0))
      .catch(() => setAlertCount(0))
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-slate-100 pb-24 md:pb-0 md:pl-64">
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-64 flex-col border-r border-slate-800 bg-slate-900 md:flex">
        <div className="border-b border-slate-800 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
              <NavIcon name="income" className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white">{APP_NAME}</p>
              <p className="text-xs text-slate-400">Aile Finans Yönetimi</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <NavIcon
                  name={item.icon}
                  className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-400'}`}
                />
                {item.label}
                {item.to === '/' && alertCount > 0 && (
                  <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {alertCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-sm font-medium text-white">{getUserLabel(user)}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
            <button
              onClick={onLogout}
              className="mt-3 w-full rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur md:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">{APP_NAME}</h1>
            <p className="text-xs text-slate-500">{getUserLabel(user)}</p>
          </div>
          <div className="flex items-center gap-2">
            {alertCount > 0 && (
              <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-semibold text-rose-600">
                {alertCount} uyarı
              </span>
            )}
            <button onClick={onLogout} className="rounded-lg border px-3 py-2 text-sm text-slate-600">
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 md:px-7 md:py-7">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white md:hidden">
        <div className="grid grid-cols-4 sm:grid-cols-7">
          {navItems.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 py-2.5 text-[9px] ${
                  active ? 'font-semibold text-emerald-600' : 'text-slate-500'
                }`}
              >
                <NavIcon name={item.icon} className="h-4 w-4" />
                <span className="truncate">{item.label.split(' ')[0]}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <ChatBot />
    </div>
  )
}
