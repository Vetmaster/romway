# Romway

Türkiye ve Romanya depoları arasında malzemenin alım, transfer, teslim ve araç/makinede kullanım geçmişini izleyen web uygulaması.

## Mevcut durum
İlk giriş aşamasının yerel prototipi hazır: sicil/şifre, zorunlu şifre değişimi, TR/RO dil seçimi, karşılama ve çıkış ekranları; Supabase Edge Function sunucu kodu ve migration dosyası. Statik önizleme GitHub Pages üzerinde yayında. 11 Ekim kullanıcı onayıyla ayrı Supabase test projesi kuruldu; GitHub Pages test girişi bu projeye bağlanır; gerçek iş verisi kullanılmaz. Varsayılan ekran yapılandırma eksikliğini gösterir; gerçek giriş yapılıyormuş gibi davranmaz.

Referanslar yalnız iki kaynak MD planıdır. Yanlışlıkla eklenen eski Auth dosyası kullanılmadı.

- [Ana kapsam](docs/Romway_Proje_Plani.md)
- [Geliştirme kuralları](AGENTS.md)
- [Giriş mimarisi, yerel test ve kurulum](docs/AUTH.md)
- [Ayrı Supabase test ortamı](docs/TEST_ENVIRONMENT.md)
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

Ekran: http://localhost:8000. `web/js/config.js` localhost üzerinde endpoint boş bırakır; giriş devre dışıdır. Yayındaki GitHub Pages adresinde yalnız ayrı test projesi endpoint'i kullanılır. Şifre/anahtar/token eklemeyin. Yerel Supabase bağlantısı ayrı test ortamında [AUTH.md](docs/AUTH.md) üzerinden hazırlanır.

Tarayıcı testleri için Chromium kurulduktan sonra `npm run test:browser`. Node, PGlite ve Playwright yalnız geliştirme/test araçlarıdır; üretim uygulaması sade HTML/CSS/JavaScript ve Supabase Deno kodudur. Node sunucu veya PGlite veritabanı üretime eklenmez. Tam test komutları AUTH.md içindedir.

## Kaynak kod ve yayın
Herkese açık GitHub deposu: Vetmaster/romway (10 Ekim 2026 kullanıcı onayı). İlk belgeler PR #1'de; gerçek Auth entegrasyonu PR #3/`feature/auth-integration` dalında, PR #2/`feature/auth-foundation` dalını temel alır. PR'lar otomatik birleştirilmez. GitHub Pages yalnız `web/` çıktısını `gh-pages` dalından yayınlayacak; docs/scripts/supabase dosyaları statik yayına dahil edilmez.

Supabase migration ve function kodu **Sasa Futbol/Vetamerikan-shift projelerine uygulanmadı**; yalnız yeni `romway-auth-test` ortamına kuruldu. `supabase/config.toml` yalnız yeni yerel test projesinin yapılandırmasıdır. Browser JWT yerine HttpOnly cookie kullanılır. GitHub Pages/supabase.co için partitioned CHIPS oturumu gerçek Chrome testinde doğrulandı; JS token fallback yoktur. Eski tarayıcı/cihazlar pilot öncesi ayrıca denenmeli. Cloudflare eklenmeyecek; DNS veya ücretli servis kurulmadı.

Tipografi Sasa-F kaynaklarından doğrulandı: gövde Roboto (400/500/700/900), marka Anta. Palet: mavi #065788, kırmızı #DB202D, zeytin #697000, sarı #FFE500 ve beyaz.

GitHub CI şablonu `docs/ci/checks.yml.example` içinde hazır. Mevcut GitHub bağlantısının workflow scope izni yok; şablon henüz aktif bir workflow değildir. Yerel kontroller çalıştırıldı.

Telefon önizlemesi için aynı Wi-Fi ağında Mac’in özel ağ IP adresiyle `ROMWAY_PREVIEW_HOST=192.168.x.x npm run dev` başlatılabilir. Telefonda `http://192.168.x.x:8000` açılır. Varsayılan sunucu yalnız localhost kullanır; LAN modu yalnız web/ dosyalarını sunar.

10 Ekim kararı: GitHub Pages önizlemesi. Yayın adımları ve sınırlar [PAGES.md](docs/PAGES.md) içinde.
