# Romway — Proje Planı ve Karar Notları

Son güncelleme: 8 Ekim 2026. Planlama taslağı; uygulama henüz bu belge kapsamında geliştirilmiş değildir.

## Amaç
Malzemelerin ilk alımından depolar arası sevkiyatına, teslimine, departmana aktarımına ve araç/makinede kullanımına kadar geçmişini izlemek. İlk kurulum Romway için yapılacak. Şirket adı, logo, dil, para birimi ve lokasyonlar yapılandırılabilir tutularak başka kurumlara uyarlama kolaylaştırılacak. İlk sürümde ortak sistemde çok şirket yönetimi gerekmiyor; gelecekte ayrı adres ve ayrı veritabanı olan kurulumlar kullanılabilir. Ürünün marka adı henüz seçilmedi.

## Kesinleşen tercihler
- Yalnız web uygulaması; telefon, tablet ve bilgisayarda tarayıcıdan kullanım.
- Giriş: sicil numarası ve şifre. E-posta ile giriş kullanılmayacak.
- Başlangıç rolleri: süper admin, admin, satın alma personeli, ürünü teslim alan personel. Yeni roller eklenebilecek; ayrıntılı yetkiler belirlenecek.
- Birden fazla şantiye, depo ve departman; örnek ölçek 3–4 veya 7–8 lokasyon.
- Ürünler ağırlıklı olarak araç yedek parçaları.
- Arayüz Türkçe ve Romence olarak hazırlanacak; ortak uygulamada dil seçimi olacak.
- İlk sürüm çevrimiçi çalışacak; internet yokken stok işlemleri tamamlanmayacak. Çevrimdışı ihtiyaç tasarımda değerlendirilecek, ilk sürüm için taahhüt edilmiyor.
- Merkez admin bütün depoları görür; diğer personel atanmış lokasyonlarda işlem yapar. Fiyatları admin ve satın alma personeli görür; süper adminin yönetim erişimi korunur. Yetkiler sonradan değiştirilebilir.
- Admin personeli sicil numarasıyla ekler. Otomatik geçici şifre üretimi, ilk girişte değiştirme ve admin aracılığıyla sıfırlama önerilen hesap akışıdır; kullanıcı otomatik üretimin nasıl işleyeceğini sordu.
- Para birimi EUR (euro). Taşıma gideri alış fiyatına dahil edilmeyecek; Alış fiyatı vergi dahil tutulacak; vergisiz tutar, vergi oranı ve vergi tutarı ayrı gösterilecek. Vergi oranı alım kaydında belirtilecek, sabit bir ülke oranı varsayılmayacak.
- Normal parçalar miktar ve alım partisiyle; tekil garanti/geçmiş gerektiren parçalar benzersiz kodla izlenecek.
- Okutulan kod belirli parti veya tekil parçayı tanımlıyorsa o alımın maliyeti esas alınır. Genel ürün/raf kodunda önce giren mevcut parti önerilir; fiziksel seçilen parti doğrulanır. Farklı partilerin maliyetleri birbirinin üzerine yazılmaz.
- QR kodları web uygulamasında telefon kamerasıyla okutulacak. Etiket baskısı ayrıntıları daha sonra netleşecek.
- Satın alma personeli yetkili olduğu kaynak lokasyondan sevkiyatı doğrudan gönderebilir; admin onayı gerekmeyecek. Gönderen kişi ve işlem zamanı hareket geçmişinde tutulacak.
- Ürünü teslim alan personel kendi atanmış lokasyonunda departmana teslim ve araç/makinede kullanım çıkışlarını admin onayı beklemeden yapabilir. Miktar, teslim alan/kullanan kişi, hedef departman veya araç/makine ve işlem zamanı kaydedilir.
- İlk satın alan depo alış fiyatını girer. Sonraki transferler bu maliyeti taşır; yeni alımlar geçmiş fiyatların üzerine yazılmaz.
- Malzeme ve araç/makineler için ayrı kodlar; paket/sevkiyat için ayrı kod önerisi.
- Canlı GPS takibi kapsamda değil; konum kayıt ve hareketler üzerinden izlenecek.
- Tasarım renkleri paylaşılan görselden: yaklaşık petrol mavisi #065788, kırmızı #DB202D, zeytin yeşili #697000, sarı #FFE500 ve beyaz #FFFFFF.
- Fontlar Sasa-F ile aynı olacak; gerçek font ailesi ve kalınlıkları koddan doğrulanacak.
- Şirket alan adı romway.ro. Seçilecek ürün adına göre bir alt alan adı öneriliyor; adres ve barındırma henüz kurulmadı.

