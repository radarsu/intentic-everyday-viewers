import assert from "node:assert/strict";
import { test } from "node:test";
import { parseTable, sniffDelimiter, asNumber, columnStats } from "../src/parse/csv.ts";
import { formatClock, formatDistance, formatDuration, formatEventClock } from "../src/parse/format.ts";
import { elevationChange, haversineMeters, parseTrack } from "../src/parse/gpx.ts";
import { describeRecurrence, parseCalendar, parseIcsTime } from "../src/parse/ics.ts";
import { readFontNames } from "../src/parse/sfnt.ts";
import { parseSubtitles, parseTimecode } from "../src/parse/subtitles.ts";

/* The parsers, against the shapes real exporters actually produce. Node's own runner and no test dependency:
 * node 24 strips the types, so these run straight off src/ with nothing built. */

test(`ics: folded lines, escapes and an all-day event`, () => {
    const calendar = parseCalendar(
        [
            `BEGIN:VCALENDAR`,
            `X-WR-CALNAME:Family`,
            `BEGIN:VEVENT`,
            `SUMMARY:Dentist\\, upstairs`,
            `DTSTART;TZID="Europe/Berlin":20260803T090000`,
            `DTEND;TZID="Europe/Berlin":20260803T093000`,
            `LOCATION:Hauptstr. 1`,
            `DESCRIPTION:Bring the form\\nand the card`,
            `END:VEVENT`,
            `BEGIN:VEVENT`,
            `SUMMARY:Holi`,
            ` day`,
            `DTSTART;VALUE=DATE:20260801`,
            `RRULE:FREQ=YEARLY`,
            `END:VEVENT`,
            `END:VCALENDAR`,
        ].join(`\r\n`),
    );

    assert.equal(calendar.name, `Family`);
    // Chronological, so the 1 August all-day event sorts before the 3 August appointment.
    assert.deepEqual(
        calendar.events.map((event) => event.summary),
        [`Holiday`, `Dentist, upstairs`],
    );
    const [holiday, dentist] = calendar.events;
    assert.equal(holiday?.allDay, true);
    assert.equal(holiday?.repeats, `Repeats yearly`);
    assert.equal(dentist?.allDay, false);
    // The TZID survives the quoted colon in the parameter value, which is where a naive split breaks.
    assert.equal(dentist?.start.zone, `Europe/Berlin`);
    assert.equal(dentist?.description, `Bring the form\nand the card`);
});

test(`ics: a VEVENT with no readable start is dropped rather than dated at the epoch`, () => {
    const calendar = parseCalendar([`BEGIN:VEVENT`, `SUMMARY:Broken`, `DTSTART:not-a-date`, `END:VEVENT`].join(`\n`));
    assert.deepEqual(calendar.events, []);
});

test(`ics: times are the file's wall clock, never this machine's`, () => {
    const time = parseIcsTime(`20260803T090000`);
    assert.deepEqual(
        { year: time?.year, hour: time?.hour, utc: time?.utc },
        { year: 2026, hour: 9, utc: false },
    );
    // 09:00 in the file prints as 09:00 wherever this test runs — the property the UTC formatting protects.
    assert.equal(formatEventClock(time!), new Date(Date.UTC(2026, 7, 3, 9, 0)).toLocaleTimeString(undefined, { hour: `2-digit`, minute: `2-digit`, timeZone: `UTC` }));
});

test(`ics: recurrence is described, never expanded`, () => {
    assert.equal(describeRecurrence(`FREQ=WEEKLY;BYDAY=MO,WE;COUNT=8`), `Repeats weekly on Mon, Wed · 8 times`);
    assert.equal(describeRecurrence(`FREQ=DAILY;INTERVAL=3`), `Repeats every 3 days`);
    assert.equal(describeRecurrence(`FREQ=MONTHLY;UNTIL=20261231T000000Z`), `Repeats monthly · until 2026-12-31`);
    assert.match(describeRecurrence(`FREQ=SECONDLY`), /^Repeats /);
});

