import Link from 'next/link';
import Image from 'next/image';
import { ArrowDownRight, ArrowRight, Check, Factory, Truck, MapPin } from 'lucide-react';
import { CategoriesSection } from '../../components/sections/CategoriesSection/CategoriesSection';
import { ProductsSection } from '../../components/sections/ProductsSection/ProductsSection';
import { ProjectCalculatorPreview } from '../../components/home/ProjectCalculatorPreview';
import styles from './home.module.css';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroPhoto} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span /> МЕТАЛОПРОФІЛЬ ВІД ВИРОБНИКА</p>
            <h1>Від вашого задуму<br />до точного <em>розрахунку.</em></h1>
            <p className={styles.lead}>Профнастил, покрівля й огорожа. Оберіть проєкт, задайте розміри — ми підкажемо, скільки матеріалу потрібно.</p>
            <div className={styles.heroLinks}><Link href="/catalog">Переглянути каталог <ArrowRight size={16} /></Link><span>Виробництво та доставка по Україні</span></div>
          </div>
          <div className={styles.calculatorPosition}><ProjectCalculatorPreview /></div>
          <a href="#assortment" className={styles.scrollHint}><ArrowDownRight size={15} /> ПЕРЕГЛЯНУТИ МАТЕРІАЛИ</a>
          <div className={styles.heroCoordinates}>50°11&apos; N　27°03&apos; E <span>·</span> UKRAINE</div>
        </div>
      </section>

      <section className={styles.proofBar} aria-label="Переваги">
        <div><Factory size={15} /><span>ВИРОБЛЯЄМО</span></div><div><Check size={15} /><span>РОЗРАХОВУЄМО</span></div><div><Truck size={15} /><span>ДОСТАВЛЯЄМО</span></div><p>ПРОЄКТУЄМО РІШЕННЯ РАЗОМ З ВАМИ</p>
      </section>

      <div id="assortment"><CategoriesSection /></div>

      <section className={styles.process} id="how-it-works">
        <div className={styles.processIntro}><p className={styles.eyebrow}><span /> ЯК ЦЕ ПРАЦЮЄ</p><h2>Три кроки<br />до вашого <em>матеріалу.</em></h2><p>Не потрібно знати всі тонкощі профілювання. Розкажіть про об’єкт — допоможемо з вибором і кількістю.</p><Link href="/calculator">Почати розрахунок <ArrowRight size={16} /></Link></div>
        <div className={styles.steps}>{[
          ['Оберіть задачу', 'Дах, огорожа чи фасад — калькулятор підкаже потрібні параметри.'],
          ['Задайте розміри', 'Внесіть довжину та ширину, щоб отримати попередню площу.'],
          ['Уточніть комплект', 'Профіль, колір і комплектуючі можна узгодити з нашим фахівцем.'],
        ].map(([title, text]) => <article className={styles.step} key={title}><div><h3>{title}</h3><p>{text}</p></div><Check size={17} /></article>)}</div>
      </section>

      <section className={styles.products}>
        <div className={styles.productIntro}><div><p className={styles.eyebrow}><span /> ДОБІРКА ДЛЯ ПРОЄКТУ</p><h2>Популярні<br /><em>матеріали.</em></h2></div><Link href="/catalog">Увесь каталог <ArrowRight size={16} /></Link></div>
        <ProductsSection />
      </section>

      <section className={styles.projects} aria-labelledby="projects-title">
        <div className={styles.projectsIntro}>
          <div><p className={styles.eyebrow}><span /> ПРИКЛАДИ РІШЕНЬ</p><h2 id="projects-title">Матеріал у<br /><em>готових проєктах.</em></h2></div>
          <p>Ідеї для покрівлі, фасаду й огорожі. Перегляньте приклади та підберіть рішення для свого об’єкта.</p>
        </div>
        <div className={styles.projectGroups}>
          <article className={styles.projectGroup}>
            <div className={styles.projectGroupHead}><span>01 / ОГОРОЖІ</span><h3>Огорожа під ваш стиль</h3></div>
            <div className={styles.projectPhotos}>
              <figure className={styles.projectPhotoLarge}><Image src="/projects/louver-fence.jpg" alt="Сучасна металева огорожа з горизонтальними ламелями" fill sizes="(max-width: 700px) 100vw, 50vw" /><figcaption>Горизонтальні ламелі · стриманий графіт</figcaption></figure>
              <figure><Image src="/projects/fence-wood-effect-detail.jpg" alt="Огорожа з металевими планками з текстурою дерева" fill sizes="(max-width: 700px) 100vw, 25vw" /><figcaption>Тепла текстура дерева</figcaption></figure>
            </div>
            <Link href="/catalog?category=Паркан">Переглянути огорожі <ArrowRight size={15} /></Link>
          </article>
          <article className={styles.projectGroup}>
            <div className={styles.projectGroupHead}><span>02 / ПОКРІВЛІ</span><h3>Захист і виразний вигляд</h3></div>
            <div className={styles.projectPhotos}>
              <figure className={styles.projectPhotoLarge}><Image src="/projects/roof-metal-tile.jpg" alt="Будинок із новою покрівлею з металочерепиці" fill sizes="(max-width: 700px) 100vw, 50vw" /><figcaption>Металочерепиця на житловому будинку</figcaption></figure>
              <figure><Image src="/projects/metal-tile-roof-detail.jpg" alt="Деталь покрівлі з металочерепиці та покрівельними планками" fill sizes="(max-width: 700px) 100vw, 25vw" /><figcaption>Покрівельні деталі й примикання</figcaption></figure>
            </div>
            <Link href="/catalog?category=Металочерепиця">Обрати покрівлю <ArrowRight size={15} /></Link>
          </article>
          <article className={styles.projectGroup}>
            <div className={styles.projectGroupHead}><span>03 / ФАСАДИ</span><h3>Оздоблення з характером</h3></div>
            <div className={styles.projectPhotos}>
              <figure className={styles.projectPhotoLarge}><Image src="/projects/facade-wood-effect.jpg" alt="Фасад будинку з металевим оздобленням під дерево" fill sizes="(max-width: 700px) 100vw, 50vw" /><figcaption>Фасад у відтінку натурального дерева</figcaption></figure>
              <figure><Image src="/projects/facade-metal-wood-effect.jpg" alt="Металеве фасадне оздоблення з деревною текстурою" fill sizes="(max-width: 700px) 100vw, 25vw" /><figcaption>Текстуроване фасадне оздоблення</figcaption></figure>
            </div>
            <Link href="/catalog?category=Метал-Сайдинг">Переглянути фасадні матеріали <ArrowRight size={15} /></Link>
          </article>
        </div>
      </section>

      <section className={styles.navigation} id="navigation">
        <div className={styles.navigationCopy}>
          <p className={styles.eyebrow}><span /> НАВІГАЦІЯ</p>
          <h2>Завітайте<br />на <em>виробництво.</em></h2>
          <p>Виробництво METALON GROUP розташоване в селі Сасанівка. Побудуйте маршрут і приїжджайте — допоможемо підібрати матеріал для вашого проєкту.</p>
          <span className={styles.location}><MapPin size={16} /> с. Сасанівка, Україна</span>
          <a href="https://www.google.com/maps/dir/?api=1&destination=49.9572006,27.2987765" target="_blank" rel="noreferrer">Побудувати маршрут <ArrowRight size={16} /></a>
        </div>
        <div className={styles.mapFrame}>
          <iframe title="Маршрут до виробництва METALON GROUP у селі Сасанівка" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10267.553190502624!2d27.28126287460326!3d49.95719784531086!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47320727f92415fb%3A0x74bc3dc9323ae894!2z0KLQntCSIMKr0JzQldCi0JDQm9Ce0J0g0JPQoNCj0J_Cuw!5e0!3m2!1suk!2sua!4v1791805362838!5m2!1suk!2sua" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
        </div>
      </section>

      <section className={styles.assistance} id="contact">
        <div className={styles.assistanceImage}><Image src="/categories/Dyzayn.jpg" alt="Металочерепиця для покрівлі" fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
        <div className={styles.assistanceCopy}><p className={styles.eyebrow}><span /> НЕ ВПЕВНЕНІ З РОЗМІРАМИ?</p><h2>Підкажемо,<br />з чого <em>почати.</em></h2><p>Зателефонуйте — розберемо ваш проєкт, підберемо профіль і підготуємо точний розрахунок.</p><a href="tel:+380733885299">+38 (073) 388-52-99 <ArrowRight size={17} /></a><small>ПН–ПТ · 09:00–18:00</small></div>
        <div className={styles.assistanceIndex}>METALON GROUP <span>РОЗРАХУНОК • ВИРОБНИЦТВО • ДОСТАВКА</span></div>
      </section>
    </main>
  );
}