## Temel kullanım akışı
1. Yetkili kullanıcı sicil numarası ve şifreyle giriş yapar.
2. Depolar, şantiyeler, departmanlar, personel ve araç/makineler tanımlanır.
3. Tedarikçi stok kartı Excel dosyaları kontrol ve önizleme sonrasında içeri aktarılır. Bu aktarım tek başına fiziksel depo miktarını değiştirmez.
4. İlk alımda ürün, miktar, birim, fiyat, para birimi, tedarikçi ve tarih kaydedilir. Uygulanabilen ürünlerde garanti bitişi ve son kullanma tarihi tutulur.
5. Sevkiyat için kaynak ve hedef depo, ürünler ve miktarlar seçilir; paket etiketi hazırlanır.
6. Yükleme ve gönderim kaydedilir. Gönderen kişi, zaman ve taşıma bilgileri izlenir. Çıkış onayında ürün kaynak depodan düşer ve yolda görünür.
7. Hedef depo sorumlusu kodu okutur, teslim miktarını kontrol eder ve kabulü onaylar. Kabul edilen miktar hedef stoğa girer; eksik/hasarlı teslim ayrıca kaydedilir.
8. Kullanmak üzere alınan malzemenin miktarı, alan kişi ve departmanı kaydedilir; malzeme o departmanda görünür.
9. Araç/makinede kullanım, malzeme ve araç kodlarıyla ilişkilendirilir. Departmana teslim ile fiilî kullanım ayrı hareketler olarak öneriliyor.
10. Yetkililer miktarları, sevkiyatları, teslim alanları, kullanım geçmişini ve maliyetleri raporlardan izler.

## İstenen modüller
- Lokasyon bazında güncel stok ve yoldaki malzemeler.
- Minimum stok seviyeleri ve düşük stok durumunun ekranlarda takibi. Otomatik bildirimler ertelendi.
- Kim aldı, hangi departmanda, hangi araç/makinede kullanıldı takibi.
- Eş değer ürün grupları ve karşılaştırılabilir yeni alımlarda fiyat değişimi uyarısı.
- Garanti ve son kullanma tarihleri.
- Ürün bedelleri, basit maliyet hesapları ve temel ön muhasebe.
- İstatistik ve raporlama: ürün, depo, departman, kişi, araç/makine ve dönem bazında.
- Araç/makine mazot ve benzin takibi: litre, birim fiyat, toplam tutar, tarih, personel, kilometre veya çalışma saati.
- Şantiye tankı desteği kapsamda olacak; gerçekten tank bulunup bulunmadığı henüz bilinmiyor. Tanktan verilen yakıt stoktan düşer; istasyondan alım doğrudan araca kaydedilir.
- Uygun dolum kayıtlarıyla litre/100 km veya litre/çalışma saati; tam/kısmi dolum ayrımı ve tüketim uyarıları öneriliyor.

## Veri doğruluğu ve güvenlik kuralları — önerilen
- QR okutma ilgili işlem ekranını açar; miktar ve hedef doğrulanıp onaylandığında hareket oluşur.
- Tekrar okutma veya tekrar gönderilen işlem mükerrer stok hareketi oluşturmamalı.
- Eşzamanlı işlemler stok tutarlılığını korumalı.
- Alım partisi/tekil parça ayrımı fiyat, garanti ve tarih geçmişini korumalı.
- İade, eksik teslim, sayım farkı ve yanlış kayıt düzeltmeleri geçmişi korunarak yapılmalı.
- Yetkiler yalnız ekranda değil sunucu/veritabanında uygulanmalı.
- Kod geri dönüşü ve veri geri yükleme ayrı planlanmalı; yedeklerin geri yüklenmesi denenmeli.

