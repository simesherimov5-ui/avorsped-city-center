import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { I18nProvider } from "@/lib/i18n";
import { CompareProvider } from "@/lib/compare-context";
import { CompareBar } from "@/components/CompareBar";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://javorsped-holding.example"),
  title: {
    default: "Јавор Шпед — Exclusive Building",
    template: "%s | Јавор Шпед",
  },
  description:
    "Exclusive Building, огранокот за недвижности на Јавор Шпед, гради премиум станбени згради и станови. Истражете го City Center — станбен комплекс од шест згради — и пронајдете го вашиот нов дом.",
  openGraph: {
    title: "Јавор Шпед",
    description: "Премиум станбени проекти. Истражете го City Center и пронајдете го вашиот стан.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mk" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              name: "Јавор Шпед",
              description:
                "Exclusive Building, огранокот за недвижности и градежништво на Јавор Шпед, испорачува премиум станбени станови.",
              areaServed: "Северна Македонија",
            }),
          }}
        />
        <I18nProvider>
          <CompareProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <CompareBar />
          </CompareProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
