# Demo Kılavuzu — AileFinans

**Amaç:** Jüri, hoca veya değerlendirici için 5–10 dakikalık canlı demo senaryosu.

---

## 1. Hızlı Başlangıç (30 saniye)

```powershell
git clone <repo-url>
cd gtech-project
docker compose up --build -d
```

Tarayıcı: **http://localhost:8080**

```
E-posta: sonay@sonay.com
Şifre:   demo123
Captcha: Ekrandaki toplama sorusunu çözün
```

---

## 2. Demo Senaryosu (Adım Adım)

### Adım 1 — Dashboard (1 dk)

**Gösterilecekler:**
- Aylık gelir / gider / kalan bütçe KPI'ları
- Bütçe kullanım halkası (%)
- Kategori pasta grafiği
- Yaklaşan / gecikmiş fatura uyarıları
- Aile gelir havuzu özeti
- Tasarruf hedefi ilerlemeleri

**Anlatım metni:**
> "Ana sayfada ailenin finansal fotoğrafını tek bakışta görüyoruz. Demo hesapta örnek gelir, gider ve fatura verileri önceden yüklü."

---

### Adım 2 — Gelir ve Gider (1 dk)

1. **Gelirler** → Mevcut kayıtları göster
2. **+ Yeni Gelir** → "Freelance Proje" / 5000 TL / bugün → Kaydet
3. **Giderler** → Market kategorisinde harcama göster
4. Dashboard'a dön → rakamların güncellendiğini göster

**Anlatım:**
> "CRUD işlemleri JWT ile korunuyor; her kullanıcı yalnızca kendi verisini görüyor."

---

### Adım 3 — Fatura + OCR Zor Mod (2–3 dk)

1. **Faturalar** sayfasına git
2. Önceden eklenmiş faturaları göster (KDV, kurum, son ödeme)
3. **Fotoğraftan Oku** → örnek fatura görseli yükle
4. Okunan tutar/tarih alanlarını göster
5. **Takvime Ekle** → `.ics` indirme
6. CSV veya PDF dışa aktarma

**Anlatım:**
> "Zor mod: EasyOCR ile fatura fotoğrafından tutar ve tarih okunuyor. CPU-only PyTorch ile Docker'da çalışır."

**Yedek plan (OCR yavaşsa):**
> Manuel fatura ekleme formunu göster; OCR'ın arka planda 30–90 sn sürdüğünü belirt.

---

### Adım 4 — FinansKoç AI (1–2 dk)

1. **FinansKoç AI** sayfası
2. Prompt: *"Bu ay tasarruf için ne yapabilirim?"*
3. **Analiz Et**
4. Sonuç: özet, tasarruf önerileri, **agent_steps** (5 ajan)

**Anlatım:**
> "Multi-agent mimari: Planner, Expense, Budget, Invoice ve Reviewer ajanları sırayla çalışır. Kural tabanlı; offline demo için LLM gerektirmez."

---

### Adım 5 — Aile Bütçesi ve Hedefler (1 dk)

1. **Aile Bütçesi** → Gelir Havuzu sekmesi
2. Anne / Baba / Çocuk katkılarını ve pasta grafiğini göster
3. **Tasarruf Hedefleri** sekmesi → Laptop hedefi, progress bar
4. Goal Coach mesajını oku

**Anlatım:**
> "Aile üyelerinin katkıları havuzda toplanır; tasarruf hedefleri için koç mesajları aylık kalan bütçeye göre hesaplanır."

---

### Adım 6 — FinansMate Chatbot (30 sn)

1. Sağ alt köşe chatbot
2. "Fatura yüklemek istiyorum" yaz
3. Faturalar sayfasına yönlendirmeyi göster

---

### Adım 7 — Teknik Ek (Opsiyonel, 1 dk)

- http://localhost:8000/docs → Swagger API
- `backend/tests/` → `pytest` (17 test)
- `docs/` klasörü → analiz, teknik, kılavuz, AI günlüğü

---

## 3. Demo Verileri (Seed)

Demo hesap (`sonay@sonay.com`) açıldığında otomatik yüklenir:

| Veri | Örnek |
|------|-------|
| Gelirler | Maaş, freelance |
| Giderler | Kira, market, ulaşım |
| Faturalar | Elektrik, internet, su |
| Aile üyeleri | 3 kişi, katkı tutarları |
| Tasarruf hedefleri | Laptop, tatil |

---

## 4. Demo Kontrol Listesi

Sunum öncesi:

- [ ] Docker Desktop çalışıyor
- [ ] `docker compose ps` → her iki container healthy
- [ ] http://localhost:8080 açılıyor
- [ ] Demo giriş + captcha çalışıyor
- [ ] (OCR için) örnek fatura fotoğrafı hazır
- [ ] İnternet gerekmez (OCR modelleri Docker imajında)

---

## 5. Soru-Cevap Hazırlığı

| Soru | Kısa cevap |
|------|------------|
| Veritabanı? | SQLite, Docker volume |
| AI gerçek mi? | Multi-agent kural tabanlı; LLM opsiyonel v2 |
| Güvenlik? | JWT + bcrypt + captcha |
| Mobil? | Responsive web, alt nav |
| Test? | pytest, 17 test, in-memory DB |
| SOLID? | Router ayrımı, DI, schema ayrımı — bkz. TEKNIK.md |

---

## 6. Demo Sonrası Temizlik

```powershell
docker compose down      # container durdur
docker compose down -v   # veritabanı sıfırla (isteğe bağlı)
```

---

## 7. Alternatif: Manuel Demo

Docker yoksa:

```powershell
# Terminal 1
cd backend && venv\Scripts\activate && uvicorn app.main:app --reload

# Terminal 2
cd frontend && npm run dev
```

Adres: http://localhost:5173
