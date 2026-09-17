import assert from "node:assert/strict";
import test from "node:test";
import { AIKS_ROOTS } from "./roots";
import { createAiksWorkbenchLayout } from "./layout";

test("aiks workbench presents compatibility roots with product labels", () => {
    assert.deepEqual(AIKS_ROOTS.map((root) => root.label), ["AI 对话记录", "知识"]);
    assert.equal(AIKS_ROOTS[0].readOnly, true);
    assert.equal(AIKS_ROOTS[1].readOnly, false);
});

test("aiks workbench layout contains only knowledge-product surfaces", () => {
    const layout = createAiksWorkbenchLayout();

    assert.deepEqual(layout.primaryModes, ["document", "database", "graph"]);
    assert.deepEqual(layout.rightPanels, ["outline", "backlinks", "properties"]);
    assert.equal(layout.leftPanel, "documentTree");
    assert.equal(layout.search, "siyuan");
    assert.deepEqual(layout.hiddenStandaloneSurfaces, [
        "pluginMarketplace",
        "pluginManagement",
        "themeMarketplace",
        "siyuanAi",
        "agent",
        "mcp",
        "cloudSync",
        "account",
        "subscription",
        "community",
        "selfUpdate",
        "standaloneSettings",
    ]);
});
