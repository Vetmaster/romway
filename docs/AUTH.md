# İlk giriş aşaması — tasarım, test ve kurulum sınırları

## Hazırlanan yapı
- `web/`: yalnız statik HTML/CSS/modüler JS. TR/RO ayrı dil dosyaları. Sicil/şifre, zorunlu değişim, sade karşılama ve çıkış ekranları.
- `supabase/functions/romway-auth/`: Deno giriş noktası; bağımlılıksız JavaScript HTTP işleyicisi ve Supabase Auth/REST adaptörü. Yanlış yüklenen eski `.ts` dosyasından kod alınmadı.
- `supabase/migrations/202610100001_auth_foundation.sql`: yalnız yeni, izole test projesi için yeni özel şema ve service-only RPC'ler. Hiçbir mevcut veri değiştirilmedi.
- `scripts/provision-staff.mjs`: yalnız localhost test projesinde ilk super_admin hesabını açan operatör betiği. Personel yönetimi arayüzü ve admin sıfırlaması sonraki aşamadır.

## Oturum ve ilk şifre değişimi
1. Web sicil/şifreyi JSON POST ile Edge Function'a gönderir. Sunucu sicili iç Auth e-posta kimliğine eşler. Supabase Auth şifreyi doğrular; oluşan doğrulama oturumu hemen kapatılır.
2. Auth JWT/refresh token tarayıcıya veya veritabanına yazılmaz. Sunucu ayrı 256 bit rastgele oturum kimliği üretir, yalnız SHA-256 özetini özel sessions tablosunda saklar.
3. Oturum kimliği JavaScript'in erişemediği HttpOnly cookie ile taşınır. Üretim cookie'si Secure/HttpOnly ve __Host- öneklidir; Domain verilmez. Varsayılan mod SameSite=Strict; GitHub Pages için açıkça seçilen partitioned mod SameSite=None; Partitioned kullanır. Bu mod güncel tarayıcılarda oturumu üst siteye göre ayırır; Origin/JSON ve sunucu yetki kontrolleri aynen korunur. Localhost geliştirmede yalnız ayrı dev cookie'si HTTP kullanır. Şifreler hiçbir istemci deposuna yazılmaz; yalnız form/istek sırasında kullanılır. localStorage yalnız dil tercihini saklar.
4. Her istekte aktif hesap, veritabanı oturum süresi, sürüm, işlem kilidi ve geçici şifre süresi kontrol edilir. Geçici girişte `me` yalnız şifre değişimi zorunluluğunu döndürür, profil vermez. Henüz stok/finans API'si yoktur.
5. Şifre değişimi mevcut şifreyi yeniden doğrular; yeni şifre 12–128 karakter ve farklı olmalıdır. Satır kilidi ve sürüm kontrolüyle yalnız bir değişim başlar; bütün uygulama oturumları Auth değişiminden **önce** iptal edilir.
6. Auth ve veritabanı ayrı servisler olduğundan ortak transaction yoktur. İkinci adım başarısızsa hesap kalıcı işlem kilidinde kalır; eski şifre/token erişimi geri verilmez. Otomatik kilit açma veya kullanıcı silme yapılmaz. Başarılı değişimde yeniden giriş gerekir.

Prototip varsayımları: oturum en fazla 8 saat (kayan süre yok); geçici şifre 24 saat; sicil başına 15 dakikada 10 giriş denemesi, değişim başına 10 deneme, tüm endpoint için 300 parola işlemi. Bunlar üretim politikası olarak onaylanmış sayılmaz; ölçüm ve kullanıcı kararıyla ayarlanacak. Genel sınır toplu saldırıyı sınırlar ama tüm çalışanları etkileyebilecek hizmet engelleme riski vardır. Güvenilir ağ/IP limiti, audit/monitoring ve saklama politikası pilot öncesi eklenmelidir.

## Sunucu/veritabanı erişimi
`romway_private` şemasında RLS açık, istemci policy'si ve anon/authenticated erişimi yoktur. RPC'ler security definer, boş search_path ve yalnız service_role EXECUTE izniyle çalışır. Web doğrudan tablo/RPC sorgulamaz. Gelecekteki stok/lokasyon/fiyat uçları aynı sunucu oturumunu doğrulamadan service_role ile işlem yapmamalıdır. Henüz ürün/fiyat tabloları veya lokasyon işlem endpoint'leri yok; bu alanların uygulanmış yetkileri olduğu iddia edilmez.

Cookie kullanan tüm POST'lar tam `APP_ORIGIN` ve JSON Content-Type ister. Eksik/null/yabancı Origin reddedilir; CORS wildcard yoktur. Gövdeler 8 KB, sunucu fetch zaman aşımı 12 saniye, web isteği 15 saniye ile sınırlandırılır. Hata yanıtlarında sunucu/anahtar bilgileri ve Auth'ın iç mesajları gösterilmez. Origin kontrolü otomatik saldırılara karşı kimlik doğrulaması değildir; oturum ve deneme sınırlama ayrı uygulanır.

## Yerel önizleme
Node 22+ ile:

```sh
npm ci --ignore-scripts
npm run check
npm test
npm run dev
```

`http://localhost:8000` adresinde ekranlar açılır. Varsayılan `web/js/config.js` endpoint'i boştur; form devre dışıdır ve bağlantının kurulmadığı açıklanır. Sahte başarılı giriş veya demo yetki yoktur. Sunucu yalnız web klasörünü servis eder; planlar ve sunucu kaynakları yayınlanmaz.

Tarayıcı testleri:

```sh
npx playwright install chromium
npm run test:browser
```

