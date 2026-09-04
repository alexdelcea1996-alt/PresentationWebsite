/**
 * How a page hands the contact form what the visitor already told it.
 *
 * While everything lived on one long page this needed no mechanism at all: the
 * configurator and the audit band simply wrote into `#field-type` and
 * `#field-message`, because the form was three sections further down the same
 * document. Now the form has a page of its own and those writes would land in
 * an empty room.
 *
 * So the hand-over crosses a navigation. `?from=` and `?via=` already carry the
 * simple half of it — which offer to preselect, and which page did the
 * convincing — and they stay in the address bar where a visitor can see them.
 * What they cannot carry is a paragraph: the estimate's itemised summary would
 * turn the address into four hundred characters of encoded text that gets
 * copied, pasted and shared looking like a tracking link.
 *
 * That part travels in `sessionStorage` instead: same tab, same origin, gone
 * when the tab closes, and never read more than once — the form deletes it as
 * it applies it, so a later visit is not haunted by an estimate from an hour
 * ago. The form still announces what it filled in, in the visible note it has
 * always shown. Context travels with the visitor; it never changes things
 * behind their back.
 *
 * The key is declared here and rendered onto each component's root element, so
 * the three scripts that use it read one value instead of agreeing on a string
 * three times.
 */
export const HANDOVER_KEY = 'ad:contact-handover';

/** What may travel. Every field optional: each sender fills what it knows. */
export interface Handover {
  /** Stable `data-id` of an option in `#field-type`. */
  type?: string;
  /** Stable `data-id` of an option in `#field-budget`. */
  budget?: string;
  /** Prewritten message, only used when the visitor has not written one. */
  message?: string;
  /** The address the audit band was pointed at. */
  website?: string;
  /** Which step of the form the visitor should land on. */
  step?: number;
}
