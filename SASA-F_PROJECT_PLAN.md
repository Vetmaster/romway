# SASA-F — PROJECT_PLAN.md

> Bu doküman, SASA-F projesinin güncel durumunu, mimarisini, temel iş kurallarını, güvenlik yaklaşımını ve bundan sonraki yol haritasını tek yerde tutmak için hazırlanmıştır.
>
> **Son güncelleme:** 2026-10-08  
> **Repository:** `Vetmaster/sasa-f`  
> **Production domain:** `https://sasa-f.com`  
> **Android package:** `com.sasafutbol.yonetim`

---

## 1. Proje Özeti

SASA-F, futbol okullarının çok okullu bir yapı içinde öğrenci, veli, antrenör, okul yönetimi, yoklama, aidat/muhasebe ve bildirim süreçlerini yönetmesini sağlayan web tabanlı bir yönetim sistemidir.

Sistem aynı web uygulamasını Android tarafında Trusted Web Activity (TWA) olarak kullanır.

Ana hedefler:

- Futbol okullarını tek platform altında yönetmek
- Okullar arasında veri izolasyonu sağlamak
- Süper adminin tüm platformu merkezi olarak yönetebilmesi
- Okul adminlerinin yalnızca kendi okul verilerine erişebilmesi
- Antrenörlerin yalnızca görevleri için gerekli öğrenci/antrenman/yoklama verilerine erişebilmesi
- Velilerin kendi çocuklarıyla ilgili sınırlı alanlara erişebilmesi
- Bildirim ve mobil kullanım desteği sağlamak
- Üyelik/abonelik süreçlerini yönetilebilir hale getirmek
- Güvenliği yalnızca arayüzde değil, veritabanı ve altyapı seviyesinde uygulamak

---

## 2. Güncel Teknoloji Yığını

### Web

- HTML
- CSS
- Vanilla JavaScript
- Responsive tasarım
- PWA manifest
- Service Worker

Ana web dosyaları:

- `index.html`
- `app.js`
- `styles.css`
- `manifest.webmanifest`
- `service-worker.js`

### Backend / Veri

- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security (RLS)
- Supabase Edge Functions
- Realtime

İlgili ana dosya ve klasörler:

- `supabase-data.js`
- `supabase/`
- `supabase/migrations/`
- `supabase/functions/`

### Bildirim

- Firebase Cloud Messaging
- Web push / Android push
- Supabase Edge Function üzerinden push gönderimi

### Android

- Trusted Web Activity (TWA)
- Bubblewrap tabanlı Android proje yapısı
- Firebase Messaging
- Android Browser Helper

Güncel Android bilgileri:

- Package: `com.sasafutbol.yonetim`
- Domain: `sasa-f.com`
- Min SDK: 23
- Target SDK: 35
- Compile SDK: 36
- Uygulama sürümü: `1.0.29-beta`
- Version code: `30`

### Hosting / Deployment

- Web dağıtımı GitHub Pages iş akışı ile yapılmaktadır
- Özel domain: `sasa-f.com`
- Veri ve yetkilendirme Supabase üzerindedir
- Bildirim altyapısı Firebase/Supabase birleşimiyle çalışır

---

## 3. Kullanıcı Rolleri

Mevcut sistemde temel roller:

### Platform Süper Admini

- Tüm platformu yönetir
- Okullar arasında geçiş yapabilir
- Okul oluşturma/yönetme işlemlerini yapabilir
- Platform seviyesinde bildirim ve yönetim işlemleri yapabilir

### Okul Admini

- Yalnızca kendi okulunu yönetir
- Öğrenci kayıtlarını yönetir
- Antrenör ve ilgili okul verilerini yönetir
- Aidat ve muhasebe alanlarına erişebilir
- Okul bildirimlerini yönetebilir

### Antrenör

- Güvenli öğrenci dizinine erişir
- Antrenman kayıtlarına erişir
- Yoklama işlemlerini yapar
- Veli iletişim bilgileri, aidat dönemleri ve muhasebe kayıtları gibi gereksiz hassas alanlara erişemez

### Öğrenci Velisi

- Kendi çocuğuna ait izin verilen bilgileri görür
- Kendisine açık bildirimleri ve ilgili kullanıcı alanlarını kullanır

