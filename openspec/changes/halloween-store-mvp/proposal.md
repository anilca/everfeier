# Proposal: halloween-store-mvp

## Why

Halloween 2026 (31 Ekim) için Almanya'daki müşterilere, Temu "Local Warehouse" ürünleriyle deneme amaçlı dropshipping yapan, minimum özellikli dönemlik bir online mağazaya ihtiyaç var. Satış penceresi yalnızca birkaç gün olduğu için kapsam bilerek en dar haliyle tutuluyor. Amaç kâr değil; akışın çalıştığını, talebin olup olmadığını ve Temu teslim süresinin tutup tutmadığını görmek.

## What Changes

- Almanca, tek sayfalık bir vitrin: 12 ürün ve 1 set ürünlük sabit bir katalog, sepet, sezon bandı ("son sipariş tarihi") ve sezon bittiğinde kapanan sipariş modu.
- Stripe Checkout ile ödeme: yalnızca Almanya'ya teslimat, sabit kargo ücreti, anında onaylanan ödeme yöntemleri, kısa sipariş numarası (`EF-XXXXXX`).
- Üyelik olmadan sipariş takibi: sipariş numarası + e-posta ile durum ve kargo takip numarasını gösteren sayfa.
- Şifreyle korunan mini admin: sipariş listesi, durum güncelleme, kargo firması ve takip numarası girişi, tedarikçi (Temu) bağlantısı ve dahili not.
- Almanya hukuku için zorunlu sayfalar ve işlevler: Impressum, Datenschutzerklärung, AGB, Widerrufsbelehrung, fiyat gösterimi (KDV/§19 UStG notu, kargo bilgisi), § 312j BGB'ye uygun bağlayıcı sipariş butonu ve § 356a BGB'deki Widerrufsbutton ile e-posta onaylı cayma işlevi.
- Ayrı bir veritabanı yok; sipariş kayıtlarının tek kaynağı Stripe.

Katalog (ürün kaynağı Temu, tamamı Almanya'dan gönderiliyor; elektrikli, pilli, kozmetik, çocuk ürünü ve marka/film lisanslı ürün içermiyor):

| # | Ürün | Temu (23.10.) | Satış fiyatı |
|---|---|---|---|
| 1 | Sensenmann-Kostüm (Umhang + Kette) | 14,47 € | 29,90 € |
| 2 | Sense 130 cm | 6,66 € | 14,90 € |
| S | Sensenmann-Set (1 + 2) | 21,13 € | 39,90 € |
| 3 | Mönchsrobe mit Kapuze | 11,83 € | 24,90 € |
| 4 | Zauberer-Umhang | 11,83 € | 24,90 € |
| 5 | Hexenhut | 6,66 € | 14,90 € |
| 6 | Pestdoktor-Maske (Latex) | 6,11 € | 14,90 € |
| 7 | Horror-Accessoire-Set (Spritze, Messer, Schere) | 6,61 € | 12,90 € |
| 8 | Hängende Skelett-Geister, 3er-Set | 16,06 € | 32,90 € |
| 9 | Riesen-Tarantel 50 cm | 6,02 € | 14,90 € |
| 10 | Riesenspinne Fotorequisite 38 cm | 6,96 € | 14,90 € |
| 11 | 3D-Fledermaus-Wandsticker | 2,89 € | 7,90 € |
| 12 | Halloween-Vorhang 180 × 75 cm | 3,39 € | 8,90 € |

Kapsam dışı: üyelik, kupon, yorumlar, çoklu dil, otomatik Temu siparişi, otomatik kargo entegrasyonu, uygulama içinden iade/geri ödeme (Stripe Dashboard'dan yapılır), durum değişikliği e-postaları, analitik/izleme çerezleri.

## Capabilities

### New Capabilities

- `storefront`: Ürün kataloğunun gösterimi, sepet, sezon bandı ve sezon sonunda siparişlerin kapatılması.
- `checkout`: Sepetin doğrulanıp ödemeye aktarılması, teslimat kısıtları, sipariş numarası ve ödeme sonrası onay sayfası.
- `order-tracking`: Müşterinin sipariş numarası + e-posta ile siparişinin durumunu ve kargo bilgisini görmesi.
- `order-admin`: İşletmecinin korumalı bir alanda siparişleri görmesi, durumlarını ve kargo bilgilerini güncellemesi.
- `legal-information`: Almanya'da zorunlu yasal sayfalar, fiyat bilgilendirmesi ve Widerrufsbutton ile cayma işlevi.

### Modified Capabilities

(yok, proje yeni)

## Impact

- Yeni kod tabanı: Next.js (TypeScript) uygulaması; repoda henüz kod yok.
- Dış bağımlılıklar: Stripe (Checkout, PaymentIntents, Search API), işlemsel e-posta sağlayıcısı (Resend, yalnızca cayma onayı için), barındırma (Cloudflare Workers Paid, `@opennextjs/cloudflare` adaptörüyle).
- İşletme tarafı ön koşulları (kod dışı): Gewerbeanmeldung, Stripe hesabının canlıya alınması, yasal metinlerin gerçek bilgilerle doldurulması, ürün fotoğrafları. Kodlama Stripe test modunda bunları beklemeden ilerleyebilir; canlıya çıkış bunlara bağlı.
