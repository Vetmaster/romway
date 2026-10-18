# Küçük aşamalar ve durum — 11 Ekim 2026

## Tamamlanan / doğrulanan
- [x] İki kaynak plan okundu; Romway ana referans, uygun Sasa-F geliştirme kuralları uyarlandı. Gerçek Roboto/Anta font kaynakları doğrulandı.
- [x] Yerel klasör, GitHub deposu, AGENTS/README/plan/durum belgeleri ve ayrı geliştirme dalları/inceleme PR'ları.
- [x] Kullanıcı kararıyla açık repo, yalnız web ağacını sunan gh-pages, HTTPS GitHub Pages ve logo.
- [x] Sicil/şifre girişi, zorunlu ilk şifre değişimi, TR/RO, sade karşılama, çıkış ve HttpOnly opaque oturum.
- [x] Yeni ve ayrı romway-auth-test projesinde gerçek Auth/DB/Edge; signup kapatma, yanlış/kapalı hesap, zorunlu değişim, eski şifre/oturum, RLS/RPC/JWT reddi.
- [x] Gerçek yayın dosyalarıyla Chrome mobil GitHub Pages CHIPS giriş/yenileme/çıkış. Özel domain gerekmiyor; JS token fallback yok.
- [x] TESTADMIN kurulumu. Kullanıcının Codex tarayıcısında TESTADMIN karşılama ekranı görüldü; zorunlu şifre değişimi sonrası giriş doğrulandı. Kullanıcının yeni şifresi okunmadı/değiştirilmedi.
- [x] Personel yönetimi **yerel kodu**: ekleme, rol/lokasyon düzenleme, pasifleştirme/aktifleştirme; super_admin için lokasyon ekleme.
- [x] Kullanıcı onaylı yetki: admin yalnız tüm lokasyonları kendi kapsamında olan purchasing/receiver; yönetici rollerini yalnız super_admin atar.
- [x] Temsili TR/RO lokasyonları yeni migration dosyasında hazırlandı; gerçek depo verisi yok.
- [x] SQL içi oturum/rol/lokasyon kontrolü, RLS/service-only RPC, rezervasyon/aktivasyon, eski oturum iptali ve secretsiz audit; kayıt silinmez.

## Personel aşamasında doğrulanması / uygulanması gereken
- [x] Kullanıcı açık onayıyla yalnız romway-auth-test projesine yeni personel migration/Edge uygulandı; önceki staff/Auth kayıt sayıları korundu.
- [x] Gerçek Supabase Auth/Edge/DB personel ekleme, zorunlu değişim, admin rol/lokasyon sınırları, lokasyon/aktiflik oturum iptali, RPC/JWT reddi ve audit doğrulandı.
- [x] Gerçek Edge/DB ile aynı sicille eşzamanlı iki oluşturma isteği: bir başarılı hesap ve bir conflict.
- [ ] Kısmi Auth oluşturma için operatör kurtarma prosedürü; daha geniş eşzamanlı düzenleme/aktivasyon senaryoları.
- [x] Yeni personel ekranı GitHub Pages test önizlemesine yayınlandı; gerçek yayın dosyalarıyla mobil Chrome ekleme/pasifleştirme/TR-RO/CHIPS testi geçti.
- [ ] Taslak PR'ları incele; otomatik merge yapılmaz.

## Devam eden genel doğrulamalar
- [ ] Kullanıcının kendi telefonunda giriş ve Safari/Firefox hedef sürümleri. Codex tarayıcısı doğrulaması telefon kanıtı değildir.
- [ ] 8 saat oturum / 24 saat geçici şifre / deneme limitlerini üretim politikası olarak kesinleştir.
- [ ] Personel şifre sıfırlama, yarım işlem kurtarma, audit saklama/görüntüleme ve izleme.
- [ ] GitHub workflow yetkisi sonrası docs/ci/checks.yml.example CI şablonunu etkinleştir. Otomatik CI şu anda kurulu değildir.
- [ ] Repo görünürlüğünü ve gerçek kullanım/hosting kararını yeniden değerlendir; test verileriyle gerçek iş verilerini ayır.

