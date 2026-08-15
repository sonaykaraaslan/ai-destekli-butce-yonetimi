# Kullanım Kılavuzu — AileFinans

**Hedef kitle:** Son kullanıcı ve demo değerlendiricisi  
**Versiyon:** 1.0.0

---

## 1. Kurulum

### 1.1 Docker ile (Önerilen)

**Gereksinim:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```powershell
cd gtech-project
docker compose up --build
```

| Adres | Açıklama |
|-------|----------|
| http://localhost:8080 | Uygulama arayüzü |
| http://localhost:8000/docs | API dokümantasyonu (Swagger) |

İlk build 10–20 dakika sürebilir. Arka planda çalıştırmak için:

```powershell
docker compose up --build -d
docker compose down          # durdur
docker compose down -v       # veritabanını da sil
```

### 1.2 Manuel Kurulum (Geliştirici)

**Backend:**
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Frontend:**
```powershell
cd frontend
npm install
npm run dev
```

| Adres | Açıklama |
|-------|----------|
| http://localhost:5173 | Geliştirme arayüzü |
| http://127.0.0.1:8000 | Backend API |

### 1.3 Demo Hesap

```
E-posta: sonay@sonay.com
Şifre:   demo123
```

Giriş ekranında matematik sorusunu çözün (örnek: `7 + 4 = ?` → `11`).

---

## 2. Giriş Ekranı

**Yol:** Uygulama açıldığında otomatik

| Öğe | Kullanım |
|-----|----------|
| E-posta / Şifre | Demo hesap bilgilerini girin |
| Doğrulama sorusu | Toplama sonucunu yazın |
| Giriş Yap | Oturum açar |
| Hesap Oluştur | Yeni kayıt formuna geçer |
| Demo doldur | (Varsa) Demo bilgilerini otomatik doldurur |

**İpucu:** Captcha süresi 5 dakikadır; süre dolduysa sayfayı yenileyin.

---

## 3. Dashboard (Ana Sayfa)

**Yol:** Sol menü → **Dashboard** veya `/`

### Ne görürsünüz?

- **KPI kartları:** Aylık gelir, gider, net kalan, tasarruf oranı
- **Bütçe kullanım halkası:** Limitin yüzde kaçı harcandı
- **Grafikler:** Gelir-gider alan grafiği, kategori pasta grafiği
- **Uyarılar:** Gecikmiş / yaklaşan faturalar
- **Aile havuzu özeti:** Üye katkıları
- **Tasarruf hedefleri özeti:** İlerleme çubukları
- **KDV özeti:** Fatura vergi toplamları
- **Son harcamalar:** En güncel giderler

### Nasıl kullanılır?

1. Sayfa açıldığında mevcut ay verileri otomatik yüklenir.
2. **CSV İndir** ile aylık gelir-gider dışa aktarılır.
3. Kartlardaki linkler ilgili sayfaya gider (Gelirler, Giderler, Faturalar).

---

## 4. Gelirler

**Yol:** Sol menü → **Gelirler** veya `/incomes`

| İşlem | Adımlar |
|-------|---------|
| Gelir ekle | **+ Yeni Gelir** → Başlık, tutar, kategori, tarih → Kaydet |
| Düzenle | Satırdaki düzenle ikonuna tıkla → Değiştir → Kaydet |
| Sil | Sil ikonu → Onayla |
| Ara | Üst arama kutusuna yaz |
| Filtrele | Kategori dropdown'ından seç |

**Kategoriler:** Maaş, Freelance, Yatırım, Diğer

---

## 5. Giderler

**Yol:** Sol menü → **Giderler** veya `/expenses`

Gelirler sayfası ile aynı CRUD akışı.

**Kategoriler:** Kira, Market, Ulaşım, Eğlence, Sağlık, Fatura, Diğer

**İpucu:** Dashboard'daki pasta grafiği bu kategorilere göre oluşur.

---

## 6. Faturalar

**Yol:** Sol menü → **Faturalar** veya `/invoices`

### 6.1 Manuel Fatura Ekleme

1. **+ Yeni Fatura** tıklayın.
2. Başlık, tutar, son ödeme tarihi girin.
3. İsteğe bağlı: Kurum, fatura tarihi, KDV oranı/tutarı, tüketim (kWh), sözleşme bitişi.
4. **Kaydet**.

### 6.2 OCR ile Fatura Okuma (Zor Mod)

1. **Fotoğraftan Oku** butonuna tıklayın.
2. Fatura fotoğrafını seçin (net, düz, iyi ışık).
3. 30–90 saniye bekleyin (ilk kullanımda model indirilebilir).
4. Okunan alanları kontrol edin, gerekirse düzeltin.
5. **Kaydet**.

