import type { Metadata } from "next";
import { Inter, Playfair_Display, IBM_Plex_Mono } from "next/font/google";
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

// All three families are loaded with their Cyrillic letters: the site is in Macedonian, and a family loaded without
// them silently falls back to a different system font on every device.
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

// The heading serif (it replaced Fraunces, which has no Cyrillic). Regular and regular italic only.
const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
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
    <html lang="mk" className={`${inter.variable} ${playfair.variable} ${ibmPlexMono.variable}`}>
      <body className="antialiased">
        {/* The first thing a keyboard reaches: it jumps over the navbar to the page's content. */}
        <a href="#main" className="skip-link">
          Прескокни до содржината
        </a>
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
                    <main id="main" tabIndex={-1} className="outline-none">
                      {children}
                    </main>
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
