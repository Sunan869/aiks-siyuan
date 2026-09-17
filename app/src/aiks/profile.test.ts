import assert from "node:assert/strict";
import test from "node:test";
import { resolveAiksEmbeddedProfile } from "./profile";

test("aiks embedded profile disables standalone product surfaces", () => {
  const profile = resolveAiksEmbeddedProfile("aiks-embedded");

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

test("non-aiks profile keeps embedded mode disabled", () => {
  const profile = resolveAiksEmbeddedProfile(undefined);

  assert.equal(profile.enabled, false);
  assert.deepEqual(profile.readOnlyRootPaths, []);
});
