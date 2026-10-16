import "./projects.css";
import { Button } from "@/components/ui/Button";

/**
 * "Наскоро": the dark band between the projects and the footer. The site has no sign-up list, so «Пријави се» only
 * leads to Контакт; nothing is stored here.
 */
export function SoonBand() {
  return (
    <section className="pj-soon">
      <div className="pj-wrap pj-soon-inner">
        <div className="pj-soon-text">
          <div className="eyebrow pj-soon-label">
            <span className="pj-soon-dot" aria-hidden />
            НАСКОРО
          </div>
          <h2 className="pj-soon-heading">
            Нешто ново се подготвува. Бидете први што ќе ги дознаете деталите.
          </h2>
        </div>
        <div className="pj-soon-actions">
          <Button href="/contact" variant="primary" tone="dark" filled>
            Пријави се
          </Button>
          <Button href="/contact" variant="primary" tone="dark">
            Закажи консултација
          </Button>
        </div>
      </div>
    </section>
  );
}
