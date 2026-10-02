import type { Metadata } from "next";
import { Inter, Fraunces, IBM_Plex_Mono } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import CompanyTicker from "@/components/company-ticker/CompanyTicker";
import { I18nProvider } from "@/lib/i18n";
import { CompareProvider } from "@/lib/compare-context";
import { CompareBar } from "@/components/CompareBar";
import { TransitionOverlayProvider } from "@/components/ui/ZoomTransition";
import { IntroProvider } from "@/components/intro/IntroProvider";
import { PageTransition } from "@/components/page-transition/PageTransition";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { GrayscaleToggle } from "@/components/dev/GrayscaleToggle";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fraunces",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
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
    <html lang="mk" className={`${inter.variable} ${fraunces.variable} ${ibmPlexMono.variable}`}>
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
        <MotionConfig reducedMotion="user">
          <TransitionOverlayProvider>
            <IntroProvider>
              <I18nProvider>
                <CompareProvider>
                  <PageTransition>
                    <SmoothScroll />
                    <GrayscaleToggle />
                    <Navbar />
                    <main>{children}</main>
                    <Footer />
                    <CompanyTicker />
                    <CompareBar />
                  </PageTransition>
                </CompareProvider>
              </I18nProvider>
            </IntroProvider>
          </TransitionOverlayProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
