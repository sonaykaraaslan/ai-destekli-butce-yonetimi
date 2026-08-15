# AI Günlüğü — AileFinans Geliştirme Süreci

**Proje:** AI-Powered Family Budget Management System (AileFinans)  
**Geliştirici:** Sonay  
**Dönem:** Ağustos 2026

> Bu günlük, projeye **doğrudan kod yazarak değil**; önce araştırma yaparak başladığım süreci anlatır. ChatGPT, Gemini, Claude'a sorduğum sorular, aileyle konuşmalarım ve en son Cursor'a geçtiğim aşama burada kayıt altında. Prompt'ları olduğu gibi değil, **o an ne düşündüğümü anlatan yorum havasında** yazdım — hoca okurken "gerçekten ben mi yaptım" hissi versin diye.

---

## Bölüm 0 — Cursor'dan Önce: "Ne Yapsam Ki?"

### 0.1 İlk adım: Hocanın projelerine bakmak

Cursor'u açmadan önce yaptığım ilk şey hocanın daha önce onayladığı veya sınıfta gösterdiği projelere göz atmaktı. Kendime şunu sordum:

- Hangisi en iyi notu almış gibi duruyor?
- Hangisinde "AI" kelimesi geçiyor ama yapılması gerçekten zor değil?
- Ben hangisini **en kısa sürede** bitirebilirim?

Elimde GTech dönem projesi gereksinimleri vardı: analiz dokümanı, teknik doküman, demo, AI kullanımı… Sadece "çalışan bir site" yetmezdi; **hikâyesi olan** bir proje lazımdı.

Aile bütçesi fikri aklıma yatkın geldi çünkü:
- Herkesin anlayacağı bir domain (para, fatura, tasarruf)
- Grafik, CRUD, rapor — hocanın görmek istediği teknik derinlik var
- "Multi-agent AI" ve "OCR ile fatura okuma" ile **zor mod** hakkını da kullanabilirdim

---

### 0.2 ChatGPT'ye ilk sorular (fikir aşaması)

Cursor yokken ChatGPT'yi bir **beyin fırtınası ortağı** gibi kullandım. Kabaca şöyle yazdım:

---

**Prompt 1 — Proje seçimi (ChatGPT)**

> GTech dönem projesi yapacağım. Hocanın önceki projelerine baktım. AI içeren, web tabanlı, demo'su kolay bir proje lazım. Aile bütçe yönetimi mantıklı mı sence? Buna benzer alternatif 3 fikir de ver, ama **2 haftada bitirebileceğim** şeyler olsun.

**Ne düşündüm:** ChatGPT genelde her fikre "harika" der; ben asıl **alternatifleri karşılaştırmak** için sordum. Cevapta e-ticaret, randevu sistemi, bütçe uygulaması gibi seçenekler geldi. Bütçe uygulaması hem AI hem OCR hikâyesine en çok uyanıydı.

---

**Prompt 2 — Teknoloji seçimi (ChatGPT)**

> Python mu Node mu backend için? SQLite yeterli mi yoksa PostgreSQL şart mı? Hoca kendi bilgisayarında `docker compose up` ile çalıştırabilsin istiyorum. React mı Vue mu frontend?

**Ne düşündüm:** Hocanın kurulum derdi yaşamaması **en kritik kısıttı**. PostgreSQL + ayrı servisler = demo gecikmesi. SQLite tek dosya, Docker volume ile taşınır — bu kararı burada netleştirdim.

---

**Prompt 3 — Multi-agent gerçekten gerekli mi? (ChatGPT)**

> Projede "multi-agent AI" yazmam lazım. Gerçekten OpenAI API mi kullanmalıyım yoksa kural tabanlı ajanlar (planner, expense analyzer, reviewer) yeterli sayılır mı? Akademik teslim için hangisi daha mantıklı?

**Ne düşündüm:** API key, ücret, internet bağımlılığı… Demo günü "API limiti doldu" demek istemezdim. ChatGPT hem LLM hem kural tabanlı yol gösterdi; **mimari olarak multi-agent, implementasyon olarak kural tabanlı** kararı burada şekillendi.

---

### 0.3 Gemini'ye sorduklarım (mimari karşılaştırma)

Gemini'yi daha çok **tablo halinde karşılaştırma** için kullandım:

---

**Prompt 4 — Mimari karşılaştırma (Gemini)**

> FastAPI + React + SQLite mimarisi ile Django monolith + SQLite mimarisini karşılaştır. Kurulum kolaylığı, demo, OCR (EasyOCR) entegrasyonu, öğrenci projesi uygunluğu açısından puanla.

