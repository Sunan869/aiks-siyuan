import test from "node:test";
import assert from "node:assert/strict";

test("aiks embedded profile disables standalone product surfaces", async () => {
    let profileModule: typeof import("./profile") | undefined;
    try {
        profileModule = await import("./profile");
    } catch {
        profileModule = undefined;
    }

    assert.ok(profileModule, "AIKS embedded profile module must exist");
    const profile = profileModule.resolveAiksEmbeddedProfile("aiks-embedded");

    assert.equal(profile.enabled, true);
    assert.equal(profile.productName, "AIKS Knowledge Workbench");
    assert.equal(profile.hidePluginMarketplace, true);
    assert.equal(profile.hidePluginManagement, true);
    assert.equal(profile.hideThemeMarketplace, true);
    assert.equal(profile.hideSiyuanAi, true);
    assert.equal(profile.hideAgent, true);
    assert.equal(profile.hideMcp, true);
    assert.equal(profile.hideAccount, true);
    assert.equal(profile.hideCloudSync, true);
    assert.equal(profile.hideSubscription, true);
    assert.equal(profile.hideCommunity, true);
    assert.equal(profile.hideSelfUpdate, true);
    assert.deepEqual(profile.readOnlyRootPaths, ["/10 AI Sessions"]);
});

test("non embedded profile keeps AIKS customizations disabled", async () => {
    let profileModule: typeof import("./profile") | undefined;
    try {
        profileModule = await import("./profile");
    } catch {
        profileModule = undefined;
    }

    assert.ok(profileModule, "AIKS embedded profile module must exist");
    const profile = profileModule.resolveAiksEmbeddedProfile(undefined);

    assert.equal(profile.enabled, false);
    assert.deepEqual(profile.readOnlyRootPaths, []);
});
