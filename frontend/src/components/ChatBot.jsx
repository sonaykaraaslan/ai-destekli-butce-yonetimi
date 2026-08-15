import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const INITIAL_MESSAGE = {
  role: 'bot',
  text: 'Merhaba! Ben FinansMate asistanıyım. Nasıl yardımcı olabilirim?',
}

const QUICK_ACTIONS = [
  'Gelir eklemek istiyorum',
  'Giderlerimi görmek istiyorum',
  'Fatura yüklemek istiyorum',
  'Bütçe analizi yap',
]

function matchIntent(text) {
  const input = text.toLowerCase()

  if (/aile|baba|anne|cocuk|çocuk|ortak butce|ortak bütçe/.test(input)) {
    return { type: 'navigate', path: '/family', reply: 'Aile butcesi sayfasina yonlendiriyorum. Yetiskin uyelerin gelir katkilarini ve havuz dagilimini orada gorebilirsin.' }
  }

  if (/takvim|hatirlatici|hatırlatıcı|calendar/.test(input)) {
    return { type: 'reply', reply: 'Fatura listesinde "Takvime Ekle" butonuna bas. .ics dosyasi iner, telefon takvimine eklersin.' }
  }

  if (/kdv|vergi|matrah|muhasebe|excel|pdf|disa aktar|dışa aktar/.test(input)) {
    return { type: 'navigate', path: '/invoices', reply: 'Faturalar sayfasina yonlendiriyorum. KDV ozeti, CSV ve PDF disa aktarma orada.' }
  }

  if (/ayar|settings|butce limit|hedef/.test(input)) {
    return { type: 'navigate', path: '/settings', reply: 'Ayarlar sayfasina yonlendiriyorum. Butce limitini oradan belirleyebilirsin.' }
  }

  if (/güle güle|gule gule|hoşça kal|hosca kal|bitir|tamam|teşekkür|tesekkur|sağol|sagol|bye|görüşürüz|gorusuruz/.test(input)) {
    return { type: 'goodbye' }
  }

  if (/gelir|maaş|maas|kazanc|kazanç|para kazan/.test(input)) {
    return { type: 'navigate', path: '/incomes', reply: 'Gelirler sayfasına yönlendiriyorum. Oradan gelir ekleyebilirsin.' }
  }

  if (/gider|harcama|harcam|market|kira|ulaşım|ulasim/.test(input)) {
    return { type: 'navigate', path: '/expenses', reply: 'Giderler sayfasına götürüyorum. Harcamalarını oradan yönetebilirsin.' }
  }

  if (/fatura|ocr|elektrik|internet|fotoğraf|fotograf|yükle|yukle/.test(input)) {
    return { type: 'navigate', path: '/invoices', reply: 'Faturalar sayfasına yönlendiriyorum. Fotoğraftan okuma da orada.' }
  }

  if (/analiz|bütçe|butce|tasarruf|ai|rapor|değerlendir|degerlendir|hesapla/.test(input)) {
    return { type: 'navigate', path: '/ai', reply: 'FinansKoç AI sayfasına götürüyorum. Bütçe analizini orada yapabilirsin.' }
  }

  if (/dashboard|ana sayfa|anasayfa|özet|ozet|grafik|panel/.test(input)) {
    return { type: 'navigate', path: '/', reply: 'Dashboard\'a yönlendiriyorum. Finans özetini orada görebilirsin.' }
  }

  if (/merhaba|selam|hey|hello|günaydın|gunaydin/.test(input)) {
    return {
      type: 'reply',
      reply: 'Merhaba! Sana gelir, gider, fatura veya bütçe analizi konularında yardımcı olabilirim.',
    }
  }

  if (/yardım|yardim|ne yapabil|neler yap/.test(input)) {
    return {
      type: 'reply',
      reply: 'Şunları yapabilirim:\n• Gelir ekleme\n• Gider takibi\n• Fatura yükleme\n• FinansKoç AI analizi\n• Dashboard özeti',
    }
  }

  return {
    type: 'reply',
    reply: 'Tam anlayamadım. Gelir, gider, fatura veya bütçe analizi için yardımcı olabilirim. İstersen alttaki hızlı seçeneklerden birini kullan.',
  }
}

function ChatIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ChatBot() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const sendMessage = (text) => {
    const trimmed = text.trim()
    if (!trimmed) return

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setInput('')

    setTimeout(() => {
      const intent = matchIntent(trimmed)

      if (intent.type === 'goodbye') {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', text: 'Güle güle! Finanslarını düzenli takip etmeyi unutma. Tekrar görüşmek üzere.' },
        ])
        setTimeout(() => setOpen(false), 1200)
        return
      }

      if (intent.type === 'navigate') {
        setMessages((prev) => [...prev, { role: 'bot', text: intent.reply }])
        setTimeout(() => navigate(intent.path), 600)
        return
      }

      setMessages((prev) => [...prev, { role: 'bot', text: intent.reply }])
    }, 350)
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 md:bottom-8">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-5 py-4 text-white">
            <div>
              <p className="text-base font-semibold">FinansMate</p>
              <p className="text-xs text-slate-400">Canlı asistan</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg px-2.5 py-1.5 text-sm text-slate-300 hover:bg-white/10"
              aria-label="Kapat"
            >
              Kapat
            </button>
          </div>

          <div className="h-96 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-br-md bg-emerald-600 text-white'
                      : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-slate-100 bg-white p-3">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"
                >
                  {action}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage(input)
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Mesajını yaz..."
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Gönder
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 md:bottom-8 md:h-16 md:w-16"
        aria-label="Chatbot"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-6 w-6">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        ) : (
          <ChatIcon className="h-7 w-7 md:h-8 md:w-8" />
        )}
      </button>
    </>
  )
}
