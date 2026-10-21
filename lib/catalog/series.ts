export type DrawingKind = 'tile' | 'profile' | 'rhomb' | 'louver' | 'farm' | 'blockhouse' | 'euroboard';

export type ProductSeries = {
  title: string;
  slug: string;
  category: string;
  description: string;
  image: string;
  unit: string;
  fullWidth?: number;
  usefulWidth?: number;
  drawing: DrawingKind;
  drawingAsset?: string;
  drawingHeight?: number;
  partnerBasePrice?: number;
  specs: { label: string; value: string }[];
  sourceUrl: string;
};

const roofing = 'https://www.wpg.in.ua/metalocherepicya';
const profiled = 'https://www.wpg.in.ua/profnastil';
const fencing = 'https://www.wpg.in.ua/ogorozha';
const siding = 'https://www.wpg.in.ua/sayding';

export const productSeries: ProductSeries[] = [
  {
    title: 'Еліт', slug: 'metalocherepytsya-elit', category: 'Металочерепиця',
    description: 'Високий підйом хвилі надає покрівлі об’ємного вигляду. Профіль поєднує виразну форму та практичність.',
    image: '/catalog/metal-tile-v4/elite.webp', unit: 'м²', fullWidth: 1.16, usefulWidth: 1.05, drawing: 'tile', drawingAsset: '/catalog/diagrams/elit.svg', drawingHeight: 120,
    specs: [{ label: 'Висота перекриття', value: '120 мм' }, { label: 'Повна ширина', value: '1160 мм' }, { label: 'Корисна ширина', value: '1050 мм' }, { label: 'Поперечне перекриття', value: '110 мм' }], sourceUrl: `${roofing}/elit`,
  },
  {
    title: 'Ретро+', slug: 'metalocherepytsya-retro-plus', category: 'Металочерепиця',
    description: 'Округла геометрія хвилі та збільшена корисна ширина виразно виглядають на покрівлі.',
    image: '/catalog/metal-tile-v4/retro-plus.webp', unit: 'м²', fullWidth: 1.2, usefulWidth: 1.12, drawing: 'tile', drawingAsset: '/catalog/diagrams/retro-plus.svg', drawingHeight: 120,
    specs: [{ label: 'Висота перекриття', value: '120 мм' }, { label: 'Повна ширина', value: '1200 мм' }, { label: 'Корисна ширина', value: '1120 мм' }, { label: 'Поперечне перекриття', value: '80 мм' }], sourceUrl: `${roofing}/retro-2`, partnerBasePrice: 218.15,
  },
  {
    title: 'Ретро', slug: 'metalocherepytsya-retro', category: 'Металочерепиця',
    description: 'Класичний профіль із плавною хвилею та європейською геометрією прокату.',
    image: '/catalog/metal-tile-v4/retro.webp', unit: 'м²', fullWidth: 1.16, usefulWidth: 1.05, drawing: 'tile', drawingAsset: '/catalog/diagrams/retro.svg', drawingHeight: 120,
    specs: [{ label: 'Висота перекриття', value: '120 мм' }, { label: 'Повна ширина', value: '1160 мм' }, { label: 'Корисна ширина', value: '1050 мм' }, { label: 'Поперечне перекриття', value: '110 мм' }], sourceUrl: `${roofing}/retro`, partnerBasePrice: 225.67,
  },
  {
    title: 'Модерн', slug: 'metalocherepytsya-modern', category: 'Металочерепиця',
    description: 'Прямі лінії профілю допомагають приховати кріплення. Для моделі можна обрати висоту хвилі 20, 25, 30 або 35 мм.',
    image: '/catalog/metal-tile-v4/modern.webp', unit: 'м²', fullWidth: 1.195, usefulWidth: 1.15, drawing: 'tile', drawingAsset: '/catalog/diagrams/modern.svg', drawingHeight: 120,
    specs: [{ label: 'Висота хвилі', value: '20 / 25 / 30 / 35 мм' }, { label: 'Повна ширина', value: '1195 мм' }, { label: 'Корисна ширина', value: '1150 мм' }, { label: 'Поперечне перекриття', value: '45 мм' }], sourceUrl: `${roofing}/modern`, partnerBasePrice: 218.15,
  },
  {
    title: 'Класік', slug: 'metalocherepytsya-klassik', category: 'Металочерепиця',
    description: 'Класична форма профілю з додатковим капілярним каналом, який допомагає відводити воду зі стику.',
    image: '/catalog/metal-tile-v4/classic.webp', unit: 'м²', fullWidth: 1.19, usefulWidth: 1.19, drawing: 'tile', drawingAsset: '/catalog/diagrams/klassik.svg', drawingHeight: 120,
    specs: [{ label: 'Висота перекриття', value: '120 мм' }, { label: 'Повна ширина', value: '1190 мм' }, { label: 'Корисна ширина', value: '1190 мм' }, { label: 'Особливість', value: 'Капілярний канал' }], sourceUrl: roofing, partnerBasePrice: 219.98,
  },
  {
    title: 'Преміум', slug: 'metalocherepytsya-premium', category: 'Металочерепиця',
    description: 'Прямий профіль із можливістю вибрати висоту хвилі 20, 25, 30 або 35 мм.',
    image: '/catalog/metal-tile-v4/premium.webp', unit: 'м²', fullWidth: 1.19, usefulWidth: 1.1, drawing: 'tile', drawingAsset: '/catalog/diagrams/premium.svg', drawingHeight: 120,
    specs: [{ label: 'Висота хвилі', value: '20 / 25 / 30 / 35 мм' }, { label: 'Повна ширина', value: '1190 мм' }, { label: 'Корисна ширина', value: '1100 мм' }, { label: 'Поперечне перекриття', value: '60 мм' }], sourceUrl: `${roofing}/premium`, partnerBasePrice: 216.35,
  },
  {
    title: 'С-10', slug: 'profnastyl-s10', category: 'Профнастил',
    description: 'Профнастил С-10 на основі профілю Т-10: низька хвиля 10 мм і широка корисна площа для огорож, фасадів та підшиви.',
    image: '/catalog/wpg/t10.png', unit: 'м²', fullWidth: 1.19, usefulWidth: 1.16, drawing: 'profile', drawingAsset: '/catalog/diagrams/t10.svg', drawingHeight: 10,
    specs: [{ label: 'Висота профілю', value: '10 мм' }, { label: 'Повна ширина', value: '1190 мм' }, { label: 'Корисна ширина', value: '1160 мм' }, { label: 'Поперечне перекриття', value: '30 мм' }, { label: 'Матеріал', value: 'Оцинкована або пофарбована сталь' }, { label: 'Товщина сталі', value: '0,45–0,50 мм за даними виробника' }], sourceUrl: `${profiled}/t-10`,
  },
  {
    title: 'Т-18', slug: 'profnastyl-t18', category: 'Профнастил',
    description: 'Профіль для покрівель господарських приміщень. Можливе виготовлення з капіляром або покрівельною поличкою.',
    image: '/catalog/wpg/t18.png', unit: 'м²', fullWidth: 1.14, usefulWidth: 1.1, drawing: 'profile', drawingAsset: '/catalog/diagrams/t18.png', drawingHeight: 18,
    specs: [{ label: 'Висота профілю', value: '18 мм' }, { label: 'Повна ширина', value: '1140 мм' }, { label: 'Корисна ширина', value: '1100 мм' }, { label: 'Поперечне перекриття', value: '40 мм' }], sourceUrl: `${profiled}/t-18`, partnerBasePrice: 149.12,
  },
  {
    title: 'Т-45', slug: 'profnastyl-t45', category: 'Профнастил',
    description: 'Жорсткий профіль для покрівлі промислових і складських приміщень.',
    image: '/catalog/wpg/t45.png', unit: 'м²', fullWidth: 1.12, usefulWidth: 1.08, drawing: 'profile', drawingAsset: '/catalog/diagrams/t45.png', drawingHeight: 45,
    specs: [{ label: 'Висота профілю', value: '45 мм' }, { label: 'Повна ширина', value: '1120 мм' }, { label: 'Корисна ширина', value: '1080 мм' }, { label: 'Поперечне перекриття', value: '40 мм' }], sourceUrl: `${profiled}/t-45`, partnerBasePrice: 151.79,
  },
  {
    title: 'Ромб', slug: 'parkany-romb', category: 'Паркан',
    description: 'Вентильована конструкція пропускає повітря та допомагає зменшити вплив поривів вітру на огорожу.',
    image: '/catalog/wpg/fence-rhomb.png', unit: 'м.п.', drawing: 'rhomb', drawingAsset: '/catalog/diagrams/fence-rhomb.jpg',
    specs: [{ label: 'Тип конструкції', value: 'Вентильована' }, { label: 'Призначення', value: 'Огорожа' }, { label: 'Довжина секції', value: 'Уточнюється під проєкт' }], sourceUrl: `${fencing}/romb`, partnerBasePrice: 235,
  },
  {
    title: 'Жалюзі', slug: 'parkany-zhaliuzi', category: 'Паркан',
    description: 'Горизонтальні ламелі поєднують приватність ділянки з акуратним сучасним виглядом огорожі.',
    image: '/catalog/wpg/fence-louver.png', unit: 'м.п.', drawing: 'louver', drawingAsset: '/catalog/diagrams/fence-louver.jpg',
    specs: [{ label: 'Тип конструкції', value: 'Горизонтальні ламелі' }, { label: 'Призначення', value: 'Огорожа' }, { label: 'Довжина секції', value: 'Уточнюється під проєкт' }], sourceUrl: `${fencing}/ogorozha`, partnerBasePrice: 200,
  },
  {
    title: 'Ферма', slug: 'parkany-ferma', category: 'Паркан',
    description: 'Класична відкрита огорожа у стилі американського ранчо.',
    image: '/catalog/wpg/fence-farm.png', unit: 'м.п.', drawing: 'farm', drawingAsset: '/catalog/diagrams/fence-ferma.jpg',
    specs: [{ label: 'Мінімальна довжина секції', value: '0 м' }, { label: 'Максимальна довжина секції', value: '3 м' }, { label: 'Підсилювальна планка', value: 'Після 2 м' }], sourceUrl: `${fencing}/ferma`,
  },
  {
    title: 'Блок-Хаус', slug: 'metalsayding-blok-haus', category: 'Метал-Сайдинг',
    description: 'Сайдинг для зовнішнього облицювання фасадів і софітів будівель.',
    image: '/catalog/wpg/siding-blockhouse.png', unit: 'м²', drawing: 'blockhouse', drawingAsset: '/catalog/diagrams/blockhouse-diagram.png', fullWidth: 0.355, usefulWidth: 0.33,
    specs: [{ label: 'Висота профілю', value: '30 мм' }, { label: 'Повна ширина', value: '355 мм' }, { label: 'Корисна ширина', value: '330 мм' }, { label: 'Призначення', value: 'Фасади та софіти' }], sourceUrl: `${siding}/blok-haus`, partnerBasePrice: 231.06,
  },
  {
    title: 'Євро-Дошка', slug: 'metalsayding-yevro-doshka', category: 'Метал-Сайдинг',
    description: 'Сучасне облицювання, яке допомагає оновити вигляд фасаду.',
    image: '/catalog/wpg/siding-euroboard.png', unit: 'м²', drawing: 'euroboard', drawingAsset: '/catalog/diagrams/euroboard.png', fullWidth: 0.36, usefulWidth: 0.335,
    specs: [{ label: 'Висота профілю', value: '15 мм' }, { label: 'Повна ширина', value: '360 мм' }, { label: 'Корисна ширина', value: '335 мм' }, { label: 'Призначення', value: 'Облицювання фасаду' }], sourceUrl: `${siding}/evrobrus`, partnerBasePrice: 231.06,
  },
  {
    title: 'Штахет', slug: 'shtahet-metalevyi', category: 'Штахет', description: 'Металеві планки для сучасної огорожі з варіантами профілю та покриття.',
    image: '/catalog/wpg/picket.png', unit: 'м.п.', drawing: 'profile', drawingAsset: '/catalog/diagrams/picket.jpg',
    specs: [{ label: 'Матеріал', value: 'Оцинкована сталь з полімерним покриттям' }, { label: 'Довжина', value: 'За розміром замовлення' }], sourceUrl: fencing, partnerBasePrice: 20.26,
  },
];

export const getProductSeries = (slug: string) => productSeries.find((item) => item.slug === slug || (slug === 'profnastyl-t10' && item.slug === 'profnastyl-s10'));
