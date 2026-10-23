# Design: halloween-store-mvp

## Context

Repo boş; mevcut kod, altyapı ya da veri yok. Motivasyon ve kapsam için bkz. proposal.md. Tasarımı belirleyen kısıtlar:

- **Zaman:** Yayına çıkış en geç 27 Ekim 2026, son sipariş tarihi yaklaşık 28–29 Ekim. Her parça 1–2 günde biten en basit çözüm olmalı.
- **Hacim:** Deneme ölçeği, en fazla birkaç düzine sipariş.
- **İşletme:** İşletmeci tek kişi. Henüz Gewerbe kaydı yok; Kleinunternehmer olup olmayacağı belli değil. Geliştirme Stripe test modunda yapılıyor.
- **Hukuk:** Almanya B2C mesafeli satış kuralları (PAngV, § 312j BGB, § 356a BGB Widerrufsbutton, DSGVO).

## Goals / Non-Goals

**Goals:**
- Ayrı veritabanı ya da sunucu işletmeden çalışan, tek kod tabanlı bir uygulama.
- Sezon sonunda tek bir ayarla kapatılabilen ve gelecek sezonda kataloğu değiştirilerek yeniden kullanılabilen bir yapı.
- Tedarikçi bilgisinin (Temu linkleri, alış fiyatları) müşteriye hiçbir yoldan sızmaması.

