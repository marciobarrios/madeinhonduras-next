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

test("thumbnail navigation keeps the caption, URL and selection together", async ({ page }) => {
  await page.goto("/places/roatan/");
  await page.locator('a[data-photo-index="0"]:visible').click();
  await expect(page.locator('.pswp[data-ready="true"]')).toBeVisible();
  const thumbnail = page.getByRole("button", { name: "Photo 3: View of West Bay", exact: true });
  await thumbnail.click();
  await expect(thumbnail).toHaveAttribute("aria-current", "true");
  await expect(page.locator(".pswp__caption strong")).toHaveText("View of West Bay");
  await expect(page.locator(".pswp__counter")).toHaveText("3 of 12");
  await expect(page).toHaveURL(/#photo=view-of-west-bay$/);
  await page.keyboard.press("Escape");
  await expect(page.locator('a[data-photo-index="0"]:visible')).toBeFocused();
  await expect(page).toHaveURL(/\/places\/roatan\/$/);
});

test("mobile navigation fits small screens and preserves the active section", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Touch layout only");
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav.getByRole("link", { name: "Places", exact: true })).toHaveAttribute("aria-current", "page");
  for (const link of await nav.getByRole("link").all()) {
    const box = (await link.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await nav.getByRole("link", { name: "Who", exact: true }).click();
  await expect(nav.getByRole("link", { name: "Who", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Who", exact: true })).toBeVisible();
});

test("touch swipes, pinch zoom and vertical dismissal work in the exported viewer", async ({ page, isMobile, browserName }) => {
  test.skip(!isMobile || browserName !== "chromium", "Multi-touch input uses Chromium's CDP protocol");
  await page.goto("/places/roatan/");
  const firstRow = page.locator(".react-photo-album--track:visible").first();
  await expect(firstRow.locator("a")).toHaveCount(2);
  await page.locator('a[data-photo-index="0"]:visible').click();
  await expect(page.locator('.pswp[data-ready="true"]')).toBeVisible();
  const client = await page.context().newCDPSession(page);
  const frame = () => page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  const swipe = async (from: { x: number; y: number }, to: { x: number; y: number }) => {
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...from, id: 0 }] });
    for (let step = 1; step <= 12; step++) {
      await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: from.x + (to.x - from.x) * step / 12, y: from.y + (to.y - from.y) * step / 12, id: 0 }] });
      await frame();
    }
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  };
  await swipe({ x: 310, y: 330 }, { x: 65, y: 330 });
  await expect(page.locator(".pswp__caption strong")).toHaveText("Palm tree in West Bay");
  await expect(page).toHaveURL(/#photo=palm-tree-in-west-bay$/);
  await expect(page.getByRole("button", { name: "Photo 2: Palm tree in West Bay", exact: true })).toHaveAttribute("aria-current", "true");
  // Pinch with two actual emulated touch points, then use the explicit zoom control to reset.
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 170, y: 330, id: 0 }, { x: 220, y: 330, id: 1 }] });
  for (let step = 1; step <= 10; step++) {
    await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 170 - step * 6, y: 330, id: 0 }, { x: 220 + step * 6, y: 330, id: 1 }] });
    await frame();
  }
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.locator(".pswp")).toHaveClass(/pswp--zoomed-in/);
  await page.getByRole("button", { name: "Zoom photograph", exact: true }).click();
  await expect(page.locator(".pswp")).not.toHaveClass(/pswp--zoomed-in/);
  await swipe({ x: 195, y: 320 }, { x: 195, y: 590 });
  await expect(page.locator(".pswp")).toHaveCount(0);
  await expect(page).toHaveURL(/\/places\/roatan\/$/);
  await client.detach();
});

test("reduced motion and short landscape view retain usable viewer controls", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/places/roatan/");
  await page.locator('a[data-photo-index="0"]:visible').click();
  await expect(page.locator('.pswp[data-ready="true"]')).toBeVisible();
  await expect(page.locator(".pswp__filmstrip")).toBeHidden();
  for (const name of ["Close photo viewer", "Zoom photograph", "Next photograph"]) {
    const button = page.getByRole("button", { name, exact: true });
    const box = (await button.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(390);
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  expect(await page.locator(".pswp__bg").evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0s");
  await page.getByRole("button", { name: "Next photograph", exact: true }).click();
  await expect(page.locator(".pswp__caption strong")).toHaveText("Palm tree in West Bay");
  await page.keyboard.press("Escape");
  await expect(page.locator(".pswp")).toHaveCount(0);
});
