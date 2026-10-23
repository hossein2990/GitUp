/**
 * Demonstration catalogue for the NOOR OPTICAL storefront.
 *
 * Everything here is placeholder retail data (names, copy, prices, stock) that
 * the business replaces through the admin panel — it carries no claim about real
 * manufacturers, certifications, warranties or performance figures. Brand names
 * are fictional house labels so the brand filter and brand pages are functional.
 *
 * Photography: openly licensed studio/lifestyle eyewear imagery referenced by
 * URL. Swap the `images` arrays for the brand's own product photography.
 */

export type SeedImage = { url: string; view: 'front' | 'side' | 'detail' | 'worn' | 'scene' };

const photo = (id: string, width = 1400): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${width}`;

const shot = (id: string, view: SeedImage['view'] = 'front', width = 1400): SeedImage => ({
  url: photo(id, width),
  view,
});

/** Widely used landscape frame for editorial banners. */
export const HERO_IMAGE = photo('1604781099561-c70393a38a6d', 1800);
export const BOUTIQUE_IMAGE = photo('1486250944723-86bca2b15b06', 1600);
export const CRAFT_IMAGE = photo('1544177586-c9b9fb1f45c2', 1600);
export const LIFESTYLE_IMAGE = photo('1616769402452-267817d74fba', 1600);
export const CONSULT_IMAGE = photo('1775338845696-3d6b1f5e2124', 1400);

export type SeedCategory = {
  slug: string;
  family: 'frames' | 'lenses' | 'contacts' | 'accessories';
  nameEn: string;
  nameFa: string;
  taglineEn: string;
  taglineFa: string;
  descriptionEn: string;
  descriptionFa: string;
  imageUrl: string;
  sortOrder: number;
};

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    slug: 'eyeglasses',
    family: 'frames',
    nameEn: 'Prescription Eyeglasses',
    nameFa: 'عینک طبی',
    taglineEn: 'Everyday optical frames',
    taglineFa: 'فریم طبی برای استفاده روزمره',
    descriptionEn: 'Prescription-ready frames in acetate, metal and titanium across a full size range.',
    descriptionFa: 'فریم‌های آماده نسخه در متریال استات، فلز و تیتانیوم و در سایزهای متنوع.',
    imageUrl: photo('1614715838608-dd527c46231d'),
    sortOrder: 1,
  },
  {
    slug: 'sunglasses',
    family: 'frames',
    nameEn: 'Sunglasses',
    nameFa: 'عینک آفتابی',
    taglineEn: 'Sun protection with presence',
    taglineFa: 'محافظت در برابر آفتاب با ظاهری متفاوت',
    descriptionEn: 'Sun frames with UV400 lens options and polarised choices where available.',
    descriptionFa: 'فریم‌های آفتابی با گزینه‌های عدسی UV400 و مدل‌های پولاریزه در صورت موجود بودن.',
    imageUrl: photo('1572635196237-14b3f281503f'),
    sortOrder: 2,
  },
  {
    slug: 'optical-lenses',
    family: 'lenses',
    nameEn: 'Optical Lenses',
    nameFa: 'عدسی طبی',
    taglineEn: 'Materials, coatings and indices',
    taglineFa: 'متریال، پوشش و ضریب شکست',
    descriptionEn: 'Single vision, computer and multifocal lens options with coating choices.',
    descriptionFa: 'گزینه‌های عدسی تک‌بین، کامپیوتر و چندفوکوس همراه با انتخاب پوشش.',
    imageUrl: photo('1582143434535-eba55a806718'),
    sortOrder: 3,
  },
  {
    slug: 'contact-lenses',
    family: 'contacts',
    nameEn: 'Contact Lenses',
    nameFa: 'لنز تماسی',
    taglineEn: 'Daily and monthly options',
    taglineFa: 'گزینه‌های روزانه و ماهانه',
    descriptionEn: 'Contact lens packs by replacement schedule and pack size.',
    descriptionFa: 'بسته‌های لنز تماسی بر اساس دوره تعویض و تعداد در بسته.',
    imageUrl: photo('1530707114297-4af4b3cafe16'),
    sortOrder: 4,
  },
  {
    slug: 'computer-glasses',
    family: 'frames',
    nameEn: 'Computer & Blue-Light Glasses',
    nameFa: 'عینک کامپیوتر و فیلتر نور آبی',
    taglineEn: 'For long screen sessions',
    taglineFa: 'برای ساعت‌های طولانی کار با نمایشگر',
    descriptionEn: 'Frames paired with blue-light filtering lens options.',
    descriptionFa: 'فریم‌های همراه با گزینه عدسی فیلتر نور آبی.',
    imageUrl: photo('1616769402452-267817d74fba'),
    sortOrder: 5,
  },
  {
    slug: 'kids-eyewear',
    family: 'frames',
    nameEn: "Kids' Eyewear",
    nameFa: 'عینک کودکان',
    taglineEn: 'Lightweight, flexible shapes',
    taglineFa: 'سبک و انعطاف‌پذیر',
    descriptionEn: 'Smaller frames in flexible materials for children.',
    descriptionFa: 'فریم‌های کوچک‌تر با متریال انعطاف‌پذیر برای کودکان.',
    imageUrl: photo('1593194777536-e155e6d100b2'),
    sortOrder: 6,
  },
  {
    slug: 'premium-frames',
    family: 'frames',
    nameEn: 'Premium & Designer Frames',
    nameFa: 'فریم‌های پرمیوم و طراحی',
    taglineEn: 'Finishing and craftsmanship',
    taglineFa: 'کیفیت ساخت و پرداخت نهایی',
    descriptionEn: 'High-grade acetates, titanium and hand-finished details.',
    descriptionFa: 'استات درجه‌یک، تیتانیوم و جزئیات پرداخت‌شده دستی.',
    imageUrl: photo('1758552322632-ba288778c770'),
    sortOrder: 7,
  },
  {
    slug: 'accessories',
    family: 'accessories',
    nameEn: 'Accessories & Eyewear Care',
    nameFa: 'لوازم جانبی و نگهداری عینک',
    taglineEn: 'Cases, cloths and kits',
    taglineFa: 'کاور، دستمال و کیت‌های نگهداری',
    descriptionEn: 'Protection and cleaning essentials for everyday wear.',
    descriptionFa: 'لوازم محافظت و تمیز کردن عینک برای استفاده روزمره.',
    imageUrl: photo('1632986636968-04958bfbbf3f'),
    sortOrder: 8,
  },
];

export type SeedBrand = {
  slug: string;
  name: string;
  nameFa: string;
  country: string;
  descriptionEn: string;
  descriptionFa: string;
  imageUrl: string;
  sortOrder: number;
};

export const SEED_BRANDS: SeedBrand[] = [
  {
    slug: 'noor-studio',
    name: 'Noor Studio',
    nameFa: 'نور استودیو',
    country: 'Iran',
    descriptionEn: 'Our in-house line — quiet shapes built for daily wear.',
    descriptionFa: 'خط اختصاصی فروشگاه با طراحی آرام و مناسب استفاده روزمره.',
    imageUrl: photo('1556306510-31ca015374b0'),
    sortOrder: 1,
  },
  {
    slug: 'atelier-nord',
    name: 'Atelier Nord',
    nameFa: 'آتلیه نورد',
    country: 'Denmark',
    descriptionEn: 'Architectural acetates with restrained detailing.',
    descriptionFa: 'استات‌های ساختاری با جزئیات مینیمال.',
    imageUrl: photo('1758552322632-ba288778c770'),
    sortOrder: 2,
  },
  {
    slug: 'lumen-optics',
    name: 'Lumen Optics',
    nameFa: 'لومن اپتیک',
    country: 'Germany',
    descriptionEn: 'Thin metal frames and a broad lens programme.',
    descriptionFa: 'فریم‌های فلزی نازک همراه با مجموعه گسترده عدسی.',
    imageUrl: photo('1646084081219-1090f72a531c'),
    sortOrder: 3,
  },
  {
    slug: 'vera-line',
    name: 'Vera Line',
    nameFa: 'ورا لاین',
    country: 'Italy',
    descriptionEn: 'Sun and optical frames with a fashion-led silhouette.',
    descriptionFa: 'فریم‌های آفتابی و طبی با فرمی متمرکز بر مد.',
    imageUrl: photo('1508296695146-257a814070b4'),
    sortOrder: 4,
  },
  {
    slug: 'kian-vision',
    name: 'Kian Vision',
    nameFa: 'کیان ویژن',
    country: 'Iran',
    descriptionEn: 'Durable everyday frames for adults and children.',
    descriptionFa: 'فریم‌های بادوام روزمره برای بزرگسالان و کودکان.',
    imageUrl: photo('1615468822882-4828d2602857'),
    sortOrder: 5,
  },
];

export type SeedService = {
  slug: string;
  nameEn: string;
  nameFa: string;
  summaryEn: string;
  summaryFa: string;
  descriptionEn: string;
  descriptionFa: string;
  durationEn: string;
  durationFa: string;
  priceFrom: number | null;
  imageUrl: string;
  sortOrder: number;
};

export const SEED_SERVICES: SeedService[] = [
  {
    slug: 'frame-styling',
    nameEn: 'Frame styling consultation',
    nameFa: 'مشاوره انتخاب فریم',
    summaryEn: 'Shape, size and colour guidance based on your face and prescription.',
    summaryFa: 'راهنمایی درباره فرم، سایز و رنگ بر اساس صورت و نسخه شما.',
    descriptionEn:
      'An in-showroom session where we compare frame shapes and sizes against your face proportions, prescription and daily routine, then shortlist a few options to try.',
    descriptionFa:
      'یک جلسه حضوری که در آن فرم و سایز فریم‌ها با تناسب صورت، نسخه و سبک زندگی شما مقایسه می‌شود و چند گزینه نهایی برای تست انتخاب می‌گردد.',
    durationEn: 'About 30 minutes',
    durationFa: 'حدود ۳۰ دقیقه',
    priceFrom: null,
    imageUrl: photo('1604781099561-c70393a38a6d'),
    sortOrder: 1,
  },
  {
    slug: 'lens-consultation',
    nameEn: 'Lens and coating consultation',
    nameFa: 'مشاوره عدسی و پوشش',
    summaryEn: 'Comparing lens material, refractive index and coating options.',
    summaryFa: 'مقایسه متریال، ضریب شکست و پوشش‌های مختلف عدسی.',
    descriptionEn:
      'We explain how lens material, index, coating and lens type change thickness, reflection and comfort for your own prescription, so you can choose with clear trade-offs.',
    descriptionFa:
      'توضیح می‌دهیم که متریال، ضریب شکست، پوشش و نوع عدسی چگونه ضخامت، بازتاب و راحتی را برای نسخه شما تغییر می‌دهد تا انتخابی آگاهانه داشته باشید.',
    durationEn: 'About 20 minutes',
    durationFa: 'حدود ۲۰ دقیقه',
    priceFrom: null,
    imageUrl: photo('1582143434535-eba55a806718'),
    sortOrder: 2,
  },
  {
    slug: 'frame-fitting',
    nameEn: 'Fitting and adjustment',
    nameFa: 'نصب و تنظیم فریم',
    summaryEn: 'Fitting, alignment and comfort checks after purchase.',
    summaryFa: 'نصب، تنظیم و بررسی راحتی پس از خرید.',
    descriptionEn:
      'Alignment of the bridge, temples and nose pads so the frame sits level and comfortably. Free for frames purchased from us, at any time during ownership.',
    descriptionFa:
      'تنظیم پل، دسته و پدهای بینی برای قرارگیری تراز و راحت فریم. برای فریم‌های خریداری‌شده از فروشگاه، در تمام مدت استفاده رایگان است.',
    durationEn: '10 – 15 minutes',
    durationFa: '۱۰ تا ۱۵ دقیقه',
    priceFrom: null,
    imageUrl: photo('1544177586-c9b9fb1f45c2'),
    sortOrder: 3,
  },
  {
    slug: 'contact-lens-fitting',
    nameEn: 'Contact lens fitting',
    nameFa: 'فیتینگ لنز تماسی',
    summaryEn: 'Contact lens selection and insertion training.',
    summaryFa: 'انتخاب لنز تماسی و آموزش قرار دادن آن.',
    descriptionEn:
      'We review your prescription parameters, discuss replacement schedules and pack sizes, and walk you through handling and hygiene routines.',
    descriptionFa:
      'پارامترهای نسخه شما بررسی می‌شود، درباره دوره تعویض و تعداد بسته گفت‌وگو می‌کنیم و روش قرار دادن و رعایت بهداشت را آموزش می‌دهیم.',
    durationEn: 'About 30 minutes',
    durationFa: 'حدود ۳۰ دقیقه',
    priceFrom: null,
    imageUrl: photo('1530707114297-4af4b3cafe16'),
    sortOrder: 4,
  },
  {
    slug: 'repairs',
    nameEn: 'Repairs and replacement parts',
    nameFa: 'تعمیر و تعویض قطعات',
    summaryEn: 'Screw, nose pad, temple and hinge replacements.',
    summaryFa: 'تعویض پیچ، پد بینی، دسته و لولا.',
    descriptionEn:
      'Common repairs carried out in the showroom, with a clear quote before any work starts. Availability depends on the part.',
    descriptionFa:
      'تعمیرات رایج در فروشگاه انجام می‌شود و پیش از شروع کار، هزینه به‌صورت شفاف اعلام می‌گردد. موجود بودن قطعه بستگی به مدل دارد.',
    durationEn: 'Same day where possible',
    durationFa: 'در صورت امکان همان روز',
    priceFrom: 150000,
    imageUrl: photo('1632986636968-04958bfbbf3f'),
    sortOrder: 5,
  },
  {
    slug: 'prescription-reading',
    nameEn: 'Prescription review',
    nameFa: 'بررسی و تنظیم نسخه',
    summaryEn: 'Reading your prescription and matching it to a frame.',
    summaryFa: 'خواندن نسخه شما و تطبیق آن با فریم انتخابی.',
    descriptionEn:
      'We translate your prescription values into lens choices, confirm pupillary distance where available and flag anything that needs a second look from your prescriber.',
    descriptionFa:
      'اعداد نسخه شما را به انتخاب عدسی مناسب تبدیل می‌کنیم، فاصله بین مردمک‌ها را در صورت موجود بودن بررسی می‌کنیم و نکات نیازمند بازبینی را یادآوری می‌کنیم.',
    durationEn: 'About 15 minutes',
    durationFa: 'حدود ۱۵ دقیقه',
    priceFrom: null,
    imageUrl: photo('1775338845696-3d6b1f5e2124'),
    sortOrder: 6,
  },
];

export type SeedVariant = {
  colorNameEn: string;
  colorNameFa: string;
  colorHex: string;
  sku: string;
  stock: number;
  images: SeedImage[];
};

export type SeedProduct = {
  slug: string;
  sku: string;
  nameEn: string;
  nameFa: string;
  summaryEn: string;
  summaryFa: string;
  descriptionEn: string;
  descriptionFa: string;
  brandSlug: string;
  categorySlug: string;
  price: number;
  gender: 'men' | 'women' | 'unisex' | 'kids';
  shape?: string;
  material?: string;
  frameSize?: string;
  lensColor?: string;
  uvProtection?: string;
  polarized?: boolean;
  prescriptionCompatible?: boolean;
  specs?: Record<string, string>;
  images: SeedImage[];
  includedAccessories?: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  variants: SeedVariant[];
};

const frameSpecs = (lensWidth: string, bridge: string, temple: string) => ({
  lens_width: lensWidth,
  bridge,
  temple,
});

export const SEED_PRODUCTS: SeedProduct[] = [
  /* ------------------------------------------------------------- eyeglasses */
  {
    slug: 'aura-titanium-round',
    sku: 'NO-EY-1001',
    nameEn: 'Aura Titanium Round',
    nameFa: 'اورا تیتانیوم گرد',
    summaryEn: 'A light titanium round frame with a slim polished rim.',
    summaryFa: 'فریم گرد تیتانیومی سبک با رینگ باریک و پرداخت‌شده.',
    descriptionEn:
      'A round titanium frame built for all-day wear. The slim rim and adjustable nose pads keep the weight low, and the matte finish resists visible fingerprints.',
    descriptionFa:
      'فریم گرد تیتانیومی برای استفاده تمام‌روز. رینگ باریک و پدهای قابل تنظیم وزن را پایین نگه می‌دارد و پرداخت مات، اثر انگشت را کمتر نشان می‌دهد.',
    brandSlug: 'noor-studio',
    categorySlug: 'eyeglasses',
    price: 6850000,
    gender: 'unisex',
    shape: 'Round',
    material: 'Titanium',
    frameSize: 'Medium',
    specs: frameSpecs('48mm', '21mm', '145mm'),
    images: [
      shot('1614715838608-dd527c46231d', 'front'),
      shot('1615468822882-4828d2602857', 'side'),
      shot('1761896883591-0f3e5c9bfba7', 'detail'),
    ],
    includedAccessories: ['Hard case', 'Microfibre cloth'],
    isFeatured: true,
    variants: [
      {
        colorNameEn: 'Brushed Silver',
        colorNameFa: 'نقره‌ای مات',
        colorHex: '#C6C8CA',
        sku: 'NO-EY-1001-SLV',
        stock: 6,
        images: [shot('1614715838608-dd527c46231d', 'front'), shot('1615468822882-4828d2602857', 'side')],
      },
      {
        colorNameEn: 'Matte Black',
        colorNameFa: 'مشکی مات',
        colorHex: '#1C1C1C',
        sku: 'NO-EY-1001-BLK',
        stock: 4,
        images: [shot('1769414017326-6ea5d70f7884', 'front'), shot('1517948430535-1e2469d314fe', 'side')],
      },
    ],
  },
  {
    slug: 'meridian-square-acetate',
    sku: 'NO-EY-1002',
    nameEn: 'Meridian Square Acetate',
    nameFa: 'مریدیان استات مربعی',
    summaryEn: 'A structured square acetate frame with a bold brow line.',
    summaryFa: 'فریم استات مربعی با فرم ساختاری و خط ابروی مشخص.',
    descriptionEn:
      'Hand-polished acetate with reinforced hinges. The squarer silhouette suits rounder face shapes and the thicker brow adds definition.',
    descriptionFa:
      'استات پرداخت‌شده دستی با لولاهای تقویت‌شده. فرم مربعی برای صورت‌های گرد مناسب است و خط ابروی ضخیم‌تر، تعریف بیشتری ایجاد می‌کند.',
    brandSlug: 'atelier-nord',
    categorySlug: 'eyeglasses',
    price: 5250000,
    gender: 'men',
    shape: 'Square',
    material: 'Acetate',
    frameSize: 'Medium',
    specs: frameSpecs('52mm', '19mm', '145mm'),
    images: [
      shot('1556306510-31ca015374b0', 'front'),
      shot('1591076482161-42ce6da69f67', 'side'),
      shot('1769414017326-6ea5d70f7884', 'detail'),
    ],
    includedAccessories: ['Hard case', 'Microfibre cloth'],
    isFeatured: true,
    isNew: true,
    variants: [
      {
        colorNameEn: 'Gloss Black',
        colorNameFa: 'مشکی براق',
        colorHex: '#101010',
        sku: 'NO-EY-1002-BLK',
        stock: 5,
        images: [shot('1556306510-31ca015374b0', 'front'), shot('1591076482161-42ce6da69f67', 'side')],
      },
      {
        colorNameEn: 'Tortoise',
        colorNameFa: 'لاک‌پشتی',
        colorHex: '#6B4A2B',
        sku: 'NO-EY-1002-TOR',
        stock: 3,
        images: [shot('1608539733377-5557e02926b5', 'front'), shot('1761896892087-7e36f6abb684', 'side')],
      },
    ],
  },
  {
    slug: 'vela-slim-oval',
    sku: 'NO-EY-1003',
    nameEn: 'Vela Slim Oval',
    nameFa: 'ولا اسلیم بیضی',
    summaryEn: 'A thin metal oval frame with adjustable nose pads.',
    summaryFa: 'فریم فلزی نازک و بیضی با پدهای بینی قابل تنظیم.',
    descriptionEn:
      'A slender oval metal frame that stays visually light on the face. Adjustable nose pads make it easier to fine-tune the fit.',
    descriptionFa:
      'فریم فلزی بیضی و باریک که روی صورت سبک به نظر می‌رسد. پدهای قابل تنظیم، تنظیم دقیق‌تر نشستن فریم را ممکن می‌کند.',
    brandSlug: 'lumen-optics',
    categorySlug: 'eyeglasses',
    price: 4150000,
    gender: 'women',
    shape: 'Oval',
    material: 'Stainless Steel',
    frameSize: 'Narrow',
    specs: frameSpecs('46mm', '20mm', '140mm'),
    images: [shot('1646084081219-1090f72a531c', 'front'), shot('1517948430535-1e2469d314fe', 'side')],
    includedAccessories: ['Soft pouch', 'Microfibre cloth'],
    variants: [
      {
        colorNameEn: 'Champagne Gold',
        colorNameFa: 'طلایی شامپاینی',
        colorHex: '#C5A77D',
        sku: 'NO-EY-1003-GLD',
        stock: 7,
        images: [shot('1646084081219-1090f72a531c', 'front')],
      },
      {
        colorNameEn: 'Steel',
        colorNameFa: 'استیل',
        colorHex: '#9AA0A6',
        sku: 'NO-EY-1003-STL',
        stock: 2,
        images: [shot('1615468822882-4828d2602857', 'front')],
      },
    ],
  },
  {
    slug: 'lumen-crystal-clear',
    sku: 'NO-EY-1004',
    nameEn: 'Lumen Crystal Clear',
    nameFa: 'لومن کریستال شفاف',
    summaryEn: 'A transparent acetate frame that softens strong features.',
    summaryFa: 'فریم استات شفاف که خطوط صورت را ملایم‌تر نشان می‌دهد.',
    descriptionEn:
      'Clear acetate reads lighter than a solid colour and pairs easily with both warm and cool wardrobes. Suitable for a wide range of prescriptions.',
    descriptionFa:
      'استات شفاف از رنگ‌های پررنگ سبک‌تر دیده می‌شود و با پوشاک گرم و سرد هماهنگ است. برای طیف وسیعی از نسخه‌ها مناسب است.',
    brandSlug: 'lumen-optics',
    categorySlug: 'eyeglasses',
    price: 3600000,
    gender: 'unisex',
    shape: 'Round',
    material: 'Acetate',
    frameSize: 'Medium',
    specs: frameSpecs('49mm', '20mm', '145mm'),
    images: [shot('1769414017326-6ea5d70f7884', 'front'), shot('1646084081219-1090f72a531c', 'detail')],
    includedAccessories: ['Soft pouch', 'Microfibre cloth'],
    isNew: true,
    variants: [
      {
        colorNameEn: 'Crystal Clear',
        colorNameFa: 'شفاف',
        colorHex: '#EDEDED',
        sku: 'NO-EY-1004-CLR',
        stock: 8,
        images: [shot('1769414017326-6ea5d70f7884', 'front')],
      },
    ],
  },
  {
    slug: 'horizon-browline',
    sku: 'NO-EY-1005',
    nameEn: 'Horizon Browline',
    nameFa: 'هورایزن برو‌لاین',
    summaryEn: 'A browline frame combining acetate and a thin metal rim.',
    summaryFa: 'فریم برو‌لاین با ترکیب استات و رینگ فلزی نازک.',
    descriptionEn:
      'A mixed-material browline with an acetate brow and a metal lower rim — a structured look that still sits comfortably on wider faces.',
    descriptionFa:
      'برو‌لاین با متریال ترکیبی؛ ابروی استات و رینگ فلزی پایین، ظاهری ساختاری که روی صورت‌های پهن‌تر نیز راحت می‌نشیند.',
    brandSlug: 'kian-vision',
    categorySlug: 'eyeglasses',
    price: 4900000,
    gender: 'men',
    shape: 'Browline',
    material: 'Acetate & Metal',
    frameSize: 'Wide',
    specs: frameSpecs('54mm', '18mm', '148mm'),
    images: [shot('1608539733377-5557e02926b5', 'front'), shot('1761896892087-7e36f6abb684', 'side')],
    includedAccessories: ['Hard case', 'Microfibre cloth'],
    variants: [
      {
        colorNameEn: 'Black Silver',
        colorNameFa: 'مشکی نقره‌ای',
        colorHex: '#2A2A2A',
        sku: 'NO-EY-1005-BSV',
        stock: 4,
        images: [shot('1608539733377-5557e02926b5', 'front')],
      },
      {
        colorNameEn: 'Tortoise Gold',
        colorNameFa: 'لاک‌پشتی طلایی',
        colorHex: '#8A6237',
        sku: 'NO-EY-1005-TGD',
        stock: 0,
        images: [shot('1591076482161-42ce6da69f67', 'front')],
      },
    ],
  },

  /* -------------------------------------------------------- premium frames */
  {
    slug: 'atelier-noor-signature',
    sku: 'NO-PR-2001',
    nameEn: 'Atelier Noor Signature',
    nameFa: 'آتلیه نور سیگنیچر',
    summaryEn: 'A hand-finished acetate frame from our premium line.',
    summaryFa: 'فریم استات با پرداخت دستی از خط پرمیوم فروشگاه.',
    descriptionEn:
      'Cut from a thicker acetate block, hand-polished over several stages and assembled with metal-core temples. A composed, architectural silhouette.',
    descriptionFa:
      'از بلوک استات ضخیم‌تر برش خورده، در چند مرحله پرداخت دستی شده و با دسته‌های مغزی فلزی مونتاژ می‌شود. فرمی معماری و متین.',
    brandSlug: 'atelier-nord',
    categorySlug: 'premium-frames',
    price: 12500000,
    gender: 'women',
    shape: 'Cat Eye',
    material: 'Acetate',
    frameSize: 'Medium',
    specs: frameSpecs('52mm', '18mm', '142mm'),
    images: [shot('1758552322632-ba288778c770', 'front'), shot('1486250944723-86bca2b15b06', 'detail')],
    includedAccessories: ['Leather case', 'Microfibre cloth', 'Certificate card (placeholder)'],
    isFeatured: true,
    isNew: true,
    variants: [
      {
        colorNameEn: 'Deep Navy',
        colorNameFa: 'سرمه‌ای تیره',
        colorHex: '#14283D',
        sku: 'NO-PR-2001-NVY',
        stock: 3,
        images: [shot('1758552322632-ba288778c770', 'front')],
      },
      {
        colorNameEn: 'Champagne',
        colorNameFa: 'شامپاینی',
        colorHex: '#C5A77D',
        sku: 'NO-PR-2001-CHP',
        stock: 2,
        images: [shot('1534078477103-9f6a18b3a5e2', 'front')],
      },
    ],
  },
  {
    slug: 'onyx-half-rim-titanium',
    sku: 'NO-PR-2002',
    nameEn: 'Onyx Half Rim Titanium',
    nameFa: 'اونیکس نیم‌رینگ تیتانیوم',
    summaryEn: 'A half-rim titanium frame with a slim rectangular lens shape.',
    summaryFa: 'فریم نیم‌رینگ تیتانیوم با فرم مستطیلی باریک.',
    descriptionEn:
      'Half-rim construction keeps the design minimal and the weight low. Recommended for thinner prescriptions; thicker lenses are more visible without a full rim.',
    descriptionFa:
      'ساختار نیم‌رینگ، طراحی را مینیمال و وزن را کم نگه می‌دارد. برای نسخه‌های سبک‌تر پیشنهاد می‌شود؛ در نسخه‌های ضخیم‌تر، عدسی بدون رینگ کامل بیشتر دیده می‌شود.',
    brandSlug: 'noor-studio',
    categorySlug: 'premium-frames',
    price: 9800000,
    gender: 'men',
    shape: 'Rectangle',
    material: 'Titanium',
    frameSize: 'Medium',
    specs: frameSpecs('53mm', '18mm', '145mm'),
    images: [shot('1591076482161-42ce6da69f67', 'front'), shot('1544177586-c9b9fb1f45c2', 'detail')],
    includedAccessories: ['Hard case', 'Microfibre cloth'],
    isFeatured: true,
    variants: [
      {
        colorNameEn: 'Gunmetal',
        colorNameFa: 'گان‌متال',
        colorHex: '#4B5157',
        sku: 'NO-PR-2002-GUN',
        stock: 5,
        images: [shot('1591076482161-42ce6da69f67', 'front')],
      },
    ],
  },

  /* ------------------------------------------------------------ sunglasses */
  {
    slug: 'solar-wayfarer-classic',
    sku: 'NO-SG-5001',
    nameEn: 'Solar Wayfarer Classic',
    nameFa: 'سولار ویفرر کلاسیک',
    summaryEn: 'A classic wayfarer silhouette with a polarised option.',
    summaryFa: 'فرم کلاسیک ویفرر با گزینه پولاریزه.',
    descriptionEn:
      'Wide acetate temples and a solid front with UV400 lenses. The polarised version reduces glare from reflective surfaces.',
    descriptionFa:
      'دسته‌های استات پهن و فرانت یکپارچه با عدسی UV400. نسخه پولاریزه، بازتاب نور از سطوح براق را کاهش می‌دهد.',
    brandSlug: 'atelier-nord',
    categorySlug: 'sunglasses',
    price: 4650000,
    gender: 'unisex',
    shape: 'Wayfarer',
    material: 'Acetate',
    frameSize: 'Medium',
    lensColor: 'Grey',
    uvProtection: 'UV400',
    polarized: true,
    images: [shot('1572635196237-14b3f281503f', 'front'), shot('1667964395271-54a177bc5bdc', 'side')],
    includedAccessories: ['Hard case', 'Microfibre cloth'],
    isFeatured: true,
    variants: [
      {
        colorNameEn: 'Gloss Black',
        colorNameFa: 'مشکی براق',
        colorHex: '#111111',
        sku: 'NO-SG-5001-BLK',
        stock: 9,
        images: [shot('1572635196237-14b3f281503f', 'front')],
      },
      {
        colorNameEn: 'Tortoise',
        colorNameFa: 'لاک‌پشتی',
        colorHex: '#7A5327',
        sku: 'NO-SG-5001-TOR',
        stock: 4,
        images: [shot('1559070081-648fb00b2ed1', 'front')],
      },
    ],
  },
  {
    slug: 'mirage-white-frame',
    sku: 'NO-SG-5002',
    nameEn: 'Mirage White Frame',
    nameFa: 'میراژ فریم سفید',
    summaryEn: 'A white frame with warm brown lenses.',
    summaryFa: 'فریم سفید با عدسی قهوه‌ای گرم.',
    descriptionEn:
      'A light-coloured frame that photographs cleanly against skin tones, paired with warm brown lenses and UV400 protection.',
    descriptionFa:
      'فریمی با رنگ روشن که روی رنگ پوست تمیز دیده می‌شود، همراه عدسی قهوه‌ای گرم و محافظت UV400.',
    brandSlug: 'vera-line',
    categorySlug: 'sunglasses',
    price: 4250000,
    gender: 'women',
    shape: 'Square',
    material: 'Acetate',
    frameSize: 'Medium',
    lensColor: 'Brown',
    uvProtection: 'UV400',
    images: [shot('1577803645773-f96470509666', 'front'), shot('1584036553516-bf83210aa16c', 'side')],
    includedAccessories: ['Soft pouch', 'Microfibre cloth'],
    variants: [
      {
        colorNameEn: 'Ivory White',
        colorNameFa: 'سفید استخوانی',
        colorHex: '#F4F1EA',
        sku: 'NO-SG-5002-WHT',
        stock: 6,
        images: [shot('1577803645773-f96470509666', 'front')],
      },
    ],
  },
  {
    slug: 'sahara-polarized-sport',
    sku: 'NO-SG-5003',
    nameEn: 'Sahara Polarized Sport',
    nameFa: 'صحرا پولاریزه اسپرت',
    summaryEn: 'A wrapped sport frame with polarised green lenses.',
    summaryFa: 'فریم اسپرت خمیده با عدسی سبز پولاریزه.',
    descriptionEn:
      'A wrapped nylon frame that sits close to the face for outdoor use, with polarised lenses for reflective light conditions.',
    descriptionFa:
      'فریم نایلونی خمیده که برای استفاده در فضای باز نزدیک صورت می‌نشیند، همراه عدسی پولاریزه برای شرایط نور بازتابی.',
    brandSlug: 'kian-vision',
    categorySlug: 'sunglasses',
    price: 5150000,
    gender: 'men',
    shape: 'Wrap',
    material: 'Nylon',
    frameSize: 'Wide',
    lensColor: 'Green',
    uvProtection: 'UV400',
    polarized: true,
    images: [shot('1566421966482-ad8076104d8e', 'front'), shot('1611222777277-61319d63ca94', 'detail')],
    includedAccessories: ['Soft case', 'Microfibre cloth'],
    isFeatured: true,
    variants: [
      {
        colorNameEn: 'Matte Black',
        colorNameFa: 'مشکی مات',
        colorHex: '#17181A',
        sku: 'NO-SG-5003-BLK',
        stock: 5,
        images: [shot('1566421966482-ad8076104d8e', 'front')],
      },
      {
        colorNameEn: 'Slate',
        colorNameFa: 'خاکستری سنگی',
        colorHex: '#5A6268',
        sku: 'NO-SG-5003-SLT',
        stock: 3,
        images: [shot('1608539733292-190446b22b83', 'front')],
      },
    ],
  },
  {
    slug: 'tortoise-heritage',
    sku: 'NO-SG-5004',
    nameEn: 'Tortoise Heritage',
    nameFa: 'تورتویز هریتیج',
    summaryEn: 'A heritage tortoiseshell frame with polarised lenses.',
    summaryFa: 'فریم لاک‌پشتی کلاسیک با عدسی پولاریزه.',
    descriptionEn:
      'A warmer tortoiseshell pattern over a classic silhouette, with polarised brown lenses and a hard case included.',
    descriptionFa:
      'طرح لاک‌پشتی گرم روی فرمی کلاسیک، همراه عدسی قهوه‌ای پولاریزه و کاور سخت.',
    brandSlug: 'atelier-nord',
    categorySlug: 'sunglasses',
    price: 6400000,
    gender: 'unisex',
    shape: 'Wayfarer',
    material: 'Acetate',
    frameSize: 'Medium',
    lensColor: 'Brown',
    uvProtection: 'UV400',
    polarized: true,
    images: [shot('1559070081-648fb00b2ed1', 'front'), shot('1610136649349-0f646f318053', 'side')],
    includedAccessories: ['Hard case', 'Microfibre cloth'],
    isFeatured: true,
    variants: [
      {
        colorNameEn: 'Amber Tortoise',
        colorNameFa: 'لاک‌پشتی کهربایی',
        colorHex: '#8C5A24',
        sku: 'NO-SG-5004-AMB',
        stock: 4,
        images: [shot('1559070081-648fb00b2ed1', 'front')],
      },
    ],
  },
  {
    slug: 'ivory-cat-eye',
    sku: 'NO-SG-5005',
    nameEn: 'Ivory Cat Eye',
    nameFa: 'آیوری کت آی',
    summaryEn: 'A lifted cat-eye shape in a light neutral tone.',
    summaryFa: 'فرم کت آی کشیده در رنگی روشن و خنثی.',
    descriptionEn:
      'An upswept cat-eye silhouette with grey UV400 lenses — a shape that lifts the cheek line and frames the eyes.',
    descriptionFa:
      'فرم کت آی با زاویه بالارونده و عدسی خاکستری UV400؛ فرمی که خط گونه را بالا می‌برد و نگاه را قاب می‌گیرد.',
    brandSlug: 'vera-line',
    categorySlug: 'sunglasses',
    price: 4850000,
    gender: 'women',
    shape: 'Cat Eye',
    material: 'Acetate',
    frameSize: 'Narrow',
    lensColor: 'Grey',
    uvProtection: 'UV400',
    images: [shot('1508296695146-257a814070b4', 'front'), shot('1610136649349-0f646f318053', 'detail')],
    includedAccessories: ['Soft pouch', 'Microfibre cloth'],
    isFeatured: true,
    isNew: true,
    variants: [
      {
        colorNameEn: 'Ivory',
        colorNameFa: 'استخوانی',
        colorHex: '#EFE7DA',
        sku: 'NO-SG-5005-IVY',
        stock: 5,
        images: [shot('1508296695146-257a814070b4', 'front')],
      },
      {
        colorNameEn: 'Smoke',
        colorNameFa: 'دودی',
        colorHex: '#6E6E6E',
        sku: 'NO-SG-5005-SMK',
        stock: 0,
        images: [shot('1611222777277-61319d63ca94', 'front')],
      },
    ],
  },
  {
    slug: 'midnight-rectangle',
    sku: 'NO-SG-5006',
    nameEn: 'Midnight Rectangle',
    nameFa: 'میدنایت مستطیل',
    summaryEn: 'A flat rectangular frame with smoke lenses.',
    summaryFa: 'فریم مستطیلی تخت با عدسی دودی.',
    descriptionEn:
      'A low-profile rectangular sun frame with smoke lenses and a matte finish that hides everyday marks.',
    descriptionFa:
      'فریم آفتابی مستطیلی کم‌ارتفاع با عدسی دودی و پرداخت مات که اثرات روزمره را کمتر نشان می‌دهد.',
    brandSlug: 'noor-studio',
    categorySlug: 'sunglasses',
    price: 3950000,
    gender: 'men',
    shape: 'Rectangle',
    material: 'Acetate',
    frameSize: 'Medium',
    lensColor: 'Smoke',
    uvProtection: 'UV400',
    images: [shot('1608539733292-190446b22b83', 'front'), shot('1584036553516-bf83210aa16c', 'side')],
    includedAccessories: ['Soft pouch', 'Microfibre cloth'],
    variants: [
      {
        colorNameEn: 'Matte Black',
        colorNameFa: 'مشکی مات',
        colorHex: '#1A1A1A',
        sku: 'NO-SG-5006-BLK',
        stock: 7,
        images: [shot('1608539733292-190446b22b83', 'front')],
      },
    ],
  },

  /* ------------------------------------------------------ computer glasses */
  {
    slug: 'screen-calm-blue-light',
    sku: 'NO-CG-3001',
    nameEn: 'Screen Calm Blue Light',
    nameFa: 'اسکرین کالم فیلتر نور آبی',
    summaryEn: 'A lightweight frame with a blue-light filtering lens option.',
    summaryFa: 'فریم سبک با گزینه عدسی فیلتر نور آبی.',
    descriptionEn:
      'A TR90 frame paired with a blue-light filtering lens option for long screen sessions. Lightweight and comfortable for extended wear.',
    descriptionFa:
      'فریم TR90 همراه با گزینه عدسی فیلتر نور آبی برای ساعت‌های طولانی کار با نمایشگر. سبک و راحت برای استفاده طولانی.',
    brandSlug: 'lumen-optics',
    categorySlug: 'computer-glasses',
    price: 3950000,
    gender: 'unisex',
    shape: 'Rectangle',
    material: 'TR90',
    frameSize: 'Medium',
    specs: {
      ...frameSpecs('52mm', '18mm', '143mm'),
      lens_type: 'Computer',
      coating: 'Blue Light Filter',
      vision_type: 'single-vision',
    },
    images: [shot('1616769402452-267817d74fba', 'front'), shot('1616769364512-1e50e8266907', 'worn')],
    includedAccessories: ['Soft pouch', 'Microfibre cloth'],
    isFeatured: true,
    variants: [
      {
        colorNameEn: 'Matte Black',
        colorNameFa: 'مشکی مات',
        colorHex: '#202225',
        sku: 'NO-CG-3001-BLK',
        stock: 8,
        images: [shot('1616769402452-267817d74fba', 'front')],
      },
      {
        colorNameEn: 'Dark Brown',
        colorNameFa: 'قهوه‌ای تیره',
        colorHex: '#4A342A',
        sku: 'NO-CG-3001-BRN',
        stock: 5,
        images: [shot('1616769364512-1e50e8266907', 'front')],
      },
    ],
  },

  /* ----------------------------------------------------------- kids eyewear */
  {
    slug: 'noor-kids-flex',
    sku: 'NO-KD-4001',
    nameEn: 'Noor Kids Flex',
    nameFa: 'نور کیدز فلکس',
    summaryEn: 'A flexible kids frame with adjustable temples.',
    summaryFa: 'فریم انعطاف‌پذیر کودکان با دسته‌های قابل تنظیم.',
    descriptionEn:
      'A flexible TR90 frame sized for children, with temple tips that can be adjusted as the fit changes.',
    descriptionFa:
      'فریم انعطاف‌پذیر TR90 در سایز کودکان، با انتهای دسته قابل تنظیم برای تطبیق با تغییر فرم صورت.',
    brandSlug: 'noor-studio',
    categorySlug: 'kids-eyewear',
    price: 2450000,
    gender: 'kids',
    shape: 'Round',
    material: 'TR90',
    frameSize: 'Kids',
    specs: frameSpecs('42mm', '16mm', '125mm'),
    images: [shot('1593194777536-e155e6d100b2', 'front'), shot('1594918794521-a0c01cdff8c0', 'worn')],
    includedAccessories: ['Soft pouch', 'Microfibre cloth'],
    variants: [
      {
        colorNameEn: 'Soft Pink',
        colorNameFa: 'صورتی ملایم',
        colorHex: '#E58AA5',
        sku: 'NO-KD-4001-PNK',
        stock: 6,
        images: [shot('1593194777536-e155e6d100b2', 'front')],
      },
      {
        colorNameEn: 'Sky Blue',
        colorNameFa: 'آبی آسمانی',
        colorHex: '#6C93C4',
        sku: 'NO-KD-4001-BLU',
        stock: 4,
        images: [shot('1742321694002-77d33db25f68', 'front')],
      },
    ],
  },
  {
    slug: 'little-vision-blue-block',
    sku: 'NO-KD-4002',
    nameEn: 'Little Vision Blue Block',
    nameFa: 'لیتل ویژن بلو بلاک',
    summaryEn: 'A small frame for screen time and study.',
    summaryFa: 'فریمی کوچک برای زمان کار با نمایشگر و مطالعه.',
    descriptionEn:
      'A lightweight children\'s frame with a blue-light filtering lens option, sized for younger faces.',
    descriptionFa:
      'فریم سبک کودکان با گزینه عدسی فیلتر نور آبی، در سایز مناسب صورت‌های کوچک‌تر.',
    brandSlug: 'kian-vision',
    categorySlug: 'kids-eyewear',
    price: 2150000,
    gender: 'kids',
    shape: 'Square',
    material: 'TR90',
    frameSize: 'Kids',
    specs: {
      ...frameSpecs('44mm', '16mm', '128mm'),
      lens_type: 'Computer',
      coating: 'Blue Light Filter',
    },
    images: [shot('1576451674177-6ab18eba087c', 'front'), shot('1594918794521-a0c01cdff8c0', 'detail')],
    includedAccessories: ['Soft pouch', 'Microfibre cloth'],
    variants: [
      {
        colorNameEn: 'Navy',
        colorNameFa: 'سرمه‌ای',
        colorHex: '#1E3550',
        sku: 'NO-KD-4002-NVY',
        stock: 5,
        images: [shot('1576451674177-6ab18eba087c', 'front')],
      },
    ],
  },

  /* ---------------------------------------------------------- optical lenses */
  {
    slug: 'clearview-single-vision-lens',
    sku: 'NO-LN-6001',
    nameEn: 'ClearView Single Vision Lens',
    nameFa: 'عدسی تک‌بین کلیرویو',
    summaryEn: 'A single-vision lens with an anti-reflective coating.',
    summaryFa: 'عدسی تک‌بین با پوشش آنتی‌ریفلکس.',
    descriptionEn:
      'A single-vision lens in CR-39 with an anti-reflective coating. A straightforward option for light to moderate prescriptions. Price is per pair, frame excluded.',
    descriptionFa:
      'عدسی تک‌بین از جنس CR-39 با پوشش آنتی‌ریفلکس. گزینه‌ای ساده برای نسخه‌های سبک تا متوسط. قیمت برای یک جفت و بدون فریم است.',
    brandSlug: 'lumen-optics',
    categorySlug: 'optical-lenses',
    price: 780000,
    gender: 'unisex',
    specs: {
      lens_type: 'Single Vision',
      lens_material: 'CR-39',
      refractive_index: '1.50',
      coating: 'Anti-Reflective',
      vision_type: 'single-vision',
      photochromic: 'no',
    },
    images: [shot('1582143434535-eba55a806718', 'front'), shot('1762180335976-3bd3056de0ca', 'detail')],
    isFeatured: true,
    variants: [
      {
        colorNameEn: 'Clear',
        colorNameFa: 'شفاف',
        colorHex: '#F2F2F2',
        sku: 'NO-LN-6001-CLR',
        stock: 40,
        images: [shot('1582143434535-eba55a806718', 'front')],
      },
    ],
  },
  {
    slug: 'blueguard-computer-lens',
    sku: 'NO-LN-6002',
    nameEn: 'BlueGuard Computer Lens',
    nameFa: 'عدسی کامپیوتر بلوگارد',
    summaryEn: 'A polycarbonate lens with a blue-light filtering coating.',
    summaryFa: 'عدسی پلی‌کربنات با پوشش فیلتر نور آبی.',
    descriptionEn:
      'A polycarbonate computer lens with a blue-light filtering coating, intended for extended screen work. Price is per pair, frame excluded.',
    descriptionFa:
      'عدسی کامپیوتر از جنس پلی‌کربنات با پوشش فیلتر نور آبی، مناسب کار طولانی با نمایشگر. قیمت برای یک جفت و بدون فریم است.',
    brandSlug: 'lumen-optics',
    categorySlug: 'optical-lenses',
    price: 1650000,
    gender: 'unisex',
    specs: {
      lens_type: 'Computer',
      lens_material: 'Polycarbonate',
      refractive_index: '1.60',
      coating: 'Blue Light Filter',
      vision_type: 'single-vision',
      photochromic: 'no',
    },
    images: [shot('1762180335976-3bd3056de0ca', 'front'), shot('1616769402452-267817d74fba', 'detail')],
    isFeatured: true,
    variants: [
      {
        colorNameEn: 'Clear',
        colorNameFa: 'شفاف',
        colorHex: '#F2F2F2',
        sku: 'NO-LN-6002-CLR',
        stock: 35,
        images: [shot('1762180335976-3bd3056de0ca', 'front')],
      },
    ],
  },
  {
    slug: 'progressive-hd-lens',
    sku: 'NO-LN-6003',
    nameEn: 'Progressive HD Lens',
    nameFa: 'عدسی پیشرفته اچ‌دی',
    summaryEn: 'A high-index multifocal lens with a smoother transition.',
    summaryFa: 'عدسی چندفوکوس با ضریب شکست بالا و انتقال نرم‌تر.',
    descriptionEn:
      'A high-index progressive lens that keeps thickness lower for stronger prescriptions, with a wider reading zone. Price is per pair, frame excluded; lens mapping depends on your prescription.',
    descriptionFa:
      'عدسی پیشرفته با ضریب شکست بالا که در نسخه‌های قوی‌تر ضخامت را کمتر نگه می‌دارد و ناحیه مطالعه وسیع‌تری دارد. قیمت برای یک جفت و بدون فریم است و نقشه عدسی بر اساس نسخه شما تعیین می‌شود.',
    brandSlug: 'lumen-optics',
    categorySlug: 'optical-lenses',
    price: 4200000,
    gender: 'unisex',
    specs: {
      lens_type: 'Progressive',
      lens_material: 'High-Index',
      refractive_index: '1.67',
      coating: 'Anti-Reflective',
      vision_type: 'multifocal',
      photochromic: 'no',
    },
    images: [shot('1578903279423-9fe363f1f7b1', 'front'), shot('1582143434535-eba55a806718', 'detail')],
    variants: [
      {
        colorNameEn: 'Clear',
        colorNameFa: 'شفاف',
        colorHex: '#F2F2F2',
        sku: 'NO-LN-6003-CLR',
        stock: 20,
        images: [shot('1578903279423-9fe363f1f7b1', 'front')],
      },
    ],
  },
  {
    slug: 'photochromic-uv-lens',
    sku: 'NO-LN-6004',
    nameEn: 'Photochromic UV Lens',
    nameFa: 'عدسی فتوکرومیک',
    summaryEn: 'A lens that darkens outdoors and clears indoors.',
    summaryFa: 'عدسی که در فضای باز تیره و در فضای بسته شفاف می‌شود.',
    descriptionEn:
      'A photochromic lens option for people who move between indoors and outdoors. Darkening speed and final tint vary with temperature and UV exposure. Price is per pair, frame excluded.',
    descriptionFa:
      'گزینه عدسی فتوکرومیک برای افرادی که بین فضای بسته و باز رفت‌وآمد دارند. سرعت تیره شدن و میزان رنگ نهایی به دما و شدت نور فرابنفش بستگی دارد. قیمت برای یک جفت و بدون فریم است.',
    brandSlug: 'noor-studio',
    categorySlug: 'optical-lenses',
    price: 2850000,
    gender: 'unisex',
    specs: {
      lens_type: 'Photochromic',
      lens_material: 'High-Index',
      refractive_index: '1.60',
      coating: 'Photochromic',
      vision_type: 'single-vision',
      photochromic: 'yes',
    },
    images: [shot('1582143434535-eba55a806718', 'front'), shot('1544177586-c9b9fb1f45c2', 'detail')],
    variants: [
      {
        colorNameEn: 'Clear to Grey',
        colorNameFa: 'شفاف به خاکستری',
        colorHex: '#B9BDC1',
        sku: 'NO-LN-6004-GRY',
        stock: 18,
        images: [shot('1582143434535-eba55a806718', 'front')],
      },
    ],
  },

  /* --------------------------------------------------------- contact lenses */
  {
    slug: 'aqua-daily-comfort',
    sku: 'NO-CL-7001',
    nameEn: 'Aqua Daily Comfort',
    nameFa: 'آکوا دیلی کامفورت',
    summaryEn: 'Daily disposable contact lenses, 30 per box.',
    summaryFa: 'لنز تماسی یک‌روزه، ۳۰ عدد در بسته.',
    descriptionEn:
      'Daily disposable lenses in a 30-lens box. Prescription parameters are confirmed with you before dispatch, and the fit is checked in showroom fitting.',
    descriptionFa:
      'لنزهای یک‌روزه در بسته ۳۰ عددی. پارامترهای نسخه پیش از ارسال با شما تأیید و تناسب لنز در جلسه فیتینگ فروشگاه بررسی می‌شود.',
    brandSlug: 'vera-line',
    categorySlug: 'contact-lenses',
    price: 690000,
    gender: 'unisex',
    prescriptionCompatible: true,
    specs: {
      lens_type: 'Daily',
      replacement_schedule: 'Daily',
      pack_size: '30 lenses',
      water_content: '38%',
    },
    images: [shot('1530707114297-4af4b3cafe16', 'front'), shot('1599114317549-8d4e5233021f', 'detail')],
    isFeatured: true,
    variants: [
      {
        colorNameEn: 'Clear',
        colorNameFa: 'شفاف',
        colorHex: '#EEF3F5',
        sku: 'NO-CL-7001-30',
        stock: 24,
        images: [shot('1530707114297-4af4b3cafe16', 'front')],
      },
    ],
  },
  {
    slug: 'hydra-monthly-silicone',
    sku: 'NO-CL-7002',
    nameEn: 'Hydra Monthly Silicone',
    nameFa: 'هیدرا ماهانه سیلیکون',
    summaryEn: 'Monthly silicone hydrogel lenses, 6 per box.',
    summaryFa: 'لنز ماهانه سیلیکون هیدروژل، ۶ عدد در بسته.',
    descriptionEn:
      'Monthly replacement lenses in silicone hydrogel, supplied in a six-lens box with a care routine explained at fitting.',
    descriptionFa:
      'لنزهای ماهانه از جنس سیلیکون هیدروژل، در بسته شش عددی همراه با توضیح روش نگهداری در جلسه فیتینگ.',
    brandSlug: 'lumen-optics',
    categorySlug: 'contact-lenses',
    price: 1150000,
    gender: 'unisex',
    prescriptionCompatible: true,
    specs: {
      lens_type: 'Monthly',
      replacement_schedule: 'Monthly',
      pack_size: '6 lenses',
      water_content: '48%',
    },
    images: [shot('1599114317549-8d4e5233021f', 'front'), shot('1762180335976-3bd3056de0ca', 'detail')],
    variants: [
      {
        colorNameEn: 'Clear',
        colorNameFa: 'شفاف',
        colorHex: '#E9EFF2',
        sku: 'NO-CL-7002-6',
        stock: 16,
        images: [shot('1599114317549-8d4e5233021f', 'front')],
      },
    ],
  },
  {
    slug: 'toric-monthly-astigmatism',
    sku: 'NO-CL-7003',
    nameEn: 'Toric Monthly Astigmatism',
    nameFa: 'توریک ماهانه آستیگمات',
    summaryEn: 'Monthly toric lenses for astigmatism, 6 per box.',
    summaryFa: 'لنز ماهانه توریک برای آستیگمات، ۶ عدد در بسته.',
    descriptionEn:
      'Toric monthly lenses designed for astigmatic prescriptions. Additional parameters (cylinder and axis) are confirmed with you before ordering.',
    descriptionFa:
      'لنزهای ماهانه توریک برای نسخه‌های آستیگمات. پارامترهای تکمیلی (سیلندر و آکس) پیش از ثبت سفارش با شما تأیید می‌شود.',
    brandSlug: 'lumen-optics',
    categorySlug: 'contact-lenses',
    price: 1850000,
    gender: 'unisex',
    prescriptionCompatible: true,
    specs: {
      lens_type: 'Toric',
      replacement_schedule: 'Monthly',
      pack_size: '6 lenses',
      water_content: '48%',
    },
    images: [shot('1599114317549-8d4e5233021f', 'front'), shot('1578903279423-9fe363f1f7b1', 'detail')],
    variants: [
      {
        colorNameEn: 'Clear',
        colorNameFa: 'شفاف',
        colorHex: '#E9EFF2',
        sku: 'NO-CL-7003-6',
        stock: 10,
        images: [shot('1599114317549-8d4e5233021f', 'front')],
      },
    ],
  },

  /* ------------------------------------------------------------ accessories */
  {
    slug: 'leather-eyewear-case',
    sku: 'NO-AC-8001',
    nameEn: 'Leather Eyewear Case',
    nameFa: 'کاور چرمی عینک',
    summaryEn: 'A structured case with a soft interior lining.',
    summaryFa: 'کاور ساختاری با آستر نرم داخلی.',
    descriptionEn:
      'A hard-shell case with a soft lining that keeps frames protected in a bag. Fits medium and large frames.',
    descriptionFa:
      'کاور با بدنه سخت و آستر نرم که فریم را در کیف محافظت می‌کند. مناسب فریم‌های متوسط و بزرگ.',
    brandSlug: 'noor-studio',
    categorySlug: 'accessories',
    price: 620000,
    gender: 'unisex',
    images: [shot('1632986636968-04958bfbbf3f', 'front'), shot('1632986636900-a57d247122a2', 'detail')],
    isFeatured: true,
    variants: [
      {
        colorNameEn: 'Cognac',
        colorNameFa: 'قهوه‌ای روشن',
        colorHex: '#9A5A32',
        sku: 'NO-AC-8001-COG',
        stock: 12,
        images: [shot('1632986636968-04958bfbbf3f', 'front')],
      },
      {
        colorNameEn: 'Black',
        colorNameFa: 'مشکی',
        colorHex: '#151515',
        sku: 'NO-AC-8001-BLK',
        stock: 9,
        images: [shot('1632986636900-a57d247122a2', 'front')],
      },
    ],
  },
  {
    slug: 'microfibre-care-kit',
    sku: 'NO-AC-8002',
    nameEn: 'Microfibre Care Kit',
    nameFa: 'کیت نگهداری میکروفایبر',
    summaryEn: 'Cleaning cloth, spray and a small screwdriver.',
    summaryFa: 'دستمال تمیزکننده، اسپری و پیچ‌گوشتی کوچک.',
    descriptionEn:
      'An everyday care kit: microfibre cloth, lens spray and a small screwdriver for temple screws.',
    descriptionFa:
      'کیت نگهداری روزمره: دستمال میکروفایبر، اسپری عدسی و پیچ‌گوشتی کوچک برای پیچ‌های دسته.',
    brandSlug: 'kian-vision',
    categorySlug: 'accessories',
    price: 320000,
    gender: 'unisex',
    images: [shot('1632986636900-a57d247122a2', 'front'), shot('1632986636968-04958bfbbf3f', 'detail')],
    variants: [
      {
        colorNameEn: 'Neutral',
        colorNameFa: 'خنثی',
        colorHex: '#D8D3C8',
        sku: 'NO-AC-8002-STD',
        stock: 25,
        images: [shot('1632986636900-a57d247122a2', 'front')],
      },
    ],
  },
  {
    slug: 'showroom-display-stand',
    sku: 'NO-AC-8003',
    nameEn: 'Showroom Display Stand',
    nameFa: 'استند نمایش فروشگاهی',
    summaryEn: 'A minimal stand for presenting frames.',
    summaryFa: 'استندی مینیمال برای نمایش فریم.',
    descriptionEn:
      'A minimal display stand for presenting a single frame on a counter or shelf. Intended for showroom use.',
    descriptionFa:
      'استند مینیمال برای نمایش یک فریم روی پیشخوان یا قفسه. مناسب استفاده در فروشگاه.',
    brandSlug: 'noor-studio',
    categorySlug: 'accessories',
    price: 900000,
    gender: 'unisex',
    images: [shot('1764778055595-b641b067ab40', 'front'), shot('1486250944723-86bca2b15b06', 'scene')],
    variants: [
      {
        colorNameEn: 'Ivory',
        colorNameFa: 'استخوانی',
        colorHex: '#F1EDE4',
        sku: 'NO-AC-8003-IVY',
        stock: 4,
        images: [shot('1764778055595-b641b067ab40', 'front')],
      },
    ],
  },
];
