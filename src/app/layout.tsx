import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TakaRunway | Dhaka Personal Ledger & Cashflow Runway Manager',
  description:
    'Production-grade personal ledger, run-rate forecasting, multimodal OCR receipt verifier, and DPS compounding engine for salaried professionals in Dhaka.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
