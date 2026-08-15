import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import { ToastProvider } from './components/Toast.jsx'
import LoginPage from './pages/LoginPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import TransactionPage from './pages/TransactionPage.jsx'
import InvoicesPage from './pages/InvoicesPage.jsx'
import AIPage from './pages/AIPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import FamilyBudgetPage from './pages/FamilyBudgetPage.jsx'
import { api } from './api.js'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    api.me()
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Yükleniyor...
      </div>
    )
  }

  if (!user) {
    return (
      <ToastProvider>
        <LoginPage onLogin={setUser} />
      </ToastProvider>
    )
  }

  return (
    <ToastProvider>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/incomes" element={<TransactionPage type="income" />} />
          <Route path="/expenses" element={<TransactionPage type="expense" />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="/family" element={<FamilyBudgetPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ToastProvider>
  )
}
