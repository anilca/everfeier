# storefront Specification

## Purpose
Müşterinin dönemlik ürün kataloğunu Almanca olarak görmesini, sepet oluşturmasını ve sezonun sipariş takvimini (son sipariş tarihi, sezon kapanışı) açıkça bilmesini sağlar.

## Requirements

### Requirement: Aktif ürünlerin listelenmesi
Vitrin, katalogda aktif olarak işaretli tüm ürünleri ad, görsel, kısa açıklama ve brüt fiyatla Almanca olarak tek bir sayfada göstermelidir (SHALL). Pasif ürünler hiçbir sayfada görünmemelidir (MUST NOT).

#### Scenario: Aktif ürün görünür
- **WHEN** müşteri ana sayfayı açar
- **THEN** katalogdaki her aktif ürün adı, görseli ve "29,90 €" biçiminde fiyatıyla listelenir

#### Scenario: Pasif ürün gizlenir
- **WHEN** bir ürün katalogda pasif olarak işaretlidir
- **THEN** ürün listede görünmez ve doğrudan ürün adresi "nicht gefunden" sayfası döner

### Requirement: Ürün detay görünümü
Vitrin, her aktif ürün için tam açıklamayı, varsa set içeriğini, fiyatı, KDV/kargo notunu ve "In den Warenkorb" butonunu içeren bir detay görünümü sunmalıdır (SHALL).

#### Scenario: Set ürün içeriği
- **WHEN** müşteri "Sensenmann-Set" ürününün detayını açar
- **THEN** setin içerdiği ürünler (kostüm ve tırpan) listelenir

### Requirement: Tedarikçi bilgisinin gizliliği
Vitrin, tedarikçi linklerini, tedarikçi ürün kimliklerini ve alış fiyatlarını müşteriye giden hiçbir HTML, script veya API yanıtında içermemelidir (MUST NOT).

#### Scenario: Sayfa kaynağında tedarikçi bilgisi yok
- **WHEN** ana sayfanın ve bir ürün detay sayfasının HTML ve script çıktısı "temu" kelimesi ve alış fiyatları için taranır
- **THEN** hiçbir eşleşme bulunmaz

### Requirement: Sepet
Vitrin, müşterinin ürün eklemesine, adedi 1 ile 10 arasında değiştirmesine ve ürün çıkarmasına izin veren bir sepet sağlamalıdır (SHALL). Sepet, kalemleri, ara toplamı ve kargo ücretini göstermeli ve aynı tarayıcıda sayfa yenilendiğinde korunmalıdır (SHALL).

#### Scenario: Ürün ekleme ve toplam
- **WHEN** müşteri 2 adet "Hexenhut" ve 1 adet "Zauberer-Umhang" ekler
- **THEN** sepet ara toplamı 54,70 € ve kargo ücretini ayrı satırda gösterir

#### Scenario: Sayfa yenileme
- **WHEN** müşteri sepete ürün ekledikten sonra sayfayı yeniler
- **THEN** sepet içeriği değişmeden görünür

#### Scenario: Tarayıcı depolaması kullanılamıyor
- **WHEN** tarayıcı yerel depolamaya erişimi engeller
- **THEN** sepet oturum boyunca çalışmaya devam eder ve hata gösterilmez

#### Scenario: Pasifleşen ürün sepette
- **WHEN** sepette bulunan bir ürün sonradan pasif yapılmıştır
- **THEN** sepet o kalemi "nicht mehr verfügbar" olarak işaretler ve ödemeye geçişte dahil etmez

### Requirement: Sezon bandı
Vitrin, sipariş açıkken her sayfada, yapılandırılmış son sipariş tarihini Halloween'e kadar teslimat için son tarih olarak bildiren bir bant göstermelidir (SHALL).

#### Scenario: Son tarih bilgisi
- **WHEN** son sipariş tarihi 28.10.2026 olarak yapılandırılmıştır ve müşteri herhangi bir sayfayı açar
- **THEN** sayfanın üstünde "Bestellungen bis 28.10. – Lieferung bis Halloween" anlamında bir bant görünür

### Requirement: Sezon kapanışı
Vitrin, mağaza kapalı olarak yapılandırıldığında veya son sipariş tarihi geçtiğinde sepete ekleme ve ödemeye geçişi devre dışı bırakmalı ve sezonun bittiğini bildirmelidir (SHALL). Sipariş takibi, yasal sayfalar ve cayma işlevi bu durumda da erişilebilir kalmalıdır (SHALL).

#### Scenario: Son tarih geçti
- **WHEN** son sipariş tarihi geçmiştir ve müşteri ana sayfayı açar
- **THEN** ürünler görünür, "In den Warenkorb" butonları devre dışıdır ve "Die Saison ist beendet" mesajı gösterilir

#### Scenario: Kapalıyken takip çalışır
- **WHEN** mağaza kapalıdır ve müşteri sipariş takip sayfasını açar
- **THEN** takip sayfası normal şekilde çalışır
