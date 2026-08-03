import type { EventTime } from "./ics";

// Shared display helpers. Kept out of the components because they are the part worth unit-testing: a wrong
// timecode or a distance rounded in the wrong unit is a bug a screenshot review will not catch.

export const formatClock = (totalSeconds: number): string => {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const rest = seconds % 60;
    const padded = `${String(minutes).padStart(2, `0`)}:${String(rest).padStart(2, `0`)}`;
    return hours > 0 ? `${hours}:${padded}` : padded;
};

// Rounded, in the units a person says out loud: "1 h 47 min", "12 min", "48 s".
export const formatDuration = (totalSeconds: number): string => {
    const seconds = Math.max(0, Math.round(totalSeconds));
    if (seconds < 90) {
        return `${seconds} s`;
    }
    const minutes = Math.round(seconds / 60);
    if (minutes < 90) {
        return `${minutes} min`;
    }
    return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, `0`)} min`;
};

export const formatDistance = (meters: number): string =>
    meters >= 1000 ? `${(meters / 1000).toFixed(meters >= 10_000 ? 1 : 2)} km` : `${Math.round(meters)} m`;

export const formatCount = (value: number): string => value.toLocaleString();

/* An event's parts as UTC so nothing shifts. EventTime holds wall-clock parts exactly as the file wrote them
 * (see ics.ts); building a local Date from them would move a 09:00 meeting by this browser's offset, which is
 * the one thing a calendar viewer must never do. Formatting in UTC prints the parts back unchanged. */
const asUtcDate = (time: EventTime): Date =>
    new Date(Date.UTC(time.year, time.month - 1, time.day, time.hour ?? 0, time.minute ?? 0));

export const formatEventDate = (time: EventTime): string =>
    asUtcDate(time).toLocaleDateString(undefined, { weekday: `short`, day: `numeric`, month: `short`, year: `numeric`, timeZone: `UTC` });

export const formatEventClock = (time: EventTime): string =>
    time.hour === undefined
        ? `All day`
        : asUtcDate(time).toLocaleTimeString(undefined, { hour: `2-digit`, minute: `2-digit`, timeZone: `UTC` });

// The key events are grouped by in the agenda — the calendar day, not an instant.
export const dayKey = (time: EventTime): string =>
    `${time.year}-${String(time.month).padStart(2, `0`)}-${String(time.day).padStart(2, `0`)}`;

export const formatBytes = (bytes: number): string => {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    const units = [`kB`, `MB`, `GB`];
    let value = bytes / 1024;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit += 1;
    }
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
};
