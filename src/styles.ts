import type { Disposable } from "@intentic/extension-api";

/* ONE STYLESHEET, INJECTED BY activate() — the documented way a third-party bundle styles itself.
 *
 * Two constraints decide this. Vite's library build emits an SFC <style> block as a SEPARATE css asset, and the
 * host imports one JS file from a blob URL, so nothing ever fetches that asset: a scoped <style> in a viewer is
 * dead weight. And the app's Tailwind build cannot scan a bundle it does not build, so utility classes resolve
 * only by accident. What is reliably there is the design system's own authored CSS — the `.ui-*` classes and
 * the role tokens below, which follow the light/dark scheme on their own.
 *
 * So: a small sheet of `.ev-*` rules over those tokens, added once and removed on deactivation. It buys the two
 * things inline styles cannot express at all — `:hover` and a sticky table header — and keeps the five viewers
 * looking like one extension rather than five. */

const SHEET = `
.ev-page { padding: 1rem 1.25rem 2rem; color: var(--color-content); }
.ev-head { display: flex; align-items: baseline; gap: 0.75rem; flex-wrap: wrap; }
.ev-title { font-size: 1.05rem; font-weight: 600; }
.ev-muted { color: var(--color-muted); }
.ev-small { font-size: 0.75rem; }
.ev-stats { display: flex; gap: 1.75rem; flex-wrap: wrap; margin: 1rem 0 1.25rem; }
.ev-stat-value { font-size: 1.35rem; font-weight: 600; font-variant-numeric: tabular-nums; line-height: 1.2; }
.ev-stat-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted); }
.ev-toolbar { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.75rem; }
.ev-input {
    border: 1px solid var(--color-line); background: transparent; color: inherit;
    border-radius: 0.375rem; padding: 0.35rem 0.6rem; font: inherit; min-width: 12rem;
}
.ev-input:focus { outline: 2px solid color-mix(in srgb, var(--color-content) 35%, transparent); outline-offset: 1px; }
.ev-scroll { overflow: auto; max-height: calc(100vh - 14rem); border: 1px solid var(--color-line); border-radius: 0.5rem; }
.ev-table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums; font-size: 0.85rem; }
.ev-table th {
    position: sticky; top: 0; z-index: 1; background: var(--color-card); text-align: left; white-space: nowrap;
    padding: 0.45rem 0.7rem; border-bottom: 1px solid var(--color-line); cursor: pointer; user-select: none;
}
.ev-table th:hover { color: var(--color-content); }
.ev-table td { padding: 0.35rem 0.7rem; border-bottom: 1px solid color-mix(in srgb, var(--color-line) 60%, transparent); }
.ev-table tbody tr:hover { background: color-mix(in srgb, var(--color-content) 6%, transparent); }
.ev-num { text-align: right; }
.ev-day { margin-top: 1.25rem; font-weight: 600; font-size: 0.8rem; letter-spacing: 0.03em; text-transform: uppercase; color: var(--color-muted); }
/* Wide enough for a 12-hour range with both meridiems ("09:00 AM – 09:30 AM"), which is the longest a time
 * column gets and what it wrapped to two lines at 7rem. */
.ev-event { display: grid; grid-template-columns: 9rem 1fr; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid color-mix(in srgb, var(--color-line) 60%, transparent); }
.ev-cue { display: grid; grid-template-columns: 10rem 1fr; gap: 0.75rem; padding: 0.35rem 0; border-bottom: 1px solid color-mix(in srgb, var(--color-line) 60%, transparent); }
.ev-cue:hover { background: color-mix(in srgb, var(--color-content) 5%, transparent); }
.ev-mark { background: color-mix(in srgb, orange 45%, transparent); border-radius: 0.15rem; }
.ev-specimen { border: 1px solid var(--color-line); border-radius: 0.5rem; padding: 1rem 1.25rem; margin-bottom: 0.75rem; }
.ev-track { display: flex; gap: 2rem; flex-wrap: wrap; align-items: flex-start; }
.ev-note { color: var(--color-muted); font-size: 0.8rem; margin-top: 1rem; }
/* A font's embedded licence is often the entire GPL. It belongs on the page — it is the one place a person
 * finds out what they may do with the file — but not as twelve lines under the specimen; the full text is one
 * hover away. */
.ev-license { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
`;

export const installStyles = (): Disposable => {
    const element = document.createElement(`style`);
    element.dataset.owner = `intentic.everyday-viewers`;
    element.textContent = SHEET;
    document.head.append(element);
    return { dispose: (): void => element.remove() };
};
