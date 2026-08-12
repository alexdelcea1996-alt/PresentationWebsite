/**
 * The inner markup of every 24×24 stroke icon on the site.
 *
 * These live outside `Icon.astro` because the booking demo draws its own
 * buttons from a client script, which cannot render an Astro component. Sharing
 * the source means a redrawn icon changes everywhere at once instead of leaving
 * the demo with an older glyph.
 *
 * The four the demo needs are exported one by one so importing them does not
 * drag the whole set into its bundle.
 */

export const check = '<path d="m4 12.5 5 5L20 6.5"/>';
export const close = '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>';
export const minus = '<path d="M6 12h12"/>';
export const arrowRight = '<path d="M4 12h16"/><path d="m14 6 6 6-6 6"/>';

export type IconName =
  | 'browser'
  | 'cart'
  | 'app'
  | 'gauge'
  | 'target'
  | 'check'
  | 'minus'
  | 'arrow-right'
  | 'mail'
  | 'menu'
  | 'close'
  | 'globe'
  | 'spark'
  | 'rss'
  | 'sun'
  | 'moon'
  | 'calendar'
  | 'phone'
  | 'whatsapp';

export const iconPaths: Record<IconName, string> = {
  browser:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M7 6.5h.01M10 6.5h.01"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h2.5l2.4 12.2a2 2 0 0 0 2 1.6h8.3a2 2 0 0 0 2-1.6L21 7H5.5"/>',
  app: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
  gauge: '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="m14.1 9.9 3.6-3.6"/><path d="M3.5 19a9 9 0 1 1 17 0"/>',
  // One page, one objective.
  target:
    '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.25"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/>',
  check,
  minus,
  'arrow-right': arrowRight,
  mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6.5 9 6.5 9-6.5"/>',
  menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
  close,
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
  rss: '<path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  // Handset: two pills joined by an arc, same construction as the one inside
  // the WhatsApp mark below, so the pair reads as one family.
  phone:
    '<path d="M5.2 8a1.4 1.4 0 0 0 2.8 0V5.2a1.4 1.4 0 0 0-2.8 0V8a10.8 10.8 0 0 0 10.8 10.8h2.8a1.4 1.4 0 0 0 0-2.8h-2.8a1.4 1.4 0 0 0 0 2.8"/>',
  // Speech bubble with a tail, and a handset drawn as two stroked pills joined
  // by an arc — the pills fill in at this stroke width, like the real mark.
  whatsapp:
    '<path d="M4.2 16.5A9 9 0 1 1 8.2 20.2L3 21Z"/><path d="M9.7 10.2a.6.6 0 0 0 1.2 0V9a.6.6 0 0 0-1.2 0v1.2a4.6 4.6 0 0 0 4.6 4.6h1.2a.6.6 0 0 0 0-1.2h-1.2a.6.6 0 0 0 0 1.2"/>',
};
