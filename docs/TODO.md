# Küçük aşamalar ve durum — 11 Ekim 2026

## Tamamlanan / doğrulanan
- [x] İki kaynak plan okundu; Romway ana referans, uygun Sasa-F geliştirme kuralları uyarlandı. Gerçek Roboto/Anta font kaynakları doğrulandı.
- [x] Yerel klasör, GitHub deposu, AGENTS/README/plan/durum belgeleri ve ayrı geliştirme dalları/inceleme PR'ları.
- [x] Kullanıcı kararıyla açık repo, yalnız web ağacını sunan gh-pages, HTTPS GitHub Pages ve logo.
- [x] Sicil/şifre girişi, zorunlu ilk şifre değişimi, TR/RO, sade karşılama, çıkış ve HttpOnly opaque oturum.
- [x] Yeni ve ayrı romway-auth-test projesinde gerçek Auth/DB/Edge; signup kapatma, yanlış/kapalı hesap, zorunlu değişim, eski şifre/oturum, RLS/RPC/JWT reddi.
- [x] Gerçek yayın dosyalarıyla Chrome mobil GitHub Pages CHIPS giriş/yenileme/çıkış. Özel domain gerekmiyor; JS token fallback yok.
- [x] TESTADMIN kurulumu. Kullanıcının Codex tarayıcısında TESTADMIN karşılama ekranı görüldü; zorunlu şifre değişimi sonrası giriş doğrulandı. Kullanıcının yeni şifresi okunmadı/değiştirilmedi.
- [x] Personel yönetimi **yerel kodu**: ekleme, rol/lokasyon düzenleme, pasifleştirme/aktifleştirme; super_admin için lokasyon ekleme.
- [x] Kullanıcı onaylı yetki: admin yalnız tüm lokasyonları kendi kapsamında olan purchasing/receiver; yönetici rollerini yalnız super_admin atar.
- [x] Temsili TR/RO lokasyonları yeni migration dosyasında hazırlandı; gerçek depo verisi yok.
- [x] SQL içi oturum/rol/lokasyon kontrolü, RLS/service-only RPC, rezervasyon/aktivasyon, eski oturum iptali ve secretsiz audit; kayıt silinmez.

## Personel aşamasında doğrulanması / uygulanması gereken
- [x] Kullanıcı açık onayıyla yalnız romway-auth-test projesine yeni personel migration/Edge uygulandı; önceki staff/Auth kayıt sayıları korundu.
- [x] Gerçek Supabase Auth/Edge/DB personel ekleme, zorunlu değişim, admin rol/lokasyon sınırları, lokasyon/aktiflik oturum iptali, RPC/JWT reddi ve audit doğrulandı.
- [x] Gerçek Edge/DB ile aynı sicille eşzamanlı iki oluşturma isteği: bir başarılı hesap ve bir conflict.
- [ ] Kısmi Auth oluşturma için operatör kurtarma prosedürü; daha geniş eşzamanlı düzenleme/aktivasyon senaryoları.
- [ ] Doğrulama sonrası yeni ekranı GitHub Pages test önizlemesine yayınla; yayımdaki sürüm şu anda önceki giriş aşamasıdır.
- [ ] Taslak PR'ları incele; otomatik merge yapılmaz.

## Devam eden genel doğrulamalar
- [ ] Kullanıcının kendi telefonunda giriş ve Safari/Firefox hedef sürümleri. Codex tarayıcısı doğrulaması telefon kanıtı değildir.
- [ ] 8 saat oturum / 24 saat geçici şifre / deneme limitlerini üretim politikası olarak kesinleştir.
- [ ] Personel şifre sıfırlama, yarım işlem kurtarma, audit saklama/görüntüleme ve izleme.
- [ ] GitHub workflow yetkisi sonrası docs/ci/checks.yml.example CI şablonunu etkinleştir. Otomatik CI şu anda kurulu değildir.
- [ ] Repo görünürlüğünü ve gerçek kullanım/hosting kararını yeniden değerlendir; test verileriyle gerçek iş verilerini ayır.

## Sonraki küçük aşamalar
1. Personel kurtarma/şifre sıfırlama; gerçek lokasyon adları, araç/makine ve departman tanımları.
2. Ürün kartları, birimler ve kontrollü Excel önizleme; başlangıç stoğu ayrı akış.
3. Alım, parti/seri, QR, EUR vergi/net/toplam ve maliyet testleri.
4. Transfer/yolda, kısmi/hasarlı kabul ve eşzamanlı stok/tekrar güvenliği.
5. Departman/kullanım, iadeler ve gerekçeli düzeltme geçmişi.
6. Yakıt tankları, dolumlar, istasyon alımları ve ölçüm kuralları.
7. Raporlar/tarihler, yedek geri yükleme ve tek depo pilotu.

Yerel Docker kurulumu kullanıcı tercihiyle uygulanmadı; bulut test ortamı kullanıldı. Bildirimler ve çevrimdışı stok kapsam dışıdır. Personel migration ve Edge bu ayrı test projesinde kuruldu; dosya varlığı tek başına başka özelliklerin tamamlandığına kanıt değildir. Yerel test kanıtları ve sınırları INCELEME.md/PERSONNEL.md içindedir.
