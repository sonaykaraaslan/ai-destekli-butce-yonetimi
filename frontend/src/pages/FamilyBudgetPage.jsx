import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { api, formatCurrency } from '../api'
import { useToast } from '../components/Toast'
import {
  IconInfo,
  IconPencil,
  IconPieChart,
  IconPlus,
  IconTarget,
  IconTrash,
  IconUsers,
  IconWallet,
} from '../components/Icons'
import SavingsGoalsPanel from '../components/SavingsGoalsPanel'

const COLORS = ['#059669', '#2563eb', '#d97706', '#7c3aed', '#0891b2', '#db2777']

const TABS = [
  { id: 'family', label: 'Gelir Havuzu', icon: IconUsers },
  { id: 'goals', label: 'Tasarruf Hedefleri', icon: IconTarget },
]

function memberInsights(members, total) {
  if (!members.length || !total) {
    return { top: null, topPercent: 0 }
  }
  const sorted = [...members].sort((a, b) => b.monthly_contribution - a.monthly_contribution)
  const top = sorted[0]
  return {
    top,
    topPercent: Math.round((top.monthly_contribution / total) * 100),
  }
}

export default function FamilyBudgetPage() {
  const { showToast } = useToast()
  const [tab, setTab] = useState('family')
  const [summary, setSummary] = useState(null)
  const [form, setForm] = useState({ name: '', monthly_contribution: '', note: '' })
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const load = () => api.getFamilyBudget().then(setSummary)
  useEffect(() => { load() }, [])

  const sortedMembers = useMemo(
    () => [...(summary?.members || [])].sort((a, b) => b.monthly_contribution - a.monthly_contribution),
    [summary],
  )

  const chartData = useMemo(
    () => sortedMembers.map((m) => ({ name: m.name, value: m.monthly_contribution })),
    [sortedMembers],
  )

  const insights = useMemo(
    () => memberInsights(summary?.members || [], summary?.total_contribution || 0),
    [summary],
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      monthly_contribution: Number(form.monthly_contribution),
      note: form.note || null,
    }

    if (editingId) {
      await api.updateFamilyMember(editingId, payload)
      showToast('Üye güncellendi')
    } else {
      await api.createFamilyMember(payload)
      showToast('Aile üyesi eklendi')
    }

    setForm({ name: '', monthly_contribution: '', note: '' })
    setEditingId(null)
    setShowForm(false)
    load()
  }

  const startEdit = (member) => {
    setEditingId(member.id)
    setForm({
      name: member.name,
      monthly_contribution: String(member.monthly_contribution),
      note: member.note || '',
    })
    setShowForm(true)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ name: '', monthly_contribution: '', note: '' })
    setShowForm(false)
  }

  const handleDelete = async (id) => {
    await api.deleteFamilyMember(id)
    showToast('Üye silindi', 'info')
    if (editingId === id) cancelEdit()
    load()
  }

  if (!summary && tab === 'family') {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="card overflow-hidden">
        <div className="border-b border-slate-100 bg-white px-5 py-5 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Ortak Finans
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 md:text-2xl">Aile Bütçesi & Hedefler</h2>
              <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                Her üyenin aylık gelir katkısını tek havuzda toplayın; tasarruf hedeflerinizi ayrı takip edin.
              </p>
            </div>
            {tab === 'family' && summary && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-right">
                <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-600">Aylık Havuz</p>
                <p className="text-2xl font-bold text-emerald-800">{formatCurrency(summary.total_contribution)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1 border-b border-slate-100 bg-slate-50/50 p-1.5">
          {TABS.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            )
          })}
        </div>
      </section>

      {tab === 'goals' ? (
        <SavingsGoalsPanel />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            <StatBox
              icon={IconWallet}
              label="Toplam Aylık Havuz"
              value={formatCurrency(summary.total_contribution)}
              accent="emerald"
            />
            <StatBox
              icon={IconUsers}
              label="Aktif Üye"
              value={String(summary.member_count)}
              sub={`Ort. ${formatCurrency(summary.member_count ? summary.total_contribution / summary.member_count : 0)}`}
              accent="blue"
            />
            <StatBox
              icon={IconPieChart}
              label="En Yüksek Katkı"
              value={insights.top ? insights.top.name : '—'}
              sub={insights.top ? `${formatCurrency(insights.top.monthly_contribution)} · %${insights.topPercent}` : undefined}
              accent="amber"
            />
          </section>

          <section className="card border-l-4 border-l-emerald-500 p-4">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <IconInfo />
              </div>
              <div className="text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Nasıl çalışır?</p>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-slate-500">
                  <li>Her aile üyesi aylık gelir katkısını girer (maaş, harçlık vb.).</li>
                  <li>Sistem tüm katkıları <strong className="text-slate-700">ortak havuz</strong> olarak toplar.</li>
                  <li>Gelir/gider detayları için <Link to="/incomes" className="text-emerald-700 hover:underline">Gelirler</Link> ve{' '}
                    <Link to="/expenses" className="text-emerald-700 hover:underline">Giderler</Link> sayfalarını kullanın.</li>
                </ol>
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-12">
            <div className="card overflow-hidden xl:col-span-7">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Katkı Tablosu</h3>
                  <p className="text-xs text-slate-400">Üye bazında aylık gelir paylaşımı</p>
                </div>
                <button
                  type="button"
                  onClick={() => { cancelEdit(); setShowForm(true) }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <IconPlus className="h-3.5 w-3.5" />
                  Üye Ekle
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-[11px] uppercase tracking-wide text-slate-400">
                      <th className="px-4 py-2.5 font-semibold">Üye</th>
                      <th className="px-4 py-2.5 font-semibold">Aylık Katkı</th>
                      <th className="px-4 py-2.5 font-semibold">Havuz Payı</th>
                      <th className="px-4 py-2.5 font-semibold text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedMembers.map((member, i) => {
                      const percent = summary.total_contribution
                        ? Math.round((member.monthly_contribution / summary.total_contribution) * 100)
                        : 0
                      const color = COLORS[i % COLORS.length]
                      return (
                        <tr key={member.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                style={{ backgroundColor: color }}
                              >
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{member.name}</p>
                                {member.note && <p className="text-xs text-slate-400">{member.note}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {formatCurrency(member.monthly_contribution)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} />
                              </div>
                              <span className="text-xs font-medium text-slate-500">%{percent}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => startEdit(member)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                                title="Düzenle"
                              >
                                <IconPencil />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(member.id)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                title="Sil"
                              >
                                <IconTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-900 text-white">
                      <td className="px-4 py-3 font-semibold" colSpan={2}>
                        Toplam Aylık Havuz
                      </td>
                      <td className="px-4 py-3 font-bold" colSpan={2}>
                        {formatCurrency(summary.total_contribution)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {!sortedMembers.length && (
                <p className="px-4 py-10 text-center text-sm text-slate-400">
                  Henüz üye yok. &ldquo;Üye Ekle&rdquo; ile başlayın.
                </p>
              )}
            </div>

            <div className="card p-4 xl:col-span-5">
              <h3 className="text-sm font-semibold text-slate-900">Havuz Dağılımı</h3>
              <p className="text-xs text-slate-400">Katkıların görsel özeti</p>

              {summary.total_contribution > 0 && (
                <div className="mt-4 flex h-3 overflow-hidden rounded-full">
                  {sortedMembers.map((member, i) => {
                    const percent = (member.monthly_contribution / summary.total_contribution) * 100
                    return (
                      <div
                        key={member.id}
                        style={{ width: `${percent}%`, backgroundColor: COLORS[i % COLORS.length] }}
                        title={`${member.name}: %${Math.round(percent)}`}
                      />
                    )
                  })}
                </div>
              )}

              {chartData.length ? (
                <>
                  <div className="mt-5 h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={72}
                          paddingAngle={2}
                          stroke="#fff"
                          strokeWidth={2}
                        >
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 space-y-2">
                    {sortedMembers.map((member, i) => (
                      <div key={member.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-slate-700">{member.name}</span>
                        </div>
                        <span className="font-medium text-slate-600">{formatCurrency(member.monthly_contribution)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="py-12 text-center text-xs text-slate-400">Grafik için üye ekleyin.</p>
              )}
            </div>
          </section>

          {showForm && (
            <section className="card border border-emerald-100 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  {editingId ? 'Üyeyi Düzenle' : 'Yeni Üye Ekle'}
                </h3>
                <button type="button" onClick={cancelEdit} className="text-xs text-slate-500 hover:text-slate-700">
                  Kapat
                </button>
              </div>
              <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-4">
                <input
                  className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm"
                  placeholder="Üye adı (Ana Gelir, Yan Gelir...)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  type="number"
                  className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm"
                  placeholder="Aylık katkı (TL)"
                  value={form.monthly_contribution}
                  onChange={(e) => setForm({ ...form, monthly_contribution: e.target.value })}
                  required
                />
                <input
                  className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm"
                  placeholder="Not (opsiyonel)"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
              </form>
            </section>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
            <span>Tasarruf hedeflerinizi ayrı sekmeden yönetin.</span>
            <button
              type="button"
              onClick={() => setTab('goals')}
              className="inline-flex items-center gap-1.5 font-medium text-violet-700 hover:underline"
            >
              <IconTarget className="h-3.5 w-3.5" />
              Tasarruf Hedefleri
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function StatBox({ icon: Icon, label, value, sub, accent }) {
  const accents = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <div className="card flex items-start gap-3 p-4">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accents[accent]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-lg font-bold text-slate-900">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  )
}
