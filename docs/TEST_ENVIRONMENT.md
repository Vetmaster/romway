# Gerçek Supabase test ortamı

11 Ekim 2026 kullanıcı, Docker kurulumu yerine yeni ve ayrı bulut test projesini seçti.

| Alan | Doğrulanan durum |
| --- | --- |
| Proje | romway-auth-test |
| Referans | ifnjvdjhfhzfxyuorqvz |
| Bölge | eu-central-1 (Frankfurt) |
| Kuruluş planı | Management API ile free doğrulandı; Nano istendi |
| Şema | Boş proje kontrolünden sonra auth_foundation migration uygulandı |
| Kullanıcı kaydı | disable_signup=true |
| Sunucu | romway-auth Edge Function, API bundling ile dağıtıldı |
| Origin | https://vetmaster.github.io; yol Origin'in parçası değildir |
| Cookie | Üretim Secure/HttpOnly/SameSite=None; Partitioned; ROMWAY_LOCAL_DEV=false |

Sasa Futbol ve Vetamerikan-shift projelerine migration, dağıtım veya veri işlemi yapılmadı. Repo herhangi bir uzak projeye `supabase link` ile bağlanmadı. Mevcut Docker container/volume kayıtları silinmedi. Test hesapları sentetik ve her çalışmada benzersizdir; geçmiş kayıtlar korunur.

Veritabanı şifresi ve sunucu API anahtarları yalnız operatörün `.supabase/romway-test/` dizininde 0600 dosyalardadır; dizin 0700'dür. Bu dosyalar depo dışında kalır. Anahtarlar, tokenlar ve şifreler terminale veya test sonuçlarına basılmaz; tarayıcıya sunucu anahtarı verilmez. Yönetim bağlantısı mevcut CLI oturumuyla yapılır; elle token kopyalama akışı yoktur.

## Gerçek entegrasyonu tekrar çalıştırma

`scripts/test-cloud-auth.mjs` yalnız bu test referansına ve beklenen proje kimliğine izin verir; `npm test` ile otomatik çalışmaz. Operatörün özel runtime dosyası ve proje erişimi gereklidir.

```sh
ROMWAY_TEST_PROJECT=ifnjvdjhfhzfxyuorqvz ROMWAY_COOKIE_TEST_MODE=partitioned npm run test:cloud
```

Kurulu Chrome kullanılıyorsa `PLAYWRIGHT_EXECUTABLE_PATH` ayrıca verilebilir. Her çalıştırma yeni sentetik Auth/staff kayıtları oluşturur. Başarılı bitişte yalnız o çalışmanın test hesapları pasif yapılır; silinmez. Yarım testte kayıtlar kalabilir; otomatik silme/kurtarma yoktur. Özel şifre dosyaları üzerine yazılmaz.

Test iki ayrı sonucu ölçer:

- Dağıtılmış gerçek Deno Edge Function üzerinden HTTP istemcisinde zorunlu değişim, oturum iptali, Auth ve veritabanı erişim sınırları.
- Localhost'ta test sunucusu üzerinden gerçek uzak Supabase Auth/DB ile mobil tarayıcı akışı. Test sunucusu üretim JS işleyicisini kullanır; yeni üretim altyapısı veya canlı proxy değildir.

İkinci sonuç tek başına GitHub Pages cookie uyumunu kanıtlamaz. Ayrıca GitHub Pages origin üzerinden Strict cookie olumsuz testi çalıştırıldı; partitioned mod için gerçek Edge/Chrome turu ayrı sınanır. GitHub Pages test girişi için opt-in partitioned mod seçildi. Gerçek Edge/Auth/DB ile Chrome partitionKey, HttpOnly/Secure, giriş, sayfa yenileme ve çıkış doğrulandı; özel domain veya ücretli özellik gerekmedi. Yayın yalnız bu test projesine bağlanır; gerçek iş verisi girilmez. Safari/Firefox/telefon sürümleri ayrıca pilot öncesi doğrulanmalıdır.

Resmi kaynaklar: [proje oluşturma](https://supabase.com/docs/reference/api/v1-create-a-project), [migration API](https://supabase.com/docs/reference/api/v1-apply-a-migration), [Auth ayarları](https://supabase.com/docs/reference/api/v1-update-auth-service-config), [compute planları](https://supabase.com/docs/guides/platform/compute-and-disk).

## 11 Ekim doğrulama sonucu

23 Node/PGlite testi geçti. Gerçek bulut entegrasyonu: pasif hesap/yanlış şifre, zorunlu değişim, eski şifre ve iki eski oturumun reddi, güvenli profil, gerçek Auth JWT ile RPC/özel şema erişim reddi, signup kapatma, çıkış ve test hesabı kapatma geçti. Gerçek DB RLS/istemci SELECT izinleri kontrol edildi. Localhost mobil arayüz gerçek uzak Auth/DB ile TR/RO ve receiver profili üzerinden geçti. GitHub Pages origin testi CHIPS ile gerçek uzak Edge Function'a bağlandı; cookie partitionKey üst siteye bağlı, HttpOnly/Secure ve logout temizliği doğrulandı. Strict modun aynı bağlantıda başarısız olduğu ayrı olumsuz testle gösterildi.

`TESTADMIN` yalnız bu projede super_admin olarak oluşturuldu; 24 saat geçici şifre ve ilk girişte zorunlu değişim var. Geçici şifre kullanıcıya açık Git veya sohbet üzerinden verilmez; repo dışındaki özel dosyada kalır. Stok/personel yönetimi/lokasyon/fiyat API'leri henüz yoktur.

## Yayın sonrası son kontrol

11 Ekim: gh-pages 374a081 dağıtımı built olarak doğrulandı. ROMWAY_TEST_PUBLISHED=true ile HTML/config/app için route override olmadan gerçek yayın dosyaları mobil Chrome'da test edildi: giriş, partitioned HttpOnly cookie, yenileme ve çıkış geçti. Sadece harici font istekleri testte boş CSS ile izole edilir. Codex tarayıcısında Test ortamı etiketi ve etkin sicil/şifre formu görüldü. TESTADMIN şifresi değiştirilmedi; bu hesabı kullanıcı ilk girişte değiştirecek.

## Personel yönetimi — 11 Ekim açık onay

Kullanıcı PR #4 kapsamındaki yeni personel şeması ve Edge dağıtımını yalnız bu test projesi için onayladı. `scripts/deploy-test-personnel.mjs` exact project opt-in ve eski şema/hesap sayılarını kontrol eder; zaten uygulanmış migration'ı tekrar çalıştırmaz. Yeni geçici test hesapları `scripts/test-cloud-personnel.mjs` tarafından IT_P_ prefix ve koşuya özgü rastgele kimliklerle açılır; sonunda yalnız bu hesaplar pasifleştirilir. Kayıt veya proje silinmez. TESTADMIN yeni şifresi testlerde okunmaz veya değiştirilmez. Yayın sonrası `ROMWAY_TEST_PUBLISHED=true` gerçek Pages dosyalarını yönlendirmesiz doğrular.
