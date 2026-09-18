import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
import {fileURLToPath} from "node:url";

const workflowPath = fileURLToPath(new URL("../../../.github/workflows/aiks-runtime.yml", import.meta.url));

function runtimeWorkflow(): string {
    return readFileSync(workflowPath, "utf8");
}

test("runtime release assets are immutable after a commit tag is published", () => {
    const workflow = runtimeWorkflow();

    assert.doesNotMatch(workflow, /--clobber/);
    assert.match(workflow, /gh release download/);
    assert.match(workflow, /Existing runtime release hash mismatch/);
});
