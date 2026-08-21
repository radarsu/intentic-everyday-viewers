<script setup lang="ts">
import { computed } from "vue";
import { dayKey, formatEventClock, formatEventDate } from "./parse/format";
import { parseCalendar, type CalendarEvent } from "./parse/ics";

/* An .ics as an agenda. The file you get when someone exports a calendar, or when a booking mails you one: a
 * flat list of BEGIN:VEVENT blocks that says nothing to a person reading it in a text editor. */

const props = defineProps<{ path: string; text: string }>();

const calendar = computed(() => parseCalendar(props.text));

// Grouped by calendar day, in file order after the parser's chronological sort. A Map keeps insertion order,
// so the groups come out sorted without a second comparison.
const days = computed(() => {
    const groups = new Map<string, CalendarEvent[]>();
    for (const event of calendar.value.events) {
        const key = dayKey(event.start);
        const bucket = groups.get(key);
        if (bucket === undefined) {
            groups.set(key, [event]);
            continue;
        }
        bucket.push(event);
    }
    return [...groups.entries()].map(([key, events]) => ({ key, label: formatEventDate(events[0]!.start), events }));
});

const fileName = computed(() => props.path.slice(props.path.lastIndexOf(`/`) + 1));

const timeRange = (event: CalendarEvent): string => {
    const start = formatEventClock(event.start);
    if (event.allDay || event.end === undefined) {
        return start;
    }
    const end = formatEventClock(event.end);
    return end === start ? start : `${start} – ${end}`;
};

// Only when the file says so, and only once per event: a zone that is not this browser's is a fact the reader
// needs, and one they must not be shown as if it were local time.
const zoneNote = (event: CalendarEvent): string | undefined =>
    event.start.zone === undefined || event.allDay ? undefined : event.start.zone;
</script>

<template>
    <div class="ev-page">
        <div class="ev-head">
            <span class="ev-title">{{ calendar.name ?? fileName }}</span>
            <span class="ev-muted ev-small">
                {{ calendar.events.length }} event{{ calendar.events.length === 1 ? `` : `s` }}
                <template v-if="days.length > 1"> · {{ days.length }} days</template>
            </span>
        </div>

        <div v-if="calendar.events.length === 0" class="ui-card ui-card-dashed" :style="{ marginTop: `1rem` }">
            <p class="ev-muted">
                No events in this file.
                <template v-if="calendar.otherComponents.length > 0">
                    It holds {{ calendar.otherComponents.join(`, `) }} entries, which this viewer doesn't render.
                </template>
            </p>
        </div>

        <template v-for="day in days" :key="day.key">
            <div class="ev-day">{{ day.label }}</div>
            <div v-for="(event, index) in day.events" :key="`${day.key}-${index}`" class="ev-event">
                <div class="ev-muted ev-small">{{ timeRange(event) }}</div>
                <div>
                    <div :style="{ textDecoration: event.status === `CANCELLED` ? `line-through` : undefined }">{{ event.summary }}</div>
                    <div v-if="event.location" class="ev-muted ev-small">{{ event.location }}</div>
                    <div v-if="zoneNote(event)" class="ev-muted ev-small">Times as written in the file ({{ zoneNote(event) }})</div>
                    <div v-if="event.repeats" class="ev-muted ev-small">{{ event.repeats }}</div>
                    <div v-if="event.description" class="ev-muted ev-small" :style="{ whiteSpace: `pre-wrap`, marginTop: `0.25rem` }">
                        {{ event.description }}
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>
