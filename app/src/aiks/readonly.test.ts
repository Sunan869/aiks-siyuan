import assert from "node:assert/strict";
import test from "node:test";
import { isAiksReadOnlyPath, resolveAiksEditorAccess } from "./readonly";

test("ai conversation root and descendants are read-only", () => {
    assert.equal(isAiksReadOnlyPath("/10 AI Sessions"), true);
    assert.equal(isAiksReadOnlyPath("/10 AI Sessions/Claude/foo"), true);
});

test("knowledge root remains editable", () => {
    assert.equal(isAiksReadOnlyPath("/20 Knowledge"), false);
    assert.equal(isAiksReadOnlyPath("/20 Knowledge/foo"), false);
});

test("similarly prefixed unrelated paths are not read-only", () => {
    assert.equal(isAiksReadOnlyPath("/10 AI Sessions Archive"), false);
});

test("editor access policy disables only AI conversation documents", () => {
    assert.equal(resolveAiksEditorAccess("/10 AI Sessions/Claude/foo"), "readonly");
    assert.equal(resolveAiksEditorAccess("/20 Knowledge/foo"), "editable");
});
