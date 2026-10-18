# Romway — ana kapsam ve kesin kararlar

Güncelleme: 10 Ekim 2026. Bu belge mevcut uygulamanın tamamlandığı anlamına gelmez. Kök dizindeki `Romway_Proje_Plani.md` özgün kaynak olarak korunmuştur. Kullanıcının bu sohbet içindeki kesin kararları, kaynak plandaki eski öneri ve açık kararları günceller. SASA-F_PROJECT_PLAN.md bütünü okundu; geliştirme, güvenlik, test ve dokümantasyon ilkeleri Romway kapsamına uyarlandı.

## Amaç ve sınırlar
Türkiye ve Romanya depoları arasında ağırlıklı araç yedek parçalarının satın alınması, sevkiyatı, teslimi, departmana aktarılması ve araç/makinede kullanımı izlenir. İlk kurulum tek Romway kurumudur. Şirket adı, logo ve lokasyonlar yapılandırılabilir; ortak çok şirketli platform kapsam dışıdır.

Yalnız telefon/tablet/bilgisayara uyumlu web uygulaması. İlk sürüm çevrimiçi; QR telefon kamerasıyla okunur. Canlı GPS, bildirim merkezi, web push ve çevrimdışı stok işlemleri kapsam dışıdır.

## Kesin teknik seçimler
| Katman | Karar |
| --- | --- |
| Web | Sade HTML/CSS ve modüler JavaScript |
| Kaynak kod | Özel GitHub deposu: Vetmaster/romway |
| Statik yayın | GitHub Pages; yalnız web çıktı dizini gh-pages dalından yayınlanır |
| Veri/kimlik doğrulama | Supabase PostgreSQL ve Auth |
| Güvenilir sunucu işlemleri | Supabase Edge Functions ve güvenli PostgreSQL fonksiyonları |
| Diller | Türkçe ve Romence; metinler ayrı dil dosyalarında |

Next.js, Auth.js, Vercel ve Cloudflare Workers eklenmez. 10 Ekim 2026 kullanıcı kararı GitHub Pages yönünde güncellendi; Cloudflare kurulmayacak. romway.ro alt alan adı ve ürün markası henüz seçilmedi; DNS veya servis kurulumu yapılmış sayılmaz.

## Personel ve güvenlik
- Giriş yalnız sicil numarası ve şifreyle; kullanıcıdan e-posta/telefon istenmez.
- Sunucu her personel için posta kutusu olmayan benzersiz e-posta biçimli iç Auth kimliği üretir. Edge Function sicili bu kimliğe eşleyip Supabase Auth ile şifreyi doğrular. Sicil değişse bile personel/Auth kimliği korunur. İç kimlik secret değildir; kullanıcı akışında gösterilmez.
- Admin hesap açarken otomatik, güvenli rastgele geçici şifre oluşturur; ilk girişte şifre değişimi zorunludur. Posta ile kurtarma yerine yetkili admin sıfırlaması kullanılır. Geçici şifreyle stok/finans erişimi sunucuda engellenir.
- Roller: `super_admin`, `admin`, `purchasing`, `receiver`. Receiver arayüzde Nakliye personeli (RO: Personal de transport) olarak adlandırılır; teknik rol kimliği korunur. Nakliye personeli tüm lokasyonlarda ürün teslim alabilir ve nakliye/transfer gerçekleştirebilir; bu iki işlem lokasyon ataması gerektirmez. Nakliye personelinin lokasyonu yalnız hangi deponun çalışanı olduğunu belirtir; sevkiyat erişimini sınırlandırmaz ve ek yetki vermez. Bu rol sevkiyat/transfer ve buna bağlı teslim alma dışında işlem yapamaz. Ürün ekleme/silme, satın alma, stok düzeltme, kullanım çıkışı, personel/lokasyon yönetimi ve finans işlemleri bu role kapalıdır. Diğer rollerin lokasyon sınırı korunur. Fiyat erişimi yalnız super_admin, admin ve purchasing rollerindedir.
- Rol/lokasyon/kayıt/alan izinleri sunucuda ve veritabanında uygulanır; menü gizleme yetki kontrolü değildir. Receiver'a finansal veri hiçbir erişim yolunda verilmez.
- Şifre/token/service_role anahtarı kaynak kod, tarayıcı yapılandırması ve günlüklerde tutulmaz. Kullanıcıdan token kopyalaması istenmez. Oturum uygulama tarafından yönetilir.
- Açık kayıt kapalıdır. Giriş denemeleri sınırlandırılır. Kapalı hesap ve eski oturumlar reddedilir. Oturum süreleri ve ilk yönetici kurulum yöntemi test öncesi belgelenecek.

