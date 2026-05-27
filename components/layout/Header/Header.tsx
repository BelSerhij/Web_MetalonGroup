'use client';

import Link from 'next/link';
import styles from './Header.module.css';
import Image from 'next/image';
import { Container } from '../Container/Container';
import { useEffect, useState } from 'react';
import { useCartStore }from '@/store/cart-store';

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

    const items =
    useCartStore((state) => state.items);

  const openCart =
    useCartStore((state) => state.openCart);

  const totalItems =
    items.reduce(
      (acc, item) =>
        acc + item.quantity,
      0
    );

const [isOpen, setIsOpen] = useState(false);
const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 20);
  };

  window.addEventListener('scroll', handleScroll);

  return () =>
    window.removeEventListener('scroll', handleScroll);
}, []);

  useEffect(() => {
  document.body.style.overflow = isOpen
    ? 'hidden'
    : 'auto';
}, [isOpen]);

  return (
    <header
        className={`${styles.header} ${
        isScrolled ? styles.scrolled : ''
      }`}
      >
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

          {/* Desktop Navigation */}
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

          <button
              className={styles.cartButton}
              onClick={openCart}
          >
            🛒
            {totalItems > 0 && (
              <span className={styles.cartCount}>
                {totalItems}
              </span>
            )}
          </button>

            {/* Burger */}
              <button className={`${styles.burger} ${
                 isOpen ? styles.active : ''}`}
                onClick={() => setIsOpen(!isOpen)}
              >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </Container>

            {/* Mobile Menu */}
          <div
              className={`${styles.mobileMenu} ${
              isOpen ? styles.open : ''
              }`}
              onClick={() => setIsOpen(false)}
          >
          <div
              className={styles.mobileContent}
              onClick={(e) => e.stopPropagation()}
          >
            {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.mobileLink}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
            ))}

            <button className="button-primary">
              Консультація
            </button>
          </div>
          </div>
    </header>
  );
};