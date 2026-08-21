<script setup lang="ts">
import { computed, ref } from "vue";
import { asNumber, columnStats, parseTable } from "./parse/csv";
import { formatCount } from "./parse/format";

/* A .csv or .tsv as a table you can sort and filter: the three things a person opens a spreadsheet to do, on a
 * file the editor otherwise shows as one long line of commas. Render-only, like every viewer: no editing, no
 * writing back. */

const props = defineProps<{ path: string; text: string }>();

// Rendering every row of a 200k-row export would lock the tab; the filter is what reaches the rest, and the
// count below always tells the truth about how much is behind it.
const RENDER_LIMIT = 1000;

const table = computed(() => parseTable(props.text));
const filter = ref(``);
const sortColumn = ref<number | undefined>(undefined);
const sortDescending = ref(false);

const filtered = computed(() => {
    const needle = filter.value.trim().toLowerCase();
    if (needle === ``) {
        return table.value.rows;
    }
    return table.value.rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(needle)));
});

const sorted = computed(() => {
    const column = sortColumn.value;
    if (column === undefined) {
        return filtered.value;
    }
    const numeric = table.value.numeric[column] === true;
    const direction = sortDescending.value ? -1 : 1;
    // Sorting a copy: `filtered` is derived from the parsed table, and sorting it in place would reorder the
    // source of every other computed that reads it.
    return [...filtered.value].sort((left, right) => {
        const a = left[column] ?? ``;
        const b = right[column] ?? ``;
        if (numeric) {
            return ((asNumber(a) ?? 0) - (asNumber(b) ?? 0)) * direction;
        }
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: `base` }) * direction;
    });
});

const shown = computed(() => sorted.value.slice(0, RENDER_LIMIT));

// Click cycles ascending → descending → unsorted, so a reader can always get back to file order, which for a
// ledger or an export IS meaningful information.
const toggleSort = (column: number): void => {
    if (sortColumn.value !== column) {
        sortColumn.value = column;
        sortDescending.value = false;
        return;
    }
    if (!sortDescending.value) {
        sortDescending.value = true;
        return;
    }
    sortColumn.value = undefined;
    sortDescending.value = false;
};

const sortMark = (column: number): string => (sortColumn.value === column ? (sortDescending.value ? ` ↓` : ` ↑`) : ``);

// The numbers a person would otherwise paste into a calculator: only for columns that are entirely numeric,
// and computed over what the filter currently shows, because that is what they are looking at.
const stats = computed(() =>
    table.value.columns
        .map((name, column) => ({ name, column, stats: table.value.numeric[column] === true ? columnStats(filtered.value, column) : undefined }))
        .filter((entry): entry is { name: string; column: number; stats: NonNullable<ReturnType<typeof columnStats>> } => entry.stats !== undefined),
);

const delimiterName = computed(() => ({ ",": `comma`, "\t": `tab`, ";": `semicolon`, "|": `pipe` })[table.value.delimiter] ?? `comma`);

const round = (value: number): string => (Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 2 }));
</script>

<template>
    <div class="ev-page">
        <div class="ev-toolbar">
            <input v-model="filter" class="ev-input" type="search" placeholder="Filter rows…" aria-label="Filter rows" />
            <span class="ev-muted ev-small">
                {{ formatCount(filtered.length) }} of {{ formatCount(table.rows.length) }} rows · {{ table.columns.length }} columns ·
                {{ delimiterName }}-separated
            </span>
        </div>

        <div v-if="table.rows.length === 0" class="ui-card ui-card-dashed">
            <p class="ev-muted">This file has a header row and nothing under it.</p>
        </div>

        <div v-else class="ev-scroll">
            <table class="ev-table">
                <thead>
                    <tr>
                        <th
                            v-for="(column, index) in table.columns"
                            :key="index"
                            :class="{ 'ev-num': table.numeric[index] }"
                            :title="`Sort by ${column}`"
                            @click="toggleSort(index)"
                        >
                            {{ column }}{{ sortMark(index) }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, rowIndex) in shown" :key="rowIndex">
                        <td v-for="(cell, cellIndex) in row" :key="cellIndex" :class="{ 'ev-num': table.numeric[cellIndex] }">{{ cell }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <p v-if="sorted.length > shown.length" class="ev-note">
            Showing the first {{ formatCount(shown.length) }} rows of {{ formatCount(sorted.length) }}: narrow it with the filter.
        </p>

        <div v-if="stats.length > 0" class="ev-stats">
            <div v-for="entry in stats" :key="entry.column">
                <div class="ev-stat-value">{{ round(entry.stats.sum) }}</div>
                <div class="ev-stat-label">{{ entry.name }} · sum</div>
                <div class="ev-muted ev-small">
                    min {{ round(entry.stats.min) }} · max {{ round(entry.stats.max) }} · mean {{ round(entry.stats.mean) }}
                </div>
            </div>
        </div>
    </div>
</template>
