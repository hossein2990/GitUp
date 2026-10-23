import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Locale } from './types';

/**
 * Bilingual copy. Each entry is [Persian, English]; the Persian interface is the
 * default because the brand is Persian, and every layout mirrors through
 * logical properties rather than element-by-element reversal.
 */
const messages = {
  'brand.name': ['نور اپتیک', 'NOOR OPTICAL'],
  'brand.full': ['فروشگاه تخصصی عینک نور', 'Noor Optical Eyewear Boutique'],

  'nav.home': ['خانه', 'Home'],
  'nav.eyeglasses': ['عینک طبی', 'Eyeglasses'],
  'nav.sunglasses': ['عینک آفتابی', 'Sunglasses'],
  'nav.lenses': ['عدسی طبی', 'Optical Lenses'],
  'nav.contacts': ['لنز تماسی', 'Contact Lenses'],
  'nav.computer': ['عینک کامپیوتر', 'Computer Glasses'],
  'nav.kids': ['عینک کودکان', "Kids' Eyewear"],
  'nav.premium': ['فریم پرمیوم', 'Premium Frames'],
  'nav.accessories': ['لوازم جانبی', 'Accessories'],
  'nav.brands': ['برندها', 'Brands'],
  'nav.services': ['خدمات تخصصی', 'Optical Services'],
  'nav.about': ['درباره ما', 'About Us'],
  'nav.contact': ['تماس با ما', 'Contact'],
  'nav.appointment': ['رزرو وقت', 'Book Appointment'],
  'nav.sale': ['تخفیف‌ها', 'Sale'],
  'nav.more': ['بیشتر', 'More'],

  'action.search': ['جستجو', 'Search'],
  'action.account': ['حساب من', 'Account'],
  'action.favorites': ['علاقه‌مندی‌ها', 'Favorites'],
  'action.bag': ['سبد خرید', 'Shopping bag'],
  'action.menu': ['منو', 'Menu'],
  'action.close': ['بستن', 'Close'],
  'action.addToBag': ['افزودن به سبد', 'Add to bag'],
  'action.quickView': ['نمای سریع', 'Quick view'],
  'action.viewAll': ['مشاهده همه', 'View all'],
  'action.viewDetails': ['جزئیات محصول', 'Product details'],
  'action.shopNow': ['خرید کنید', 'Shop now'],
  'action.learnMore': ['بیشتر بدانید', 'Learn more'],
  'action.bookAppointment': ['رزرو وقت', 'Request appointment'],
  'action.contactUs': ['تماس با ما', 'Contact us'],
  'action.send': ['ارسال', 'Send'],
  'action.sending': ['در حال ارسال…', 'Sending…'],
  'action.clearAll': ['حذف همه فیلترها', 'Clear all filters'],
  'action.filters': ['فیلترها', 'Filters'],
  'action.previous': ['قبلی', 'Previous'],
  'action.next': ['بعدی', 'Next'],
  'action.share': ['اشتراک‌گذاری', 'Share'],
  'action.copied': ['لینک کپی شد', 'Link copied'],
  'action.remove': ['حذف', 'Remove'],
  'action.retry': ['تلاش دوباره', 'Retry'],
  'action.trackOrder': ['پیگیری سفارش', 'Track order'],
  'action.continueShopping': ['ادامه خرید', 'Continue shopping'],
  'action.checkout': ['ادامه فرآیند خرید', 'Proceed to checkout'],
  'action.placeOrder': ['ثبت سفارش', 'Place order'],
  'action.login': ['ورود', 'Sign in'],
  'action.logout': ['خروج', 'Sign out'],
  'action.register': ['ایجاد حساب', 'Create account'],
  'action.myAccount': ['حساب کاربری', 'My account'],
  'action.orderHistory': ['سفارش‌های من', 'My orders'],
  'action.save': ['ذخیره', 'Save'],
  'action.saved': ['ذخیره شد', 'Saved'],
  'action.cancel': ['انصراف', 'Cancel'],
  'action.confirm': ['تأیید', 'Confirm'],
  'action.more': ['بیشتر', 'Load more'],
  'action.backHome': ['بازگشت به خانه', 'Back to home'],

  'common.loading': ['در حال بارگذاری…', 'Loading…'],
  'common.errorTitle': ['مشکلی پیش آمد', 'Something went wrong'],
  'common.errorBody': [
    'ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.',
    'We could not reach the store. Please try again.',
  ],
  'common.noResults': ['نتیجه‌ای پیدا نشد', 'No products found'],
  'common.new': ['جدید', 'New'],
  'common.featured': ['منتخب', 'Featured'],
  'common.sale': ['تخفیف', 'Sale'],
  'common.inStock': ['موجود', 'In stock'],
  'common.outOfStock': ['ناموجود', 'Out of stock'],
  'common.optional': ['اختیاری', 'Optional'],
  'common.from': ['از', 'From'],
  'common.to': ['تا', 'To'],
  'common.results': ['{count} محصول', '{count} products'],
  'common.showing': ['نمایش {from} تا {to} از {total}', 'Showing {from}–{to} of {total}'],
  'common.pageOf': ['صفحه {page} از {total}', 'Page {page} of {total}'],
  'common.yes': ['دارد', 'Yes'],
  'common.no': ['ندارد', 'No'],
  'common.notSpecified': ['ثبت نشده', 'Not specified'],
  'common.pageNotFound': ['صفحه مورد نظر پیدا نشد', 'This page could not be found'],
  'common.pageNotFoundBody': [
    'ممکن است لینک تغییر کرده باشد. از منوی اصلی ادامه دهید.',
    'The link may have changed. Continue from the main menu.',
  ],

  'home.heroEyebrow': ['مجموعه جدید ۱۴۰۴', 'New collection'],
  'home.trustTitle': ['چرا نور اپتیک', 'Why Noor Optical'],
  'home.categoriesEyebrow': ['خرید بر اساس دسته', 'Shop by category'],
  'home.categoriesTitle': ['دسته‌بندی‌ها', 'Browse the collections'],
  'home.categoriesBody': [
    'از فریم‌های طبی روزمره تا عدسی و لنز تماسی؛ همه در یک مجموعه منظم.',
    'From everyday optical frames to lenses and contact lenses — organised the way you shop.',
  ],
  'home.featuredEyebrow': ['مجموعه منتخب', 'Curated collection'],
  'home.featuredTitle': ['منتخب عینک‌های نور', 'Featured Eyewear'],
  'home.featuredBody': [
    'فریم‌هایی که بیشترین درخواست را در فروشگاه دارند.',
    'The frames our customers ask for most often.',
  ],
  'home.featuredAll': ['مشاهده همه محصولات', 'Browse all products'],
  'home.lensEyebrow': ['راهنمای عدسی', 'Lens guide'],
  'home.lensTitle': ['عدسی مناسب خود را بشناسید', 'Understand your lens options'],
  'home.lensBody': [
    'متریال، ضریب شکست و پوشش، سه انتخابی هستند که ضخامت، بازتاب و راحتی عینک شما را تعیین می‌کنند.',
    'Material, refractive index and coating decide how thick, reflective and comfortable your lenses feel.',
  ],
  'home.editorialEyebrow': ['فروشگاه ما', 'Our showroom'],
  'home.editorialTitle': ['تجربه انتخاب فریم، حضوری و دقیق', 'Frame selection, guided in person'],
  'home.editorialBody': [
    'در فروشگاه، فرم و سایز فریم‌ها را روی صورت خود تست می‌کنید و درباره عدسی مناسب مشاوره می‌گیرید.',
    'In the showroom you try shapes and sizes on your own face and get advice on the right lens setup.',
  ],
  'home.servicesEyebrow': ['خدمات تخصصی', 'Optical services'],
  'home.servicesTitle': ['خدماتی که ارائه می‌دهیم', 'Services available in store'],
  'home.appointmentTitle': ['وقت مشاوره رزرو کنید', 'Book a consultation'],
  'home.appointmentBody': [
    'برای انتخاب فریم یا مشاوره عدسی، وقت حضوری رزرو کنید. تأیید نهایی تلفنی انجام می‌شود.',
    'Request a showroom slot for frame styling or lens advice. We confirm every request by phone.',
  ],
  'home.guideCta': ['مطالعه راهنمای کامل', 'Read the full guide'],

  'catalog.filtersTitle': ['فیلترها', 'Filters'],
  'catalog.sortBy': ['مرتب‌سازی', 'Sort by'],
  'catalog.sortRelevance': ['مرتبط‌ترین', 'Relevance'],
  'catalog.sortNewest': ['جدیدترین', 'Newest'],
  'catalog.sortPriceAsc': ['ارزان‌ترین', 'Price: low to high'],
  'catalog.sortPriceDesc': ['گران‌ترین', 'Price: high to low'],
  'catalog.sortName': ['نام (الفبا)', 'Name (A–Z)'],
  'catalog.activeFilters': ['فیلترهای فعال', 'Active filters'],
  'catalog.priceRange': ['محدوده قیمت', 'Price range'],
  'catalog.applyPrice': ['اعمال', 'Apply'],
  'catalog.openFilters': ['نمایش فیلترها', 'Show filters'],
  'catalog.emptyTitle': ['محصولی با این فیلترها پیدا نشد', 'No products match these filters'],
  'catalog.emptyBody': [
    'یکی از فیلترها را حذف کنید یا همه فیلترها را پاک کنید.',
    'Remove a filter, or clear them all to start again.',
  ],
  'catalog.countLabel': ['تعداد', 'Count'],

  'filter.brand': ['برند', 'Brand'],
  'filter.category': ['دسته‌بندی', 'Category'],
  'filter.shape': ['فرم فریم', 'Frame shape'],
  'filter.material': ['متریال فریم', 'Frame material'],
  'filter.gender': ['جنسیت', 'Style preference'],
  'filter.color': ['رنگ فریم', 'Frame colour'],
  'filter.frame_size': ['سایز فریم', 'Frame size'],
  'filter.lens_color': ['رنگ عدسی', 'Lens colour'],
  'filter.uv_protection': ['محافظت UV', 'UV protection'],
  'filter.availability': ['موجودی', 'Availability'],
  'filter.prescription': ['قابل استفاده با نسخه', 'Prescription compatible'],
  'filter.polarized': ['پولاریزه', 'Polarised'],
  'filter.lens_type': ['نوع عدسی', 'Lens type'],
  'filter.lens_material': ['متریال عدسی', 'Lens material'],
  'filter.refractive_index': ['ضریب شکست', 'Refractive index'],
  'filter.coating': ['پوشش', 'Coating'],
  'filter.vision_type': ['نوع دید', 'Vision type'],
  'filter.photochromic': ['فتوکرومیک', 'Photochromic'],
  'filter.replacement_schedule': ['دوره تعویض', 'Replacement schedule'],
  'filter.pack_size': ['تعداد در بسته', 'Pack size'],
  'filter.water_content': ['درصد آب', 'Water content'],
  'filter.in-stock': ['فقط موجود', 'In stock only'],
  'filter.out-of-stock': ['ناموجود', 'Out of stock'],

  'product.sku': ['کد کالا', 'SKU'],
  'product.color': ['رنگ', 'Colour'],
  'product.selectColor': ['انتخاب رنگ', 'Select colour'],
  'product.quantity': ['تعداد', 'Quantity'],
  'product.shape': ['فرم', 'Shape'],
  'product.material': ['متریال', 'Material'],
  'product.frameSize': ['سایز', 'Size'],
  'product.frameDimensions': ['ابعاد فریم', 'Frame dimensions'],
  'product.lensWidth': ['عرض عدسی', 'Lens width'],
  'product.bridge': ['پل بینی', 'Bridge'],
  'product.temple': ['طول دسته', 'Temple'],
  'product.lensColor': ['رنگ عدسی', 'Lens colour'],
  'product.uv': ['محافظت UV', 'UV protection'],
  'product.polarized': ['پولاریزه', 'Polarised'],
  'product.prescriptionCompatible': ['قابل استفاده با نسخه', 'Prescription compatible'],
  'product.accessories': ['لوازم همراه', 'Included accessories'],
  'product.warranty': ['گارانتی', 'Warranty'],
  'product.warrantyPending': [
    'اطلاعات گارانتی توسط فروشگاه ثبت نشده است.',
    'Warranty details have not been recorded yet.',
  ],
  'product.specs': ['مشخصات فنی', 'Technical specifications'],
  'product.description': ['توضیحات', 'Description'],
  'product.delivery': ['ارسال و تحویل', 'Delivery'],
  'product.returns': ['بازگشت کالا', 'Returns'],
  'product.related': ['محصولات مرتبط', 'You may also like'],
  'product.gallery': ['تصاویر محصول', 'Product images'],
  'product.viewFront': ['نمای روبرو', 'Front view'],
  'product.viewSide': ['نمای کنار', 'Side view'],
  'product.viewDetail': ['جزئیات', 'Detail'],
  'product.viewWorn': ['روی صورت', 'On face'],
  'product.zoomHint': ['برای بزرگ‌نمایی کلیک کنید', 'Click to enlarge'],
  'product.addToFavorites': ['افزودن به علاقه‌مندی‌ها', 'Save to favorites'],
  'product.removeFromFavorites': ['حذف از علاقه‌مندی‌ها', 'Remove from favorites'],
  'product.viewFullscreen': ['نمایش تمام‌صفحه', 'View fullscreen'],
  'product.prescriptionNote': [
    'برای عدسی طبی، نسخه خود را در مرحله پرداخت وارد می‌کنید یا بعداً ارسال می‌کنید.',
    'For prescription lenses, add your prescription at checkout or send it later.',
  ],

  'spec.lens_width': ['عرض عدسی', 'Lens width'],
  'spec.bridge': ['پل بینی', 'Bridge'],
  'spec.temple': ['طول دسته', 'Temple'],
  'spec.lens_type': ['نوع عدسی', 'Lens type'],
  'spec.lens_material': ['متریال عدسی', 'Lens material'],
  'spec.refractive_index': ['ضریب شکست', 'Refractive index'],
  'spec.coating': ['پوشش', 'Coating'],
  'spec.vision_type': ['نوع دید', 'Vision type'],
  'spec.photochromic': ['فتوکرومیک', 'Photochromic'],
  'spec.replacement_schedule': ['دوره تعویض', 'Replacement schedule'],
  'spec.pack_size': ['تعداد در بسته', 'Pack size'],
  'spec.water_content': ['درصد آب', 'Water content'],

  'cart.title': ['سبد خرید', 'Shopping bag'],
  'cart.empty': ['سبد خرید شما خالی است', 'Your bag is empty'],
  'cart.emptyBody': [
    'محصولی را از مجموعه‌ها انتخاب کنید تا اینجا نمایش داده شود.',
    'Choose something from the collections and it will appear here.',
  ],
  'cart.subtotal': ['جمع کالاها', 'Subtotal'],
  'cart.shipping': ['هزینه ارسال', 'Shipping'],
  'cart.shippingFree': ['رایگان', 'Free'],
  'cart.total': ['مبلغ قابل پرداخت', 'Total'],
  'cart.freeShippingNote': [
    'برای سفارش‌های بالای {amount} ارسال رایگان است.',
    'Free delivery on orders above {amount}.',
  ],
  'cart.deliveryNote': [
    'زمان تحویل پس از تأیید سفارش اعلام می‌شود.',
    'Delivery time is confirmed after the order is reviewed.',
  ],
  'cart.prescription': ['وضعیت نسخه', 'Prescription'],

  'checkout.title': ['تکمیل سفارش', 'Checkout'],
  'checkout.contact': ['اطلاعات تماس', 'Contact details'],
  'checkout.delivery': ['تحویل', 'Delivery'],
  'checkout.fullName': ['نام و نام خانوادگی', 'Full name'],
  'checkout.email': ['ایمیل', 'Email'],
  'checkout.phone': ['شماره تماس', 'Phone'],
  'checkout.address': ['نشانی', 'Address'],
  'checkout.city': ['شهر', 'City'],
  'checkout.postalCode': ['کد پستی', 'Postal code'],
  'checkout.note': ['توضیحات سفارش', 'Order note'],
  'checkout.deliveryMethod': ['روش تحویل', 'Delivery method'],
  'checkout.deliveryHome': ['ارسال به نشانی', 'Deliver to my address'],
  'checkout.pickup': ['تحویل حضوری در فروشگاه', 'Collect in store'],
  'checkout.prescriptionStatus': ['نسخه طبی', 'Prescription'],
  'checkout.prescriptionUploaded': ['نسخه را وارد کرده‌ام', 'I have my prescription ready'],
  'checkout.prescriptionLater': ['بعداً ارسال می‌کنم', 'I will send it later'],
  'checkout.prescriptionNotRequired': ['نسخه لازم نیست', 'Not required'],
  'checkout.prescriptionFields': ['جزئیات نسخه (اختیاری)', 'Prescription details (optional)'],
  'checkout.prescriptionHint': [
    'اعداد نسخه را می‌توانید اینجا وارد کنید یا از طریق تماس ارسال کنید.',
    'Enter your prescription values here, or send them to us later.',
  ],
  'checkout.paymentTitle': ['پرداخت', 'Payment'],
  'checkout.paymentNote': [
    'این نسخه نمایشی درگاه پرداخت ندارد؛ سفارش ثبت می‌شود و برای تأیید و پرداخت با شما تماس گرفته می‌شود.',
    'This build has no payment gateway: the order is recorded and we contact you to confirm and take payment.',
  ],
  'checkout.summary': ['خلاصه سفارش', 'Order summary'],
  'checkout.incomplete': ['لطفاً فیلدهای لازم را کامل کنید.', 'Please complete the required fields.'],

  'order.received': ['سفارش شما ثبت شد', 'Your order has been placed'],
  'order.thanks': [
    'برای تأیید و هماهنگی ارسال با شما تماس می‌گیریم.',
    'We will contact you to confirm and arrange delivery.',
  ],
  'order.number': ['شماره سفارش', 'Order number'],
  'order.status': ['وضعیت', 'Status'],
  'order.trackTitle': ['پیگیری سفارش', 'Track an order'],
  'order.trackBody': [
    'شماره سفارش و ایمیل ثبت‌شده را وارد کنید.',
    'Enter your order number and the email used at checkout.',
  ],
  'order.notFound': ['سفارشی با این اطلاعات پیدا نشد.', 'No order matches those details.'],
  'order.status.pending': ['در انتظار بررسی', 'Pending review'],
  'order.status.confirmed': ['تأیید شده', 'Confirmed'],
  'order.status.preparing': ['در حال آماده‌سازی', 'Preparing'],
  'order.status.shipped': ['ارسال شده', 'Shipped'],
  'order.status.delivered': ['تحویل شده', 'Delivered'],
  'order.status.cancelled': ['لغو شده', 'Cancelled'],
  'order.prescription.uploaded': ['نسخه وارد شد', 'Prescription provided'],
  'order.prescription.later': ['نسخه بعداً ارسال می‌شود', 'Prescription to follow'],
  'order.prescription.not_required': ['بدون نسخه', 'No prescription needed'],

  'account.title': ['حساب کاربری', 'My account'],
  'account.profile': ['اطلاعات من', 'My details'],
  'account.orders': ['سفارش‌های من', 'My orders'],
  'account.noOrders': ['هنوز سفارشی ثبت نشده است.', 'You have not placed any orders yet.'],
  'account.guestTitle': ['ورود به حساب', 'Sign in'],
  'account.guestBody': [
    'برای مشاهده سفارش‌ها وارد شوید، یا سفارش مهمان را با شماره و ایمیل پیگیری کنید.',
    'Sign in to see your orders, or track a guest order by number and email.',
  ],
  'account.updated': ['اطلاعات به‌روزرسانی شد.', 'Your details were updated.'],

  'auth.loginTitle': ['ورود به حساب', 'Sign in'],
  'auth.registerTitle': ['ایجاد حساب جدید', 'Create your account'],
  'auth.password': ['گذرواژه', 'Password'],
  'auth.passwordHint': ['حداقل ۸ کاراکتر', 'At least 8 characters'],
  'auth.fullName': ['نام و نام خانوادگی', 'Full name'],
  'auth.phone': ['شماره تماس', 'Phone'],
  'auth.haveAccount': ['حساب دارید؟ وارد شوید', 'Already have an account? Sign in'],
  'auth.noAccount': ['حساب ندارید؟ ثبت‌نام کنید', 'No account yet? Create one'],
  'auth.staffNote': [
    'کارکنان فروشگاه از همین صفحه وارد پنل مدیریت می‌شوند.',
    'Store staff sign in here and continue to the admin panel.',
  ],

  'favorites.title': ['علاقه‌مندی‌ها', 'Favorites'],
  'favorites.empty': ['هنوز محصولی را ذخیره نکرده‌اید', 'No saved products yet'],
  'favorites.emptyBody': [
    'با زدن آیکن قلب روی هر محصول، آن را اینجا ذخیره کنید.',
    'Use the heart icon on any product to keep it here.',
  ],

  'services.eyebrow': ['خدمات', 'Services'],
  'services.title': ['خدمات تخصصی فروشگاه', 'Services in our showroom'],
  'services.intro': [
    'خدمات ما روی انتخاب دقیق فریم و عدسی تمرکز دارد. برای هر خدمت می‌توانید وقت حضوری رزرو کنید.',
    'Our services focus on getting frame and lens choices right. You can request a slot for any of them.',
  ],
  'services.duration': ['زمان', 'Duration'],
  'services.priceFrom': ['شروع از', 'From'],
  'services.free': ['بدون هزینه', 'No charge'],
  'services.bookFor': ['رزرو وقت برای این خدمت', 'Request a slot for this service'],
  'services.backToList': ['همه خدمات', 'All services'],

  'about.eyebrow': ['درباره نور اپتیک', 'About Noor Optical'],
  'about.title': ['فروشگاهی برای انتخاب دقیق عینک', 'A showroom built around careful choices'],
  'about.p1': [
    'نور اپتیک یک فروشگاه تخصصی عینک است که روی انتخاب دقیق فریم و عدسی تمرکز دارد. مجموعه ما بر اساس فرم، متریال و سایز دسته‌بندی شده تا انتخاب ساده‌تر شود.',
    'Noor Optical is a specialised eyewear showroom focused on getting frame and lens choices right. Our collection is organised by shape, material and size to make choosing simpler.',
  ],
  'about.p2': [
    'ما ادعای پزشکی یا درمانی نمی‌کنیم؛ کار ما راهنمایی درباره تناسب فریم، متریال عدسی و نگهداری عینک است.',
    'We make no medical claims. Our work is guidance on frame fit, lens material and eyewear care.',
  ],
  'about.p3': [
    'اطلاعات تماس، ساعات کاری و خدمات این صفحه از پنل مدیریت فروشگاه قابل ویرایش است.',
    'Contact details, opening hours and services on this site are editable from the store admin panel.',
  ],
  'about.valuesTitle': ['اصولی که رعایت می‌کنیم', 'How we work'],
  'about.v1Title': ['شفافیت در اطلاعات', 'Straight information'],
  'about.v1Body': [
    'مشخصات فریم و عدسی را همان‌طور که هست نمایش می‌دهیم و داده‌ای را از خود نمی‌سازیم.',
    'We show frame and lens specifications as they are, and never invent data.',
  ],
  'about.v2Title': ['انتخاب آگاهانه', 'Informed choices'],
  'about.v2Body': [
    'تفاوت متریال، ضریب شکست و پوشش را توضیح می‌دهیم تا انتخاب شما بر پایه آگاهی باشد.',
    'We explain how material, index and coating differ, so the decision is yours to make knowingly.',
  ],
  'about.v3Title': ['پشتیبانی پس از خرید', 'Support after purchase'],
  'about.v3Body': [
    'تنظیم، شست‌وشو و پیگیری سفارش در فروشگاه انجام می‌شود.',
    'Adjustment, cleaning and order follow-up happen in the showroom.',
  ],

  'contact.eyebrow': ['تماس', 'Contact'],
  'contact.title': ['با ما در تماس باشید', 'Get in touch'],
  'contact.intro': [
    'برای پیگیری سفارش، مشاوره یا هماهنگی حضوری از راه‌های زیر با ما در ارتباط باشید.',
    'Reach us for order follow-up, advice, or to arrange a showroom visit.',
  ],
  'contact.phone': ['تلفن', 'Phone'],
  'contact.email': ['ایمیل', 'Email'],
  'contact.address': ['نشانی', 'Address'],
  'contact.hours': ['ساعات کاری', 'Opening hours'],
  'contact.formTitle': ['ارسال پیام', 'Send a message'],
  'contact.subject': ['موضوع', 'Subject'],
  'contact.message': ['متن پیام', 'Message'],
  'contact.success': ['پیام شما ثبت شد. به‌زودی پاسخ می‌دهیم.', 'Your message was received. We will reply soon.'],

  'appointment.eyebrow': ['رزرو وقت', 'Appointment'],
  'appointment.title': ['رزرو وقت مشاوره', 'Request an appointment'],
  'appointment.intro': [
    'زمان پیشنهادی خود را ثبت کنید؛ تأیید نهایی تلفنی انجام می‌شود.',
    'Tell us when suits you — we confirm every request by phone.',
  ],
  'appointment.service': ['خدمت مورد نظر', 'Service'],
  'appointment.anyService': ['مشاوره عمومی', 'General advice'],
  'appointment.date': ['تاریخ پیشنهادی', 'Preferred date'],
  'appointment.time': ['بازه ساعتی', 'Time slot'],
  'appointment.notes': ['توضیحات', 'Notes'],
  'appointment.success': [
    'درخواست شما ثبت شد. برای تأیید با شما تماس می‌گیریم.',
    'Your request was received. We will call to confirm.',
  ],
  'appointment.reference': ['شماره پیگیری', 'Reference'],

  'guide.eyebrow': ['راهنما', 'Guide'],
  'guide.title': ['راهنمای انتخاب عدسی', 'Choosing your lenses'],
  'guide.intro': [
    'سه انتخاب اصلی در عدسی وجود دارد: متریال، ضریب شکست و پوشش. هر کدام بر ضخامت، وزن و ظاهر عینک اثر می‌گذارد.',
    'Three lens decisions matter most: material, refractive index and coating. Each one changes thickness, weight and appearance.',
  ],
  'guide.howEyebrow': ['انتخاب درست', 'Choosing well'],
  'guide.howTitle': ['چه چیزی را در نظر بگیریم', 'What to weigh up'],
  'guide.item1Title': ['متریال عدسی', 'Lens material'],
  'guide.item1Body': [
    'CR-39 اقتصادی‌ترین گزینه است، پلی‌کربنات مقاومت بیشتری دارد و عدسی‌های ضریب بالا برای نسخه‌های قوی‌تر نازک‌تر می‌مانند.',
    'CR-39 is the most economical choice, polycarbonate is more impact resistant, and high-index lenses stay thinner for stronger prescriptions.',
  ],
  'guide.item2Title': ['ضریب شکست', 'Refractive index'],
  'guide.item2Body': [
    'با بالا رفتن ضریب شکست، عدسی نازک‌تر و سبک‌تر می‌شود. برای نسخه‌های سبک، ضریب بالاتر لزوماً بهتر نیست.',
    'A higher index makes lenses thinner and lighter — but for light prescriptions a higher index is not automatically better.',
  ],
  'guide.item3Title': ['پوشش‌ها', 'Coatings'],
  'guide.item3Body': [
    'آنتی‌ریفلکس بازتاب را کم می‌کند، پوشش فیلتر نور آبی برای کار طولانی با نمایشگر انتخاب می‌شود و فتوکرومیک در فضای باز تیره می‌شود.',
    'Anti-reflective reduces reflection, a blue-light filter suits long screen sessions, and photochromic darkens outdoors.',
  ],
  'guide.item4Title': ['نوع دید', 'Vision type'],
  'guide.item4Body': [
    'تک‌بین برای یک فاصله است و چندفوکوس (پروگرسیو) چند فاصله را در یک عدسی پوشش می‌دهد؛ انتخاب آن به نسخه شما بستگی دارد.',
    'Single vision covers one distance; multifocal (progressive) covers several in one lens. Which one applies depends on your prescription.',
  ],
  'guide.cta': ['سؤال دارید؟ مشاوره رزرو کنید', 'Questions left? Book a consultation'],

  'footer.shop': ['خرید', 'Shop'],
  'footer.help': ['راهنما', 'Help'],
  'footer.about': ['فروشگاه', 'Store'],
  'footer.contact': ['تماس', 'Contact'],
  'footer.trackOrder': ['پیگیری سفارش', 'Track order'],
  'footer.favorites': ['علاقه‌مندی‌ها', 'Favorites'],
  'footer.account': ['حساب کاربری', 'My account'],
  'footer.returns': ['شرایط بازگشت کالا', 'Returns'],
  'footer.shipping': ['ارسال و تحویل', 'Shipping'],
  'footer.rights': ['همه حقوق محفوظ است.', 'All rights reserved.'],
  'footer.demoNote': [
    'این سایت با داده‌های نمایشی راه‌اندازی شده است؛ اطلاعات فروشگاه از پنل مدیریت ویرایش می‌شود.',
    'This site ships with demonstration data. Store details are edited from the admin panel.',
  ],
  'footer.langSwitch': ['English', 'فارسی'],

  'search.title': ['جستجو', 'Search'],
  'search.placeholder': ['نام محصول، برند یا کد کالا…', 'Product name, brand or SKU…'],
  'search.hint': ['برای دیدن نتایج تایپ کنید', 'Type to see suggestions'],
  'search.products': ['محصولات', 'Products'],
  'search.brands': ['برندها', 'Brands'],
  'search.categories': ['دسته‌بندی‌ها', 'Categories'],
  'search.forQuery': ['نتایج جستجو برای «{q}»', 'Search results for “{q}”'],
  'search.submit': ['جستجو', 'Search'],

  'admin.title': ['پنل مدیریت', 'Admin panel'],
  'admin.dashboard': ['داشبورد', 'Dashboard'],
  'admin.products': ['محصولات', 'Products'],
  'admin.orders': ['سفارش‌ها', 'Orders'],
  'admin.appointments': ['نوبت‌ها', 'Appointments'],
  'admin.messages': ['پیام‌ها', 'Messages'],
  'admin.settings': ['تنظیمات سایت', 'Site settings'],
  'admin.customers': ['مشتریان', 'Customers'],
  'admin.services': ['خدمات', 'Services'],
  'admin.signInTitle': ['ورود کارکنان', 'Staff sign in'],
  'admin.revenue': ['فروش کل', 'Recorded order value'],
  'admin.pendingOrders': ['سفارش در انتظار', 'Pending orders'],
  'admin.activeProducts': ['محصول فعال', 'Active products'],
  'admin.outOfStock': ['واریانت ناموجود', 'Variants out of stock'],
  'admin.newAppointments': ['نوبت جدید', 'New appointments'],
  'admin.newMessages': ['پیام جدید', 'New messages'],
  'admin.customersCount': ['مشتری', 'Customers'],
  'admin.recentOrders': ['آخرین سفارش‌ها', 'Recent orders'],
  'admin.noAccess': ['دسترسی کارکنان لازم است.', 'Staff access is required.'],
  'admin.price': ['قیمت', 'Price'],
  'admin.salePrice': ['قیمت با تخفیف', 'Sale price'],
  'admin.stock': ['موجودی', 'Stock'],
  'admin.active': ['فعال', 'Active'],
  'admin.inactive': ['غیرفعال', 'Inactive'],
  'admin.featuredFlag': ['منتخب', 'Featured'],
  'admin.newFlag': ['جدید', 'New'],
  'admin.variants': ['واریانت‌ها', 'Variants'],
  'admin.searchProducts': ['جستجوی محصول…', 'Search products…'],
  'admin.updateStatus': ['تغییر وضعیت', 'Update status'],
  'admin.savedNote': ['ذخیره شد', 'Saved'],
  'admin.settingsNote': [
    'این مقادیر در تمام سایت نمایش داده می‌شوند. اعداد قیمت بدون جداکننده وارد شوند.',
    'These values are shown across the site. Enter price figures without separators.',
  ],
  'admin.announcementEnabled': ['نوار اطلاعیه فعال', 'Announcement strip enabled'],
  'admin.servicesNote': [
    'غیرفعال کردن یک خدمت آن را از سایت و فرم رزرو حذف می‌کند.',
    'Deactivating a service removes it from the site and the booking form.',
  ],

  'value.Men': ['مردانه', 'Men'],
  'value.Women': ['زنانه', 'Women'],
  'value.Unisex': ['یونیسکس', 'Unisex'],
  'value.Kids': ['کودکان', 'Kids'],
  'value.children': ['کودکان', 'Kids'],
  'value.men': ['مردانه', 'Men'],
  'value.women': ['زنانه', 'Women'],
  'value.unisex': ['یونیسکس', 'Unisex'],
  'value.kids': ['کودکان', 'Kids'],
  'value.Round': ['گرد', 'Round'],
  'value.Square': ['مربعی', 'Square'],
  'value.Oval': ['بیضی', 'Oval'],
  'value.Browline': ['برو‌لاین', 'Browline'],
  'value.Rectangle': ['مستطیلی', 'Rectangle'],
  'value.Cat Eye': ['کت آی', 'Cat Eye'],
  'value.Wayfarer': ['ویفرر', 'Wayfarer'],
  'value.Wrap': ['خمیده', 'Wrap'],
  'value.Titanium': ['تیتانیوم', 'Titanium'],
  'value.Acetate': ['استات', 'Acetate'],
  'value.Metal': ['فلز', 'Metal'],
  'value.Acetate & Metal': ['استات و فلز', 'Acetate & metal'],
  'value.Stainless Steel': ['استیل', 'Stainless steel'],
  'value.TR90': ['TR90', 'TR90'],
  'value.Nylon': ['نایلون', 'Nylon'],
  'value.Narrow': ['باریک', 'Narrow'],
  'value.Medium': ['متوسط', 'Medium'],
  'value.Wide': ['پهن', 'Wide'],
  'value.Grey': ['خاکستری', 'Grey'],
  'value.Brown': ['قهوه‌ای', 'Brown'],
  'value.Green': ['سبز', 'Green'],
  'value.Smoke': ['دودی', 'Smoke'],
  'value.UV400': ['UV400', 'UV400'],
  'value.true': ['بله', 'Yes'],
  'value.false': ['خیر', 'No'],
  'value.Single Vision': ['تک‌بین', 'Single vision'],
  'value.Progressive': ['پروگرسیو (چندفوکوس)', 'Progressive'],
  'value.Multifocal': ['چندفوکوس', 'Multifocal'],
  'value.Computer': ['کامپیوتر', 'Computer'],
  'value.Photochromic': ['فتوکرومیک', 'Photochromic'],
  'value.Toric': ['توریک', 'Toric'],
  'value.Daily': ['روزانه', 'Daily'],
  'value.Monthly': ['ماهانه', 'Monthly'],
  'value.CR-39': ['CR-39', 'CR-39'],
  'value.Polycarbonate': ['پلی‌کربنات', 'Polycarbonate'],
  'value.High-Index': ['ضریب بالا', 'High index'],
  'value.Anti-Reflective': ['آنتی‌ریفلکس', 'Anti-reflective'],
  'value.Blue Light Filter': ['فیلتر نور آبی', 'Blue-light filter'],
  'value.Scratch Resistant': ['ضد خش', 'Scratch resistant'],
  'value.30 lenses': ['۳۰ عددی', '30 lenses'],
  'value.6 lenses': ['۶ عددی', '6 lenses'],
  'value.single-vision': ['تک‌بین', 'Single vision'],
  'value.multifocal': ['چندفوکوس', 'Multifocal'],
  'value.yes': ['دارد', 'Yes'],
  'value.no': ['ندارد', 'No'],
  'value.in-stock': ['موجود', 'In stock'],
  'value.out-of-stock': ['ناموجود', 'Out of stock'],
} as const satisfies Record<string, readonly [string, string]>;

