'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Menu, Phone, ShoppingBag, X } from 'lucide-react';
import styles from './Header.module.css';
import { Container } from '../Container/Container';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart-store';

const navigation = [
  { label: 'Продукція', href: '/catalog' },
  { label: 'Розрахунок', href: '/calculator' },
  { label: 'Про нас', href: '/about' },
  { label: 'Маршрут', href: '/#navigation' },
];

export const Header = () => {
  const items = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const totalItems = items.reduce((sum, item) => sum + (item.category === 'Металочерепиця' ? 1 : item.quantity), 0);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <div className={styles.utility}><Container><span>ВИРОБНИЦТВО МЕТАЛОПРОФІЛЮ · УКРАЇНА</span><a href="tel:+380733885299"><Phone size={13} /> +38 (073) 388-52-99</a></Container></div>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <Container>
          <div className={styles.wrapper}>
            <Link href="/" className={styles.logo} aria-label="Metalon Group — головна сторінка">
              <Image src="/metalon-mark.svg" alt="" width={42} height={42} priority />
              <span><b>METALON</b><small>GROUP · METAL SYSTEMS</small></span>
            </Link>
            <nav className={styles.navigation} aria-label="Основна навігація">
              {navigation.map((item) => <Link key={item.href} href={item.href} className={styles.link}>{item.label}</Link>)}
            </nav>
            <div className={styles.actions}>
              <Link href="/#contact" className={styles.contactLink}>Обговорити проєкт <ArrowUpRight size={16} /></Link>
              <button className={styles.cartButton} onClick={openCart} aria-label={`Кошик, товарів: ${totalItems}`}><ShoppingBag size={18} />{totalItems > 0 && <span className={styles.cartCount}>{totalItems}</span>}</button>
              <button className={styles.burger} onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Закрити меню' : 'Відкрити меню'}>{isOpen ? <X /> : <Menu />}</button>
            </div>
          </div>
        </Container>
      </header>
      <div className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`} aria-hidden={!isOpen}>
        <div className={styles.mobileHead}><Image src="/metalon-mark.svg" alt="" width={42} height={42} /><span>METALON <small>GROUP</small></span></div>
        <nav aria-label="Мобільна навігація">{navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>{item.label}<ArrowUpRight size={20} /></Link>)}</nav>
        <a className={styles.mobilePhone} href="tel:+380733885299"><Phone size={16} /> +38 (073) 388-52-99</a>
      </div>
    </>
  );
};
