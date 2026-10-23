# everfeier

Almanya'ya yönelik, Halloween 2026 için dönemlik ve minimal bir online mağaza. Next.js 16 ile yazıldı, ödemeler Stripe Checkout ile alınıyor. Ayrı bir veritabanı yok: siparişler Stripe'ta tutuluyor. Sitenin dili Almanca. Site, [OpenNext](https://opennext.js.org/cloudflare) adaptörüyle **Cloudflare Workers** üzerinde çalışıyor.

Planlama belgeleri `openspec/changes/halloween-store-mvp/` altında.

## Kurulum

```bash
npm install
cp .env.example .env.development.local          # değerleri doldur
printf 'NEXTJS_ENV=development\n' > .dev.vars    # wrangler önizlemesinin geliştirme değerlerini kullanması için
npm test                                         # birim testleri
npm run dev                                      # Next.js geliştirme sunucusu: http://localhost:3000
npm run preview                                  # Cloudflare Workers ortamında (wrangler) yerel önizleme
```

`npm run preview` varsayılan olarak `http://localhost:8787` adresinde açılır. Stripe dönüş adresleri `SITE_URL` değerine gittiği için `SITE_URL` ile aynı portu kullan; örneğin `npx opennextjs-cloudflare preview --port 3000`.

**Neden `.env.local` değil de `.env.development.local`:** OpenNext, build sırasında `.env` dosyalarındaki değerleri worker paketinin içine gömüyor. Yerel anahtarlar yalnızca geliştirme dosyasında durursa production ayarlarına hiç girmiyor. `npm run deploy` de makinede bir `.env` dosyası bulunduğu sürece çalışmayı reddediyor (bkz. [Cloudflare'e deploy](#cloudflarea-deploy)).

Zorunlu bir ortam değişkeni eksik ya da geçersizse ilk istekte tüm sorunları listeleyen bir hata oluşur ve sayfalar 500 döner. Cloudflare'de bu mesaj Worker'ın loglarında (Observability) görünür.

### Ortam değişkenleri

| Değişken | Açıklama |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe gizli anahtarı. Geliştirmede `sk_test_...`, canlıda `sk_live_...` |
| `SITE_URL` | Sitenin adresi, sonunda `/` olmadan (ör. `https://everfeier.com`). Yalnızca sunucuda okunuyor |
| `ADMIN_PASSWORD` | Admin paneli şifresi |
| `ADMIN_SESSION_SECRET` | En az 32 karakter rastgele değer: `openssl rand -hex 32` |
| `RESEND_API_KEY` | Resend API anahtarı (cayma onayı e-postaları için) |
| `MAIL_FROM` | Gönderen adresi, ör. `everfeier <shop@everfeier.com>`; alan adı Resend'de doğrulanmış olmalı |
| `OPERATOR_EMAIL` | Cayma bildirimlerinin kopyasının gideceği adres (senin adresin) |
| `SHOP_MODE` | `open` veya `closed` |
| `ORDER_CUTOFF` | Son sipariş zamanı, ISO formatında (ör. `2026-10-28T23:59:00+01:00`) |
| `VAT_MODE` | `kleinunternehmer` (§ 19 UStG notu) veya `regular` (inkl. 19 % MwSt.) |

## Stripe ayarları (Dashboard)

Testte de canlıda da bir kez yapılması gereken ayarlar:

1. **Ödeme yöntemleri** (Settings → Payments → Payment methods): Kart, Apple Pay, Google Pay, PayPal ve Klarna açık olsun. **SEPA Direct Debit, Sofort ve diğer gecikmeli yöntemler kapalı olsun.**
2. **Public details** (Settings → Business → Public details): İşletme adı `everfeier`. Terms of service URL'si `https://<alanadın>/agb`.
3. **Müşteri e-postaları** (Settings → Customer emails): "Successful payments" açık olsun. Makbuzda "Bestellung EF-XXXXXX" görünür.
4. **Branding**: logo ve renk (isteğe bağlı).

Test kartı: `4242 4242 4242 4242`, son kullanma tarihi olarak gelecekteki herhangi bir tarih, CVC olarak herhangi 3 rakam.

## Mağazanın işleyişi

- **Katalog:** `src/lib/catalog.ts`. Bir ürünü kaldırmak için `active: false` yap ve yeniden deploy et. Tedarikçi linkleri ve alış fiyatları (`supplier`) yalnızca sunucuda ve admin panelinde kullanılıyor.
- **Ürün görselleri:** `public/products/`. Şu an yer tutucu görseller var. Kendi fotoğraflarını aynı dosya adlarıyla koyabilir ya da `image` alanını değiştirebilirsin.
- **Sezon:** Banttaki tarih `ORDER_CUTOFF` değerinden geliyor. Bu tarih geçince ya da `SHOP_MODE=closed` olunca sipariş alınmıyor. Takip ve cayma sayfaları çalışmaya devam ediyor.
- **Sipariş:** Her ödeme bir Stripe PaymentIntent'idir (`metadata.shop = everfeier`). Durum, kargo bilgisi ve notlar bu PaymentIntent'in metadata alanlarında tutuluyor.

## Admin paneli

`/admin` adresinden `ADMIN_PASSWORD` ile giriş yapılıyor. Oturum 12 saat geçerli.

1. **Bestellungen** listesi son 100 ödenmiş siparişi gösterir. Duruma göre filtrelenebilir; cayma bildirilen siparişlerde "Widerruf" etiketi çıkar.
2. Sipariş detayındaki her ürünün yanında Temu linki ve kopyalanabilir teslimat adresi var. Temu'da müşterinin adresine sipariş ver, Temu sipariş numarasını **Interne Notiz** alanına yaz.
3. Kargo çıkınca durumu **Versendet** yap ve kargo firmasıyla takip numarasını gir. Müşteri bunları takip sayfasında görür.
4. İptal ve geri ödeme işlemini Stripe Dashboard'dan yap, ardından durumu **Storniert** olarak ayarla. Storniert son durumdur.

## Kontroller

```bash
npm test             # birim testleri
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm run check:leak   # çalışan sitede tedarikçi bilgisi sızıntısı kontrolü (varsayılan http://localhost:3000)
```

## Cloudflare'e deploy

Gereken: bir Cloudflare hesabı ve **Workers Paid** planı (5 $/ay). Ücretsiz planın istek başına 10 ms CPU sınırı bu site için yetersiz.

### Önerilen yol: GitHub'dan otomatik build (Workers Builds)

Bu yolda build Cloudflare'de, repodan alınan temiz kodla yapılıyor; senin makinendeki `.env` dosyaları pakete giremiyor.

1. Cloudflare Dashboard'da **Workers & Pages → Create → Import a repository** yolunu izle ve `anilca/everfeier` reposunu seç.
2. Ayarları şöyle gir:
   - **Project name:** `everfeier` (`wrangler.jsonc` içindeki `name` ile aynı olmalı)
   - **Build command:** `npx opennextjs-cloudflare build`
   - **Deploy command:** `npx opennextjs-cloudflare deploy -- --keep-vars`
   - **Production branch:** canlıya çıkacak dal (ör. `main`)
3. İlk deploy bitince Worker'ın **Settings → Variables and Secrets** bölümüne değerleri gir:
   - **Secret** olarak: `STRIPE_SECRET_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `RESEND_API_KEY`
   - **Text** olarak: `SITE_URL`, `MAIL_FROM`, `OPERATOR_EMAIL`, `SHOP_MODE`, `ORDER_CUTOFF`, `VAT_MODE`
   - Build değişkeni gerekmiyor; kodda `NEXT_PUBLIC_` ile başlayan değişken yok.
4. Test için önce `https://everfeier.<hesap>.workers.dev` adresini kullan; `SITE_URL` de bu adres olmalı. Stripe test anahtarıyla tam akışı dene.
5. Canlıya geçerken **Settings → Domains & Routes → Add → Custom domain** yoluyla `everfeier.com` alan adını ekle ve `SITE_URL=https://everfeier.com` yap. Bunun için alan adının DNS'i Cloudflare'de olmalı. DNS'i taşırken mevcut e-posta (MX) kayıtlarını ve Resend kayıtlarını da Cloudflare'e eklemeyi unutma.

### Yerelden deploy (alternatif)

```bash
npx wrangler login
npm run deploy
```

`npm run deploy`, proje klasöründe `.env.example` dışında bir `.env*` dosyası varsa durur. Değerleri `npx wrangler secret put STRIPE_SECRET_KEY` gibi komutlarla ya da Dashboard'dan gir.

### Geri alma

Dashboard'da **Deployments** sekmesinden önceki sürüme dön ya da `npx wrangler rollback` komutunu kullan. Siparişleri hemen durdurmak için `SHOP_MODE=closed` yeterli.

## Canlıya geçiş kontrol listesi

Kod dışındaki adımların hepsi işletmecinin, yani senin sorumluluğunda. Hepsi tamamlanmadan `SHOP_MODE=open` ile canlı anahtar kullanma.

| # | Adım | Sorumlu |
|---|---|---|
| 1 | Gewerbeanmeldung (online başvuru, Gewerbeamt) | İşletmeci |
| 2 | Finanzamt'a "Fragebogen zur steuerlichen Erfassung" (ELSTER) gönder; Kleinunternehmer kararını ver ve `VAT_MODE` değerini buna göre ayarla | İşletmeci |
| 3 | Stripe hesabını canlıya al: işletme bilgileri, kimlik, IBAN | İşletmeci |
| 4 | Stripe Dashboard ayarları (yukarıdaki "Stripe ayarları" bölümü) canlı modda da yapılmalı | İşletmeci |
| 5 | Impressum, Datenschutz, AGB ve Widerrufsbelehrung metinlerini bir generator ya da avukatla hazırla; sarı işaretli tüm yer tutucuları değiştir | İşletmeci |
| 6 | § 312j BGB: Stripe'ın son butonundaki "Zahlen" etiketinin yeterli olup olmadığını kontrol ettir (bkz. design.md) | İşletmeci |
| 7 | Resend'de gönderen alan adını doğrula; `MAIL_FROM` ve `OPERATOR_EMAIL` değerlerini ayarla | İşletmeci |
| 8 | Cloudflare'de Workers Paid planına geç, repoyu Workers Builds ile bağla ve everfeier.com'u Custom domain olarak ekle (bkz. [Cloudflare'e deploy](#cloudflarea-deploy)) | İşletmeci |
| 9 | Cloudflare'de canlı değerleri gir: `sk_live_...`, yeni ve güçlü bir `ADMIN_PASSWORD`, yeni bir `ADMIN_SESSION_SECRET` ve `SITE_URL=https://everfeier.com`. Hassas değerleri Secret olarak gir | İşletmeci |
| 10 | `ORDER_CUTOFF` değerini kesinleştir (Temu teslim süresi + 1 gün tampon) | İşletmeci |
| 11 | Gerçek ürün fotoğraflarını `public/products/` altına koy | İşletmeci |
| 12 | Riesen-Tarantel'in teslim süresini Temu ürün sayfasından kontrol et; uzunsa `active: false` yap | İşletmeci |
| 13 | Tüm Temu linklerinin hâlâ çalıştığını ve ürünlerin stokta olduğunu kontrol et | İşletmeci |
| 14 | Canlıda düşük tutarlı gerçek bir test siparişi ver: admin'de görünüyor mu, takipte görünüyor mu, cayma e-postası geliyor mu? Ardından Stripe'tan geri ödeme yap | İşletmeci |
| 15 | `npm run check:leak https://<alanadın>` ile canlı sitede tedarikçi bilgisi sızıntısı olmadığını kontrol et | İşletmeci + geliştirici |

Sezon sonunda `SHOP_MODE=closed` yap. Site, cayma süresi ve teslimat süresi dolana kadar (en az 14 gün + teslim süresi) takip ve cayma için açık kalmalı.
