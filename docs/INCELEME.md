# Başlangıç incelemesi — 10 Ekim 2026

## Kodla/dosyalarla doğrulanan
- Yerel Git deposu, `origin` = https://github.com/Vetmaster/romway.git ve `agent/romway-foundation` dalı mevcut.
- GitHub özel depo olarak doğrulandı. Başlangıçta uzak ref listesi boştu; mevcut uygulama kodu yoktu.
- `Romway_Proje_Plani.md` bütünü okundu. Son ekler Cloudflare Pages ve Supabase iç Auth kimliği kararlarını kesinleştiriyor; eski GitHub Pages/teknoloji adayları yürürlükte değil.
- `Romway_Auth_Personel_v4.ts` bütünü okundu. Deno/Supabase JS taslağı login, change-password, me, location-check, reset-password ve create-staff işlemleri içeriyor. Kaynakta gerçek anahtar değeri yok; service_role ortamdan okunuyor.
- Sasa-F fontu yerel `SASA-F/sporx-futbol-okulu/index.html` satır 20 ve `styles.css` satır 15/35 ile doğrulandı: Roboto gövde, Anta marka. Sasa-F README ve mevcut workflow dosya listesi incelendi; Romway'e Pages/Firebase yayını taşınmadı.

## Eksik kaynak ve altyapı
- SASA-F_PROJECT_PLAN.md ilk kontrolde yoktu; son kontrolde eklendi ve bütünü okundu. Geliştirme, test, güvenlik ve dokümantasyon kuralları uyarlandı. Sasa-F planındaki tamamlanma iddiaları Romway için kanıt sayılmadı.
- Romway_Auth_Personel_v4.ts ilk kontrolde okundu; son kontrolde dosya klasörde bulunmuyor. Bu çalışma sırasında silinmedi. Auth inceleme bulguları yalnız okunan sürüme aittir.
- Web arayüzü, TR/RO dil dosyaları, Supabase migration/RLS/RPC dosyaları, bağımlılık kilidi ve çalışır test paketi yok.
- Taslağın `staff`, `staff_locations`, `locations` ve `consume_auth_attempt` bağımlılıkları bulunmuyor.
- Supabase projesi/ayarları/dağıtılmış fonksiyon veya Cloudflare projesi incelenmedi; bağlı ve çalışır varsayılmıyor.

## Auth taslağında doğrulama veya düzeltme gereken
Bu çalışma sırasında bu dosyaya silme/yazma işlemi yapılmadı veya dosya çalıştırılmadı. Mevcut taslak, aşağıdaki konular çözülmeden güvenli girişin tamamlandığı kanıtı değildir:

- `change-password` mevcut şifre ile yeni şifrenin farklı olmasını kontrol etmiyor. Aynı geçici şifre tekrar verilerek zorunlu değişim kaldırılabilir; farklı şifre şartı ve testi gerekli.
- Şifre değiştirmede Auth güncellemesi ve staff güncellemesi iki ayrı işlem; kısmi hata ve eşzamanlı reset/hesap kapatma için kilit/sürüm kontrolü ve kurtarma tasarlanmalı.
- Reset akışı başarısızlıkta hesabı kapalı tutuyor; yeniden açma adımı eşzamanlı admin kapatmasıyla çakışabilir. Hesap kapatma/işlem kilidi ayrı durumlarla test edilmeli.
- `create-staff` kısmi hata temizliği delete işlemleri içeriyor. Bu oturumda hiçbir veri silinmedi. Üretime alma öncesi kullanıcı talimatına uygun veri koruyan telafi yöntemi hazırlanmalı.
- Lokasyon/fiyat yardımcıları Edge Function'da var; bu, doğrudan tablo/RPC erişiminin güvenli olduğunu kanıtlamaz. RLS, fiyat alan ayrımı ve geçici/eski oturum engeli tüm yollar için gerekli.
- Deneme sınırı RPC'si yok. Geçersiz sicillerin erken reddi, hesap bazlı sınırın yanında genel/IP sınırı ve hesap keşfi/zaman farkları test edilmeli.
- JWT sürümünü kontrol eden taslak mevcut; Auth API'si ve doğrudan RLS erişiminde aynı iptal kurallarının işlediği henüz doğrulanmadı.
- 12–128 karakter şifre ve 24 saat geçici şifre taslak davranışıdır; çalışır ortam testi yok. Eksik/geçersiz geçici süreler güvenli biçimde reddedilmeli.
- İlk yönetici oluşturma, açık kaydı kapatma, origin/CORS, oturum saklama/çıkış ve hata kurtarma kılavuzu yok.

## Yapılan ve yapılmayan kontroller
Yapıldı: yerel dosya/Git incelemesi, uzak ref ve özel depo kontrolü, plan/taslak okuması, font kaynak doğrulaması. Beş hazırlanan Markdown belgesinin yerel bağlantı/boş dosya kontrolleri geçti. Yedi MD dosyasında bilinen anahtar/token önekleri için sınırlı sabit-değer kontrolü geçti; kapsamlı secret taraması değildir. Standart staged diff kontrolü özgün Sasa-F planındaki üç Markdown satır sonu boşluğunu bildirdi. Kaynak belge değiştirilmedi; satır sonu boşlukları hariç tutulan diff kontrolü geçti.

Yapılmadı: TypeScript/Deno çalıştırma, Supabase/Auth/RLS entegrasyonu, rol/lokasyon testi, arayüz/mobil/dil testi, migration, sunucu veya web dağıtımı. Planlarda test kutuları tamamlanmış olarak işaretlenmedi.
