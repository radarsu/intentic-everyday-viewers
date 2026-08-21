/* iCalendar (RFC 5545) → the events a person wants to see. Deliberately a READER, not a calendar engine:
 * recurrence rules are summarised in words rather than expanded, because expanding them means a timezone
 * database, and a viewer that quietly showed the wrong local times would be worse than one that says
 * "repeats weekly" and lets the reader open the real calendar. */

export interface EventTime {
    // Wall-clock parts as written in the file. Kept as parts rather than a Date because a floating or TZID
    // time is NOT this browser's timezone, and turning it into one would shift every event by the offset.
    readonly year: number;
    readonly month: number;
    readonly day: number;
    readonly hour?: number;
    readonly minute?: number;
    // The zone the parts are in: a TZID from the property, `utc` for a trailing Z, undefined when floating.
    readonly zone?: string;
    readonly utc: boolean;
}

export interface CalendarEvent {
    readonly summary: string;
    readonly start: EventTime;
    readonly end?: EventTime;
    readonly allDay: boolean;
    readonly location?: string;
    readonly description?: string;
    // A words-only rendering of RRULE: see the file header for why it is never expanded.
    readonly repeats?: string;
    readonly status?: string;
}

export interface Calendar {
    // X-WR-CALNAME when the exporter wrote one (Google, Apple and Outlook all do); the file name otherwise.
    readonly name?: string;
    readonly events: readonly CalendarEvent[];
    // Lines the file held that were not events (VTODO, VJOURNAL, VFREEBUSY): worth saying rather than
    // rendering an empty sheet for a file that clearly has content.
    readonly otherComponents: readonly string[];
}

interface Property {
    readonly name: string;
    readonly params: Readonly<Record<string, string>>;
    readonly value: string;
}

// RFC 5545 line folding: a CRLF followed by a single space or tab continues the previous line. Unfolding first
// is what makes every later step a plain per-line parse.
const unfold = (text: string): string[] => {
    const lines: string[] = [];
    for (const raw of text.replace(/\r\n?/g, `\n`).split(`\n`)) {
        if ((raw.startsWith(` `) || raw.startsWith(`\t`)) && lines.length > 0) {
            lines[lines.length - 1] += raw.slice(1);
            continue;
        }
        lines.push(raw);
    }
    return lines;
};

// TEXT values escape commas, semicolons, backslashes and newlines; everything else is literal.
const unescapeText = (value: string): string =>
    value.replace(/\\([\\;,nN])/g, (_, char: string) => (char === `n` || char === `N` ? `\n` : char));

/* One content line: NAME(;PARAM=VALUE)*:VALUE. Parameter values may be quoted and may contain a colon
 * (TZID="Europe/Berlin" does, and a naive indexOf(":") would cut the line in the middle of it), so the split
 * point is the first colon OUTSIDE quotes. */
const parseProperty = (line: string): Property | undefined => {
    let quoted = false;
    let colon = -1;
    for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        if (char === `"`) {
            quoted = !quoted;
        } else if (char === `:` && !quoted) {
            colon = index;
            break;
        }
    }
    if (colon < 0) {
        return undefined;
    }
    const head = line.slice(0, colon);
    const value = line.slice(colon + 1);
    const [name, ...paramParts] = head.split(`;`);
    const params: Record<string, string> = {};
    for (const part of paramParts) {
        const equals = part.indexOf(`=`);
        if (equals > 0) {
            params[part.slice(0, equals).toUpperCase()] = part.slice(equals + 1).replace(/^"|"$/g, ``);
        }
    }
    return { name: (name ?? ``).toUpperCase(), params, value };
};

// DATE (20260803) or DATE-TIME (20260803T140000, optionally Z-suffixed). Anything else is not a time we can
// show honestly, so it yields undefined and the event is dropped rather than rendered at the epoch.
export const parseIcsTime = (value: string, params: Readonly<Record<string, string>> = {}): EventTime | undefined => {
    const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(value.trim());
    if (match === null) {
        return undefined;
    }
    const [, year, month, day, hour, minute, , zulu] = match;
    const utc = zulu === `Z`;
    return {
        year: Number(year),
        month: Number(month),
        day: Number(day),
        hour: hour === undefined ? undefined : Number(hour),
        minute: minute === undefined ? undefined : Number(minute),
        zone: utc ? `UTC` : params.TZID,
        utc,
    };
};

const DAY_NAMES: Readonly<Record<string, string>> = {
    MO: `Mon`,
    TU: `Tue`,
    WE: `Wed`,
    TH: `Thu`,
    FR: `Fri`,
    SA: `Sat`,
    SU: `Sun`,
};

const FREQUENCIES: Readonly<Record<string, { one: string; many: string }>> = {
    DAILY: { one: `daily`, many: `days` },
    WEEKLY: { one: `weekly`, many: `weeks` },
    MONTHLY: { one: `monthly`, many: `months` },
    YEARLY: { one: `yearly`, many: `years` },
    HOURLY: { one: `hourly`, many: `hours` },
    MINUTELY: { one: `every minute`, many: `minutes` },
};

