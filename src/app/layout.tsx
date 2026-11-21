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
    default: "Academy.Must-b",
    template: "%s | Academy.Must-b",
  },
  description: "Must-b Academy is an education-focused platform where students and teachers can manage projects. Powered by Must-b.",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col transition-colors duration-300`}
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