## Geliştirme yol haritası
1. Kapsam, veri alanları, roller ve lokasyon yetkilerini kesinleştirme.
2. Örnek Excel ve bir parçanın uçtan uca yolculuğuyla ekran taslaklarını hazırlama.
3. Giriş, ürün kartları, Excel aktarımı ve lokasyon tanımlarını geliştirme.
4. Yükleme, sevkiyat, teslim alma, departman aktarımı ve kullanım takibini tamamlama.
5. Yakıt, maliyet, düşük stok ve fiyat uyarılarını ekleme.
6. Raporlar, sayım/düzeltme, güvenlik ve mobil kullanım kontrolleri.
7. Bir depoda pilot; fiziksel stokla karşılaştırma; ardından diğer lokasyonlara geçiş.
8. Deneme/canlı ortamları, GitHub değişiklik kontrolleri, barındırma, alt alan adı ve işletim düzenini kurma.

## Henüz karara bağlanmamış noktalar
- Ürün markası ve kesin uygulama adresi.
- Teknoloji, veritabanı ve barındırma seçimi. Başka proje sohbetinde veritabanı/Firebase/bildirim konusu görüşüldü; bu belgeye kesin seçim olarak aktarılmadı.
- Temel yetki yaklaşımı kararlaştırıldı; rol bazında ayrıntılı işlem ve düzeltme/onay izinleri belirlenecek.
- Şifre sıfırlama, personel hesabı açma ve kapatma akışı.
- Etiket yazıcısı, etiket ölçüleri ve baskı düzeni. İlk sürümün okutma yöntemi telefon kamerası olarak kararlaştırıldı.
- Başlangıç stokları depolardan alınacak (henüz temin edilmedi); dosya formatı, birimler ve eksik başlangıç maliyetlerinin nasıl girileceği belirlenecek.
- Eş değer ürün onayı ve fiyat uyarı eşiği.
- Garanti başlangıcı, tarih uyarıları ve bildirim kanalları.
- Bağlantı kesilmesi sırasında yarım kalan işlemlerin kullanıcı akışı ve ileride çevrimdışı ihtiyacın olup olmadığı.
- Yakıt ölçüm kuralları ve ön muhasebenin kesin sınırları.

Bu belge mevcut konuşmadaki kararları toplar. Yeni kararlar geldikçe aynı belge güncellenebilir; sohbetle otomatik eşitlenmez.

## Kayıt düzeltme yetkisi — mevcut karar
- Yanlış tamamlanmış kayıtların düzeltilmesi ve stok farklarının işlenmesi yalnız admin ve süper admin tarafından yapılır.
- Diğer personel hatayı bildirir; yetkili kişi gerekçe belirterek düzeltme yapar. Eski kayıt ve düzeltmeyi yapan kişi/zaman hareket geçmişinde korunur.
- Bu yetki düzeni başlangıç içindir; ihtiyaç halinde daha sonra değiştirilebilir.

## Eksik ve hasarlı teslimat — mevcut karar
- Teslim alan personel sağlam, eksik ve hasarlı miktarları ayrı kaydeder.
- Sağlam kabul edilen miktar hedef deponun kullanılabilir stoğuna eklenir. Hasarlı miktar ayrı durumda izlenir ve kullanılabilir stoğa dahil edilmez; eksik miktar teslim alınmış sayılmaz.
- Eksik ve hasarlı teslimat bilgisi kayıtlarda ve yetkili ekranlarında görünür. Gönderene ve admine otomatik bildirim gönderimi ertelendi.
- Uyuşmazlık çözümlenene kadar sevkiyat tam ve sorunsuz teslim edilmiş olarak kapatılmaz; sonuç hareket geçmişinde korunur.

## Bildirimler — ertelendi
- Kullanıcının kararıyla bildirim konusu şimdilik askıya alındı. Uygulama içi bildirim merkezi ve web push bu aşamada geliştirilmeyecek; kanallar ve alıcı kuralları daha sonra ele alınacak.
- Düşük stok, fiyat değişimi ve teslimat sorunları için veri ve ekran takibi korunur. Otomatik uyarı gönderimi ertelenmiştir.
- Önceki uyarı/bildirim maddelerinde bu erteleme kararı esas alınır.

