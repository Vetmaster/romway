# Romway

Türkiye ve Romanya depoları arasında malzemenin alım, transfer, teslim ve araç/makinede kullanım geçmişini izleyen web uygulaması.

## Mevcut durum
Depo başlangıç aşamasındadır. Kaynaklar yalnız `Romway_Proje_Plani.md` ve `SASA-F_PROJECT_PLAN.md` dosyalarıdır. Çalışır web arayüzü, giriş kodu, Supabase şeması/RLS ve uçtan uca giriş testleri henüz yoktur. Yanlışlıkla eklenen `.ts` dosyası kullanıcı açıklamasıyla proje referanslarından çıkarılmıştır.

- Ana kapsam: [docs/Romway_Proje_Plani.md](docs/Romway_Proje_Plani.md)
- Kurallar: [AGENTS.md](AGENTS.md)
- Aşamalar: [docs/TODO.md](docs/TODO.md)
- Kanıtlar ve eksikler: [docs/INCELEME.md](docs/INCELEME.md)

## Altyapı ve kurulum
Kaynak kod özel `Vetmaster/romway` GitHub deposunda tutulur. Web HTML/CSS/modüler JavaScript ile Cloudflare Pages'te, veri ve güvenilir işlemler Supabase'de çalışacaktır. Cloudflare projesi ve Supabase bağlantısı doğrulanmamıştır; mevcut bir projeye bağlanıldığı varsayılmaz.

Şu an çalıştırılabilir uygulama yoktur. İlk aşamada statik web dosyaları ayrı yayın dizininde hazırlanacak; yalnız bu dizin Cloudflare Pages çıktısı olacak. Planlar ve sunucu taslağı statik yayına dahil edilmeyecek. Web dosyaları hazır olduğunda yerel statik sunucu komutu ve deneme adresi burada belgelenecek.

Giriş altyapısı proje planındaki gereksinimlere göre hazırlanacaktır. service_role yalnız güvenilir sunucu ortamında tutulur; kaynak koda veya tarayıcıya konmaz. Oturum tokenları uygulama tarafından yönetilir, kullanıcıdan elle istenmez. Auth ayarları, RLS, oturum iptali, ilk yönetici oluşturma ve hata kurtarma ayrı test ortamında doğrulanacaktır.

## Geliştirme ve inceleme
`agent/romway-foundation` başlangıç geliştirme dalıdır. Değişiklikler PR ile incelenir; otomatik birleştirme ve canlı dağıtım yoktur. Mevcut dosya/veri/Supabase projesi silinmez. İlgili test komutları çalışır uygulama ve test ortamı hazırlandığında eklenir; bu aşamada işlev testleri geçmiş gibi raporlanmaz.

Tipografi Sasa-F kaynaklarından doğrulandı: gövde Roboto (400/500/700/900), marka Anta. Palet: mavi `#065788`, kırmızı `#DB202D`, zeytin `#697000`, sarı `#FFE500`, beyaz. Kullanım ve kontrast arayüz aşamasında test edilecek.
