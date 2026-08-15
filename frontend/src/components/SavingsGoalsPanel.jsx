import { useEffect, useState } from 'react'
import { api, formatCurrency, formatDate } from '../api'
import { useToast } from './Toast'
import GoalProgressBar from './GoalProgressBar'

const GOAL_COLORS = ['#059669', '#2563eb', '#8b5cf6', '#f59e0b']

export default function SavingsGoalsPanel({ compact = false }) {
  const { showToast } = useToast()
  const [summary, setSummary] = useState(null)
  const [form, setForm] = useState({
    title: '',
    target_amount: '',
    current_amount: '0',
    deadline: '',
    note: '',
  })
  const [editingId, setEditingId] = useState(null)

  const load = () => api.getGoals().then(setSummary)
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      title: form.title,
      target_amount: Number(form.target_amount),
      current_amount: Number(form.current_amount) || 0,
      deadline: form.deadline,
      note: form.note || null,
    }

    if (editingId) {
      await api.updateGoal(editingId, payload)
      showToast('Hedef güncellendi')
    } else {
      await api.createGoal(payload)
      showToast('Tasarruf hedefi eklendi')
    }

    setForm({ title: '', target_amount: '', current_amount: '0', deadline: '', note: '' })
    setEditingId(null)
    load()
  }

  const startEdit = (goal) => {
    setEditingId(goal.id)
    setForm({
      title: goal.title,
      target_amount: String(goal.target_amount),
      current_amount: String(goal.current_amount),
      deadline: goal.deadline,
      note: goal.note || '',
    })
  }

  const handleDelete = async (id) => {
    await api.deleteGoal(id)
    showToast('Hedef silindi', 'info')
    load()
  }

  if (!summary) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  const coachFor = (goalId) => summary.coach_messages.find((m) => m.goal_id === goalId)

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="rounded-xl bg-gradient-to-br from-violet-700 to-indigo-800 px-5 py-5 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200">Tasarruf Planlama</p>
          <h3 className="mt-1.5 text-xl font-bold">Tasarruf Hedefleri</h3>
          <p className="mt-1.5 text-sm text-violet-100">
            Belirli bir tutara ulaşmak için hedef oluşturun; AI koçu aylık birikim önerisi sunar.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <div className="rounded-lg bg-white/15 px-3.5 py-2 backdrop-blur">
              <p className="text-violet-200">Toplam hedef</p>
              <p className="font-bold">{formatCurrency(summary.total_target)}</p>
            </div>
            <div className="rounded-lg bg-white/15 px-3.5 py-2 backdrop-blur">
              <p className="text-violet-200">Biriken</p>
              <p className="font-bold">{formatCurrency(summary.total_saved)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {summary.goals.map((goal, i) => {
          const coach = coachFor(goal.id)
          const color = GOAL_COLORS[i % GOAL_COLORS.length]
          return (
            <div
              key={goal.id}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div
                className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10"
                style={{ backgroundColor: color }}
              />
              <div className="relative">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{goal.title}</h4>
                    {goal.note && <p className="text-xs text-slate-400">{goal.note}</p>}
                  </div>
                  {!compact && (
                    <div className="flex gap-2 text-xs">
                      <button type="button" onClick={() => startEdit(goal)} className="text-blue-600">
                        Düzenle
                      </button>
                      <button type="button" onClick={() => handleDelete(goal.id)} className="text-rose-500">
                        Sil
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <GoalProgressBar percent={goal.progress_percent} color={color} />
                </div>

                <div className="mt-2.5 flex items-end justify-between">
                  <div>
                    <p className="text-base font-bold text-slate-900">
                      {formatCurrency(goal.current_amount)}
                      <span className="text-sm font-normal text-slate-400"> / {formatCurrency(goal.target_amount)}</span>
                    </p>
                    <p className="text-xs text-slate-500">{goal.days_left} gün kaldı · {formatDate(goal.deadline)}</p>
                  </div>
                </div>

                {coach && (
                  <div
                    className={`mt-3 rounded-lg px-3 py-2.5 text-sm ${
                      coach.on_track
                        ? 'border border-emerald-100 bg-emerald-50 text-emerald-800'
                        : 'border border-amber-100 bg-amber-50 text-amber-900'
                    }`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">AI Hedef Koçu</p>
                    <p className="mt-1 leading-relaxed">{coach.message}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!compact && (
        <form onSubmit={handleSubmit} className="card grid gap-3 p-4 md:grid-cols-3 lg:grid-cols-6">
          <input
            className="rounded-lg border px-3.5 py-2.5 text-sm lg:col-span-2"
            placeholder="Hedef adı (Laptop, Tatil...)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            type="number"
            className="rounded-lg border px-3.5 py-2.5 text-sm"
            placeholder="Hedef tutar"
            value={form.target_amount}
            onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
            required
          />
          <input
            type="number"
            className="rounded-lg border px-3.5 py-2.5 text-sm"
            placeholder="Mevcut birikim"
            value={form.current_amount}
            onChange={(e) => setForm({ ...form, current_amount: e.target.value })}
          />
          <input
            type="date"
            className="rounded-lg border px-3.5 py-2.5 text-sm"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            required
          />
          <input
            className="rounded-lg border px-3.5 py-2.5 text-sm"
            placeholder="Not"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
              {editingId ? 'Güncelle' : 'Hedef Ekle'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setForm({ title: '', target_amount: '', current_amount: '0', deadline: '', note: '' })
                }}
                className="rounded-lg border px-3.5 text-sm"
              >
                İptal
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
