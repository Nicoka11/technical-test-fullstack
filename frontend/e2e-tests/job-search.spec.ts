import { test } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByRole("textbox", { name: "Job title" }).click();
  await page.getByRole("textbox", { name: "Job title" }).fill("Frontend");
  await page.getByText("jobs found for your search").click();
});
