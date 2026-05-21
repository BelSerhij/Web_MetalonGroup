import './globals.css';
import { Header } from '../components/layout/Header/Header';
import { Footer } from '../components/layout/Footer/Footer';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body>
        <Header />
        {children}

        <Footer />
      </body>
    </html>
  );
}