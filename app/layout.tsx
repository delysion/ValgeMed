import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { isLocale, languageCookie, defaultLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary, dictionaries } from "@/lib/i18n/server";
import { TranslationProvider } from "@/lib/i18n/useTranslation";
import { ServiceWorkerRegistration } from "./sw-register";
import { InstallAppButton } from "@/components/install-app-button";
import { AppUpdateReloader } from "@/components/app-update-reloader";

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
    default: "ValgeMed",
    template: "%s | ValgeMed",
  },
  description: "A quiet command system for serious medical students.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/favicon.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "ValgeMed",
    description: "A quiet command system for serious medical students.",
    url: "https://valgemed.ee",
    siteName: "ValgeMed",
    images: [
      {
        url: "/icons/og-image.png",
        width: 1200,
        height: 630,
        alt: "ValgeMed — Elite Performance Cockpit for Medical Students",
      },
    ],
    locale: "et_EE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ValgeMed",
    description: "A quiet command system for serious medical students.",
    images: ["/icons/og-image.png"],
  },
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__deferredInstallPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__deferredInstallPrompt = e;
              });
            `,
          }}
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#1e1b4b" />
      </head>
      <body className="min-h-full" suppressHydrationWarning>
        <ServiceWorkerRegistration />
        <AppUpdateReloader />
        <InstallAppButton />
        <TranslationProvider locale={locale} dictionary={dictionary} dictionaries={dictionaries}>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}
