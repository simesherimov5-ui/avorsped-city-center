import Link from "next/link";
import { companyInfo } from "@/data";

export function Footer() {
  return (
    <footer className="border-t border-line bg-charcoal text-warm-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-4 lg:px-10">
        <div>
          <div className="leading-none">
            <div className="font-display text-xl">{companyInfo.shortName}</div>
            <div className="mt-1.5 text-[9px] uppercase tracking-[0.3em] text-warm-white/40">Holding</div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-warm-white/60">
            Exclusive Building, дел од {companyInfo.name} Холдинг — градиме станбени простори од {companyInfo.founded} година.
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-warm-white/40">Истражи</div>
          <div className="mt-4 flex flex-col gap-2 text-sm text-warm-white/75">
            <Link href="/development" className="hover:text-warm-white">Тековен проект</Link>
            <Link href="/apartments" className="hover:text-warm-white">Пронајди стан</Link>
            <Link href="/projects" className="hover:text-warm-white">Проекти</Link>
            <Link href="/about" className="hover:text-warm-white">За нас</Link>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-warm-white/40">Контакт</div>
          <div className="mt-4 flex flex-col gap-2 text-sm text-warm-white/75">
            <span>{companyInfo.address}</span>
            <a href={`tel:${companyInfo.phone}`} className="hover:text-warm-white">{companyInfo.phone}</a>
            <a href={`mailto:${companyInfo.email}`} className="hover:text-warm-white">{companyInfo.email}</a>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-warm-white/40">Консултација</div>
          <p className="mt-4 text-sm text-warm-white/60">Разговарајте со нашиот тим за продажба за City Center.</p>
          <Link
            href="/consultation"
            className="mt-4 inline-block border border-warm-white/30 px-5 py-2.5 text-sm hover:bg-warm-white/10"
          >
            Закажи консултација
          </Link>
        </div>
      </div>
      <div className="border-t border-warm-white/10 px-6 py-6 text-xs text-warm-white/40 lg:px-10">
        © {new Date().getFullYear()} {companyInfo.name} Холдинг. Сите права се задржани.
      </div>
    </footer>
  );
}