test(`csv: quoted delimiters, embedded newlines and doubled quotes`, () => {
    const table = parseTable(`name,note,amount\n"Smith, J.","said ""yes""\nlast week",1234.50\nBloggs,,-12\n`);
    assert.deepEqual(table.columns, [`name`, `note`, `amount`]);
    assert.equal(table.rows.length, 2);
    assert.deepEqual(table.rows[0], [`Smith, J.`, `said "yes"\nlast week`, `1234.50`]);
    // Only the last column is numeric, so only it right-aligns and gets stats.
    assert.deepEqual(table.numeric, [false, false, true]);
});

test(`csv: the delimiter is sniffed outside quotes, so a European export is not read as one column`, () => {
    assert.equal(sniffDelimiter(`a;b;c\n1;2;3`), `;`);
    assert.equal(sniffDelimiter(`"a,b";c\td\te`), `\t`);
    assert.equal(sniffDelimiter(`single-column`), `,`);
});

test(`csv: money and thousands separators still count as numbers`, () => {
    assert.equal(asNumber(`$1,234.50`), 1234.5);
    assert.equal(asNumber(`-12`), -12);
    assert.equal(asNumber(``), undefined);
    assert.equal(asNumber(`n/a`), undefined);
});

test(`csv: blank cells are skipped by the stats rather than averaged as zero`, () => {
    const stats = columnStats([[`10`], [``], [`20`]], 0);
    assert.deepEqual({ ...stats }, { min: 10, max: 20, sum: 30, mean: 15, filled: 2 });
});

test(`gpx: distance, elevation deadband and duration`, () => {
    const gpx = `<?xml version="1.0"?><gpx><metadata><name>Morning loop</name></metadata><trk><trkseg>
        <trkpt lat="52.5200" lon="13.4050"><ele>34</ele><time>2026-08-03T06:00:00Z</time></trkpt>
        <trkpt lat="52.5300" lon="13.4050"><ele>35</ele><time>2026-08-03T06:07:00Z</time></trkpt>
        <trkpt lat="52.5400" lon="13.4050"><ele>60</ele><time>2026-08-03T06:15:00Z</time></trkpt>
    </trkseg></trk><wpt lat="52.54" lon="13.405"><name>Bench</name></wpt></gpx>`;
    const track = parseTrack(gpx);

    assert.equal(track.name, `Morning loop`);
    assert.equal(track.points.length, 3);
    // Two degrees-of-latitude hundredths ≈ 2.2 km.
    assert.ok(Math.abs(track.distanceMeters - 2224) < 20, `distance was ${track.distanceMeters}`);
    // The 1 m step is inside the deadband, so it is DEFERRED rather than discarded: the reference stays at 34
    // and the whole 26 m is counted once the climb clears the band. A deadband that dropped it would shave a
    // metre off every slow ascent, which is the opposite of what it is for.
    assert.equal(Math.round(track.ascentMeters), 26);
    assert.equal(track.durationSeconds, 900);
    assert.deepEqual(track.waypoints, [{ lat: 52.54, lon: 13.405, name: `Bench` }]);
});

test(`gpx: a self-closing trkpt and a route-only file still parse`, () => {
    const track = parseTrack(`<gpx><rte><rtept lat="1" lon="2"/><rtept lat="1.5" lon="2"/></rte></gpx>`);
    assert.equal(track.points.length, 2);
    assert.equal(track.durationSeconds, undefined);
});

test(`gpx: haversine is symmetric and zero for a repeated fix`, () => {
    const a = { lat: 48.8584, lon: 2.2945 };
    const b = { lat: 51.5007, lon: -0.1246 };
    assert.equal(Math.round(haversineMeters(a, b)), Math.round(haversineMeters(b, a)));
    assert.equal(haversineMeters(a, a), 0);
    assert.deepEqual(elevationChange([{ lat: 0, lon: 0 }]), { ascent: 0, descent: 0 });
});

