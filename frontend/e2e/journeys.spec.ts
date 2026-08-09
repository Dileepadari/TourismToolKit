import { expect, test, type Page } from '@playwright/test';

/**
 * The signed-in journeys that were markup only.
 *
 * Saving a place, sharing one, the place detail route, and the travel journal
 * all rendered controls that did nothing - the detail route did not even exist,
 * so every "View Details" button led to a 404.
 */

/** Registers a fresh account. Seeded users differ between environments. */
async function signUp(page: Page) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const user = { email: `e2e-${id}@example.com`, username: `e2e${id}`, password: 'correcthorse1' };

  await page.goto('/auth/register');
  await page.getByLabel(/username/i).fill(user.username);
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/^password/i).first().fill(user.password);
  const confirm = page.getByLabel(/confirm password/i);
  if (await confirm.count()) await confirm.fill(user.password);
  await page.getByRole('button', { name: /create account|register|sign up/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  return user;
}

test('a trip can be recorded, survives a reload, and can be deleted', async ({ page }) => {
  await signUp(page);

  await page.goto('/trips');
  await expect(page.getByLabel('Destination')).toBeVisible({ timeout: 15_000 });

  const destination = `Udaipur ${Date.now().toString(36)}`;
  await page.getByLabel('Destination').fill(destination);
  await page.getByLabel('Country').fill('India');
  await page.getByLabel('Visit date').fill('2026-03-14');
  await page.getByLabel('Notes').fill('Lake Pichola at sunrise');
  await page.getByRole('button', { name: 'Add trip' }).click();

  const entry = page.locator('li').filter({ hasText: destination });
  await expect(entry).toHaveCount(1, { timeout: 15_000 });
  await expect(entry).toContainText('Lake Pichola at sunrise');

  // Persisted server-side, not just held in component state.
  await page.reload();
  await expect(page.locator('li').filter({ hasText: destination })).toHaveCount(1, {
    timeout: 15_000,
  });

  await page.locator(`button[aria-label="Delete trip to ${destination}"]`).click();
  await expect(page.locator('li').filter({ hasText: destination })).toHaveCount(0, {
    timeout: 15_000,
  });
});

test('the trips page is behind the route guard', async ({ page }) => {
  await page.goto('/trips');
  await expect(page).toHaveURL(/\/auth\/login/);
});

test('a place opens its detail route and can be saved', async ({ page }) => {
  await signUp(page);

  await page.goto('/places');
  const details = page.getByRole('link', { name: 'View Details' }).first();
  await expect(details).toBeVisible({ timeout: 20_000 });

  // This used to point at a route that did not exist.
  await details.click();
  await expect(page).toHaveURL(/\/places\/\d+$/, { timeout: 15_000 });
  await expect(page.locator('h1')).toBeVisible();

  // The directions control was a button with no handler.
  const directions = page.getByRole('link', { name: 'Directions' });
  await expect(directions).toHaveAttribute('href', /^https:\/\/www\.google\.com\/maps/);

  const save = page.getByRole('button', { name: /^Save$|^Saved$/ });
  await expect(save).toHaveText('Save');
  await save.click();
  await expect(save).toHaveText('Saved', { timeout: 15_000 });

  await page.reload();
  await expect(page.getByRole('button', { name: /^Save$|^Saved$/ })).toHaveText('Saved', {
    timeout: 20_000,
  });
});

test('an unknown place id renders a not-found state rather than crashing', async ({ page }) => {
  // Signed in first: `/places` is behind the route guard, so a signed-out visit
  // tests the redirect rather than the not-found state.
  await signUp(page);

  await page.goto('/places/999999');
  await expect(page.getByText('Place not found')).toBeVisible({ timeout: 20_000 });
});
