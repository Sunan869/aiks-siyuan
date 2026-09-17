import test from "node:test";
import * as assert from "node:assert/strict";

test("aiks main graph host action reuses an existing global graph", async () => {
    let hostModule: typeof import("./hostApi") | undefined;
    try {
        hostModule = await import("./hostApi");
    } catch {
        hostModule = undefined;
    }

    assert.ok(hostModule, "AIKS workbench host API module must exist");
    let created = 0;
    const result = hostModule.openAiksMainGraphWithRuntime({
        activateExistingGlobalGraph: () => true,
        createGlobalGraph: () => {
            created++;
            return true;
        },
    });

    assert.equal(result, "reused");
    assert.equal(created, 0);
});

test("aiks main graph host action creates a center graph when none exists", async () => {
    let hostModule: typeof import("./hostApi") | undefined;
    try {
        hostModule = await import("./hostApi");
    } catch {
        hostModule = undefined;
    }

    assert.ok(hostModule, "AIKS workbench host API module must exist");
    let created = 0;
    const result = hostModule.openAiksMainGraphWithRuntime({
        activateExistingGlobalGraph: () => false,
        createGlobalGraph: () => {
            created++;
            return true;
        },
    });

    assert.equal(result, "created");
    assert.equal(created, 1);
});

test("aiks main graph host action reports unavailable before layout is ready", async () => {
    let hostModule: typeof import("./hostApi") | undefined;
    try {
        hostModule = await import("./hostApi");
    } catch {
        hostModule = undefined;
    }

    assert.ok(hostModule, "AIKS workbench host API module must exist");
    const result = hostModule.openAiksMainGraphWithRuntime({
        activateExistingGlobalGraph: () => false,
        createGlobalGraph: () => false,
    });

    assert.equal(result, "unavailable");
});