## Malzeme takip türü ve QR — kesinleşen karar
- Takip türü ürün kartında seçilir: parti ve miktar takibi veya tekil parça takibi.
- Filtre, conta ve civata gibi aynı alımdaki birbirinin aynı parçalar alım partisi QR koduyla izlenir; işlemde miktar girilir. Alan personel, hedef departman/araç ve parti maliyeti korunur.
- Motor, şanzıman veya seri numarası/geçmişi ayrı izlenecek ekipmanın her birine benzersiz QR verilir. Her tekil parçanın maliyeti, garantisi ve hareket geçmişi ayrı tutulur.
- Aynı ürünün farklı alım partileri farklı QR kodlarına sahip olur; okutulan partinin maliyeti kullanılır.
- QR kodları telefon kamerasıyla web uygulaması üzerinden okutulur.

## İade ve sökülen parça — kesinleşen karar
- Kullanılmamış sağlam parça, kendi alım partisi veya tekil kimliği ve maliyeti korunarak kullanılabilir depo stoğuna geri alınır.
- Kullanılmış veya arızalı parça ayrı durumda kaydedilir; kullanılabilir stoğa otomatik eklenmez.
- Tekil parçanın iade/sökülme hareketi aynı QR kimliği üzerinden geçmişine işlenir.
- Personel kendi atanmış lokasyonunda iadeyi kaydedebilir. Arızalı parçanın yeniden kullanılabilir duruma geçirilmesi admin kararıyla yapılır.
- İade önceki teslim/kullanım kaydına bağlanır; miktar, durum, işlem yapan kişi ve zaman korunur.

## Birim ve paket miktarları — kesinleşen karar
- Her ürünün temel stok birimi tanımlanır: adet, litre, kilogram veya metre gibi.
- Kutu/paket için temel birime dönüşüm miktarı kaydedilir; örneğin 1 kutu = 10 adet filtre.
- Depo çıkışı ve stok hesabı temel birim üzerinden yapılır. QR okutulduğunda alınan miktar girilir; okutma bütün paketin çıktığı anlamına gelmez.
- Alış fiyatının paket/kutu veya temel birim fiyatı olduğu açıkça belirtilir. Sistem dönüşüm miktarından temel birim maliyetini hesaplar.
- Örnek: 10 filtre içeren kutudan 2 filtre çıkışında stok 2 adet azalır.

## Teknik mimari, güvenlik, test ve yayın kuralları

Bu bölüm geliştirme gereksinimlerini tanımlar; tamamlanmış kurulum veya yapılmış test anlamına gelmez. Teknoloji sağlayıcıları, bütçe ve işletim hedefleri henüz kesinleştirilmedi.

### Mimari ve kapsam
- İlk kurulum yalnız Romway için; diğer kurumlara ayrı kurulumla uyarlanabilir yapı korunur. Ortak çok şirketli platform bu aşamada kapsam dışıdır.
- Modüller ayrılır: kimlik doğrulama, yetkiler, ürün/parti/tekil parça, lokasyon, sevkiyat/teslim, stok hareketleri, araç/yakıt, maliyet, raporlar, Excel aktarımı ve ortak arayüz.
- Türkçe ve Romence metinler ortak ekran yapısından ayrı dil kaynaklarında tutulur. Dil değişimi ürün kimliklerini veya kayıtları değiştirmez.
- Kalıcı verinin kaynağı sunucu/veritabanıdır. Tarayıcı deposu stok, maliyet veya yetki için otorite olmaz. İlk sürüm çevrimiçi çalışır.
- Veri modeli en az ürün, alım partisi, tekil parça, depo/departman, personel/rol/lokasyon ilişkisi, sevkiyat/kalem/teslim, stok hareketi, araç/makine, yakıt kaydı ve düzeltme geçmişini kapsar.
- İlişkisel veritabanı ve yönetilen kimlik doğrulama yaklaşımı teknik öneridir. Sağlayıcı, web çatısı ve barındırma seçimleri ayrı karar olarak kaydedilecek; Supabase/Firebase kullanımı bu bölümle kesinleşmez.
- Kullanıcıya açık giriş sicil numarası ve şifredir. Sicil kimliğiyle giriş, hesap açma/sıfırlama güvenilir sunucu akışında uygulanır; şifreler düz metin saklanmaz. Kimlik doğrulama altyapısının sicil girişini nasıl desteklediği uygulama öncesinde doğrulanır.

