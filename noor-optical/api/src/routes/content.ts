import { Router } from 'express';
import { query, queryOne } from '../db.js';
import { asyncRoute, notFoundError, requiredString } from '../http.js';

export const contentRouter = Router();

export type PublicSettings = {
  brand: { nameEn: string; nameFa: string; tagline_en: string; tagline_fa: string };
  announcement: { enabled: boolean; textEn: string; textFa: string; href: string | null };
  contact: {
    phone: string;
    whatsapp: string | null;
    email: string;
    addressEn: string;
    addressFa: string;
    hoursEn: string;
    hoursFa: string;
    instagram: string | null;
    mapUrl: string | null;
  };
  commerce: {
    currency: string;
    shippingFlat: number;
    freeShippingThreshold: number | null;
    codEnabled: boolean;
    deliveryDaysEn: string;
    deliveryDaysFa: string;
    returnsEn: string;
    returnsFa: string;
  };
  hero: { headlineEn: string; headlineFa: string; bodyEn: string; bodyFa: string; imageUrl: string };
  trust: Array<{ titleEn: string; titleFa: string; bodyEn: string; bodyFa: string }>;
  optometrist: {
    nameEn: string;
    nameFa: string;
    titleEn: string;
    titleFa: string;
    bioEn: string;
    bioFa: string;
    imageUrl: string;
    credentialsEn: string;
    credentialsFa: string;
  };
  about: {
    eyebrowEn: string;
    eyebrowFa: string;
    titleEn: string;
    titleFa: string;
    p1En: string;
    p1Fa: string;
    p2En: string;
    p2Fa: string;
    p3En: string;
    p3Fa: string;
    v1TitleEn: string;
    v1TitleFa: string;
    v1BodyEn: string;
    v1BodyFa: string;
    v2TitleEn: string;
    v2TitleFa: string;
    v2BodyEn: string;
    v2BodyFa: string;
    v3TitleEn: string;
    v3TitleFa: string;
    v3BodyEn: string;
    v3BodyFa: string;
  };
  seo: {
    titleEn: string;
    titleFa: string;
    descriptionEn: string;
    descriptionFa: string;
    ogImageUrl: string;
  };
};

