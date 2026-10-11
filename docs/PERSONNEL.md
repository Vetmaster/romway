# Personel yönetimi — inceleme aşaması

Bu aşama sicil/şifre girişini korur; stok, araç, yakıt veya şifre sıfırlama eklemez. Kod `feature/personnel-management` dalında hazırlanır. Yeni migration dosyası henüz uzaktaki hiçbir Supabase projesine uygulanmamıştır; mevcut GitHub Pages yayını önceki giriş sürümünü kullanır.

## Kesinleşen yetki düzeni

11 Ekim kullanıcı kararı:
- Super_admin tüm personeli görür ve yönetir, admin/super_admin rollerini atar, lokasyon ekler.
- Admin yalnız purchasing/receiver hesaplarını yönetir. Hedefin mevcut lokasyonlarının **tamamı** ve yeni lokasyonların tamamı yöneticinin atanmış lokasyonlarında olmalıdır. Bir kısmının kesişmesi yeterli değildir. Lokasyonsuz hesapları admin göremez/yönetemez.
- Purchasing/receiver personel yönetimine erişemez. Geçici şifre henüz değişmemişse yönetici işlemleri kapalıdır.
- Super_admin dışındaki tüm personelin en az bir lokasyonu olmalıdır. Super_admin'ın personel yönetimindeki genel yetkisi depo işlemlerinin henüz yazıldığı anlamına gelmez.
- Kendi hesabını kapatma/rol düşürme engellenir. Son kullanılabilir super_admin korunur.

Yetki UI menüsüyle sınırlı değildir: RPC canlı opaque oturumu, aktiflik, şifre değişimi ve rol/lokasyonları SQL içinde yeniden doğrular. Yeni özel tablolar RLS ile kapalıdır; anon/authenticated RPC çalıştıramaz. Kullanıcı JWT'si veya tarayıcıdan rol gönderimi erişim sağlamaz.

## Hesap ekleme ve geçici şifre

Sunucu önce sicili ve lokasyon/rol atamasını rezervasyon olarak kaydeder. Auth kullanıcısı aynı UUID ve iç `staff-UUID@identity.invalid` kimliğiyle oluşturulur; kullanıcı e-posta girmez. Auth API'nin ID alanı [Supabase Auth kaynak kodundan](https://github.com/supabase/auth/blob/master/internal/api/admin.go) doğrulandı. Auth tamamlandıktan sonra ikinci RPC yetkiyi yeniden doğrular ve personeli atomik olarak aktifleştirir.

Geçici şifre sunucuda 256 bit rastgele üretilir, 24 saat geçerlidir; ilk girişte değiştirme zorunludur. İşlem başarılı olunca yalnız bir kez yönetici ekranına HTTPS üzerinden iletilir. Statik kaynak/config, audit, localStorage/sessionStorage veya günlüklerde tutulmaz. Yönetici güvenli biçimde personele iletir; gizle, başka form açma ve çıkış DOM'daki değeri temizler. Tarayıcı yenilenirse şifre tekrar gösterilemez. Bu tek seferlik teslim, kaynak koda veya tarayıcı yapılandırmasına sabit şifre koymak değildir.

Auth/veritabanı isteği başarısızsa kayıt silinmez, aynı sicille otomatik yeniden oluşturma yapılmaz. Auth kullanıcısı oluşmuş fakat tamamlanmamışsa Romway personel/oturum yetkisi yoktur. `personnel_requests` ve audit kaydı operatör incelemesine kalır. Ağ yanıtı kaybolursa işlemin sonucunu listeden kontrol edin; geçici şifreyi geri getirme veya sıfırlama arayüzü bu aşamada yoktur. Kurtarma prosedürü ayrı küçük aşama gerektirir.

## Değişiklikler ve kayıt koruma

Ad, rol, lokasyon veya aktiflik değişimi personelin tüm Romway oturumlarını iptal eder. Aktifleştirme eski oturumları geri açmaz, geçici şifre süresini uzatmaz. Eski lokasyon atamaları `assigned=false` olarak tutulur; personel, Auth kullanıcısı ve geçmiş satırlar silinmez. İşlemler SQL transaction ve yönetim kilidiyle seri hale gelir. İşlem yapan, hedef, zaman, rol/lokasyon ve aktiflik audit'e yazılır; şifre/token yazılmaz.

Temsili lokasyonlar kullanıcı isteğiyle `TR_TEST / Türkiye Test Deposu` ve `RO_TEST / Romanya Test Deposu` olarak migration dosyasında hazırlandı. Gerçek iş kaydı sayılmaz. Super_admin sonradan gerçek isimlerle yeni lokasyon ekleyebilir; lokasyon yeniden adlandırma/pasifleştirme henüz yoktur.

## Doğrulama ve dağıtım sınırı

`npm test` SQL ve endpoint yetkilerini; `npm run test:personnel-browser` PGlite + gerçek HTTP handler üzerinde 390/1440 px arayüz, TR/RO, ekleme/düzenleme/pasifleştirme/yeniden aktifleştirme, zorunlu şifre değişimi, textContent ve depolama sınırlarını test eder. Bu yeni akışın Auth API'si tarayıcı testinde simüledir. `npm run test:browser` giriş regresyonudur.

Yeni migration/Edge dağıtımı mevcut izin kapsamından ayrı değerlendirilir: AGENTS.md'deki test projesi istisnası giriş şeması/fonksiyonu içindir. İncelenebilir kod/PR ve yerel testler tamamlandıktan sonra **yalnız romway-auth-test** için kullanıcı onayı alınır. Sasa-F/Vetamerikan-shift projelerine dokunulmaz. Sonra gerçek Auth personel entegrasyonu doğrulanır; bu doğrulamadan önce yeni ekran Pages'e yayınlanmaz. Otomatik PR merge yapılmaz.
