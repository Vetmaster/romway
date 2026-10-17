export default {
  "version": "2026-10-17",
  "status": "draft",
  "missingFields": [
    "Veri sorumlusunun resmî unvanı ve adresi",
    "Kurumun başvuru iletişim kanalı",
    "İşlem bazında hukuki sebep ve hak başvuru süreci",
    "Veri kategorileri için saklama/imha takvimi",
    "Alıcılar, barındırma bölgeleri ve aktarım düzeni"
  ],
  "documents": [
    {
      "id": "notice",
      "title": "Personel verileri aydınlatma taslağı",
      "summary": "Solea içinde kullanılan personel verileri ve bilgilendirme kapsamı.",
      "sections": [
        {
          "heading": "Veri sorumlusu ve iletişim",
          "paragraphs": [
            "Solea bir uygulama adıdır; veri sorumlusu olan tüzel kişi henüz doğrulanmadı. Resmî unvan, adres ve başvuru iletişim kanalı tamamlanacak. SASA-F işletmecisinin bilgileri bu metne aktarılmadı."
          ]
        },
        {
          "heading": "Veri ve amaç kapsamı",
          "paragraphs": [
            "Mevcut personel modülü ad soyad, sicil numarası, rol, bağlı lokasyon, aktiflik, hesap ve güvenlik işlem bilgilerini kullanır. Amaç; kurum içi erişimi, personel yetkilerini ve kayıt güvenliğini yönetmektir. Kullanıcıdan giriş için e-posta istenmez."
          ]
        },
        {
          "heading": "Tamamlanması gereken açıklamalar",
          "paragraphs": [
            "Veri kategorileriyle eşleştirilmiş hukuki sebepler, alıcı grupları, saklama süreleri ve uygulanabilir KVKK/GDPR haklarının başvuru yöntemi veri sorumlusu tarafından belirlenecek. Bu taslak çalışanlara sunulmuş bir aydınlatma veya alınmış rıza kaydı değildir."
          ]
        }
      ]
    },
    {
      "id": "privacy",
      "title": "Gizlilik ve erişim",
      "summary": "Personel ve depo bilgilerinin uygulama içindeki erişim sınırları.",
      "sections": [
        {
          "heading": "Yetkili kullanım",
          "paragraphs": [
            "Süper admin personel yönetimine genel erişir. Admin yalnız yetkili lokasyon kapsamındaki satın alma ve nakliye personelini yönetir. Fiyat erişimi nakliye personeline açılmaz. Bu sayfaya erişim sunucuda yalnız süper adminle sınırlandırılır."
          ]
        },
        {
          "heading": "Hesap güvenliği",
          "paragraphs": [
            "Hesaplar sicil ve şifreyle açılır; ilk girişte geçici şifre değiştirilir. Geçici şifre yöneticiye tek seferlik gösterilir. Parola ve oturum sırları kaynak koda, tarayıcı depolamasına veya uygulama günlüklerine yazılmamalıdır."
          ]
        },
        {
          "heading": "Pasifleştirme ve saklama",
          "paragraphs": [
            "Pasifleştirme hesabın kullanımını engeller ve oturumlarını geçersiz kılar; geçmiş kayıtları silmez. Saklama, silme/anonimleştirme ve başvuru prosedürleri ayrıca belirlenecek; mevcut uygulamada otomatik veri silme akışı yoktur."
          ]
        }
      ]
    },
    {
      "id": "usage",
      "title": "Kurum içi kullanım esasları",
      "summary": "Depo, personel ve nakliye işlemleri için kullanım çerçevesi.",
      "sections": [
        {
          "heading": "Hesap ve yetki",
          "paragraphs": [
            "Personel kendi hesabını kullanır; ortak hesap ve şifre paylaşımı yapılmaz. Yetki değişiklikleri yetkili yönetici tarafından gerçekleştirilir. Bağlı lokasyon idari bilgidir; nakliye personelinin sevkiyat kapsamıyla karıştırılmaz."
          ]
        },
        {
          "heading": "İşlem kaydı",
          "paragraphs": [
            "Ürün, sevkiyat ve teslim bilgilerinin doğru kaydedilmesi esastır. Yanlış kayıtlarda geçmişi gizleyen silme yerine yetkili ve izlenebilir düzeltme süreci tasarlanır. Bu metin bir satış, üyelik veya abonelik sözleşmesi değildir."
          ]
        },
        {
          "heading": "Mevcut geliştirme durumu",
          "paragraphs": [
            "Personel ve lokasyon yönetimi mevcuttur. Stok ve gerçek sevkiyat kayıtları henüz tamamlanmadı; bu taslak o işlemlerin çalıştığına veya bir hizmet düzeyinin garanti edildiğine dair taahhüt içermez."
          ]
        }
      ]
    },
    {
      "id": "storage",
      "title": "Çerez ve tarayıcı depolaması",
      "summary": "Mevcut oturum, dil tercihi ve dış kaynak kullanımı.",
      "sections": [
        {
          "heading": "Oturum ve tercih",
          "paragraphs": [
            "Giriş oturumu Secure, HttpOnly ve Partitioned özellikli __Host-romway_session çereziyle yürütülür. Süre en fazla sekiz saattir ve sunucu daha erken geçersiz kılabilir. Dil tercihi localStorage içinde romway.language anahtarıyla tutulur."
          ]
        },
        {
          "heading": "Altyapı ve dış istekler",
          "paragraphs": [
            "Statik uygulama GitHub Pages üzerinde; kimlik doğrulama, veritabanı ve sunucu işlemleri Supabase üzerindedir. Yazı tipleri için Google Fonts kaynaklarına ağ isteği gönderilir. Bu sağlayıcıların koşulları, veri konumları ve aktarım düzeni kurum tarafından ayrıca doğrulanacak."
          ]
        },
        {
          "heading": "Mevcut kapsam",
          "paragraphs": [
            "İncelenen web kodunda reklam veya analitik izleme entegrasyonu bulunmuyor. Bu sayfa yeni çerez, izleme, GPS, rıza kutusu veya kabul kaydı oluşturmaz. Altyapı değişirse bu metin gözden geçirilmelidir."
          ]
        }
      ]
    },
    {
      "id": "operations",
      "title": "Operasyon ve hareket kayıtları",
      "summary": "Nakliye hareketleri ile fiziksel konum arasındaki ayrım.",
      "sections": [
        {
          "heading": "Planlanan kayıtlar",
          "paragraphs": [
            "Sevkiyat altyapısı geliştirildiğinde kaynak/hedef depo, işlem yapan personel, çıkış, yolda ve teslim alma zamanları kaydedilecek. Araç/makine, departman ve malzeme kullanım verileri yalnız ilgili iş akışının gerektirdiği ölçüde ele alınacak."
          ]
        },
        {
          "heading": "Son bilinen konum",
          "paragraphs": [
            "Nakliye personelinin son bilinen konumu sevkiyat ve teslim işlemlerinden türetilecek. Bu bilgi canlı GPS takibi değildir ve bağlı depo otomatik olarak mevcut konum sayılmaz. Şu anda gerçek hareket verileri bu bölüme bağlı değildir."
          ]
        },
        {
          "heading": "Sorumluluk ve paylaşım",
          "paragraphs": [
            "Operasyon kayıtlarının erişimi, amacı ve saklama süreleri personel bilgilendirmesine dahil edilecek. Tedarikçi, nakliyeci veya diğer alıcılarla paylaşım gereksinimleri gerçek akışa göre tanımlanacak; otomatik paylaşım varsayılmayacak."
          ]
        }
      ]
    },
    {
      "id": "requests",
      "title": "Veri başvuruları ve hesap kapatma",
      "summary": "Personelin erişim, düzeltme ve diğer veri taleplerinin hazırlanması.",
      "sections": [
        {
          "heading": "Başvuru kanalı",
          "paragraphs": [
            "Kuruma ait resmî başvuru adresi henüz belirlenmedi. Çalışanlara sunulmadan önce kurumun iletişim kanalı ve talep süreci tamamlanacak; SASA-F e-posta adresi kullanılmayacak."
          ]
        },
        {
          "heading": "Talep kapsamı",
          "paragraphs": [
            "Başvuruda ad soyad, sicil ve talebin açıklaması gibi gerekli bilgiler istenir. Erişim/düzeltme ve uygulanabilir diğer haklar, kimlik doğrulama ve ilgili hukuki şartlara göre değerlendirilir; yalnız gerekli ek bilgi istenir."
          ]
        },
        {
          "heading": "Kapatma ve kayıt geçmişi",
          "paragraphs": [
            "Hesabı pasifleştirmek, tüm operasyon veya denetim kayıtlarının silinmesi anlamına gelmez. Uygulanacak saklama gerekçeleri, yanıt süreleri ve silme/anonimleştirme adımları kurumun başvuru prosedüründe netleştirilecek. Bu ekranda başvuru veya silme işlemi yapılmaz."
          ]
        }
      ]
    }
  ],
  "sources": [
    {
      "title": "KVKK — Aydınlatma Yükümlülüğü",
      "url": "https://www.kvkk.gov.tr/Icerik/2033/Aydinlatma-Yukumlulugu-"
    },
    {
      "title": "GDPR — Articles 13–14",
      "url": "https://eur-lex.europa.eu/eli/reg/2016/679/ojv"
    }
  ]
};
