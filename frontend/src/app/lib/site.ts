// Fixed shop details shared across pages. Values that differ per environment
// still come from env vars, but are read once here.
export const INSTAGRAM_HANDLE = 'thelanternlibraryy';
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

export const CONTACT_EMAIL = 'hello@lanternlibrary.com';
export const LOCATION = 'Srinagar, Kashmir';

export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

// Storefront is still being built out — set VITE_COMING_SOON=true (Production
// scope only, e.g. on Vercel) to show a holding page to public visitors
// instead. The admin panel stays fully reachable either way, so the site can
// keep being populated/managed while it isn't publicly launched yet.
export const COMING_SOON = import.meta.env.VITE_COMING_SOON === 'true';
