import test from "node:test";
import * as assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";

const appIndex = readFileSync(resolve(process.cwd(), "src/index.ts"), "utf8");

test("AIKS embedded profile suppresses the standalone Chrome-only browser notice", () => {
    assert.match(
        appIndex,
        /!isAiksEmbedded\(\)[\s\S]*?!isChromeBrowser\(\)/,
        "browser compatibility warning must be skipped for the AIKS embedded WebView2 host",
    );
    assert.match(
        appIndex,
        /from\s+"\.\/aiks\/profile"/,
        "the browser warning guard must use the existing AIKS embedded profile",
    );
});
