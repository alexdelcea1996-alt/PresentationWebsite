/**
 * The suite, as an object.
 *
 * Every dot in the constellation carries a depth, and the depth is the suite
 * the check belongs to: twenty-eight sheets stacked back to front, each as
 * dense as that suite is large. Head-on it is the mark; turned, it comes apart
 * into the shape of the thing it counts.
 *
 * What has to hold, and what each of these is here to catch:
 *
 *  - it is genuinely three-dimensional. A cloud that never turns is a picture
 *    with extra arithmetic, and nothing would report the difference.
 *  - the depth means something. Random z looks identical from the front and is
 *    a lie from the side, so the layers are checked against the real per-suite
 *    counts read out of `tests/suites/` — the same numbers the page is drawn
 *    from, recomputed here independently.
 *  - it is square when you are looking at it. The first build anchored the
 *    rotation to the whole crossing rather than to the middle of the screen and
 *    the mark arrived already smeared nine degrees.
 *  - nothing turns it on its own. A decorative canvas of thirteen hundred
 *    points that repaints on a timer is battery spent on nobody, so an idle tab
 *    must paint nothing at all.
 *  - reduced motion gets the flat mark, not a slower turn.
 *
 * One thing here is NOT guarded, and it matters enough to say so: the turn is
 * armed on idle rather than at parse time, which is worth six points of mobile
 * Lighthouse — measured six runs each way, 86 against 92. Every check written
 * for it gave the same answer for both versions. On a local page served from
 * disk the idle callback lands within a few frames of the load, so "before
 * idle" is too small a window to sample and "during the load" is long enough
 * that both versions are painting by the end of it. A check that cannot tell
 * the code from its regression is worse than no check, so the guard for this
 * one is the Lighthouse gate and the note in `Constellation.astro`.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, BASE, checks } from '../harness.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ck = checks();
const b = await launch();

/**
 * The per-suite tally, recomputed here rather than imported.
 *
 * `src/data/checks.ts` counts these at build time and the canvas is drawn from
 * what it found. Importing the same module would compare the page against
 * itself and agree no matter what either of them said.
 */
