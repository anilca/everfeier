# Tasks

## 1. Proje iskeleti

- [x] 1.1 Next.js (App Router, TypeScript, ESLint) projesini oluştur, `npm run dev` ile ana sayfanın açıldığını doğrula
- [x] 1.2 Vitest kur ve örnek bir testle `npm test` komutunun geçtiğini doğrula
- [x] 1.3 `stripe` ve `resend` paketlerini ekle; `.env.example` dosyasına `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `RESEND_API_KEY`, `MAIL_FROM`, `OPERATOR_EMAIL`, `SHOP_MODE`, `ORDER_CUTOFF`, `VAT_MODE` değişkenlerini yaz; eksik zorunlu değişkende uygulamanın açık bir hatayla durduğunu doğrula
- [x] 1.4 README'ye kurulum, ortam değişkenleri ve Stripe test modu adımlarını yaz; README'deki komutların sıfırdan çalıştığını doğrula

## 2. Katalog ve yapılandırma

- [x] 2.1 Katalog modülünü 12 ürün + "Sensenmann-Set" ile oluştur (Almanca ad/açıklama, cent fiyat, set bileşenleri, sunucuya özel `supplier.temuUrl`/`costCents`); her ürün için Temu linkini proposal'daki ürünlerden ekle ve birim testle tüm id/slug'ların benzersiz olduğunu doğrula
- [x] 2.2 İstemciye giden "public" ürün projeksiyonunu yaz ve birim testle çıktıda `supplier` alanının olmadığını doğrula
- [x] 2.3 Sezon yapılandırmasını (`SHOP_MODE`, `ORDER_CUTOFF` → `isShopOpen(now)`) ve vergi modunu (`VAT_MODE` → fiyat notu) yaz; birim testle açık/kapalı ve iki vergi modunu doğrula
- [x] 2.4 Nötr yer tutucu ürün görsellerini `public/products/` altına ekle ve her katalog ürününün mevcut bir görsele işaret ettiğini testle doğrula

## 3. Vitrin ve sepet

- [x] 3.1 Ortak düzeni yaz (sezon bandı, altbilgide yasal bağlantılar ve "Vertrag widerrufen"); ana sayfada bandın `ORDER_CUTOFF` tarihini gösterdiğini doğrula
- [x] 3.2 Ana sayfa ürün ızgarasını ve ürün detay sayfasını (açıklama, set içeriği, fiyat + vergi/kargo notu, teslim süresi) yaz; pasif ürün adresinin 404 döndüğünü doğrula
- [x] 3.3 `localStorage` destekli sepeti yaz (ekle, adet 1–10, çıkar, ara toplam, kargo satırı, depolama yoksa bellekte çalışma, pasif ürün işareti); sepet mantığını birim testlerle doğrula (54,70 € örneği dahil)
- [x] 3.4 Mağaza kapalıyken butonların devre dışı kaldığını ve "Die Saison ist beendet" mesajını uygula; `SHOP_MODE=closed` ile elle doğrula
- [x] 3.5 Üretilen HTML/JS çıktısında "temu" ve alış fiyatlarının bulunmadığını kontrol eden bir test ekle (`next build` çıktısı üzerinde) ve geçtiğini doğrula

## 4. Ödeme

- [x] 4.1 Sipariş numarası üreticisini yaz; birim testle biçimin `^EF-[2-9A-HJ-NP-Z]{6}$` olduğunu doğrula
- [x] 4.2 Sepet doğrulamasını yaz (bilinmeyen/pasif ürün, adet aralığı, boş sepet, istemci fiyatının yok sayılması); birim testlerle her ret durumunu doğrula
- [x] 4.3 Checkout API'sini yaz: sezon kontrolü (kapalıysa 409), `price_data` ile kalemler, DE teslimat, 4,90 € sabit kargo, `locale: de`, `submit_type: pay`, AGB onayı, açıklama ve metadata (`shop`, `order_no`, `status: eingegangen`); Stripe test modunda test kartıyla bir siparişin tamamlandığını ve makbuzda "Bestellung EF-…" metninin göründüğünü doğrula
- [x] 4.4 Onay sayfasını yaz (`session_id` ile Session okuma, yalnızca `paid` ise bilgi gösterme, sepeti boşaltma, takip bağlantısı) ve iptal edilen ödemede sepetin korunduğunu doğrula
- [x] 4.5 Stripe Dashboard ayarlarını README'ye yaz (ödeme yöntemleri: kart/Apple Pay/Google Pay/PayPal/Klarna açık, SEPA kapalı; AGB URL'si; makbuz e-postaları açık; marka adı) ve test modunda ödeme sayfasında SEPA'nın görünmediğini doğrula

## 5. Sipariş deposu (Stripe)

- [x] 5.1 Sipariş okuma katmanını yaz: order_no ile arama, `shop` ile listeleme (son 100), PaymentIntent + Session'dan sipariş modeli (kalemler, e-posta, adres, metadata); Stripe istemcisi mock'lanarak birim testle doğrula
- [x] 5.2 Durum geçiş kurallarını yaz (Versendet için carrier + tracking zorunlu, Storniert son durum) ve birim testlerle tüm geçişleri doğrula
- [x] 5.3 Metadata yazma işlemlerini yaz (durum, carrier, tracking_no, internal_note, withdrawal_at); Stripe test modunda bir siparişte değişikliğin Dashboard'da göründüğünü doğrula

## 6. Sipariş takibi

- [x] 6.1 Takip API'sini yaz (büyük/küçük harf duyarsız eşleşme, yalnızca başarılı siparişler, aynı genel hata mesajı, dahili notun yanıttan çıkarılması); birim testlerle eşleşme ve hata durumlarını doğrula
- [x] 6.2 Bellek içi hız sınırını (dakikada 20 istek/IP) ekle ve birim testle 21. isteğin reddedildiğini doğrula
- [x] 6.3 Takip sayfasını yaz (form, durum, kalemler, toplam, kargo firması bağlantıları DHL/Hermes/DPD/GLS); test siparişiyle "Eingegangen" ve "Versendet" görünümlerini elle doğrula

## 7. Admin

- [x] 7.1 Admin girişini ve HMAC imzalı oturum çerezini (12 saat, httpOnly, secure, sameSite=strict) yaz; birim testle imza doğrulamasını ve süre dolumunu, elle de oturumsuz erişimin giriş sayfasına yönlendirdiğini doğrula
- [x] 7.2 Sipariş listesini yaz (en yeniden eskiye, durum filtresi, cayma işareti, "1 dakikaya kadar gecikme" notu); test siparişinin listede göründüğünü doğrula
- [x] 7.3 Sipariş detayını yaz (kalemler + tedarikçi linkleri, kopyalanabilir adres, e-posta, cayma bilgisi) ve durum/kargo/not güncelleme formunu ekle; "Versendet" için takip numarası olmadan kaydın reddedildiğini elle doğrula
- [x] 7.4 Admin API'lerinin oturum olmadan 401 döndüğünü bir testle doğrula ve README'ye admin kullanımını yaz

## 8. Yasal sayfalar ve cayma işlevi

- [x] 8.1 Impressum, Datenschutzerklärung, AGB, Widerrufsbelehrung (Muster-Widerrufsformular dahil) ve Versand & Zahlung sayfalarını, açıkça işaretlenmiş yer tutucu metinlerle oluştur; altbilgiden her sayfanın açıldığını doğrula
- [x] 8.2 Fiyat bileşenine vergi notu ve "zzgl. Versandkosten" bağlantısını ekle; iki `VAT_MODE` değeriyle doğru metnin göründüğünü doğrula
- [x] 8.3 "Vertrag widerrufen" formunu ve "Widerruf bestätigen" akışını yaz (sipariş eşleşmesi → `withdrawal_at`, ekranda içerik + zaman damgası); birim testle eşleşen ve eşleşmeyen durumları doğrula
- [x] 8.4 Resend ile müşteriye onay e-postasını ve işletmeciye kopyayı (eşleşmeyenler "nicht zugeordnet" işaretli) gönder; test e-posta adresine gelen iki e-postanın içerik ve tarih-saat içerdiğini doğrula
- [x] 8.5 Mağaza kapalıyken takip ve cayma işlevinin çalıştığını `SHOP_MODE=closed` ile doğrula

## 9. Uçtan uca doğrulama ve yayın hazırlığı

- [ ] 9.1 Stripe test modunda tam akışı Vercel preview ortamında çalıştır (sepet → ödeme → onay → admin'de görünme → Versendet → takipte görünme → cayma → e-postalar); ana sayfada üçüncü taraf istek olmadığını tarayıcı ağ sekmesinden doğrula
- [x] 9.2 Mobil genişlikte (375 px) ana sayfa, sepet, takip ve admin sayfalarının kullanılabilir olduğunu doğrula
- [x] 9.3 README'ye canlıya geçiş kontrol listesini yaz (kod dışı, işletmecinin işleri: Gewerbeanmeldung, Stripe canlı aktivasyonu, gerçek yasal metinler ve Impressum, § 312j buton etiketinin kontrolü, Resend alan adı doğrulaması, Vercel Pro, canlı anahtarlar, `ORDER_CUTOFF`, gerçek ürün fotoğrafları, tarantulanın teslim süresi kontrolü, düşük tutarlı canlı test siparişi + geri ödeme) ve listedeki her adımın bir sorumluyla eşleştiğini doğrula
