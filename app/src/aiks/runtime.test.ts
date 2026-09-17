import test from "node:test";
import * as assert from "node:assert/strict";

test("aiks runtime presents canonical roots with product labels", async () => {
    let runtimeModule: typeof import("./runtime") | undefined;
    try {
        runtimeModule = await import("./runtime");
    } catch {
        runtimeModule = undefined;
    }

    assert.ok(runtimeModule, "AIKS workbench runtime module must exist");
    assert.equal(runtimeModule.getAiksRootDisplayName("/20 Knowledge"), "知识");
    assert.equal(runtimeModule.getAiksRootDisplayName("20 Knowledge"), "知识");
    assert.equal(runtimeModule.getAiksRootDisplayName("/10 AI Sessions"), "AI 对话记录 🔒");
    assert.equal(runtimeModule.getAiksRootDisplayName("10 AI Sessions"), "AI 对话记录 🔒");
    assert.equal(runtimeModule.getAiksRootDisplayName("Project Notes"), undefined);
});

test("aiks runtime trims dock registration to document tree and auxiliary panels", async () => {
    let runtimeModule: typeof import("./runtime") | undefined;
    try {
        runtimeModule = await import("./runtime");
    } catch {
        runtimeModule = undefined;
    }

    assert.ok(runtimeModule, "AIKS workbench runtime module must exist");
    const layout = {
        hideDock: false,
        layout: {instance: "Layout"},
        left: {
            pin: true,
            data: [
                [
                    {type: "file", title: "Files"},
                    {type: "bookmark", title: "Bookmarks"},
                    {type: "agentChat", title: "Agent"},
                ],
                [{type: "tag", title: "Tags"}],
            ],
        },
        right: {
            pin: true,
            data: [
                [
                    {type: "outline", title: "Outline"},
                    {type: "backlink", title: "Backlinks"},
                    {type: "graph", title: "Graph"},
                ],
                [{type: "inbox", title: "Inbox"}],
            ],
        },
        bottom: {
            pin: true,
            data: [[{type: "globalGraph", title: "Global Graph"}], [{type: "plugin-x", title: "Plugin"}]],
        },
    };

    const result = runtimeModule.applyAiksWorkbenchLayoutPolicy(layout);

    assert.equal(result, layout, "runtime policy should preserve the existing layout object identity");
    assert.deepEqual(layout.left.data, [[{type: "file", title: "Files"}], []]);
    assert.deepEqual(layout.right.data, [[
        {type: "outline", title: "Outline"},
        {type: "backlink", title: "Backlinks"},
    ], []]);
    assert.deepEqual(layout.bottom.data, [[], []]);
    assert.equal(layout.hideDock, false);
    assert.deepEqual(layout.layout, {instance: "Layout"});
});

test("aiks runtime exposes only compact toolbar entry ids", async () => {
    let runtimeModule: typeof import("./runtime") | undefined;
    try {
        runtimeModule = await import("./runtime");
    } catch {
        runtimeModule = undefined;
    }

    assert.ok(runtimeModule, "AIKS workbench runtime module must exist");
    assert.deepEqual(runtimeModule.AIKS_TOPBAR_ENTRY_IDS, [
        "barBack",
        "barForward",
        "barSearch",
        "barDocument",
        "barDatabase",
        "barGraph",
        "barAuxiliary",
        "barMore",
    ]);

    const forbidden = [
        "barWorkspace",
        "barSync",
        "toolbarVIP",
        "toolbarTitle",
        "barPlugins",
        "barCommand",
        "barMode",
        "barExit",
    ];
    for (const entry of forbidden) {
        assert.equal(runtimeModule.AIKS_TOPBAR_ENTRY_IDS.includes(entry as never), false);
    }
});
