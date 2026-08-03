import type { ExtensionContext, IntenticApi } from "@intentic/extension-api";
import { installStyles } from "./styles";

/* intentic.everyday-viewers — five file formats a workspace collects that nobody would call source code, each
 * rendered as the thing it is instead of as the text it happens to be stored as.
 *
 * Every viewer here is PURE: the host owns the open-file lifecycle and the daemon credentials, hands the
 * component the file's content (text, or bytes for a font), and gets a render back. That is why this manifest
 * declares no `permissions.sandbox` at all — this extension cannot call the daemon, which is a property the
 * install dialog states and the host enforces rather than something a reader has to take on trust.
 *
 * Registration ids must match `contributes.viewers`; the host refuses anything else, and the file extensions
 * and fetch mode are read from the manifest so a viewer cannot widen its own reach. */
export const activate = (api: IntenticApi, context: ExtensionContext): void => {
    context.subscriptions.push(
        installStyles(),
        api.viewers.register({ id: `calendar`, component: async () => (await import(`./CalendarViewer.vue`)).default }),
        api.viewers.register({ id: `table`, component: async () => (await import(`./TableViewer.vue`)).default }),
        api.viewers.register({ id: `track`, component: async () => (await import(`./TrackViewer.vue`)).default }),
        api.viewers.register({ id: `subtitles`, component: async () => (await import(`./SubtitleViewer.vue`)).default }),
        api.viewers.register({ id: `font`, component: async () => (await import(`./FontViewer.vue`)).default }),
    );
};