### Stok ve maliyet bütünlüğü
- Stok hareketi, miktar güncellemesi ve ilişkili maliyet kaydı tek veritabanı işlemi içinde tamamlanır veya birlikte geri alınır.
- Tekrar QR okutma, çift tıklama ve ağ isteğinin tekrarı aynı hareketi ikinci kez oluşturmaz; her işlem benzersiz tekrar önleme kimliği taşır.
- Eşzamanlı çıkışlarda mevcut stok kontrol edilir; stoktan fazla çıkış ve aynı tekil parçanın iki hedefe aktarılması reddedilir.
- Sevkiyat durumları ve izin verilen geçişler sunucuda doğrulanır. Kullanılabilir, yolda, departmanda, kullanılmış ve hasarlı miktarlar çift sayılmaz.
- Para hesaplarında ondalık hassasiyet ve yuvarlama kuralları açık tanımlanır. EUR vergi dahil toplam, net ve vergi ayrı korunur; taşıma gideri alış maliyetine dahil edilmez.
- Okutulan partinin/tekil parçanın maliyeti taşınır. Genel ürün kodunda FIFO yalnız öneridir; gerçek seçilen partiyle işlem tamamlanır.
- Excel aktarımı önizleme ve doğrulama içerir; mükerrer ürün/parti ve dosyanın tekrar yüklenmesi kontrol edilir. Hatalı satırlar kullanıcıya açıklanır; başlangıç stok aktarımı tedarikçi ürün kartı aktarımından ayrıdır.

### Erişim ve oturum güvenliği
- Rol, lokasyon, kayıt durumu ve alan erişimi her sunucu işleminde doğrulanır. Menü gizlemek erişim kontrolü sayılmaz.
- Fiyat görme yetkisi olmayan kullanıcıya fiyatlar API yanıtı, QR içeriği, rapor, dışa aktarım veya tarayıcı önbelleği üzerinden verilmez.
- QR kimlik referansı taşır; şifre, anahtar veya maliyet içermez ve erişim yetkisi sağlamaz. Okutma sonrası oturum ve izinler denetlenir.
- Sicil numarası personelin değişmeyen iç kayıt kimliğinden ayrılır; hesap kapatma geçmiş hareketleri silmez. Tekrarlı sicil ve geçmiş kimliklerin karışması engellenir.
- Geçici şifre üretimi önerisi güvenli rastgele üretim, süreli kullanım ve ilk girişte zorunlu değişimle uygulanır; nihai hesap akışı kesinleştirilecek.
- Giriş denemeleri sınırlandırılır. Oturum süresi, hareketsizlik süresi ve hesap kapatılınca mevcut oturumların iptali kuralları kodlama öncesinde belirlenir.
- Çıkışta kullanıcıya ait önbellek temizlenir. Gizli sunucu anahtarları GitHub'a, tarayıcıya veya hata kayıtlarına yazılmaz.
- HTTPS ve kamera izniyle telefon QR akışı doğrulanır. CSP, içerik türü, yönlendiren bilgisi ve çerçeve korumaları; HTTPS yönlendirmesi/HSTS barındırma düzenine uygun yapılandırılır.
- Cookie tabanlı oturum seçilirse CSRF koruması dahil edilir; kullanıcı girdileri ve Excel içerikleri betik çalıştırmadan işlenir.

### GitHub ve veritabanı değişiklik düzeni
1. Ana dal güncellenir; küçük görev için ayrı geliştirme dalı açılır.
2. Kod ve gereken veritabanı migration dosyaları aynı değişiklik kapsamında hazırlanır.
3. Derleme, ilgili işlev/yetki testleri ve güvenlik kontrolleri çalıştırılır.
4. Commit ve push sonrasında PR oluşturulur; başarılı kontrollerle ana dala birleştirilir.
5. Deneme ortamında doğrulanan sürüm canlıya alınır; temel akışlar yayından sonra tekrar kontrol edilir.
- Geliştirme, deneme ve canlı ortamın veri/anahtarları ayrılır; testlerde sentetik kayıtlar kullanılır.
- Canlı veritabanında kontrolsüz manuel şema değişikliği yapılmaz. Migration önce testte denenir; yıkıcı değişikliklerde yedek ve veri koruma planı hazırlanır.
- Ana dal mümkün olduğunca çalışır tutulur. Bağımlılık sürümleri kilitlenir; güncelleme PR'ları test edilmeden birleştirilmez.
- Kod, bağımlılık ve secret taramaları yapılandırılır. CodeQL/Dependabot/secret scanning kullanılabilirliği depo ve plana göre doğrulanır; uygun eşdeğer kontroller kullanılabilir.