---

## 4. Çok Okullu Mimari

SASA-F çok kiracılı (multi-tenant) bir yapıdadır.

Temel ilke:

> Her okulun verisi `school_id` üzerinden ayrılır.

Başlıca veri alanları:

- Öğrenciler
- Aidatlar
- Antrenmanlar
- Yoklamalar
- Muhasebe
- Bildirimler
- Kullanıcı ilişkileri

Yetki yalnızca arayüz katmanında uygulanmamalıdır.

Supabase RLS kuralları:

- Okul admini → yalnızca kendi okuluna ait kayıtlar
- Antrenör → yalnızca rolüne izin verilen veri
- Veli → yalnızca kendi ilişkili kayıtları
- Süper admin → platform seviyesinde gerekli erişim

---

## 5. Mevcut Temel Modüller

README ve mevcut kod yapısına göre uygulamada şu işlevler bulunmaktadır:

- Giriş
- Role göre menü
- Role göre ana panel
- Öğrenci listesi
- Öğrenci arama
- Grup filtresi
- Yeni öğrenci kayıt formu
- Veliye özel çocuk profili
- Antrenman kartları
- Yoklama formu
- Aidat listesi
- Ödeme durumu güncelleme
- Temel muhasebe özeti
- Bildirim oluşturma
- Çok okullu platform yapısı
- Erişim / başvuru akışları
- Okul admini davet akışı
- Veli davet akışı
- Push notification gönderimi
- Abonelik yenileme hatırlatmaları

---

## 6. Supabase Edge Functions

Repository'de bulunan güncel Edge Function yapısı:

- `approve-school-application`
- `invite-guardian`
- `invite-school-admin`
- `send-push-notification`
- `send-subscription-renewal-reminders`
- `submit-school-application`

Ortak kod:

- `supabase/functions/_shared`

Bu fonksiyonlarda servis anahtarları veya hassas backend işlemleri istemci koduna taşınmamalıdır.

---

## 7. Veritabanı ve Migration Politikası

Veritabanı değişiklikleri:

> Doğrudan production üzerinde elle yapılan değişiklikler yerine migration dosyalarıyla takip edilmelidir.

Migration klasörü:

`supabase/migrations/`

Repository geçmişinde aşağıdaki alanlara yönelik migration'lar bulunmaktadır:

- Başlangıç şeması
- Öğrenci alanları
- Seed/import verileri
- Erişim talepleri
- Süper admin rolleri
- Veli kayıt/e-posta akışları
- Realtime
- Bildirim okunma durumu
- Bildirim görünürlüğü
- Bildirim metrikleri
- Bildirim teslim kayıtları
- Çok okullu platform
- Abonelik dönemleri
- Okul deneme süreleri
- Bildirim gönderen etiketi
- Abonelik işlevlerine erişim kısıtlamaları

### Kural

Her yeni veritabanı değişikliği için:

1. Yeni migration oluştur
2. Lokal/test ortamında doğrula
3. RLS etkisini kontrol et
4. Production'a uygula
5. İlgili kod değişikliğini aynı PR/commit bağlamında tut

---

## 8. Authentication ve Yetkilendirme

Kimlik doğrulama Supabase Auth ile yapılır.

Yetkilendirme katmanları:

1. Kullanıcı oturumu
2. Rol kontrolü
3. Okul ilişkisi
4. RLS
5. Gerektiğinde Edge Function tarafında ilave doğrulama

### Kritik güvenlik kuralı

Frontend içinde bir menüyü gizlemek **yetkilendirme değildir**.

Gerçek erişim kontrolü:

- RLS
- güvenli RPC / DB function
- Edge Function
- backend tarafı doğrulaması

üzerinden uygulanmalıdır.

---

## 9. Firebase ve Push Notification

Firebase Cloud Messaging aktif kullanılmaktadır.

Android uygulamada Firebase Messaging bağımlılığı vardır.

Push gönderimi için Supabase tarafında:

`send-push-notification`

Edge Function'ı bulunmaktadır.

### Test edilmiş durum

- Android debug APK çalışıyor
- TWA doğru domaini açıyor
- Firebase bildirimi debug APK'ya başarıyla ulaşıyor

### Google API Key kısıtları