**Non-Goals:**
- Yüzlerce siparişe ölçeklenme, çoklu admin kullanıcısı, rol yönetimi.
- Stok takibi (dropship; ürün Temu'da tükenirse ürün elle pasife alınır).
- Otomatik testlerin tüm UI'yi kapsaması; yalnızca saf iş mantığı (sepet doğrulama, sipariş no, durum geçişleri, e-posta eşleştirme) birim testli.

## Decisions

### 1. Uygulama: Next.js (App Router, TypeScript), Cloudflare Workers'ta

Vitrin, API route'ları (checkout, takip, admin, cayma) ve sunucu tarafı gizli anahtarlar tek projede.
- *Alternatif:* Shopify/hazır platform. Daha hızlı olurdu ama kullanıcı özel bir site istedi ve platform aylık ücret ile kendi kurallarını getiriyor.
- *Alternatif:* Ayrı frontend + backend. Bu kapsam için gereksiz karmaşıklık.
- *Barındırma:* Cloudflare Workers, `@opennextjs/cloudflare` adaptörüyle. Adaptörün 1.20.12+ sürümleri Next.js 16.4'ü destekliyor. **Workers Paid** planı kullanılıyor (5 $/ay). Ücretsiz planın istek başına 10 ms CPU sınırı ve 3 MiB worker boyut sınırı, sunucuda render edilen bir site için fazla dar.
- *Alternatif:* Vercel. Next.js'i hiç ayar gerektirmeden çalıştırıyor, ama ticari kullanım için Pro planı gerekiyor (yaklaşık 20 $/ay); kullanıcı Cloudflare'i tercih etti.
- *Workers ortamına özgü kurallar:*
  - `nodejs_compat` uyumluluk bayrağı açık; `node:crypto` (admin oturumu) bununla çalışıyor.
  - Stripe SDK Workers için ayrı bir paket sürümü (`workerd` export) kullanıyor; Resend zaten `fetch` tabanlı.
  - `NEXT_PUBLIC_*` değişkenleri build sırasında koda gömüldüğü için site adresi yalnızca sunucuda okunan `SITE_URL` değişkeninde tutuluyor.
  - OpenNext'in `instrumentation.ts` desteği belgelenmediği için ortam değişkeni kontrolü, bir ortam değişkeni ilk kez okunduğunda (`env()` ve sezon ayarları) bir kez yapılıyor. Eksik bir değişken varsa tüm sorunları listeleyen açıklayıcı bir 500 hatası dönüyor. Node runtime'daki `proxy.ts`'e OpenNext henüz destek vermediği için o yol kullanılmıyor.
  - Gizli değerler Cloudflare'de secret olarak tutuluyor. Yerelde `.env.development.local` dosyası, `.dev.vars` içinde `NEXTJS_ENV=development` ve `opennextjs-cloudflare preview` (wrangler) kullanılıyor.
  - OpenNext, build sırasında `.env*` dosyalarının değerlerini worker paketine gömüyor. Bu yüzden deploy, `.env` dosyası olmayan Workers Builds (GitHub) ortamında yapılıyor. Yerel `npm run deploy` komutu, makinede `.env*` dosyası varsa çalışmayı reddediyor (`scripts/guard-env-files.mjs`).

### 2. Katalog: repodaki tipli sabit dosya

Ürünler `catalog` modülünde tutuluyor: `id`, `slug`, Almanca ad ve açıklama, fiyat (cent), görsel yolları, `active`, set ürünler için `components` ve yalnızca sunucuda kullanılan `supplier` alanı (`temuUrl`, `costCents`).
- *Neden:* 13 kalem için CMS ya da veritabanı gereksiz; değişiklik commit + deploy ile yapılıyor.
- *Alternatif:* Stripe Products/Prices. İki ayrı yerde senkron tutmak gerekirdi. Bunun yerine Checkout'ta `price_data` satır içi üretiliyor.
- Tedarikçi alanları istemciye giden bileşenlere hiç aktarılmıyor; istemci için ayrı bir "public" projeksiyon fonksiyonu var.

### 3. Sepet: istemcide, `localStorage` içinde

Sepette yalnızca `{id, qty}` tutuluyor. Fiyat ve ad her zaman sunucudaki katalogdan geliyor; istemcinin gönderdiği fiyata güvenilmiyor. `localStorage` erişilemezse sepet yalnızca bellekte tutuluyor.

### 4. Ödeme: Stripe Checkout (barındırılan sayfa)

Sunucu bir Checkout Session oluşturuyor:
- `mode: payment`, `locale: de`
- `shipping_address_collection.allowed_countries: ['DE']`
- tek sabit kargo seçeneği (4,90 €, "DHL/Hermes, 1–5 Werktage")
- `consent_collection.terms_of_service: required`; AGB linki Stripe Dashboard'da tanımlı
- `submit_type: pay`: Stripe sayfasındaki son buton Almanca "Zahlen" oluyor (test modunda doğrulandı). Sözleşme bu butonla kuruluyor.
- `payment_intent_data.description = "Bestellung EF-XXXXXX"` (bu metin Stripe makbuz e-postasında görünüyor)
- `payment_intent_data.metadata = { shop: "everfeier", order_no, status: "eingegangen" }`
- Ödeme yöntemleri Dashboard'dan yönetiliyor. Yalnızca anında onaylananlar açık (kart, Apple/Google Pay, PayPal, Klarna); SEPA Lastschrift gibi gecikmeli yöntemler kapalı, çünkü teslim penceresi kısa.

Vitrindeki sepet butonu "Weiter zur Kasse" olarak etiketleniyor, çünkü bağlayıcı sipariş Stripe sayfasında veriliyor. Stripe sayfası son butondan hemen önce kalemleri, kargoyu ve toplamı gösteriyor.
- *Alternatif:* Stripe Elements ile gömülü ödeme. Daha fazla UI ve PCI kapsamı demek, daha fazla iş.

### 5. Sipariş kaydı: Stripe'ın kendisi (veritabanı yok)

Bir sipariş, `metadata.shop = "everfeier"` olan ve `status = succeeded` olan bir PaymentIntent'tir. Durum, kargo firması, takip numarası, dahili not ve cayma talebi PaymentIntent metadata'sında tutuluyor:

```
metadata:
  shop            everfeier
  order_no        EF-7K3QXM
  status          eingegangen | in_bearbeitung | versendet | zugestellt | storniert
  carrier         dhl | hermes | dpd | gls | other
  tracking_no     ...
  internal_note   Temu-Bestellnr. usw. (yalnızca admin görür)
  withdrawal_at   ISO zaman damgası (cayma bildirildiyse)
```

Kalemler, müşteri e-postası ve adres, PaymentIntent'e bağlı Checkout Session'dan (`line_items` genişletilerek) okunuyor.
- **Arama:** Admin listesi tek bir `checkout.sessions.list` çağrısıyla (`status: complete`, `payment_intent` genişletilmiş) okunuyor ve `metadata.shop` alanına göre filtreleniyor. Böylece listede ne N+1 çağrı ne de arama gecikmesi oluyor. Takip ve cayma işlevi, sipariş numarasını Stripe Search API ile buluyor (`metadata['order_no']:'EF-…'`).
- **Neden:** Ödeme ile sipariş arasında senkron sorunu olmuyor, ayrıca bir veritabanı işletmek ve yedeklemek gerekmiyor.
- *Alternatif:* Postgres/SQLite + webhook. Daha sağlam ama kurulumu ve işletmesi ek iş; gelecek sezonda hacim artarsa bu yapıya geçilir.
- **Webhook kullanılmıyor.** Ödeme sonrası onay sayfası `session_id` ile doğrudan Session'ı okuyor; sonraki her şey metadata üzerinden yürüyor.

### 6. Sipariş numarası

`EF-` + 6 karakter, karışabilecek karakterler olmadan (`23456789ABCDEFGHJKLMNPQRSTUVWXYZ`), kriptografik rastgele üretiliyor. Bu deneme hacminde çakışma olasılığı ihmal edilebilir. Yine de çakışma durumunda arama sonucunda yalnızca başarılı ve e-postası eşleşen kayıt gösteriliyor.

### 7. Takip: sipariş no + e-posta

Sunucu sipariş numarasını arıyor, Session'daki e-postayı büyük/küçük harf duyarsız karşılaştırıyor. Eşleşme yoksa ya da sipariş bulunamazsa her iki durumda aynı genel mesaj veriliyor; böylece sipariş numaralarının var olup olmadığı tahmin edilemiyor. Basit bir IP bazlı hız sınırı uygulanıyor (bellek içi; en iyi çaba).

### 8. Admin kimlik doğrulaması

Tek şifre, `ADMIN_PASSWORD` ortam değişkeninde. Başarılı girişte `ADMIN_SESSION_SECRET` ile HMAC imzalı, `httpOnly`, `secure`, `sameSite=strict`, 12 saat geçerli bir çerez veriliyor. Tüm `/admin` sayfaları ve admin API'leri bu çerezi doğruluyor.
- *Alternatif:* OAuth veya auth sağlayıcısı. Tek kullanıcı için gereksiz.

### 9. Durum geçişleri

```
eingegangen --> in_bearbeitung --> versendet --> zugestellt
     |               |
     +---------------+--> storniert
```

`versendet` durumuna geçmek için kargo firması ve takip numarası zorunlu. Geriye dönük düzeltmeye izin veriliyor (yanlış tıklama ihtimali), ama `storniert` durumu son durum. Geri ödeme Stripe Dashboard'dan elle yapılıyor.

### 10. Sezon kontrolü

Ortam değişkenleri:
- `ORDER_CUTOFF`: ISO tarih-saat; banttaki "Bestellungen bis … für Lieferung bis Halloween" metni bundan üretiliyor.
- `SHOP_MODE`: `open | closed`.

`closed` durumunda veya `ORDER_CUTOFF` geçtiğinde sepet butonu devre dışı kalıyor ve checkout API 409 dönüyor. Takip, yasal sayfalar ve cayma işlevi sezon kapalıyken de çalışmaya devam ediyor.

### 11. Fiyat ve KDV gösterimi

`VAT_MODE`: `kleinunternehmer | regular`.
- `kleinunternehmer`: "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet."
- `regular`: "inkl. 19 % MwSt."

İki durumda da "zzgl. Versandkosten" bağlantısı gösteriliyor. Gewerbe/Finanzamt kararı kodu değiştirmeden yalnızca ayarla uygulanıyor.

### 12. Widerrufsbutton ve cayma onayı (§ 356a BGB)

Her sayfanın footer'ında "Vertrag widerrufen" bağlantısı var. Bağlantı bir form açıyor: ad, sipariş no, e-posta ve isteğe bağlı açıklama. Gönderim "Widerruf bestätigen" butonuyla yapılıyor.

Sunucu:
1. Siparişi sipariş no + e-posta ile eşleştiriyor; eşleşirse `withdrawal_at` alanını işaretliyor.
2. Eşleşme olsun olmasın, müşteriye beyanın içeriğini ve alındığı tarih-saati içeren bir onay e-postasını Resend üzerinden gönderiyor.
3. İşletmeciye de bir kopya gönderiyor.

Eşleşme yoksa beyan yine de kaydedilmiş sayılıyor (e-posta ile belgeleniyor) ve işletmeci elle inceliyor.
- *Neden e-posta sağlayıcısı:* Yasa "kalıcı veri taşıyıcısında" onay istiyor; Stripe özel e-posta göndermiyor.
- Yasal metinlerin kendisi (AGB, Widerrufsbelehrung, Datenschutz) bir generator veya avukat ile hazırlanıyor. Kod yalnızca sayfaları ve yer tutucuları sağlıyor.

### 13. Çerez ve takip

Analitik, reklam pikseli veya üçüncü taraf script yok. Stripe.js de yüklenmiyor; ödeme için Stripe'a yönlendirme yapılıyor. Kullanılan tek çerez admin oturumu ve teknik olarak zorunlu. Bu yüzden çerez onay bandı gerekmiyor.

## Risks / Trade-offs

- [Stripe Search eventual consistency (~1 dk)] → Yeni sipariş admin listesine ve takibe gecikmeli düşebilir. Onay sayfası Session'ı doğrudan okuyor; admin ekranında "yeni siparişler 1 dakikaya kadar gecikebilir" notu var.
- [Stripe API rate limit / sipariş detayında Session + line item çağrıları] → Deneme hacminde sorun değil. Admin listesi tek çağrıyla okunuyor ve son 100 siparişle sınırlı; gelecek sezonda veritabanına geçilir.
- [OpenNext üçüncü taraf bir adaptör; Next.js sürümlerini gecikmeli takip ediyor] → Next.js ve adaptör sürümleri `package.json`'da sabitleniyor. Next.js güncellemesinden önce adaptörün sürüm notları kontrol ediliyor. Adaptör bir gün yetersiz kalırsa kod Vercel'de değişiklik gerektirmeden çalışıyor.
- [Worker boyut sınırı (Paid: 10 MiB sıkıştırılmış)] → Build çıktısının boyutu deploy sırasında kontrol ediliyor. Bağımlılıklar az (Stripe, Resend).
- [Ürün Temu'da tükenir veya fiyatı değişir] → İşletmeci ürünü `active: false` yapıp yeniden deploy ediyor. Sipariş zaten alınmışsa siparişi iptal edip geri ödeme yapıyor.
- [Temu ambalajı ve faturası müşteriye gider] → AGB/SSS'de "Versand direkt durch unseren Partner" notu.
- [Temu şartları yeniden satışı kısıtlayabilir] → İş riski; işletmecinin kontrolünde. Kodu etkilemiyor.
- [Ürün görselleri] → Temu fotoğrafları telif riski taşıyor. İşletmeci kendi fotoğraflarını çekene kadar nötr yer tutucu görseller kullanılıyor.
- [Bellek içi hız sınırı sunucusuz ortamda örnekler arasında paylaşılmıyor] → En iyi çaba; e-posta eşleşmesi zorunlu olduğu için risk düşük.
- [§ 312j BGB buton çözümü: Stripe'ın "Zahlen" etiketi yeterli mi?] → "Zahlen" ödeme yükümlülüğünü açıkça ifade ediyor, ama canlıya çıkmadan doğrulanmalı. Yetersiz bulunursa Stripe Elements ile kendi "Zahlungspflichtig bestellen" butonuna geçilir; bu, checkout task grubunu değiştirir.
- [Yasal uyum] → Bu tasarım hukuki danışmanlık yerine geçmiyor. Canlıya çıkmadan metinler generator veya avukatla kontrol edilmeli.

## Migration Plan

1. Stripe test modunda geliştirme. Önce yerelde wrangler ile (`opennextjs-cloudflare preview`), sonra Cloudflare'deki `*.workers.dev` deploy'unda uçtan uca test: test kartı ile sipariş → admin → takip → cayma.
2. Canlıya geçiş ön koşulları: Gewerbe kaydı, Stripe canlı aktivasyonu, gerçek Impressum ve yasal metinler, Resend alan adı doğrulaması, Cloudflare Workers Paid planı ve everfeier.com alan adının worker'a bağlanması.
3. Canlı anahtarlar ve `SHOP_MODE=open` ile deploy; bir gerçek düşük tutarlı test siparişi verilip geri ödeme yapılıyor.
4. Sezon sonu: `SHOP_MODE=closed`. Site takip ve cayma için en az 14 gün + teslim süresi boyunca açık kalıyor.
5. Geri dönüş: `SHOP_MODE=closed` siparişleri anında durduruyor. Önceki sürüme Cloudflare'in deploy geçmişinden ya da `wrangler rollback` ile dönülebiliyor.

## Open Questions

- Kleinunternehmer durumu: `VAT_MODE` ile ertelenebilir; kod veya task'ları değiştirmiyor.
- Kargo ücreti ve ücretsiz kargo eşiği: şimdilik sabit 4,90 €, eşik yok. Yalnızca sabitlerin değeri değişir.
- Tarantulanın (#9) teslim süresi: ürün sayfasından doğrulanacak. Uzunsa ürün `active: false` yapılır.
