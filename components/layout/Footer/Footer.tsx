import Link from 'next/link';
import styles from './Footer.module.css';
import { Container } from '../Container/Container';
import Image from 'next/image';

const navigation = [
  {
    label: 'Каталог',
    href: '/catalog',
  },
  {
    label: 'Калькулятор',
    href: '/calculator',
  },
  {
    label: 'Галерея',
    href: '/gallery',
  },
  {
    label: 'Контакти',
    href: '/contacts',
  },
];

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.wrapper}>
                  {/* LEFT */}
    
        <div className={styles.info}>
            <div className={styles.infologo}>
                <Link href="/" className={styles.logo}>
                <Image
                    src="/logo.svg"
                    alt="METALON GROUP"
                    width={100}
                    height={100}
                    priority
                />
                

                <div className={styles.textBlock}>
                    <h3 className={styles.companyName}>
                        METALON GROUP
                    </h3>

                    <p className={styles.description}>
                        Виробник профнастилу, металочерепиці.
                    </p>
                </div>
                </Link>
            </div>
                  
            <div className={styles.contacts}>
              <a href="tel:+380733885299">
                +38 (073) 388-52-99
              </a>

              <a href="mailto:metalongroup@gmail.com">
                metalongroup@gmail.com
              </a>

              <p>Шепетівка, Україна</p>
            </div>
        </div>
         

          {/* NAVIGATION */}
          <div className={styles.column}>
            <h3>Навігація</h3>

            <nav className={styles.navigation}>
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* CATALOG */}
          <div className={styles.column}>
            <h3>Каталог</h3>

            <div className={styles.links}>
              <Link href="/">Профнастил</Link>
              <Link href="/">Металочерепиця</Link>
              <Link href="/">Металевий паркан</Link>
              <Link href="/">Комплектуючі</Link>
            </div>
          </div>

          {/* CTA */}
          <div className={styles.column}>
            <h3>Консультація</h3>

            <p className={styles.text}>
              Допоможемо підібрати матеріали
              та швидко прорахуємо вартість.
            </p>

            <button className="button-primary">
              Залишити заявку
            </button>
          </div>
        </div>

        {/* BOTTOM */}
        <div className={styles.bottom}>
          <p>
            © 2026 METALON GROUP.
            Всі права захищені.
          </p>

          <div className={styles.bottomLinks}>
            <Link href="/">
              Політика конфіденційності
            </Link>

            <Link href="/">
              Публічна оферта
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};