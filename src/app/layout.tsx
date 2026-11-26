import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthProvider";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mustbacademy.com"),
  applicationName: "Must-b Academy",
  title: {
    default: "Must-b Academy | Akademik Proje ve Takım Yönetim Platformu",
    template: "%s | Must-b Academy",
  },
  description: "Must-b Academy; öğrenci ve danışman öğretmenlerin projelerini, sınıflarını ve akademik çalışmalarını modern araçlarla verimli şekilde yönetebilecekleri eğitim odaklı iş birliği platformudur. Must-b tarafından desteklenmektedir.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/marka/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/marka/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: ["/favicon.ico", "/icon-192.png"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Must-b Academy | Akademik Proje ve Takım Yönetim Platformu",
    description:
      "Must-b Academy; öğrenci ve danışman öğretmenlerin projelerini, sınıflarını ve akademik çalışmalarını modern araçlarla verimli şekilde yönetebilecekleri eğitim odaklı iş birliği platformudur.",
    url: "https://mustbacademy.com",
    siteName: "Must-b Academy",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "https://mustbacademy.com/icon-192.png",
        width: 192,
        height: 192,
        alt: "Must-b Academy Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Must-b Academy | Akademik Proje ve Takım Yönetim Platformu",
    description:
      "Öğretmen ve öğrenci iş birliğini dijitalleştiren akıllı akademi paneli.",
    images: ["https://mustbacademy.com/icon-192.png"],
  },
};

const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://mustbacademy.com/#website",
      name: "Must-b Academy",
      alternateName: ["Must-b", "Mustb Academy"],
      url: "https://mustbacademy.com",
    },
    {
      "@type": "Organization",
      "@id": "https://mustbacademy.com/#organization",
      name: "Must-b Academy",
      url: "https://mustbacademy.com",
      logo: {
        "@type": "ImageObject",
        url: "https://mustbacademy.com/icon-192.png",
        width: 192,
        height: 192,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning className="overflow-x-clip">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-[100dvh] flex flex-col overflow-x-clip transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <AuthProvider>
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
            <Navbar />
            <main className="flex-grow flex flex-col">
              {children}
            </main>
            <ConditionalFooter />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
