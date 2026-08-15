import { useEffect, useState } from 'react'
import { api, APP_NAME } from '../api'
import { IconWallet } from '../components/Icons'

export default function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ email: 'sonay@sonay.com', password: 'demo123', full_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [captcha, setCaptcha] = useState({ question: '', captcha_token: '' })
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaLoading, setCaptchaLoading] = useState(true)

  const loadCaptcha = async () => {
    setCaptchaAnswer('')
    setCaptchaLoading(true)
    try {
      const data = await api.getCaptcha()
      setCaptcha(data)
      setError('')
    } catch {
      setCaptcha({ question: '', captcha_token: '' })
      setError('Doğrulama sorusu yüklenemedi. Backend çalışıyor mu?')
    } finally {
      setCaptchaLoading(false)
    }
  }

  useEffect(() => {
    loadCaptcha()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!captcha.captcha_token) {
      setError('Doğrulama sorusu hazır değil. Lütfen yenileyin.')
      return
    }
    if (!captchaAnswer.trim()) {
      setError('Lütfen toplama işlemini çözün')
      return
    }

    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        captcha_token: captcha.captcha_token,
        captcha_answer: captchaAnswer.trim(),
      }
      const data = isRegister
        ? await api.register(payload)
        : await api.login(form.email, form.password, captcha.captcha_token, captchaAnswer.trim())
      localStorage.setItem('token', data.access_token)
      onLogin(data.user)
    } catch (err) {
      setError(err.message)
      await loadCaptcha()
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsRegister(!isRegister)
    setError('')
    loadCaptcha()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <IconWallet className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{APP_NAME}</h1>
          <p className="mt-2 text-sm text-slate-500">Aile bütçe ve finans yönetimi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
              placeholder="Ad Soyad"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
          )}
          <input
            type="email"
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
            placeholder="E-posta"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
            placeholder="Şifre"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-slate-700">
                Doğrulama:{' '}
                <span className="font-bold text-emerald-700">
                  {captchaLoading ? 'Yükleniyor...' : captcha.question || '—'}
                </span>
              </label>
              <button
                type="button"
                onClick={() => loadCaptcha()}
                disabled={captchaLoading}
                className="text-xs text-emerald-600 hover:underline disabled:opacity-50"
              >
                Yenile
              </button>
            </div>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
              placeholder="Sonucu yazın"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value.replace(/[^\d-]/g, ''))}
              required
            />
            <p className="mt-2 text-[11px] text-slate-400">İki sayının toplamını girin</p>
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || captchaLoading || !captcha.captcha_token}
            className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? 'Bekleyin...' : isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 w-full text-sm text-emerald-700"
          onClick={switchMode}
        >
          {isRegister ? 'Zaten hesabın var mı? Giriş yap' : 'Hesabın yok mu? Kayıt ol'}
        </button>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-medium">Demo hesap</p>
          <p>sonay@sonay.com / demo123</p>
          <p className="mt-1 text-xs text-slate-400">demo@demo.com ile de giriş yapılabilir</p>
        </div>
      </div>
    </div>
  )
}
