<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef, watch } from "vue";
import { formatBytes } from "./parse/format";
import { readFontNames, type FontNames } from "./parse/sfnt";

/* A font file, rendered in itself. The only way to answer "what does this one look like" without installing it,
 * which is the whole question a .ttf in a folder poses.
 *
 * The FontFace API takes the bytes directly, so nothing is written to disk and nothing is installed on the
 * machine — the face lives in this document and goes away with it. */

const props = defineProps<{ path: string; blob: Blob }>();

const fileName = props.path.slice(props.path.lastIndexOf(`/`) + 1);
// A unique family per open file: two viewers open at once must not fight over one name, and a stale face from
// a previous file must not win the fallback.
const family = `ev-font-${Math.random().toString(36).slice(2, 10)}`;

const names = shallowRef<FontNames>({});
const failed = ref(false);
const sample = ref(`The quick brown fox jumps over the lazy dog`);
let loaded: FontFace | undefined;

const SIZES = [12, 16, 24, 36, 56, 80];

const load = async (blob: Blob): Promise<void> => {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    // WOFF/WOFF2 keep their tables compressed, so the name table is unreadable without a decompressor the
    // browser doesn't expose — the file name stands in, and the specimen below renders either way.
    names.value = readFontNames(bytes);
    try {
        const face = new FontFace(family, bytes);
        await face.load();
        document.fonts.add(face);
        loaded = face;
        failed.value = false;
    } catch {
        // A corrupt or unsupported file: say so instead of rendering the specimen in the fallback font, which
        // would look like a working answer and be a lie about what is in the file.
        failed.value = true;
    }
};

const unload = (): void => {
    if (loaded !== undefined) {
        document.fonts.delete(loaded);
        loaded = undefined;
    }
};

watch(
    () => props.blob,
    (blob) => {
        unload();
        void load(blob);
    },
    { immediate: true },
);

onBeforeUnmount(unload);
</script>

<template>
    <div class="ev-page">
        <div class="ev-head">
            <span class="ev-title">{{ names.family ?? fileName }}</span>
            <span class="ev-muted ev-small">
                <template v-if="names.subfamily">{{ names.subfamily }} · </template>{{ formatBytes(props.blob.size) }}
                <template v-if="names.version"> · {{ names.version }}</template>
            </span>
        </div>

        <div v-if="failed" class="ui-card ui-card-dashed" :style="{ marginTop: `1rem` }">
            <p class="ev-muted">The browser refused to load this font — the file may be corrupt, or a format it doesn't support.</p>
        </div>

        <template v-else>
            <div class="ev-toolbar" :style="{ marginTop: `1rem` }">
                <input v-model="sample" class="ev-input" :style="{ minWidth: `24rem` }" aria-label="Sample text" />
            </div>

            <div v-for="size in SIZES" :key="size" class="ev-specimen">
                <div class="ev-stat-label">{{ size }} px</div>
                <div :style="{ fontFamily: family, fontSize: `${size}px`, lineHeight: 1.3, wordBreak: `break-word` }">{{ sample }}</div>
            </div>

            <div class="ev-specimen">
                <div class="ev-stat-label">Characters</div>
                <div :style="{ fontFamily: family, fontSize: `20px`, lineHeight: 1.6, wordBreak: `break-word` }">
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />0123456789 &amp; @ # $ % ( ) [ ] { } ? ! “ ” — –
                </div>
            </div>

            <p v-if="names.copyright" class="ev-note">{{ names.copyright }}</p>
            <p v-if="names.license" class="ev-note ev-license" :title="names.license">{{ names.license }}</p>
        </template>
    </div>
</template>