**Güven seviyesi:** yüksek / orta / düşük — düşükse mutlaka manuel kontrol edin.

### 6.3 Diğer İşlemler

| İşlem | Açıklama |
|-------|----------|
| Ödendi işaretle | Toggle ile fatura durumu değişir |
| Takvime Ekle | `.ics` dosyası indirilir, telefon takvimine import edilir |
| Filtre | Tümü / Ödenmemiş / Ödenmiş / Gecikmiş |
| CSV / PDF | Fatura listesini dışa aktar |
| KDV Özeti | Panelde aylık KDV toplamları |

---

## 7. FinansKoç AI

**Yol:** Sol menü → **FinansKoç AI** veya `/ai`

1. Metin kutusuna isteğinizi yazın (örnek: *"Bu ay tasarruf için ne yapabilirim?"*).
2. **Analiz Et** butonuna basın.
3. Sonuçlar:
   - Özet metin
   - Toplam gelir / gider / kalan
   - En yüksek gider kategorisi
   - Tasarruf önerileri
   - Yaklaşan faturalar
   - Ajan adımları (audit trail)

**Not:** Analiz mevcut ay verilerinize dayanır; veri yoksa sınırlı sonuç üretilir.

---

## 8. Aile Bütçesi

**Yol:** Sol menü → **Aile Bütçesi** veya `/family`

### Sekme 1 — Gelir Havuzu

| İşlem | Adımlar |
|-------|---------|
| Üye ekle | İsim + aylık katkı (TL) → Ekle |
| Düzenle / Sil | Tablo satırı işlemleri |
| Grafik | Katkı dağılımı pasta grafiği |

### Sekme 2 — Tasarruf Hedefleri

| İşlem | Adımlar |
|-------|---------|
| Hedef ekle | Başlık, hedef tutar, mevcut birikim, son tarih |
| İlerleme | Progress bar otomatik güncellenir |
| Koç mesajları | Hedefe ulaşmak için aylık ne kadar biriktirmeniz gerektiği |

---

## 9. Ayarlar

**Yol:** Sol menü → **Ayarlar** veya `/settings`

| Ayar | Açıklama |
|------|----------|
| Aylık bütçe limiti | Dashboard halka grafiğinin referansı |
| Tasarruf hedef yüzdesi | Gelirin yüzde kaçı tasarruf hedefi |
| Kaydet | Değişiklikleri uygular |

---

## 10. FinansMate Chatbot

**Konum:** Sağ alt köşe (tüm sayfalarda)

### Hızlı butonlar
- Gelir eklemek istiyorum
- Giderlerimi görmek istiyorum
- Fatura yüklemek istiyorum
- Bütçe analizi yap

### Örnek komutlar

| Yazın | Sonuç |
|-------|-------|
| "Gelir ekle" | Gelirler sayfasına yönlendirir |
| "Fatura yükle" | Faturalar sayfasına yönlendirir |
| "Bütçe analizi" | FinansKoç AI sayfasına yönlendirir |
| "Takvim" | .ics indirme talimatı verir |
| "Aile bütçesi" | Aile sayfasına yönlendirir |

---

## 11. Mobil Kullanım

- Alt navigasyon çubuğu (mobil) veya sol sidebar (masaüstü).
- Tüm formlar dokunmatik uyumlu.
- OCR için telefon kamerasından fotoğraf seçilebilir.

---

## 12. Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| "Sunucuya bağlanılamadı" (OCR) | Backend çalışıyor mu? OCR 120 sn sürebilir, bekleyin |
| Captcha hatası | Sayfayı yenileyin, yeni soru alın |
| Docker build uzun sürüyor | Normal; PyTorch + EasyOCR indiriliyor |
| Boş dashboard | Demo hesapla giriş yapın veya gelir/gider ekleyin |
| localhost:8000/docs açılıyor ama UI yok | UI **8080** portunda (Docker) veya **5173** (dev) |

---

## 13. Klavye ve Erişilebilirlik

- Form alanları Tab ile gezinilebilir.
- Butonlar ve linkler ekran okuyucu etiketleri içerir (SVG ikonlar + metin).
- Yüksek kontrast sidebar (koyu tema).

---

## 14. Veri Yedekleme

**Docker:** `backend-data` volume SQLite dosyasını saklar.  
**Manuel:** `backend/database/budget.db` dosyasını kopyalayın.

**Yüklenen faturalar:** `backend/uploads/` veya Docker `backend-uploads` volume.
