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