export const DEFAULT_SETTINGS: PublicSettings = {
  brand: {
    nameEn: 'NOOR OPTICAL',
    nameFa: 'فروشگاه تخصصی عینک نور',
    tagline_en: 'Clearer · Brighter · Together',
    tagline_fa: 'شفاف‌تر · روشن‌تر · همراه شما',
  },
  announcement: {
    enabled: true,
    textEn: 'Complimentary frame adjustment and cleaning at our showroom.',
    textFa: 'تنظیم و شست‌وشوی رایگان عینک در فروشگاه.',
    href: '/services',
  },
  contact: {
    phone: '+98 21 0000 0000',
    whatsapp: null,
    email: 'hello@nooroptical.example',
    addressEn: 'Showroom address — update in the admin panel',
    addressFa: 'نشانی فروشگاه — از پنل مدیریت ویرایش کنید',
    hoursEn: 'Saturday to Thursday, 10:00 – 20:00',
    hoursFa: 'شنبه تا پنجشنبه، ۱۰:۰۰ تا ۲۰:۰۰',
    instagram: null,
    mapUrl: null,
  },
  commerce: {
    currency: 'IRT',
    shippingFlat: 120000,
    freeShippingThreshold: 5000000,
    codEnabled: true,
    deliveryDaysEn: '2 – 4 working days after confirmation',
    deliveryDaysFa: '۲ تا ۴ روز کاری پس از تأیید سفارش',
    returnsEn: 'Returns accepted within 7 days for unused items in original packaging.',
    returnsFa: 'در صورت استفاده‌نشدن و سالم بودن بسته‌بندی، تا ۷ روز امکان بازگشت وجود دارد.',
  },
  hero: {
    headlineEn: 'See the World Differently.',
    headlineFa: 'دنیایی شفاف‌تر، با انتخابی هوشمندانه',
    bodyEn:
      'Discover eyewear that combines exceptional design, everyday comfort, and optical precision.',
    bodyFa: 'عینک مناسب خود را با ترکیبی از زیبایی، راحتی و کیفیت انتخاب کنید.',
    imageUrl:
      'https://images.unsplash.com/photo-1604781099561-c70393a38a6d?auto=format&fit=crop&q=80&w=1800',
  },
  trust: [
    {
      titleEn: 'Frame collections for every style',
      titleFa: 'مجموعه فریم برای هر سلیقه',
      bodyEn: 'Curated shapes, materials and sizes for daily and special occasions.',
      bodyFa: 'مدل‌ها، متریال و سایزهای متنوع برای استفاده روزمره و مناسب‌های خاص.',
    },
    {
      titleEn: 'Professional lens consultation',
      titleFa: 'مشاوره تخصصی عدسی',
      bodyEn: 'Guidance on lens material, coating and refractive index options.',
      bodyFa: 'راهنمایی درباره متریال، پوشش و ضریب شکست عدسی‌ها.',
    },
    {
      titleEn: 'After-sales support',
      titleFa: 'پشتیبانی پس از فروش',
      bodyEn: 'Adjustment, cleaning and follow-up through the showroom.',
      bodyFa: 'تنظیم، شست‌وشو و پیگیری سفارش از طریق فروشگاه.',
    },
  ],
  optometrist: {
    nameEn: 'Dr. Noor Ayazi',
    nameFa: 'دکتر نور آیازی',
    titleEn: 'Optometrist and Eyewear Specialist',
    titleFa: 'اوتومتریست و متخصص عینک',
    bioEn: 'With over fifteen years of experience in optical care, Dr. Ayazi founded Noor Optical to bring precision lens fitting and frame styling to every customer.',
    bioFa: 'با بیش از پانزده سال تجربه در مراقبت‌های اپتیک، دکتر آیازی فروشگاه نور اپتیک را برای ارائه دقیق تنظیم عدسی و انتخاب فریم تأسیس کرد.',
    imageUrl: '',
    credentialsEn: 'Doctor of Optometry, Member of the Iranian Optometric Association',
    credentialsFa: 'دکترای اپتومتری، عضو انجمن اپتومتری ایران',
  },
  about: {
    eyebrowEn: 'About Noor Optical',
    eyebrowFa: 'درباره نور اپتیک',
    titleEn: 'A showroom built around careful choices',
    titleFa: 'فروشگاهی برای انتخاب دقیق عینک',
    p1En: 'Noor Optical is a specialised eyewear showroom focused on getting frame and lens choices right. Our collection is organised by shape, material and size to make choosing simpler.',
    p1Fa: 'نور اپتیک یک فروشگاه تخصصی عینک است که روی انتخاب دقیق فریم و عدسی تمرکز دارد. مجموعه ما بر اساس فرم، متریال و سایز دسته‌بندی شده تا انتخاب ساده‌تر شود.',
    p2En: 'We make no medical claims. Our work is guidance on frame fit, lens material and eyewear care.',
    p2Fa: 'ما ادعای پزشکی یا درمانی نمی‌کنیم؛ کار ما راهنمایی درباره تناسب فریم، متریال عدسی و نگهداری عینک است.',
    p3En: 'Contact details, opening hours and services on this site are editable from the store admin panel.',
    p3Fa: 'اطلاعات تماس، ساعات کاری و خدمات این صفحه از پنل مدیریت فروشگاه قابل ویرایش است.',
    v1TitleEn: 'Straight information',
    v1TitleFa: 'شفافیت در اطلاعات',
    v1BodyEn: 'We show frame and lens specifications as they are, and never invent data.',
    v1BodyFa: 'مشخصات فریم و عدسی را همان‌طور که هست نمایش می‌دهیم و داده‌ای را از خود نمی‌سازیم.',
    v2TitleEn: 'Informed choices',
    v2TitleFa: 'انتخاب آگاهانه',
    v2BodyEn: 'We explain how material, index and coating differ, so the decision is yours to make knowingly.',
    v2BodyFa: 'تفاوت متریال، ضریب شکست و پوشش را توضیح می‌دهیم تا انتخاب شما بر پایه آگاهی باشد.',
    v3TitleEn: 'Support after purchase',
    v3TitleFa: 'پشتیبانی پس از خرید',
    v3BodyEn: 'Adjustment, cleaning and order follow-up happen in the showroom.',
    v3BodyFa: 'تنظیم، شست‌وشو و پیگیری سفارش در فروشگاه انجام می‌شود.',
  },
  seo: {
    titleEn: 'NOOR OPTICAL — Premium Eyewear & Optical Care',
    titleFa: 'فروشگاه تخصصی عینک نور — عینک و خدمات اپتیک',
    descriptionEn: 'Discover premium eyewear, prescription lenses, and professional optical services at Noor Optical.',
    descriptionFa: 'عینک‌های پریمیوم، عدسی طبی و خدمات اپتیک حرفه‌ای را در فروشگاه نور اپتیک کشف کنید.',
    ogImageUrl: '',
  },
};

