<script setup lang="ts">
import { computed } from "vue";
import { formatCount, formatDistance, formatDuration } from "./parse/format";
import { elevationPath, parseTrack, trackPath } from "./parse/gpx";

/* A .gpx as the route it recorded. Every watch, phone and bike computer exports this format, and every one of
 * them means "open it in the app that made it": this is the version for a file sitting in a folder. */

const props = defineProps<{ path: string; text: string }>();

const SIZE = 420;
const PADDING = 12;
const PROFILE = { width: 420, height: 70 };

const track = computed(() => parseTrack(props.text));
const shape = computed(() => trackPath(track.value, SIZE, PADDING));
const profile = computed(() => elevationPath(track.value, PROFILE.width, PROFILE.height));

const fileName = computed(() => props.path.slice(props.path.lastIndexOf(`/`) + 1));

// Only shown when the recording carries timestamps: average pace over a route someone drew by hand would be
// a number about nothing.
const pace = computed(() => {
    const { distanceMeters, durationSeconds } = track.value;
    if (durationSeconds === undefined || durationSeconds <= 0 || distanceMeters <= 0) {
        return undefined;
    }
    const secondsPerKm = durationSeconds / (distanceMeters / 1000);
    const minutes = Math.floor(secondsPerKm / 60);
    const seconds = Math.round(secondsPerKm % 60);
    return {
        perKm: `${minutes}:${String(seconds).padStart(2, `0`)} /km`,
        kmh: `${((distanceMeters / 1000) / (durationSeconds / 3600)).toFixed(1)} km/h`,
    };
});

const elevations = computed(() => track.value.points.map((point) => point.ele).filter((ele): ele is number => ele !== undefined));
</script>

<template>
    <div class="ev-page">
        <div class="ev-head">
            <span class="ev-title">{{ track.name ?? fileName }}</span>
            <span class="ev-muted ev-small">{{ formatCount(track.points.length) }} points</span>
        </div>

        <div v-if="track.points.length < 2" class="ui-card ui-card-dashed" :style="{ marginTop: `1rem` }">
            <p class="ev-muted">No track points in this file: it may hold only waypoints, or be a route this viewer can't read.</p>
        </div>

        <template v-else>
            <div class="ev-stats">
                <div>
                    <div class="ev-stat-value">{{ formatDistance(track.distanceMeters) }}</div>
                    <div class="ev-stat-label">Distance</div>
                </div>
                <div v-if="track.durationSeconds !== undefined">
                    <div class="ev-stat-value">{{ formatDuration(track.durationSeconds) }}</div>
                    <div class="ev-stat-label">Elapsed</div>
                </div>
                <div v-if="pace">
                    <div class="ev-stat-value">{{ pace.perKm }}</div>
                    <div class="ev-stat-label">{{ pace.kmh }}</div>
                </div>
                <div v-if="elevations.length > 0">
                    <div class="ev-stat-value">{{ Math.round(track.ascentMeters) }} m</div>
                    <div class="ev-stat-label">Ascent · {{ Math.round(track.descentMeters) }} m down</div>
                </div>
                <div v-if="elevations.length > 0">
                    <div class="ev-stat-value">{{ Math.round(Math.max(...elevations)) }} m</div>
                    <div class="ev-stat-label">Highest</div>
                </div>
            </div>

            <div class="ev-track">
                <svg
                    :viewBox="`0 0 ${shape.width} ${shape.height}`"
                    :width="shape.width"
                    :height="shape.height"
                    role="img"
                    :aria-label="`The recorded route, ${formatDistance(track.distanceMeters)} long`"
                >
                    <path :d="shape.path" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
                </svg>

                <div v-if="profile !== ``">
                    <svg :viewBox="`0 0 ${PROFILE.width} ${PROFILE.height}`" :width="PROFILE.width" :height="PROFILE.height" role="img" aria-label="Elevation profile">
                        <path :d="`${profile} L ${PROFILE.width} ${PROFILE.height} L 0 ${PROFILE.height} Z`" fill="currentColor" opacity="0.12" />
                        <path :d="profile" fill="none" stroke="currentColor" stroke-width="1.5" />
                    </svg>
                    <div class="ev-stat-label">Elevation over distance</div>
                </div>
            </div>

            <p v-if="track.waypoints.length > 0" class="ev-note">
                {{ track.waypoints.length }} waypoint{{ track.waypoints.length === 1 ? `` : `s` }}:
                {{ track.waypoints.map((point) => point.name).filter(Boolean).join(`, `) || `unnamed` }}
            </p>
            <p class="ev-note">No basemap by design: the shape is drawn from the file alone, so nothing here reaches a tile server.</p>
        </template>
    </div>
</template>
