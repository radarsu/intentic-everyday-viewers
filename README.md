# Everyday viewers

Five file formats a workspace collects that nobody would call source code, rendered as the thing they are
instead of as the text they happen to be stored as.

| Open a… | And you get |
| --- | --- |
| `.ics` `.ical` `.ifb` | The calendar as an agenda — grouped by day, with locations, all-day events and a plain-words note for anything that repeats |
| `.csv` `.tsv` | A sortable, filterable table with a sum/min/max/mean for every numeric column |
| `.gpx` | The recorded route drawn from the file itself, with distance, elapsed time, pace, climbing and an elevation profile |
| `.srt` `.vtt` | A searchable transcript with timecodes and the match highlighted |
| `.ttf` `.otf` `.woff` `.woff2` | A specimen sheet at six sizes with your own sample text, and the font's real family name read out of its `name` table |

This is an [intentic](https://intentic.dev) extension. It is not part of the app: the core resolves a file to
text or to opaque bytes and stops there, and the first-party `intentic.viewers` pack handles pictures, PDFs,
audio, video and Office documents. This one takes the next tier down — the formats that are useful to somebody
and not to everybody.

## What it is allowed to do

Nothing but render. The manifest declares **no `permissions.sandbox` at all**, so the host refuses every
attempt this bundle could make to call the daemon — there is no route it can reach, no file it can write, and
nothing it can send anywhere. The host fetches the file, hands the component the content, and gets markup back.

`.gpx` tracks are drawn with **no basemap**, deliberately: a map tile would mean a tile server, which would
mean the coordinates of every track you open leaving your machine, and a viewer that does not work in a sandbox
without open internet.

## Install

**Capabilities → Add → Extension**, then the repo URL and a full 40-character commit sha. Extensions install
sha-pinned — the commit you approve is the code that runs, and there is no build step at install time.

## Build it yourself

```sh
pnpm install
pnpm typecheck     # vue-tsc over src/ and test/
pnpm test              # the parsers, then the built bundle against a manifest-enforcing host stub
pnpm build         # dist/extension.js — one file, vue as the only import
```

`dist/extension.js` is **committed**, because that is what `entry` in the manifest points at and what the
owner's sandbox clones. Rebuild and commit it in the same commit as any source change, or the sha you publish
runs the previous version.

## Notes for anyone reading the source

- **The parsers are the substance and they are unit-tested** (`test/parse.test.ts`): iCalendar line folding and
  quoted `TZID` parameters, RFC 4180 quoting with embedded newlines, delimiter sniffing outside quotes, the
  haversine distance and the elevation deadband, both subtitle dialects, and the sfnt `name` table.
- **Calendar times are never converted.** An event carries the wall-clock parts the file wrote plus the zone it
  named; the viewer formats them in UTC so they print back unchanged. Converting to the browser's zone would
  move a 09:00 appointment by the offset, which is the one thing a calendar viewer must not do.
- **Styling is one injected stylesheet** (`src/styles.ts`), not SFC `<style>` blocks: vite's library build emits
  those as a separate CSS asset, and the host imports a single JS file from a blob URL, so nothing would ever
  fetch it. The sheet is built on the design system's role tokens (`--color-content`, `--color-muted`,
  `--color-line`, `--color-card`), so it follows the light/dark theme without knowing which one is on.
- **Tailwind utility classes do not work here** and none are used. The app's Tailwind build cannot scan a bundle
  it does not build.

## Publishing your own copy

`publisher` and `name` in `intentic-extension.json` are the identity the app installs under
(`publisher.name`) and the key a registry lists. Change `publisher` to your own slug before publishing a fork,
or it will collide with this listing rather than shadow it.

MIT licensed. No warranty, and nobody has audited it but its author.
