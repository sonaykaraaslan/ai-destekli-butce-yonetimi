# AI Günlüğü — AileFinans Geliştirme Süreci

**Proje:** AI-Powered Family Budget Management System (AileFinans)  
**Geliştirici:** Sonay Karaaslan  
**Dönem:** Ağustos 2026

Bu günlük, projenin planlama aşamasından teslimine kadar kullanılan yapay zeka araçlarını, yazılan prompt'ları ve hangi kararların AI tarafından, hangilerinin geliştirici tarafından verildiğini kayıt altına alır. Prompt'lar özetlenmiş ve her adımın altında kısa geliştirici notu bulunur.

---

## Bölüm 0 — Cursor'dan Önce: Araştırma ve Planlama

### 0.1 Proje konusunun belirlenmesi

Geliştirmeye başlamadan önce dönem projesi gereksinimlerini (analiz dokümanı, teknik doküman, demo, AI entegrasyonu) inceledim. Daha önce incelenmiş örnek projelere bakarak hangi konunun bu kriterleri karşılayabileceğini değerlendirdim.

Değerlendirme kriterlerim:
- Günlük hayatta anlaşılır bir problem alanı
- CRUD, raporlama ve grafik gibi temel yazılım becerilerini gösterebilme
- Multi-agent AI ve OCR gibi ileri özellikler eklenebilirlik
- Demo ortamında sorunsuz çalışabilirlik

**Aile bütçe yönetimi** bu kriterlere uygun bulundu: gelir/gider/fatura takibi herkesin ilişkilenebileceği bir domain; dashboard ve raporlar teknik derinlik sağlıyor; OCR ve multi-agent analiz proje gereksinimlerindeki AI bileşenini karşılıyor.

---

### 0.2 ChatGPT — fikir ve teknoloji araştırması

**Prompt 1 — Proje seçimi**

> GTech dönem projesi yapacağım. AI içeren, web tabanlı, demo'su kolay bir proje arıyorum. Aile bütçe yönetimi mantıklı mı? Buna benzer 3 alternatif fikir de ver; makul sürede tamamlanabilecek öneriler olsun.

**Not:** ChatGPT e-ticaret, randevu sistemi ve bütçe uygulaması gibi alternatifler önerdi. Bütçe uygulaması AI analiz ve OCR gereksinimleriyle en uyumlu seçenek olarak değerlendirildi.

---

**Prompt 2 — Teknoloji seçimi**

> Backend için Python mu Node mu? SQLite yeterli mi yoksa PostgreSQL gerekir mi? Değerlendirici `docker compose up` ile projeyi çalıştırabilsin istiyorum. Frontend için React mi Vue mu?

**Not:** Demo kolaylığı kritik kısıt olarak belirlendi. SQLite tek dosya olduğu için Docker volume ile taşınabilir; ayrı veritabanı servisi kurulum yükünü artırır.

---

**Prompt 3 — Multi-agent yaklaşımı**

> Projede multi-agent AI mimarisi olmalı. OpenAI API mi kullanmalıyım yoksa kural tabanlı ajanlar (planner, expense analyzer, reviewer) yeterli mi? Akademik teslim ve offline demo açısından hangisi daha uygun?

**Not:** API anahtarı, maliyet ve internet bağımlılığı değerlendirildi. **Mimari olarak multi-agent, uygulama olarak kural tabanlı ajanlar** kararı bu aşamada alındı.

---

### 0.3 Gemini — mimari karşılaştırma

**Prompt 4 — Framework karşılaştırması**

> FastAPI + React + SQLite ile Django monolith + SQLite mimarisini karşılaştır. Kurulum kolaylığı, demo, EasyOCR entegrasyonu ve öğrenci projesi uygunluğu açısından değerlendir.

**Not:** Django admin panel avantajı belirtildi; ancak SPA + otomatik API dokümantasyonu (Swagger) hedeflendiği için FastAPI tercih edildi.

---

**Prompt 5 — OCR teknolojisi**