## Malzeme, alım ve stok
- Tedarikçi Excel stok kartları kontrollü önizleme, doğrulama ve mükerrer kontrolüyle içe alınır. Ürün kartı aktarımı fiziksel stok artırmaz; başlangıç stokları ayrı işlemdir.
- Takip türü ürün kartında parti/miktar veya tekil seri olarak seçilir. Farklı alım partileri farklı kimlik, maliyet ve garanti geçmişi taşır.
- Malzemelere ve araç/makinelere ayrı QR kimliği verilir. Genel ürün/raf QR'ı parti seçimine yardımcı olur; sevkiyat/paket QR ayrıntıları sonraki aşamada belirlenir.
- Temel birimler adet/litre/kg/metre gibi tanımlanır. Kutu/paket dönüşümü açık tutulur; stok ve temel birim maliyeti dönüşümle hesaplanır. QR okutma bütün paketin çıkışı değildir; miktar onaylanır.
- Garanti bitişi, son kullanma tarihi, stok miktarı ve hareket geçmişi tutulur. Düşük stok ve fiyat değişimleri ekranda izlenir; otomatik bildirim gönderilmez.

## Transfer, teslim ve kullanım
1. İlk satın alan depo alış fiyatını ve alım partisini kaydeder.
2. Purchasing atanmış kaynak lokasyondan, nakliye personeli ise tüm kaynak lokasyonlardan admin onayı olmadan nakliye/transfer yapabilir; kişi, kaynak/hedef ve zaman kayıtlıdır.
3. Malzeme kaynak depo → yolda → hedef depo şeklinde izlenir. Depolar arası hareket satış değildir; transferdir.
4. Nakliye personeli lokasyon atamasından bağımsız olarak her hedef lokasyonda QR okuyup miktarı doğrulayarak teslim alır. Sağlam kabul kullanılabilir stoğa girer; hasarlı miktar ayrı tutulur; eksik miktar teslim edilmiş sayılmaz. Uyuşmazlık çözülmeden sorunsuz teslim olarak kapatılmaz.
5. Departmana teslim ve araç/makinede fiilî kullanım ayrı hareketler olarak izlenir. Miktar, teslim alan/kullanan, departman, araç/makine, işlem yapan ve zaman kaydedilir. Nakliye personeli kullanım çıkışı yapamaz; yetkili diğer rol ayrıca tanımlanır.
6. Kullanılmamış sağlam iade aynı parti/tekil kimlik ve maliyetle kullanılabilir stoğa döner. Kullanılmış/arızalı parça ayrı durumdadır; admin kararı olmadan kullanılabilir yapılmaz. İade önceki hareketle ilişkilidir.
7. Tamamlanmış yanlış kayıt/stok farkı düzeltmesi yalnız admin/super_admin tarafından gerekçeyle yapılır; eski kayıt, kişi ve zaman korunur.

