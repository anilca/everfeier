# Spec Delta: legal-information

## Purpose

Almanya'da tüketicilere çevrimiçi satış için zorunlu bilgilendirmeleri (Impressum, gizlilik, AGB, cayma, fiyat bilgisi) ve § 356a BGB'deki cayma işlevini (Widerrufsbutton) sağlar.

## ADDED Requirements

### Requirement: Zorunlu yasal sayfalar
Sistem, Impressum, Datenschutzerklärung, AGB, Widerrufsbelehrung (Muster-Widerrufsformular dahil) ve Versand & Zahlung sayfalarını sunmalıdır (SHALL). Bu sayfalara her sayfanın altbilgisinden tek tıkla erişilebilmelidir (SHALL).

#### Scenario: Altbilgi bağlantıları
- **WHEN** müşteri herhangi bir sayfanın altbilgisine bakar
- **THEN** Impressum, Datenschutz, AGB, Widerrufsbelehrung, Versand & Zahlung ve "Vertrag widerrufen" bağlantıları görünür

### Requirement: Fiyat bilgilendirmesi
Sistem, fiyat gösterilen her yerde vergi durumuna ilişkin notu ("inkl. MwSt." veya "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet") ve kargo bilgisine bağlantı veren "zzgl. Versandkosten" ibaresini göstermelidir (SHALL). Vergi notu yapılandırmadan seçilmelidir (SHALL).

#### Scenario: Kleinunternehmer modu
- **WHEN** vergi modu Kleinunternehmer olarak yapılandırılmıştır
- **THEN** ürün fiyatlarının yanında § 19 UStG notu ve "zzgl. Versandkosten" bağlantısı görünür

#### Scenario: Normal KDV modu
- **WHEN** vergi modu normal olarak yapılandırılmıştır
- **THEN** ürün fiyatlarının yanında "inkl. 19 % MwSt." ve "zzgl. Versandkosten" bağlantısı görünür

### Requirement: Teslimat süresi bilgisi
Sistem, ürün detayında ve Versand & Zahlung sayfasında tahmini teslimat süresini göstermelidir (SHALL).

#### Scenario: Ürün detayında süre
- **WHEN** müşteri bir ürünün detayını açar
- **THEN** "Lieferzeit: 1–5 Werktage" anlamında bir bilgi görünür

### Requirement: Cayma işlevi (Widerrufsbutton)
Sistem, her sayfadan erişilebilen ve açıkça "Vertrag widerrufen" olarak etiketlenmiş bir cayma işlevi sunmalıdır (SHALL). Bu işlev ad, sipariş numarası ve e-posta alanlarından oluşan bir form ve "Widerruf bestätigen" etiketli bir onay butonu içermelidir (SHALL). İşlev, mağaza kapalıyken de çalışmalıdır (SHALL).

#### Scenario: Cayma beyanı gönderme
- **WHEN** müşteri formu doldurup "Widerruf bestätigen" butonuna basar
- **THEN** ekranda beyanın alındığı bildirilir ve beyanın içeriği ile alınma tarihi-saati gösterilir

### Requirement: Cayma onayının kalıcı veri taşıyıcısında iletilmesi
Sistem, alınan her cayma beyanı için müşterinin girdiği e-posta adresine beyanın içeriğini ve alınma tarihi-saatini içeren bir onay e-postasını gecikmeksizin göndermelidir (MUST). İşletmeciye de bir kopya göndermelidir (SHALL).

#### Scenario: Onay e-postası
- **WHEN** müşteri bir cayma beyanı gönderir
- **THEN** müşteri birkaç dakika içinde beyan içeriğini ve tarih-saati içeren bir e-posta alır ve işletmeciye bir kopya gider

### Requirement: Cayma beyanının siparişle ilişkilendirilmesi
Sistem, cayma beyanındaki sipariş numarası ve e-posta bir siparişle eşleşiyorsa o siparişi admin alanında cayma bildirildi olarak işaretlemelidir (SHALL). Eşleşme yoksa beyanı reddetmemeli, yine onay e-postası göndermeli ve işletmeciye eşleşmeyen beyan olarak iletmelidir (MUST).

#### Scenario: Eşleşen sipariş
- **WHEN** müşteri doğru sipariş numarası ve e-postayla cayma beyanı gönderir
- **THEN** sipariş admin listesinde cayma işaretiyle görünür

#### Scenario: Eşleşmeyen bilgiler
- **WHEN** müşteri hatalı bir sipariş numarasıyla cayma beyanı gönderir
- **THEN** müşteri yine onay e-postası alır ve işletmeciye giden kopya "nicht zugeordnet" olarak işaretlenir

### Requirement: İzleme yapılmaması
Sistem, müşteri sayfalarında analitik, reklam veya başka üçüncü taraf izleme script'leri ve çerezleri kullanmamalıdır (MUST NOT).

#### Scenario: Üçüncü taraf istekleri
- **WHEN** ana sayfa yüklenir ve ağ istekleri incelenir
- **THEN** mağazanın kendi alan adı dışında hiçbir izleme veya analitik isteği yapılmaz
