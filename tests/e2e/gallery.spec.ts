import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("places, galleries, local images and readable pages", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const external: string[] = [];
  page.on("request", (r) => {
    if (!r.url().startsWith("http://127.0.0.1:4173")) external.push(r.url());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Honduras",
  );
  await expect(page.locator(".place")).toHaveCount(9);
  await page.getByRole("link", { name: "Explore Roatán", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Roatán");
  await expect(page.locator(".react-photo-album--link:visible")).toHaveCount(
    12,
  );
  await expect(page.locator("body")).not.toHaveText(/undefined/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "Why", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Why");
  await expect(page.locator("main")).toContainText(
    "spread the beauty of Honduras",
  );
  await page.getByRole("link", { name: "Who", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Who");
  await expect(page.locator("main img")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("main img")
        .evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
    )
    .toBe(true);
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test("viewer captions, arrows, Escape, Back, Forward, focus and repeat opening", async ({
  page,
}) => {
  await page.goto("/places/roatan/");
  const first = page.locator('a[data-photo-index="0"]:visible');
  await first.click();
  await expect(page.locator('.pswp[data-ready="true"]')).toBeVisible();
  await expect(page.locator(".pswp__caption")).toContainText(
    "One of the best sunsets",
  );
  await expect(page).toHaveURL(/#photo=sunset-in-west-bay$/);
  await page
    .getByRole("button", { name: "Next photograph", exact: true })
    .click();
  await expect(page.locator(".pswp__caption strong")).toHaveText(
    "Palm tree in West Bay",
  );
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".pswp__caption strong")).toHaveText(
    "Sunset in West Bay",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator(".pswp")).toHaveCount(0);
  await expect(page).toHaveURL(/\/places\/roatan\/$/);
  await expect(first).toBeFocused();
  await first.click();
  await expect(page.locator('.pswp[data-ready="true"]')).toBeVisible();
  await page.goBack();
  await expect(page.locator(".pswp")).toHaveCount(0);
  await page.goForward();
  await expect(page.locator('.pswp[data-ready="true"]')).toBeVisible();
  await page
    .getByRole("button", { name: "Close photo viewer", exact: true })
    .click();
  await expect(page.locator(".pswp")).toHaveCount(0);
  await first.click();
  await expect(page.locator('.pswp[data-ready="true"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".pswp")).toHaveCount(0);
});

test("legacy routes and deep links work directly and after refresh", async ({
  page,
}) => {
  await page.goto("/places/roatan/content/sunset-in-west-bay/lightbox/");
  await expect(page.locator('.pswp[data-ready="true"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".pswp")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Sunset in West Bay",
  );
  await page.goto("/content/sunset-in-west-bay/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Sunset in West Bay",
  );
  await page.reload();
  await expect(page.locator(".single-photo img")).toBeVisible();
  await page.goto("/places/roatan/#photo=palm-tree-in-west-bay");
  await expect(page.locator(".pswp__caption strong")).toHaveText(
    "Palm tree in West Bay",
  );
  await expect(page.locator('.pswp[data-ready="true"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/places\/roatan\/$/);
});

test("home, album and viewer accessibility", async ({ page }) => {
  for (const url of ["/", "/places/roatan/", "/pages/why/", "/pages/who/"]) {
    await page.goto(url);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  }
  await page.goto("/places/roatan/");
  await page.locator('a[data-photo-index="0"]:visible').click();
  await expect(page.locator('.pswp[data-ready="true"]')).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});

test("static content remains navigable with JavaScript disabled", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL + "/places/roatan/");
  await page.locator('a[data-photo-index="0"]:visible').click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Sunset in West Bay",
  );
  await expect(page.locator(".single-photo img")).toBeVisible();
  await context.close();
});

test("every gallery renders and removed photographs return 404", async ({
  page,
}) => {
  await page.goto("/");
  const links = await page
    .locator(".place-image")
    .evaluateAll((nodes) =>
      nodes.map((n) => (n as HTMLAnchorElement).getAttribute("href")!),
    );
  for (const link of links) {
    await page.goto(link);
    const images = page.locator(".react-photo-album--image:visible");
    await expect(images.first()).toBeVisible();
    await expect
      .poll(() =>
        images
          .first()
          .evaluate(
            (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
          ),
      )
      .toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  for (const slug of ["mg-2702", "mg-1286"]) {
    for (const suffix of ["", "lightbox/"]) {
      const response = await page.goto(`/content/${slug}/${suffix}`);
      expect(response?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "This place isn’t here.",
      );
    }
  }
  await page.goto("/content/page/2/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "All photographs",
  );
  await expect(page.locator(".photo-count")).toHaveText(
    "182 photographs · Page 2 of 2",
  );
  await expect(page.locator(".react-photo-album--link:visible")).toHaveCount(82);
});