## Maliyet
- Para birimi EUR. Alış fiyatı vergi dahil; net tutar, oran ve vergi ayrı gösterilir. Sabit ülke vergi oranı varsayılmaz.
- Taşıma gideri alış maliyetine eklenmez. Alışın paket veya temel birim fiyatı olduğu açık belirtilir.
- Belirli parti/seri okutulursa o kaydın maliyeti kullanılır. Genel ürün QR'ında uygun mevcut partiler için FIFO önerilir; fiziksel seçilen parti doğrulanır.
- Transfer ve sağlam iadede orijinal maliyet korunur. Yeni fiyat eski partinin fiyatını değiştirmez.
- Ondalık hassasiyet/yuvarlama kuralları tanımlanacak. Basit maliyet hesapları ve raporlama yapılır; kapsamlı muhasebe sistemi bu aşamada kurulmaz.

## Yakıt ve raporlar
Şantiye tankları, tank girişleri, tanktan araca dolum ve istasyondan doğrudan alımlar izlenir. Litre, fiyat, toplam, tarih, personel ve uygun kilometre/çalışma saati bilgisi tutulur. Tank çıkışı stoktan düşer. Tam/kısmi dolum, litre/100 km ve litre/çalışma saati hesaplarının ölçüm kuralları ayrıca netleştirilecek.

Ürün, depo, departman, kişi, araç/makine ve dönem bazında stok/hareket/maliyet raporları hazırlanır. Garanti ve tarih takibi korunur; eş değer ürün onayı ve fiyat uyarı eşiği henüz açık karardır.

## Veri bütünlüğü ve yayın
Stok ve maliyet güncellemeleri atomiktir. Tekrar okutma/çift tıklama/ağ tekrarı aynı hareketi çoğaltmaz. Eşzamanlı çıkışlarda fazla stok ve aynı seriyle iki transfer reddedilir. QR yalnız kimlik referansı taşır; yetki/maliyet/gizli bilgi içermez.

Küçük dal/PR'lar, sentetik verili ayrı test ortamı, ilgili işlev ve doğrudan API/RLS testleri kullanılır. Mevcut Supabase'e migration/dağıtım yapılmaz. Otomatik PR birleştirme yoktur. Canlı öncesi ayrı ortamda yedek geri yükleme ve veri tutarlılığı denenir; kod geri dönüşü veri geri dönüşü değildir.

## Tasarım
Mavi #065788, kırmızı #DB202D, zeytin #697000, sarı #FFE500 ve beyaz. Kontrast ve okunabilirlik korunur. Sasa-F yerel kaynaklarından gövde Roboto (400/500/700/900), marka Anta doğrulandı. Sasa-F'ün futbol okulu, ödeme ve üyelik akışları taşınmaz.

## İlk geliştirme aşaması ve açık işler
İlk aşama yalnız sicil/şifre giriş, zorunlu şifre değişimi, TR/RO dil seçimi ve sade karşılama ekranıdır. Yanlışlıkla eklenen Auth dosyası proje referansı değildir. Plan gereksinimlerine göre ilk yerel giriş prototipi hazırlandı; gerçek Supabase entegrasyonu henüz doğrulanmadı; statik Pages önizlemesi ayrı olarak yayınlanır. Personel yönetimi, stok, transfer, QR ve yakıt sonraki küçük aşamalardır.

Açık işler: Gerçek izole Supabase/Auth/Edge entegrasyonu, bootstrap doğrulaması, aynı-site cookie adres kararı, oturum süreleri, kısmi hesap işlemlerinin kurtarılması, Excel örnekleri/başlangıç stokları, etiket/baskı, performans ölçütleri, yedek hedefleri ve pilot cihazları. İlerleme kanıtları `INCELEME.md`, küçük aşamalar `TODO.md` içindedir.

