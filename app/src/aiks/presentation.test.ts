import test from "node:test";
import * as assert from "node:assert/strict";

type FakeLabel = {
    textContent: string | null;
    ariaLabel: string | null;
    getAttribute: (name: string) => string | null;
    setAttribute: (name: string, value: string) => void;
};

const label = (text: string, ariaLabel = `${text} metadata`): FakeLabel => ({
    textContent: text,
    ariaLabel,
    getAttribute(name: string) {
        return name === "aria-label" ? this.ariaLabel : null;
    },
    setAttribute(name: string, value: string) {
        if (name === "aria-label") {
            this.ariaLabel = value;
        }
    },
});

test("aiks root presentation rewrites only canonical product root labels", async () => {
    let presentationModule: typeof import("./presentation") | undefined;
    try {
        presentationModule = await import("./presentation");
    } catch {
        presentationModule = undefined;
    }

    assert.ok(presentationModule, "AIKS root presentation module must exist");
    const knowledge = label("20 Knowledge");
    const sessions = label("10 AI Sessions");
    const normal = label("Project Notes");

    const changed = presentationModule.presentAiksRootLabels([knowledge, sessions, normal]);

    assert.equal(changed, 2);
    assert.equal(knowledge.textContent, "知识");
    assert.equal(knowledge.ariaLabel, "知识 metadata");
    assert.equal(sessions.textContent, "AI 对话记录 🔒");
    assert.equal(sessions.ariaLabel, "AI 对话记录 🔒 metadata");
    assert.equal(normal.textContent, "Project Notes");
    assert.equal(normal.ariaLabel, "Project Notes metadata");
});

test("aiks root presentation targets only first-level document tree entries", async () => {
    let presentationModule: typeof import("./presentation") | undefined;
    try {
        presentationModule = await import("./presentation");
    } catch {
        presentationModule = undefined;
    }

    assert.ok(presentationModule, "AIKS root presentation module must exist");
    assert.equal(
        presentationModule.AIKS_ROOT_TREE_SELECTOR,
        '.sy__file ul[data-url] > li[data-type="navigation-root"] + ul > li[data-type="navigation-file"] > .b3-list-item__text'
    );
});
