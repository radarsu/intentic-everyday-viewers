import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

/* The built bundle against a host stub that enforces the manifest, exactly as the real host does: a viewer
 * whose id `contributes.viewers` never declared is refused. Code and manifest drifting apart is the failure
 * that actually happens, and in the app it shows up as a file type that silently opens as text instead.
 *
 * A DOM stub stands in for the browser because activate() installs the extension's stylesheet — see
 * src/styles.ts for why that is a sheet rather than SFC <style> blocks. */

const manifest = JSON.parse(await readFile(new URL(`../intentic-extension.json`, import.meta.url), `utf8`));

const head = [];
globalThis.document = {
    head: { append: (element) => head.push(element) },
    createElement: () => ({ dataset: {}, textContent: ``, remove() {
        const index = head.indexOf(this);
        if (index >= 0) {
            head.splice(index, 1);
        }
    } }),
};

const { activate } = await import(`../dist/extension.js`);

const declaredViewers = new Map((manifest.contributes?.viewers ?? []).map((viewer) => [viewer.id, viewer]));
const disposable = () => ({ dispose: () => {} });

const hostStub = () => {
    const registered = [];
    const refuse = (kind) => () => assert.fail(`${kind} registered, which this manifest never declares`);
    return {
        registered,
        api: {
            apiVersion: `0.4.0`,
            viewers: {
                register: (viewer) => {
                    assert.ok(declaredViewers.has(viewer.id), `viewer "${viewer.id}" is not declared in contributes.viewers`);
                    registered.push(viewer);
                    return disposable();
                },
            },
            views: { register: refuse(`a view`) },
            documents: { register: refuse(`a document provider`) },
            commands: { register: refuse(`a command`) },
            // Reaching the daemon at all would be a bug: this manifest declares no permissions.sandbox, so the
            // real host refuses every route. The stub makes that explicit rather than implicit.
            sandbox: {
                json: () => assert.fail(`a viewer called the daemon; this extension declares no sandbox permissions`),
                request: () => assert.fail(`a viewer called the daemon; this extension declares no sandbox permissions`),
            },
        },
    };
};

test(`activate registers exactly the viewers the manifest declares`, async () => {
    const { api, registered } = hostStub();
    const context = { extensionId: `intentic.everyday-viewers`, subscriptions: [] };

    await activate(api, context);

    assert.deepEqual(
        registered.map((viewer) => viewer.id),
        [...declaredViewers.keys()],
    );
    // Every lazily imported component resolves from inside the single file — a chunk split here would 404 in
    // the browser's blob-URL import, where the failure is far less obvious than in this test.
    for (const viewer of registered) {
        assert.equal(typeof (await viewer.component()), `object`);
    }

    for (const subscription of context.subscriptions) {
        subscription.dispose();
    }
});

test(`the stylesheet is installed on activate and removed when the extension is switched off`, async () => {
    const { api } = hostStub();
    const context = { extensionId: `intentic.everyday-viewers`, subscriptions: [] };

    await activate(api, context);
    assert.equal(head.length, 1);
    assert.equal(head[0].dataset.owner, `intentic.everyday-viewers`);
    assert.match(head[0].textContent, /\.ev-page/);

    for (const subscription of context.subscriptions) {
        subscription.dispose();
    }
    assert.equal(head.length, 0);
});

test(`the manifest claims only file types the app has no viewer for`, () => {
    // The first-party `intentic.viewers` pack owns these; last registration wins, so claiming one would
    // silently take over a core format depending on load order. Any overlap here is a mistake, not a feature.
    const firstParty = new Set([
        `png`, `jpg`, `jpeg`, `gif`, `webp`, `avif`, `bmp`, `ico`, `svg`, `pdf`, `docx`, `xlsx`,
        `mp3`, `wav`, `flac`, `ogg`, `oga`, `opus`, `weba`, `m4a`, `aac`,
        `mp4`, `m4v`, `webm`, `ogv`, `mov`, `3gp`, `mkv`, `avi`, `wmv`,
    ]);
    for (const viewer of declaredViewers.values()) {
        for (const extension of viewer.extensions) {
            assert.ok(!firstParty.has(extension), `.${extension} is already claimed by intentic.viewers`);
        }
    }
});
