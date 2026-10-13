import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Menu, Ruler, ShieldCheck, Truck } from 'lucide-react';
import styles from './concepts.module.css';

const concepts = [
  {
    id: '01',
    name: 'Архітектурна майстерня',
    line: 'Преміальна подача через готові проєкти й матеріали.',
    fit: 'Для клієнтів, які цінують вигляд будинку та якість матеріалів.',
    image: '/hero-fence.jpg',
    chip: 'СПОКІЙНИЙ ПРЕМІУМ',
    palette: 'Пісочний · графіт · мідний',
  },
  {
    id: '02',
    name: 'Виробник без посередників',
    line: 'Індустріальна впевненість, виробництво і контроль якості.',
    fit: 'Для оптових клієнтів, будівельників і тих, кому важливі строки.',
    image: '/2.jpg',
    chip: 'СИЛА ВИРОБНИЦТВА',
    palette: 'Сталь · темно-синій · білий',
  },
  {
    id: '03',
    name: 'Каталог і ціна',
    line: 'Товари, кольори та ціни на виду — шлях до покупки короткий.',
    fit: 'Для клієнтів, які вже знають, що шукають, і хочуть порівнювати.',
    image: '/categories/profnastil.jpg',
    chip: 'ЗРУЧНИЙ ВИБІР',
    palette: 'Білий · графіт · помаранчевий',
  },
  {
    id: '04',
    name: 'Надійність для будівництва',
    line: 'Практичний сайт з гарантіями, логістикою та відповідями.',
    fit: 'Для приватного будівництва й аудиторії, якій потрібна впевненість.',
    image: '/categories/zabor.jpg',
    chip: 'ПРОСТО І НАДІЙНО',
    palette: 'Світлий камінь · хвойний · теракотовий',
  },
  {
    id: '05',
    name: 'Калькулятор проєкту',
    line: 'Від параметрів даху чи огорожі — до готової заявки.',
    fit: 'Для покупців, яким спершу потрібен розрахунок матеріалу.',
    image: '/categories/Dyzayn.jpg',
    chip: 'РОЗРАХУНОК НА ПЕРШОМУ ПЛАНІ',
    palette: 'Темний зелений · світлий · лайм',
  },
];

function Preview({ id, image }: { id: string; image: string }) {
  return (
    <div className={`${styles.preview} ${styles[`theme${id}`]}`}>
      <div className={styles.browserBar}><i /><i /><i /><span>metalongroup.ua</span><b>···</b></div>
      <div className={styles.mockSite}>
        {id === '01' && <>
          <div className={styles.archNav}><b>MG<span> /</span></b><span>МАТЕРІАЛИ　 ПРОЄКТИ　 ПРО НАС</span><button>Обговорити проєкт ↗</button></div>
          <div className={styles.archHero} style={{ backgroundImage: `linear-gradient(90deg,#272722dd,#27272218),url("${image}")` }}><small>МАТЕРІАЛИ ДЛЯ ВАШОГО ПРОСТОРУ</small><h3>Дім починається<br />з надійного даху.</h3><button>Дивитися колекцію　↗</button><div className={styles.archFoot}>01 — ПРОФНАСТИЛ　　02 — МЕТАЛОЧЕРЕПИЦЯ</div></div>
        </>}
        {id === '02' && <>
          <div className={styles.factoryNav}><b><span>▰</span> METALON <small>GROUP</small></b><span>ВИРОБНИЦТВО　 ПРОДУКЦІЯ　 ПОСТАЧАННЯ</span><b>+38 073 388 52 99</b></div>
          <div className={styles.factoryHero} style={{ backgroundImage: `linear-gradient(90deg,#0b1624f2 0%,#0b1624aa 46%,#0b162422),url("${image}")` }}><small>ВИРОБНИЦТВО МЕТАЛОПРОФІЛЮ · УКРАЇНА</small><h3>Точність.<br />Метал. Результат.</h3><p>Власні лінії. Контроль кожного метра.</p><button>Запросити прорахунок →</button><b className={styles.factoryNumber}>01<span>/04</span></b></div>
        </>}
        {id === '03' && <>
          <div className={styles.shopNav}><b>METALON<span>®</span></b><span>Каталог　 Розрахунок　 Доставка</span><button>Кошик　 0</button></div>
          <div className={styles.shopIntro}><div><small>МЕТАЛОПРОФІЛЬ ВІД ВИРОБНИКА</small><h3>Знайдіть свій<br />профіль.</h3></div><span>Доставка по Україні　·　Гарантія виробника</span></div>
          <div className={styles.shopCards}>{['Профнастил','Металочерепиця','Металевий паркан'].map((label, i) => <div key={label}><div className={styles.shopPic} style={{ backgroundImage: `url("${i === 0 ? image : ['/Products/prof7016.jpg','/Products/Milana.jpg','/Products/shtahet.jpg'][i]}")` }} /><b>{label}</b><small>Дивитися моделі　↗</small></div>)}</div>
        </>}
        {id === '04' && <>
          <div className={styles.trustNav}><b>metalon<span>group</span></b><span>ПРОДУКЦІЯ　 НАШ ПІДХІД　 ДОСТАВКА　 КОНТАКТИ</span><button>Зателефонувати</button></div>
          <div className={styles.trustHero}><div><small>МЕТАЛ ДЛЯ ВАШОЇ БУДІВЛІ</small><h3>Надійне рішення<br />на роки.</h3><p>Підберемо профіль, порахуємо кількість і привеземо на об’єкт.</p><button>Підібрати матеріал　→</button></div><div className={styles.trustPhoto} style={{ backgroundImage: `url("${image}")` }} /><div className={styles.trustProof}><span><ShieldCheck /> Гарантія якості</span><span><Truck /> Доставка по Україні</span><span><Check /> Власне виробництво</span></div></div>
        </>}
        {id === '05' && <>
          <div className={styles.calcNav}><b>MG<span> /</span> METALON GROUP</b><span>ПРОФНАСТИЛ　 ДАХ　 ОГОРОЖА</span><button>Зв’язатися ↗</button></div>
          <div className={styles.calcHero}><div><small>ВІД ІДЕЇ ДО ТОЧНОГО РОЗРАХУНКУ</small><h3>Скільки потрібно<br />саме вам?</h3><p>Виберіть тип проєкту — розрахуємо комплект матеріалів.</p><div className={styles.calcOptions}><span><Ruler /> Дах</span><span><Menu /> Огорожа</span><ChevronDown /></div></div><div className={styles.calcImage} style={{ backgroundImage: `url("${image}")` }}><div>01 <span>/ 03　 КРОК</span></div></div></div>
        </>}
      </div>
    </div>
  );
}

