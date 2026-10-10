# Romway

Türkiye ve Romanya depoları arasında malzemenin alım, transfer, teslim ve araç/makinede kullanım geçmişini izleyen web uygulaması.

## Mevcut durum
İlk giriş aşamasının yerel prototipi hazır: sicil/şifre, zorunlu şifre değişimi, TR/RO dil seçimi, karşılama ve çıkış ekranları; Supabase Edge Function sunucu kodu ve uygulanmamış migration dosyası. Gerçek Supabase/Auth bağlantısı ve canlı dağıtım henüz yok. Varsayılan ekran yapılandırma eksikliğini gösterir; gerçek giriş yapılıyormuş gibi davranmaz.

Referanslar yalnız iki kaynak MD planıdır. Yanlışlıkla eklenen eski Auth dosyası kullanılmadı.

- [Ana kapsam](docs/Romway_Proje_Plani.md)
- [Geliştirme kuralları](AGENTS.md)
- [Giriş mimarisi, yerel test ve kurulum](docs/AUTH.md)
- [Aşamalar](docs/TODO.md)
- [Doğrulama ve eksikler](docs/INCELEME.md)

## Yerel önizleme ve test
Node 22+:

```sh
npm ci --ignore-scripts
npm run check
npm test
npm run dev
```

Ekran: http://localhost:8000. `web/js/config.js` içindeki authEndpoint varsayılan olarak boş; bu durumda giriş devre dışıdır. Şifre/anahtar/token eklemeyin. Yerel Supabase bağlantısı ayrı test ortamında [AUTH.md](docs/AUTH.md) üzerinden hazırlanır.

Tarayıcı testleri için Chromium kurulduktan sonra `npm run test:browser`. Node, PGlite ve Playwright yalnız geliştirme/test araçlarıdır; üretim uygulaması sade HTML/CSS/JavaScript ve Supabase Deno kodudur. Node sunucu veya PGlite veritabanı üretime eklenmez. Tam test komutları AUTH.md içindedir.

## Kaynak kod ve yayın
Özel GitHub deposu: Vetmaster/romway. İlk belgeler PR #1'de; bu aşama `feature/auth-foundation` dalında ve belge dalını temel alır. PR'lar otomatik birleştirilmez. Cloudflare Pages yalnız `web/` dizinini yayınlayacak; docs/scripts/supabase dosyaları statik yayına dahil edilmez.

Supabase migration ve function kodu **mevcut projeye uygulanmadı**. `supabase/config.toml` yalnız yeni yerel test projesinin yapılandırmasıdır. Browser JWT yerine HttpOnly cookie; API ve web için canlı aynı-site adres kararı açık, varsayılan pages.dev/supabase.co giriş uyumu tamamlanmış değil. Hiçbir Cloudflare/DNS veya ücretli servis kurulmadı.

Tipografi Sasa-F kaynaklarından doğrulandı: gövde Roboto (400/500/700/900), marka Anta. Palet: mavi #065788, kırmızı #DB202D, zeytin #697000, sarı #FFE500 ve beyaz.

GitHub CI şablonu `docs/ci/checks.yml.example` içinde hazır. Mevcut GitHub bağlantısının workflow scope izni yok; şablon henüz aktif bir workflow değildir. Yerel kontroller çalıştırıldı.
