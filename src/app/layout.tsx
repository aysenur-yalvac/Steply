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
  title: "Steply | Student & Teacher Project Management",
  description: "Steply is an education-focused platform where students and teachers can manage projects. Powered by Must-b.",
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
