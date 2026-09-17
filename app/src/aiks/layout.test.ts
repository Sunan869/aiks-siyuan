import test from "node:test";
import * as assert from "node:assert/strict";

test("aiks workbench presents product roots without internal numeric names", async () => {
    let rootsModule: typeof import("./roots") | undefined;
    try {
        rootsModule = await import("./roots");
    } catch {
        rootsModule = undefined;
    }

    assert.ok(rootsModule, "AIKS root presentation module must exist");
    assert.deepEqual(rootsModule.AIKS_ROOTS, [
        {path: "/10 AI Sessions", label: "AI 对话记录", readOnly: true},
        {path: "/20 Knowledge", label: "知识", readOnly: false},
    ]);
});

test("aiks workbench model keeps only the compact native surfaces", async () => {
    let layoutModule: typeof import("./layout") | undefined;
    try {
        layoutModule = await import("./layout");
    } catch {
        layoutModule = undefined;
    }

    assert.ok(layoutModule, "AIKS workbench layout module must exist");
    assert.deepEqual(layoutModule.AIKS_WORKBENCH_LAYOUT.panes, ["documentTree", "main", "auxiliary"]);
    assert.deepEqual(layoutModule.AIKS_WORKBENCH_LAYOUT.auxiliaryTabs, ["outline", "backlinks", "properties"]);
    assert.deepEqual(layoutModule.AIKS_WORKBENCH_LAYOUT.mainModes, ["document", "database", "graph"]);

    const forbidden = [
        "pluginMarketplace",
        "pluginManagement",
        "themeMarketplace",
        "ai",
        "agent",
        "mcp",
        "cloudSync",
        "account",
        "subscription",
        "community",
        "selfUpdate",
    ];
    for (const action of forbidden) {
        assert.equal(layoutModule.AIKS_WORKBENCH_LAYOUT.toolbarActions.includes(action as never), false);
    }
    assert.deepEqual(layoutModule.AIKS_WORKBENCH_LAYOUT.toolbarActions, [
        "back",
        "forward",
        "search",
        "document",
        "database",
        "graph",
        "toggleAuxiliary",
        "more",
    ]);
});

test("aiks search remains a workbench action instead of a standalone product mode", async () => {
    let searchModule: typeof import("./search") | undefined;
    try {
        searchModule = await import("./search");
    } catch {
        searchModule = undefined;
    }

    assert.ok(searchModule, "AIKS workbench search module must exist");
    assert.equal(searchModule.AIKS_SEARCH.shortcut, "Mod+K");
    assert.deepEqual(searchModule.AIKS_SEARCH.defaultScopes, ["knowledge", "aiConversations"]);
    assert.equal(searchModule.AIKS_SEARCH.opensAsMainMode, false);
});
