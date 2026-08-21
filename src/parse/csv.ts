/* Delimited text → a table. RFC 4180 quoting (doubled quotes inside quoted fields, delimiters and newlines
 * allowed inside them), because the files people actually export: bank statements, form responses, anything
 * with an address in it: are full of quoted commas, and a split(",") viewer misreads exactly the rows the
 * reader cares about. */

export interface Table {
    readonly columns: readonly string[];
    readonly rows: readonly (readonly string[])[];
    // Which delimiter won the sniff, so the view can say so when a file looks wrong.
    readonly delimiter: string;
    // Per column, whether every non-empty cell parses as a number: drives right-alignment and numeric sort.
    readonly numeric: readonly boolean[];
}

const DELIMITERS = [`,`, `\t`, `;`, `|`] as const;

/* Which delimiter this file uses, decided on the first line OUTSIDE quotes. Sniffing beats trusting the
 * extension: European exports are `;`-delimited and still called .csv, and a .tsv with one stray comma is
 * still tab-delimited. Ties go to the earlier entry in DELIMITERS (comma first), and a single-column file
 * legitimately has no delimiter at all: it reads as one column, which is what it is. */
export const sniffDelimiter = (text: string): string => {
    const line = firstLogicalLine(text);
    let best = `,`;
    let bestCount = 0;
    for (const candidate of DELIMITERS) {
        const count = countOutsideQuotes(line, candidate);
        if (count > bestCount) {
            best = candidate;
            bestCount = count;
        }
    }
    return best;
};

// The first line that is not inside a quoted field: the header row, even when a cell above it wrapped.
const firstLogicalLine = (text: string): string => {
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        if (char === `"`) {
            quoted = !quoted;
        } else if (char === `\n` && !quoted) {
            return text.slice(0, index);
        }
    }
    return text;
};

const countOutsideQuotes = (line: string, delimiter: string): number => {
    let quoted = false;
    let count = 0;
    for (const char of line) {
        if (char === `"`) {
            quoted = !quoted;
        } else if (char === delimiter && !quoted) {
            count += 1;
        }
    }
    return count;
};

// The character-by-character reader. One pass, no regex: quoting is a state machine and a regex that handles
// embedded newlines correctly is longer than this and harder to be sure of.
export const parseRows = (text: string, delimiter: string): string[][] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = ``;
    let quoted = false;
    let index = 0;
    const source = text.replace(/\r\n?/g, `\n`);

    while (index < source.length) {
        const char = source[index];
        if (quoted) {
            if (char === `"`) {
                // A doubled quote inside a quoted field is one literal quote.
                if (source[index + 1] === `"`) {
                    field += `"`;
                    index += 2;
                    continue;
                }
                quoted = false;
                index += 1;
                continue;
            }
            field += char;
            index += 1;
            continue;
        }
        if (char === `"` && field === ``) {
            quoted = true;
            index += 1;
            continue;
        }
        if (char === delimiter) {
            row.push(field);
            field = ``;
            index += 1;
            continue;
        }
        if (char === `\n`) {
            row.push(field);
            rows.push(row);
            row = [];
            field = ``;
            index += 1;
            continue;
        }
        field += char;
        index += 1;
    }
    if (field !== `` || row.length > 0) {
        row.push(field);
        rows.push(row);
    }
    // A trailing newline yields a final empty row; a file of blank lines yields several. Neither is data.
    return rows.filter((entry) => entry.length > 1 || (entry[0] ?? ``).trim() !== ``);
};

/* Is this column a number column? Thousands separators and a leading currency symbol are stripped first,
 * because "1,234.50" and "$12" are what a spreadsheet exports and a column of them is still a number column:
 * the alternative is right-aligning nothing in a financial file, which is every file this viewer will meet. */
export const asNumber = (cell: string): number | undefined => {
    const trimmed = cell.trim();
    if (trimmed === ``) {
        return undefined;
    }
    const cleaned = trimmed.replace(/^[-+]?[$€£¥]\s?/, (match) => match.replace(/[$€£¥\s]/g, ``)).replace(/,(?=\d{3}\b)/g, ``);
    const value = Number(cleaned.replace(/%$/, ``));
    return Number.isFinite(value) ? value : undefined;
};

export const parseTable = (text: string): Table => {
    const delimiter = sniffDelimiter(text);
    const rows = parseRows(text, delimiter);
    const [header, ...body] = rows;
    const columns = (header ?? []).map((name, index) => (name.trim() === `` ? `Column ${index + 1}` : name.trim()));
    const width = Math.max(columns.length, ...body.map((row) => row.length), 0);
    const padded = body.map((row) => (row.length === width ? row : [...row, ...Array<string>(width - row.length).fill(``)]));
    const numeric = Array.from({ length: width }, (_, column) => {
        const cells = padded.map((row) => row[column] ?? ``).filter((cell) => cell.trim() !== ``);
        return cells.length > 0 && cells.every((cell) => asNumber(cell) !== undefined);
    });
    return {
        columns: columns.length === width ? columns : [...columns, ...Array.from({ length: width - columns.length }, (_, index) => `Column ${columns.length + index + 1}`)],
        rows: padded,
        delimiter,
        numeric,
    };
};

export interface ColumnStats {
    readonly min: number;
    readonly max: number;
    readonly sum: number;
    readonly mean: number;
    readonly filled: number;
}

// The four numbers a person opens a spreadsheet to get. Empty cells are skipped rather than counted as zero:
// a blank in an amounts column means "not recorded", and averaging it as 0 is a wrong answer, not a rounded one.
export const columnStats = (rows: readonly (readonly string[])[], column: number): ColumnStats | undefined => {
    const values = rows.map((row) => asNumber(row[column] ?? ``)).filter((value): value is number => value !== undefined);
    if (values.length === 0) {
        return undefined;
    }
    const sum = values.reduce((total, value) => total + value, 0);
    return { min: Math.min(...values), max: Math.max(...values), sum, mean: sum / values.length, filled: values.length };
};
