import { expect, test } from '@playwright/test';

/**
 * Rendering and theming.
 *
 * The visual assertions here would have caught the dead Tailwind config: with
 * `tailwind.config.js` unread by v4, the palette resolved to nothing and every
 * page rendered with transparent backgrounds and default text.
 */

test('the home page renders with the themed palette applied', async ({ page }) => {
  await page.goto('/');

  // A generated utility, not a browser default - proves the theme is wired up.
  const background = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  expect(background).not.toBe('rgba(0, 0, 0, 0)');
  expect(background).not.toBe('');
});

test('the clay brand colour is generated', async ({ page }) => {
  await page.goto('/');
  const found = await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.className = 'bg-clay-500';
    document.body.appendChild(probe);
    const colour = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return colour;
  });
  // #b25c3e - terracotta
  expect(found).toBe('rgb(178, 92, 62)');
});

test('no element renders a gradient', async ({ page }) => {
  // The design is deliberately flat; depth comes from borders and small shadows.
  for (const path of ['/', '/guide', '/auth/login']) {
    await page.goto(path);
    const gradients = await page.evaluate(
      () =>
        [...document.querySelectorAll('*')].filter((el) =>
          /gradient/.test(getComputedStyle(el).backgroundImage),
        ).length,
    );
    expect(gradients, `${path} should have no gradients`).toBe(0);
  }
});

test('the brand logo and favicons are served', async ({ page, request }) => {
  await page.goto('/');

  const logo = page.locator('img[alt="TourismToolKit"]').first();
  await expect(logo).toBeVisible();

  for (const asset of ['/logo.png', '/icon.png', '/apple-icon.png', '/favicon.ico']) {
    const response = await request.get(asset);
    expect(response.status(), `${asset} should be served`).toBe(200);
  }
});

test('the stored theme survives hydration', async ({ page }) => {
  // The blocking script sets the class before first paint, but hydration
  // reconciles <html> against a server render that had no class and strips it.
  // The provider re-applies on mount; this guards that it still does.
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('tourism-theme', 'dark'));

  for (const path of ['/', '/guide']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveClass(/dark/);
  }
});

test('dark mode is driven by the .dark class, not prefers-color-scheme', async ({ page }) => {
  await page.goto('/');

  const lightBackground = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );

  await page.evaluate(() => {
    localStorage.setItem('tourism-theme', 'dark');
  });
  await page.reload();

  await expect(page.locator('html')).toHaveClass(/dark/);
  const darkBackground = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  expect(darkBackground).not.toBe(lightBackground);
});

test('the theme is applied before first paint', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('tourism-theme', 'dark'));

  // The blocking init script runs in <head>, so the class is present on the very
  // first evaluation after navigation rather than after hydration.
  await page.goto('/', { waitUntil: 'commit' });
  const classes = await page.evaluate(() => document.documentElement.className);
  expect(classes).toContain('dark');
});

test('language selection persists across a reload', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('selected-language', 'hi'));
  await page.reload();

  const stored = await page.evaluate(() => localStorage.getItem('selected-language'));
  expect(stored).toBe('hi');
});

test('the guide page renders database-backed content without errors', async ({ page }) => {
  // /guide is public; /places is behind the route guard, so it is covered by the
  // redirect test in auth.spec.ts instead.
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/guide');

  // Emergency contacts come from the database through the async GraphQL layer.
  await expect(page.getByText('Emergency Contacts').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('100', { exact: true }).first()).toBeVisible();

  expect(errors).toEqual([]);
});


test('the theme toggle choice survives a reload on a dark-preferring OS', async ({ browser }) => {
  // Regression: the toggle used to cycle light -> dark -> system. On a machine
  // whose OS prefers dark, "system" rendered identically to "dark", so the third
  // click looked like it had done nothing and the choice appeared to revert on
  // every reload. It is a plain two-way switch now.
  const context = await browser.newContext({ colorScheme: 'dark' });
  const page = await context.newPage();

  await page.goto('/guide');
  await page.waitForLoadState('networkidle');

  const toggle = page.getByTitle(/Switch to/).first();

  for (let i = 0; i < 3; i++) {
    await toggle.click();
    await page.waitForTimeout(200);

    const before = await page.evaluate(() => document.documentElement.className);
    await page.reload();
    await page.waitForLoadState('networkidle');
    const after = await page.evaluate(() => document.documentElement.className);

    expect(after, `theme changed across reload on iteration ${i + 1}`).toBe(before);
  }

  // Two clicks must return to where it started - a two-way switch, not a cycle.
  const start = await page.evaluate(() => document.documentElement.className);
  await toggle.click();
  await page.waitForTimeout(200);
  await toggle.click();
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => document.documentElement.className)).toBe(start);

  await context.close();
});