Hazır Linux CI şablonu Chromium'u ayrıca kurar; workflow yetkisi olmadığı için şablon henüz etkin değildir. Yerel Chrome kullanmak için `PLAYWRIGHT_EXECUTABLE_PATH` test değişkeni desteklenir. Test sonuç ekranları `test-results/` içinde, Git dışında saklanır. Tarayıcı testlerindeki API yanıtları yalnız test içinde simüle edilir.

## Yerel Supabase kurulumu — çalıştırılmadı
Bu komutlar yalnız **yeni yerel test projesi** içindir; çalıştırılmadı. 11 Ekim kullanıcı kararıyla ayrı bulut test projesi kuruldu; güncel gerçek entegrasyon durumu [TEST_ENVIRONMENT.md](TEST_ENVIRONMENT.md) içinde. Mevcut veya canlı Supabase projesine uygulanmaz. Docker çalışır olmalı:

```sh
supabase start
supabase functions serve romway-auth --env-file /absolute/private/romway-local.env
```

Yeni yerel proje başlatılırken migration uygulanır; proje zaten mevcutsa önce içindeki verileri inceleyin. `db reset` veya bağlı projeye `db push` kullanmayın. Yerel env dosyası repo dışında ve 0600 izinle korunur. İçinde APP_ORIGIN=http://localhost:8000 ve ROMWAY_LOCAL_DEV=true bulunur; Supabase yerel çalışma zamanı kendi URL/anahtarlarını sunucuya sağlar. Kullanıcı arayüzünde token veya anahtar alanı yoktur. Operatör araçları yerel ortam değişkenlerini güvenilir terminal ortamından kullanır; bunlar README veya Git'e yazılmaz.

İlk yerel test yöneticisi, yalnız yerel SUPABASE_URL/ANON_KEY/SERVICE_ROLE_KEY ortamında:

```sh
node scripts/provision-staff.mjs TESTADMIN 'Test Admin' /absolute/private/romway-test-admin.json
```

ROMWAY_LOCAL_DEV=true gereklidir. Betik parola üretir; repo dışındaki yeni 0600 dosyaya yazar ve senkronize eder, sonra hesabı aktive eder. Çıktı dosyası üzerine yazılmaz, şifre terminale basılmaz. Kısmi hatada Auth kullanıcısı/aktif olmayan staff kaydı kalabilir; bunlar silinmez, erişim vermez. Yalnız bu operatör betiği test hesabı oluşturur; browser endpoint'i create/reset-staff işlemi sunmaz.

Yerel web config authEndpoint alanını `http://localhost:54321/functions/v1/romway-auth` yapın; web ve endpoint aynı localhost adını kullanmalı. Yerel tarayıcı için index.html CSP connect-src izin listesi de güncellenmelidir. GitHub Pages _headers dosyasını uygulamaz; meta CSP ve canlı HTTP başlıkları ayrı doğrulanır.

Gerçek testte: yanlış şifre, kapalı hesap, ilk değişim, doğru yeni giriş, cookie turu, çıkış, iptal edilen eski oturum, Auth API'sinden alınmış JWT ile doğrudan tablo/RPC reddi ve kısmi işlem kurtarma sınanmalıdır. Yerel PGlite testindeki auth.users/roller sentetik fixture'dır; gerçek Supabase Auth/Edge gateway yerine geçmez.

## GitHub Pages oturum uyumu

11 Ekim 2026 kullanıcı özel alan adı olmadan GitHub Pages üzerinden devam etmeyi belirtti. Varsayılan Strict cookie github.io/supabase.co arasında çalışmaz; bu olumsuz durum gerçek tarayıcıyla test edildi. Yeni opt-in `ROMWAY_COOKIE_MODE=partitioned` HTTPS, HttpOnly, __Host- ve SameSite=None; Partitioned (CHIPS) kullanır. Düz SameSite=None modu ve JS token fallback yoktur. Her POST tam APP_ORIGIN ister. Cookie desteklenmez/engellenirse giriş me turunda doğrulanmaz ve açık tarayıcı oturumu uyarısı gösterilir; karşılama açılmaz.

Özel alan adı veya ücretli Supabase özelliği kurulmadı. CHIPS güncel tarayıcılar için tasarlanır; Chrome entegrasyon testi Safari/Firefox gerçek cihaz testi sayılmaz. Pilot öncesi hedef telefonlar ayrıca denenmeli. Güncel sonuçlar [TEST_ENVIRONMENT.md](TEST_ENVIRONMENT.md) içinde.
Kaynaklar: [MDN CHIPS](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Third-party_cookies/Partitioned_cookies), [Chrome cookie attributes](https://privacysandbox.google.com/cookies/basics/cookie-attributes).

## Kilitli hesap kurtarma
Parola işlemi kilidi varsa giriş reddedilir. Operatör ayrı güvenilir ortamda operation kimliği, staff sürümü ve Auth hesabını inceler; Auth durumunu doğrulamadan `romway_finish_password` çağırmaz. İstenirse yeni geçici şifre ve yeni süreyle yetkili kurtarma akışı sonraki aşamada hazırlanacak. İlk prototip otomatik kurtarma veya admin sıfırlama uygulamaz. Kalıcı kayıtlar/hesaplar silinmez.

## Dağıtım sınırı
GitHub Pages çıktısı yalnız `web/`. HTML meta CSP varsayılan connect-src 'self' ile kilitlidir; gerçek endpoint origin'i izin listesine eklenmelidir. QR ilk aşamada olmadığı için kamera izni kapalıdır; QR aşamasında kullanıcı kararı ve kamera testleriyle açılır. Signup kapatma, function JWT gateway ayarı ve RLS gerçek ortamda doğrulanmadan dağıtım yapılmaz.
