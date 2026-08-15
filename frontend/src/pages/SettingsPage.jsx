import { useEffect, useState } from 'react'
import { api } from '../api'
import { useToast } from '../components/Toast'

export default function SettingsPage() {
  const { showToast } = useToast()
  const [form, setForm] = useState({ monthly_budget_limit: 50000, savings_goal_percent: 20 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getSettings()
      .then(setForm)
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await api.updateSettings({
        monthly_budget_limit: Number(form.monthly_budget_limit),
        savings_goal_percent: Number(form.savings_goal_percent),
      })
      setForm(updated)
      showToast('Ayarlar kaydedildi')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-slate-500">Yükleniyor...</p>

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-7 text-white">
          <h2 className="text-2xl font-bold">Ayarlar</h2>
          <p className="mt-1 text-sm text-slate-300">Bütçe hedeflerini ve tasarruf planını yapılandırın</p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="card max-w-xl space-y-5 p-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Aylık Bütçe Limiti (TL)</label>
          <input
            type="number"
            className="w-full rounded-xl border px-4 py-3"
            value={form.monthly_budget_limit}
            onChange={(e) => setForm({ ...form, monthly_budget_limit: e.target.value })}
            required
          />
          <p className="mt-1 text-xs text-slate-400">Dashboard uyarıları bu limite göre hesaplanır.</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Tasarruf Hedefi (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            className="w-full rounded-xl border px-4 py-3"
            value={form.savings_goal_percent}
            onChange={(e) => setForm({ ...form, savings_goal_percent: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>

      <div className="card max-w-xl p-6">
        <h3 className="font-semibold text-slate-900">Uygulama Bilgisi</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>• FinansKoç AI — Multi-agent bütçe analizi</li>
          <li>• OCR — Fatura fotoğrafından okuma</li>
          <li>• FinansMate — Canlı yardım chatbot</li>
          <li>• CSV dışa aktarma — Dashboard&apos;dan indirilebilir</li>
        </ul>
      </div>
    </div>
  )
}