> Türkçe elektrik faturası fotoğrafından tutar ve son ödeme tarihi okumak için EasyOCR mi Tesseract mı? CPU'da çalışsın, Docker imajı mümkün olduğunca küçük kalsın.

**Not:** EasyOCR Türkçe desteği ve hazır pipeline nedeniyle seçildi. Projedeki "Zor Mod" OCR modülü bu kararla şekillendi.

---

### 0.4 Claude — kapsam ve risk analizi

**Prompt 6 — Kapsam kontrolü**

> Aile bütçe projesi planlıyorum: gelir/gider/fatura CRUD, dashboard, 5 ajanlı analiz, OCR, aile bütçesi, tasarruf hedefi, chatbot, Docker. Bu kapsam makul mu? MVP için ne kesilmeli?

**Not:** Banka entegrasyonu, gerçek LLM ve native mobil uygulama kapsam dışı bırakıldı. Aile bütçesi modülü rol sistemi olmadan basit gelir havuzu olarak tasarlandı.

---

**Prompt 7 — Docker stratejisi**

> Değerlendirici Python/Node kurmasın diye Docker Compose kullanmayı planlıyorum. EasyOCR + PyTorch imajı çok büyür mü? CPU-only torch mantıklı mı?

**Not:** Bu analiz sonradan yaşanan pip timeout / CUDA paket indirme sorununa hazırlık sağladı. CPU-only PyTorch çözümü build aşamasında uygulandı.

---

### 0.5 Kullanıcı geri bildirimi (aile)

Teknik AI araçlarına ek olarak, günlük kullanım senaryoları aile içi görüşmelerle netleştirildi:

- Fatura son ödeme tarihi hatırlatması → `.ics` takvim entegrasyonu
- Aile üyelerinin gelir katkılarının görünmesi → Gelir havuzu modülü
- Birikim hedefi takibi → Tasarruf hedefleri + Goal Coach

---

### 0.6 Nihai karar tablosu (Cursor öncesi)

| Konu | Karar | Etkileyen kaynak |
|------|-------|------------------|
| Proje konusu | Aile bütçe + AI | Gereksinim analizi + ChatGPT |
| Backend | FastAPI | Gemini karşılaştırma |
| Frontend | React + Vite + Tailwind | ChatGPT + geliştirici tercihi |
| Veritabanı | SQLite | Demo taşınabilirliği |
| AI | Multi-agent, kural tabanlı | ChatGPT + Claude |
| OCR | EasyOCR | Gemini |
| Dağıtım | Docker Compose | Claude + demo gereksinimi |
| Aile modülü | Basit havuz, rol yok | Claude + geliştirici kararı |

Mimari netleştikten sonra kod geliştirmesi için Cursor IDE kullanılmaya başlandı.

---

## Bölüm 1 — Cursor ile Geliştirme: Prompt Günlüğü

### Gün 1 — Proje başlangıcı

**Prompt 8 — İlk mesaj (proje tanımı)**

> Proje adı: AI-Powered Family Budget Management System. Gelir, gider, fatura takibi; multi-agent AI analiz; mobil uyumlu dashboard; SQLite… *(ders gereksinimlerindeki maddeler)*

**Not:** Proje iskeleti oluşturuldu: FastAPI router'lar, React sayfalar, JWT auth, demo seed verisi.

---

**Prompt 9 — Görsel depolama**

> Yüklenen görselleri veritabanında mı tutmalıyız? Değerlendirici kendi ortamında yüklenen fatura fotoğraflarını görebilmeli.

**Not:** Dosya sistemi (`uploads/`) + Docker volume yaklaşımı benimsendi.

---

**Prompt 10 — OCR gereksinimi** *(örnek fatura ekran görüntüsüyle)*

> Bu OCR özelliğini projeye ekleyelim. Hocanın istediği zor mod kapsamında uygulanabilir mi?

**Not:** EasyOCR entegrasyonu bu aşamada başlatıldı.

---

**Prompt 11 — OCR hata ayıklama**

> Fatura fotoğrafı yükledim ama elektrik faturası okunmuyor, terminale bakar mısın?

