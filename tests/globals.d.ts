/**
 * Globals the suites install in the page via `addInitScript` to observe things
 * the DOM does not expose directly. Declared here so `npm run check` stays clean.
 */
interface Window {
  /** Cumulative layout shift, accumulated by a `layout-shift` observer. */
  __cls: number;
  /** CSP violations seen on the page, as `directive <- blockedURI`. */
  __csp: string[];
  /** Animation frames counted, to prove the hero's rAF loop actually stops. */
  __frames: number;
}