## Sonraki küçük aşamalar
1. Personel kurtarma/şifre sıfırlama; gerçek lokasyon adları, araç/makine ve departman tanımları.
2. Ürün kartları, birimler ve kontrollü Excel önizleme; başlangıç stoğu ayrı akış.
3. Alım, parti/seri, QR, EUR vergi/net/toplam ve maliyet testleri.
4. Transfer/yolda, kısmi/hasarlı kabul ve eşzamanlı stok/tekrar güvenliği.
5. Departman/kullanım, iadeler ve gerekçeli düzeltme geçmişi.
6. Yakıt tankları, dolumlar, istasyon alımları ve ölçüm kuralları.
7. Raporlar/tarihler, yedek geri yükleme ve tek depo pilotu.

Yerel Docker kurulumu kullanıcı tercihiyle uygulanmadı; bulut test ortamı kullanıldı. Bildirimler ve çevrimdışı stok kapsam dışıdır. Personel migration ve Edge bu ayrı test projesinde kuruldu; dosya varlığı tek başına başka özelliklerin tamamlandığına kanıt değildir. Yerel test kanıtları ve sınırları INCELEME.md/PERSONNEL.md içindedir.

- [x] Kullanıcı isteğiyle liste önce açılır; üstte tek Personel ekle düğmesi, kapalı form, kaydet/vazgeç ve listedeki düzenleme akışı. Mobil/masaüstü yerel kontroller geçti.
- [x] Liste/form düzeni Pages'te yayınlandı; build ve gerçek yayın dosyalarının kaynakla eşleşmesi doğrulandı. PR #5 taslak, birleştirilmedi.
- [x] Personel yönetiminde karşılama/tanıtım gizlendi; ana sayfa/çıkış üst çubukta, hatalar görünür yönetim panelinde. Kompakt satır listesi ve mobil/masaüstü kontroller geçti.
- [x] Kompakt yönetim görünümü Pages'te yayınlandı; build ve gerçek HTML/CSS/JS/dil dosyaları doğrulandı. PR #6 taslak, birleştirilmedi.

- [x] Personel satırlarında genişlik korunarak dikey dolgu azaltıldı; mobil dar yan sütun kaldırıldı. 390/1440 px personel tarayıcı kontrolü geçti.
- [x] Satır yüksekliği düzeltmesi Pages üzerinde built ve gerçek dosya eşleşmesiyle doğrulandı; PR #7 taslak.

- [x] Giriş sonrası dashboard, personel kartı ve soldaki çekmece menü; TR/RO ve 390/1440 px yerel personel/giriş tarayıcı kontrolleri geçti.
- [x] Dashboard/çekmece Pages üzerinde yayınlandı; build ve gerçek dosya eşleşmesi doğrulandı. PR #8 taslak.

- [x] Kullanıcının onaylı Solea logosu üst çubuğa alındı; özgün logo dosyaları korundu, mobil/masaüstü görünüm kontrolü geçti.
- [x] Solea logosu Pages yayını ve canlı PNG eşleşmesi ile doğrulandı; PR #9 taslak.

- [x] Mobil personel paneli genişledi, düzenleme sağda kaldı; aktif yeşil/pasif kırmızı rozet ve farklı telefon genişlikleri kontrol edildi.
- [x] Mobil genişlik/rozet değişikliği Pages built ve gerçek dosya eşleşmesiyle doğrulandı; PR #10 taslak.

- [x] SASA-F banner/ayrı gezinme çubuğu/sabit masaüstü menü ve mobil çekmece yerleşimi; mobil düzenle tüm satırın sağında sabitlendi, uzun metinlerle doğrulandı.
- [x] SASA-F yerleşimi ve mobil düzenle düzeltmesi Pages built ve gerçek dosya eşleşmesiyle doğrulandı; PR #11 taslak.

- [x] Banner görselindeki tekrar Solea yazısı gizlendi; sağdaki marka/alt metin korundu, mobil/masaüstü kontrol geçti.
- [x] Banner simgesi Pages üzerinde yayınlandı ve gerçek dosya eşleşmesi doğrulandı; PR #12 taslak.

- [x] Banner logo/Solea/alt metin dikey düzene alındı; yandaki tekrar başlık kaldırıldı.
- [x] Dikey banner düzeni Pages üzerinde doğrulandı; PR #13 taslak.

