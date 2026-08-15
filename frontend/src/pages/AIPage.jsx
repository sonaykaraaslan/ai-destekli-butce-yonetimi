import { useState } from 'react'
import { api, formatCurrency } from '../api'

export default function AIPage() {
  const [prompt, setPrompt] = useState('Bu ay bütçemi analiz et')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const data = await api.analyzeBudget(prompt)
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-900 px-6 py-8 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Akıllı Finans Asistanı</p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">FinansKoç AI</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Multi-agent mimarisi ile gelir, gider ve faturalarını analiz eder; tasarruf önerileri sunar.
          </p>
        </div>
      </section>

      <div className="card p-5">
        <label className="mb-2 block text-sm font-medium text-slate-700">Analiz isteğin</label>
        <textarea
          className="min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-4 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? 'FinansKoç analiz ediyor...' : 'Analizi Başlat'}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric label="Toplam Gelir" value={formatCurrency(result.total_income)} />
            <Metric label="Toplam Gider" value={formatCurrency(result.total_expense)} />
            <Metric label="Kalan Bütçe" value={formatCurrency(result.remaining_budget)} />
          </div>

          <Card title="Genel Değerlendirme">{result.summary}</Card>

          {result.top_expense_category && (
            <Card title="En Yüksek Gider">
              {result.top_expense_category} kategorisi öne çıkıyor.
            </Card>
          )}

          <Card title="Tasarruf Önerileri">
            <ul className="list-disc space-y-2 pl-5">
              {result.savings_suggestions.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </Card>

          <Card title="Yaklaşan Faturalar">
            <ul className="space-y-2">
              {result.upcoming_invoices.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </Card>

          <Card title="Analiz Süreci">
            <ol className="space-y-3">
              {result.agent_steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-slate-700">{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div className="card p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="text-sm leading-relaxed text-slate-700">{children}</div>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
    </div>
  )
}