const CALL = /\b(?:ck|check)\(\s*(['"`])([^'"`\n]{12,64})\1/g;
const shape = readdirSync(join(root, 'tests', 'suites'))
  .sort()
  .filter((file) => file.endsWith('.mjs'))
  .map((file) => [...readFileSync(join(root, 'tests', 'suites', file), 'utf8').matchAll(CALL)].length);

/** Reads the model out of the page: one entry per dot, with its depth. */
const MODEL = `() => {
  const canvas = document.querySelector('[data-constellation]');
  const box = canvas.getBoundingClientRect();
  return {
    shape: JSON.parse(canvas.dataset.shape || '[]'),
    built: canvas.dataset.built || '',
    count: Number(canvas.dataset.count || 0),
    top: Math.round(box.top),
    height: Math.round(box.height),
  };
}`;

// --- The page is drawn from the suite it is counting -------------------------
{
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(`${BASE}/`, { waitUntil: 'load' });
  const model = await p.evaluate(([expr]) => new Function(`return (${expr})`)()(), [MODEL]);

  ck('the canvas is handed the shape of the suite', model.shape.length > 0, `${model.shape.length} suites`);
  ck('and it is the shape the suite actually has',
    JSON.stringify(model.shape) === JSON.stringify(shape),
    `page ${model.shape.length} entries, suite ${shape.length}`);
  ck('one sheet per suite file', model.shape.length === shape.length, `${model.shape.length}`);
  // The sheets are wildly uneven, which is the point: a stack of equal layers
  // would be a decoration that happens to have 28 of something.
  ck('and the sheets are as uneven as the suite is',
    Math.max(...model.shape) > Math.min(...model.shape) * 8,
    `${Math.min(...model.shape)}..${Math.max(...model.shape)}`);

  /*
    The data reaching the page and the data being used are two different facts.

    A build that read the shape, wrote it into the attribute above and then gave
    every dot a random depth drew something that looked much the same and passed
    every check here — which is how this one came to exist. The canvas reports
    the mean depth of each sheet it actually built: laid out back to front those
    are a monotonic ramp, and random depth puts them all at zero.
  */
  const built = JSON.parse(model.built || '[]');
  ck('the canvas reports the stack it built', built.length === shape.length,
    `${built.length} sheets reported`);
  const rising = built.every((z, i) => i === 0 || z > built[i - 1]);
  ck('and the sheets really are stacked back to front, not scattered',
    rising, `${built.slice(0, 3).join(', ')} … ${built.slice(-2).join(', ')}`);
  const span = built[built.length - 1] - built[0];
  ck('and the stack is as deep as it was declared',
    span > 0.15 && span < 0.3, `${span.toFixed(3)} of the mark's width`);
  await p.close();
}

// --- It is an object: it turns, and it turns with the scroll -----------------
{
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(`${BASE}/`, { waitUntil: 'load' });
  await p.waitForTimeout(600);

  /*
    Read the pixels, not a variable.

    The rotation lives in a closure with nothing exposed, which is how it should
    be — so the check is done the way a reader would do it: take the drawing at
    two scroll positions and see whether it changed. A canvas that never turns
    produces identical bytes.
  */
  const shot = async (y) => {
    await p.evaluate((at) => window.scrollTo({ top: at, behavior: 'instant' }), y);
    await p.waitForTimeout(500);
    return p.evaluate(() => {
      const canvas = document.querySelector('[data-constellation]');
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      // A cheap signature: how much ink, and where its centre of mass sits.
      let ink = 0;
      let sx = 0;
      let sy = 0;
      for (let i = 3; i < data.length; i += 16) {
        const a = data[i];
        if (!a) continue;
        const px = ((i - 3) / 4) % canvas.width;
        const py = Math.floor((i - 3) / 4 / canvas.width);
        ink += a;
        sx += px * a;
        sy += py * a;
      }
      return { ink, cx: sx / (ink || 1), cy: sy / (ink || 1) };
    });
  };

  const near = await shot(0);
  const far = await shot(760);
  ck('there is something drawn at all', near.ink > 0, `${near.ink}`);
  /*
    The horizontal centre specifically, not "either axis".

    The first version accepted a move in x or in y, and passed a build where the
    turn had been switched off and only the tilt remained — which is half the
    effect reported as all of it. Turning about the upright axis is the claim;
    the tilt is a garnish on it.
  */
  ck('and the object turns as the page scrolls',
    Math.abs(near.cx - far.cx) > 4,
    `centre ${near.cx.toFixed(1)} -> ${far.cx.toFixed(1)}`);
  ck('and leans as well as turns',
    Math.abs(near.cy - far.cy) > 1, `${near.cy.toFixed(1)} -> ${far.cy.toFixed(1)}`);

  /*
    Square when it is in front of you. With the object centred in the viewport
    the mark has to be symmetric about its own middle — the state a visitor
    reads it in. The first build was nine degrees off here and the arms were
    already smeared before anybody scrolled.
  */
  await p.evaluate(() => {
    const canvas = document.querySelector('[data-constellation]');
    const box = canvas.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + box.top + box.height / 2 - innerHeight / 2, behavior: 'instant' });
  });
  // Long enough for the ease to land, so this is the square state and not a
  // frame somewhere on the way to it.
  await p.waitForTimeout(1300);
  const centred = await p.evaluate(() => {
    const canvas = document.querySelector('[data-constellation]');
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const data = ctx.getImageData(0, 0, w, canvas.height).data;
    let left = 0;
    let right = 0;
    for (let i = 3; i < data.length; i += 16) {
      const a = data[i];
      if (!a) continue;
      const px = ((i - 3) / 4) % w;
      if (px < w / 2) left += a;
      else right += a;
    }
    return { left, right };
  });
  const lean = Math.abs(centred.left - centred.right) / (centred.left + centred.right || 1);
  ck('and it is square when it is in the middle of the screen', lean < 0.06,
    `${(lean * 100).toFixed(1)}% more ink on one side`);

  await p.close();
}

// --- Nothing turns it on its own ---------------------------------------------
/*
  The mark is 900px of canvas sitting behind the hero of every visit. A rotation
  on a timer would repaint it sixty times a second for as long as the tab is
  open and nobody is even looking at it. Held still, the frame loop must go back
  to sleep — measured as frames actually served, not as an assertion about the
  code.
*/
{
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(`${BASE}/`, { waitUntil: 'load' });
  await p.waitForTimeout(1200);
  const idle = await p.evaluate(async () => {
    const canvas = document.querySelector('[data-constellation]');
    const ctx = canvas.getContext('2d');
    const original = ctx.clearRect.bind(ctx);
    let paints = 0;
    ctx.clearRect = (...args) => { paints += 1; return original(...args); };

    const ink = () => {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let total = 0;
      let sx = 0;
      for (let i = 3; i < data.length; i += 16) {
        const a = data[i];
        if (!a) continue;
        total += a;
        sx += (((i - 3) / 4) % canvas.width) * a;
      }
      return sx / (total || 1);
    };

    const first = ink();
    await new Promise((r) => setTimeout(r, 3200));
    const last = ink();
    ctx.clearRect = original;
    return { paints, drift: Math.abs(first - last) };
  });

  /*
    The pulse that was already here fires every 1.8s and animates for 950ms, so
    a 3.2s window allows two bursts — about 114 frames at sixty a second. A
    rotation running on its own would be 190 or more, and the gap between those
    is thin enough that the second check matters more than the first: a mark
    turning by itself moves its own centre of mass, and a pulse ring does not.
  */
  ck('an untouched page is not repainting the mark forever', idle.paints < 150,
    `${idle.paints} paints in 3.2s`);
  ck('and nothing is turning it while nobody touches it', idle.drift < 1,
    `${idle.drift.toFixed(2)}px of drift`);
  await p.close();
}

// --- The pointer turns the one you can touch ---------------------------------
{
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(`${BASE}/colofon/`, { waitUntil: 'load' });
  const canvas = p.locator('[data-constellation][data-interactive]');
  await canvas.scrollIntoViewIfNeeded();
  await p.waitForTimeout(700);

  const ink = () =>
    p.evaluate(() => {
      const el = document.querySelector('[data-constellation][data-interactive]');
      const data = el.getContext('2d').getImageData(0, 0, el.width, el.height).data;
      let left = 0;
      let right = 0;
      for (let i = 3; i < data.length; i += 8) {
        const a = data[i];
        if (!a) continue;
        if (((i - 3) / 4) % el.width < el.width / 2) left += a;
        else right += a;
      }
      return { left, right };
    });

  const box = await canvas.boundingBox();
  await p.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.5);
  await p.waitForTimeout(700);
  const turned = await ink();

  await p.mouse.move(box.x + box.width * 0.1, box.y + box.height * 0.5);
  await p.waitForTimeout(700);
  const other = await ink();

  const balance = (v) => v.left / (v.left + v.right || 1);
  ck('the pointer turns it, and turning it moves the ink across',
    Math.abs(balance(turned) - balance(other)) > 0.01,
    `${balance(turned).toFixed(3)} vs ${balance(other).toFixed(3)}`);

  // Naming has to follow the rotation: the dot under the cursor is the dot that
  // was drawn there, not the one that would have been there unturned.
  await p.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.22);
  await p.waitForTimeout(500);
  const named = await p.locator('[data-constellation-tip]').innerText();
  ck('and hovering it still names a check', named.trim().length > 4, JSON.stringify(named));
  await p.close();
}

// --- Reduced motion gets the mark, flat --------------------------------------
{
  const calm = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await calm.emulateMedia({ reducedMotion: 'reduce' });
  await calm.goto(`${BASE}/`, { waitUntil: 'load' });
  await calm.waitForTimeout(700);

  const sample = () =>
    calm.evaluate(() => {
      const el = document.querySelector('[data-constellation]');
      const data = el.getContext('2d').getImageData(0, 0, el.width, el.height).data;
      let ink = 0;
      let sx = 0;
      for (let i = 3; i < data.length; i += 16) {
        const a = data[i];
        if (!a) continue;
        ink += a;
        sx += (((i - 3) / 4) % el.width) * a;
      }
      return sx / (ink || 1);
    });

  const before = await sample();
  await calm.evaluate(() => window.scrollTo({ top: 760, behavior: 'instant' }));
  await calm.waitForTimeout(600);
  const after = await sample();
  ck('reduced motion leaves the mark exactly where it was',
    Math.abs(before - after) < 0.5, `${before.toFixed(2)} -> ${after.toFixed(2)}`);
  await calm.close();
}

await b.close();
ck.report();
