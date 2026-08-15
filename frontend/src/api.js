const API_BASE = '/api'
const REQUEST_TIMEOUT_MS = 10000
const OCR_TIMEOUT_MS = 120000

function getToken() {
  return localStorage.getItem('token')
}

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (err) {
    if (err.name === 'AbortError') {
      if (timeoutMs > REQUEST_TIMEOUT_MS) {
        throw new Error('OCR işlemi zaman aşımına uğradı. Daha küçük bir fotoğraf deneyin veya tekrar yükleyin.')
      }
      throw new Error('Sunucuya bağlanılamadı. Backend çalışıyor mu?')
    }
    throw new Error('Sunucuya bağlanılamadı. Backend çalışıyor mu?')
  } finally {
    clearTimeout(timeoutId)
  }
}

export function parseApiError(detail) {
  if (!detail) return 'Bir hata oluştu'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || 'Geçersiz istek').join(' · ')
  }
  return 'Bir hata oluştu'
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const isFormData = options.body instanceof FormData
  if (!isFormData && options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetchWithTimeout(`${API_BASE}${path}`, { ...options, headers })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Bir hata oluştu' }))
    throw new Error(parseApiError(error.detail))
  }

  if (response.status === 204) return null
  return response.json()
}

export const api = {
  getCaptcha: () => request('/auth/captcha'),

  login: async (email, password, captchaToken, captchaAnswer) => {
    const body = new URLSearchParams({
      username: email,
      password,
      captcha_token: captchaToken,
      captcha_answer: captchaAnswer,
    })
    const response = await fetchWithTimeout(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Giriş başarısız' }))
      throw new Error(parseApiError(error.detail))
    }
    return response.json()
  },

  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getIncomes: () => request('/incomes'),
  createIncome: (data) => request('/incomes', { method: 'POST', body: JSON.stringify(data) }),
  updateIncome: (id, data) => request(`/incomes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteIncome: (id) => request(`/incomes/${id}`, { method: 'DELETE' }),
  getExpenses: () => request('/expenses'),
  createExpense: (data) => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id, data) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
  getInvoices: () => request('/invoices'),
  createInvoice: (data) => request('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  updateInvoice: (id, data) => request(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInvoice: (id) => request(`/invoices/${id}`, { method: 'DELETE' }),
  getMonthlyReport: () => request('/reports/monthly'),
  getDashboardStats: () => request('/reports/stats'),
  exportCsv: async () => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/reports/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) throw new Error('Dışa aktarma başarısız')
    const blob = await response.blob()
    downloadBlob(blob, `butce-raporu-${new Date().toISOString().slice(0, 7)}.csv`)
  },

  exportInvoices: async (format = 'csv') => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/reports/invoices/export?format=${format}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) throw new Error('Fatura dışa aktarma başarısız')
    const blob = await response.blob()
    downloadBlob(blob, `faturalar-${new Date().toISOString().slice(0, 7)}.${format}`)
  },

  getVatSummary: () => request('/reports/vat-summary'),

  getFamilyBudget: () => request('/family'),
  createFamilyMember: (data) => request('/family', { method: 'POST', body: JSON.stringify(data) }),
  updateFamilyMember: (id, data) => request(`/family/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFamilyMember: (id) => request(`/family/${id}`, { method: 'DELETE' }),

  getGoals: () => request('/goals'),
  createGoal: (data) => request('/goals', { method: 'POST', body: JSON.stringify(data) }),
  updateGoal: (id, data) => request(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGoal: (id) => request(`/goals/${id}`, { method: 'DELETE' }),

  downloadCalendar: async (invoiceId) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/invoices/${invoiceId}/calendar.ics`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) throw new Error('Takvim dosyası oluşturulamadı')
    const blob = await response.blob()
    downloadBlob(blob, `fatura-${invoiceId}-hatirlatici.ics`)
  },
  analyzeBudget: (prompt) =>
    request('/ai/analyze', { method: 'POST', body: JSON.stringify({ prompt }) }),

  scanInvoice: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const token = getToken()
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const response = await fetchWithTimeout(
      `${API_BASE}/ocr/scan`,
      { method: 'POST', headers, body: formData },
      OCR_TIMEOUT_MS,
    )
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'OCR taraması başarısız' }))
      throw new Error(parseApiError(error.detail))
    }
    return response.json()
  },
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

export function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('tr-TR')
}

export function isOverdue(dueDate) {
  if (!dueDate) return false
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

export function daysUntil(dueDate) {
  if (!dueDate) return null
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24))
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const APP_NAME = 'AileFinans'

const GENERIC_NAMES = new Set(['demo kullanici', 'demo kullanıcı', 'kullanici', 'kullanıcı', 'user'])

function capitalizeWord(value) {
  if (!value) return ''
  return value.charAt(0).toLocaleUpperCase('tr-TR') + value.slice(1).toLocaleLowerCase('tr-TR')
}

/** E-posta veya ad-soyaddan görünen isim: sonay@sonay.com → Sonay */
export function getDisplayName(user) {
  if (!user) return 'Kullanıcı'

  const fullName = user.full_name?.trim()
  if (fullName && !GENERIC_NAMES.has(fullName.toLocaleLowerCase('tr-TR'))) {
    return capitalizeWord(fullName.split(/\s+/)[0])
  }

  const local = (user.email || '').split('@')[0] || 'kullanici'
  const firstPart = local.replace(/[._-]+/g, ' ').trim().split(/\s+/)[0]
  return capitalizeWord(firstPart || 'kullanici')
}

/** Sidebar / header etiketi: Sonay Kullanıcı */
export function getUserLabel(user) {
  return `${getDisplayName(user)} Kullanıcı`
}