## Sasa-F planından uyarlanan düzen
Modüler auth/yetki/ortak arayüz ayrımı, kodla aynı PR içinde migration dosyaları, ayrı test ortamı, doğrudan RLS/rol regresyon testleri, güvenlik başlıkları, bağımlılık sürüm kontrolü, secret taraması, yayın sonrası temel akış kontrolü ve yedek geri yükleme dokümantasyonu alınır. Bunların Romway deposunda kurulmuş/çalıştırılmış olduğu varsayılmaz. CodeQL/secret scanning kullanılabilirliği mevcut açık depo ayarlarına göre doğrulanacak; mevcut bağımlılığa uygun Dependabot yapılandırması hazırlanacak. OWASP ZAP çalışan deneme web uygulaması hazır olunca değerlendirilir. Android/TWA, Firebase, okul üyeliği, ödeme, okul izolasyonu akışları taşınmaz; GitHub Pages tercihi kullanıcının sonraki kararıdır.

İlk aşamanın HttpOnly cookie oturum tasarımı, test kanıtları ve canlıya geçiş sınırları `AUTH.md` içinde kayıtlıdır. Auth tokenları JavaScript’e aktarılmaz; üretim oturum süreleri ve web/API alan adı kararı henüz açık olarak korunur.

## Yayın kararı — 10 Ekim 2026
Kullanıcı Sasa-F gibi GitHub Pages üzerinden devam etmeyi açıkça seçti. Bu karar eski Cloudflare tercihini günceller. İlk yayın yalnız bağlantısız statik arayüz önizlemesidir. Kullanıcının sonraki onayıyla repo şimdilik herkese açıldı; yalnız web dosyaları ayrı gh-pages dalına çıkarılır. PR otomatik birleştirilmez. Gerçek girişin cookie/domain uyumu ve Pages kullanım uyarıları ayrıca doğrulanacak; bu yayın Supabase veya girişin tamamlandığı anlamına gelmez.

## 11 Ekim 2026 — ayrı Auth test projesi ve GitHub Pages

Kullanıcı yeni ve ayrı Supabase test projesini seçti; yalnız yeni romway-auth-test ortamına giriş şeması/fonksiyonu kuruldu. Mevcut projeler korunur. Kullanıcı özel alan adı olmadan GitHub Pages ile devam eder. Ücretsiz partitioned HttpOnly cookie (CHIPS) seçeneği opt-in eklenip gerçek Chrome/Edge/Auth/DB ile doğrulandı; JWT/şifre JavaScript deposuna verilmez. Yayın test ortamına bağlı giriş önizlemesidir. Gerçek personel/stok/finans verisi ve üretim pilotu henüz kapsamda değildir. Telefon/Safari/Firefox sürüm doğrulaması ve kurtarma/audit işleri devam eder.

## 11 Ekim — personel yönetimi kararları
Kullanıcı, super_admin'ın tüm personeli; adminin yalnız atanmış lokasyonlarının tamamı içinde kalan purchasing/receiver personelini yönetmesini onayladı. Admin/super_admin rollerini yalnız super_admin atar. İlk lokasyon adları belli olmadığı için temsili Türkiye Test Deposu / Romanya Test Deposu seçildi. Personel ekleme, rol/lokasyon düzenleme, pasifleştirme ve lokasyon ekleme ayrı aşamadır; araç/stok ve şifre sıfırlama bu PR'a eklenmez. Uygulama ve kurtarma sınırları `PERSONNEL.md` içindedir.

### Personel test yayını — kullanıcı onayı sonrası
Kullanıcı PR #4 kapsamındaki personel şeması/fonksiyonu yalnız ayrı Romway test projesine uygulamayı ve doğrulama sonrası Pages'te yayınlamayı açıkça onayladı. Şema/Edge kuruldu; gerçek rol/lokasyon/Auth testleri, mobil önizleme ve gerçek yayın dosyalarıyla testler geçti. Ekran test amaçlı personel yönetimini içerir; stok/finans/araç, gerçek iş verisi ve üretim pilotu henüz tamamlanmadı. Mevcut diğer Supabase projeleri, TESTADMIN şifresi ve geçmiş kayıtlar korundu; otomatik merge yapılmadı.

### 11 Ekim — ana ekran kararı

