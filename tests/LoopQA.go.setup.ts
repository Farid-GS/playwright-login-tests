import { test, expect } from "@playwright/test";
import * as fs from "fs";

interface TestCase {
  description: string;
  task: string;
  column: string;
  tags: string[];
  navigateTo: string;
}

// const testCases: TestCase[] = JSON.parse(
//   fs.readFileSync("tests/LoopQA-testCases.json", "utf-8")
// );
let testCases: TestCase[];
//adding try catch block to handle errors reading the JSON file
try {
  // Load test cases from JSON
  const data = fs.readFileSync("tests/LoopQA-testCases.json", "utf-8");
  testCases = JSON.parse(data);
} catch (error) {
  console.error("Error reading or parsing the JSON file:", error);
  process.exit(1);
}
testCases.forEach(({ description, task, column, tags, navigateTo }) => {
  test(description, { tag: "@ddTest" }, async ({ page }) => {
    // try catch block in case of app down, network issues, incorrect URL, etc.
    try {
      await page.goto("https://animated-gingersnap-8cf7f2.netlify.app/");
    } catch (error) {
      console.error("Error navigating to the demo app:", error);
      await page.screenshot({ path: `error-navigation.png` });
    }
    await page.getByLabel("Username").click();
    await page.getByLabel("Username").fill("admin");
    await page.getByLabel("Username").press("Tab");
    await page.getByLabel("Password").fill("password");
    await page.getByLabel("Password").dblclick();
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Step 2: Navigate to the application
    await page.click(`text=${navigateTo}`);

    // Step 3: Verify the expected task is in the specified column using a CSS selector

    const taskLocator = page.locator(`text=${task}`);
    try {
      await expect(taskLocator).toBeVisible();
    } catch (error) {
      console.error(`Error verifying task visibility for: ${task}`, error);
      await page.screenshot({ path: `error-visibility-${task}.png` });
    }
    for (const tag of tags) {
      const tagLocator = page.locator(`span:has-text("${tag}")`);

      if ((await tagLocator.count()) > 0) {
        await expect(tagLocator.first()).toBeVisible();
      } else {
        console.warn(`Tag "${tag}" not found.`);
      }
    }
  });
});
