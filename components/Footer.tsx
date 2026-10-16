import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { FooterSheen } from "@/components/FooterSheen";
import { companyInfo } from "@/data";

export function Footer() {
  return (
    <footer className="grain grain--dark border-t border-line bg-chrome text-on-chrome">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 py-16 sm:py-20 lg:grid-cols-3 lg:gap-8 lg:px-10">
        <div>
          <div className="leading-none">
            <FooterSheen>Javor Sped</FooterSheen>
            <div className="eyebrow mt-2 text-accent">Holding</div>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-on-chrome/60">
            Градиме домови од {companyInfo.founded}.
          </p>
        </div>

        <div>
          <div className="eyebrow text-accent">Истражи</div>
          <div className="mt-3 flex flex-col text-base text-on-chrome/75 sm:mt-5 sm:gap-2.5 sm:text-sm">
            <Link href="/projects" className="flex min-h-11 w-fit items-center hover:text-on-chrome">
              Проекти
            </Link>
            <Link href="/about" className="flex min-h-11 w-fit items-center hover:text-on-chrome">
              За нас
            </Link>
          </div>
        </div>

        <div>
          <div className="eyebrow text-accent">Контакт</div>
          <div className="mt-3 flex flex-col text-base text-on-chrome/75 sm:mt-5 sm:gap-2.5 sm:text-sm">
            <span className="py-2 sm:py-0">{companyInfo.address}</span>
            <a
              href={`tel:${companyInfo.phone.replace(/ /g, "")}`}
              className="flex min-h-11 w-fit items-center hover:text-on-chrome"
            >
              {companyInfo.phone}
            </a>
            <a href={`mailto:${companyInfo.email}`} className="flex min-h-11 w-fit items-center hover:text-on-chrome">
              {companyInfo.email}
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-on-chrome/10 px-5 sm:px-8 py-6 text-xs text-on-chrome/60 lg:px-10">
        © {new Date().getFullYear()} {companyInfo.name} Холдинг. Сите права се задржани.
      </div>
    </footer>
  );
}