/** Arrays and scalars replace a default wholesale; only plain objects merge. */
const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Settings are stored as one row per top-level section. */
export const readSettings = async (): Promise<PublicSettings> => {
  const rows = await query<{ key: string; value: unknown }>('SELECT key, value FROM settings');
  const merged = { ...DEFAULT_SETTINGS } as Record<string, unknown>;
  for (const row of rows) {
    if (row.value === null || row.value === undefined) continue;
    const current = merged[row.key];
    merged[row.key] =
      isPlainObject(row.value) && isPlainObject(current) ? { ...current, ...row.value } : row.value;
  }
  return merged as PublicSettings;
};

export const writeSettings = async (patch: Record<string, unknown>): Promise<PublicSettings> => {
  const allowed = Object.keys(DEFAULT_SETTINGS);
  for (const [key, value] of Object.entries(patch)) {
    if (!allowed.includes(key)) continue;
    const existing = await queryOne<{ value: unknown }>('SELECT value FROM settings WHERE key = $1', [key]);
    const merged =
      isPlainObject(value) && isPlainObject(existing?.value)
        ? { ...existing.value, ...value }
        : value;
    await query(
      `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [key, JSON.stringify(merged)],
    );
  }
  return readSettings();
};

contentRouter.get(
  '/settings',
  asyncRoute(async (_req, res) => {
    res.json(await readSettings());
  }),
);

contentRouter.get(
  '/services',
  asyncRoute(async (_req, res) => {
    const rows = await query<Record<string, unknown>>(
      `SELECT * FROM services WHERE is_active = TRUE ORDER BY sort_order, id`,
    );
    res.json({
      items: rows.map((row) => ({
        slug: String(row.slug),
        nameEn: String(row.name_en),
        nameFa: String(row.name_fa),
        summaryEn: (row.summary_en as string | null) ?? null,
        summaryFa: (row.summary_fa as string | null) ?? null,
        descriptionEn: (row.description_en as string | null) ?? null,
        descriptionFa: (row.description_fa as string | null) ?? null,
        durationEn: (row.duration_en as string | null) ?? null,
        durationFa: (row.duration_fa as string | null) ?? null,
        priceFrom: row.price_from === null ? null : Number(row.price_from),
        imageUrl: (row.image_url as string | null) ?? null,
      })),
    });
  }),
);

contentRouter.get(
  '/services/:slug',
  asyncRoute(async (req, res) => {
    const slug = requiredString(req.params.slug, 'slug', { max: 120 });
    const row = await queryOne<Record<string, unknown>>(
      `SELECT * FROM services WHERE slug = $1 AND is_active = TRUE`,
      [slug],
    );
    if (!row) throw notFoundError('Service not found');
    res.json({
      slug: String(row.slug),
      nameEn: String(row.name_en),
      nameFa: String(row.name_fa),
      summaryEn: (row.summary_en as string | null) ?? null,
      summaryFa: (row.summary_fa as string | null) ?? null,
      descriptionEn: (row.description_en as string | null) ?? null,
      descriptionFa: (row.description_fa as string | null) ?? null,
      durationEn: (row.duration_en as string | null) ?? null,
      durationFa: (row.duration_fa as string | null) ?? null,
      priceFrom: row.price_from === null ? null : Number(row.price_from),
      imageUrl: (row.image_url as string | null) ?? null,
    });
  }),
);
