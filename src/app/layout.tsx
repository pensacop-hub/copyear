import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { InitialLoadingShell } from "@/components/pwa/initial-loading-shell";
import { InstallBanner } from "@/components/pwa/install-banner";
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
  title: "The Church of Pentecost Year",
  description: "Official portal for church activities and personnel",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "COP Year",
  },
  applicationName: "COP Year",
  icons: {
    icon: "/cop.png",
    apple: "/cop.png",
  },
};

export const viewport = {
  themeColor: "#1e40af",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col justify-between overflow-x-hidden">
        <InitialLoadingShell />
        <main className="flex-1">{children}</main>
        <InstallBanner />

        <footer className="bg-slate-50 border-t border-slate-100 py-6 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-sm text-slate-600">
              Built by <span className="font-semibold text-slate-900">Christian Antwi</span> and <span className="font-semibold text-slate-900">Obrempong Kwabena Osei-Wusu</span> for <span className="font-bold text-blue-800">The Church of Pentecost</span>.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
