import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'CISSP Practice Exams',
  description: '1,000 original CISSP-style practice questions across all 8 domains, in 10 weighted tests.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container inner">
            <Link className="brand" href="/">
              <span className="logo">C</span>
              <span>CISSP Practice</span>
            </Link>
            <nav className="nav-links">
              <Link href="/">Home</Link>
              <Link href="/tests/">Tests</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <div className="container">
            CISSP Practice — 1,000 questions · 8 domains · 10 weighted tests. For study use; not affiliated with ISC2.
          </div>
        </footer>
      </body>
    </html>
  );
}