Web anahtarı:

- HTTP referrer kısıtı
- `sasa-f.com`
- `www.sasa-f.com`

Android anahtarı:

- Package: `com.sasafutbol.yonetim`
- Uygun SHA sertifika fingerprint'i
- Gerekli Google/Firebase API kısıtları

### Production notu

Play Store yayını yapılırken Play App Signing sertifikasının SHA değeri de Google Cloud/Firebase tarafında tanımlanmalıdır.

---

## 10. Android / TWA Yapısı

Ana dosyalar:

- `android/twa-manifest.json`
- `android/app/build.gradle`
- `android/app/google-services.json`

TWA hedefi:

`https://sasa-f.com/`

Launch URL:

`/?nativeVersion=30`

### Debug

Debug APK geliştirme/test amacıyla kullanılmaktadır.

Debug sertifikası production imzası olarak kabul edilmemelidir.

### Release

`twa-manifest.json` içinde signing key bilgisi için:

- path: `android.keystore`
- alias: `sasaf`

referansı bulunmaktadır.

Ancak `android/app/build.gradle` içindeki `release` build type şu anda açık bir `signingConfig` tanımı içermemektedir.

Production yayınından önce release signing süreci açık şekilde doğrulanmalıdır.

### Play Store hedef akışı

Kod
→ test
→ debug APK
→ release signing
→ release AAB
→ Play Console
→ Play App Signing
→ production

---

## 11. GitHub Güvenlik Yapısı

SASA-F için güvenlik katmanları:

### CodeQL

Aktif.

Analiz kapsamı:

- JavaScript / TypeScript
- Java / Kotlin
- GitHub Actions

### Secret Scanning

Aktif.

Firebase istemci API anahtarları GitHub tarafından secret olarak algılanabilir.

Bu anahtarlar:

- istemci tarafında görünür olabilir
- ancak mutlaka uygulama/referrer/API kısıtlarıyla sınırlandırılmalıdır

Gerçek backend secret değerleri repository'ye yazılmamalıdır.

### Dependabot

Repository'de:

`.github/dependabot.yml`

mevcuttur.

Güncel yapı:

- Paket ekosistemi: Gradle
- Dizin: `/android`
- Sıklık: haftalık
- Açık PR limiti: 5

### OWASP ZAP

Web güvenlik kontrollerinde kullanılacaktır / kullanılmaktadır.

Özellikle:

- security headers
- authentication
- erişim kontrolü
- açık endpointler
- XSS
- yanlış yapılandırma

kontrol edilmelidir.

---

## 12. Security Headers

Takip edilmesi gereken başlıca başlıklar:

- HTTPS
- HSTS
- Content-Security-Policy
- X-Content-Type-Options
- Referrer-Policy
- frame / clickjacking koruması

Yeni üçüncü taraf servis eklenirken CSP etkisi ayrıca kontrol edilmelidir.

---

## 13. localStorage Politikası

`localStorage`:

- geçici arayüz önbelleği
- kullanıcı deneyimi
- bağlantı sırasında fallback

için kullanılabilir.

Ancak:

- yetkilendirme kaynağı değildir
- kalıcı ana veri kaynağı değildir
- hassas secret saklama alanı değildir

Sunucu/Supabase verisi her zaman otoritatif kabul edilmelidir.

---

## 14. Git ve Geliştirme Akışı

Ana branch:

`main`

Önerilen geliştirme akışı:

1. `main` güncellenir
2. Yeni branch açılır
3. Değişiklik yapılır
4. Lokal test yapılır
5. Güvenlik/yetki etkisi kontrol edilir
6. Commit
7. Push
8. Pull Request
9. CodeQL / Dependabot / diğer kontroller
10. Merge
11. Production doğrulaması

Önerilen branch isimleri:

- `feature/...`
- `fix/...`
- `security/...`
- `chore/...`

---

## 15. Deployment Kuralı

Production'a çıkan her değişiklikte en az:

- login
- temel role göre erişim
- okul izolasyonu
- kritik CRUD akışları
- bildirim
- mobil açılış
- hata konsolu
- production domain

kontrol edilmelidir.

---

## 16. Test Kontrol Listesi

### Authentication