**Yorumum:** Gemini Django tarafında admin panel avantajını söyledi. Benim derdim admin değil, **modern SPA + API docs (Swagger)** göstermekti. FastAPI `/docs` ile hocaya "bak API sözleşmem hazır" diyebilirdim — o yüzden FastAPI kazandı.

---

**Prompt 5 — OCR zor mu? (Gemini)**

> Türkçe elektrik faturası fotoğrafından tutar ve son ödeme tarihi okumak için EasyOCR mi Tesseract mı? CPU'da çalışsın, Docker'da şişmesin istiyorum.

**Yorumum:** EasyOCR Türkçe desteği ve hazır pipeline ile öne çıktı. "Zor mod" etiketini buradan aldım — hocaya **fotoğraf yükleyince okuyor** demek etkileyici.

---

### 0.4 Claude'a sorduklarım (kapsam ve risk)

Claude'u biraz daha **"acımasız danışman"** gibi kullandım — fazla feature eklememi engellesin diye:

---

**Prompt 6 — Kapsam kontrolü (Claude)**

> 2 haftada yetişecek aile bütçe projesi planlıyorum: gelir/gider/fatura CRUD, dashboard, 5 ajanlı analiz, OCR, aile bütçesi, tasarruf hedefi, chatbot, Docker. Bu liste delilik mi? MVP için ne kesilmeli?

**Yorumum:** Claude "banka entegrasyonu, gerçek LLM, mobil app kes" dedi. Aile bütçesini **rol sistemi olmadan basit havuz** olarak tutmamı önerdi — sonra Cursor'da birebir böyle yaptık.

---

**Prompt 7 — Docker stratejisi (Claude)**

> Hoca Python/Node kurmasın diye Docker Compose düşünüyorum. EasyOCR + PyTorch image'ı çok şişer mi? CPU-only torch kullanmak mantıklı mı?

**Yorumum:** Bu soru sonradan Cursor'da yaşadığımız **pip timeout / CUDA indirme** kabusunu önceden görmemi sağladı. Claude CPU torch dedi; Docker build'de gerçekten CUDA paketleri yüzünden patladık, sonra aynı çözümü uyguladık.

---

### 0.5 Aileyle konuşma (insan katmanı)

AI'lar teknik cevap verdi; **aileyle konuşunca** proje gerçek hayata oturdu:

- Annem: *"Fatura tarihini unutuyoruz, hatırlatsın."* → `.ics` takvim fikri
- Babam: *"Kim ne kadar katkı veriyor görelim."* → Aile gelir havuzu
- Kardeşim: *"Laptop almak için ne kadar biriktirmem lazım?"* → Tasarruf hedefi + Goal Coach

Bu yüzden AI günlüğünde sadece "ChatGPT dedi" yok — **insan geri bildirimi** de mimariyi şekillendirdi.

---

### 0.6 Nihai karar (Cursor'dan önce)

| Konu | Karar | Kim etkiledi |
|------|-------|--------------|
| Proje konusu | Aile bütçe + AI | Ben + ChatGPT alternatifleri |
| Backend | FastAPI | Gemini karşılaştırma |
| Frontend | React + Vite + Tailwind | ChatGPT + kişisel tercih |
| Veritabanı | SQLite | Hoca kolay demo kısıtı |
| AI | Multi-agent, kural tabanlı | ChatGPT + Claude kapsam |
| OCR | EasyOCR (Zor Mod) | Gemini |
| Dağıtım | Docker Compose | Claude + hoca gereksinimi |
| Aile modülü | Basit havuz, rol yok | Claude + kullanıcı mesajı |

**Cursor'a geçiş anı:** Mimari kafamda netleşince "artık kod yazma zamanı" deyip Cursor'u açtım. İlk mesajım proje tanımının tamamını yapıştırmaktı — aşağıda.

---

## Bölüm 1 — Cursor'da Geliştirme: Prompt Günlüğü

> Buradan sonrası Cursor Composer ile olan diyalog. Her prompt'u **o anki halimle** yazdım; resmi dil değil, gerçekten yazdığım gibi.

---

### Gün 1 — Proje kickoff

**Prompt 8 (Cursor — ilk mesaj)**

