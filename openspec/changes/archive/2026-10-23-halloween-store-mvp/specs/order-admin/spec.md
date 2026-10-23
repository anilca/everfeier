# Spec Delta: order-admin

## Purpose

İşletmecinin şifreyle korunan bir alanda siparişleri görmesini, tedarikçiden sipariş vermek için gereken bilgilere ulaşmasını, sipariş durumlarını ve kargo bilgilerini güncellemesini sağlar.

## ADDED Requirements

### Requirement: Admin erişim koruması
Sistem, tüm admin sayfalarını ve admin işlemlerini yapılandırılmış bir şifreyle korumalıdır (MUST). Başarılı girişten sonra oturum en fazla 12 saat geçerli olmalıdır (SHALL). Oturumu olmayan istekler giriş sayfasına yönlendirilmeli veya reddedilmelidir (MUST).

#### Scenario: Oturumsuz erişim
- **WHEN** oturumu olmayan bir kullanıcı admin sipariş listesini açar
- **THEN** giriş sayfasına yönlendirilir

#### Scenario: Oturumsuz işlem
- **WHEN** oturumu olmayan bir istemci sipariş durumu güncelleme isteği gönderir
- **THEN** istek reddedilir ve sipariş değişmez

#### Scenario: Yanlış şifre
- **WHEN** kullanıcı yanlış şifre girer
- **THEN** oturum açılmaz ve genel bir hata mesajı gösterilir

#### Scenario: Süresi dolmuş oturum
- **WHEN** girişten 12 saatten fazla süre geçmiştir
- **THEN** sonraki admin isteği giriş sayfasına yönlendirilir

### Requirement: Sipariş listesi
Admin alanı, başarıyla ödenmiş siparişleri en yeniden eskiye doğru sipariş numarası, tarih, müşteri adı, toplam tutar, durum ve cayma bildirimi işaretiyle listelemelidir (SHALL). Liste duruma göre filtrelenebilmelidir (SHALL).

#### Scenario: Yeni sipariş listede
- **WHEN** bir müşteri ödemeyi tamamlamıştır ve admin birkaç dakika sonra listeyi açar
- **THEN** sipariş "Eingegangen" durumuyla listenin en üstünde görünür

#### Scenario: Duruma göre filtre
- **WHEN** admin "Eingegangen" filtresini seçer
- **THEN** yalnızca bu durumdaki siparişler listelenir

### Requirement: Sipariş detayı ve tedarikçi bilgisi
Admin alanı, her sipariş için kalemleri, adetleri, müşterinin e-postasını, tam teslimat adresini, her kalem için tedarikçi ürün bağlantısını, varsa cayma bildirimini ve dahili notu göstermelidir (SHALL).

#### Scenario: Tedarikçiden sipariş hazırlığı
- **WHEN** admin bir siparişin detayını açar
- **THEN** her kalemin yanında tedarikçi ürün sayfasına giden bir bağlantı ve kopyalanabilir teslimat adresi görünür

### Requirement: Durum güncelleme
Admin alanı, sipariş durumunun "Eingegangen", "In Bearbeitung", "Versendet", "Zugestellt" ve "Storniert" değerleri arasında değiştirilmesine izin vermelidir (SHALL). "Versendet" durumuna geçiş, kargo firması ve takip numarası girilmeden yapılamamalıdır (MUST NOT). "Storniert" durumundaki bir sipariş başka bir duruma alınamamalıdır (MUST NOT).

#### Scenario: Gönderildi olarak işaretleme
- **WHEN** admin kargo firması "DHL" ve bir takip numarası girip durumu "Versendet" yapar
- **THEN** durum kaydedilir ve müşteri takip sayfasında bu bilgiyi görür

#### Scenario: Takip numarası olmadan gönderim
- **WHEN** admin takip numarası girmeden durumu "Versendet" yapmaya çalışır
- **THEN** değişiklik reddedilir ve eksik alan belirtilir

#### Scenario: İptal edilmiş sipariş
- **WHEN** admin "Storniert" durumundaki bir siparişi "In Bearbeitung" yapmaya çalışır
- **THEN** değişiklik reddedilir

### Requirement: Dahili not
Admin alanı, her siparişe yalnızca admin tarafından görülebilen serbest metinli bir not (örneğin tedarikçi sipariş numarası) eklenmesine ve düzenlenmesine izin vermelidir (SHALL).

#### Scenario: Not kaydetme
- **WHEN** admin bir siparişe "Temu PO-123456" notunu kaydeder
- **THEN** not sipariş detayında görünür ve müşteriye giden hiçbir yanıtta yer almaz