- [ ] Login çalışıyor
- [ ] Logout çalışıyor
- [ ] Yetkisiz oturum reddediliyor
- [ ] Şifre/davet akışları çalışıyor

### Roller

- [ ] Süper admin tüm gerekli alanlara erişiyor
- [ ] Okul admini başka okul verisini göremiyor
- [ ] Antrenör yasaklı finans/veli alanlarını göremiyor
- [ ] Veli başka öğrencilerin kayıtlarına erişemiyor

### Öğrenci

- [ ] Liste
- [ ] Arama
- [ ] Grup filtresi
- [ ] Yeni kayıt
- [ ] Güncelleme

### Antrenman / Yoklama

- [ ] Antrenman listesi
- [ ] Yoklama
- [ ] Doğru okul/grup izolasyonu

### Aidat / Muhasebe

- [ ] Aidat listesi
- [ ] Ödeme durumu güncelleme
- [ ] Yetki kontrolü
- [ ] Muhasebe görünürlüğü

### Bildirim

- [ ] Web bildirim akışı
- [ ] Android push
- [ ] Bildirim gönderen etiketi
- [ ] Doğru hedef okul
- [ ] Okunma kaydı

### Android

- [x] Debug APK açılıyor
- [x] `sasa-f.com` açılıyor
- [x] Firebase bildirimi geliyor
- [ ] Release build doğrulandı
- [ ] Release signing doğrulandı
- [ ] AAB üretildi
- [ ] Play Console internal test yapıldı
- [ ] Play App Signing SHA kısıtlara eklendi

---

## 17. Kritik Proje Kuralları

1. Production veritabanında kontrolsüz manuel değişiklik yapılmaz.
2. DB değişiklikleri migration ile takip edilir.
3. Service-role key ve benzeri backend secret değerleri istemciye veya GitHub'a yazılmaz.
4. Firebase istemci anahtarları platform ve API kısıtlarıyla korunur.
5. Yetkilendirme yalnızca frontend'e bırakılmaz.
6. RLS kritik güvenlik sınırıdır.
7. Bir okulun verisi başka okul tarafından erişilebilir hale gelmemelidir.
8. Main branch mümkün olduğunca çalışır durumda tutulur.
9. Büyük değişikliklerden önce commit alınır.
10. Güvenlik değişiklikleri fonksiyon testiyle doğrulanır.
11. Android package adı production sonrasında değiştirilmemelidir.
12. Release signing key güvenli saklanmalıdır.
13. Production signing key repository'ye commit edilmemelidir.
14. Yeni bağımlılıklar güncellik ve güvenlik açısından değerlendirilmelidir.
15. Dependabot PR'ları körlemesine merge edilmemelidir; test edilmelidir.

---

## 18. Güncel Durum

### Tamamlanmış / Çalışır Durumda

- [x] Web uygulaması
- [x] `sasa-f.com` domain geçişi
- [x] Çok okullu mimari
- [x] Supabase veri altyapısı
- [x] RLS tabanlı veri izolasyonu
- [x] Öğrenci yönetimi
- [x] Antrenman/yoklama
- [x] Aidat/muhasebe temel akışı
- [x] Bildirim altyapısı
- [x] Firebase Cloud Messaging
- [x] Android TWA
- [x] Debug APK
- [x] Android push testi
- [x] Google API key restrictions
- [x] CodeQL
- [x] Secret scanning
- [x] Dependabot yapılandırma dosyası

### Kontrol / Tamamlama Gerektiren

- [ ] Release signing yapısını netleştir
- [ ] Release AAB oluştur
- [ ] Play Console internal testing
- [ ] Play App Signing SHA ayarı
- [ ] Dependabot açtığı PR'ların düzenli değerlendirilmesi
- [ ] OWASP ZAP kontrollerinin periyodik tekrarı
- [ ] CSP politikasının gerektiği kadar sıkılaştırılması
- [ ] Production release checklist oluşturulması
- [ ] Backup / restore prosedürünün dokümante edilmesi
- [ ] Monitoring ve hata takibi standardının belirlenmesi

---

## 19. Teknik Borç / İyileştirme Alanları

### 1. `app.js` büyüklüğü

Ana uygulama JavaScript dosyası oldukça büyüktür.

