# GitHub Pages önizlemesi

10 Ekim 2026 kullanıcı kararıyla Cloudflare yerine GitHub Pages kullanılacak. Kullanıcının sonraki açık onayıyla repo herkese açıldı; özel depo plan engeli kaldırıldı. Ayrı gh-pages dalı yalnız web/ dosyalarını içerir; planlar, sunucu kodu ve testler site çıktısına dahil edilmez; bu kaynak dosyalar açık GitHub deposunda görülebilir. Gizli anahtarlar kaynakta veya çıktıda tutulmaz. Bu yayın için PR birleşmesi gerekmez; kaynak geliştirme PR’ında incelenir. Otomatik merge yoktur.

GitHub Pages kaynağı gh-pages dalının / köküdür. .nojekyll statik dosyaların olduğu gibi sunulmasını sağlar. _headers GitHub tarafından uygulanmaz ve yayın çıktısına alınmaz. CSP desteklenen direktiflerle HTML meta olarak eklenmiştir; frame-ancestors, özel Cache-Control ve diğer HTTP header kontrolleri meta ile sağlanmış sayılmaz. HTTPS ve provider header’ları yayından sonra kontrol edilir.

Endpoint boş; gerçek giriş devre dışı. Pages ile uzak Supabase cookie uyumu ve gerçek Auth bağlantısı henüz çözülmüş değildir. Pages kullanımı kendi başına şifreyi güvensiz yapmaz; sağlayıcının hassas işlem uyarısı ve ticari kullanım kısıtı, gerçek uygulama yayını öncesi tekrar değerlendirilir.

Özel depoda Pages uygun GitHub planı gerektirir. Kullanıcının onayı olmadan repo public yapılmaz veya ücretli plan alınmaz. Erişim yoksa yayın tamamlanmış sayılmaz.

Yeni sürüm: kontroller, commit ve PR güncellemesinden sonra güvenilir terminalde `node scripts/publish-pages.mjs`. Betik commit edilmiş web/ ağacını ayrı gh-pages dalına gönderir; dosya silmez, ana dalı veya PR’ı birleştirmez, force push kullanmaz. Yalnız kullanıcı tarafından yayın yetkilendirilmişken çalıştırılır.

Resmi kaynaklar: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site ve https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

## Yayın sonucu (10 Ekim 2026)

Web dosyaları gh-pages dalına gönderildi. Pages etkinleştirme isteği HTTP 422 ile reddedildi: mevcut hesap planı bu özel depoda GitHub Pages desteklemiyor. Site henüz yayınlanmadı. Depo özel olarak korundu; ücretli plan veya görünürlük değişikliği yapılmadı.

Doğrulama: kaynak kontrolü ve 22 sunucu/veritabanı testi geçti. Tarayıcı testindeki Chromium yerel ağ izin gereksinimi yalnız test bağlamında ele alınır; uygulamanın CSP veya Origin kontrolleri kaldırılmaz.

## Sonraki karar ve etkinleştirme

10 Ekim 2026: kullanıcı depoyu şimdilik herkese açmayı onayladı. Repo public olarak doğrulandı; Pages gh-pages kökünden etkinleştirildi, HTTPS açık. Önceki HTTP 422 engeli giderildi. Adres: https://vetmaster.github.io/romway/ . Gerçek Supabase girişi devre dışı; güvenlik ve repo görünürlüğü ileride yeniden değerlendirilecek.

Canlı doğrulama: Pages build built, HTTP GET başarılı, HTTPS etkin. Tarayıcıda Romway logosu yüklendi, TR ekranı ve bağlantısız giriş uyarısı görüldü, giriş devre dışı doğrulandı. Önceki 22 test ve mobil/masaüstü tarayıcı kontrolleri geçti.