- [x] Banner açıklaması mobilde aşağıya sabitlendi, yeni depo/personel/stok açıklaması TR/RO güncellendi.
- [x] Mobil açıklama ve yeni TR/RO metin Pages üzerinde doğrulandı; PR #14 taslak.

- [x] Kullanıcı kararıyla depo/lojistik sistem açıklaması TR/RO güncellendi.
- [x] Depo/lojistik açıklaması Pages üzerinde doğrulandı; PR #15 taslak.

- [x] Menü yazısı yerine üç çizgi, erişilebilir TR/RO ad ve kullanıcı seçimiyle koyu lacivert #183446 arka plan.
- [x] Menü simgesi/lacivert arka plan Pages üzerinde doğrulandı; PR #16 taslak.

- [x] CSS/JS/import adreslerine içerik hash sürümü ve yayında güncellik kontrolü eklendi.
- [x] Mobil önbellek düzeltmesi Pages üzerinde doğrulandı; PR #17 taslak.

- [x] Logo açıklaması iki sabit, ortalanmış TR/RO satıra bölündü; görünüm ve sürüm kontrolü geçti.
- [x] İki satırlı banner açıklaması Pages üzerinde doğrulandı; PR #18 taslak.

- [x] Ana sayfa düğmesi kaldırıldı, dil banner sağına taşındı, çıkış tek satır sağa yaslandı; mobil/masaüstü kontrol geçti.
- [x] Üst çubuk kontrolleri Pages üzerinde doğrulandı; PR #19 taslak.

- [x] Personel ekleme alanı kapalı gelen açılır/kapanır karta dönüştürüldü; mobil/masaüstü akış testi geçti.
- [x] Açılır personel kartı Pages üzerinde doğrulandı; PR #20 taslak.

- [x] Personel kartı +/− işaretleri aşağı/yukarı V ikonuyla değiştirildi.
- [x] Kart V ikonu Pages üzerinde doğrulandı; PR #21 taslak.