Uzun vadede modüllere ayırmak düşünülebilir:

- auth
- students
- attendance
- accounting
- notifications
- subscriptions
- admin
- shared UI

### 2. Dokümantasyon

Aşağıdaki dosyaların zaman içinde ayrılması önerilir:

```text
docs/
├── PROJECT_PLAN.md
├── ARCHITECTURE.md
├── DATABASE.md
├── SECURITY.md
├── ROLES_PERMISSIONS.md
├── ANDROID_RELEASE.md
└── DECISIONS.md
```

### 3. Production release süreci

Android production imzalama ve Play Store yayın süreci ayrı bir doküman haline getirilmelidir.

### 4. Güvenlik regresyon testleri

RLS ve role-based access için tekrar çalıştırılabilir test senaryoları hazırlanmalıdır.

---

## 20. Karar Günlüğü

### Supabase

**Karar:** Ana backend/veritabanı ve authentication altyapısı Supabase olacaktır.

**Neden:** PostgreSQL, Auth, RLS, Realtime ve Edge Functions ile çok okullu yapı için uygun güvenlik ve geliştirme modeli sağlaması.

### Çok Okullu Yapı

**Karar:** Okul verileri `school_id` temelli ayrılacaktır.

**Neden:** Platformun birden fazla futbol okulunu tek backend üzerinden güvenli şekilde yönetebilmesi.

### TWA

**Karar:** Android uygulaması ayrı native UI yerine TWA üzerinden çalışacaktır.

**Neden:** Web ve Android için tek ana uygulama kod tabanının korunması.

### Firebase Cloud Messaging

**Karar:** Push bildirimlerde FCM kullanılacaktır.

**Neden:** Android ve web bildirim desteği.

### Firebase API Key Restrictions

**Karar:** İstemci anahtarları silinmek yerine platform/API kısıtları uygulanacaktır.

**Neden:** Firebase client key'leri istemci uygulamalarında bulunabilir; güvenlik erişim kısıtları, Firebase kuralları ve backend secret yönetimi ile sağlanır.

### GitHub Security

**Karar:** CodeQL + Secret Scanning + Dependabot + OWASP ZAP katmanlı yaklaşımı kullanılacaktır.

**Neden:** Kaynak kod, dependency, secret ve çalışan web uygulaması güvenliğini farklı katmanlarda kontrol etmek.

---

## 21. Sonraki Öncelikler

Önerilen sıra:

1. Dependabot durumunu kontrol et ve varsa PR'ları değerlendir
2. Android release signing sürecini netleştir
3. Release AAB üret
4. Play Console internal test kanalını oluştur
5. Play App Signing fingerprint'ini Google Cloud/Firebase'e ekle
6. OWASP ZAP son taramasını yap
7. RLS rol testlerini tekrar doğrula
8. Production release checklist'i kalıcı dokümana dönüştür
9. Dokümantasyonu `docs/` yapısına ayır
10. Backup / restore prosedürü oluştur

---

## 22. Değişiklik Yapmadan Önce Sorulacak 6 Soru

Her önemli geliştirmede:

1. Bu değişiklik hangi rolü etkiliyor?
2. Başka okulun verisine erişim riski oluşturuyor mu?
3. RLS veya migration gerekiyor mu?
4. Edge Function değişikliği gerekiyor mu?
5. Web ve Android TWA birlikte çalışmaya devam edecek mi?
6. Yeni secret, API key veya dependency ekliyor mu?

Bu sorular cevaplanmadan kritik production değişikliği yapılmamalıdır.

---

## 23. Dokümanın Kullanımı

Codex / ChatGPT ile çalışırken örnek başlangıç komutu:

> Önce `PROJECT_PLAN.md` dosyasını oku. Mevcut SASA-F mimarisine, rol/yetki kurallarına ve güvenlik ilkelerine aykırı değişiklik yapma. Gerekli veritabanı değişikliklerini migration olarak hazırla. İşlem sonunda değişen dosyaları ve test adımlarını özetle.

Bu dosya, projenin “tek gerçek referansı” olmaya çalışmamalıdır; kod ve migration'lar nihai teknik gerçektir. Ancak ürün kararları, sınırlar ve yapılacak işler için ana rehber olarak kullanılmalıdır.
