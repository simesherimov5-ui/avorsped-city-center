import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { ConsultationLink } from "@/components/ConsultationLink";
import { companyInfo } from "@/data";

export function Footer() {
  return (
    <footer className="border-t border-line bg-chrome text-on-chrome">
      <div className="container-x grid items-start gap-12 py-16 lg:grid-cols-4 lg:gap-8 lg:py-20">
        <div>
          <div className="leading-none">
            <div className="footer-sheen">Javor Sped</div>
            <div className="eyebrow mt-2 text-on-chrome/60">Holding</div>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-on-chrome/60">
            {companyInfo.name} Холдинг — градиме станбени простори од {companyInfo.founded} година.
          </p>
        </div>

        <div>
          <div className="eyebrow text-on-chrome/60">Истражи</div>
          <div className="mt-3 flex flex-col text-base text-on-chrome/75 sm:mt-5 sm:gap-2.5 sm:text-sm">
            <Link href="/projects" className="flex min-h-11 w-fit items-center hover:text-on-chrome lg:min-h-0">
              Проекти
            </Link>
            <Link href="/about" className="flex min-h-11 w-fit items-center hover:text-on-chrome lg:min-h-0">
              За нас
            </Link>
          </div>
        </div>

        <div>
          <div className="eyebrow text-on-chrome/60">Контакт</div>
          <div className="mt-3 flex flex-col text-base text-on-chrome/75 sm:mt-5 sm:gap-2.5 sm:text-sm">
            <span className="py-2 sm:py-0">{companyInfo.address}</span>
            <a
              href={`tel:${companyInfo.phone.replace(/ /g, "")}`}
              className="flex min-h-11 w-fit items-center hover:text-on-chrome lg:min-h-0"
            >
              {companyInfo.phone}
            </a>
            <a
              href={`mailto:${companyInfo.email}`}
              className="flex min-h-11 w-fit items-center hover:text-on-chrome lg:min-h-0"
            >
              {companyInfo.email}
            </a>
          </div>
        </div>

        <div>
          <div className="eyebrow text-on-chrome/60">Консултација</div>
          <p className="mt-5 text-sm leading-relaxed text-on-chrome/60">
            Разговарајте со нашиот тим за продажба за кој било од нашите проекти.
          </p>
          <ConsultationLink className="mt-5 inline-flex min-h-12 items-center border border-on-chrome/30 px-5 py-2.5 text-xs uppercase tracking-[0.14em] transition-colors hover:border-on-chrome/60 hover:bg-on-chrome/10">
            Закажи консултација
          </ConsultationLink>
        </div>
      </div>
      <div className="border-t border-on-chrome/10">
        <div className="container-x flex flex-col gap-4 py-6 text-xs text-on-chrome/60 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {companyInfo.name} Холдинг. Сите права се задржани.
          </span>
          <nav aria-label="Страници" className="flex flex-wrap gap-x-6">
            <Link href="/projects" className="flex min-h-11 items-center hover:text-on-chrome sm:min-h-0">
              Проекти
            </Link>
            <Link href="/about" className="flex min-h-11 items-center hover:text-on-chrome sm:min-h-0">
              За нас
            </Link>
            <Link href="/contact" className="flex min-h-11 items-center hover:text-on-chrome sm:min-h-0">
              Контакт
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