- [x] Lokasyon açılır kartı, liste araması ve aktif/pasif + tarih sıralaması yerel kod/testte hazır.
- [x] 202610110003 liste tarih migration’ı kullanıcı onayıyla yalnız romway-auth-test’e uygulandı; kayıt/izin ve gerçek liste sıralaması kontrol edildi. Pages doğrulaması aşağıda kaydedilir.
- [x] Birleşik lokasyon kartı/arama/sıralama ve mevcut menü/sürüm görünümü Pages üzerinde v2026.10.11.2 olarak doğrulandı; PR #22 taslak.
- [x] Personel listesi ilk 20 kayıtla başlar; Daha fazla göster her basışta 20 ekler. Arama sıfırlaması ve 390/1440 px tarayıcı kontrolleri geçti.
- [x] 20 kayıt sonrası Daha fazla göster Pages v2026.10.11.3 üzerinde doğrulandı; PR #25 taslak.
- [x] Personel ekleme açıldığında lokasyon kartı otomatik kapanır; 390/1440 px geçiş testi geçti.
- [x] Kart geçişi Pages v2026.10.11.4 üzerinde yayınlandı ve dosya eşleşmesi doğrulandı.
- [x] Kartlarda otomatik giriş odağı kaldırıldı; mobil/masaüstü DOM odak kontrolleri geçti.
- [x] Kullanıcı kararıyla personel liste adımı 20’den 10’a indirildi; ilk açılış/arama sıfırlaması/daha fazla göster 10 kayıt kullanır.
- [x] Personel/lokasyon/düzenleme geçişlerinde aynı anda tek kart açık kalır; mobil/masaüstü doğrulandı.
- [x] Menü kapatma × simgesi ve erişilebilir TR/RO ad eklendi; tarayıcı kontrolü geçti.
- [x] Kullanıcı adı ve rol menünün en altına taşındı; mobil/masaüstü konumu doğrulandı.
- [x] Personel ekle/lokasyon ekle alt menü kısayolları eklendi; 390/1440 px akışları doğrulandı.
- [x] Personel/lokasyon ayrı sayfalara ayrıldı; her sayfada ekleme kartı ve ilgili liste var. Mobil/masaüstü akışları doğrulandı.
- [x] Menü × butonu tamamen kaldırıldı; dış alan/Escape kapanması doğrulandı.
- [x] Oturumu kapat menüde kullanıcı satırının sağına taşındı; mobil/masaüstü çıkış doğrulandı.
- [x] Personel alt menüsü kapalı başlar, başlık okla açılıp kapanır; mobil/masaüstü doğrulandı.
- [x] Menü logosu altına DPB açıklaması eklendi.
- [ ] Personel/lokasyon adına basılınca profil sayfası açılması.
- [x] Personel/lokasyon ekleme kartları sayfa girişinde kapalı kalır; mobil/masaüstü doğrulandı.
- [x] Yenilemede mevcut yetkili sayfa yeniden açılır; personel/lokasyon mobil/masaüstü kontrolleri geçti.
- [x] Arka plandan dönüşte mevcut sayfa yenilenir; visibility simülasyonu geçti.
- [ ] Gerçek Android cihazda arka plandan dönüş gözlemi.
- [x] Menü logo açıklaması Depo ve Lojistik Yönetim Sistemi olarak düzeltildi.
- [x] Stok ve depolar açılır menü başlığı eklendi; stok takibi hazırlık olarak gösterilir.
- [x] Lokasyon ekle Stok ve depolar altına taşındı; mobil/masaüstü doğrulandı.
- [x] Sevkiyat Yönetimi menü başlığı hazırlık durumuyla eklendi; işlev henüz geliştirilmedi.
- [x] Personel/lokasyon isimleri profil açar; yenileme ve listeye dönüş doğrulandı.
- [x] Dört alt sekme, tek satır banner açıklaması, geniş logo ve menü liste adları uygulandı.
- [x] Lokasyon yalnız ad/otomatik kod ve isteğe bağlı ülke migration’ı yerel testte hazır.
- [x] 202610110004 + romway-auth Edge v5 kullanıcı onayıyla yalnız test projesine uygulandı; kayıtlar/izinler ve oturumsuz API reddi doğrulandı.
- [x] Yalnız ad/otomatik kod lokasyon formu Pages v2026.10.11.24 üzerinde doğrulandı.
- [x] Banner logosu %25 küçültülüp sola hizalandı; mobil/masaüstü görünümü doğrulandı.
- [x] Banner açıklaması logo genişliği içinde ortalandı.
- [x] Banner açıklama yazısı büyütüldü; tek satır ve logo merkezi korunur.
- [x] Banner açıklaması hafif küçültüldü ve font-weight:700 yapıldı.
- [x] Masaüstünde menü logosu gizlendi; üst banner ve mobil menü logosu korunur.

- Masaüstünde banner üstte sticky konumlandırıldı; sabit sol menünün üst sınırı kaydırma sırasında banner ile aynı hizada kalır. Mobil kuralı korunur.

- Alt sekmeler yalnız 820 px ve altındaki mobil görünümde gösterilir; masaüstünde sekmeler ve ayrılan alt boşluk kaldırıldı.

- Sevkiyat yönetimine başlangıçta kapalı alt menü ve TR/RO Sevkiyat başlat hazırlık sayfası eklendi; hash ile yenileme korunur. Stok seçimi/sunucuda sevkiyat gönderme henüz uygulanmadı.

- [x] Receiver rolünün TR/RO adı Nakliye personeli / Personal de transport olarak güncellendi; teknik kimlik korundu.
- [x] Tüm lokasyonlarda teslim alma/nakliye kararı plana ve AGENTS.md içine işlendi; diğer işlemlerin kapsamı korunur.
- [ ] Stok/sevkiyat sunucu işlemleri geliştirilirken lokasyonlar arası nakliye erişimi, diğer işlem reddi ve fiyat gizliliği test edilecek. Mevcut durumda gerçek sevkiyat altyapısı yoktur.

- [x] Nakliye personelinin lokasyonu yalnız bağlı depo/idari kapsam bilgisidir; sevkiyat ve buna bağlı teslim alma dışında operasyon yetkisi yoktur. Planın eski kullanım yetkisi kaldırıldı.
- [ ] Sevkiyat API geliştirmesinde tüm lokasyonlarda nakliye izni ve diğer operasyonların doğrudan API ile reddi test edilecek.

