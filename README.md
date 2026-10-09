# Romway

Türkiye ve Romanya depoları arasında malzemenin alım, transfer, teslim ve araç/makinede kullanım geçmişini izleyen web uygulaması.

## Mevcut durum
Depo başlangıç aşamasındadır. İki kaynak proje planı vardır. İlk incelemede okunan `Romway_Auth_Personel_v4.ts` taslağı son dosya kontrolünde artık klasörde bulunmuyor; çalışır web arayüzü, Supabase şeması/RLS, kurulum ve uçtan uca giriş testleri henüz yoktur. İncelenen taslak üretime hazır veya dağıtılmış kabul edilmez.

- Ana kapsam: [docs/Romway_Proje_Plani.md](docs/Romway_Proje_Plani.md)
- Kurallar: [AGENTS.md](AGENTS.md)
- Aşamalar: [docs/TODO.md](docs/TODO.md)
- Kanıtlar ve eksikler: [docs/INCELEME.md](docs/INCELEME.md)

## Altyapı ve kurulum
Kaynak kod özel `Vetmaster/romway` GitHub deposunda tutulur. Web HTML/CSS/modüler JavaScript ile Cloudflare Pages'te, veri ve güvenilir işlemler Supabase'de çalışacaktır. Cloudflare projesi ve Supabase bağlantısı doğrulanmamıştır; mevcut bir projeye bağlanıldığı varsayılmaz.

Şu an çalıştırılabilir uygulama yoktur. İlk aşamada statik web dosyaları ayrı yayın dizininde hazırlanacak; yalnız bu dizin Cloudflare Pages çıktısı olacak. Planlar ve sunucu taslağı statik yayına dahil edilmeyecek. Web dosyaları hazır olduğunda yerel statik sunucu komutu ve deneme adresi burada belgelenecek.

İlk incelemede okunan sunucu taslağı Deno ve Supabase JS kullanıyordu. Aşağıdaki bilgiler taslağın inceleme kaydıdır; mevcut çalıştırılabilir dosyalar değildir. `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` ve `APP_ORIGIN` değişkenlerini bekliyor. Bunlar için değer kopyalamayın; bu aşamada Supabase kurulumu/dağıtımı yapılmaz. service_role yalnız güvenilir sunucu ortamında tutulur. Gelecekte tarayıcı yapılandırmasına yalnız proje adresi ve açık publishable/anon anahtar konabilir; güvenlik sunucu izinleriyle sağlanır. Oturum tokenları uygulama tarafından yönetilir, kullanıcıdan elle istenmez.

Taslağın beklediği `staff`, `staff_locations`, `locations` tabloları ve `consume_auth_attempt` RPC'si için şema dosyaları yoktur. Auth ayarları, RLS, oturum iptali, ilk yönetici oluşturma ve kısmi hata kurtarma doğrulanmadan taslağı çalıştırmayın.

## Geliştirme ve inceleme
`agent/romway-foundation` başlangıç geliştirme dalıdır. Değişiklikler PR ile incelenir; otomatik birleştirme ve canlı dağıtım yoktur. Mevcut dosya/veri/Supabase projesi silinmez. İlgili test komutları çalışır uygulama ve test ortamı hazırlandığında eklenir; bu aşamada işlev testleri geçmiş gibi raporlanmaz.

Tipografi Sasa-F kaynaklarından doğrulandı: gövde Roboto (400/500/700/900), marka Anta. Palet: mavi `#065788`, kırmızı `#DB202D`, zeytin `#697000`, sarı `#FFE500`, beyaz. Kullanım ve kontrast arayüz aşamasında test edilecek.