Başarılı girişten sonra SASA-F yaklaşımına uygun dashboard açılır. Personel yönetimi hem dashboard kartından hem soldaki çekmece menüden erişilir; mevcut rol/lokasyon yetkileri korunur. Stok ve sevkiyat henüz tamamlanmış sayılmaz; dashboard üzerinde Yakında olarak belirtilir.

## 13 Ekim 2026 yetki kararı ve uygulama durumu
Nakliye personelinin tüm lokasyonlarda teslim alma/nakliye yetkisi kesinleşmiştir. Bu karar henüz mevcut olmayan stok/sevkiyat sunucu işlemlerinde uygulanacak; personel yönetiminin lokasyon kapsamı genişletilmez. Nakliye personelinin bağlı lokasyonu idari personel yönetimi kapsamını belirtir; sevkiyat dışında operasyon yetkisi vermez. Mevcut veri ve roller taşınmaz veya silinmez.

## 16 Ekim 2026 — tek bağlı lokasyon
Personel aynı anda en fazla bir lokasyona bağlıdır; çoklu seçim yapılmaz. Yeni kayıt/değişiklik sunucuda da doğrulanır. Geçmiş atamalar silinmez; lokasyon değişikliği önceki atamayı geçmiş olarak korur. Önceden çoklu bağlı kayıtlar otomatik dönüştürülmez; süper admin tek lokasyon seçerek düzenler. Admin yalnız kendi lokasyon kapsamını yönetir. Nakliye personelinin tüm lokasyonlarda sevkiyat/teslim alma kararı korunur. 202610160005 ve romway-auth Edge v6 yalnız test projesine kullanıcı onayıyla uygulandı. Eski çoklu bağlı 5 personel kaydı otomatik değiştirilmeden korundu.

## Nakliye personeli konum ve hareket geçmişi
16 Ekim kararı: konum sevkiyat ve teslim alma işlemlerinden otomatik güncellenir; personel elle konum bildirmez. Profilde son bilinen konum ve hareket geçmişi bulunur. Bağlı depo mevcut konum olarak varsayılmaz. Sevkiyata nakliye personeli atanması, kaynak çıkışı/yolda/hedef kabulü ve işlem zamanı sunucuda kaydedilecek; son kayıt ve sevkiyat durumu gösterilecek, canlı GPS konumu iddiası yapılmayacak. Hareket kayıtları yetkili admin/süper admin personel kapsamıyla filtrelenecek, fiyat içermeyecek. Mevcut sevkiyat altyapısı henüz olmadığından UI şimdilik açıkça bilinmiyor/bağlantı bekliyor durumundadır; gerçek konum/geçmiş API ve veritabanı entegrasyonu tamamlanmış sayılmaz.

## 18 Ekim — sevkiyat başlangıcı
İlk aşama yalnız kaynak/hedef depo, nakliye personeli ve açıklama içeren sevkiyat taslağıdır. Ürün ve miktar/parti/seri altyapısı olmadan stok düşülmez, yolda veya teslim edildi durumu oluşturulmaz. Ayrıntılı sıra: SEVKIYAT_ASAMALARI.md. 18 Ekim kullanıcı onayıyla taslak migration/Edge yalnız romway-auth-test projesine uygulandı; dağıtılmış taslak işlemleri sentetik veriyle doğrulandı.

## 18 Ekim — stok temeli
İlk aşama ortak ürün kartı/listesidir: ürün adı, benzersiz parça kodu ve birim. Oluşturma yetkisi işlem yapılan depodan doğrulanır; kart eklemek stok oluşturmaz. Miktar ve maliyet/parti stok girişleri sonraki ayrı aşamadır. Ayrıntı: URUN_KATALOGU.md.

18 Ekim ürün kartı test migration/Edge dağıtımı kullanıcı onayıyla yalnız romway-auth-test projesine uygulandı ve dağıtılmış endpoint doğrulandı. Miktar/maliyet stok girişleri hâlâ sonraki aşamadır.