- Mobil ana ekran ikonu: onaylı logodan kare PNG (192/512), iOS touch icon (180) ve relative /romway/ uyumlu manifest eklendi. Service worker/offline destek eklenmedi. Gerçek cihazda yeniden ekleme kontrolü kullanıcı doğrulaması bekliyor.

- Tema yüzeyleri ayrıştırıldı: gri/mavi sayfa zemini, hafif tonlu paneller, mavi/olive/kırmızı bölüm kartları, renkli açılır kartlar ve dönüşümlü liste satırları. Mevcut yerleşim, mobil düğme hizası ve yetkiler korunur.

- Kullanıcı düzeltmesi: gri-mavi arka plan korundu; bölüm/panel/profil ve açılır kartlar beyaz yapıldı. Renkli üst şeritler kaldırıldı, ikon zeminleri nötrleştirildi.

- Beyaz dashboard kartlarının mavi/olive/kırmızı üst şeritleri kullanıcı isteğiyle geri getirildi; gri zemin ve beyaz kartlar korunur.

- Sayfa arka planı mavimsi gri yerine nötr gri #ededed yapıldı; beyaz kartlar ve renkli üst şeritler korundu.

- Stok ve depolar kartının üst şeridi zeytin yerine #43856a yeşiline alındı; diğer renkler korundu.

- Genel bakış/sayfa başlığı şeridinin zemini #d6d6d6 nötr griye alındı; sayfa zemini #ededed renginden daha koyudur.

- Genel bakıştaki Hesabınız kartı ve kaldırılan alanları güncelleyen JS temizlendi; menü altındaki kullanıcı bilgileri korunur.

- Genel bakış/sayfa başlığı şeridi sayfa zeminiyle aynı nötr griye alındı; koyu alt sınır ve gölge kaldırılarak göçük görünüm azaltıldı.

- Düz başlık zemini korundu; altına 1 px #d0d0d0 ayırıcı çizgi geri eklendi, gölge yoktur.

- Personel listesi erişilebilir tabloya dönüştürüldü; sicil/ad/rol/durum sütunları çift yönlü sıralanır. Varsayılan aktif ve yeniden eskiye korunur; sıralama aranan tüm sonuçlara, 10 kayıt sayfalamasından önce uygulanır. Mobilde rol/lokasyon ad altında gösterilir.

- Personel tablo doğrulaması: iki sıralama birim testi ve izole Chromium 390/1440 px testinde başlık tıklama, doğal sicil sırası, durum yönü, 10/20 kayıt, arama, profil ve yatay taşma kontrolleri geçti. Test sentetik verilerle yapıldı.

- Personel listesindeki Düzenle düğmeleri/işlem sütunu kaldırıldı; düzenleme personel profilinden açılır ve aynı profil içinde kaydedilir/iptal edilir. Sunucu rol/lokasyon yetkileri korunur.

- Chromium 390/1440 px sentetik testinde listede düğme olmaması, profilden düzenleme, aynı profilde kaydetme/vazgeçme, yenileme ve taşma kontrolleri geçti.

- Personel formu/liste/profilindeki lokasyon etiketi Bağlı bulunduğu lokasyon (RO: Locația de apartenență) olarak güncellendi; mevcut çoklu lokasyon kayıtları ve sunucu yetkileri değiştirilmedi.

- Bağlı bulunduğu lokasyon profil bilgi satırlarında Durum alanının hemen altına alındı; düzenleme formunda lokasyon seçimi aktiflik alanının altında gösterilir.

- Sıra düzeltmesi: bağlı lokasyon üstte, durum en altta; profil ve düzenleme formunda aynı sıra kullanılır.

- Aktif rozeti stok kartının #43856a yeşiline uyarlandı; siyah yazıyla kontrast 4.80:1. Tek lokasyon PR #73 sunucu dağıtım onayı beklediğinden bu yayına dahil edilmedi.

- Aktif durumu yalnız yeşil yazıyla gösterilir; dolgu, çerçeve ve rozet boşluğu kaldırıldı. Okunabilirlik için aynı yeşil ailesinden koyu #286247 kullanıldı. Pasif durum görünümü korundu.

