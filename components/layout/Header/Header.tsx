'use client';

import Link from 'next/link';
import styles from './Header.module.css';
import Image from 'next/image';

import { Container } from '../Container/Container';

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

export const Header = () => {
  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.wrapper}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
             <Image
                src="/logo_1.svg"
                alt="METALON GROUP"
                width={150}
                height={80}
                priority
              />
          </Link>

          {/* Navigation */}
          <nav className={styles.navigation}>
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles.link}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            <button className="button-primary">
              Отримати консультацію
            </button>

            {/* Burger */}
            <button className={styles.burger}>
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
};