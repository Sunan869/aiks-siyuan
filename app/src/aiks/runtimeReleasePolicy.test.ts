import * as assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as path from "node:path";
import {test} from "node:test";

const workflowPath = path.resolve(__dirname, "../../../.github/workflows/aiks-runtime.yml");

function runtimeWorkflow(): string {
    return readFileSync(workflowPath, "utf8");
}

test("runtime release assets are immutable after a commit tag is published", () => {
    const workflow = runtimeWorkflow();

    assert.doesNotMatch(workflow, /--clobber/);
    assert.match(workflow, /gh release download/);
    assert.match(workflow, /Existing runtime release hash mismatch/);
});