- Tek bağlı lokasyon seçimi ile Edge/RPC çoklu lokasyon reddi hazırlandı. 202610160005 migration yalnız dosya olarak hazır; test Supabase dağıtımı bekliyor. Eski çoklu kayıtlar ve geçmiş korunur.

- Yerel doğrulama: 13 SQL/HTTP testi geçti; çoklu yeni kayıt/güncelleme reddi, Auth hesabı oluşturulmaması ve geçmiş korunarak tek lokasyona düzeltme kapsandı. Chromium 390/1440 px testinde eski çoklu kayıtta otomatik seçim olmaması, tekli seçim ve kaydet/vazgeç/yenileme geçti. Test Supabase migration/Edge dağıtımı ve Pages yayını henüz yapılmadı.

- 16 Ekim kullanıcı onayıyla 202610160005 yalnız romway-auth-test projesine uygulandı; romway-auth v6 ACTIVE. Staff/Auth/lokasyon/atama/istek/denetim verileri öncesi-sonrası karşılaştırılarak korundu. RPC anon/authenticated erişimi kapalı, service_role erişimi korundu. Eski çoklu bağlı 5 personel kaydı değiştirilmedi; düzenleme sırasında tek lokasyon seçilecek. Son aktif yeşil yazı stili bu sürümde korunur.

- Aktif durum yazısı #15803d canlı yeşile ve 700 kalınlığa alındı; çerçeve/dolgu eklenmedi.

- Aktif ve pasif aynı rozet biçimini kullanır; aktif açık yeşil dolgu/#15803d yazı, pasif mevcut kırmızı tonlarıyla gösterilir. Liste ve profil ortak CSS kullanır.

- [x] Nakliye personeli profiline son bilinen konum ve hareket geçmişi bölümünün boş/hazırlık görünümü eklendi; diğer roller/lokasyon profillerinde gizli.
- [ ] Sevkiyat altyapısıyla nakliye personeli ataması ve sunucuda çıkış/yolda/teslim kayıtları oluşturulacak; yetkili kapsamdan otomatik son konum/geçmiş okunacak. Gerçek hareket entegrasyonu henüz mevcut değil; bağlı depo konum olarak kullanılmaz.

- PR #57 rol önizlemesi güncel tablo, tek lokasyon ve profil içi düzenleme ile uyumlandı. Gerçek kullanıcı rolü değişmez; önizleme salt okunur UI simülasyonudur. Sunucu yetki testinin yerine geçmez. Seçim depolanmaz; yenileme/çıkışta sıfırlanır.

- Rol önizlemesi tarayıcı doğrulaması tamamlandı: Chromium 390/1440 px yönetici depo değişimi, süper admin/yönetici kayıtlarının gizlenmesi, doğrudan profil reddi, yazma formu engeli, satın alma/nakliye menüleri, normal görünüme dönüş, yenileme/çıkış sıfırlaması, RO ve taşma kontrolleri geçti. Normal personel profil düzenleme ve tablo testleri ile 4 birim testi de geçti. Supabase dağıtımı yapılmadı; yalnız arayüz önizlemesi.

- Personel tablosunda sicil, ad soyad, rol, bağlı lokasyon ve durum tüm ekranlarda ayrı sütunlarda gösterilir. Mobilde ad altındaki rol/lokasyon tekrarı kaldırıldı; tablo kendi içinde yatay kayar ve satır/sütun çizgileri belirgindir.

- Chromium 390/1440 px beş sütunun görünürlüğü, ad altında tekrarlanmama, mobil tablo içi yatay kaydırma, sayfada taşma olmaması, sıralama/profil işlemleri ve rol önizleme kontrolleri geçti.

- Personel tablosunun üstüne varsayılan kapalı Sadece aktif personeli göster kutusu eklendi. Filtre arama/sıralama/sayfalama ile birlikte çalışır; değişimde görünür kayıt sayısı 10’a döner ve oturum/rol değişiminde filtre sıfırlanır.

- Süper admin rol önizleme seçicisi sayfa başlığının sağında aynı satıra taşındı; aşağıdaki depo/açıklama/kapat paneli yalnız önizleme aktifken gösterilir.

- Giriş/şifre ekranındaki dekoratif sarı çizgi ve yalnız ona ait stil kaldırıldı; giriş işlemleri değiştirilmedi.

