import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { scrollToTop } from '@/app/lib/scroll';

// Floating button; Shell stacks it above the WhatsApp chat button. Hidden (and out of
// the tab order via `invisible`) until the reader is a screen's height down.
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > window.innerHeight);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-[opacity,transform,visibility] duration-300 hover:text-ember ${
        visible ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-2 opacity-0'
      }`}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