test(`srt and vtt parse to the same cue shape`, () => {
    const srt = parseSubtitles(`1\n00:00:01,000 --> 00:00:04,000\n<i>Hello</i> there\n\n2\n00:01:00,500 --> 00:01:02,000\nSecond line\n`);
    assert.equal(srt.kind, `srt`);
    assert.deepEqual(
        srt.cues.map((cue) => cue.text),
        [`Hello there`, `Second line`],
    );
    assert.equal(srt.durationSeconds, 62);
    assert.equal(srt.wordCount, 4);

    const vtt = parseSubtitles(`WEBVTT\n\nintro\n00:01.000 --> 00:04.000 align:start\nHello there\n`);
    assert.equal(vtt.kind, `vtt`);
    assert.equal(vtt.cues.length, 1);
    assert.equal(vtt.cues[0]?.startSeconds, 1);
});

test(`timecodes accept both separators and an omitted hour`, () => {
    assert.equal(parseTimecode(`01:02:03,456`), 3723.456);
    assert.equal(parseTimecode(`02:03.5`), 123.5);
    assert.equal(parseTimecode(`nonsense`), undefined);
});

test(`sfnt: the name table is read out of a minimal font, and rubbish yields no names`, () => {
    assert.deepEqual(readFontNames(new Uint8Array([1, 2, 3])), {});
    assert.deepEqual(readFontNames(buildFont(`Testface`, `Bold`)), { family: `Testface`, subfamily: `Bold` });
});

test(`formatting`, () => {
    assert.equal(formatClock(3723), `1:02:03`);
    assert.equal(formatClock(62), `01:02`);
    assert.equal(formatDuration(45), `45 s`);
    assert.equal(formatDuration(3600 + 47 * 60), `1 h 47 min`);
    assert.equal(formatDistance(840), `840 m`);
    assert.equal(formatDistance(12_400), `12.4 km`);
    assert.equal(formatDistance(1200), `1.20 km`);
});

/* A minimal but structurally real sfnt: header, one table record pointing at a `name` table holding two
 * UTF-16BE records. Hand-built rather than checked in as a binary fixture — a 4 kB blob nobody can read in a
 * diff would make this test unmaintainable, and the whole point is the offsets. */
const buildFont = (family: string, subfamily: string): Uint8Array => {
    const strings = [family, subfamily].map((value) => {
        const bytes = new Uint8Array(value.length * 2);
        for (let index = 0; index < value.length; index += 1) {
            bytes[index * 2] = 0;
            bytes[index * 2 + 1] = value.charCodeAt(index);
        }
        return bytes;
    });
    const storage = strings.reduce((total, bytes) => total + bytes.length, 0);
    const nameTableLength = 6 + strings.length * 12 + storage;
    const nameOffset = 12 + 16;
    const buffer = new Uint8Array(nameOffset + nameTableLength);
    const view = new DataView(buffer.buffer);

    view.setUint32(0, 0x00010000); // sfnt version
    view.setUint16(4, 1); // one table
    view.setUint32(12, 0x6e616d65); // tag "name"
    view.setUint32(12 + 8, nameOffset);
    view.setUint32(12 + 12, nameTableLength);

    view.setUint16(nameOffset + 2, strings.length);
    view.setUint16(nameOffset + 4, 6 + strings.length * 12); // storage offset, relative to the table
    let cursor = 0;
    strings.forEach((bytes, index) => {
        const record = nameOffset + 6 + index * 12;
        view.setUint16(record, 3); // platform 3 (Windows) ⇒ UTF-16BE
        view.setUint16(record + 6, index + 1); // nameID 1 (family), then 2 (subfamily)
        view.setUint16(record + 8, bytes.length);
        view.setUint16(record + 10, cursor);
        buffer.set(bytes, nameOffset + 6 + strings.length * 12 + cursor);
        cursor += bytes.length;
    });
    return buffer;
};
