import { useEffect, useMemo, useState } from 'react'
import { api, formatCurrency, formatDate } from '../api'
import { useToast } from '../components/Toast'

export default function TransactionPage({ type }) {
  const { showToast } = useToast()
  const isIncome = type === 'income'
  const title = isIncome ? 'Gelirler' : 'Giderler'
  const categories = isIncome ? ['Maaş', 'Freelance', 'Yatırım', 'Diğer'] : ['Kira', 'Market', 'Ulaşım', 'Eğlence', 'Sağlık', 'Fatura', 'Diğer']

  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: categories[0],
    date: new Date().toISOString().slice(0, 10),
    note: '',
  })

  const load = () => (isIncome ? api.getIncomes() : api.getExpenses()).then(setItems)
  useEffect(() => { load() }, [type])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = item.title.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter
      return matchSearch && matchCategory
    })
  }, [items, search, categoryFilter])

  const total = useMemo(() => filtered.reduce((sum, item) => sum + item.amount, 0), [filtered])

  const resetForm = () => {
    setEditingId(null)
    setForm({ title: '', amount: '', category: categories[0], date: new Date().toISOString().slice(0, 10), note: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      title: form.title,
      amount: Number(form.amount),
      category: form.category,
      note: form.note || null,
      ...(isIncome ? { income_date: form.date } : { expense_date: form.date }),
    }

    if (editingId) {
      if (isIncome) await api.updateIncome(editingId, payload)
      else await api.updateExpense(editingId, payload)
      showToast('Kayıt güncellendi')
    } else {
      if (isIncome) await api.createIncome(payload)
      else await api.createExpense(payload)
      showToast('Kayıt eklendi')
    }

    resetForm()
    load()
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setForm({
      title: item.title,
      amount: String(item.amount),
      category: item.category,
      date: (isIncome ? item.income_date : item.expense_date).slice(0, 10),
      note: item.note || '',
    })
  }

  const handleDelete = async (id) => {
    if (isIncome) await api.deleteIncome(id)
    else await api.deleteExpense(id)
    showToast('Kayıt silindi', 'info')
    load()
  }

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className={`bg-gradient-to-r px-6 py-6 text-white ${isIncome ? 'from-emerald-700 to-teal-600' : 'from-rose-700 to-orange-600'}`}>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="mt-1 text-sm opacity-90">Ekle, düzenle, ara ve filtrele · Toplam: {formatCurrency(total)}</p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="card grid gap-3 p-5 md:grid-cols-2">
        <input className="rounded-xl border px-4 py-3" placeholder="Başlık" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input type="number" className="rounded-xl border px-4 py-3" placeholder="Tutar" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        <select className="rounded-xl border px-4 py-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {categories.map((cat) => <option key={cat}>{cat}</option>)}
        </select>
        <input type="date" className="rounded-xl border px-4 py-3" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <input className="rounded-xl border px-4 py-3 md:col-span-2" placeholder="Not (opsiyonel)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        <div className="flex gap-2 md:col-span-2">
          <button className="flex-1 rounded-xl bg-emerald-600 py-3 font-semibold text-white">
            {editingId ? 'Güncelle' : 'Ekle'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-xl border px-4 py-3 text-sm text-slate-600">
              İptal
            </button>
          )}
        </div>
      </form>

      <div className="card p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <input
            className="flex-1 rounded-xl border px-4 py-2 text-sm"
            placeholder="Ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="rounded-xl border px-4 py-2 text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">Tüm kategoriler</option>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          {filtered.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 hover:bg-slate-50">
              <div>
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500">{item.category} · {formatDate(isIncome ? item.income_date : item.expense_date)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-bold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
                </span>
                <button onClick={() => startEdit(item)} className="text-xs text-blue-600">Düzenle</button>
                <button onClick={() => handleDelete(item.id)} className="text-xs text-rose-500">Sil</button>
              </div>
            </div>
          ))}
          {!filtered.length && <p className="py-8 text-center text-sm text-slate-400">Kayıt bulunamadı.</p>}
        </div>
      </div>
    </div>
  )
}
