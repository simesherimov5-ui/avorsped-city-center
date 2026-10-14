import type { Metadata, Viewport } from "next";
import { MotionConfig } from "framer-motion";
import "./fonts/fonts.css";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { I18nProvider } from "@/lib/i18n";
import { CompareProvider } from "@/lib/compare-context";
import { CompareBar } from "@/components/CompareBar";
import { TransitionOverlayProvider } from "@/components/ui/ZoomTransition";
import { IntroProvider } from "@/components/intro/IntroProvider";
import { PageTransition } from "@/components/page-transition/PageTransition";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { GrayscaleToggle } from "@/components/dev/GrayscaleToggle";
import { companyInfo, projects } from "@/data";
import { SITE_NAME, siteUrl } from "@/lib/seo";

// Exactly two families on the whole site (the identity "Бронза & Травертин"), both with their Cyrillic letters, served from
// app/fonts (see fonts.css): the site is in Macedonian, and a family without them silently falls back to a different
// system font. Playfair Display is for headings and large display numbers; Montserrat is for everything else.

export const metadata: Metadata = {
  // The public address (see lib/seo.ts): canonical links, the sitemap and share images are built from it.
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Javor Sped Holding гради премиум станбени згради и станови во Струмица и Дојран. Истражете ги проектите и пронајдете го вашиот нов дом.",
  openGraph: {
    title: SITE_NAME,
    description: "Премиум станбени проекти на Javor Sped Holding. Истражете ги проектите и пронајдете го вашиот стан.",
    siteName: SITE_NAME,
    locale: "mk_MK",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

// The browser bar on phones takes the site's dark (Оникс).
export const viewport: Viewport = { themeColor: "rgb(20, 17, 15)", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mk">
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
              name: SITE_NAME,
              url: siteUrl(),
              logo: `${siteUrl()}/apple-icon.png`,
              description: "Јавор Шпед испорачува премиум станбени станови.",
              areaServed: "Северна Македонија",
              telephone: companyInfo.phone,
              email: companyInfo.email,
              address: {
                "@type": "PostalAddress",
                // "Ул. Ленинова, ГТЦ Глобал, 4-ти кат, Струмица": the last part is the town, the rest the street
                streetAddress: companyInfo.address.split(",").slice(0, -1).join(",").trim(),
                addressLocality: companyInfo.address.split(",").at(-1)?.trim(),
                addressCountry: "MK",
              },
              // The projects, each with its own page.
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Проекти",
                itemListElement: projects.map((project) => ({
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "ApartmentComplex",
                    name: project.name,
                    url: `${siteUrl()}${project.href ?? `/projects/${project.slug}`}`,
                    address: { "@type": "PostalAddress", addressLocality: project.location },
                  },
                })),
              },
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
