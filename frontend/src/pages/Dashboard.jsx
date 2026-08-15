import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, formatCurrency, formatDate } from '../api'
import { useToast } from '../components/Toast'
import Carousel from '../components/Carousel'
import GoalProgressBar from '../components/GoalProgressBar'
import {
  IconDownload,
  IconExpense,
  IconIncome,
  IconTrendDown,
  IconTrendUp,
  IconWallet,
  NavIcon,
} from '../components/Icons'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const COLORS = ['#0f766e', '#1d4ed8', '#b45309', '#7c3aed', '#be123c', '#0891b2']
const GOAL_COLORS = ['#059669', '#2563eb', '#8b5cf6', '#f59e0b']

const QUICK_LINKS = [
  { to: '/incomes', icon: 'income', label: 'Gelirler', desc: 'Maaş & ek gelir' },
  { to: '/expenses', icon: 'expense', label: 'Giderler', desc: 'Harcama takibi' },
  { to: '/invoices', icon: 'invoice', label: 'Faturalar', desc: 'Ödeme takvimi' },
  { to: '/family', icon: 'family', label: 'Aile Bütçesi', desc: 'Gelir havuzu' },
]

const tooltipStyle = {
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
  fontSize: '12px',
}

export default function Dashboard() {
  const { showToast } = useToast()
  const [report, setReport] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [vatSummary, setVatSummary] = useState(null)
  const [familyBudget, setFamilyBudget] = useState(null)
  const [goalsSummary, setGoalsSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getMonthlyReport(),
      api.getExpenses(),
      api.getVatSummary().catch(() => null),
      api.getFamilyBudget().catch(() => null),
      api.getGoals().catch(() => null),
    ])
      .then(([reportData, expenseData, vatData, familyData, goalsData]) => {
        setReport(reportData)
        setExpenses(expenseData.slice(0, 6))
        setVatSummary(vatData)
        setFamilyBudget(familyData)
        setGoalsSummary(goalsData)
      })
      .finally(() => setLoading(false))
  }, [])

  const chartData = useMemo(
    () =>
      Object.entries(report?.expense_by_category || {})
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
    [report],
  )

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
      </div>
    )
  }

  if (!report) return <p className="text-sm text-slate-500">Rapor alınamadı.</p>

  const usagePercent = report.total_income
    ? Math.min(100, Math.round((report.total_expense / report.total_income) * 100))
    : 0

  const monthLabel = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
  const alerts = [...(report.alerts || []), ...(vatSummary?.contract_alerts || [])]
  const budgetHealthy = usagePercent <= 85

  const flowData = [
    { name: 'Gelir', value: report.total_income },
    { name: 'Gider', value: report.total_expense },
    { name: 'Kalan', value: Math.max(0, report.remaining_budget) },
  ]

  const handleExport = async () => {
    try {
      await api.exportCsv()
      showToast('CSV raporu indirildi')
    } catch {
      showToast('Dışa aktarma başarısız', 'error')
    }
  }

  const kpis = [
    {
      Icon: IconIncome,
      iconClass: 'text-emerald-600',
      label: 'Toplam Gelir',
      value: formatCurrency(report.total_income),
      hint: 'Bu ay kayıtlı gelir',
      gradient: 'from-emerald-500/10 to-emerald-600/5',
      ring: 'ring-emerald-100',
      valueColor: 'text-emerald-700',
      accent: 'border-l-emerald-500',
    },
    {
      Icon: IconExpense,
      iconClass: 'text-rose-600',
      label: 'Toplam Gider',
      value: formatCurrency(report.total_expense),
      hint: `%${usagePercent} gelir kullanımı`,
      gradient: 'from-rose-500/10 to-rose-600/5',
      ring: 'ring-rose-100',
      valueColor: 'text-rose-700',
      accent: 'border-l-rose-500',
    },
    {
      Icon: IconWallet,
      iconClass: 'text-blue-600',
      label: 'Net Kalan',
      value: formatCurrency(report.remaining_budget),
      hint: 'Harcanabilir bakiye',
      gradient: 'from-blue-500/10 to-blue-600/5',
      ring: 'ring-blue-100',
      valueColor: 'text-blue-700',
      accent: 'border-l-blue-500',
    },
    {
      Icon: report.savings_rate >= 15 ? IconTrendUp : IconTrendDown,
      iconClass: 'text-amber-600',
      label: 'Tasarruf Oranı',
      value: `%${report.savings_rate}`,
      hint: `Limit: ${formatCurrency(report.monthly_budget_limit)}`,
      gradient: 'from-amber-500/10 to-amber-600/5',
      ring: 'ring-amber-100',
      valueColor: 'text-amber-700',
      accent: 'border-l-amber-500',
    },
  ]

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            AileFinans · Finans Panosu
          </p>
          <h1 className="mt-1 text-2xl font-semibold capitalize tracking-tight text-slate-900">{monthLabel}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Aylık nakit akışı, bütçe performansı ve ödeme takibi
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              budgetHealthy
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                : 'bg-amber-50 text-amber-800 ring-1 ring-amber-100'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${budgetHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {budgetHealthy ? 'Bütçe dengede' : 'Limit yakın'}
          </span>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <IconDownload />
            Rapor İndir
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="group rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
          >
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700">
              <NavIcon name={link.icon} className="h-4 w-4" />
            </div>
            <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700">{link.label}</p>
            <p className="text-[11px] text-slate-400">{link.desc}</p>
          </Link>
        ))}
      </section>

      {alerts.length > 0 && (
        <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-900">
            Dikkat gerektiren {alerts.length} konu
          </p>
          <ul className="mt-1.5 space-y-1 text-sm text-amber-900/90">
            {alerts.slice(0, 3).map((alert, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-amber-400">—</span>
                <span>{alert}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const KpiIcon = kpi.Icon
          return (
          <div
            key={kpi.label}
            className={`rounded-xl border border-slate-200/80 border-l-[3px] bg-gradient-to-br ${kpi.gradient} p-4 shadow-sm ring-1 ${kpi.ring} ${kpi.accent}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {kpi.label}
                </p>
                <p className={`mt-1.5 text-xl font-bold tabular-nums ${kpi.valueColor}`}>{kpi.value}</p>
                <p className="mt-1 text-xs text-slate-500">{kpi.hint}</p>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-white/80 ${kpi.iconClass}`}>
                <KpiIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
          )
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-8">
          <SectionTitle title="Nakit Akışı" subtitle="Gelir, gider ve kalan bakiye" />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flowData}>
                <defs>
                  <linearGradient id="dashFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f766e" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#0f766e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v)} />
                <Area type="monotone" dataKey="value" stroke="#0f766e" strokeWidth={2} fill="url(#dashFlow)" dot={{ r: 3, fill: '#fff', stroke: '#0f766e', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <SectionTitle title="Bütçe Kullanımı" subtitle="Aylık harcama / gelir" />
          <div className="flex flex-col items-center py-2">
            <div className="relative h-36 w-36">
              <svg viewBox="0 0 120 120" className="-rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={usagePercent > 85 ? '#e11d48' : '#0f766e'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(usagePercent / 100) * 314} 314`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold tabular-nums text-slate-900">%{usagePercent}</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">kullanıldı</span>
              </div>
            </div>
            <dl className="mt-4 w-full space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Bütçe limiti</dt>
                <dd className="font-medium tabular-nums text-slate-800">{formatCurrency(report.monthly_budget_limit)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Ödenmemiş fatura</dt>
                <dd className="font-medium tabular-nums text-slate-800">{formatCurrency(report.unpaid_invoices_total)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-5">
          <SectionTitle title="Gider Kategorileri" subtitle="Harcama dağılımı" />
          {chartData.length ? (
            <>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={2} stroke="#fff" strokeWidth={2}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-2.5">
                {chartData.slice(0, 5).map((item, i) => {
                  const pct = report.total_expense ? Math.round((item.value / report.total_expense) * 100) : 0
                  return (
                    <div key={item.name}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          {item.name}
                        </span>
                        <span className="tabular-nums text-slate-500">{formatCurrency(item.value)} · %{pct}</span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <EmptyState text="Veri bulunamadı." />
          )}
        </div>

        <div className="space-y-4 xl:col-span-7">
          {familyBudget?.members?.length > 0 && (
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Gelir Havuzu</h3>
                  <p className="text-xs text-slate-500">
                    {familyBudget.member_count} üye · {formatCurrency(familyBudget.total_contribution)}/ay
                  </p>
                </div>
                <Link to="/family" className="text-xs font-medium text-emerald-700 hover:underline">Yönet</Link>
              </div>
              <div className="hidden divide-y divide-slate-100 md:block">
                {[...familyBudget.members]
                  .sort((a, b) => b.monthly_contribution - a.monthly_contribution)
                  .map((member, i) => {
                    const pct = familyBudget.total_contribution
                      ? Math.round((member.monthly_contribution / familyBudget.total_contribution) * 100)
                      : 0
                    return (
                      <div key={member.id} className="flex items-center justify-between px-5 py-3 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                            {member.name.charAt(0)}
                          </span>
                          <div>
                            <p className="font-medium text-slate-800">{member.name}</p>
                            {member.note && <p className="text-[11px] text-slate-400">{member.note}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold tabular-nums text-slate-900">{formatCurrency(member.monthly_contribution)}</p>
                          <p className="text-[11px] text-slate-400">%{pct}</p>
                        </div>
                      </div>
                    )
                  })}
              </div>
              <div className="md:hidden">
                <Carousel>
                  {familyBudget.members.map((member) => {
                    const pct = familyBudget.total_contribution
                      ? Math.round((member.monthly_contribution / familyBudget.total_contribution) * 100)
                      : 0
                    return (
                      <div key={member.id} className="w-full px-4 py-3">
                        <p className="font-medium text-slate-800">{member.name}</p>
                        <p className="text-sm tabular-nums text-emerald-700">{formatCurrency(member.monthly_contribution)} · %{pct}</p>
                      </div>
                    )
                  })}
                </Carousel>
              </div>
            </div>
          )}

          {goalsSummary?.goals?.length > 0 && (
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Tasarruf Hedefleri</h3>
                  <p className="text-xs text-slate-500">
                    {formatCurrency(goalsSummary.total_saved)} / {formatCurrency(goalsSummary.total_target)}
                  </p>
                </div>
                <Link to="/family" className="text-xs font-medium text-violet-700 hover:underline">Yönet</Link>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-2">
                {goalsSummary.goals.slice(0, 4).map((goal, i) => (
                  <div key={goal.id} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                    <p className="text-sm font-medium text-slate-800">{goal.title}</p>
                    <div className="mt-2">
                      <GoalProgressBar percent={goal.progress_percent} color={GOAL_COLORS[i % GOAL_COLORS.length]} size="sm" />
                    </div>
                    <p className="mt-1.5 text-xs tabular-nums text-slate-600">
                      {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {vatSummary && vatSummary.total_vat_deductible > 0 && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 px-5 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600">KDV Özeti</p>
              <p className="text-sm text-indigo-950">{vatSummary.summary_message}</p>
            </div>
            <p className="text-xl font-semibold tabular-nums text-indigo-700">{formatCurrency(vatSummary.total_vat_deductible)}</p>
          </div>
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <SectionTitle title="Son Harcamalar" subtitle="En güncel gider kayıtları" />
          </div>
          {expenses.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-2 font-semibold">Açıklama</th>
                    <th className="px-5 py-2 font-semibold">Tarih</th>
                    <th className="px-5 py-2 text-right font-semibold">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-2.5">
                        <p className="font-medium text-slate-800">{expense.title}</p>
                        <p className="text-xs text-slate-400">{expense.category}</p>
                      </td>
                      <td className="px-5 py-2.5 text-slate-500">{formatDate(expense.expense_date)}</td>
                      <td className="px-5 py-2.5 text-right font-semibold tabular-nums text-rose-600">
                        -{formatCurrency(expense.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState text="Veri bulunamadı." />
          )}
          <div className="border-t border-slate-100 px-5 py-3">
            <Link to="/expenses" className="text-xs font-medium text-slate-600 hover:text-emerald-700">Tüm giderler →</Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <SectionTitle title="Fatura Durumu" subtitle="Yaklaşan ve gecikmiş ödemeler" />
          </div>
          <div className="divide-y divide-slate-100">
            {report.overdue_invoices?.map((invoice) => (
              <div key={`o-${invoice.id}`} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{invoice.title}</p>
                  <p className="text-xs text-rose-600">Gecikmiş · {formatDate(invoice.due_date)}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-rose-700">{formatCurrency(invoice.amount)}</span>
              </div>
            ))}
            {report.upcoming_invoices?.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{invoice.title}</p>
                  <p className="text-xs text-slate-500">Vade: {formatDate(invoice.due_date)}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-amber-700">{formatCurrency(invoice.amount)}</span>
              </div>
            ))}
            {!report.overdue_invoices?.length && !report.upcoming_invoices?.length && (
              <div className="px-5 py-8"><EmptyState text="Bekleyen fatura yok." /></div>
            )}
          </div>
          <div className="border-t border-slate-100 px-5 py-3">
            <Link to="/invoices" className="text-xs font-medium text-slate-600 hover:text-emerald-700">Faturalar →</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
    </div>
  )
}

function EmptyState({ text = 'Veri bulunamadı.' }) {
  return <p className="py-6 text-center text-xs text-slate-400">{text}</p>
}
