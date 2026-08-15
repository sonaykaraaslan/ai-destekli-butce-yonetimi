import { useEffect, useMemo, useState } from 'react'
import { api, daysUntil, formatCurrency, formatDate, isOverdue } from '../api'
import { IconCalendar, IconScan } from '../components/Icons'
import { useToast } from '../components/Toast'

const FILTERS = [
  { id: 'all', label: 'Tümü' },
  { id: 'unpaid', label: 'Ödenmemiş' },
  { id: 'paid', label: 'Ödendi' },
  { id: 'overdue', label: 'Gecikmiş' },
]

const emptyForm = () => ({
  title: '',
  amount: '',
  due_date: new Date().toISOString().slice(0, 10),
  note: '',
  institution: '',
  invoice_date: '',
  vat_rate: '',
  vat_amount: '',
  consumption: '',
  contract_end_date: '',
})

export default function InvoicesPage() {
  const { showToast } = useToast()
  const [invoices, setInvoices] = useState([])
  const [vatSummary, setVatSummary] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [ocrResult, setOcrResult] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [form, setForm] = useState(emptyForm())

  const load = () => {
    api.getInvoices().then(setInvoices)
    api.getVatSummary().then(setVatSummary).catch(() => {})
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch = inv.title.toLowerCase().includes(search.toLowerCase()) ||
        (inv.institution || '').toLowerCase().includes(search.toLowerCase())
      if (!matchSearch) return false
      if (filter === 'paid') return inv.is_paid
      if (filter === 'unpaid') return !inv.is_paid
      if (filter === 'overdue') return !inv.is_paid && isOverdue(inv.due_date)
      return true
    })
  }, [invoices, filter, search])

  const stats = useMemo(() => ({
    total: invoices.length,
    unpaid: invoices.filter((i) => !i.is_paid).length,
    overdue: invoices.filter((i) => !i.is_paid && isOverdue(i.due_date)).length,
    paid: invoices.filter((i) => i.is_paid).length,
  }), [invoices])

  const applyOcrToForm = (result) => {
    setForm({
      title: result.suggested_title || 'OCR Fatura',
      amount: result.amount ? String(result.amount) : '',
      due_date: result.due_date || new Date().toISOString().slice(0, 10),
      note: `OCR güven: ${result.confidence}`,
      institution: result.institution || '',
      invoice_date: result.invoice_date || '',
      vat_rate: result.vat_rate ? String(result.vat_rate) : '',
      vat_amount: result.vat_amount ? String(result.vat_amount) : '',
      consumption: result.consumption ? String(result.consumption) : '',
      contract_end_date: result.contract_end_date || '',
    })
  }

  const buildPayload = () => ({
    title: form.title,
    amount: Number(form.amount),
    due_date: form.due_date,
    note: form.note || null,
    is_paid: false,
    institution: form.institution || null,
    invoice_date: form.invoice_date || null,
    vat_rate: form.vat_rate ? Number(form.vat_rate) : null,
    vat_amount: form.vat_amount ? Number(form.vat_amount) : null,
    consumption: form.consumption ? Number(form.consumption) : null,
    contract_end_date: form.contract_end_date || null,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.createInvoice(buildPayload())
    setForm(emptyForm())
    showToast('Fatura eklendi')
    load()
  }

  const togglePaid = async (invoice) => {
    await api.updateInvoice(invoice.id, { is_paid: !invoice.is_paid })
    showToast(invoice.is_paid ? 'Ödenmedi olarak işaretlendi' : 'Ödendi olarak işaretlendi', 'info')
    load()
  }

  const handleScan = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    setOcrResult(null)
    try {
      const result = await api.scanInvoice(file)
      setOcrResult(result)
      applyOcrToForm(result)
      showToast('Fatura tarandı — KDV ve tarih alanları dolduruldu', 'info')
    } catch (err) {
      setOcrResult({ error: err.message })
      showToast(err.message, 'error')
    } finally {
      setScanning(false)
      e.target.value = ''
    }
  }

  const handleCalendar = async (invoice) => {
    try {
      await api.downloadCalendar(invoice.id)
      showToast('Takvim dosyası indirildi — telefona ekleyin', 'info')
    } catch {
      showToast('Takvim oluşturulamadı', 'error')
    }
  }

  const handleExport = async (format) => {
    try {
      await api.exportInvoices(format)
      showToast(`${format.toUpperCase()} raporu indirildi`)
    } catch {
      showToast('Dışa aktarma başarısız', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-emerald-900 px-6 py-6 text-white">
          <h2 className="text-2xl font-bold">Kurumsal Fatura Merkezi</h2>
          <p className="mt-1 text-sm text-slate-300">KDV, dışa aktarım, takvim hatırlatıcı ve taahhüt takibi</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => handleExport('csv')} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20">Excel/CSV İndir</button>
            <button onClick={() => handleExport('pdf')} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20">PDF İndir</button>
          </div>
        </div>
      </section>

      {vatSummary && (
        <section className="card border-indigo-100 bg-indigo-50/50 p-5">
          <h3 className="text-sm font-semibold text-indigo-900">KDV & Giderleştirme Özeti</h3>
          <p className="mt-2 text-lg font-bold text-indigo-800">{vatSummary.summary_message}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <MiniStat label="Toplam KDV" value={formatCurrency(vatSummary.total_vat_deductible)} />
            <MiniStat label="Fatura Sayısı" value={vatSummary.invoice_count} isCount />
          </div>
          {vatSummary.contract_alerts?.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Taahhüt Uyarıları</p>
              {vatSummary.contract_alerts.map((alert, i) => (
                <p key={i} className="rounded-lg bg-amber-100/80 px-3 py-2 text-sm text-amber-900">{alert}</p>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Toplam" value={stats.total} isCount />
        <MiniStat label="Ödenmemiş" value={stats.unpaid} isCount tone="amber" />
        <MiniStat label="Gecikmiş" value={stats.overdue} isCount tone="rose" />
        <MiniStat label="Ödendi" value={stats.paid} isCount tone="emerald" />
      </section>

      <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 p-5">
        <h3 className="flex items-center gap-2 font-semibold text-emerald-800">
          <IconScan className="h-4 w-4 shrink-0" />
          OCR — KDV & Tarih Otomatik Okuma
        </h3>
        <label className="mt-4 inline-flex cursor-pointer items-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
          {scanning ? 'OCR işleniyor… (30–90 sn sürebilir)' : 'Fotoğraf Seç'}
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScan} disabled={scanning} />
        </label>
        {scanning && (
          <p className="mt-3 text-sm text-emerald-700">Fatura okunuyor, lütfen bekleyin. İlk taramada biraz daha uzun sürebilir.</p>
        )}
        {ocrResult && !ocrResult.error && (
          <div className="mt-4 grid gap-1 rounded-xl bg-white p-4 text-sm text-slate-700 sm:grid-cols-2">
            <p><strong>Tutar:</strong> {ocrResult.amount ? formatCurrency(ocrResult.amount) : '—'}</p>
            <p><strong>Son Ödeme:</strong> {ocrResult.due_date ? formatDate(ocrResult.due_date) : '—'}</p>
            <p><strong>KDV:</strong> {ocrResult.vat_amount ? formatCurrency(ocrResult.vat_amount) : '—'} {ocrResult.vat_rate ? `(%${ocrResult.vat_rate})` : ''}</p>
            <p><strong>Kurum:</strong> {ocrResult.institution || '—'}</p>
            <p><strong>Tüketim:</strong> {ocrResult.consumption ? `${ocrResult.consumption} kWh` : '—'}</p>
            {ocrResult.contract_end_date && (
              <p className="sm:col-span-2 text-amber-700"><strong>Taahhüt Bitiş:</strong> {formatDate(ocrResult.contract_end_date)}</p>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-5">
        <h3 className="font-semibold text-slate-900">Fatura Bilgileri</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Fatura adı" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Kurum (Boğaziçi Elektrik vb.)" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
          <input type="number" className="rounded-xl border px-4 py-3 text-sm" placeholder="Tutar" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <input type="date" className="rounded-xl border px-4 py-3 text-sm" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          <input type="date" className="rounded-xl border px-4 py-3 text-sm" placeholder="Fatura tarihi" value={form.invoice_date} onChange={(e) => setForm({ ...form, invoice_date: e.target.value })} />
          <input type="date" className="rounded-xl border px-4 py-3 text-sm" placeholder="Taahhüt bitiş" value={form.contract_end_date} onChange={(e) => setForm({ ...form, contract_end_date: e.target.value })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <input type="number" className="rounded-xl border px-3 py-2 text-sm" placeholder="KDV %" value={form.vat_rate} onChange={(e) => setForm({ ...form, vat_rate: e.target.value })} />
          <input type="number" className="rounded-xl border px-3 py-2 text-sm" placeholder="KDV Tutarı" value={form.vat_amount} onChange={(e) => setForm({ ...form, vat_amount: e.target.value })} />
          <input type="number" className="rounded-xl border px-3 py-2 text-sm" placeholder="Tüketim kWh" value={form.consumption} onChange={(e) => setForm({ ...form, consumption: e.target.value })} />
        </div>
        <button className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white">Fatura Ekle</button>
      </form>

      <div className="card p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input className="rounded-xl border px-4 py-2 text-sm" placeholder="Fatura veya kurum ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={`rounded-full px-3 py-1 text-xs font-medium ${filter === f.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((invoice) => {
            const overdue = !invoice.is_paid && isOverdue(invoice.due_date)
            const days = daysUntil(invoice.due_date)
            const contractDays = invoice.contract_end_date ? daysUntil(invoice.contract_end_date) : null
            return (
              <div key={invoice.id} className={`rounded-2xl border p-4 ${invoice.is_paid ? 'border-emerald-100 bg-emerald-50/40' : overdue ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-white'}`}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{invoice.title}</p>
                      {invoice.institution && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">{invoice.institution}</span>}
                      {invoice.is_paid && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Ödendi</span>}
                      {overdue && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">Gecikmiş</span>}
                      {!invoice.is_paid && !overdue && days !== null && days <= 10 && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">{days} gün</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">Son ödeme: {formatDate(invoice.due_date)} · {formatCurrency(invoice.amount)}</p>
                    {(invoice.vat_amount || invoice.consumption) && (
                      <p className="mt-1 text-xs text-indigo-600">
                        {invoice.vat_amount ? `KDV: ${formatCurrency(invoice.vat_amount)}` : ''}
                        {invoice.consumption ? `${invoice.vat_amount ? ' · ' : ''}${invoice.consumption} kWh` : ''}
                      </p>
                    )}
                    {contractDays !== null && contractDays <= 14 && (
                      <p className="mt-1 text-xs font-medium text-amber-700">Taahhüt {contractDays} gün içinde bitiyor</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleCalendar(invoice)} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                      <IconCalendar className="h-3.5 w-3.5" />
                      Takvime Ekle
                    </button>
                    <button onClick={() => togglePaid(invoice)} className="rounded-lg border px-3 py-1.5 text-xs font-medium text-slate-600">{invoice.is_paid ? 'Geri Al' : 'Ödendi'}</button>
                    <button onClick={() => api.deleteInvoice(invoice.id).then(load)} className="rounded-lg px-3 py-1.5 text-xs text-rose-500">Sil</button>
                  </div>
                </div>
              </div>
            )
          })}
          {!filtered.length && <p className="py-8 text-center text-sm text-slate-400">Fatura bulunamadı.</p>}
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, isCount, tone = 'slate' }) {
  const tones = { slate: 'text-slate-900', amber: 'text-amber-700', rose: 'text-rose-700', emerald: 'text-emerald-700' }
  return (
    <div className="rounded-xl bg-white/80 p-3 text-center">
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-bold ${tones[tone]}`}>{value}</p>
    </div>
  )
}
