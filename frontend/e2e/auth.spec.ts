import { expect, test } from '@playwright/test';

/**
 * The signup -> signin journey.
 *
 * This is the flow that was broken end to end: `register` was a mock that
 * returned a token without writing a row, and the register page then wrote
 * localStorage keys the auth provider does not read and never set the cookie the
 * route guard checks.
 */

function uniqueUser() {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  return {
    email: `e2e-${id}@example.com`,
    username: `e2e${id}`,
    password: 'correcthorse1',
  };
}

test('a protected route redirects to login when signed out', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/auth\/login/);
  // The route guard records where the user was headed.
  await expect(page).toHaveURL(/redirect=%2Fdashboard/);
});

test('public routes are reachable when signed out', async ({ page }) => {
  for (const path of ['/', '/auth/login', '/auth/register', '/auth/forgot-password']) {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`${path.replace('/', '\\/')}$`));
  }
});

test('register creates an account that can then sign in', async ({ page }) => {
  const user = uniqueUser();

  await page.goto('/auth/register');
  await page.getByLabel(/username/i).fill(user.username);
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/^password/i).first().fill(user.password);

  const confirm = page.getByLabel(/confirm password/i);
  if (await confirm.count()) await confirm.fill(user.password);

  await page.getByRole('button', { name: /create account|register|sign up/i }).click();

  // Registration must establish a real session, not just a token in localStorage.
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  // Session cookies must exist, and the credentials among them must be HttpOnly
  // so no script on the page can read them.
  const cookies = await page.context().cookies();
  const access = cookies.find((c) => c.name === 'tt_access');
  const refresh = cookies.find((c) => c.name === 'tt_refresh');

  expect(access?.httpOnly).toBe(true);
  expect(refresh?.httpOnly).toBe(true);
  // The route guard's marker is deliberately readable; it holds no secret.
  expect(cookies.some((c) => c.name === 'tt_session')).toBe(true);

  // No token should be sitting in web storage any more.
  const stored = await page.evaluate(() =>
    Object.keys(localStorage).filter((k) => /token/i.test(k)),
  );
  expect(stored).toEqual([]);

  // Sign out, then sign back in with the same credentials - this only works if
  // registration actually persisted a row.
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());

  await page.goto('/auth/login');
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
  await page.getByRole('button', { name: /sign in|log ?in/i }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
});

test('browsing anonymously does not lock a visitor out of registering', async ({ page }) => {
  // Every anonymous page load used to fire `refreshSession`, which shared the
  // credential-stuffing bucket with `register`. Browsing a handful of pages
  // exhausted the allowance and the signup that followed was refused with
  // "Too many requests" - which is exactly how this suite failed in CI.
  const refreshes: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/graphql') && request.method() === 'POST') {
      try {
        const { operationName } = JSON.parse(request.postData() ?? '{}');
        if (operationName === 'RefreshSession') refreshes.push(operationName);
      } catch {
        // Not JSON; not a document we care about.
      }
    }
  });

  for (let i = 0; i < 6; i += 1) {
    await page.goto('/');
    await page.goto('/auth/login');
  }
  expect(refreshes).toEqual([]);

  const user = uniqueUser();
  await page.goto('/auth/register');
  await page.getByLabel(/username/i).fill(user.username);
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/^password/i).first().fill(user.password);
  const confirm = page.getByLabel(/confirm password/i);
  if (await confirm.count()) await confirm.fill(user.password);
  await page.getByRole('button', { name: /create account|register|sign up/i }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
});

test('login rejects a wrong password without crashing', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByLabel(/email/i).fill('nobody@example.com');
  await page.getByLabel(/password/i).fill('definitely-wrong');
  await page.getByRole('button', { name: /sign in|log ?in/i }).click();

  // Stays on the login page and shows an error rather than throwing on
  // `data.login.success` - the unguarded access that used to crash here.
  await expect(page).toHaveURL(/\/auth\/login/);
  await expect(page.getByText(/invalid|failed/i).first()).toBeVisible({ timeout: 10_000 });
});