**Not:** Regex ve görüntü ön işleme iyileştirildi. OCR geliştirmesi en fazla iterasyon gerektiren modül oldu.

---

**Prompt 12 — OCR + dashboard** *(hatalı okuma ekran görüntüsü)*

> Okuma sonucu yanlış görünüyor, kontrol eder misin? Ayrıca dashboard'a grafikler ekleyerek daha profesyonel hale getir.

**Not:** Recharts ile KPI kartları ve grafikler eklendi.

---

### Gün 1 — Chatbot ve isimlendirme

**Prompt 13**

> Sağ alta küçük bir chatbot ekle: karşılama mesajı, gelir/gider/fatura gibi isteklerde ilgili sayfaya yönlendirme, oturum bitince vedalaşma. AI analiz sayfasına özel isim ver (sonu AI ile bitsin). "Agent adımları" yerine farklı bir etiket kullan.

**Not:** **FinansKoç AI** ve **FinansMate** isimleri bu aşamada belirlendi. Chatbot yalnızca navigasyon amaçlı, backend AI API'sine bağlı değil.

---

**Prompt 14 — OCR iyileştirme** *(Boğaziçi Elektrik fatura örneği)*

> Metin tam okunmuyor gibi. Referans fatura ekran görüntüsü ekliyorum, buna göre düzelt.

**Not:** Crop alanları ve regex kuralları gerçek fatura örneğine göre güncellendi.

---

**Prompt 15–16 — Ek özellikler**

> Mantıklı ek özellikler ekle: KDV özeti, CSV/PDF export, takvime hatırlatıcı (.ics), taahhüt bitiş uyarısı…

**Not:** Kurumsal kullanım senaryolarına yönelik raporlama ve export modülleri eklendi.

---

**Prompt 17–18 — Aile bütçesi ve tasarruf hedefleri**

> Aile ortak bütçesi: üye katkıları, toplam havuz. Rol sistemi olmasın, basit havuz mantığı yeterli. Tasarruf hedefleri, ilerleme çubuğu, hedef koçu mesajları. Dashboard'u modernleştir.

**Not:** Goal Coach backend'de kural tabanlı hesaplama ile yazıldı.

---

### Gün 2 — UI ve güvenlik iterasyonları

**Prompt 19–20:** Yazı boyutu ayarlamaları (küçült / hafif büyüt)

**Prompt 21–24 — Captcha geçişi**