### Kabul ve regresyon testleri
- [ ] Sicil/şifre girişi, çıkış, yanlış şifre ve kapatılmış hesap kontrolü.
- [ ] Her rolün izinleri; atanmamış lokasyona işlem yapamama ve yetkisiz fiyat erişiminin doğrudan API/dışa aktarımda reddi.
- [ ] Alım → yükleme → gönderim → kısmi/tam teslim → departman → kullanım zinciri.
- [ ] Eksik/hasarlı teslimin kullanılabilir stoktan ayrılması.
- [ ] Tekrar okutma/istek gönderme ve iki kullanıcının eşzamanlı çıkışı.
- [ ] Farklı fiyatlı partiler, tekil parça, iadede orijinal maliyet ve vergi/net/toplam hesapları.
- [ ] Kutu/adet dönüşümü, kesirli birimler ve geçersiz/negatif miktarların reddi.
- [ ] Excel önizleme, mükerrer dosya/satır, eksik alan ve başlangıç stokları.
- [ ] Tanktan yakıt çıkışı ve istasyon kaydı; geçersiz sayaç ve uygun dolumla tüketim hesabı.
- [ ] Türkçe/Romence, telefon kamera izni reddi ve gerçek etiket okutma.
- [ ] İstek sırasında bağlantı kesilirse başarılı kaydı sorgulama; kör tekrar yerine aynı işlem kimliğiyle doğrulama.
- [ ] Admin düzeltmelerinde eski kayıt, gerekçe, kişi ve zamanın korunması.
- [ ] Temsilî veri hacminde mobil liste/arama/rapor hızı; hedef hacim ve kabul süreleri pilot öncesinde belirlenir.

### Yayın, yedekleme ve işletim
- Her yayında giriş, rol/lokasyon/fiyat erişimi, QR, stok hareketi, parti maliyeti ve iki dil kontrol edilir. Başarısız kritik kontrol canlı yayına engeldir.
- Kod sürümü ve migration durumu kaydedilir. Kod geri dönüşü veri değişikliklerini otomatik geri almaz; migration için ayrı kurtarma planı gerekir.
- Canlıya geçmeden önce yedek sıklığı, saklama süresi, kabul edilen veri kaybı ve toparlanma süresi belirlenir. Veritabanı ve varsa dosya/etiket ekleri birlikte değerlendirilir.
- Pilot öncesinde örnek yedek ayrı ortama geri yüklenir; kayıt sayıları, stok bakiyeleri ve temel işlemler doğrulanır.
- Hata ve erişilebilirlik takibi, sürüm bilgisi ve hata inceleme sorumlusu belirlenir. Günlüklere şifre/anahtar yazılmaz; kişisel ve finansal bilgiler gereksiz çoğaltılmaz.
- Bildirim merkezi ve web push ertelenmiş kalır. İşletim hata takibi bu ertelemeyi kaldırmaz ve kullanıcıya otomatik bildirim özelliği eklemez.

### Codex çalışma talimatı
Önce bu planı ve mevcut kod/migration dosyalarını oku. Kesin kararları koru; açık teknoloji seçimlerini yapılmış gibi gösterme. Küçük görevler halinde geliştir, gerekli migration ve ilgili testleri birlikte hazırla. Sonunda değişen dosyaları, çalıştırılan kontrolleri, başarısız veya henüz yapılmamış işleri belirt. Belgede planlanan özellikler tamamlanmış özellik olarak işaretlenmez.

### Bir sonraki teknik kararlar
- Veritabanı/kimlik doğrulama sağlayıcısı, sicil giriş yöntemi, web teknolojisi ve barındırma.
- Repo ve deneme ortamının kurulması; Sasa-F fontunun kaynak koddan doğrulanması.
- Oturum/şifre süreleri, yedekleme hedefleri, temsilî veri hacmi ve performans ölçütleri.
- Örnek Excel, başlangıç stokları ve cihazlarla pilot test verilerinin hazırlanması.

