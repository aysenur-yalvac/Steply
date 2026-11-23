import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Must-b Academy | Akademik Proje ve Takım Yönetim Platformu",
    template: "%s | Must-b Academy",
  },
  description: "Must-b Academy; öğrenci ve danışman öğretmenlerin projelerini, sınıflarını ve akademik çalışmalarını modern araçlarla verimli şekilde yönetebilecekleri eğitim odaklı iş birliği platformudur. Must-b tarafından desteklenmektedir.",
  icons: {
    icon: [
      { url: "/marka/favicon.ico" },
      { url: "/marka/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/marka/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/marka/icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/marka/favicon.ico",
    apple: [
      { url: "/marka/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300`}
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
