# Analiz Dokümanı — AileFinans

**Proje:** AI-Powered Family Budget Management System  
**Versiyon:** 1.0.0  
**Tarih:** Ağustos 2026

---

## 1. Problem Tanımı

Türk ailelerinin aylık gelir, gider ve fatura yükümlülüklerini tek bir yerden takip etmesi günlük hayatta zordur. Gelirler farklı kaynaklardan (maaş, freelance, yatırım), giderler farklı kategorilerden (kira, market, ulaşım) gelir; faturalar ise son ödeme tarihi, KDV ve sözleşme bitişi gibi ek bilgiler taşır.

Mevcut çözümler genellikle:

- Kurulumu zor veya ücretli olabilir,
- Aile içi ortak bütçe ve tasarruf hedeflerini bir arada sunmayabilir,
- Fatura fotoğrafından otomatik veri çıkarma (OCR) sunmayabilir,
- Yapay zeka destekli bütçe analizi ve öneri üretmeyebilir.

**AileFinans**, bu boşluğu doldurmak için geliştirilmiş; kurulumu kolay (Docker tek komut), Türkçe arayüzlü, mobil uyumlu ve AI destekli bir aile bütçe yönetim sistemidir.

---

## 2. Proje Kapsamı

### 2.1 Kapsam İçi (In Scope)

| Alan | Açıklama |
|------|----------|
| Kimlik doğrulama | Kayıt, giriş, JWT oturum, matematik captcha |
| Gelir yönetimi | CRUD, kategori, tarih, arama/filtre |
| Gider yönetimi | CRUD, kategori, tarih, arama/filtre |
| Fatura yönetimi | CRUD, ödeme durumu, KDV alanları, sözleşme takibi |
| OCR (Zor Mod) | Fatura fotoğrafından tutar, tarih, kurum, KDV okuma |
| Raporlama | Aylık özet, dashboard KPI, CSV/PDF dışa aktarma |
| Multi-Agent AI | Planner, Expense, Budget, Invoice, Reviewer ajanları |
| Aile bütçesi | Aile üyeleri gelir havuzu, katkı dağılımı |
| Tasarruf hedefleri | Hedef CRUD, ilerleme çubuğu, Goal Coach mesajları |
| FinansMate chatbot | Kural tabanlı yönlendirme asistanı (frontend) |
| Ayarlar | Aylık bütçe limiti, tasarruf hedef yüzdesi |
| Demo ortamı | Önceden yüklenmiş demo hesap ve veriler |
| Docker dağıtımı | Tek komutla backend + frontend |
| Testler | Backend pytest (auth, captcha, CRUD, goal coach) |

### 2.2 Kapsam Dışı (Out of Scope)

| Alan | Gerekçe |
|------|---------|
| Gerçek banka entegrasyonu | API lisansı ve güvenlik kapsamı dışı |
| Çoklu para birimi | İlk sürümde yalnızca TL |
| Mobil native uygulama (iOS/Android) | Responsive web yeterli |
| Harici LLM (OpenAI/GPT) çağrısı | Maliyet ve offline demo; kural tabanlı ajanlar kullanıldı |
| Rol tabanlı çoklu kullanıcı (admin/aile üyesi hesabı) | Tek kullanıcı hesabı + aile üyesi kayıtları |
| Bulut senkronizasyonu | SQLite yerel/Docker volume |
| E-fatura / GİB entegrasyonu | Resmi entegrasyon kapsam dışı |
| Push bildirim | Takvim (.ics) indirme ile sınırlandı |
| Frontend birim testleri | İlk sürümde backend testleri önceliklendi |

---

## 3. Paydaşlar ve Hedef Kullanıcılar

| Paydaş | Beklenti |
|--------|----------|
| Aile bütçesini yöneten birey | Gelir/gider/fatura takibi, tasarruf |
| Öğretim görevlisi / jüri | Kolay kurulum, demo, dokümantasyon |
| Geliştirici | Temiz mimari, API dokümantasyonu, testler |

**Birincil kullanıcı profili:** 25–45 yaş, orta gelirli Türk aile, temel dijital okuryazarlık, aylık bütçe ve fatura takibi ihtiyacı.

---

## 4. Kullanıcı Hikâyeleri

### US-01 — Kayıt ve Giriş
**Bir** yeni kullanıcı olarak, **hesap oluşturup güvenli giriş yapmak istiyorum**, böylece finans verilerim korunur.

### US-02 — Gelir Kaydı
**Bir** kullanıcı olarak, **maaş ve ek gelirlerimi kaydetmek istiyorum**, böylece aylık gelirimi görebilirim.

### US-03 — Gider Takibi
**Bir** kullanıcı olarak, **harcamalarımı kategorilere göre girmek istiyorum**, böylece nereye para gittiğini anlayabilirim.

### US-04 — Fatura Yönetimi
**Bir** kullanıcı olarak, **faturalarımı son ödeme tarihiyle takip etmek istiyorum**, böylece gecikme yaşamam.

### US-05 — OCR ile Fatura Okuma (Zor Mod)
**Bir** kullanıcı olarak, **fatura fotoğrafı yükleyerek tutar ve tarihin otomatik okunmasını istiyorum**, böylece manuel giriş süresini azaltırım.

### US-06 — Dashboard Özeti
**Bir** kullanıcı olarak, **ana sayfada gelir, gider, kalan bütçe ve grafikleri görmek istiyorum**, böylece finansal durumumu tek bakışta anlarım.

