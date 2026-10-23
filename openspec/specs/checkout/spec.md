# checkout Specification

## Purpose
Sepetin sunucu tarafında doğrulanarak güvenli bir ödeme sayfasına aktarılmasını, yalnızca Almanya'ya teslimat yapılmasını ve başarılı ödemeden sonra müşteriye bir sipariş numarası verilmesini sağlar.

## Requirements

### Requirement: Sunucu tarafı sepet doğrulaması
Sistem, ödemeye geçişte istemciden yalnızca ürün kimlikleri ve adetleri kabul etmeli; ad ve fiyatı sunucudaki katalogdan almalıdır (MUST). Bilinmeyen veya pasif ürün, 1–10 aralığı dışındaki adet veya boş sepet içeren istekleri reddetmelidir (MUST).

#### Scenario: Manipüle edilmiş fiyat
- **WHEN** istemci bir kalem için katalogdan farklı bir fiyat gönderir
- **THEN** gönderilen fiyat yok sayılır ve ödeme sayfasında katalog fiyatı kullanılır

#### Scenario: Geçersiz adet
- **WHEN** istemci bir kalem için 0 veya 11 adet gönderir
- **THEN** istek reddedilir ve ödeme sayfası oluşturulmaz

#### Scenario: Pasif ürün
- **WHEN** istemci pasif bir ürünün kimliğini gönderir
- **THEN** istek reddedilir ve müşteriye ürünün artık mevcut olmadığı bildirilir

### Requirement: Sezon kapalıyken ödeme engeli
Sistem, mağaza kapalıyken veya son sipariş tarihi geçmişken yeni ödeme oturumu oluşturmamalıdır (MUST NOT).

#### Scenario: Kapanıştan sonra istek
- **WHEN** son sipariş tarihi geçtikten sonra ödemeye geçiş isteği gelir
- **THEN** istek "Saison beendet" hatasıyla reddedilir

### Requirement: Ödeme sayfası içeriği
Sistem, müşteriyi Almanca bir ödeme sayfasına yönlendirmeli (SHALL); bu sayfa son onay butonundan önce kalemleri, adetleri, sabit kargo ücretini ve toplam tutarı göstermelidir (SHALL). Ödeme sayfası AGB onayını zorunlu tutmalıdır (MUST).

#### Scenario: Kargo ücreti ödeme sayfasında
- **WHEN** müşteri 14,90 €'luk tek bir ürünle ödemeye geçer
- **THEN** ödeme sayfası 14,90 € ara toplam, 4,90 € kargo ve 19,80 € toplam gösterir

#### Scenario: AGB onayı olmadan
- **WHEN** müşteri AGB onay kutusunu işaretlemeden ödemeyi tamamlamaya çalışır
- **THEN** ödeme tamamlanmaz

### Requirement: Yalnızca Almanya'ya teslimat
Sistem, teslimat adresi olarak yalnızca Almanya'daki adresleri kabul etmelidir (MUST).

#### Scenario: Yurtdışı adres
- **WHEN** müşteri ödeme sayfasında teslimat ülkesi seçer
- **THEN** seçilebilen tek ülke Almanya'dır

### Requirement: Yalnızca anında onaylanan ödeme yöntemleri
Sistem, yalnızca ödeme sırasında anında onaylanan ödeme yöntemlerini sunmalıdır (SHALL); onayı günler sürebilen yöntemler (örneğin SEPA-Lastschrift) sunulmamalıdır (MUST NOT).

#### Scenario: Sunulan yöntemler
- **WHEN** müşteri ödeme sayfasını açar
- **THEN** SEPA-Lastschrift seçeneği listede yer almaz

### Requirement: Sipariş numarası
Sistem, her ödeme oturumu için "EF-" ön ekli, 6 karakterli, karışabilecek karakterleri (0, O, 1, I) içermeyen benzersiz bir sipariş numarası üretmeli (SHALL) ve bu numarayı ödeme makbuzunda görünecek şekilde sipariş açıklamasına eklemelidir (SHALL). Başarıyla ödenen her sipariş "Eingegangen" durumuyla başlamalıdır (SHALL).

#### Scenario: Numara biçimi
- **WHEN** bir ödeme oturumu oluşturulur
- **THEN** sipariş numarası `^EF-[2-9A-HJ-NP-Z]{6}$` biçimine uyar

#### Scenario: Makbuzda numara
- **WHEN** müşteri ödemeyi başarıyla tamamlar
- **THEN** müşteriye giden ödeme makbuzu "Bestellung EF-XXXXXX" metnini içerir

### Requirement: Onay sayfası
Sistem, başarılı ödemeden sonra müşteriye sipariş numarasını, kalemleri, teslimat adresini, sipariş takip sayfasının bağlantısını ve sepetin boşaltıldığını gösteren bir onay sayfası sunmalıdır (SHALL). Ödemesi tamamlanmamış bir oturum için onay sayfası sipariş bilgisi göstermemelidir (MUST NOT).

#### Scenario: Başarılı ödeme sonrası
- **WHEN** müşteri ödemeyi tamamlayıp mağazaya geri yönlendirilir
- **THEN** onay sayfası "EF-XXXXXX" numarasını ve "Bestellung verfolgen" bağlantısını gösterir ve sepet boştur

#### Scenario: İptal edilen ödeme
- **WHEN** müşteri ödeme sayfasından iptal ederek geri döner
- **THEN** sepet içeriği korunur ve sipariş oluşmaz
