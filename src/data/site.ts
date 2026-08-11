interface Site {
  name: string;
  role: string;
  email: string;
  /** Optional. Leave empty to hide the link. */
  phone: string;
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

  /** Optional. Leave empty to hide the link. */
  phone: '',

  /** Where the business operates, used in the JSON-LD structured data. */
  areaServed: 'România',
  locality: 'România',

  social: {
    github: '',
    linkedin: '',
  },

  /**
   * Web3Forms access key for the contact form (https://web3forms.com — free).
   * Set PUBLIC_WEB3FORMS_KEY in the build environment. Without it the form
   * degrades gracefully into a pre-filled mailto: link.
   */
  web3formsKey: import.meta.env.PUBLIC_WEB3FORMS_KEY ?? '',
};