- Giriş kartı yukarı yaklaştırıldı: oturumsuz görünümde üst boşluk 16 px, dikey aralık 16 px ve intro alt boşluğu sıfır; giriş sonrası yerleşim korunur.

- SASA-F yayındaki openStudentDialog/showModal örneği doğrulandı; Personel ekle başlık sağına taşındı, açılır kart yerine erişilebilir modal pencere açılır. Otomatik giriş odağı yok; kapat/Escape/vazgeç desteklenir. Profil düzenlemesi aynı profilde korunur.

- Chromium 390/1440 px yeni personel modal testi geçti: başlık sağı hizası, açılır kartın yokluğu, modal/odak, kapat/Escape/backdrop/vazgeç, hata tekrar deneme ve tek seferlik şifre yanıtı. Mevcut profil düzenleme ve rol önizlemesi testleri de geçti; gerçek personel verisi kullanılmadı.

- Giriş kartı tekrar yukarı yaklaştırıldı: boş oturumsuz başlık satırı gizlendi, üst boşluk 4 px/ara 8 px yapıldı, mobil tanıtım satır aralıkları sıkılaştırıldı. Şifre değiştirmede çıkış içeren başlık satırı korunur.

- Sol alt köşedeki Romway metni kullanıcı isteğiyle Solea © 2026 olarak güncellendi; giriş kartının son yukarı yerleşimi korunur.

- Kart açılışında lokasyon formu, profil düzenlemesi ve sayfa başlıkları sabit banner altında hizalanır. Giriş alanına otomatik odak verilmez. Yasal metin PR #89 bu değişikliğe dahil değildir.

- Chromium 390/1440 px: lokasyon kartı üst hizası, kapatma konumu, profil düzenlemede başlık odağı ve personel modal regresyonu geçti.
- Yasal bilgilendirmeler: SASA-F main LEGAL_DOCUMENTS/legalTextsView tek açık detaylı süper admin taslak sayfası referans alındı. Solea için 6 TR/RO taslak hazırlandı; şirket/iletişim/hukuki sebep/saklama/aktarım bilgileri doğrulanmadığından eksik alanlar açıkça gösterilir. Gövde metinleri web paketine konmadı; legal-documents endpoint sunucuda süper admin ve geçerli oturum/ilk şifre kontrolü yapar. Edge dağıtımı henüz yapılmadı; Supabase onayı bekliyor. Açık GitHub kaynak deposu gizli belge deposu değildir.

- Yasal bölüm doğrulaması: 43 test ve Chromium 390/1440 px yasal ekran/rol/red/RO/akordeon/yenileme kontrolleri geçti; personel ekleme ve rol önizleme regresyonları da geçti. Şirket bilgileri bekleniyor; yalnız test Edge dağıtımı ve Pages yayını onay bekliyor. Ayrıntı: docs/YASAL_BILGILENDIRME.md.

- 17 Ekim açık kullanıcı onayı: yasal metinler sunucu güncellemesi yalnız romway-auth-test projesine uygulandı (romway-auth v7 ACTIVE). Migration yok; mevcut personel/lokasyon kayıt özetleri aynı. 43 test ve 390/1440 px yasal ekran/kart kaydırma testleri geçti. Son kart hizalaması korunarak v2026.10.17.4 yayına hazırlandı. Şirket bilgileri hâlâ taslak tamamlama gerektirir.

- Kullanıcı isteğiyle TR/RO yasal taslaklara açıkça temsili test kurum unvanı, adresi ve .invalid e-posta eklendi. Gerçek kurum doğrulaması ve diğer hukuki tamamlama alanları korunur; başvuru gönderme akışı eklenmedi.

- 44 test ve Chromium 390/1440 TR/RO yasal ekran/rol kontrolleri geçti. Temsili kurum metinleri yalnız romway-auth-test Edge v8 ACTIVE olarak uygulandı; migration yok ve mevcut kayıt özetleri aynı. Pages v2026.10.17.5 hazırlandı.

- Yasal ekran yatay boşlukları daraltıldı: mobil dış boşluk 8 px, panel/iç metin boşluğu 12 px. Masaüstünde kullanılabilir alan 1440 px sınırına genişletildi. Metin boyutu ve diğer sayfalar korunur.

