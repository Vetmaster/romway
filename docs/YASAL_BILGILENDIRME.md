# Solea yasal bilgilendirmeler — süper admin taslağı

17 Ekim 2026. Bu bölüm çalışanlara sunulmuş bir metin, rıza/kabul kaydı veya tamamlanmış hukuki uygunluk beyanı değildir. Kurum bilgileri doğrulanana kadar taslaktır.

## Referans ve uyarlama
SASA-F deposunun `main` dalındaki `LEGAL_DOCUMENTS`, `legalTextsView` ve tek açık disclosure yaklaşımı salt okunur incelendi. Solea'ya öğrenci/veli, aidat, abonelik ve ödeme süreçleri taşınmadı. SASA-F veri sorumlusu, adresi ve e-posta bilgileri kopyalanmadı.

Altı metin: personel verileri aydınlatma taslağı; gizlilik/erişim; kurum içi kullanım; çerez/tarayıcı depolaması; operasyon/hareket kayıtları; veri başvuruları/hesap kapatma. TR ve RO metinleri sunucu tarafında ayrı dosyalardadır.

## Doğrulanacak bilgiler
- Veri sorumlusu tüzel kişinin resmî unvanı ve adresi.
- Kuruma ait başvuru iletişim kanalı.
- Veri/amaç bazında hukuki sebepler ve uygulanabilir hak başvuru süreci.
- Veri kategorileri için saklama ve imha takvimi.
- Alıcılar, barındırma bölgeleri ve uygulanacak aktarım düzeni.

Bu alanlar için varsayımsal şirket bilgisi, kesin süre, ülke veya hukuki dayanak yazılmadı. Personelin bağlı deposu, mevcut konumu olarak varsayılmadı; gerçek sevkiyat modülü tamamlanmış gösterilmedi.

## Erişim ve dağıtım
Menü ve `#legal` yolu yalnız gerçek süper admin oturumunda ve normal rol görünümünde kullanılabilir. `legal-documents` işlemi aynı kuralı sunucuda denetler; eksik/geçersiz oturum 401, diğer roller ve zorunlu şifre değişimi 403 alır. Yanıt `no-store` kullanır. Metinler web paketinde bulunmaz; DOM'a `textContent` ile yazılır. Role/ekrana geçişte içerik temizlenir. Başka bir rolü önizlerken bölüm gizlidir.

Kaynak GitHub deposu herkese açık olduğundan genel taslak kaynakları gizli belge sayılmaz. Buraya sır veya kuruma özel hassas veri eklenmemelidir. Uygulama içi erişim kontrolü bu açık kaynak durumunu değiştirmez.

Veritabanı migration veya yeni tablo gerekmez. 17 Ekim kullanıcı onayıyla Edge güncellemesi yalnız romway-auth-test projesine uygulandı (v7 ACTIVE). Migration uygulanmadı; mevcut kayıt özetleri dağıtım öncesi/sonrası aynı. Pages yayını v2026.10.17.4 olarak hazırlanmıştır. Giriş ekranına veya diğer kullanıcı rollerine yasal onay kutusu eklenmedi.

## Resmî kaynaklar
- [KVKK — Aydınlatma Yükümlülüğü](https://www.kvkk.gov.tr/Icerik/2033/Aydinlatma-Yukumlulugu-)
- [KVKK — Aydınlatma usul ve esasları](https://www.kvkk.gov.tr/Icerik/4132/aydinlatma-yukumlulugunun-yerine-getirilmesinde-uyulacak-usul-ve-esaslar-hakkinda-teblig)
- [GDPR — Articles 13–14, EUR-Lex](https://eur-lex.europa.eu/eli/reg/2016/679/ojv)

## Doğrulama
43 birim/SQL/HTTP testi geçti. Yeni yasal endpoint için rol, ilk şifre değişimi, geçersiz oturum, Origin, dil ve `no-store` kontrolleri kapsandı. Chromium 390/1440 px testinde TR/RO, tek açık metin, sayfa yenileme, rol önizlemesi/rol kaybında içerik temizliği, doğrudan menü/API reddi ve taşma kontrolü geçti. Mevcut personel ekleme penceresi ve rol önizleme tarayıcı regresyonları geçti.
