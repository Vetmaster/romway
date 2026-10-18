# Sevkiyat — küçük geliştirme aşamaları

18 Ekim 2026. Ana referans Romway planıdır; bu belge kapsamı tamamlanmış olarak genişletmez.

## 1. Sevkiyat taslağı (bu PR)
Kaynak depo, hedef depo, aktif nakliye personeli ve isteğe bağlı açıklama kaydedilir. Durum yalnız `draft` olabilir. Liste yetki kapsamındaki son 100 taslağı yeniden eskiye gösterir. TR/RO, menü/dashboard/mobil sekme, hash ile yenileme ve hata sonrası aynı istekle tekrar deneme bulunur. Sipariş, ürün, miktar, parti/seri ve QR eklenmemiştir; taslak stok hareketi veya personel konum kaydı oluşturmaz. Bu sürümde taslak düzenleme/silme yoktur.

- Super admin: tüm taslaklar ve depolar.
- Admin/purchasing: kendi bağlı kaynak deposundan taslak; hedef başka depo olabilir. Liste kaynak veya hedefi yetkili deposu olan taslakları gösterir.
- Receiver: bağlı deposundan bağımsız her kaynak/hedef; yalnız kendisini nakliye personeli seçer. Kendisinin oluşturduğu veya kendisine atanan taslakları görür. Diğer personelin adları topluca verilmez; fiyatlar hiçbir yanıtta yoktur.
- Rol önizlemesi bu aşamada gerçek sevkiyat verisi okumaz ve taslak oluşturamaz; ekranda salt okunur açıklama vardır.

RPC her istekte aktif oturum/ilk şifre değişimi/rol/kaynak depo/aktif taşıyıcı kontrolü yapar. Tablo RLS ile kapalı; RPC yalnız service_role için çalışır. Aynı oluşturucunun aynı request_id ve aynı içeriği tek kayıt döndürür; farklı içerikle tekrar kullanım conflict olur. Gönderim ve teslim alma endpoint'i yoktur. Beklenmeyen ağ hatasında form ve request_id korunur; kullanıcı açıkça formu temizlerse yeni istek başlar.

## 2. Stok/ürün bağımlılığı (yapılacak)
Ürün, miktar, parti/seri ve QR kayıtları; depo kullanılabilir stokları ve maliyet koruma/FIFO kuralları sunucuda uygulanır. Taslak satırları stok kimliklerine bağlanır; serbest metin ürün adıyla sahte stok yaratılmaz.

## 3. Gönderim (yapılacak)
Satın alma personeli admin onayı olmadan sevkiyatı gönderebilir. Yetkili nakliye personelinin tüm depolardaki transfer yetkisi korunur. Ürün/miktar/parti kontrolleri ve kaynak → yolda hareketi tek transaction ile, tekrar güvenli uygulanır. Maliyet değişmez; taşıma gideri malzeme maliyetine eklenmez.

## 4. Teslim alma ve personel hareketi (yapılacak)
QR ile hedef kabulü, kısmi/eksik teslim kuralları, yolda → hedef, geçmiş ve son bilinen konum. Konum bağlı depodan türetilmez; GPS iddiası yoktur. Fiyatlar receiver'a verilmez. Gönderim/kabul işlemleri tamamlanmadan bu kayıtlar üretilmez.

## Dağıtım durumu
202610180006 migration ve Edge değişikliği yalnız dosya olarak hazırlandı. Mevcut Supabase'e uygulanmadı; kullanıcı onayı bekler. Pages yeni sunucu hazır olmadan yayınlanmayacak. İzin gelirse yalnız romway-auth-test (ifnjvdjhfhzfxyuorqvz) için `scripts/deploy-test-shipment-drafts.mjs` çalıştırılır; mevcut kayıt özetleri önce/sonra karşılaştırılır. Başka projeye dağıtım yoktur.
