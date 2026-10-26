import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/firebase/authContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Dealproof ✦ Jan-Karar — From Handshake to Contract',
  description:
    'Turn informal business conversations into clear agreement drafts. Legal tech analysis for Indian MSMEs. Built with Next.js, Firebase & Vercel.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden`}>
      <body className="min-h-full flex flex-col bg-[#fafafa] text-zinc-900 selection:bg-zinc-900 selection:text-white overflow-x-hidden">
        <AuthProvider>
          <div className="no-print">
            <Suspense fallback={<div className="h-14 bg-white border-b border-zinc-200" />}>
              <Navbar />
            </Suspense>
          </div>
          <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
          <div className="no-print">
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