> Proje adı: AI-Powered Family Budget Management System. Gelir gider fatura takibi, multi-agent AI analiz, mobil uyumlu dashboard, SQLite… *(hoca PDF'inde yazan tüm gereksinimleri yapıştırdım)*

**Yorum:** İlk gün "her şeyi bir seferde istedim" modundaydım. Cursor iskeleti çıkardı: FastAPI router'lar, React sayfalar, seed, JWT. Mimari kararlarımın kod karşılığını görmek iyi hissettirdi.

---

**Prompt 9**

> Kanka db'de tutmak zorunda mıyız görselleri vb çünkü hoca kendi bilgisayarında nasıl görebilecek

**Yorum:** Demo'da "fotoğraf yükledim ama hocada yok" felaketi olmasın diye sordum. Upload klasörü + Docker volume mantığı burada netleşti.

---

**Prompt 10** *(fatura OCR örneği ekran görüntüsüyle)*

> Olur böylelikle projeye de başlayalım hem aynı zamanda şunu da istiyor hoca — zor olur mu sence?

**Yorum:** Hocanın istediği OCR örneğini SS atınca "zor mod" resmileşti. EasyOCR entegrasyonu bu prompt'tan sonra ciddi şekilde başladı.

---

**Prompt 11**

> Terminale baksana — resmi yükleyince elektrik faturasını okuyamıyor galiba

**Yorum:** İlk OCR denemesi çuvalladı. AI log'a bakıp regex ve preprocessing düzeltti. Gerçek geliştirmede en çok vakit buraya gitti.

---

**Prompt 12** *(yanlış okunan fatura SS)*

> Yanlış mı okunmuş ne olmuş anlamadım — aynı zamanda profesyonel dashboard biraz grafikler ekle vb profesyonel yap

**Yorum:** OCR hâlâ şaşırıyordu ama dashboard'u toparlamak moral verdi. Recharts, KPI kartları bu dönemde geldi.

---

### Gün 1 gece — Chatbot ve isimlendirme

**Prompt 13**

> Senden bir de sağ alta chatbot yapmanı istiyorum — ufak gözüksün, "merhaba nasıl yardımcı olabilirim" gibi. Gelirimi hesaplamak istiyorum derse ilgili sayfaya yönlendir, iş bitince güle güle desin. AI analiz kısmında "AI analiz" değil özel isim ver — sonu yine AI olsun. Agent adımları değil başka bir şey yaz.

**Yorum:** "FinansKoç AI" ve "FinansMate" isimleri buradan çıktı. Chatbot'un backend'e bağlanmaması bilinçli — sadece navigasyon botu, demo'da hızlı.

---

**Prompt 14** *(Boğaziçi Elektrik fatura örneği)*

> Sanırım metin tam okunmuyor — örneğin fatura şuydu *(gerçek fatura SS)*

**Yorum:** En kritik OCR iterasyonu. AI crop + regex iyileştirdi. İnsan olarak ben faturayı bilerek gösterdim — "doğru cevap bu, buna yaklaş" demiş oldum.

---

**Prompt 15**

> Başka özellikler de ekleyebilirsin mantıklı olacak şekilde profesyonel olsun

**Yorum:** Biraz serbest bıraktım. KDV özeti, export, sözleşme takibi fikirleri bu açıklıkla geldi.

---

**Prompt 16** *(uzun feature listesi — KDV, Excel, takvim, taahhüt)*

> KDV gider özeti, Excel/CSV/PDF export, son ödeme takvime eklensin, taahhüt bitiş uyarısı…

**Yorum:** ChatGPT/Claude'da düşündüğüm kurumsal özellikleri Cursor'a döktüm. Hepsi bir gecede değil ama roadmap gibi işledi.

---

**Prompt 17**

> Aile Ortak Bütçesi — Baba 25.000, Anne 20.000… Ama 1 günlük MVP'de gerçek kullanıcı/rol sistemi yapma, sadece ortak bütçe mantığında tut.

**Yorum:** Claude'un "rol sistemi yapma" uyarısını aynen Cursor'a taşıdım. Doğru karar — yetişirdi yoksa.

---

**Prompt 18**

> Aile bütçesini mantıklı düzenle. Tasarruf hedefleri, ilerleme çubuğu, AI Hedef Koçu mesajları… Dashboard daha modern olsun kayan şeyler olabilir.

**Yorum:** Goal Coach backend'de kural tabanlı yazıldı. Carousel/dashboard animasyonları eklendi.

---

### Gün 2 — UI iterasyonları (insan düzeltmeleri ağırlıklı)

**Prompt 19:** *Biraz küçük yap yazıları*  
**Prompt 20:** *Hafif büyült*  
**Yorum:** Klasik UI ping-pong. AI abartınca geri aldım.

---

**Prompt 21**

> Girmeden önce Cloudflare koyalım

**Prompt 22:** *(Cloudflare hata SS)* *Ne lan bu*  
**Prompt 23:** *Localhost domainini ekleyemez miyiz*  
**Prompt 24:** *Cloudflare yerine doğrulama koy — sayı toplama gibi, Cloudflare kısmını kaldır*

**Yorum:** Cloudflare Turnstile localhost'ta saçmaladı. **İnsan kararı:** matematik captcha (HMAC imzalı). AI uyguladı, daha stabil.

---

**Prompt 25**

> Aile bütçesi kısmı içime sinmedi — mantıklı yapsan orayı, emojileri de profesyonel yap

**Prompt 26**

> Çocuk yerine yetişkin vb daha iyi olur — dashboard daha profesyonel olsun sen kıdemli bir UI'cısın

**Yorum:** "Kıdemli UI'cısın" demek Cursor'da işe yarıyor, ciddi.an :D Yetişkin üye etiketleri, koyu sidebar geldi.

---

**Prompt 27** *(bozuk ekran SS)*

> Kanka burayı yapmamışsın burayı düzelt diğer yerler aynı kalsın

**Yorum:** Spesifik olmak önemli — "her şeyi değiştir" demedim, **sadece o blok**.

---

**Prompt 28**

> Budget AI ismini değiştir — demo kullanıcı sonay@sonay.com ise "Sonay Kullanıcı" gözüksün

**Yorum:** Kişiselleştirilmiş demo. Seed'de `ensure_sonay_demo_account` bu yüzden var.

---

**Prompt 29**

> Doğrulama kısmı bozuldu sanırım ya

**Yorum:** Seed import eksikliği backend'i çökertmişti. AI log + import düzeltti — **insan testi** şart.

---

**Prompt 30**

> Matrah kısmını kaldır faturalardan — dashboard daha profesyonel — mantıklı güzel emojiler koy

**Prompt 31:** *Chatbot balonunu büyült, emojileri küçült sade yap*  
**Prompt 32:** *Daha farklı*  
**Prompt 33:** *Eski haline dön — sadece emojileri farklı yap demiştim*

**Yorum:** En net **AI vs insan** anı. "Daha farklı" deyince Cursor tüm dashboard'u bento yaptı; ben sadece emoji istemiştim. **Geri aldırdım.** Dokümantasyona da yazılması gereken ders: prompt spesifik olmazsa AI fazla yapar.

---

### Gün 2 sabah — Emoji → SVG, Docker, test

**Prompt 34:** *Projeyi nasıl çalıştıracağım backend frontend komutları*  
**Prompt 35:** *Gelirler kısmının emojisi gözükmüyor* *(Windows ▯ karakteri SS)*  
**Prompt 36:** *Emojileri renksiz profesyonel yap*  
**Prompt 37:** *Sadece gelirlerle giderleri değiştir*

**Yorum:** Windows'ta 🪙 emoji patladı. **İnsan kararı:** SVG ikon (`IconIncome`, `IconExpense`). Emoji savaşını burada bıraktık.

---

**Prompt 38** *(OCR "Sunucuya bağlanılamadı" SS)*

> Kanka faturayı yükledikten sonra böyle diyor — yanlış mı çalıştırıyorum uygulamayı ne oluyor

**Yorum:** Backend ayaktaydı; sorun **10 saniyelik fetch timeout**'uydu. OCR 30–90 sn sürüyor. `OCR_TIMEOUT_MS = 120000` — AI önerdi, ben onayladım, düzeldi.

---

**Prompt 39**

> Docker ortamına da almak istiyorum — hoca bağımlılık yüklemeden çalıştırabilsin, nasıl yaparız

**Prompt 40:** *Terminale baksana bi*  
**Prompt 41:** *Sen yap* *(build'i agent çalıştırsın)*  
**Prompt 42:** *(Swagger ekranı SS)* *Neden böyle gözüküyor*  
**Prompt 43:** *Docker'ı çalıştırdım arayüze nereden bakabilirz*  
**Prompt 44:** *(Docker Desktop SS)* *Burda nasıl çıkarıcam*

**Yorum:** Docker öğrenme eğrisi de günlüğün parçası. `:8000/docs` API, `:8080` asıl UI — karıştırdım, not düştük README'ye.

---

**Prompt 45:** *Test kodu yazdın mı*  
**Prompt 46:** *Mantıklı olan yerlere test kodu ekler misin*

**Yorum:** pytest + 17 test. OCR test edilmedi (ağır); auth, captcha, CRUD, goal coach yeterli dedim.

---

**Prompt 47**

> Analiz, teknik doküman, kılavuz, AI günlüğü, demo — GitHub README'de SOLID, design pattern, mimari olsun

**Prompt 48** *(bu mesaj)*

> AI günlüğünde prompt'ları yorum havasında yaz — Cursor'dan önce ChatGPT/Gemini/Claude'a sorduklarım da olsun

**Yorum:** Meta: günlüğü günlük yapan prompt :)

---

## Bölüm 2 — AI mı İnsan mı? (Özet Tablo)

| Konu | AI önerdi / yaptı | Ben düzelttim / karar verdim |
|------|-------------------|------------------------------|
| Proje konusu | Alternatif fikirler (ChatGPT) | Aile bütçesini seçtim |
| FastAPI vs Django | İkisi de mantıklı (Gemini) | FastAPI + Swagger |
| LLM vs kural ajan | İkisi de (ChatGPT) | Kural tabanlı multi-agent |
| Cloudflare captcha | Kurulum | **Kaldır** → sayı toplama |
| Dashboard "daha farklı" | Tam bento redesign | **Geri al** — sadece emoji |
| Windows emoji | 🪙 | **SVG ikon** |
| OCR timeout | 10 sn default | **120 sn** |
| Matrah alanı UI | Göster | **Gizle** (DB kalsın) |
| Aile rol sistemi | — | **Yapma** (Claude + ben) |
| Docker CUDA torch | GPU paketleri indirdi | **CPU-only** torch |
| Demo kullanıcı adı | demo@demo.com | **sonay@sonay.com** |

---

## Bölüm 3 — Kullanılan Araçlar (Final)

| Araç | Ne zaman | Rol |
|------|----------|-----|
| **ChatGPT** | Cursor öncesi | Fikir, teknoloji, kapsam |
| **Gemini** | Cursor öncesi | Mimari karşılaştırma, OCR |
| **Claude** | Cursor öncesi | Kapsam kesme, Docker risk |
| **Aile geri bildirimi** | Cursor öncesi | Feature önceliklendirme |
| **Cursor Composer** | Geliştirme | Kod, Docker, test, docs |
| **EasyOCR** | Runtime | Fatura OCR (Zor Mod) |

> Production kodunda harici LLM API **çağrılmıyor**. Multi-agent pipeline kural tabanlı; `openai` paketi ileride LLM eklemek için requirements'ta.

---

## Bölüm 4 — Context Dosyaları (Cursor'a verilen bağlam)

Cursor'a her seferinde sıfırdan anlatmadım; şu dosyalar bağlam oluşturdu:

- `README.md` — kurulum, demo hesap
- `backend/app/models.py`, `schemas.py` — veri modeli
- `backend/app/routers/*` — API
- `backend/app/services/agents/*` — FinansKoç
- `backend/app/services/ocr_service.py` — OCR
- `frontend/src/pages/*`, `api.js` — UI
- `docker-compose.yml` — dağıtım
- Ekran görüntüleri (`assets/`) — OCR/UI hataları için

**Tipik Cursor prompt kalıbım (sonradan oturttuğum):**
> Şu dosyaya bak, diğer yerlere dokunma, minimal diff, Türkçe UI kalsın.

---

## Bölüm 5 — Dersler (Hoca okusun diye)

1. **Önce AI'a "ne yapmalıyım" sor, sonra Cursor'a "bunu yap" de.** Mimari kararı ChatGPT/Gemini/Claude'da almak, kodu Cursor'da yazmak işe yaradı.
2. **Prompt spesifik olmazsa AI fazla yapar.** "Daha farklı" → tüm dashboard değişti; "sadece emoji" demek gerekiyordu.
3. **Demo kısıtları (hoca, Docker, offline) erken belirlenmeli.** SQLite + Docker + kural tabanlı AI bu yüzden.
4. **Gerçek cihazda test et.** Windows emoji, OCR timeout, Cloudflare localhost — hepsi canlıda çıktı.
5. **İnsan geri bildirimi (aile) feature listesini AI'dan daha iyi önceliklendirdi.**

---

## Bölüm 6 — Referanslar

- [Cursor IDE](https://cursor.com)
- [EasyOCR](https://github.com/JaidedAI/EasyOCR)
- [FastAPI](https://fastapi.tiangolo.com)
- Cursor oturum transcript: `agent-transcripts/d4da3a21-.../d4da3a21-....jsonl`

---

*Son güncelleme: Ağustos 2026 — Prompt 48 ile yorum havasında yeniden yazıldı.*