export default function ConceptsPage() {
  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <Link href="/" className={styles.brand}><Image src="/metalon-mark.svg" alt="" width={38} height={38} /><span>METALON GROUP<small>ДИЗАЙН-НАПРЯМИ</small></span></Link>
        <a href="#directions">П’ЯТЬ КОНЦЕПЦІЙ <ArrowRight size={15} /></a>
      </header>
      <section className={styles.intro}>
        <div className={styles.introCopy}><span className={styles.kicker}>НОВИЙ НАПРЯМ ДЛЯ METALON GROUP</span><h1>Який сайт<br />працюватиме <em>на продаж?</em></h1><p>П’ять різних підходів до одного завдання: зрозуміло показати продукцію, викликати довіру та привести покупця до замовлення.</p></div>
        <div className={styles.introAside}><span>01—05</span><p>Переглянь варіанти й обери той, який найбільше відповідає твоїм клієнтам та характеру компанії.</p><a href="#directions">ПЕРЕГЛЯНУТИ <ArrowRight size={14} /></a></div>
      </section>
      <section className={styles.directions} id="directions">
        {concepts.map((concept) => <article className={styles.direction} key={concept.id}>
          <div className={styles.directionHeader}><div className={styles.directionTitle}><span>{concept.id}</span><div><h2>{concept.name}</h2><p>{concept.line}</p></div></div><span className={styles.chip}>{concept.chip}</span></div>
          <Preview id={concept.id} image={concept.image} />
          <div className={styles.directionFooter}><p><b>Найкраще підійде:</b> {concept.fit}</p><p><b>Палітра:</b> {concept.palette}</p><a href={`mailto:metalongroup@gmail.com?subject=${encodeURIComponent(`Обираю дизайн ${concept.id}: ${concept.name}`)}`} aria-label={`Обрати концепцію ${concept.id}`}>ОБРАТИ №{concept.id} <ArrowUpRight size={15} /></a></div>
        </article>)}
      </section>
      <footer className={styles.pageFooter}><span>METALON GROUP　/　ДИЗАЙН-НАПРЯМИ</span><p>Напиши номер варіанту — я перенесу обраний напрям на сайт і підготую його до наступного перегляду.</p><Link href="/">Повернутися на сайт <ArrowRight size={15} /></Link></footer>
    </main>
  );
}