- Yasal bilgilendirmeler menüdeki Ayarlar sayfasına taşındı; SASA-F ayarlar kartı düzeni referans alındı. Ayarlar ve yasal kart yalnız normal süper admin görünümünde açılır; sunucu rol kontrolü korunur. #settings yenilemede geri yüklenir, #legal doğrudan yolu korunur.

- Ayarlar bağlantısı SASA-F örneğindeki gibi menünün alt kısmına, kullanıcı bilgilerinin üstüne taşındı. Kısa ekranlarda menü kaydırılabilir; süper admin görünürlük kuralı korunur.

- Ayarlar alt bağlantısı kullanıcı satırına yaklaştırıldı: aralık 16→4 px, kullanıcı üst boşluğu 20→12 px; alt bölümün son hizası korunur.

- Ayarlar ekranı da yasal ekranın geniş alan düzenine alındı: mobil dış yan boşluk 8 px, panel ve bağlantı kartı 12 px; masaüstü üst sınır 1440 px.

## 18 Ekim — sevkiyat taslağı
- Hazır: taslak formu/liste TR/RO, yerel SQL/RPC ve Edge rol/depo denetimi, fiyat içermeyen yanıt, tekrar güvenli oluşturma. Detay: SEVKIYAT_ASAMALARI.md.
- Bekleyen: yeni migration ve Edge yalnız test projesine uygulanması için onay; dağıtılmış gerçek entegrasyon testi ve Pages yayını.
- Yapılacak: ürün/miktar/parti/seri/QR altyapısı, stok hareketi, gönderim, teslim alma ve personel konum geçmişi. Bu işler tamamlanmış sayılmaz.

- Doğrulandı: 49 birim/SQL/HTTP testi geçti. Chromium 390/1440 süper admin/nakliye taslak formu, hata tekrarı, aynı istek kimliği, TR/RO, metin kaçışları, yenileme ve taşma kontrolleri; mevcut rol önizleme/yasal/personel kontrolleri geçti. Test verileri sentetiktir; dağıtılmış sevkiyat entegrasyonu henüz yapılmadı.

- 18 Ekim kullanıcı onayı uygulandı: yalnız romway-auth-test migration 202610180006 ve Edge v9 ACTIVE. Mevcut kayıt özetleri aynı. Dağıtılmış sunucuda sentetik nakliye hesabıyla taslak liste/oluşturma, tekrar güvenliği, farklı içerikle tekrar reddi, geçersiz rota ve yetki kontrolleri geçti. Bir test taslağı saklandı; önceki taslaklar değişmedi. Pages v2026.10.18.1 yayına hazır.

- Pages v2026.10.18.1 built ve canlı uygulama dosyası doğrulandı. Canlı mobil Chromium testinde gerçek cookie girişi, taslak listesi/formu, depo seçenekleri, nakliye rolünün yalnız kendisini seçmesi, sayfa yenileme ve çıkış geçti; ek taslak oluşturulmadı.

## 18 Ekim — ürün kartları
- Hazır: ortak ürün kataloğu, ürün adı/parça kodu/birim ve yetkili işlem deposuyla ekleme, TR/RO modal form, arama ve 10’ar gösterim. Sunucuda kod benzersizliği, depo/rol kontrolü, service-only RPC ve tekrar güvenliği.
- Bekleyen: 202610180007 ve Edge dağıtımı yalnız test projesine uygulanması için onay; dağıtılmış entegrasyon ve Pages.
- Sonraki: stok girişi miktar/parti/seri, EUR maliyet/vergi, stok miktar listesi ve gerçek sevkiyat. Detay: URUN_KATALOGU.md.

- Doğrulandı: 54 yerel birim/SQL/HTTP testi geçti. Chromium 390/1440 ürün modalı/odak, yinelenen kod hatası ve tekrar deneme, 10’ar sayfalama/arama, TR/RO, XSS metin kaçışı, yenileme/rol önizlemesi/taşma kontrolleri geçti. Sevkiyat, personel, rol önizleme ve yasal ekran regresyonları da geçti; gerçek Supabase ürün entegrasyonu yapılmadı.
