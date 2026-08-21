/* SubRip (.srt) and WebVTT (.vtt) → a transcript with timecodes. One parser for both: they differ in the
 * decimal separator, an optional header, and cue settings the reader does not need, so splitting them would be
 * two copies of the same block walk. */

export interface Cue {
    readonly index: number;
    readonly startSeconds: number;
    readonly endSeconds: number;
    readonly text: string;
}

export interface Subtitles {
    readonly cues: readonly Cue[];
    readonly kind: "srt" | "vtt";
    // Where the last cue ends: the runtime of the thing this transcribes, near enough to be useful.
    readonly durationSeconds: number;
    readonly wordCount: number;
}

// "01:02:03,456" / "01:02:03.456" / "02:03.456" (VTT allows dropping the hour). Returns seconds.
export const parseTimecode = (value: string): number | undefined => {
    const match = /^(?:(\d+):)?(\d{1,2}):(\d{2})(?:[.,](\d{1,3}))?$/.exec(value.trim());
    if (match === null) {
        return undefined;
    }
    const [, hours, minutes, seconds, fraction] = match;
    return (
        Number(hours ?? 0) * 3600 +
        Number(minutes) * 60 +
        Number(seconds) +
        Number(`0.${fraction ?? `0`}`)
    );
};

const TIMING = /^(.+?)\s*-->\s*(\S+)/;

// Cue text carries basic markup in both formats (<i>, <b>, {\an8} positioning in the wild). Stripped, because
// this is a transcript to read and search, not a renderer.
const stripMarkup = (text: string): string =>
    text
        .replace(/<[^>]*>/g, ``)
        .replace(/\{\\[^}]*\}/g, ``)
        .trim();

export const parseSubtitles = (text: string): Subtitles => {
    const normalized = text.replace(/^﻿/, ``).replace(/\r\n?/g, `\n`);
    const kind = /^WEBVTT/.test(normalized.trimStart()) ? `vtt` : `srt`;
    const cues: Cue[] = [];

    for (const block of normalized.split(/\n{2,}/)) {
        const lines = block.split(`\n`).filter((line) => line.trim() !== ``);
        if (lines.length === 0) {
            continue;
        }
        // A block is a cue when one of its first two lines is a timing line: SRT puts a number first, VTT may
        // put an optional cue id there, and the WEBVTT header block has no timing line at all.
        const timingIndex = lines.findIndex((line) => TIMING.test(line) && line.includes(`-->`));
        if (timingIndex < 0 || timingIndex > 1) {
            continue;
        }
        const match = TIMING.exec(lines[timingIndex] as string);
        const startSeconds = parseTimecode(match?.[1] ?? ``);
        const endSeconds = parseTimecode(match?.[2] ?? ``);
        if (startSeconds === undefined || endSeconds === undefined) {
            continue;
        }
        const body = stripMarkup(lines.slice(timingIndex + 1).join(`\n`));
        if (body === ``) {
            continue;
        }
        cues.push({ index: cues.length + 1, startSeconds, endSeconds, text: body });
    }

    return {
        cues,
        kind,
        durationSeconds: cues.reduce((last, cue) => Math.max(last, cue.endSeconds), 0),
        wordCount: cues.reduce((total, cue) => total + cue.text.split(/\s+/).filter((word) => word !== ``).length, 0),
    };
};
