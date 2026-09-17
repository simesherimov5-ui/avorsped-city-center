import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-28 text-center">
      <div className="text-xs uppercase tracking-widest text-accent">404</div>
      <h1 className="mt-3 font-display text-3xl">Оваа страница не е пронајдена</h1>
      <p className="mt-3 max-w-sm text-sm text-ink/60">
        Страницата што ја барате не постои или е преместена.
      </p>
      <div className="mt-8">
        <Button href="/" variant="primary">Назад кон почетна</Button>
      </div>
    </div>
  );
}
