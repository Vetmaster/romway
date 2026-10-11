# Romway geliştirme kuralları

## Referans ve kapsam
- Ana referans `docs/Romway_Proje_Plani.md` ve kullanıcının en son kesin kararlarıdır. Kök dizindeki plan özgün kaynak olarak korunur.
- Sasa-F planından yalnız geliştirme, güvenlik, test ve dokümantasyon düzeni alınır. Çelişkide Romway kararları geçerlidir. Futbol, üyelik, ödeme ve bildirim akışları taşınmaz.
- Yalnız HTML/CSS ve modüler JavaScript; GitHub kaynak kod, GitHub Pages statik yayın (10 Ekim kullanıcı kararı), Supabase Auth/PostgreSQL/Edge Functions sunucu katmanı. Next.js, Vercel, Auth.js veya yeni altyapı ekleme.
- İlk uygulama aşaması sicil/şifre girişi, zorunlu ilk şifre değişimi, TR/RO seçimi ve sade karşılama ekranıdır. Stok sistemini aynı PR'da oluşturma.

## Çalışma ve veri koruma
- Önce mevcut kodu, Git durumunu ve ilgili belgeleri incele. Planlanan özellikleri kod/test kanıtı olmadan tamamlanmış sayma.
- Dosyaları, veritabanını, Supabase projesini veya geçmiş kayıtları silme. Kullanıcının mevcut değişikliklerini koru.
- Küçük görevleri ayrı dalda geliştir; ilgili kontrolleri çalıştır, commit/push ve inceleme için PR hazırla. PR'ı otomatik birleştirme.
- Migration yalnız dosya olarak hazırlanabilir. Mevcut Supabase'e migration, fonksiyon dağıtımı veya veri değişikliği yapma. GitHub Pages önizlemesi kullanıcı tarafından yetkilendirildi. Supabase/DNS ve gerçek giriş yayını ayrıca değerlendirilir.
- 11 Ekim 2026 kullanıcı yeni ve ayrı Supabase test projesini seçti. Bu oturumda oluşturulan `romway-auth-test` (`ifnjvdjhfhzfxyuorqvz`) için giriş şeması/fonksiyonu ve sentetik entegrasyon verileri yetkilidir. Bu istisna Sasa Futbol, Vetamerikan-shift veya başka projelere uygulanmaz. Test projesi canlı veri için kullanılmaz; ücretli özellik/DNS veya GitHub Pages gerçek giriş bağlantısı bu izin kapsamında değildir.
- Aynı oturumda kullanıcı özel alan adı olmadan GitHub Pages ile devam etmeyi belirtti. Test projesine bağlı giriş önizlemesi doğrulama sonrası yayınlanabilir; CHIPS modunda Secure/HttpOnly/__Host-/Partitioned cookie ve tam Origin kontrolü korunur. JS token fallback yoktur. Eski Strict/same-site varsayımı bu mod için geçerli değildir. Gerçek iş verisi/pilot ve ücretli özellik/DNS hâlâ ayrı karardır.
- Testler sentetik veriyle, ayrı yerel/test ortamında çalışır. Deneme ve canlı anahtar/verilerini ayır.

## Personel aşaması — 11 Ekim kullanıcı kararı
- Sonraki küçük aşama personel ekleme, rol/lokasyon atama, pasifleştirme ve lokasyon eklemedir; stok/araç ve şifre sıfırlama bu PR'a eklenmez.
- Super_admin tüm personeli yönetir. Admin yalnız kendi lokasyonlarının tamamı içinde kalan purchasing/receiver personelini yönetir; hedefin eski ve yeni lokasyonları sunucuda doğrulanır.
- Kullanıcı temsili lokasyon isimlerini onayladı: Türkiye Test Deposu / Romanya Test Deposu. Bunlar gerçek iş verisi sayılmaz.
- Geçici şifre yöneticiye tek seferlik işlem yanıtında teslim edilir; statik kaynak/config, günlük veya tarayıcı deposunda saklanmaz.
- 11 Ekim kullanıcı PR #4 kapsamındaki personel migration/Edge işlemlerini yalnız romway-auth-test projesine uygulamayı, gerçek entegrasyonla doğrulamayı ve ardından GitHub Pages test önizlemesine yayınlamayı açıkça onayladı. Diğer projeler ve gerçek iş verisi kapsam dışıdır; otomatik merge yapılmaz.

## Güvenlik
- Şifre, token ve service_role anahtarını kaynak kod, statik çıktı, tarayıcı yapılandırması veya günlüklerde tutma. Kullanıcıya elle token kopyalama akışı sunma.
- Personel yalnız sicil/şifre görür; sunucu sicili Supabase Auth'ın posta kutusu olmayan iç e-posta kimliğine eşler. Açık kayıt ve e-posta kurtarma kullanılmaz.
- Admin hesabı açarken geçici şifre güvenli rastgele üretilir. İlk değişim zorunluluğu, hesap aktifliği ve oturum iptali sunucuda uygulanır; yalnız arayüz engeli yeterli değildir.
- Her API/RPC/RLS yolunda rol, lokasyon, hesap durumu ve oturum geçerliliğini doğrula. Fiyatlar receiver'a API, QR, rapor veya önbellekle sızmamalı.
- QR yalnız kimlik referansı taşır; erişim yetkisi veya gizli veri içermez. İlk sürüm çevrimiçidir.
- Stok hareketleri atomik ve tekrar güvenli olmalı; yetki/finansal değerler tarayıcıdan otorite olarak alınmaz.

## Test ve dokümantasyon
- Her değişiklikte ilgili riskleri test et. Girişte yanlış şifre, kapalı hesap, deneme sınırı, geçici şifre süresi, zorunlu değişim, eski oturum ve doğrudan API erişimini kapsa.
- Yetki testlerini yalnız menü görünürlüğüyle sınırlandırma. RLS ve sunucu işlemlerini ayrı test et.
- Arayüz metinlerini ayrı TR/RO dil dosyalarında tut; mobil, klavye, etiketler, kontrast ve hata durumlarını doğrula.
- `docs/TODO.md` ve `docs/INCELEME.md` içinde tamamlanan/kanıtlanan işleri, bekleyen doğrulamaları ve eksikleri güncelle.
- Sonuçta dosyaları, çalıştırılan kontrolleri ve yapılmayan test/dağıtımları açıkça bildir.

## Sasa-F planından uyarlanan kontroller
- HTTPS/CSP/Content-Type/Referrer-Policy/frame korumalarını GitHub Pages yayın düzeninde doğrula; yeni servislerin CSP etkisini incele.
- Tarayıcı deposu yetki veya kalıcı iş verisi için otorite değildir. Deneme ortamında doğrudan rol/lokasyon/fiyat erişim regresyonu çalıştır.
- Yeni bağımlılıkları sürüm/kilit ve güvenlik açısından değerlendir; Dependabot güncellemelerini test et. CodeQL/secret scanning kullanılabilirliğini doğrulamadan aktif yazma.
- Mimari, veritabanı, güvenlik, roller ve karar günlüklerini ihtiyaç oldukça ayrı docs dosyalarına ayır.
