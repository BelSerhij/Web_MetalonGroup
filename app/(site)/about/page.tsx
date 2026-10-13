import Link from 'next/link';
import { ArrowRight, Factory, MapPin, Ruler, Truck } from 'lucide-react';
import styles from './about.module.css';

const values = [
  { icon: Factory, title: 'Власне виробництво', text: 'Виготовляємо металопрофіль для покрівлі, фасадів і огорож.' },
  { icon: Ruler, title: 'Підбір під розміри', text: 'Допомагаємо визначити потрібний профіль, кількість матеріалу та комплектуючі.' },
  { icon: Truck, title: 'Доставка на об’єкт', text: 'Узгоджуємо замовлення й доставку відповідно до вашого проєкту.' },
];

export default function AboutPage() {
  return (
    <main className={styles.about}>
      <section className={styles.hero}>
        <div className={styles.heroImage} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}><span /> METALON GROUP</p>
          <h1>Металеві рішення<br />для <em>вашого проєкту.</em></h1>
          <p>Виготовляємо профільовані матеріали та допомагаємо пройти шлях від вибору покриття до розрахунку потрібної кількості.</p>
          <Link href="/catalog">Переглянути продукцію <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className={styles.story}>
        <div>
          <p className={styles.label}>ЧИМ ЗАЙМАЄМОСЯ</p>
          <h2>Від матеріалу<br />до готового <em>рішення.</em></h2>
        </div>
        <div className={styles.storyCopy}>
          <p>METALON GROUP — виробник металопрофілю для приватного й комерційного будівництва. У каталозі представлені профнастил, металочерепиця, матеріали для огорож і фасадів, водостічні системи, плівки та комплектуючі.</p>
          <p>Ми допомагаємо підібрати матеріал під тип об’єкта, його розміри й бажане покриття. Калькулятор дає попередній розрахунок, а фахівець допоможе уточнити параметри замовлення.</p>
        </div>
      </section>

      <section className={styles.values} aria-label="Наш підхід">
        {values.map(({ icon: Icon, title, text }) => <article key={title}><Icon size={20} /><h3>{title}</h3><p>{text}</p></article>)}
      </section>

      <section className={styles.location}>
        <div><p className={styles.label}>ДЕ НАС ЗНАЙТИ</p><h2>Виробництво<br />у <em>Сасанівці.</em></h2><p>Запрошуємо на виробництво, щоб обговорити матеріал і деталі вашого замовлення.</p><Link href="/#navigation"><MapPin size={16} /> Відкрити маршрут <ArrowRight size={15} /></Link></div>
        <div className={styles.locationImage} role="img" aria-label="Металеве покриття для будівельних проєктів" />
      </section>
    </main>
  );
}
