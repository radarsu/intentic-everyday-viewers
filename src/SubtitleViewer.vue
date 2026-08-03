<script setup lang="ts">
import { computed, ref } from "vue";
import { formatClock, formatCount, formatDuration } from "./parse/format";
import { parseSubtitles } from "./parse/subtitles";

/* An .srt or .vtt as a searchable transcript. The reason to open one of these is almost always "find the bit
 * where they said X", which is a search box over cue text and a timecode to jump to in whatever is playing it. */

const props = defineProps<{ path: string; text: string }>();

const subtitles = computed(() => parseSubtitles(props.text));
const query = ref(``);

const matches = computed(() => {
    const needle = query.value.trim().toLowerCase();
    if (needle === ``) {
        return subtitles.value.cues;
    }
    return subtitles.value.cues.filter((cue) => cue.text.toLowerCase().includes(needle));
});

// The match highlighted inside the cue, as plain segments — v-html would be an injection hole for a file
// somebody was sent, and this is a text viewer, so there is nothing to gain by rendering markup.
const segments = (text: string): { value: string; hit: boolean }[] => {
    const needle = query.value.trim();
    if (needle === ``) {
        return [{ value: text, hit: false }];
    }
    const parts: { value: string; hit: boolean }[] = [];
    const lower = text.toLowerCase();
    const target = needle.toLowerCase();
    let at = 0;
    for (;;) {
        const found = lower.indexOf(target, at);
        if (found < 0) {
            parts.push({ value: text.slice(at), hit: false });
            return parts;
        }
        if (found > at) {
            parts.push({ value: text.slice(at, found), hit: false });
        }
        parts.push({ value: text.slice(found, found + needle.length), hit: true });
        at = found + needle.length;
    }
};
</script>

<template>
    <div class="ev-page">
        <div class="ev-toolbar">
            <input v-model="query" class="ev-input" type="search" placeholder="Search the transcript…" aria-label="Search cues" />
            <span class="ev-muted ev-small">
                {{ formatCount(matches.length) }} of {{ formatCount(subtitles.cues.length) }} cues ·
                {{ formatDuration(subtitles.durationSeconds) }} · {{ formatCount(subtitles.wordCount) }} words · {{ subtitles.kind.toUpperCase() }}
            </span>
        </div>

        <div v-if="subtitles.cues.length === 0" class="ui-card ui-card-dashed">
            <p class="ev-muted">No cues in this file.</p>
        </div>

        <div v-for="cue in matches" :key="cue.index" class="ev-cue">
            <div class="ev-muted ev-small">{{ formatClock(cue.startSeconds) }} → {{ formatClock(cue.endSeconds) }}</div>
            <div :style="{ whiteSpace: `pre-wrap` }">
                <span v-for="(segment, index) in segments(cue.text)" :key="index" :class="{ 'ev-mark': segment.hit }">{{ segment.value }}</span>
            </div>
        </div>
    </div>
</template>