export type MessageKey = keyof typeof messages;

type Vars = Record<string, string | number>;

const interpolate = (template: string, vars?: Vars) => {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
};

type I18nValue = {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  isRtl: boolean;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: MessageKey, vars?: Vars) => string;
  /** Localised label for a canonical catalogue value, falling back to the raw value. */
  tValue: (value: string | null | undefined) => string;
  /** Picks the field matching the active locale from an {En, Fa} pair. */
  pick: <T>(fa: T, en: T) => T;
};

const I18nContext = createContext<I18nValue | null>(null);
const STORAGE_KEY = 'noor.locale';

const readInitialLocale = (): Locale => {
  if (typeof window === 'undefined') return 'fa';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'fa' || stored === 'en') return stored;
  return 'fa';
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr';
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable in private modes; the session still switches.
    }
  }, []);

  const value = useMemo<I18nValue>(() => {
    const index = locale === 'fa' ? 0 : 1;
    const t = (key: MessageKey, vars?: Vars) => {
      const entry = messages[key] as readonly [string, string] | undefined;
      if (!entry) return key;
      return interpolate(entry[index], vars);
    };
    return {
      locale,
      dir: locale === 'fa' ? 'rtl' : 'ltr',
      isRtl: locale === 'fa',
      setLocale,
      toggleLocale: () => setLocale(locale === 'fa' ? 'en' : 'fa'),
      t,
      tValue: (raw) => {
        if (!raw) return '';
        const key = `value.${raw}` as MessageKey;
        const entry = messages[key] as readonly [string, string] | undefined;
        return entry ? entry[index] : raw;
      },
      pick: <T,>(fa: T, en: T) => (locale === 'fa' ? fa : en),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nValue => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
};

/** Product / category / brand names are stored bilingually on every record. */
export const useLocalizedField = () => {
  const { pick } = useI18n();
  return {
    label: (record: { nameEn?: string | null; nameFa?: string | null; name?: string | null }) =>
      pick(record.nameFa ?? record.name ?? '', record.nameEn ?? record.name ?? ''),
    text: (en: string | null | undefined, fa: string | null | undefined) => pick(fa ?? '', en ?? ''),
  };
};
