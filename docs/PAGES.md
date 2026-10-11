# GitHub Pages önizlemesi

10 Ekim 2026 kullanıcı kararıyla Cloudflare yerine GitHub Pages kullanılacak. Kullanıcının sonraki açık onayıyla repo herkese açıldı; özel depo plan engeli kaldırıldı. Ayrı gh-pages dalı yalnız web/ dosyalarını içerir; planlar, sunucu kodu ve testler site çıktısına dahil edilmez; bu kaynak dosyalar açık GitHub deposunda görülebilir. Gizli anahtarlar kaynakta veya çıktıda tutulmaz. Bu yayın için PR birleşmesi gerekmez; kaynak geliştirme PR’ında incelenir. Otomatik merge yoktur.

GitHub Pages kaynağı gh-pages dalının / köküdür. .nojekyll statik dosyaların olduğu gibi sunulmasını sağlar. _headers GitHub tarafından uygulanmaz ve yayın çıktısına alınmaz. CSP desteklenen direktiflerle HTML meta olarak eklenmiştir; frame-ancestors, özel Cache-Control ve diğer HTTP header kontrolleri meta ile sağlanmış sayılmaz. HTTPS ve provider header’ları yayından sonra kontrol edilir.

11 Ekim itibarıyla Pages giriş önizlemesi yalnız ayrı romway-auth-test projesine bağlanır. CHIPS/HttpOnly oturumu gerçek uzak Auth/DB ve Chrome ile doğrulandı; yerel preview bağlantısız kalır. Pages kullanımı kendi başına şifreyi güvensiz yapmaz; sağlayıcının hassas işlem uyarısı ve ticari kullanım kısıtı, gerçek uygulama yayını öncesi tekrar değerlendirilir.

Özel depoda Pages uygun GitHub planı gerektirir. Kullanıcının onayı olmadan repo public yapılmaz veya ücretli plan alınmaz. Erişim yoksa yayın tamamlanmış sayılmaz.

Yeni sürüm: kontroller, commit ve PR güncellemesinden sonra güvenilir terminalde `node scripts/publish-pages.mjs`. Betik commit edilmiş web/ ağacını ayrı gh-pages dalına gönderir; dosya silmez, ana dalı veya PR’ı birleştirmez, force push kullanmaz. Yalnız kullanıcı tarafından yayın yetkilendirilmişken çalıştırılır.

Resmi kaynaklar: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site ve https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

## Yayın sonucu (10 Ekim 2026)

Web dosyaları gh-pages dalına gönderildi. Pages etkinleştirme isteği HTTP 422 ile reddedildi: mevcut hesap planı bu özel depoda GitHub Pages desteklemiyor. Site henüz yayınlanmadı. Depo özel olarak korundu; ücretli plan veya görünürlük değişikliği yapılmadı.

Doğrulama: kaynak kontrolü ve 22 sunucu/veritabanı testi geçti. Tarayıcı testindeki Chromium yerel ağ izin gereksinimi yalnız test bağlamında ele alınır; uygulamanın CSP veya Origin kontrolleri kaldırılmaz.

## Sonraki karar ve etkinleştirme

10 Ekim 2026: kullanıcı depoyu şimdilik herkese açmayı onayladı. Repo public olarak doğrulandı; Pages gh-pages kökünden etkinleştirildi, HTTPS açık. Önceki HTTP 422 engeli giderildi. Adres: https://vetmaster.github.io/romway/ . Gerçek Supabase girişi devre dışı; güvenlik ve repo görünürlüğü ileride yeniden değerlendirilecek.

Canlı doğrulama: Pages build built, HTTP GET başarılı, HTTPS etkin. Tarayıcıda Romway logosu yüklendi, TR ekranı ve bağlantısız giriş uyarısı görüldü, giriş devre dışı doğrulandı. Önceki 22 test ve mobil/masaüstü tarayıcı kontrolleri geçti.

## 11 Ekim — test girişi

Kullanıcı yeni ve ayrı Supabase projesini ve özel alan adı olmadan GitHub Pages ile devam etmeyi seçti. Varsayılan Strict cookie için önceki domain gereksinimi CHIPS modunda kaldırıldı; bu önceki kayıtları günceller. Test endpoint'i CSP connect-src izin listesine alındı; yalnız public URL web config'inde bulunur. Anahtar/JWT/şifre eklenmedi. Test ortamı etiketi TR/RO gösterilir. Yayın öncesi gerçek CHIPS/Edge/Auth/DB testi ve 23 birim/PostgreSQL testi geçti. Hedef telefonlarda ayrıca denenmesi gerekir.

Son doğrulama: gh-pages 374a081 build built. Gerçek yayındaki HTML/config/app dosyaları mobil Chrome üzerinden yeni sentetik hesapla giriş/yenileme/çıkış testinden geçti. Yayın test projesine bağlıdır; TESTADMIN hesabı kullanıcı denemesi için hazır, ilk şifre değişimi zorunlu. Kaynak PR #3 taslaktır; merge yapılmadı.
