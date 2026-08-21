/* GPX → a route you can look at. The file a watch, a phone or a bike computer exports, rendered as its own
 * shape plus the four numbers the person who recorded it wants: how far, how long, how much climbing, how fast.
 *
 * NO MAP TILES, deliberately. A basemap means a tile server, which means this viewer would need the open
 * internet from inside a sandbox that may not have it, and would leak the coordinates of every track opened to
 * whoever serves the tiles. The track's own shape is the part that identifies a route to the person who ran it. */

export interface TrackPoint {
    readonly lat: number;
    readonly lon: number;
    readonly ele?: number;
    // Epoch ms, when the recorder wrote <time>. Absent for a hand-drawn route.
    readonly at?: number;
}

export interface Track {
    readonly name?: string;
    readonly points: readonly TrackPoint[];
    readonly distanceMeters: number;
    readonly ascentMeters: number;
    readonly descentMeters: number;
    // Wall-clock span of the recording, when it carries timestamps.
    readonly durationSeconds?: number;
    readonly bounds?: { readonly minLat: number; readonly maxLat: number; readonly minLon: number; readonly maxLon: number };
    // Waypoints (<wpt>) are pins, not part of the line: a summit, a cafe, a photo spot.
    readonly waypoints: readonly { readonly lat: number; readonly lon: number; readonly name?: string }[];
}

const attribute = (tag: string, name: string): number | undefined => {
    const match = new RegExp(`${name}\\s*=\\s*"([^"]+)"`).exec(tag);
    const value = match === null ? Number.NaN : Number(match[1]);
    return Number.isFinite(value) ? value : undefined;
};

