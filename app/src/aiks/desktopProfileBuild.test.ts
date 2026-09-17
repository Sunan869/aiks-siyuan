import test from "node:test";
import * as assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";

const desktopWebpack = readFileSync(resolve(process.cwd(), "webpack.desktop.js"), "utf8");

test("desktop bundle boots the AIKS embedded profile before SiYuan", () => {
    assert.match(
        desktopWebpack,
        /entry:\s*\{[\s\S]*?"main":\s*\[\s*"\.\/src\/aiks\/index\.ts",\s*"\.\/src\/index\.ts"\s*\]/,
        "webpack.desktop.js must prepend ./src/aiks/index.ts to the desktop main entry",
    );
});

test("desktop bundle defines SIYUAN_PROFILE from the build environment", () => {
    assert.match(
        desktopWebpack,
        /SIYUAN_PROFILE:\s*JSON\.stringify\(process\.env\.SIYUAN_PROFILE\s*\|\|\s*""\)/,
        "webpack.desktop.js must inject SIYUAN_PROFILE for isAiksEmbedded()",
    );
});
