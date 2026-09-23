'use client';

import { useActionState } from 'react';

import { login, type LoginState } from './actions';

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form action={formAction} style={{ width: '100%', maxWidth: 400, display: 'grid', gap: 16 }}>
        <h1>Вхід до CRM</h1>
        <label>Email<input name="email" type="email" autoComplete="email" required /></label>
        <label>Пароль<input name="password" type="password" autoComplete="current-password" required /></label>
        {state.error && <p role="alert" style={{ color: '#b42318' }}>{state.error}</p>}
        <button type="submit" disabled={pending}>{pending ? 'Вхід…' : 'Увійти'}</button>
      </form>
    </main>
  );
}
