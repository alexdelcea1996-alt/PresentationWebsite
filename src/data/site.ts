interface Site {
  name: string;
  role: string;
  email: string;
  /** Shown as a `tel:` link. Empty hides it. */
  phone: string;
  /** WhatsApp number. Empty hides the WhatsApp entry. */
  whatsapp: string;
  /** Cal.com `username/event`. Empty disables booking everywhere. */
  calLink: string;
  areaServed: string;
  locality: string;
  social: { github: string; linkedin: string };
  web3formsKey: string;
}

/**
 * Central place for brand + contact details.
 * Everything here is rendered publicly — update before launch.
 */
export const site: Site = {
  /** Displayed in the header, footer and structured data. */
  name: 'Alex Delcea',
  role: 'Web Developer',

  /** Public contact address shown on the site and used by the form fallback. */
  email: 'alexdelcea1996@gmail.com',

  /**
   * Shown as a `tel:` link in the contact card and the footer, and published
   * as `telephone` in the structured data. Empty hides all three.
   */
  phone: '+40 767 079 882',

  /**
   * WhatsApp number, written the way you want it displayed. The link is built
   * from the digits alone, so the spaces and the leading + are only cosmetic.
   * Leave empty and the WhatsApp entry disappears from the contact section.
   */
  whatsapp: '+40 767 079 882',

  /** Where the business operates, used in the JSON-LD structured data. */
  areaServed: 'România',
  locality: 'România',

  social: {
    github: '',
    linkedin: '',
  },

  /**
   * Cal.com booking link, as `username/event` — for example `alex-delcea/30min`.
   * Leave empty and every booking affordance disappears from the site; nothing
   * renders a dead button.
   */
  calLink: 'delcea-alexandru-arqdvl/30min',

  /**
   * Web3Forms access key for the contact form (https://web3forms.com — free).
   * Set PUBLIC_WEB3FORMS_KEY in the build environment. Without it the form
   * degrades gracefully into a pre-filled mailto: link.
   */
  web3formsKey: import.meta.env.PUBLIC_WEB3FORMS_KEY ?? '',
};

/** Both schemes reject spaces and punctuation, so the display format above is
 *  free to be readable. */
const digits = (value: string) => value.replace(/\D/g, '');

/** `tel:` keeps the leading + — that is what makes the number dialable from
 *  abroad. Empty string when no phone is configured, so callers can skip it. */
export const telHref = () => (site.phone ? `tel:+${digits(site.phone)}` : '');

/** Empty string when no WhatsApp number is configured. */
export const whatsappHref = (message: string) =>
  site.whatsapp
    ? `https://wa.me/${digits(site.whatsapp)}?text=${encodeURIComponent(message)}`
    : '';
