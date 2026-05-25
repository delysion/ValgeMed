import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { isLocale, languageCookie, defaultLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary, dictionaries } from "@/lib/i18n/server";
import { getTheme } from "@/lib/theme/config";
import { TranslationProvider } from "@/lib/i18n/useTranslation";
import { ServiceWorkerRegistration } from "./sw-register";
import { InstallAppButton } from "@/components/install-app-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ValgeMed",
  description: "A quiet command system for serious medical students.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ValgeMed",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(languageCookie)?.value;
  const locale: Locale = isLocale(localeCookie) ? localeCookie : defaultLocale;
  const dictionary = getDictionary(locale);
  const themeCookie = cookieStore.get("valgemed_theme")?.value;
  const theme = themeCookie === "light" || themeCookie === "dark" ? themeCookie : "dark";

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${theme} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#1e1b4b" />
      </head>
      <body className="min-h-full">
        <ServiceWorkerRegistration />
        <InstallAppButton />
        <TranslationProvider locale={locale} dictionary={dictionary} dictionaries={dictionaries}>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}
