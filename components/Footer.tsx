import Link from "next/link";
import { companyInfo } from "@/data";

export function Footer() {
  return (
    <footer className="border-t border-line bg-chrome text-on-chrome">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-4 lg:gap-8 lg:px-10">
        <div>
          <div className="leading-none">
            <div className="font-display text-xl">{companyInfo.shortName}</div>
            <div className="eyebrow mt-2 text-on-chrome/40">Holding</div>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-on-chrome/60">
            Exclusive Building, дел од {companyInfo.name} Холдинг — градиме станбени простори од {companyInfo.founded} година.
          </p>
        </div>

        <div>
          <div className="eyebrow text-on-chrome/40">Истражи</div>
          <div className="mt-5 flex flex-col gap-2.5 text-sm text-on-chrome/75">
            <Link href="/apartments" className="w-fit hover:text-on-chrome">Пронајди стан</Link>
            <Link href="/projects" className="w-fit hover:text-on-chrome">Проекти</Link>
            <Link href="/about" className="w-fit hover:text-on-chrome">За нас</Link>
          </div>
        </div>

        <div>
          <div className="eyebrow text-on-chrome/40">Контакт</div>
          <div className="mt-5 flex flex-col gap-2.5 text-sm text-on-chrome/75">
            <span>{companyInfo.address}</span>
            <a href={`tel:${companyInfo.phone}`} className="w-fit hover:text-on-chrome">{companyInfo.phone}</a>
            <a href={`mailto:${companyInfo.email}`} className="w-fit hover:text-on-chrome">{companyInfo.email}</a>
          </div>
        </div>

        <div>
          <div className="eyebrow text-on-chrome/40">Консултација</div>
          <p className="mt-5 text-sm leading-relaxed text-on-chrome/60">Разговарајте со нашиот тим за продажба за кој било од нашите проекти.</p>
          <Link
            href="/consultation"
            className="mt-5 inline-block border border-on-chrome/30 px-5 py-2.5 text-xs uppercase tracking-[0.14em] transition-colors hover:border-on-chrome/60 hover:bg-on-chrome/10"
          >
            Закажи консултација
          </Link>
        </div>
      </div>
      <div className="border-t border-on-chrome/10 px-6 py-6 text-xs text-on-chrome/40 lg:px-10">
        © {new Date().getFullYear()} {companyInfo.name} Холдинг. Сите права се задржани.
      </div>
    </footer>
  );
}
