import type { ExtensionContext, IntenticApi } from "@intentic/extension-api";
import { installStyles } from "./styles";

/* intentic.everyday-viewers: five file formats a workspace collects that nobody would call source code. */
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