## Teknik altyapı kararı — 8 Ekim 2026

Kullanıcının kararı: Yeni bir web/sunucu teknolojisi eklemek yerine Sasa-F'e benzer GitHub Pages + Supabase yapısıyla ilerlemek. Önceki Next.js, Auth.js, Vercel ve Cloudflare barındırma önerileri yürürlükten kaldırıldı; bu sağlayıcılarda kurulum yapılmadı.

| Katman | Seçim | Görev |
|---|---|---|
| Web | HTML, CSS ve modüler JavaScript | Türkçe/Romence tarayıcı arayüzü ve telefon kamerasıyla QR |
| Kaynak kod ve yayın | Özel GitHub deposu + GitHub Pages | Kod/sürüm geçmişi ve statik web yayını |
| Veritabanı | Supabase PostgreSQL | Stok, parti, tekil parça, transfer, maliyet, araç ve yakıt |
| Sunucu işlemleri | Supabase Edge Functions + güvenli PostgreSQL fonksiyonları | Hesap/yetki işlemleri ve atomik stok hareketleri |
| Kimlik doğrulama | Sicil + şifre; Supabase ile teknik doğrulama bekliyor | Kullanıcıdan e-posta veya telefon istenmez |

### İlk teknik doğrulama
- Supabase Auth standart şifre girişi e-posta veya telefon temellidir; sicil numarası doğrudan desteklenmiş varsayılmaz.
- Önce sicil/şifre girişini, admin hesap açma ve sıfırlama akışını, oturum iptalini ve RLS ile rol/lokasyon/fiyat kısıtlarını birlikte doğrulayan küçük prototip hazırlanır.
- Kullanıcıya e-posta zorunluluğu getirilmez. Sicil girişinin güvenli yöntemi belirlenmeden kimlik doğrulama tamamlanmış sayılmaz. Teknik e-posta kimliği gibi seçenekler kullanıcıya açıklanmadan kesin karar olarak uygulanmaz.
- Auth.js ve Next.js sunucu katmanı kullanılmaz. Özel parola yönetimi gerekiyorsa hashleme, deneme sınırlama, oturum ve sıfırlama sorumlulukları açıkça belgelenir; basit bir şifre tablosuyla giriş kurulmaz.
- Stok çıkışı/teslim/maliyet veritabanında atomik işlemlerle tamamlanır. Edge Function ve RPC çağrıları kimlik, rol ve lokasyonu doğrular.
- Sunucu anahtarları GitHub veya tarayıcıya konmaz. RLS ve alan bazında finansal veri kısıtları tüm erişim yollarında uygulanır.

### Yayın adresi ve kurulum
- Romway alan adı erişimi henüz yok; ilk prototip yerelde veya uygun deneme ortamında çalışır. Sonradan seçilecek marka altında romway.ro alt alan adı bağlanabilir.
- GitHub Pages'in ticari uygulama/SaaS barındırma kullanım koşulları, özel depo plan gereksinimi ve yayın görünürlüğü gerçek pilot/canlı kurulum öncesinde doğrulanır. Pages'e uygunluk henüz doğrulanmış değildir; bu karar kullanım koşullarını atlama anlamına gelmez.
- Pages yalnız statik dosya yayınlar; tüm güvenilir işlemler Supabase tarafında çalışır. Hassas veriler statik dosyalara veya derleme çıktısına gömülmez.
- Deneme ve canlı Supabase verileri/anahtarları ayrılır. Repo, servis hesapları, ücretli plan veya DNS değişikliği bu planlama adımında oluşturulmadı.
- Bildirim merkezi ve Firebase/web push ertelenmiş kalır.

### Kaynak ve karar takibi
- Supabase şifre girişi: https://supabase.com/docs/guides/auth/passwords
- Başlangıç altyapı kararı GitHub Pages + Supabase'dir; sicil giriş prototipi ve hosting kullanım uygunluğu sonuçları bu belgeye eklenecek.

