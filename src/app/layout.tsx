import type {Metadata} from 'next';
import './globals.css';
import {Toaster} from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'WhatsQuality - WhatsApp Full DP Maker | HD Profile Picture No Crop',
  description: 'Create a full size WhatsApp DP without cropping. WhatsQuality is the best HD WhatsApp profile picture maker to resize and fit photos perfectly. 100% Free.',
  keywords: 'WhatsApp DP Maker, WhatsApp Full DP, HD WhatsApp DP, Full Size WhatsApp DP without cropping, WhatsApp Profile Picture Maker, WhatsApp DP without cropping, Best WhatsApp DP maker',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
