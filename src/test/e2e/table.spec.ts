import { expect } from "@playwright/test";
import { MarkdownTaskItem } from "index/types/markdown";
import { test } from "obsidian-testing-framework/lib/index.js";
import { assertLinesMatch } from "obsidian-testing-framework/lib/util.js";
import {
    beforeAll,
    blockLang,
    waitForText,
    query,
    regexEscape,
    roundtripEdit,
    rand,
    waitForAnyFile,
} from "../e2e-common";
import { beforeEach, describe } from "vitest";
beforeEach(async ({ page }) => beforeAll(page, "ui/table.md"));

describe("tables", async () => {
    const rowSelector = `tr.datacore-table-row`;
    const q = `@task and  startswith($file, "data/02 - ") and regexreplace($cleantext, "^\\s+|\\s+$", "") != ""`;

    test("table checkboxes work", { timeout: 40000 }, async ({ page }) => {
        const el = (await blockLang(page))[0];
        await waitForText(el, rowSelector.concat(" td"));
        const row = el.locator(rowSelector);
        const checkbox = row.locator("td label.dc-checkbox input").first();
        const alreadyChecked = await checkbox.isChecked();
        console.log("checked?", alreadyChecked);
        await row.locator("td").nth(1).dblclick();
        const txt = await row.locator("td textarea").first().inputValue();
        await row.locator("td textarea").press("Control+Enter");
        console.log("txt", txt.split("\n"));
        await checkbox.click();

        await waitForAnyFile(page);
        const tasks = await query<MarkdownTaskItem>(
            page,
            q.concat(` and contains($cleantext, "${txt.split("\n")[0]}")`)
        );
        console.log("tasklen", tasks.length);
        const task = tasks[0];
        const expectedStatus = alreadyChecked ? " " : "x";
        expect(task.$status.toLocaleLowerCase()).toEqual(expectedStatus);
        await assertLinesMatch(
            page,
            task.$file,
            task.$position.start,
            task.$position.end,
            new RegExp(`^[\\s>]*.\\s*\\[${expectedStatus}\\]`, "im"),
            false
        );
    });
    test("table columns can be edited", async ({ page }) => {
        const el = (await blockLang(page))[0];
        await waitForText(el, rowSelector.concat(" td"));
        const row = el.locator(rowSelector);
        const textColumn = row.locator("td").nth(1);

        let values = await roundtripEdit(page, textColumn, q, `\n${rand(1, 100)} -- some new *value*!`, false);
        const { oldText } = values;
        await waitForAnyFile(page);

        let nrow = (await query<MarkdownTaskItem>(page, q.concat(` and $id = "${values.id}"`)))[0];
        let re = /some new \*value\*!?/i;
        console.log("ntxt", nrow.$text, `"${oldText}"`);
        expect(re.test(nrow.$text!)).toEqual(true);
        await assertLinesMatch(page, nrow.$file, nrow.$position.start, nrow.$position.end, re);
        values = await roundtripEdit(page, textColumn, q, oldText);
        await waitForAnyFile(page);

        nrow = (await query<MarkdownTaskItem>(page, q.concat(` and $id = "${values.id}"`)))[0];
        console.log("ntxt2\n", nrow.$text, "\n---\n", oldText);
        expect(nrow.$text?.includes(oldText)).toEqual(true);
        await assertLinesMatch(
            page,
            nrow.$file,
            nrow.$position.start,
            nrow.$position.end,
            new RegExp(regexEscape(oldText.split("\n")[0])),
            false
        );
    });
});
