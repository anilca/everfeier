import "server-only";
import type { PublicProduct } from "./shop";

type SupplierLink = { label: string; url: string };

export type Product = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  priceCents: number;
  image: string;
  active: boolean;
  /** Ids of the products a bundle consists of. */
  components?: string[];
  /** Server-only: never send to the client. */
  supplier: { links: SupplierLink[]; costCents: number };
};

const temu = (path: string) => `https://www.temu.com/de-en/${path}`;

const products: Product[] = [
  {
    id: "sensenmann-kostuem",
    name: "Sensenmann-Kostüm",
    shortDescription: "Schwarzer Kapuzenumhang mit Kette – der Klassiker für Halloween.",
    description:
      "Weiter, bodenlanger Umhang in Schwarz mit großer Kapuze und dekorativer Kette. Passt über normale Kleidung, Einheitsgröße für Erwachsene. Ideal für Halloween, Fasching und Horrorpartys.",
    priceCents: 2990,
    image: "/products/sensenmann-kostuem.svg",
    active: true,
    supplier: {
      links: [{ label: "Temu", url: temu("halloween--for--black-hooded-cape-with-chain-spooky-horror-disguise-for-halloween-masquerade-carnival-g-609783532863994.html") }],
      costCents: 1447,
    },
  },
  {
    id: "sense-130",
    name: "Sense 130 cm",
    shortDescription: "Große Deko-Sense als Kostüm-Accessoire.",
    description:
      "Leichte Kostüm-Sense mit 130 cm Länge – das passende Accessoire zum Sensenmann. Kein Werkzeug, nicht scharf.",
    priceCents: 1490,
    image: "/products/sense-130.svg",
    active: true,
    supplier: {
      links: [{ label: "Temu", url: temu("halloween-sense-130-cm-horror--accessory--accessory-for-halloween-carnival-and-horror-party-g-608890179674270.html") }],
      costCents: 666,
    },
  },
  {
    id: "sensenmann-set",
    name: "Sensenmann-Set",
    shortDescription: "Kostüm + Sense im Set – günstiger als einzeln.",
    description:
      "Das komplette Sensenmann-Outfit: schwarzer Kapuzenumhang mit Kette und die passende 130-cm-Sense. Du sparst gegenüber dem Einzelkauf.",
    priceCents: 3990,
    image: "/products/sensenmann-set.svg",
    active: true,
    components: ["sensenmann-kostuem", "sense-130"],
    supplier: {
      links: [
        { label: "Temu – Kostüm", url: temu("halloween--for--black-hooded-cape-with-chain-spooky-horror-disguise-for-halloween-masquerade-carnival-g-609783532863994.html") },
        { label: "Temu – Sense", url: temu("halloween-sense-130-cm-horror--accessory--accessory-for-halloween-carnival-and-horror-party-g-608890179674270.html") },
      ],
      costCents: 2113,
    },
  },
  {
    id: "moenchsrobe",
    name: "Mönchsrobe mit Kapuze",
    shortDescription: "Lange schwarze Robe für Mönch, Kultist oder Sensenmann.",
    description:
      "Bodenlange schwarze Robe mit Kapuze und weiten Ärmeln. Einheitsgröße für Erwachsene, einfach überzuziehen.",
    priceCents: 2490,
    image: "/products/moenchsrobe.svg",
    active: true,
    supplier: {
      links: [{ label: "Temu", url: temu("robes--halloween-costume--robe-with-hood---monk-dress-up-for-halloween-masquerade-carnival-horror-party-g-609783532903455.html") }],
      costCents: 1183,
    },
  },
  {
    id: "zauberer-umhang",
    name: "Zauberer-Umhang",
    shortDescription: "Schwarzer Umhang für Zauberer und Hexen.",
    description:
      "Langer schwarzer Umhang mit Kapuze für Zauberer-, Hexen- oder Vampir-Kostüme. Einheitsgröße für Erwachsene.",
    priceCents: 2490,
    image: "/products/zauberer-umhang.svg",
    active: true,
    supplier: {
      links: [{ label: "Temu", url: temu("halloween-wizard-cape-for--black--cape-spooky-wizard-dress-up-for-halloween-mardi-gras-carnival-themed-parties-g-609783532883649.html") }],
      costCents: 1183,
    },
  },
  {
    id: "hexenhut",
    name: "Hexenhut",
    shortDescription: "Schwarzer Hexenhut mit gebogener Spitze.",
    description: "Klassischer schwarzer Hexenhut mit krummer Spitze. Einheitsgröße für Erwachsene.",
    priceCents: 1490,
    image: "/products/hexenhut.svg",
    active: true,
    supplier: {
      links: [{ label: "Temu", url: temu("curved--hat-black-uniform-size-black-g-604242471412928.html") }],
      costCents: 666,
    },
  },
  {
    id: "pestdoktor-maske",
    name: "Pestdoktor-Maske",
    shortDescription: "Schnabelmaske aus Latex für Cosplay und Halloween.",
    description:
      "Pestdoktor-Maske mit langem Schnabel aus Latex. Hinweis: Enthält Latex – nicht geeignet für Personen mit Latexallergie.",
    priceCents: 1490,
    image: "/products/pestdoktor-maske.svg",
    active: true,
    supplier: {
      links: [{ label: "Temu", url: temu("-bird--latex-for-halloween-costume-cosplay-g-603642518206122.html") }],
      costCents: 611,
    },
  },
  {
    id: "horror-accessoire-set",
    name: "Horror-Accessoire-Set",
    shortDescription: "Deko-Spritze, -Messer und -Schere im Set.",
    description:
      "Dreiteiliges Requisiten-Set mit „blutiger“ Deko-Spritze, Deko-Messer und Deko-Schere aus Kunststoff. Nur Kostümzubehör, nicht scharf.",
    priceCents: 1290,
    image: "/products/horror-accessoire-set.svg",
    active: true,
    supplier: {
      links: [{ label: "Temu", url: temu("tk-3-in-1-halloween-horror-accessory-set-bloody--knife-scissors--for-halloween-carnival-costumes-g-608905212052715.html") }],
      costCents: 661,
    },
  },
  {
    id: "skelett-geister-3er",
    name: "Hängende Skelett-Geister, 3er-Set",
    shortDescription: "Drei gruselige Hängefiguren für drinnen und draußen.",
    description:
      "Drei hängende Skelett- und Sensenmann-Figuren aus Kunststoff mit wehenden Gewändern. Für Veranda, Garten, Bäume oder Partyräume.",
    priceCents: 3290,
    image: "/products/skelett-geister-3er.svg",
    active: true,
    supplier: {
      links: [{ label: "Temu", url: temu("3pcs-pack--ghosts--decorations-plastic-spooky-figures-suitable-for-outdoor-halloween-decor-haunted-year-round-gothic-decoration-hang-for-events-themed--g-607377176770361.html") }],
      costCents: 1606,
    },
  },
  {
    id: "riesen-tarantel",
    name: "Riesen-Tarantel 50 cm",
    shortDescription: "Große, behaarte Deko-Spinne.",
    description:
      "Behaarte Deko-Tarantel mit 50 cm Spannweite. Perfekt zusammen mit Spinnennetz-Deko für eine gruselige Ecke oder als Fotohintergrund.",
    priceCents: 1490,
    image: "/products/riesen-tarantel.svg",
    active: true,
    supplier: {
      links: [{ label: "Temu", url: temu("giant--for-halloween-50-cm-large-hairy-decorative--for--a-spooky-arrangement-halloween-decoration-for--and-party-hall-tarantula-themed-decor-for-dark-themed-party-setup-large--for-composition-with-web-and-other-halloween-decorations--decoration-for--a-haunted-corner-and-photo-backdrop-hairy-tarantula-giant-ornamental--for-interior-decoration-g-609223039673847.html") }],
      costCents: 602,
    },
  },
  {
    id: "riesenspinne-deko",
    name: "Riesenspinne Fotorequisite 38 cm",
    shortDescription: "Stehende Riesenspinne für Garten und Party.",
    description:
      "Braune Riesenspinne mit 38 cm Standhöhe für Rasen, Eingang oder Fotoecke. Für drinnen und draußen.",
    priceCents: 1490,
    image: "/products/riesenspinne-deko.svg",
    active: true,
    supplier: {
      links: [{ label: "Temu", url: temu("-halloween-decoration-photo-props-halloween-outdoor-decorations-giant--scary-large--props-for-yard-lawn-halloween-outside-decor-and-indoor-party-decor-brown-standing-height-is-15-inches-photobooth-props-g-607256917724891.html") }],
      costCents: 696,
    },
  },
  {
    id: "fledermaus-wandsticker",
    name: "3D-Fledermaus-Wandsticker",
    shortDescription: "Schwarze 3D-Fledermäuse in vier Größen.",
    description:
      "Schwarze Fledermaus-Sticker aus PVC mit 3D-Effekt in vier verschiedenen Größen. Einfach an Wand, Fenster oder Spiegel kleben.",
    priceCents: 790,
    image: "/products/fledermaus-wandsticker.svg",
    active: true,
    supplier: {
      links: [{ label: "Temu", url: temu("halloween-bat-decor-realistic--pvc-bat-wall-stickers-with-4-assorted-sizes-diy-wall-decals-great-for-bathroom-indoor-party-and-festival-makeover-g-606941136946075.html") }],
      costCents: 289,
    },
  },
  {
    id: "halloween-vorhang",
    name: "Halloween-Vorhang 180 × 75 cm",
    shortDescription: "Schwarzer Stoffvorhang für Tür oder Fenster.",
    description: "Schwarzer Deko-Vorhang aus Stoff, 180 × 75 cm, für Türen, Fenster oder als Partyhintergrund.",
    priceCents: 890,
    image: "/products/halloween-vorhang.svg",
    active: true,
    supplier: {
      links: [{ label: "Temu", url: temu("halloween-curtain-black-fabric-180-x-75-cm-g-609214449719676.html") }],
      costCents: 339,
    },
  },
];

export function allProducts(): readonly Product[] {
  return products;
}

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getActiveProduct(id: string): Product | undefined {
  const product = getProduct(id);
  return product?.active ? product : undefined;
}

/** The only shape of a product that may leave the server. */
export function toPublicProduct(product: Product): PublicProduct {
  const contents = product.components
    ?.map((id) => getProduct(id)?.name)
    .filter((name): name is string => Boolean(name));
  return {
    id: product.id,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    priceCents: product.priceCents,
    image: product.image,
    ...(contents && contents.length > 0 ? { contents } : {}),
  };
}

export function activePublicProducts(): PublicProduct[] {
  return products.filter((p) => p.active).map(toPublicProduct);
}