### US-07 — AI Bütçe Analizi
**Bir** kullanıcı olarak, **AI'dan bütçe analizi ve tasarruf önerisi almak istiyorum**, böylece bilinçli karar verebilirim.

### US-08 — Aile Gelir Havuzu
**Bir** kullanıcı olarak, **aile üyelerinin aylık katkılarını kaydetmek istiyorum**, böylece ortak bütçeyi görebilirim.

### US-09 — Tasarruf Hedefi
**Bir** kullanıcı olarak, **hedef belirleyip ilerlememi takip etmek istiyorum**, böylece motivasyonum artar.

### US-10 — Fatura Hatırlatıcısı
**Bir** kullanıcı olarak, **faturayı takvime (.ics) eklemek istiyorum**, böylece telefonumdan hatırlatma alırım.

### US-11 — FinansMate Asistan
**Bir** kullanıcı olarak, **sohbet ile ilgili sayfaya yönlendirilmek istiyorum**, böylece uygulamayı keşfetmek kolaylaşır.

### US-12 — Demo ile Hızlı İnceleme
**Bir** değerlendirici olarak, **Docker ile tek komutta uygulamayı çalıştırmak istiyorum**, böylece kurulum engeli olmadan projeyi test edebilirim.

---

## 5. Kabul Kriterleri

### AC-01 — Kimlik Doğrulama
- [ ] Kullanıcı captcha ile kayıt olabilir.
- [ ] Aynı e-posta ile tekrar kayıt engellenir.
- [ ] Yanlış şifre ile giriş 401 döner.
- [ ] Geçerli JWT ile korumalı endpoint'lere erişilir.
- [ ] Token olmadan `/api/incomes` 401 döner.

### AC-02 — Gelir / Gider
- [ ] Kullanıcı yalnızca kendi kayıtlarını görür.
- [ ] Oluşturma, güncelleme, silme işlemleri doğru HTTP kodları döner (201, 200, 204).
- [ ] Arama ve kategori filtresi frontend'de çalışır.

### AC-03 — Faturalar
- [ ] Fatura CRUD tamamlanır.
- [ ] Ödenmemiş / gecikmiş faturalar dashboard'da uyarı olarak görünür.
- [ ] `.ics` dosyası indirilebilir.
- [ ] CSV ve PDF dışa aktarma çalışır.

### AC-04 — OCR
- [ ] Fotoğraf yüklendiğinde tutar ve tarih alanları doldurulur (yüksek/orta güven).
- [ ] OCR isteği 120 saniyeye kadar bekleyebilir (timeout).
- [ ] Okuma başarısızsa kullanıcıya anlaşılır hata mesajı gösterilir.

### AC-05 — AI Analiz
- [ ] `/api/ai/analyze` aylık gelir/gider verisine dayalı özet üretir.
- [ ] Yanıtta `agent_steps` audit trail bulunur.
- [ ] Tasarruf önerileri listelenir.

### AC-06 — Aile ve Hedefler
- [ ] Aile üyesi eklenebilir, güncellenebilir, silinebilir.
- [ ] Tasarruf hedefi ilerleme yüzdesi doğru hesaplanır.
- [ ] Goal Coach mesajları hedefe göre kişiselleştirilir.

### AC-07 — Docker Demo
- [ ] `docker compose up --build` ile uygulama http://localhost:8080 adresinde açılır.
- [ ] `sonay@sonay.com / demo123` ile giriş yapılır.
- [ ] Demo veriler otomatik yüklenir.

### AC-08 — Testler
- [ ] `pytest` komutu en az 15 testi geçirir.
- [ ] Testler production veritabanını etkilemez (`TESTING=1`).

---

## 6. İş Kuralları

1. Tüm finans kayıtları kullanıcıya (`user_id`) bağlıdır; kullanıcılar birbirinin verisini göremez.
2. Bütçe kullanım oranı: `(toplam gider / toplam gelir) × 100`.
3. Risk seviyesi: %75 altı düşük, %75–90 orta, %90+ yüksek.
4. Yaklaşan fatura: ödenmemiş ve son ödeme tarihi ≤ bugün + 10 gün.
5. Tasarruf hedefi ilerlemesi: `min(100, current_amount / target_amount × 100)`.
6. Captcha geçerlilik süresi: 5 dakika.

---

## 7. Başarı Metrikleri

| Metrik | Hedef |
|--------|-------|
| Docker ile ilk çalıştırma | ≤ 20 dk (ilk build) |
| API yanıt süresi (CRUD) | < 500 ms |
| OCR işlem süresi | 30–90 sn (kabul edilebilir) |
| Backend test geçme oranı | %100 |
| Mobil ekran uyumu | 320px+ genişlik |

---

## 8. Riskler ve Azaltma

| Risk | Etki | Azaltma |
|------|------|---------|
| OCR düşük doğruluk | Yanlış tutar girişi | Güven skoru gösterimi, manuel düzeltme |
| Docker build süresi | Demo gecikmesi | CPU-only PyTorch, model ön-indirme |
| JWT secret sabit kod | Güvenlik | `.env` ile production'da değiştirme notu |
| SQLite ölçeklenme | Çok kullanıcıda yavaşlama | Tek kullanıcı/demo senaryosu için yeterli |

---

## 9. Sonuç

AileFinans, aile bütçe yönetiminin temel ihtiyaçlarını (gelir, gider, fatura, rapor, AI analiz, OCR) tek platformda birleştirir. Kapsam bilinçli olarak demo ve akademik teslim için optimize edilmiştir; banka entegrasyonu ve harici LLM gibi genişletmeler sonraki sürümlere bırakılmıştır.
