import type {Metadata} from 'next';
import './globals.css';
import {Toaster} from '@/components/ui/toaster';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'WhatsQuality - WhatsApp Full DP Maker | HD Profile Picture No Crop',
  description: 'Create a full size WhatsApp DP without cropping. WhatsQuality is the best HD WhatsApp profile picture maker to resize and fit photos perfectly. 100% Free.',
  keywords: 'WhatsApp DP Maker, WhatsApp Full DP, HD WhatsApp DP, Full Size WhatsApp DP without cropping, WhatsApp Profile Picture Maker, WhatsApp DP without cropping, Best WhatsApp DP maker',
  verification: {
    google: '3WwAf-XMxfYwO7_meXqlBvIjQBUhYaOCxkhCwJrtFJU',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How can I set a full size WhatsApp DP without cropping?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "WhatsQuality allows you to upload any portrait or landscape photo and automatically fits it into a 1:1 square ratio by adding a blurred or solid color background. This prevents WhatsApp from forcing you to crop your image."
        }
      },
      {
        "@type": "Question",
        "name": "Is WhatsQuality the best WhatsApp DP maker?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! WhatsQuality offers 1080x1080 HD export, complete privacy, no watermarks, and a completely free experience, making it the top choice for users globally."
        }
      },
      {
        "@type": "Question",
        "name": "Will my HD WhatsApp DP look blurry after using this tool?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Not at all. We export all profile pictures in high-definition 1080x1080px resolution, ensuring your photo looks sharp and clear on all smartphone screens."
        }
      }
    ]
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Make a Full Size WhatsApp DP Without Cropping",
    "description": "Learn how to resize your profile picture for WhatsApp to fit perfectly without cropping using WhatsQuality.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Upload Your Photo",
        "text": "Choose any high-resolution image from your device gallery.",
        "url": "https://whatsquality.com/#upload"
      },
      {
        "@type": "HowToStep",
        "name": "Customize Your Style",
        "text": "Select between blur background or solid color to fit your photo.",
        "url": "https://whatsquality.com/#customize"
      },
      {
        "@type": "HowToStep",
        "name": "Download HD DP",
        "text": "Download your 1080x1080px profile picture ready for WhatsApp.",
        "url": "https://whatsquality.com/#download"
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <Script
          id="howto-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
