import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { advance, finishOnboarding, newGame, toggleTask } from '../../engine/game';
import type { Task } from '../../engine/types';
async function onboard(page: import('@playwright/test').Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Meet the you who shows up.' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Rival name').fill('Nova');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Start my rivalry' }).click();
  await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
}
test('onboarding, CRUD, completion, focus lock and persisted reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await onboard(page);
  await page
    .getByRole('button', { name: 'Complete Drink 8 glasses of water', exact: true })
    .click();
  await expect(page.getByRole('button', { name: 'Undo Drink 8 glasses of water' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.reload();
  await expect(page.getByRole('button', { name: 'Undo Drink 8 glasses of water' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Complete Study for 50 minutes', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Focus mode' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Claim +25 XP' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await page.getByLabel('Task title').fill('Read ten pages');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /^Add task/ })
    .click();
  await expect(page.getByRole('button', { name: 'Complete Read ten pages' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete Read ten pages' }).click();
  await page.getByRole('button', { name: 'Delete task', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Complete Read ten pages' })).toHaveCount(0);
  expect(errors).toEqual([]);
});
test('mobile routes and accessibility in light and dark themes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await onboard(page);
  for (const path of ['/', '/history', '/rival', '/settings']) {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('/');
  const dark = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(dark.violations).toEqual([]);
  await page.screenshot({ path: 'test-results/today-mobile.png', fullPage: true });
});
test('lazy showdown renders immutable results and can be dismissed', async ({ page }) => {
  const date = new Date();
  const yesterday = new Date(date);
  yesterday.setUTCDate(date.getUTCDate() - 2);
  const day = yesterday.toISOString().slice(0, 10);
  const task: Task = {
    id: 't',
    title: 'A meaningful task',
    xp: 40,
    schedule: 'daily',
    days: [],
    onceDay: day,
    focusMinutes: 0,
    category: 'life',
    active: true,
    createdDay: day,
  };
  let g = finishOnboarding(newGame(yesterday, 'UTC', 'fixture'), [task], yesterday);
  g = toggleTask(g, 't', yesterday);
  g = advance(g, date);
  await page.addInitScript(
    (game) => localStorage.setItem('rival-v1', JSON.stringify({ state: { game }, version: 0 })),
    g,
  );
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('DEFEAT');
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(axe.violations).toEqual([]);
  await page.getByRole('button', { name: 'Start today' }).click();
  await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
});
test('rest locks the task list and service worker supports offline reload', async ({
  page,
  context,
}) => {
  await onboard(page);
  await page.getByRole('button', { name: 'Need a breather?' }).click();
  await page.getByRole('button', { name: 'Take a rest day' }).click();
  await expect(
    page.getByRole('button', { name: 'Complete Drink 8 glasses of water' }),
  ).toBeDisabled();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.evaluate(async () => {
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
          once: true,
        }),
      );
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
  await expect(page.getByText('You’re resting today. Your streak is safe.')).toBeVisible();
  await context.setOffline(false);
});
