# order-tracking Specification

## Purpose
Müşterinin üyelik olmadan, sipariş numarası ve e-posta adresiyle siparişinin güncel durumunu ve kargo bilgisini görmesini sağlar.

## Requirements

### Requirement: Sipariş sorgulama
Sistem, sipariş numarası ve e-posta adresiyle sorgulama yapılan bir takip sayfası sunmalıdır (SHALL). E-posta karşılaştırması büyük/küçük harf ve baştaki/sondaki boşluklara duyarsız olmalıdır (SHALL). Sipariş numarası büyük/küçük harf duyarsız kabul edilmelidir (SHALL).

#### Scenario: Doğru bilgilerle sorgu
- **WHEN** müşteri "ef-7k3qxm" ve siparişteki e-postayı büyük harflerle girer
- **THEN** EF-7K3QXM siparişinin bilgileri gösterilir

### Requirement: Gösterilen sipariş bilgileri
Takip sonucu sipariş numarasını, sipariş tarihini, kalemleri, toplam tutarı, güncel durumu ve durum "Versendet" veya "Zugestellt" ise kargo firmasıyla takip numarasını göstermelidir (SHALL). Bilinen kargo firmaları için takip numarası firmanın takip sayfasına bağlantı olmalıdır (SHALL). Dahili notlar ve tedarikçi bilgileri gösterilmemelidir (MUST NOT).

#### Scenario: Gönderilmiş sipariş
- **WHEN** müşteri "Versendet" durumundaki, kargo firması DHL olan bir siparişi sorgular
- **THEN** durum "Versendet" olarak, takip numarası da DHL takip sayfasına bağlantı olarak gösterilir

#### Scenario: Yeni sipariş
- **WHEN** müşteri "Eingegangen" durumundaki bir siparişi sorgular
- **THEN** durum "Eingegangen" olarak gösterilir ve takip numarası alanı görünmez

#### Scenario: Dahili not gizli
- **WHEN** admin bir siparişe dahili not eklemiştir ve müşteri o siparişi sorgular
- **THEN** yanıtta dahili not yer almaz

### Requirement: Bilgi sızdırmayan hata yanıtı
Sistem, sipariş bulunamadığında ve e-posta eşleşmediğinde aynı genel hata mesajını vermelidir (MUST); bir sipariş numarasının var olup olmadığı yanıttan anlaşılmamalıdır (MUST NOT). Yalnızca başarıyla ödenmiş siparişler sorgulanabilir olmalıdır (SHALL).

#### Scenario: Yanlış e-posta
- **WHEN** müşteri var olan bir sipariş numarasını yanlış bir e-postayla sorgular
- **THEN** "Keine Bestellung zu diesen Angaben gefunden" mesajı gösterilir

#### Scenario: Var olmayan numara
- **WHEN** müşteri var olmayan bir sipariş numarasıyla sorgu yapar
- **THEN** yanlış e-posta durumundaki mesajın aynısı gösterilir

### Requirement: Sorgu sıklığı sınırı
Sistem, aynı istemciden kısa sürede gelen aşırı sayıda takip sorgusunu sınırlandırmalıdır (SHALL).

#### Scenario: Aşırı sorgu
- **WHEN** aynı istemci bir dakika içinde 20'den fazla takip sorgusu gönderir
- **THEN** sonraki sorgular geçici olarak reddedilir ve "Bitte später erneut versuchen" mesajı gösterilir
