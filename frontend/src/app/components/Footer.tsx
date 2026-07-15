import { Link } from 'react-router';
import { Instagram, Mail, MapPin, MessageCircle } from 'lucide-react';
import LanternMark from './LanternMark';
import { BotanicalCorner } from './Botanicals';

const QUICK_LINKS = [
  { label: 'Home', href: '/#home' },
  { label: 'Library', href: '/#catalog' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-border">
      <BotanicalCorner className="pointer-events-none absolute -bottom-3 -left-2 h-28 w-28 text-accent opacity-45" />
      <BotanicalCorner
        flip
        className="pointer-events-none absolute -bottom-3 -right-2 h-28 w-28 text-accent opacity-45"
      />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <LanternMark className="h-12 w-auto text-[var(--icon-color)]" />
            <span className="text-lg tracking-[0.08em]">Lantern Library</span>
          </div>
          <p className="mt-5 max-w-xs text-sm italic leading-7 opacity-70">
            A lantern lit for those who still read, remember, and feel.
          </p>
        </div>
        <div>
          <h3 className="mb-5 text-[10px] uppercase tracking-[0.3em] text-accent">Quick Links</h3>
          <ul className="space-y-2.5">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm opacity-70 transition hover:text-ember hover:opacity-100"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/admin"
                className="text-sm opacity-70 transition hover:text-ember hover:opacity-100"
              >
                Admin
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-5 text-[10px] uppercase tracking-[0.3em] text-accent">Find Us</h3>
          <ul className="space-y-3.5">
            <li>
              <a
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || ''}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-sm opacity-70 transition hover:text-ember hover:opacity-100"
              >
                <MessageCircle className="h-4 w-4 text-accent" strokeWidth={1.5} />
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/lanternlibrary"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-sm opacity-70 transition hover:text-ember hover:opacity-100"
              >
                <Instagram className="h-4 w-4 text-accent" strokeWidth={1.5} />
                @lanternlibrary
              </a>
            </li>
            <li>
              <a
                href="mailto:hello@lanternlibrary.com"
                className="flex items-center gap-3 text-sm opacity-70 transition hover:text-ember hover:opacity-100"
              >
                <Mail className="h-4 w-4 text-accent" strokeWidth={1.5} />
                hello@lanternlibrary.com
              </a>
            </li>
            <li className="flex items-center gap-3 text-sm opacity-70">
              <MapPin className="h-4 w-4 text-accent" strokeWidth={1.5} />
              Srinagar, Kashmir
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-[10px] uppercase tracking-[0.3em] opacity-55">
        © {new Date().getFullYear()} The Lantern Library
      </div>
    </footer>
  );
}