## Hosting uygunluk kontrolü — 8 Ekim 2026
- GitHub'ın resmi Pages kullanım sınırları kontrol edildi: Pages ücretsiz online işletme/ticari SaaS barındırması için izinli değildir ve şifre gönderimi gibi hassas işlemler için kullanılmaması belirtilir.
- Kaynak: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- Bu nedenle önceki GitHub Pages kararının canlı uygulama için uygunluğu doğrulanmadı; bu uygulamanın şifreli giriş ve ileride satış hedefi nedeniyle Pages canlı dağıtımı planlanmayacak. Prototip yerelde sürdürülebilir.
- En az değişiklikli alternatif öneri: GitHub kod deposu + Cloudflare Pages yalnız statik arayüz + Supabase tüm backend/veritabanı işlemleri. Bu alternatif henüz kullanıcı tarafından seçilmedi.
- Bu alternatif Next.js, Auth.js veya Cloudflare Workers gerektirmez; HTML/CSS/modüler JavaScript yaklaşımı korunur.
- Supabase sicil girişi yönteminin ayrıca doğrulanması gerekir. Kullanıcıdan gerçek e-posta istenmeyecek; standart Supabase Auth'ın e-posta/telefon gereksinimi çözülmüş sayılmaz.

## Sade altyapı — kesin karar, 8 Ekim 2026
- Kullanıcı GitHub + Cloudflare Pages + Supabase yapısını kesinleştirdi.
- GitHub özel kaynak kod deposu ve sürüm geçmişi için kullanılır; web yayını GitHub Pages'te yapılmaz.
- Cloudflare Pages HTML/CSS/modüler JavaScript arayüzünü yayınlar. Önce Pages'in sağladığı deneme adresi, sonra Romway alt alan adı kullanılabilir.
- Supabase PostgreSQL, Edge Functions ve güvenli veritabanı fonksiyonları veri ve sunucu işlemlerini sağlar.
- Next.js, Auth.js, Vercel ve Cloudflare Workers bu mimaride kapsam dışıdır.
- Önceki alternatif veya aday hosting maddeleri yerine bu karar geçerlidir. Hesap/proje/DNS kurulumu henüz yapılmadı.
- Sıradaki iş sicil + şifre giriş yöntemini kesinleştirmek ve prototiple doğrulamaktır. Kullanıcıya gerçek e-posta veya telefon zorunluluğu getirilmeyecek.
- Kesinleşen giriş yöntemi: Supabase Auth hesabına sistemin ürettiği, posta kutusu olmayan benzersiz e-posta biçimli iç kimlik atanması; Edge Function'ın sicili bu kimliğe eşleyip Supabase Auth ile şifre doğrulaması. Personel yalnız sicil ve şifre görür. İç kimlik kullanıcıdan istenmez, posta gönderimi yapılmaz ve yetki/secret yerine geçmez.
- Kullanıcı bu yöntemi 8 Ekim 2026 tarihinde onayladı. Auth şifre hashleme ve oturum hizmeti korunur; admin hesap açma, geçici şifre ve zorunlu ilk değişim akışı ayrıca test edilir. Geçici şifreyle stok/finans erişimi sunucuda engellenir.

## Sicil numarasıyla giriş — kesinleşen yöntem
- Personel yalnız sicil numarası ve şifreyle giriş yapar; gerçek e-posta veya telefon istenmez.
- Sunucu personel hesabı için benzersiz, posta kutusu olmayan e-posta biçimli iç kimlik üretir ve Supabase Auth hesabına bağlar. Sicil değişse bile kalıcı personel/Auth kimliği korunur.
- Edge Function sicili iç kimlikle eşleştirir ve Supabase Auth ile şifreyi doğrular; şifreyi kaydetmez veya günlüklere yazmaz. İç kimlik kendisi secret veya erişim yetkisi değildir.
- Posta gönderimi ve e-posta ile kurtarma kullanılmaz; admin sıfırlama akışı uygulanır. Hesap oluşturma yalnız yetkili sunucu işlemiyle yapılır; açık kullanıcı kaydı kapatılır.
- Geçici şifre güvenli rastgele üretilir; personele admin tarafından iletilir. İlk girişte değişim zorunlu olacak; değişim tamamlanmadan stok/finans işlemleri sunucuda reddedilecek.
- Hesap açma, ilk şifre değişimi, yanlış şifre, yetki/lokasyon/fiyat erişimi, hesap kapatma ve oturum iptali prototipte doğrulanacak. Bu karar henüz çalışır kurulum anlamına gelmez.
