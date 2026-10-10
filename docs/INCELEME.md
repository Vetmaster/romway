# Başlangıç incelemesi — 10 Ekim 2026

## Kodla/dosyalarla doğrulanan
- Yerel Git deposu, `origin` = https://github.com/Vetmaster/romway.git ve `agent/romway-foundation` dalı mevcut.
- GitHub özel depo olarak doğrulandı. Başlangıçta uzak ref listesi boştu; mevcut uygulama kodu yoktu.
- `Romway_Proje_Plani.md` bütünü okundu. Son ekler Cloudflare Pages ve Supabase iç Auth kimliği kararlarını kesinleştiriyor; eski GitHub Pages/teknoloji adayları yürürlükte değil.
- Sasa-F fontu yerel `SASA-F/sporx-futbol-okulu/index.html` satır 20 ve `styles.css` satır 15/35 ile doğrulandı: Roboto gövde, Anta marka. Sasa-F README ve mevcut workflow dosya listesi incelendi; Romway'e Pages/Firebase yayını taşınmadı.

## Eksik kaynak ve altyapı
- SASA-F_PROJECT_PLAN.md ilk kontrolde yoktu; son kontrolde eklendi ve bütünü okundu. Geliştirme, test, güvenlik ve dokümantasyon kuralları uyarlandı. Sasa-F planındaki tamamlanma iddiaları Romway için kanıt sayılmadı.
- Web arayüzü, TR/RO dil dosyaları, Supabase migration/RLS/RPC dosyaları, bağımlılık kilidi ve çalışır test paketi yok.
- Taslağın `staff`, `staff_locations`, `locations` ve `consume_auth_attempt` bağımlılıkları bulunmuyor.
- Supabase projesi/ayarları/dağıtılmış fonksiyon veya Cloudflare projesi incelenmedi; bağlı ve çalışır varsayılmıyor.

## Kaynak düzeltmesi
Kullanıcı, ilk kontrolde bulunan `Romway_Auth_Personel_v4.ts` dosyasının yanlışlıkla kopyalandığını açıkladı. Dosya Romway kodu, proje referansı veya teknik karar kaynağı değildir. Dosyaya özgü bulgular aktif yapılacaklardan çıkarıldı; yeniden temini gerekmiyor. Yalnız iki MD planı esas alınır. Çalışır giriş altyapısı henüz yoktur.

## Yapılan ve yapılmayan kontroller
Yapıldı: yerel dosya/Git incelemesi, uzak ref ve özel depo kontrolü, iki kaynak planın okunması, font kaynak doğrulaması. Beş hazırlanan Markdown belgesinin yerel bağlantı/boş dosya kontrolleri geçti. Yedi MD dosyasında bilinen anahtar/token önekleri için sınırlı sabit-değer kontrolü geçti; kapsamlı secret taraması değildir. Standart staged diff kontrolü özgün Sasa-F planındaki üç Markdown satır sonu boşluğunu bildirdi. Kaynak belge değiştirilmedi; satır sonu boşlukları hariç tutulan diff kontrolü geçti.

Yapılmadı: TypeScript/Deno çalıştırma, Supabase/Auth/RLS entegrasyonu, rol/lokasyon testi, arayüz/mobil/dil testi, migration, sunucu veya web dağıtımı. Planlarda test kutuları tamamlanmış olarak işaretlenmedi.

## İlk giriş prototipi — güncel inceleme
`feature/auth-foundation` dalında modüler web, yeni sunucu kodu, uygulanmamış migration, yerel bootstrap betiği ve test araçları hazırlandı. Bu güncelleme önceki başlangıç envanterindeki "kod yok" durumunu yerel prototip düzeyinde değiştirir. Yanlış yüklenen Auth dosyası kullanılmadı.

- `npm run check`: JS syntax, statik dosya referansları ve sınırlı credential/secret kontrolleri geçti.
- `npm test`: 22 test geçti. Migration bellekte çalışan PGlite PostgreSQL'e uygulandı; özel şema/RLS/service-only RPC izinleri, geçici hesap, sürüm/oturum iptali, eşzamanlı kilit, yarım şifre değişimi ve Origin sınırları test edildi. Auth kullanıcısı/roller sentetik, Auth REST adaptörü kontrollü fetch fixture'ıyla sınandı.
- Tarayıcı: yerel Chrome'da 1440 ve 390 px görünüm, TR/RO kalıcılığı, yanlış giriş/şifre temizliği, zorunlu değişim, eşleşmeyen şifre, güvenli textContent, çıkış hatası ve ağ tekrar denemesi geçti. Üretim HTTP işleyicisiyle gerçek tarayıcı HttpOnly cookie/CORS turu da geçti; Auth/DB bu tarayıcı testinde test doubles ile temsil edilir, SQL ayrı gerçek PostgreSQL motorunda sınandı. Ekran görüntüleri görsel olarak incelendi; taşma görülmedi. Otomatik testte dış font ağı bağımlılığı kapatılır; font kaynak seçimi ayrıca doğrulanmıştır.
- Gerçek Supabase Auth/Edge/Deno entegrasyonu yapılmadı: Docker daemon çalışmıyor. Kurulu CLI sürümü 2.108.0. Uzak Supabase projesi bağlanmadı, migration/dağıtım yapılmadı. Node test motoru üretim altyapısı değildir.
- Canlı web/API aynı-site adresi ve maliyet kararı açık; `_headers` connect-src varsayılan olarak yalnız self. Yapılandırma yokken gerçek giriş kapalıdır. Bu prototip canlıya hazır kabul edilmez.

Ayrıntılı mimari, yerel komutlar, oturum varsayımları ve kurtarma sınırları `AUTH.md` içindedir. Lokasyon ve fiyat verileri/işlemleri henüz yok; bunların sunucu izinleri sonraki aşamada ayrıca test edilecek.

GitHub, mevcut OAuth bağlantısında workflow scope olmadığı için `.github/workflows/checks.yml` içeren ilk push girişimini reddetti. Yetki genişletilmedi; aynı dosya `docs/ci/checks.yml.example` olarak korundu. Otomatik CI kurulmuş/çalışmış sayılmaz; yerel test sonuçları yukarıdadır.
