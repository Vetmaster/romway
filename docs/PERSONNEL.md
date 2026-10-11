# Personel yönetimi — inceleme aşaması

Bu aşama sicil/şifre girişini korur; stok, araç, yakıt veya şifre sıfırlama eklemez. Kod `feature/personnel-management` dalında hazırlanır. Kullanıcının 11 Ekim açık onayıyla yeni migration ve Edge yalnız romway-auth-test projesine uygulandı. Gerçek API, mobil önizleme ve yönlendirmesiz gerçek GitHub Pages yayın sonrası testleri geçti. Test yayını personel ekranını içerir; gerçek iş verisi/pilot kapsam dışıdır.

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

Kullanıcı PR #4 kapsamındaki personel migration/Edge, gerçek entegrasyon ve başarılı doğrulama sonrası Pages yayınını açıkça onayladı. Yalnız romway-auth-test değişti; Sasa-F/Vetamerikan-shift projelerine dokunulmadı. Önce gerçek Edge/Auth/DB API ve mobil önizleme geçti; ardından Pages yayınlandı ve gerçek yayın dosyalarıyla doğrulandı. Otomatik PR merge yapılmaz.

Opt-in uzak kontrol: `ROMWAY_TEST_PROJECT=ifnjvdjhfhzfxyuorqvz npm run test:cloud-personnel`. Yayın sonrası ayrıca `ROMWAY_TEST_PUBLISHED=true` kullanılır; bu mod HTML/JS/CSS yönlendirmesi yapmadan gerçek yayın dosyalarını test eder. Test yalnız bu koşunun rastgele IT_P_ sicillerini oluşturur ve sonunda pasifleştirir; TESTADMIN şifresi okunmaz/değişmez, geçmiş silinmez. Anahtarlar repo dışındaki özel dosyalarda kalır. Gerçek API testinde aynı sicille eşzamanlı iki çağrı yalnız bir personel oluşturdu; doğrudan anon/JWT yönetim RPC'si reddedildi.

## Liste ve form düzeni — 11 Ekim kullanıcı isteği

Personel yönetimi açıldığında form kapalı, liste görünürdür. Listenin üstündeki tek “Personel ekle” düğmesi boş formu açar ve sicil alanına odaklanır. Formdaki “Personeli kaydet” hesabı oluşturur; “Vazgeç” kayıt oluşturmadan formu temizleyip kapatır. Listedeki “Düzenle” mevcut personelin formunu açar. Başarılı kayıttan sonra form kapanır ve liste güncellenir; geçici şifre tek seferlik teslim alanında kalır. TR/RO metinleri ayrı dil dosyalarındadır. Bu değişiklik yalnız statik arayüzdedir; Supabase şeması/Edge veya kayıtlar değiştirilmez.

## Kompakt yönetim ekranı

Personel yönetimi açılınca karşılama kartı ve tanıtım bölümü gizlenir; yönetim ekranı üstte başlar. Ana sayfaya dönüş ve çıkış üst çubuktadır. Bildirim/hata metinleri yönetim panelinde görünür. Personeller geniş kartlar yerine ad/sicil, rol/lokasyon/durum ve düzenle düğmesinden oluşan çizgilerle ayrılmış liste satırlarıdır. Satırların yatay genişliği korunur; dikey dolgu 12 px yerine 4 px olur. Ad ve sicil uygun genişlikte aynı hizadadır. Telefonda bilgiler tüm satır genişliğini kullanır; düzenleme düğmesi dar bir yan sütun ayırmadan akışa katılır. 44 px düğme hedefi korunur. Personel verileri ve sunucu izinleri değişmez.

## Dashboard ve çekmece menü

Giriş/şifre değişimi kuralları korunur; başarılı giriş ve oturum geri yükleme sonrası ilk ekran dashboard olur. SASA-F yerel index.html, styles.css ve app.js kaynaklarındaki gezinme kartı/sol menü yaklaşımı Romway paletine uyarlandı. Personel yönetimine dashboard kartı ve sol çekmece menüden ulaşılır; ikisi de aynı API kontrollü ekranı açar. Kart ve menü öğesi yalnız admin/super_admin için görünür. Stok/sevkiyat kartları henüz işlevsiz ve açıkça Yakında olarak işaretlidir; sahte sayaç yoktur. Modal çekmece klavye odağını sınırlar, Escape/kapatma/dış alan ile kapanır. Menü tercihi veya personel verisi tarayıcı deposuna yazılmaz.

## Telefon paneli ve durum rozetleri

Mobil personel ekranında dış yatay boşluklar 12 px, panel iç boşluğu 14 px olur. Ad/sicil tam satır genişliğini kullanır; düzenleme düğmesi detayların sağında sabit sütundadır, tek başına alt satıra kaymaz. Aktif rozet yeşil, pasif rozet kırmızıdır; metinler renk dışında da durumu belirtir.

## SASA-F banner/menü yerleşimi ve düğme düzeltmesi

Banner üstte tam genişliktedir; altında ayrı gezinme çubuğu bulunur. 821 px ve üstünde sol menü sürekli açık, daha dar ekranlarda modal çekmece olur. Ekran boyutu değişince menü modu yeniden kurulur. Mobil düzenle düğmesi önceki sürümde ikinci bilgi satırına yerleşiyordu; artık ad/sicil ve detayların tamamını kapsayan sağ sütunda ortalanır. Uzun isim/lokasyon metni sol alanda sarılır, düğme ayrı alt satıra inmez.

## Banner kontrolleri

Üst çubuktaki Ana sayfa düğmesi kaldırıldı; dashboard’a sol menüdeki Genel bakış ile dönülür. Dil seçimi banner sağında Test ortamı altında, çıkış düğmesi gezinme çubuğunda sağa yaslı ve tek satırdır.

## Açılır personel kartı

Personel ekleme alanı kapalı kart olarak açılır. Başlık ilk basışta formu açar, ikinci basışta kayıt oluşturmadan temizleyip kapatır. Açık/kapalı durumu aria-expanded ve +/− ile belirtilir; klavye düğmesi ve odağı korunur. Kaydet/vazgeç sonrası form kapanır; geçici şifre teslim alanı kart dışında korunur. Düzenle mevcut formu açmaya devam eder.

## Lokasyon kartı, arama ve sıralama

Lokasyon ekleme kapalı kart olarak personel kartının hemen altındadır; yalnız super_admin görür. Başlık formu açıp kapatır; başarılı kayıt kapatır. Liste altta, arama ad/sicil/rol/durum/lokasyon metinlerinde Türkçe/Romence karakterleri normalleştirerek çalışır; veriler depolanmaz. Aktifler önce, pasifler sonra; her grup created_at azalan sıralanır. created_at sunucu yanıtına 202610110003 migration ile eklenir; önceki API tarih içermediği için migration uygulanmadan kronolojik sıralama doğrulanmış sayılmaz.
