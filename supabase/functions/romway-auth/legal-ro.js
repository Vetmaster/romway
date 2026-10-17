export default {
  "version": "2026-10-17",
  "status": "draft",
  "missingFields": [
    "Înlocuirea denumirii și adresei fictive cu datele organizației reale",
    "Înlocuirea adresei de test cu un canal funcțional al organizației",
    "Temeiuri juridice pe operațiuni și procedura drepturilor",
    "Calendarul păstrării și ștergerii pe categorii",
    "Destinatarii, regiunile de găzduire și transferurile"
  ],
  "documents": [
    {
      "id": "notice",
      "title": "Proiect de informare privind datele personalului",
      "summary": "Datele personalului utilizate în Solea și cadrul informării.",
      "sections": [
        {
          "heading": "Operator și contact",
          "paragraphs": [
            "DATE DE ORGANIZAȚIE PENTRU TEST — Toate sunt fictive; nu identifică o entitate juridică reală sau un canal funcțional de contact.",
            "Denumire: Solea Test Lojistik Ltd. Şti. (fictivă).",
            "Adresă: Test Mahallesi, Örnek Sokak No: 0, Test Şehri (adresă fictivă).",
            "Contact pentru cereri: veri.basvuru@solea.example.invalid (doar test; nu primește e-mailuri).",
            "Aceste date servesc exclusiv evaluării ecranului de test. Înainte de utilizarea reală, denumirea juridică, adresa și un canal funcțional de contact al operatorului vor fi verificate și înlocuite."
          ]
        },
        {
          "heading": "Date și scopuri",
          "paragraphs": [
            "Modulul existent folosește numele, numărul de personal, rolul, locația de apartenență, starea contului și informații de securitate și administrare. Scopul este gestionarea accesului intern, a permisiunilor și a siguranței înregistrărilor. Autentificarea nu solicită e-mail utilizatorului."
          ]
        },
        {
          "heading": "Informații de completat",
          "paragraphs": [
            "Operatorul va stabili temeiurile juridice asociate datelor, destinatarii, perioadele de păstrare și procedura exercitării drepturilor aplicabile KVKK/GDPR. Acest proiect nu reprezintă o informare deja comunicată angajaților sau o dovadă de consimțământ."
          ]
        }
      ]
    },
    {
      "id": "privacy",
      "title": "Confidențialitate și acces",
      "summary": "Limitele accesului la datele personalului și depozitelor.",
      "sections": [
        {
          "heading": "Utilizare autorizată",
          "paragraphs": [
            "Super administratorul gestionează personalul. Administratorul gestionează doar personalul de achiziții și transport din domeniul său de locații. Personalul de transport nu primește acces la prețuri. Accesul la această pagină este limitat pe server la super administrator."
          ]
        },
        {
          "heading": "Securitatea contului",
          "paragraphs": [
            "Conturile folosesc numărul de personal și parola; parola temporară trebuie schimbată la prima autentificare. Parola temporară este afișată administratorului o singură dată. Parolele și secretele sesiunii nu trebuie introduse în cod, stocarea browserului sau jurnalele aplicației."
          ]
        },
        {
          "heading": "Dezactivare și păstrare",
          "paragraphs": [
            "Dezactivarea blochează utilizarea contului și invalidează sesiunile, fără ștergerea istoricului. Procedurile de păstrare, ștergere/anonimizare și soluționare a cererilor vor fi stabilite separat; aplicația nu are în prezent un flux automat de ștergere."
          ]
        }
      ]
    },
    {
      "id": "usage",
      "title": "Reguli de utilizare internă",
      "summary": "Cadrul utilizării pentru depozite, personal și transport.",
      "sections": [
        {
          "heading": "Cont și permisiuni",
          "paragraphs": [
            "Fiecare persoană își folosește propriul cont; conturile și parolele nu se partajează. Modificările permisiunilor sunt realizate de un administrator autorizat. Locația de apartenență este o informație administrativă, distinctă de domeniul operațiunilor de transport."
          ]
        },
        {
          "heading": "Înregistrarea operațiunilor",
          "paragraphs": [
            "Datele despre produse, expedieri și recepții trebuie introduse corect. Corectarea înregistrărilor trebuie proiectată ca proces autorizat și trasabil, fără ascunderea istoricului. Acest text nu este un contract de vânzare, înscriere sau abonament."
          ]
        },
        {
          "heading": "Stadiul dezvoltării",
          "paragraphs": [
            "Gestionarea personalului și locațiilor este disponibilă. Stocurile și înregistrările reale de expediere nu sunt încă finalizate; proiectul nu garantează disponibilitatea acestor operațiuni sau un nivel de serviciu."
          ]
        }
      ]
    },
    {
      "id": "storage",
      "title": "Cookie-uri și stocarea browserului",
      "summary": "Sesiunea curentă, preferința de limbă și resursele externe.",
      "sections": [
        {
          "heading": "Sesiune și preferință",
          "paragraphs": [
            "Sesiunea folosește cookie-ul __Host-romway_session cu atributele Secure, HttpOnly și Partitioned. Durata maximă este de opt ore; serverul o poate invalida mai devreme. Limba este salvată în localStorage sub cheia romway.language."
          ]
        },
        {
          "heading": "Infrastructură și cereri externe",
          "paragraphs": [
            "Aplicația statică este găzduită pe GitHub Pages; autentificarea, baza de date și operațiunile server sunt pe Supabase. Fonturile generează cereri de rețea către Google Fonts. Condițiile furnizorilor, localizarea datelor și transferurile trebuie verificate separat de organizație."
          ]
        },
        {
          "heading": "Domeniul actual",
          "paragraphs": [
            "Codul web inspectat nu conține integrare de publicitate sau analiză de trafic. Pagina nu creează cookie-uri noi, urmărire, GPS sau înregistrări de acceptare ori consimțământ. Textul trebuie revizuit dacă infrastructura se schimbă."
          ]
        }
      ]
    },
    {
      "id": "operations",
      "title": "Înregistrări operaționale și deplasări",
      "summary": "Diferența dintre operațiunile de transport și poziția fizică.",
      "sections": [
        {
          "heading": "Înregistrări planificate",
          "paragraphs": [
            "După dezvoltarea expedierilor vor fi înregistrate depozitele sursă/destinație, persoana care efectuează operațiunea și momentele plecării, tranzitului și recepției. Datele despre vehicule/utilaje, departamente și utilizarea pieselor vor fi tratate numai în măsura necesară fluxului."
          ]
        },
        {
          "heading": "Ultima locație cunoscută",
          "paragraphs": [
            "Locația personalului de transport va fi dedusă din expedieri și recepții. Nu reprezintă urmărire GPS în timp real, iar depozitul de apartenență nu este automat locația actuală. Datele reale despre deplasări nu sunt încă conectate."
          ]
        },
        {
          "heading": "Responsabilitate și comunicare",
          "paragraphs": [
            "Accesul, scopurile și păstrarea înregistrărilor operaționale vor fi incluse în informarea personalului. Comunicarea către furnizori, transportatori sau alți destinatari va fi definită după fluxurile reale; nu este presupusă o comunicare automată."
          ]
        }
      ]
    },
    {
      "id": "requests",
      "title": "Cereri privind datele și închiderea contului",
      "summary": "Pregătirea cererilor de acces, rectificare și a altor solicitări.",
      "sections": [
        {
          "heading": "Canal de contact",
          "paragraphs": [
            "Canal de test pentru cereri: veri.basvuru@solea.example.invalid. Această adresă fictivă nu primește mesaje; ecranul nu trimite cereri. Înainte de utilizarea reală se vor defini canalul funcțional al organizației și procedura cererilor."
          ]
        },
        {
          "heading": "Conținutul cererii",
          "paragraphs": [
            "Se solicită date necesare precum numele, numărul de personal și descrierea cererii. Accesul, rectificarea și alte drepturi aplicabile se evaluează după verificarea identității și condițiile juridice relevante; se cer numai informații suplimentare necesare."
          ]
        },
        {
          "heading": "Închidere și istoric",
          "paragraphs": [
            "Dezactivarea contului nu implică ștergerea tuturor înregistrărilor operaționale sau de audit. Motivele păstrării, termenele de răspuns și pașii de ștergere/anonimizare vor fi precizați în procedura organizației. Ecranul nu efectuează cereri sau ștergeri."
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
