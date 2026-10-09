# Küçük aşamalar ve durum

## Tamamlanan / doğrulanan
- [x] Özel GitHub deposu oluşturuldu; yerel klasör ve geliştirme dalı bağlandı.
- [x] İki kaynak plan ve ilk incelemede bulunan Auth/personel taslağı okundu; kaynak MD dosyaları korundu.
- [x] Kesin kapsam, AGENTS ve README hazırlandı.
- [x] Sasa-F gerçek fontları kaynak koddan doğrulandı.
- [x] Eksik altyapı ve Auth taslağının açık güvenlik konuları kaydedildi.

## Doğrulanması gereken
- [x] SASA-F_PROJECT_PLAN.md okundu; uygun geliştirme/test/dokümantasyon kuralları işlendi.
- [ ] Son kontrolde klasörde bulunmayan Auth taslağının tekrar temini veya giriş kodunun hazırlanması.
- [ ] Mevcut Supabase projesi varsa yalnız okuma ile kaynak/şema/ayar envanterini çıkar; dağıtım yapma.
- [ ] Auth taslağının şema/RLS/RPC bağımlılıklarını ve kısmi hata/oturum iptali davranışını test ortamında doğrula.
- [ ] Geçici şifre süresi, oturum süresi, admin bootstrap ve sıfırlama/hata kurtarma kurallarını kesinleştir.

## Yapılacaklar — ilk geliştirme aşaması
### 1A — Sunucu güvenlik tasarımı ve yerel prototip
- [ ] Şema, rol/lokasyon/fiyat politikaları ve deneme sınırı için migration dosyaları hazırla; mevcut Supabase'e uygulama.
- [ ] İncelenen taslak tekrar temin edilirse koruyarak modülerleştir; aksi halde aynı gereksinimler için güvenli sunucu kodu hazırla; aynı geçici şifreyi yeni şifre kabul etme açığını düzelt; veri silmeyen telafi ve eşzamanlı işlem düzeni hazırla.
- [ ] Sicil→iç Auth kimliği, kapalı hesap, yanlış şifre, sınır, geçici süre ve şifre değişimini sentetik test ortamında doğrula.
- [ ] Geçici şifre/iptal edilmiş oturumla doğrudan API/RLS erişiminin reddini test et.

### 1B — Sade web arayüzü
- [ ] Ayrı statik yayın dizini, HTML/CSS ve modüler JavaScript oluştur.
- [ ] Ayrı TR/RO metin dosyaları ve dil seçimi; giriş, şifre değişimi, sade karşılama ve çıkış ekranları.
- [ ] Oturumu uygulama yönetsin; elle token girişi veya sahte başarılı giriş ekleme.
- [ ] Ağ kesintisi, bekleme/hata durumları ve boş yapılandırma davranışları; klavye/mobil/kontrast kontrolü.

### 1C — Kabul ve inceleme
- [ ] Giriş→zorunlu değişim→yeniden giriş→karşılama→çıkış; TR/RO ve telefon/masaüstü testi.
- [ ] İlgili otomatik testler, güvenlik ve secret kontrolleri; kurulum kılavuzunu güncelle.
- [ ] Küçük PR hazırla; otomatik birleştirme yok. Canlıya dağıtım ayrı kullanıcı yetkilendirmesi gerektirir.

## Sonraki aşamalar — ilk aşamaya dahil değil
2. Personel yönetimi, lokasyonlar ve araç/makine tanımları; rol sınırları ve güvenli geçici şifre teslimi.
3. Ürün kartları, birimler, kontrollü Excel önizleme; başlangıç stoğu ayrı akış.
4. Alım, parti/seri, QR kimlikleri, EUR vergi/net/toplam ve maliyet testleri.
5. Transfer ve yolda durumu; tam/kısmi/hasarlı kabul, tekrar/eşzamanlı işlem testleri.
6. Departman/kullanım, iadeler ve admin düzeltme geçmişi.
7. Tanklar, dolumlar, istasyon alımları ve ölçüm kuralları.
8. Raporlar, tarih/düşük stok ekranları, yedek geri yükleme ve tek depo pilotu.

Hiçbir sonraki aşama tamamlanmış değildir. Bildirimler ve çevrimdışı stok kapsam dışıdır.
