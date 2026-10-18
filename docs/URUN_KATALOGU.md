# Ürün kataloğu — ilk stok aşaması

18 Ekim 2026. İlk aşama yalnız ürün kartı oluşturma ve ortak ürün listesidir. Stok miktarı, fiyat, vergi, garanti/son kullanma, parti/seri ve QR henüz uygulanmaz; ürün kartı oluşturmak stok girişi değildir.

## Veri ve kapsam
- Ürün adı (1–100 karakter), parça kodu (1–80 karakter), birim: adet/takım/litre/kilogram/metre.
- Parça kodu Latin harf/rakam, boşluk, nokta, alt çizgi, tire ve eğik çizgi içerebilir; harf/rakamla başlar. Kod sunucuda büyük harfe çevrilir; yinelenen boşluklar birleştirilir. Ortak katalogda kod tektir.
- İşlem yapılan depo yalnız oluşturma yetkisi ve kayıt kaynağı içindir. Bu depoda stok doğmaz. Super admin tüm depolardan, admin/purchasing yalnız atanmış depolarından ürün kartı oluşturabilir. Tek yetkili depo varsa form otomatik seçer.
- Ürün kartları depolar arası ortak kimliklerdir; admin/purchasing yetkili giriş sonrası ortak kataloğu okuyabilir. Gerçek depo stok/maliyet listesi ileride ayrı kapsam kontrolüne sahip olacaktır. Nakliye rolüne ürün listesi ve oluşturma API/RPC erişimi verilmez.
- Son 200 kart yeniden eskiye alınır; arama bu kartlar içinde, 10’ar gösterimle yapılır. Sunucu arama/sayfalama sonraki ölçek adımıdır. Düzenleme/silme veya Excel içe aktarma bu aşamada yoktur.
- UUID istek kimliğiyle aynı oluşturucunun aynı içeriği tekrar göndermesi tek kaydı döndürür. Başarısız/sonucu bilinmeyen istekte alanlar ve kimlik korunur. Onaylanmış kayıt sonrası yeni form yeni istek kimliği kullanır.

## Güvenlik
Aktif HttpOnly oturum, ilk şifre değişimi ve rol/depo yetkisi Edge ve service-only SQL RPC ile doğrulanır. Products tablosunda RLS açık ve istemci politikası/grant yoktur. Fiyat veya miktar kolonları bulunmaz; istemcinin ilave quantity/price alanları dikkate alınmaz. DOM metinleri textContent ile yazılır; rol önizlemesinde gerçek katalog verisi okunmaz ve kayıt yapılamaz.

## Dağıtım
18 Ekim açık kullanıcı onayıyla 202610180007 migration ve romway-auth Edge v10 ACTIVE yalnız romway-auth-test (ifnjvdjhfhzfxyuorqvz) projesine uygulandı. Dağıtım öncesi/sonrası mevcut personel/lokasyon/sevkiyat taslağı özetleri aynı kaldı. Dağıtılmış endpointte operatör test oturumuyla liste/oluşturma, tekrar güvenliği, normalleştirilmiş kod tekrarı reddi, geçersiz birim, Origin ve oturum kontrolleri geçti. Bir sentetik ürün kartı saklandı; önceki ürünler ve sevkiyatlar değişmedi. Pages v2026.10.18.2 yayını hazırlandı.

## Sonraki adım
Depoya stok girişi: ürün + miktar + parti/seri + EUR vergi dahil alış fiyatı; vergisiz tutar/vergi ayrımı ve garanti/son kullanma. Taşıma gideri maliyete katılmaz. Ardından depo miktar listesi ve ürün seçilebilen gerçek sevkiyat/teslim alma akışı gelir.

## Yerel doğrulama
54 birim/SQL/HTTP testi ve Chromium 390/1440 ürün ekranı, mevcut sevkiyat/personel/rol/yasal ekran kontrolleri geçti. Yeni ürün SQL testleri kod normalizasyonu/benzersizliği, tekrarlama, lokasyon kapsamı, nakliye/ilk şifre/kapalı hesap reddi ve service-only RPC/RLS kontrollerini kapsar. Test projesi dağıtımı ve endpoint kontrolleri yukarıda kayıtlıdır.

- Pages v2026.10.18.2 built ve canlı ürün kataloğu uygulama dosyası yerel doğrulanmış sürümle aynı olarak kontrol edildi. Üç yeni test hesabının gerçek geçici girişleri başarılı; zorunlu şifre değişimi korunuyor.
