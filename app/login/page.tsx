'use client';

import Image from 'next/image';
import { useActionState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { login, type LoginState } from './actions';
import styles from './Login.module.css';

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);
  return <main className={styles.page}>
    <div className={styles.shell}>
      <section className={styles.brandPanel}>
        <div className={styles.brand}><Image src="/metalon-mark.svg" alt="MetalonGroup" width={42} height={42} /><span><strong>METALON</strong><small>GROUP · ВИРОБНИЦТВО</small></span></div>
        <div className={styles.pitch}><span className={styles.kicker}>АДМІНІСТРУВАННЯ</span><h1>Керуйте замовленнями та прайсом в одному місці.</h1><p>Каталог, ціни та виробничі процеси MetalonGroup.</p></div>
        <div className={styles.brandFooter}><span>01 / ПРАЙС</span><span>02 / ЗАМОВЛЕННЯ</span><span>03 / ВИРОБНИЦТВО</span></div>
      </section>
      <section className={styles.formPanel}>
        <div className={styles.formIntro}><span className={styles.lock}><LockKeyhole size={18} /></span><div><span className={styles.kicker}>ЗАХИЩЕНИЙ ДОСТУП</span><h2>Вхід до адмін-панелі</h2><p>Введіть дані облікового запису.</p></div></div>
        <form action={formAction} className={styles.form}>
          <label>Email<input name="email" type="email" autoComplete="username" placeholder="name@company.ua" required /></label>
          <label>Пароль<input name="password" type="password" autoComplete="current-password" placeholder="Введіть пароль" required /></label>
          {state.error && <p role="alert" className={styles.error}>{state.error}</p>}
          <button type="submit" disabled={pending}>{pending ? 'Перевіряємо…' : <>Увійти <ArrowRight size={17} /></>}</button>
        </form>
        <LinkBack />
      </section>
    </div>
  </main>;
}

function LinkBack() {
  return <a href="/" className={styles.back}>← Повернутись на сайт</a>;
}