> Giriş öncesi Cloudflare doğrulaması ekle.  
> *(Cloudflare localhost'ta çalışmadı)*  
> Cloudflare yerine sayı toplama doğrulaması koy.

**Not:** HMAC imzalı matematik captcha uygulandı. Localhost uyumluluğu için daha stabil çözüm.

---

**Prompt 25–26 — Arayüz iyileştirme**

> Aile bütçesi bölümünü düzenle. "Çocuk" yerine "Yetişkin" etiketi kullan. Dashboard'u daha profesyonel yap.

**Not:** Koyu sidebar, yetişkin üye etiketleri, SVG ikonlara geçiş hazırlığı.

---

**Prompt 27–33 — Hedefli düzeltmeler**

> Şu ekranı düzelt, diğer yerler aynı kalsın.  
> Matrah alanını fatura formundan kaldır.  
> Chatbot panelini büyüt, emojileri sadeleştir.  
> *(Dashboard tamamen değiştirildi — istenmiyordu)*  
> Eski haline dön, yalnızca emojileri değiştir.

**Not:** Prompt'un spesifik olmaması durumunda AI'ın kapsamı genişlettiği görüldü. "Sadece X değiştir" ifadesi daha doğru sonuç verdi.

---

### Gün 2 — Docker, test, dokümantasyon

**Prompt 34–37:** Kurulum komutları, Windows emoji render sorunu → SVG ikon (`IconIncome`, `IconExpense`)

**Prompt 38 — OCR timeout**

> Fatura yükledikten sonra "Sunucuya bağlanılamadı" hatası alıyorum.

**Not:** Sorun backend değil, 10 saniyelik frontend timeout'tu. OCR için `OCR_TIMEOUT_MS = 120000` ayarlandı.

---

**Prompt 39–44 — Docker**

> Projeyi Docker'a al; bağımlılık kurulumu olmadan çalışsın.  
> Build/terminal hataları, arayüz adresi (8080 vs 8000) soruları.

**Not:** `docker-compose.yml`, CPU-only PyTorch, nginx reverse proxy tamamlandı. UI: `:8080`, API docs: `:8000/docs`.

---

**Prompt 45–46 — Testler**

> Mantıklı yerlere test kodu ekle.

**Not:** pytest ile 17 test (auth, captcha, CRUD, goal coach). OCR test dışı bırakıldı (ağır bağımlılık).

---

**Prompt 47 — Dokümantasyon**

> Analiz, teknik doküman, kılavuz, AI günlüğü, demo hazırla. README'de mimari, SOLID, design pattern olsun.

---

## Bölüm 2 — AI ve Geliştirici Kararları (Özet)

| Konu | AI önerisi / uygulaması | Geliştirici kararı |
|------|-------------------------|---------------------|
| Proje konusu | Alternatif fikirler | Aile bütçesi seçildi |
| FastAPI vs Django | İkisi de uygun | FastAPI + Swagger |
| LLM vs kural ajan | Her iki yol | Kural tabanlı multi-agent |
| Cloudflare captcha | Kuruldu | Kaldırıldı → sayı toplama |
| Dashboard "daha farklı" | Tam redesign | Geri alındı — yalnızca ikon |
| Windows emoji | Unicode emoji | SVG ikon |
| OCR timeout | 10 sn | 120 sn |
| Matrah UI | Göster | Gizlendi (DB alanı korundu) |
| Aile rol sistemi | — | Yapılmadı |
| Docker PyTorch | GPU paketleri | CPU-only |
| Demo hesap | demo@demo.com | sonay@sonay.com |

---

## Bölüm 3 — Kullanılan Araçlar

| Araç | Aşama | Rol |
|------|-------|-----|
| ChatGPT | Planlama | Fikir, teknoloji, kapsam |
| Gemini | Planlama | Mimari karşılaştırma, OCR |
| Claude | Planlama | Kapsam daraltma, Docker risk |
| Kullanıcı geri bildirimi | Planlama | Özellik önceliklendirme |
| Cursor Composer | Geliştirme | Kod, Docker, test, dokümantasyon |
| EasyOCR | Runtime | Fatura OCR |

Production kodunda harici LLM API çağrılmamaktadır. Multi-agent pipeline kural tabanlıdır.

---

## Bölüm 4 — Context Dosyaları

Cursor oturumlarında bağlam sağlayan dosyalar:

- `README.md`, `docker-compose.yml`
- `backend/app/models.py`, `schemas.py`, `routers/*`, `services/*`
- `frontend/src/pages/*`, `api.js`
- Hata ayıklama için ekran görüntüleri

**Sonradan oturmuş prompt kalıbı:**
> İlgili dosyaya odaklan, minimal diff uygula, Türkçe UI korunsun.

---

## Bölüm 5 — Öğrenilen Dersler

1. Mimari kararları kod yazmadan önce ayrı AI oturumlarında almak, geliştirme sürecini hızlandırdı.
2. Prompt spesifik olmalı; belirsiz isteklerde AI kapsamı genişletebiliyor.
3. Demo kısıtları (Docker, offline, tek komut) erken belirlenmeli.
4. Gerçek cihazda test şart: emoji render, OCR timeout, localhost captcha sorunları canlıda ortaya çıktı.
5. Kullanıcı geri bildirimi, özellik listesini teknik AI önerilerinden daha iyi önceliklendirdi.

---

## Bölüm 6 — Referanslar

- [Cursor IDE](https://cursor.com)
- [EasyOCR](https://github.com/JaidedAI/EasyOCR)
- [FastAPI](https://fastapi.tiangolo.com)

---

*Son güncelleme: Ağustos 2026*