// "FREQ=WEEKLY;BYDAY=MO,WE;COUNT=8" → "Repeats weekly on Mon, Wed · 8 times". An unrecognised rule still says
// "Repeats", because the fact that it recurs at all is the part a reader must not miss.
export const describeRecurrence = (rule: string): string => {
    const parts = new Map<string, string>();
    for (const chunk of rule.split(`;`)) {
        const equals = chunk.indexOf(`=`);
        if (equals > 0) {
            parts.set(chunk.slice(0, equals).toUpperCase(), chunk.slice(equals + 1));
        }
    }
    const frequency = FREQUENCIES[(parts.get(`FREQ`) ?? ``).toUpperCase()];
    const interval = Number(parts.get(`INTERVAL`) ?? `1`);
    const words: string[] = [`Repeats`];
    if (frequency === undefined) {
        words.push(`on a schedule this viewer doesn't recognise`);
    } else if (interval > 1) {
        words.push(`every ${interval} ${frequency.many}`);
    } else {
        words.push(frequency.one);
    }
    const byDay = parts.get(`BYDAY`);
    if (byDay !== undefined && byDay !== ``) {
        const days = byDay
            .split(`,`)
            .map((day) => DAY_NAMES[day.slice(-2).toUpperCase()] ?? day)
            .join(`, `);
        words.push(`on ${days}`);
    }
    const count = parts.get(`COUNT`);
    const until = parts.get(`UNTIL`);
    if (count !== undefined) {
        words.push(`· ${count} times`);
    } else if (until !== undefined) {
        const end = parseIcsTime(until);
        words.push(end === undefined ? `· until ${until}` : `· until ${end.year}-${String(end.month).padStart(2, `0`)}-${String(end.day).padStart(2, `0`)}`);
    }
    return words.join(` `);
};

export const parseCalendar = (text: string): Calendar => {
    const events: CalendarEvent[] = [];
    const otherComponents: string[] = [];
    let name: string | undefined;
    let current: Partial<{ summary: string; start: EventTime; end: EventTime; allDay: boolean; location: string; description: string; repeats: string; status: string }> | undefined;

    for (const line of unfold(text)) {
        const property = parseProperty(line);
        if (property === undefined) {
            continue;
        }
        if (property.name === `BEGIN`) {
            if (property.value.toUpperCase() === `VEVENT`) {
                current = {};
            } else if (![`VCALENDAR`, `VTIMEZONE`, `STANDARD`, `DAYLIGHT`, `VALARM`].includes(property.value.toUpperCase())) {
                otherComponents.push(property.value.toUpperCase());
            }
            continue;
        }
        if (property.name === `END`) {
            // A VEVENT with no start is not something a reader can be shown in a calendar; drop it rather than
            // inventing a date for it.
            if (property.value.toUpperCase() === `VEVENT` && current?.start !== undefined) {
                events.push({
                    summary: current.summary ?? `(no title)`,
                    start: current.start,
                    end: current.end,
                    allDay: current.allDay === true,
                    location: current.location,
                    description: current.description,
                    repeats: current.repeats,
                    status: current.status,
                });
            }
            if (property.value.toUpperCase() === `VEVENT`) {
                current = undefined;
            }
            continue;
        }
        if (current === undefined) {
            if (property.name === `X-WR-CALNAME`) {
                name = unescapeText(property.value);
            }
            continue;
        }
        switch (property.name) {
            case `SUMMARY`:
                current.summary = unescapeText(property.value);
                break;
            case `DTSTART`: {
                const start = parseIcsTime(property.value, property.params);
                if (start !== undefined) {
                    current.start = start;
                    current.allDay = property.params.VALUE === `DATE` || start.hour === undefined;
                }
                break;
            }
            case `DTEND`:
            case `DUE`: {
                const end = parseIcsTime(property.value, property.params);
                if (end !== undefined) {
                    current.end = end;
                }
                break;
            }
            case `LOCATION`:
                current.location = unescapeText(property.value);
                break;
            case `DESCRIPTION`:
                current.description = unescapeText(property.value);
                break;
            case `RRULE`:
                current.repeats = describeRecurrence(property.value);
                break;
            case `STATUS`:
                current.status = property.value.toUpperCase();
                break;
            default:
                break;
        }
    }

    return { name, events: sortEvents(events), otherComponents: [...new Set(otherComponents)] };
};

// Chronological by the wall-clock parts, which is the order a reader expects and the only one available
// without resolving zones (see EventTime).
const sortEvents = (events: readonly CalendarEvent[]): CalendarEvent[] =>
    [...events].sort((left, right) => sortKey(left.start) - sortKey(right.start));

const sortKey = (time: EventTime): number =>
    time.year * 100_000_000 + time.month * 1_000_000 + time.day * 10_000 + (time.hour ?? 0) * 100 + (time.minute ?? 0);
