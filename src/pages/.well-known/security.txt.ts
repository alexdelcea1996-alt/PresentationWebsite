import type { APIRoute } from 'astro';
import { site } from '../../data/site';

/**
 * RFC 9116 security.txt, generated rather than kept as a static file in
 * `public/` for two reasons.
 *
 * `Canonical` has to name the address the file is actually served from, so a
 * hand-typed hostname breaks the moment the domain changes — here it follows
 * `SITE_URL` like every other absolute link on the site.
 *
 * `Expires` is worse as a constant: the field exists so a stale file can be
 * recognised as stale, and a date written by hand quietly passes one day and
 * turns the whole file invalid without anything failing. Computed from the
 * build date, it can only go stale if the site itself stops being rebuilt —
 * which is exactly the condition it is meant to signal.
 *
 * The contact address comes from `src/data/site.ts` for the same reason the
 * hostname comes from `SITE_URL`: mail on a new domain should not need this
 * file edited to follow.
 */
// The context's `site` is the deploy address; `site` from the data module is the
// brand and contact block. Renamed here so both can be used without shadowing.
export const GET: APIRoute = ({ site: origin }) => {
  const canonical = new URL('/.well-known/security.txt', origin).href;

  // One year minus a day: RFC 9116 asks for less than a year out, and a build
  // that happens to land on 29 February should not produce an invalid date.
  const expires = new Date();
  expires.setUTCFullYear(expires.getUTCFullYear() + 1);
  expires.setUTCDate(expires.getUTCDate() - 1);
  expires.setUTCHours(0, 0, 0, 0);

  const body = `# If you find a security problem with this site, tell me and I will fix it.
# There is no bounty — this is a one-person freelance site — but I will credit
# you if you want, and I will reply.

Contact: mailto:${site.email}
Expires: ${expires.toISOString()}
Preferred-Languages: ro, en
Canonical: ${canonical}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
