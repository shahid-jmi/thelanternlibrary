import type { ReactNode } from 'react';
import { MessageCircle, PackageCheck, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Reveal from '@/app/components/Reveal';
import { Eyebrow } from '@/app/components/ui';
import { STEP_COLORS } from './data';

export default function HowToOrderSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 lg:px-8">
      <Reveal>
        <Eyebrow className="mb-3">vi.</Eyebrow>
        <h2 className="mb-4 text-3xl tracking-tight">How to Order</h2>
        <p className="mx-auto mb-12 max-w-2xl leading-8 opacity-80">
          Ordering is simple and personal. No complicated checkouts, just direct communication.
        </p>
        <div className="grid gap-10 text-left rtl:text-right md:grid-cols-3">
          <Step number="01" icon={Search} color="blue" title="Browse">
            Explore the catalogue and find the books that speak to you.
          </Step>
          <Step number="02" icon={MessageCircle} color="green" title="Message">
            Open a book and use the WhatsApp order button to start the conversation.
          </Step>
          <Step number="03" icon={PackageCheck} color="amber" title="Receive">
            We confirm availability, arrange payment, and deliver with care.
          </Step>
        </div>
      </Reveal>
    </section>
  );
}

function Step({
  number,
  icon: Icon,
  color,
  title,
  children,
}: {
  number: string;
  icon: LucideIcon;
  color: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${STEP_COLORS[color]}`}
        >
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <span className="text-sm italic tracking-[0.05em] opacity-50">{number}</span>
      </div>
      <h3 className="mb-2 text-xl">{title}</h3>
      <p className="leading-7 opacity-75">{children}</p>
    </div>
  );
}