const child = (block: string, name: string): string | undefined => {
    const match = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`).exec(block);
    return match === null ? undefined : match[1]?.trim();
};

/* Regex over XML, which is normally a mistake and here is the right call: GPX's grammar for the two elements
 * this reads is fixed by the schema (trkpt/rtept carry lat+lon attributes and optional ele/time children),
 * the alternative is a DOM parser dependency in a bundle that must stay one file, and a malformed file
 * degrades to "fewer points" rather than to a thrown error. */
const readPoints = (text: string, tag: string): TrackPoint[] => {
    const points: TrackPoint[] = [];
    const pattern = new RegExp(`<${tag}\\b([^>]*)(?:/>|>([\\s\\S]*?)</${tag}>)`, `g`);
    for (const match of text.matchAll(pattern)) {
        const [, attributes = ``, body = ``] = match;
        const lat = attribute(attributes, `lat`);
        const lon = attribute(attributes, `lon`);
        if (lat === undefined || lon === undefined) {
            continue;
        }
        const ele = Number(child(body, `ele`));
        const time = child(body, `time`);
        const at = time === undefined ? Number.NaN : Date.parse(time);
        points.push({
            lat,
            lon,
            ele: Number.isFinite(ele) ? ele : undefined,
            at: Number.isFinite(at) ? at : undefined,
        });
    }
    return points;
};

const EARTH_RADIUS_METERS = 6_371_008.8;
const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

// Great-circle distance between two fixes. Haversine rather than a flat approximation: the error of the flat
// one grows with latitude, and this is three lines.
export const haversineMeters = (from: TrackPoint, to: TrackPoint): number => {
    const deltaLat = toRadians(to.lat - from.lat);
    const deltaLon = toRadians(to.lon - from.lon);
    const a =
        Math.sin(deltaLat / 2) ** 2 + Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(deltaLon / 2) ** 2;
    return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(a)));
};

/* Climbing, with a 3-metre deadband. Consumer GPS altitude wanders by a metre or two while standing still, so
 * summing every positive delta reports hundreds of metres of ascent for a flat ride: the number people
 * actually compare between apps is a smoothed one, and the deadband is the cheapest honest version of it.
 *
 * The reference stays at the last ACCEPTED sample rather than the last one seen, so a sub-deadband step is
 * deferred, not discarded: a long shallow climb accumulates its true height instead of being filtered away one
 * metre at a time. Only noise that comes back down is dropped, which is exactly the intent. */
const ELEVATION_DEADBAND_METERS = 3;

export const elevationChange = (points: readonly TrackPoint[]): { ascent: number; descent: number } => {
    let ascent = 0;
    let descent = 0;
    let reference: number | undefined;
    for (const point of points) {
        if (point.ele === undefined) {
            continue;
        }
        if (reference === undefined) {
            reference = point.ele;
            continue;
        }
        const delta = point.ele - reference;
        if (Math.abs(delta) < ELEVATION_DEADBAND_METERS) {
            continue;
        }
        if (delta > 0) {
            ascent += delta;
        } else {
            descent -= delta;
        }
        reference = point.ele;
    }
    return { ascent, descent };
};

export const parseTrack = (text: string): Track => {
    const trackPoints = readPoints(text, `trkpt`);
    const points = trackPoints.length > 0 ? trackPoints : readPoints(text, `rtept`);
    const waypoints = [...text.matchAll(/<wpt\b([^>]*)(?:\/>|>([\s\S]*?)<\/wpt>)/g)].flatMap((match) => {
        const [, attributes = ``, body = ``] = match;
        const lat = attribute(attributes, `lat`);
        const lon = attribute(attributes, `lon`);
        return lat === undefined || lon === undefined ? [] : [{ lat, lon, name: child(body, `name`) }];
    });

    let distanceMeters = 0;
    for (let index = 1; index < points.length; index += 1) {
        distanceMeters += haversineMeters(points[index - 1] as TrackPoint, points[index] as TrackPoint);
    }
    const { ascent, descent } = elevationChange(points);
    const times = points.map((point) => point.at).filter((at): at is number => at !== undefined);
    const lats = points.map((point) => point.lat);
    const lons = points.map((point) => point.lon);

    return {
        // <name> appears in <metadata>, <trk> and each <wpt>; the first is the track's own in every exporter.
        name: child(text, `name`),
        points,
        distanceMeters,
        ascentMeters: ascent,
        descentMeters: descent,
        durationSeconds: times.length > 1 ? (Math.max(...times) - Math.min(...times)) / 1000 : undefined,
        bounds:
            points.length === 0
                ? undefined
                : { minLat: Math.min(...lats), maxLat: Math.max(...lats), minLon: Math.min(...lons), maxLon: Math.max(...lons) },
        waypoints,
    };
};

/* The track as an SVG path, projected equirectangularly and scaled to fit `size`. Longitude is squeezed by
 * cos(latitude) so the shape is not stretched sideways: without it a track at 60°N looks twice as wide as it
 * ran. Good enough for one track's own extent; it is a picture of a shape, not a map anyone navigates by. */
export const trackPath = (track: Track, size: number, padding: number): { path: string; width: number; height: number } => {
    const { bounds, points } = track;
    if (bounds === undefined || points.length < 2) {
        return { path: ``, width: size, height: size };
    }
    const meanLat = (bounds.minLat + bounds.maxLat) / 2;
    const lonScale = Math.cos(toRadians(meanLat));
    const spanX = Math.max((bounds.maxLon - bounds.minLon) * lonScale, 1e-9);
    const spanY = Math.max(bounds.maxLat - bounds.minLat, 1e-9);
    const scale = (size - padding * 2) / Math.max(spanX, spanY);
    const width = spanX * scale + padding * 2;
    const height = spanY * scale + padding * 2;
    const path = points
        .map((point, index) => {
            const x = padding + (point.lon - bounds.minLon) * lonScale * scale;
            // SVG's y grows downward and latitude grows northward, so north has to be flipped to stay up.
            const y = padding + (bounds.maxLat - point.lat) * scale;
            return `${index === 0 ? `M` : `L`}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(` `);
    return { path, width, height };
};

// The elevation profile as an SVG path over the same points: x is distance travelled (not point index, which
// would stretch the parts of the track where the recorder sampled fastest), y is height.
export const elevationPath = (track: Track, width: number, height: number): string => {
    const withElevation = track.points.filter((point) => point.ele !== undefined);
    if (withElevation.length < 2 || track.distanceMeters <= 0) {
        return ``;
    }
    const elevations = withElevation.map((point) => point.ele as number);
    const min = Math.min(...elevations);
    const span = Math.max(Math.max(...elevations) - min, 1);
    let travelled = 0;
    return withElevation
        .map((point, index) => {
            if (index > 0) {
                travelled += haversineMeters(withElevation[index - 1] as TrackPoint, point);
            }
            const x = (travelled / track.distanceMeters) * width;
            const y = height - (((point.ele as number) - min) / span) * height;
            return `${index === 0 ? `M` : `L`}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(` `);
};
