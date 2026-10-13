'use client';

export default function PrintButton() {
  return <button type="button" onClick={() => window.print()}>Друкувати / зберегти PDF</button>;
}
