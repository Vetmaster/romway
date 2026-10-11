# Küçük aşamalar ve durum

## Tamamlanan / kanıtlanan
- [x] Özel GitHub deposu, yerel proje klasörü, belge dalı ve taslak PR #1.
- [x] İki kaynak plan okundu; Romway ana referans, uygun Sasa-F kuralları uyarlandı.
- [x] Kapsam/AGENTS/README; Sasa-F gerçek Roboto/Anta fontlarının kaynak doğrulaması.
- [x] Yanlış yüklenen Auth dosyası referanslardan çıkarıldı; yeni kod bu dosyadan alınmadı.
- [x] Modüler web prototipi: sicil/şifre, zorunlu değişim, karşılama/çıkış ve ayrı TR/RO dil kaynakları.
- [x] Sunucu işleyicisi, Supabase REST/Auth adaptörü, HttpOnly oturum, ilk şifre değişimi ve fail-closed işlem kilidi.
- [x] Uygulanmamış yeni şema/RLS/service-only RPC migration dosyası.
- [x] Yalnız yeni localhost test projesi için ilk yönetici oluşturma betiği; güvenli rastgele geçici şifre repo dışındaki 0600 dosyaya yazılır.
- [x] JS syntax/web referans/sınırlı secret kontrolleri; 22 Node/PostgreSQL testi geçti.
- [x] Mobil/masaüstü, TR/RO, hatalı giriş, zorunlu değişim, XSS-safe profil, çıkış hatası, bağlantı tekrar deneme ve gerçek HTTP HttpOnly cookie/CORS tarayıcı testleri; API/gerçek Auth sonuçları testlerde simüle edilir.

## Doğrulanması gereken — ilk aşama henüz canlıya hazır değil
- [ ] Yeni yerel Supabase/Docker ortamında migration ve Deno Edge gateway'i çalıştır; mevcut projeye uygulama.
- [ ] Gerçek Supabase Auth ile hesap açma, signin/logout ve şifre değişimini doğrula. PGlite auth.users/roller fixture'ı gerçek Auth değildir.
- [ ] Operatör bootstrap betiğinin gerçek yerel API ile kısmi hata/şifre dosyası/hesap aktivasyonu testleri.
- [ ] Gerçek Auth JWT ile doğrudan tablo/RPC reddi, cookie, hesap kapatma ve eski oturum entegrasyonu.
- [ ] ROMWAY_LOCAL_DEV, signup kapatma ve APP_ORIGIN/HTTPS/CSP ayarlarını gerçek runtime'da kontrol et.
- [ ] Cookie akışı için aynı-site web/API adresi, domain erişimi ve maliyet kararını netleştir; hiçbir ücretli kurulum yapılmadı.
- [ ] 8 saat oturum / 24 saat geçici şifre / deneme limitleri üretim politikası olarak kullanıcıyla netleşsin.
- [ ] Kısmi şifre değişimi için operatör kurtarma, audit/izleme ve saklama politikası; güvenilir ağ/IP limitini tasarla.
- [ ] GitHub bağlantısında workflow yetkisi veya kullanıcı tarafından kurulum sonrası docs/ci/checks.yml.example şablonunu etkinleştir ve PR kontrollerini çalıştır; PR #1 ve bağlı geliştirme PR'ını incele. Otomatik merge yok.

## Sonraki küçük aşamalar
2. Admin personel yönetimi/sıfırlama arayüzü, lokasyon atamaları ve araç/makine tanımları. İlk prototip browser endpoint'i create/reset-staff sunmaz.
3. Ürün kartları, birimler ve Excel önizleme; başlangıç stoğu ayrı akış.
4. Alım, parti/seri, QR, EUR vergi/net/toplam ve maliyet testleri.
5. Transfer/yolda durumu; kısmi/hasarlı kabul; atomiklik ve tekrar/eşzamanlı işlem testleri.
6. Departman/kullanım, iadeler ve admin düzeltme geçmişi.
7. Yakıt tankları, dolumlar, istasyon alımları ve ölçüm kuralları.
8. Raporlar/tarih/düşük stok ekranları, yedek geri yükleme ve tek depo pilotu.

Stok/finans/lokasyon yetkileri, gerçek Supabase kurulumu veya canlı dağıtım tamamlanmış değildir. Bildirimler ve çevrimdışı stok kapsam dışıdır.

## Statik önizleme yayını — 10 Ekim 2026

- [x] Kullanıcı onayıyla açık GitHub deposu ve gh-pages yayını.
- [x] HTTPS canlı sayfa, logo, TR arayüzü ve gerçek girişin kapalı olması doğrulandı.
- [ ] Gerçek Supabase girişini ayrı test ortamında doğrula; canlı cookie/domain uyumunu çöz.
- [ ] Repo görünürlüğünü ve gerçek kullanım için hosting/güvenlik kararını yeniden değerlendir.

## 11 Ekim — gerçek ayrı Supabase test ortamı

- [x] Ücretsiz yeni romway-auth-test oluşturuldu; boş proje doğrulandı, yalnız buraya migration/Edge dağıtıldı.
- [x] Gerçek Auth ile hesap aktivasyonu, kapalı hesap, yanlış şifre, zorunlu değişim, eski şifre/oturum, signup kapatma ve JWT/RPC/özel şema reddi doğrulandı.
- [x] Gerçek DB RLS/SELECT izinleri doğrulandı.
- [x] Gerçek uzak Auth/DB ile localhost mobil TR/RO/cookie/receiver akışı geçti.
- [x] GitHub Pages ile gerçek Edge/Auth/DB CHIPS oturumu Chrome'da doğrulandı; özel domain gerekmiyor.
- [x] TESTADMIN bootstrap; güvenli geçici şifre, zorunlu değişim; gizli dosya repo dışında.
- [ ] Kullanıcının telefonunda giriş/şifre değişimi ve Safari/Firefox hedef sürümleri.
- [ ] Operatör kurtarma/audit ve üretim politika kararları; gerçek iş verisi veya stok sistemi henüz hazır değil.

Önceki yerel Docker maddeleri çalıştırılmadı; kullanıcı bulut ortamını tercih etti. Aynı-site domain maddesi Strict modunun eski varsayımıdır; güncel seçim partitioned cookie'dir. Eski checkbox'lar yeni kanıtların yerine geçmez.
