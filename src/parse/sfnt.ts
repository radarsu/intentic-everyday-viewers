/* The `name` table out of a font file — what the font calls itself, as opposed to what someone called the file.
 *
 * Only the uncompressed container (.ttf/.otf, and the .ttc collection header) is read. WOFF and WOFF2 compress
 * their tables (zlib and Brotli), and no browser exposes a Brotli decompressor to script, so those fall back to
 * the file name. That is the honest boundary: a specimen sheet that renders is the point, and the family name
 * is a nicety on top of it. */

export interface FontNames {
    readonly family?: string;
    readonly subfamily?: string;
    readonly version?: string;
    readonly copyright?: string;
    readonly license?: string;
}

// nameID → the field it lands in (OpenType spec, "Name IDs").
const NAME_IDS: Readonly<Record<number, keyof FontNames>> = {
    0: `copyright`,
    1: `family`,
    2: `subfamily`,
    5: `version`,
    13: `license`,
};

const SFNT_TAGS = new Set([0x00010000, 0x4f54544f, 0x74727565]);

export const readFontNames = (bytes: Uint8Array): FontNames => {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (view.byteLength < 12) {
        return {};
    }
    // A .ttc collection points at its first font's header; a bare sfnt is its own.
    const start = view.getUint32(0) === 0x74746366 ? view.getUint32(12) : 0;
    if (start + 12 > view.byteLength || !SFNT_TAGS.has(view.getUint32(start))) {
        return {};
    }

    const tableCount = view.getUint16(start + 4);
    let nameOffset: number | undefined;
    for (let index = 0; index < tableCount; index += 1) {
        const record = start + 12 + index * 16;
        if (record + 16 > view.byteLength) {
            return {};
        }
        // "name" as a big-endian tag.
        if (view.getUint32(record) === 0x6e616d65) {
            nameOffset = view.getUint32(record + 8);
            break;
        }
    }
    if (nameOffset === undefined || nameOffset + 6 > view.byteLength) {
        return {};
    }

    const count = view.getUint16(nameOffset + 2);
    const stringsAt = nameOffset + view.getUint16(nameOffset + 4);
    const names: Record<string, string> = {};
    for (let index = 0; index < count; index += 1) {
        const record = nameOffset + 6 + index * 12;
        if (record + 12 > view.byteLength) {
            break;
        }
        const platformId = view.getUint16(record);
        const nameId = view.getUint16(record + 6);
        const length = view.getUint16(record + 8);
        const offset = stringsAt + view.getUint16(record + 10);
        const field = NAME_IDS[nameId];
        if (field === undefined || offset + length > view.byteLength) {
            continue;
        }
        // Platform 1 (Macintosh) strings are single-byte; platform 0 and 3 are UTF-16BE. A record already
        // filled by an earlier entry is kept: the first platform listed is the one the foundry meant first.
        const value =
            platformId === 1
                ? String.fromCharCode(...bytes.subarray(offset, offset + length))
                : decodeUtf16BE(bytes.subarray(offset, offset + length));
        if (value.trim() !== `` && names[field] === undefined) {
            names[field] = value.trim();
        }
    }
    return names;
};

const decodeUtf16BE = (bytes: Uint8Array): string => {
    let out = ``;
    for (let index = 0; index + 1 < bytes.length; index += 2) {
        out += String.fromCharCode(((bytes[index] as number) << 8) | (bytes[index + 1] as number));
    }
    return out;
};
