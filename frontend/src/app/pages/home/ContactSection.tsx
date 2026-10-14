import type { ReactNode } from 'react';
import { Instagram, Mail, MapPin, MessageCircle } from 'lucide-react';
import Reveal from '@/app/components/Reveal';
import { Eyebrow } from '@/app/components/ui';
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  CONTACT_EMAIL,
  LOCATION,
  WHATSAPP_URL,
} from '@/app/lib/site';
import { CONTACT_ICON_COLORS } from './data';

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="mx-auto scroll-mt-24 max-w-4xl px-4 py-12 pb-20 sm:px-6 lg:px-8"
    >
      <Reveal>
        <Eyebrow className="mb-3 text-center">ix.</Eyebrow>
        <h2 className="mb-4 text-center text-4xl tracking-snug">Get in Touch</h2>
        <p className="mx-auto mb-10 max-w-xl text-center leading-8 opacity-80">
          Reach out for availability, recommendations, or help placing an order.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <ContactLink
            href={WHATSAPP_URL}
            icon={<MessageCircle className="h-5 w-5" />}
            title="WhatsApp"
            detail="Order and availability"
            color="green"
          />
          <ContactLink
            href={INSTAGRAM_URL}
            icon={<Instagram className="h-5 w-5" />}
            title="Instagram"
            detail={`@${INSTAGRAM_HANDLE}`}
            color="pink"
          />
          <ContactLink
            href={`mailto:${CONTACT_EMAIL}`}
            icon={<Mail className="h-5 w-5" />}
            title="Email"
            detail={CONTACT_EMAIL}
            color="blue"
          />
          <div className="flex items-center gap-5 rounded-sm border border-border bg-card p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg">Location</h3>
              <p className="text-sm opacity-70">{LOCATION}</p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function ContactLink({
  href,
  icon,
  title,
  detail,
  color,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  detail: string;
  color: keyof typeof CONTACT_ICON_COLORS;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-5 rounded-sm border border-border bg-card p-5 transition hover:border-ember/60 hover:bg-secondary"
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${CONTACT_ICON_COLORS[color]}`}
      >
        {icon}
      </span>
      <span>
        <span className="block text-lg">{title}</span>
        <span className="block text-sm opacity-70">{detail}</span>
      </span>
    </a>
  );
}
