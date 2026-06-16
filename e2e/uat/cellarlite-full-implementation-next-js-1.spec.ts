/**
 * CellarLite UAT — Generated from UserStories-CellarLite.md
 * Slug: cellarlite-full-implementation-next-js-1
 * Base URL: http://localhost:3000
 */
import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Creates a bottle via API and returns its id */
async function createBottle(page: Page, data: {
  name: string;
  vintage?: number | null;
  varietal?: string | null;
  quantity?: number;
  location?: string | null;
}): Promise<number> {
  const res = await page.request.post('/api/bottles', {
    data: {
      name: data.name,
      vintage: data.vintage ?? null,
      varietal: data.varietal ?? null,
      quantity: data.quantity ?? 1,
      location: data.location ?? null,
    },
  });
  const body = await res.json();
  return body.id as number;
}

/** Deletes a bottle via API (best-effort, ignores errors) */
async function deleteBottle(page: Page, id: number): Promise<void> {
  await page.request.delete(`/api/bottles/${id}`).catch(() => {});
}

/** Clears all bottles via API */
async function clearAllBottles(page: Page): Promise<void> {
  const res = await page.request.get('/api/bottles');
  const bottles = await res.json() as Array<{ id: number }>;
  for (const b of bottles) {
    await deleteBottle(page, b.id);
  }
}

// ---------------------------------------------------------------------------
// Epic 0: Bottle List Page (F0)
// ---------------------------------------------------------------------------

test.describe('US-0.1: View Full Bottle List', () => {
  let createdId: number;

  test.beforeEach(async ({ page }) => {
    createdId = await createBottle(page, {
      name: 'Test Cabernet',
      vintage: 2020,
      varietal: 'Cabernet Sauvignon',
      quantity: 3,
      location: 'Rack B1',
    });
  });

  test.afterEach(async ({ page }) => {
    await deleteBottle(page, createdId);
  });

  test('navigating to / renders the page without login screen', async ({ page }) => {
    await page.goto('/');
    // No login prompt — page loads directly
    await expect(page).toHaveURL('/');
    // Should not show a login form
    const loginForm = page.locator('form[action*="login"], input[type="password"]');
    await expect(loginForm).toHaveCount(0);
  });

  test('each bottle row shows name, vintage, varietal, quantity, and location', async ({ page }) => {
    await page.goto('/');
    // Find the row for our created bottle
    const row = page.locator('a.bottle-row').filter({ hasText: 'Test Cabernet' });
    await expect(row).toBeVisible();
    // Check meta information is visible
    const meta = row.locator('.bottle-meta');
    await expect(meta).toContainText('2020');
    await expect(meta).toContainText('Cabernet Sauvignon');
    await expect(meta).toContainText('Qty: 3');
    await expect(meta).toContainText('Rack B1');
  });

  test('page title or heading reads "My Cellar"', async ({ page }) => {
    await page.goto('/');
    // Check heading / app branding
    const heading = page.locator('text=My Cellar').first();
    await expect(heading).toBeVisible();
  });
});

test.describe('US-0.2: View Empty-State When Cellar Has No Bottles', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllBottles(page);
  });

  test('shows "No bottles yet" when cellar is empty', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=No bottles yet')).toBeVisible();
  });

  test('shows "Add bottle" button in empty state', async ({ page }) => {
    await page.goto('/');
    const addBtn = page.locator('a[href="/bottles/new"]').first();
    await expect(addBtn).toBeVisible();
  });

  test('clicking "Add bottle" in empty state navigates to /bottles/new', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="/bottles/new"]').first().click();
    await expect(page).toHaveURL('/bottles/new');
  });

  test('no bottle rows are rendered in empty state', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a.bottle-row')).toHaveCount(0);
  });
});

test.describe('US-0.3: Navigate to Edit Page from List Row', () => {
  let createdId: number;

  test.beforeEach(async ({ page }) => {
    createdId = await createBottle(page, { name: 'Navigation Test Bottle', quantity: 1 });
  });

  test.afterEach(async ({ page }) => {
    await deleteBottle(page, createdId);
  });

  test('clicking a bottle row navigates to /bottles/[id]/edit', async ({ page }) => {
    await page.goto('/');
    const row = page.locator('a.bottle-row').filter({ hasText: 'Navigation Test Bottle' });
    await expect(row).toBeVisible();
    await row.click();
    await expect(page).toHaveURL(new RegExp(`/bottles/${createdId}/edit`));
  });

  test('link target contains the correct bottle id', async ({ page }) => {
    await page.goto('/');
    const row = page.locator('a.bottle-row').filter({ hasText: 'Navigation Test Bottle' });
    const href = await row.getAttribute('href');
    expect(href).toBe(`/bottles/${createdId}/edit`);
  });
});

test.describe('US-0.4: Navigate to Add Bottle from List Page', () => {
  let createdId: number;

  test.beforeEach(async ({ page }) => {
    createdId = await createBottle(page, { name: 'Present Bottle', quantity: 1 });
  });

  test.afterEach(async ({ page }) => {
    await deleteBottle(page, createdId);
  });

  test('"Add bottle" button is visible when list is populated', async ({ page }) => {
    await page.goto('/');
    const addBtn = page.locator('a[href="/bottles/new"]').first();
    await expect(addBtn).toBeVisible();
  });

  test('clicking "Add bottle" navigates to /bottles/new', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="/bottles/new"]').first().click();
    await expect(page).toHaveURL('/bottles/new');
  });
});

// ---------------------------------------------------------------------------
// Epic 1: Add Bottle Page (F1)
// ---------------------------------------------------------------------------

test.describe('US-1.1: Add a New Bottle with All Fields', () => {
  test.afterEach(async ({ page }) => {
    // Clean up any bottle named UAT-Caymus-AllFields
    const res = await page.request.get('/api/bottles?q=UAT-Caymus-AllFields');
    const bottles = await res.json() as Array<{ id: number }>;
    for (const b of bottles) {
      await deleteBottle(page, b.id);
    }
  });

  test('form at /bottles/new has all five fields with visible labels', async ({ page }) => {
    await page.goto('/bottles/new');
    await expect(page.locator('label[for="name"]')).toBeVisible();
    await expect(page.locator('label[for="vintage"]')).toBeVisible();
    await expect(page.locator('label[for="varietal"]')).toBeVisible();
    await expect(page.locator('label[for="quantity"]')).toBeVisible();
    await expect(page.locator('label[for="location"]')).toBeVisible();
  });

  test('filling all fields and submitting creates the record and redirects to /', async ({ page }) => {
    await page.goto('/bottles/new');
    await page.fill('#name', 'UAT-Caymus-AllFields');
    await page.fill('#vintage', '2019');
    await page.fill('#varietal', 'Cabernet Sauvignon');
    await page.fill('#quantity', '3');
    await page.fill('#location', 'Rack A3');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('new bottle appears in the list with correct values', async ({ page }) => {
    await page.goto('/bottles/new');
    await page.fill('#name', 'UAT-Caymus-AllFields');
    await page.fill('#vintage', '2019');
    await page.fill('#varietal', 'Cabernet Sauvignon');
    await page.fill('#quantity', '3');
    await page.fill('#location', 'Rack A3');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    const row = page.locator('a.bottle-row').filter({ hasText: 'UAT-Caymus-AllFields' });
    await expect(row).toBeVisible();
    await expect(row.locator('.bottle-meta')).toContainText('2019');
    await expect(row.locator('.bottle-meta')).toContainText('Cabernet Sauvignon');
    await expect(row.locator('.bottle-meta')).toContainText('Qty: 3');
    await expect(row.locator('.bottle-meta')).toContainText('Rack A3');
  });
});

test.describe('US-1.2: Add a Bottle with Name Only', () => {
  test.afterEach(async ({ page }) => {
    const res = await page.request.get('/api/bottles?q=UAT-NameOnly');
    const bottles = await res.json() as Array<{ id: number }>;
    for (const b of bottles) await deleteBottle(page, b.id);
  });

  test('submitting with only name succeeds and redirects to /', async ({ page }) => {
    await page.goto('/bottles/new');
    await page.fill('#name', 'UAT-NameOnly');
    // Leave all other fields empty
    await page.fill('#quantity', ''); // clear default
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('quantity defaults to 1 when quantity field is left blank', async ({ page }) => {
    await page.goto('/bottles/new');
    await page.fill('#name', 'UAT-NameOnly');
    await page.fill('#quantity', '');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // Verify via API
    const res = await page.request.get('/api/bottles?q=UAT-NameOnly');
    const bottles = await res.json() as Array<{ name: string; quantity: number }>;
    const bottle = bottles.find(b => b.name === 'UAT-NameOnly');
    expect(bottle).toBeDefined();
    expect(bottle!.quantity).toBe(1);
  });
});

test.describe('US-1.3: Prevented from Submitting Without a Name', () => {
  test('empty name shows "Name is required" error and does not submit', async ({ page }) => {
    await page.goto('/bottles/new');
    // Leave name empty
    await page.fill('#vintage', '2021');
    await page.click('button[type="submit"]');
    // Error message should be visible
    await expect(page.locator('text=Name is required')).toBeVisible();
    // Should still be on the same page
    await expect(page).toHaveURL('/bottles/new');
  });

  test('field values entered before failed submit are preserved', async ({ page }) => {
    await page.goto('/bottles/new');
    await page.fill('#vintage', '2021');
    await page.fill('#varietal', 'Merlot');
    await page.click('button[type="submit"]');
    // Other field values are preserved
    await expect(page.locator('#vintage')).toHaveValue('2021');
    await expect(page.locator('#varietal')).toHaveValue('Merlot');
  });
});

test.describe('US-1.4: Cancel Adding a Bottle', () => {
  test('"Cancel" link is visible on /bottles/new', async ({ page }) => {
    await page.goto('/bottles/new');
    const cancel = page.locator('a', { hasText: 'Cancel' });
    await expect(cancel).toBeVisible();
  });

  test('clicking Cancel navigates back to / without creating a bottle', async ({ page }) => {
    await page.goto('/bottles/new');
    await page.fill('#name', 'ShouldNotBeSaved');
    
    // Count bottles before cancel
    const beforeRes = await page.request.get('/api/bottles');
    const beforeCount = (await beforeRes.json() as Array<unknown>).length;

    await page.locator('a', { hasText: 'Cancel' }).click();
    await expect(page).toHaveURL('/');

    // Count bottles after cancel — should be the same
    const afterRes = await page.request.get('/api/bottles');
    const afterCount = (await afterRes.json() as Array<unknown>).length;
    expect(afterCount).toBe(beforeCount);
  });
});

// ---------------------------------------------------------------------------
// Epic 2: Edit Bottle Page (F2)
// ---------------------------------------------------------------------------

test.describe('US-2.1: Open Edit Page with Pre-Populated Fields', () => {
  let bottleId: number;

  test.beforeEach(async ({ page }) => {
    bottleId = await createBottle(page, {
      name: 'UAT Edit Pre-Pop',
      vintage: 2018,
      varietal: 'Pinot Noir',
      quantity: 4,
      location: 'Shelf C2',
    });
  });

  test.afterEach(async ({ page }) => {
    await deleteBottle(page, bottleId);
  });

  test('edit page has all five fields pre-populated', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    // Wait for client-side useEffect to fetch and populate form (IDs use edit- prefix)
    await page.waitForSelector('#edit-name', { timeout: 15000 });
    await expect(page.locator('#edit-name')).toHaveValue('UAT Edit Pre-Pop');
    await expect(page.locator('#edit-vintage')).toHaveValue('2018');
    await expect(page.locator('#edit-varietal')).toHaveValue('Pinot Noir');
    await expect(page.locator('#edit-quantity')).toHaveValue('4');
    await expect(page.locator('#edit-location')).toHaveValue('Shelf C2');
  });

  test('each field has a visible label', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    // Wait for client-side useEffect to fetch and populate form
    await page.waitForSelector('label[for="edit-name"]', { timeout: 15000 });
    await expect(page.locator('label[for="edit-name"]')).toBeVisible();
    await expect(page.locator('label[for="edit-vintage"]')).toBeVisible();
    await expect(page.locator('label[for="edit-varietal"]')).toBeVisible();
    await expect(page.locator('label[for="edit-quantity"]')).toBeVisible();
    await expect(page.locator('label[for="edit-location"]')).toBeVisible();
  });
});

test.describe('US-2.2: Update Bottle Quantity', () => {
  let bottleId: number;

  test.beforeEach(async ({ page }) => {
    bottleId = await createBottle(page, { name: 'UAT Qty Update', quantity: 3 });
  });

  test.afterEach(async ({ page }) => {
    await deleteBottle(page, bottleId);
  });

  test('changing quantity and saving redirects to / and shows updated count', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await page.waitForSelector('#edit-quantity', { timeout: 15000 });
    await page.fill('#edit-quantity', '2');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    const row = page.locator('a.bottle-row').filter({ hasText: 'UAT Qty Update' });
    await expect(row.locator('.bottle-meta')).toContainText('Qty: 2');
  });

  test('quantity can be set to 0', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await page.waitForSelector('#edit-quantity', { timeout: 15000 });
    await page.fill('#edit-quantity', '0');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // Verify via API
    const res = await page.request.get(`/api/bottles/${bottleId}`);
    const bottle = await res.json();
    expect(bottle.quantity).toBe(0);
  });
});

test.describe('US-2.3: Update Any Bottle Field', () => {
  let bottleId: number;

  test.beforeEach(async ({ page }) => {
    bottleId = await createBottle(page, { name: 'UAT Field Update', location: 'Old Location' });
  });

  test.afterEach(async ({ page }) => {
    await deleteBottle(page, bottleId);
  });

  test('changing name and saving reflects in list', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await page.waitForSelector('#edit-name', { timeout: 15000 });
    await page.fill('#edit-name', 'UAT Renamed Bottle');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    await expect(page.locator('a.bottle-row').filter({ hasText: 'UAT Renamed Bottle' })).toBeVisible();
    // Rename back for cleanup to work
    await page.request.put(`/api/bottles/${bottleId}`, { data: { name: 'UAT Field Update', quantity: 1 } });
  });

  test('changing location and saving reflects in list', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await page.waitForSelector('#edit-location', { timeout: 15000 });
    await page.fill('#edit-location', 'New Location XYZ');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    const row = page.locator('a.bottle-row').filter({ hasText: 'UAT Field Update' });
    await expect(row.locator('.bottle-meta')).toContainText('New Location XYZ');
  });

  test('values persist across page reload', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await page.waitForSelector('#edit-location', { timeout: 15000 });
    await page.fill('#edit-location', 'Persist Test Location');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    // Reload the page
    await page.reload();
    const row = page.locator('a.bottle-row').filter({ hasText: 'UAT Field Update' });
    await expect(row.locator('.bottle-meta')).toContainText('Persist Test Location');
  });
});

test.describe('US-2.4: Prevented from Saving Without a Name', () => {
  let bottleId: number;

  test.beforeEach(async ({ page }) => {
    bottleId = await createBottle(page, { name: 'UAT Edit Name Required' });
  });

  test.afterEach(async ({ page }) => {
    await deleteBottle(page, bottleId);
  });

  test('clearing name and saving shows "Name is required"', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await page.waitForSelector('#edit-name', { timeout: 15000 });
    await page.fill('#edit-name', '');
    await page.fill('#edit-vintage', '2022');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Name is required')).toBeVisible();
  });

  test('other field values preserved after failed validation', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await page.waitForSelector('#edit-name', { timeout: 15000 });
    await page.fill('#edit-name', '');
    await page.fill('#edit-vintage', '2022');
    await page.click('button[type="submit"]');
    // Vintage should still be 2022
    await expect(page.locator('#edit-vintage')).toHaveValue('2022');
  });
});

test.describe('US-2.5: Cancel Editing a Bottle', () => {
  let bottleId: number;

  test.beforeEach(async ({ page }) => {
    bottleId = await createBottle(page, { name: 'UAT Cancel Edit' });
  });

  test.afterEach(async ({ page }) => {
    await deleteBottle(page, bottleId);
  });

  test('"Cancel" link is visible on edit page', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    // Wait for form to load
    await page.waitForSelector('#edit-name', { timeout: 15000 });
    await expect(page.locator('a', { hasText: 'Cancel' })).toBeVisible();
  });

  test('clicking Cancel navigates to / without saving changes', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await page.waitForSelector('#edit-name', { timeout: 15000 });
    await page.fill('#edit-name', 'Should Not Save');
    await page.locator('a', { hasText: 'Cancel' }).click();
    await expect(page).toHaveURL('/');
    // Verify original name is unchanged via API
    const res = await page.request.get(`/api/bottles/${bottleId}`);
    const bottle = await res.json();
    expect(bottle.name).toBe('UAT Cancel Edit');
  });
});

test.describe('US-2.6: Handle Navigation to Non-Existent Bottle', () => {
  test('navigating to /bottles/99999/edit shows "Bottle not found"', async ({ page }) => {
    await page.goto('/bottles/99999/edit');
    // Wait for useEffect to determine not-found state (client-side rendering)
    await expect(page.locator('text=Bottle not found')).toBeVisible({ timeout: 15000 });
  });

  test('not-found page has a link back to /', async ({ page }) => {
    await page.goto('/bottles/99999/edit');
    // Wait for useEffect to run and render not-found state
    await page.waitForSelector('text=Bottle not found', { timeout: 15000 });
    // Multiple links to / may exist (nav + back button), use first()
    const backLink = page.locator('a[href="/"]').first();
    await expect(backLink).toBeVisible();
  });

  test('navigating to /bottles/abc/edit also renders "Bottle not found"', async ({ page }) => {
    await page.goto('/bottles/abc/edit');
    // abc is non-integer — client validates and sets notFound=true immediately
    await expect(page.locator('text=Bottle not found')).toBeVisible({ timeout: 15000 });
  });

  test('no unhandled error or crash screen', async ({ page }) => {
    await page.goto('/bottles/99999/edit');
    // Should not contain Next.js error overlay
    await expect(page.locator('text=Application error')).toHaveCount(0);
    await expect(page.locator('text=Error: ')).toHaveCount(0);
  });
});

// ---------------------------------------------------------------------------
// Epic 3: Delete Bottle (F3)
// ---------------------------------------------------------------------------

test.describe('US-3.1: Delete a Bottle with Confirmation', () => {
  let bottleId: number;

  test.beforeEach(async ({ page }) => {
    bottleId = await createBottle(page, { name: 'UAT Delete Me' });
  });

  test('"Delete" button is visible on edit page', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    // Wait for edit form to load (client-side useEffect)
    await page.waitForSelector('#edit-name', { timeout: 15000 });
    const deleteBtn = page.locator('button', { hasText: 'Delete' });
    await expect(deleteBtn).toBeVisible();
  });

  test('clicking Delete, confirming dialog, redirects to / and removes bottle', async ({ page }) => {
    // Set dialog handler before navigation so it's ready when dialog appears
    page.on('dialog', dialog => dialog.accept());
    await page.goto(`/bottles/${bottleId}/edit`);
    // Wait for edit form to load (client-side useEffect)
    await page.waitForSelector('#edit-name', { timeout: 15000 });
    await page.locator('button', { hasText: 'Delete' }).click();
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Bottle should not appear in list (check by ID via API to avoid name collision)
    const apiRes = await page.request.get(`/api/bottles/${bottleId}`);
    expect(apiRes.status()).toBe(404);
  });

  test('deleted bottle does not reappear on page reload', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await page.goto(`/bottles/${bottleId}/edit`);
    await page.waitForSelector('#edit-name', { timeout: 15000 });
    await page.locator('button', { hasText: 'Delete' }).click();
    await expect(page).toHaveURL('/', { timeout: 10000 });
    await page.reload();
    // Verify via API — bottle should be gone
    const apiRes = await page.request.get(`/api/bottles/${bottleId}`);
    expect(apiRes.status()).toBe(404);
  });
});

test.describe('US-3.2: Cancel Deletion — No Change Made', () => {
  let bottleId: number;

  test.beforeEach(async ({ page }) => {
    bottleId = await createBottle(page, { name: 'UAT Cancel Delete' });
  });

  test.afterEach(async ({ page }) => {
    await deleteBottle(page, bottleId);
  });

  test('cancelling confirm dialog keeps user on edit page', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await page.waitForSelector('#edit-name', { timeout: 15000 });
    page.on('dialog', dialog => dialog.dismiss());
    await page.locator('button', { hasText: 'Delete' }).click();
    await expect(page).toHaveURL(`/bottles/${bottleId}/edit`);
  });

  test('bottle still appears in list after cancelled delete', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await page.waitForSelector('#edit-name', { timeout: 15000 });
    page.on('dialog', dialog => dialog.dismiss());
    await page.locator('button', { hasText: 'Delete' }).click();
    await page.goto('/');
    await expect(page.locator('a.bottle-row').filter({ hasText: 'UAT Cancel Delete' })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Epic 4: Search / Filter by Name (F4)
// ---------------------------------------------------------------------------

test.describe('US-4.1: Search Bottles by Partial Name', () => {
  let id1: number;
  let id2: number;

  test.beforeEach(async ({ page }) => {
    id1 = await createBottle(page, { name: 'UAT-Caymus Cabernet' });
    id2 = await createBottle(page, { name: 'UAT-Rioja Tempranillo' });
  });

  test.afterEach(async ({ page }) => {
    await deleteBottle(page, id1);
    await deleteBottle(page, id2);
  });

  test('search input is visible on /', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('input[type="search"], input[aria-label="Search bottles by name"]')).toBeVisible();
  });

  test('searching for partial name narrows list to matching bottles', async ({ page }) => {
    await page.goto('/');
    // Navigate with ?q= directly to avoid debounce timing issues
    await page.goto('/?q=UAT-Caymus');
    await expect(page.locator('a.bottle-row').filter({ hasText: 'UAT-Caymus Cabernet' })).toBeVisible();
    await expect(page.locator('a.bottle-row').filter({ hasText: 'UAT-Rioja Tempranillo' })).toHaveCount(0);
  });

  test('URL contains ?q=<term> when search is active', async ({ page }) => {
    await page.goto('/?q=UAT-Caymus');
    expect(page.url()).toContain('?q=UAT-Caymus');
  });

  test('search input is pre-populated with current ?q= value on page load', async ({ page }) => {
    await page.goto('/?q=UAT-Caymus');
    const input = page.locator('input[type="search"], input[aria-label="Search bottles by name"]');
    await expect(input).toHaveValue('UAT-Caymus');
  });
});

test.describe('US-4.2: Search Is Case-Insensitive', () => {
  let id1: number;

  test.beforeEach(async ({ page }) => {
    id1 = await createBottle(page, { name: 'UAT-Caymus Special' });
  });

  test.afterEach(async ({ page }) => {
    await deleteBottle(page, id1);
  });

  test('lowercase search returns bottle', async ({ page }) => {
    await page.goto('/?q=uat-caymus');
    await expect(page.locator('a.bottle-row').filter({ hasText: 'UAT-Caymus Special' })).toBeVisible();
  });

  test('uppercase search returns bottle', async ({ page }) => {
    await page.goto('/?q=UAT-CAYMUS');
    await expect(page.locator('a.bottle-row').filter({ hasText: 'UAT-Caymus Special' })).toBeVisible();
  });

  test('mixed-case search returns bottle', async ({ page }) => {
    await page.goto('/?q=UaT-CaYmUs');
    await expect(page.locator('a.bottle-row').filter({ hasText: 'UAT-Caymus Special' })).toBeVisible();
  });
});

test.describe('US-4.3: Search Empty State — No Matching Bottles', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllBottles(page);
    await createBottle(page, { name: 'UAT-SomeOtherWine' });
  });

  test.afterEach(async ({ page }) => {
    await clearAllBottles(page);
  });

  test('shows contextual no-results message containing the search term', async ({ page }) => {
    await page.goto('/?q=uat-rioja-does-not-exist');
    await expect(page.locator('text=uat-rioja-does-not-exist')).toBeVisible();
  });

  test('"Add bottle" button is accessible in search-empty state', async ({ page }) => {
    await page.goto('/?q=uat-rioja-does-not-exist');
    await expect(page.locator('a[href="/bottles/new"]').first()).toBeVisible();
  });
});

test.describe('US-4.4: Clear Search Restores Full List', () => {
  let id1: number;
  let id2: number;

  test.beforeEach(async ({ page }) => {
    id1 = await createBottle(page, { name: 'UAT-Restore-Alpha' });
    id2 = await createBottle(page, { name: 'UAT-Restore-Beta' });
  });

  test.afterEach(async ({ page }) => {
    await deleteBottle(page, id1);
    await deleteBottle(page, id2);
  });

  test('navigating to / without ?q shows full list', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a.bottle-row').filter({ hasText: 'UAT-Restore-Alpha' })).toBeVisible();
    await expect(page.locator('a.bottle-row').filter({ hasText: 'UAT-Restore-Beta' })).toBeVisible();
  });

  test('navigating from /?q= to / removes the filter', async ({ page }) => {
    await page.goto('/?q=UAT-Restore-Alpha');
    await expect(page.locator('a.bottle-row').filter({ hasText: 'UAT-Restore-Beta' })).toHaveCount(0);
    await page.goto('/');
    await expect(page.locator('a.bottle-row').filter({ hasText: 'UAT-Restore-Beta' })).toBeVisible();
  });
});

test.describe('US-4.5: Search State Persists on Page Reload', () => {
  let id1: number;

  test.beforeEach(async ({ page }) => {
    id1 = await createBottle(page, { name: 'UAT-Persist-Caymus' });
  });

  test.afterEach(async ({ page }) => {
    await deleteBottle(page, id1);
  });

  test('loading /?q=UAT-Persist-Caymus shows only matching bottles', async ({ page }) => {
    await page.goto('/?q=UAT-Persist-Caymus');
    await expect(page.locator('a.bottle-row').filter({ hasText: 'UAT-Persist-Caymus' })).toBeVisible();
  });

  test('reloading the page preserves the filtered list', async ({ page }) => {
    await page.goto('/?q=UAT-Persist-Caymus');
    await page.reload();
    await expect(page.locator('a.bottle-row').filter({ hasText: 'UAT-Persist-Caymus' })).toBeVisible();
  });

  test('search input is pre-populated after reload', async ({ page }) => {
    await page.goto('/?q=UAT-Persist-Caymus');
    await page.reload();
    const input = page.locator('input[type="search"], input[aria-label="Search bottles by name"]');
    await expect(input).toHaveValue('UAT-Persist-Caymus');
  });
});

// ---------------------------------------------------------------------------
// Epic 5: REST API (F5)
// ---------------------------------------------------------------------------

test.describe('US-5.1: Health Check Endpoint', () => {
  test('GET /api/health returns 200 with {"status":"ok"}', async ({ page }) => {
    const res = await page.request.get('/api/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: 'ok' });
  });

  test('response Content-Type is application/json', async ({ page }) => {
    const res = await page.request.get('/api/health');
    expect(res.headers()['content-type']).toContain('application/json');
  });

  test('no authentication required', async ({ page }) => {
    const res = await page.request.get('/api/health');
    expect(res.status()).not.toBe(401);
    expect(res.status()).not.toBe(403);
  });
});

test.describe('US-5.2: List All Bottles via API', () => {
  let createdId: number;

  test.beforeEach(async ({ page }) => {
    createdId = await createBottle(page, { name: 'UAT-API-List' });
  });

  test.afterEach(async ({ page }) => {
    await deleteBottle(page, createdId);
  });

  test('GET /api/bottles returns 200 with JSON array', async ({ page }) => {
    const res = await page.request.get('/api/bottles');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('each bottle object has all required fields', async ({ page }) => {
    const res = await page.request.get('/api/bottles');
    const bottles = await res.json() as Array<Record<string, unknown>>;
    const bottle = bottles.find(b => b.id === createdId);
    expect(bottle).toBeDefined();
    expect(bottle).toHaveProperty('id');
    expect(bottle).toHaveProperty('name');
    expect(bottle).toHaveProperty('vintage');
    expect(bottle).toHaveProperty('varietal');
    expect(bottle).toHaveProperty('quantity');
    expect(bottle).toHaveProperty('location');
    expect(bottle).toHaveProperty('created_at');
  });

  test('GET /api/bottles?q=UAT-API-List returns only matching bottles', async ({ page }) => {
    const res = await page.request.get('/api/bottles?q=UAT-API-List');
    const bottles = await res.json() as Array<{ name: string }>;
    expect(bottles.every(b => b.name.toLowerCase().includes('uat-api-list'))).toBe(true);
  });
});

test.describe('US-5.3: Create a Bottle via API', () => {
  let createdId: number;

  test.afterEach(async ({ page }) => {
    if (createdId) await deleteBottle(page, createdId);
  });

  test('POST /api/bottles returns 201 with created object', async ({ page }) => {
    const res = await page.request.post('/api/bottles', {
      data: { name: 'UAT-API-Create', vintage: 2019, varietal: 'Cabernet Sauvignon', quantity: 3, location: 'Rack A3' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(body.created_at).toBeDefined();
    createdId = body.id;
  });

  test('POST /api/bottles missing name returns 422 with error message', async ({ page }) => {
    const res = await page.request.post('/api/bottles', {
      data: { quantity: 1 },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.error).toBe('Name is required');
  });

  test('POST /api/bottles with quantity=0 returns 422', async ({ page }) => {
    const res = await page.request.post('/api/bottles', {
      data: { name: 'UAT-Zero-Qty', quantity: 0 },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.error).toContain('Quantity');
  });
});

test.describe('US-5.4: Fetch Single Bottle via API', () => {
  let bottleId: number;

  test.beforeEach(async ({ page }) => {
    bottleId = await createBottle(page, { name: 'UAT-API-Fetch-Single' });
  });

  test.afterEach(async ({ page }) => {
    await deleteBottle(page, bottleId);
  });

  test('GET /api/bottles/[id] returns 200 with bottle object', async ({ page }) => {
    const res = await page.request.get(`/api/bottles/${bottleId}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(bottleId);
    expect(body.name).toBe('UAT-API-Fetch-Single');
  });

  test('GET /api/bottles/99999 returns 404', async ({ page }) => {
    const res = await page.request.get('/api/bottles/99999');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Not found');
  });

  test('GET /api/bottles/abc returns 404', async ({ page }) => {
    const res = await page.request.get('/api/bottles/abc');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Not found');
  });
});

test.describe('US-5.5: Update a Bottle via API', () => {
  let bottleId: number;

  test.beforeEach(async ({ page }) => {
    bottleId = await createBottle(page, { name: 'UAT-API-Update', quantity: 3 });
  });

  test.afterEach(async ({ page }) => {
    await deleteBottle(page, bottleId);
  });

  test('PUT /api/bottles/[id] returns 200 with updated object', async ({ page }) => {
    const res = await page.request.put(`/api/bottles/${bottleId}`, {
      data: { name: 'UAT-API-Update', quantity: 2 },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.quantity).toBe(2);
  });

  test('PUT allows quantity=0', async ({ page }) => {
    const res = await page.request.put(`/api/bottles/${bottleId}`, {
      data: { name: 'UAT-API-Update', quantity: 0 },
    });
    expect(res.status()).toBe(200);
  });

  test('PUT with quantity=-1 returns 422', async ({ page }) => {
    const res = await page.request.put(`/api/bottles/${bottleId}`, {
      data: { name: 'UAT-API-Update', quantity: -1 },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.error).toContain('Quantity');
  });

  test('PUT /api/bottles/99999 returns 404', async ({ page }) => {
    const res = await page.request.put('/api/bottles/99999', {
      data: { name: 'Does not exist', quantity: 1 },
    });
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Not found');
  });
});

test.describe('US-5.6: Delete a Bottle via API', () => {
  let bottleId: number;

  test.beforeEach(async ({ page }) => {
    bottleId = await createBottle(page, { name: 'UAT-API-Delete' });
  });

  test('DELETE /api/bottles/[id] returns 204 with no body', async ({ page }) => {
    const res = await page.request.delete(`/api/bottles/${bottleId}`);
    expect(res.status()).toBe(204);
    const body = await res.text();
    expect(body).toBe('');
    bottleId = 0; // already deleted
  });

  test('deleted bottle no longer appears in GET /api/bottles', async ({ page }) => {
    await page.request.delete(`/api/bottles/${bottleId}`);
    const res = await page.request.get('/api/bottles');
    const bottles = await res.json() as Array<{ id: number }>;
    expect(bottles.find(b => b.id === bottleId)).toBeUndefined();
    bottleId = 0;
  });

  test('DELETE /api/bottles/99999 returns 404', async ({ page }) => {
    const res = await page.request.delete('/api/bottles/99999');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Not found');
  });
});

// ---------------------------------------------------------------------------
// Epic 6: Database Auto-Migration (F6)
// ---------------------------------------------------------------------------

test.describe('US-6.1: Bottles Table Created Automatically on First Start', () => {
  test('POST /api/bottles succeeds (table exists)', async ({ page }) => {
    const res = await page.request.post('/api/bottles', {
      data: { name: 'UAT-Migration-Check', quantity: 1 },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    await deleteBottle(page, body.id);
  });
});

test.describe('US-6.2: Migration Is Idempotent', () => {
  test('API works correctly after multiple potential migrations (data intact)', async ({ page }) => {
    const id = await createBottle(page, { name: 'UAT-Idempotent-Test' });
    const res = await page.request.get(`/api/bottles/${id}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.name).toBe('UAT-Idempotent-Test');
    await deleteBottle(page, id);
  });
});

test.describe('US-6.4: Data Persists Across Server Restarts / Page Reloads', () => {
  let bottleId: number;

  test.beforeEach(async ({ page }) => {
    bottleId = await createBottle(page, { name: 'UAT-Persist-Reload' });
  });

  test.afterEach(async ({ page }) => {
    await deleteBottle(page, bottleId);
  });

  test('added bottle appears after page reload', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a.bottle-row').filter({ hasText: 'UAT-Persist-Reload' })).toBeVisible();
    await page.reload();
    await expect(page.locator('a.bottle-row').filter({ hasText: 'UAT-Persist-Reload' })).toBeVisible();
  });

  test('navigating away and back preserves bottle in list', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a.bottle-row').filter({ hasText: 'UAT-Persist-Reload' })).toBeVisible();
    await page.goto('/bottles/new');
    await page.goto('/');
    await expect(page.locator('a.bottle-row').filter({ hasText: 'UAT-Persist-Reload' })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Epic 7: Brand & Mobile-First UI (F7)
// ---------------------------------------------------------------------------

test.describe('US-7.1: App Is Fully Usable on 375px Mobile Screen', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('home page renders without horizontal scroll at 375px', async ({ page }) => {
    await page.goto('/');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
  });

  test('add bottle page renders without horizontal scroll at 375px', async ({ page }) => {
    await page.goto('/bottles/new');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });
});

test.describe('US-7.2: App Is Readable on Desktop at 1440px', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('home page renders without horizontal scroll at 1440px', async ({ page }) => {
    await page.goto('/');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });
});

test.describe('US-7.3: Primary Buttons Use Gold Accent Color', () => {
  test('submit button on add-bottle form uses gold color', async ({ page }) => {
    await page.goto('/bottles/new');
    const submitBtn = page.locator('button[type="submit"]');
    const bg = await submitBtn.evaluate(el => getComputedStyle(el).backgroundColor);
    // #FBCA5C in rgb is rgb(251, 202, 92)
    expect(bg).toContain('251');
    expect(bg).toContain('202');
  });
});

test.describe('US-7.4: All Form Inputs Have Visible Labels', () => {
  test('all inputs on /bottles/new have visible labels', async ({ page }) => {
    await page.goto('/bottles/new');
    for (const fieldId of ['name', 'vintage', 'varietal', 'quantity', 'location']) {
      await expect(page.locator(`label[for="${fieldId}"]`)).toBeVisible();
    }
  });

  test('all inputs on edit page have visible labels', async ({ page }) => {
    const bottleId = await createBottle(page, { name: 'UAT-Label-Test' });
    await page.goto(`/bottles/${bottleId}/edit`);
    // Wait for client-side useEffect to fetch and render the form (IDs use edit- prefix)
    await page.waitForSelector('label[for="edit-name"]', { timeout: 15000 });
    for (const fieldId of ['edit-name', 'edit-vintage', 'edit-varietal', 'edit-quantity', 'edit-location']) {
      await expect(page.locator(`label[for="${fieldId}"]`)).toBeVisible();
    }
    await deleteBottle(page, bottleId);
  });
});

test.describe('US-7.5: App Loads Inside an Iframe Without Being Blocked', () => {
  test('response headers do not include X-Frame-Options: DENY', async ({ page }) => {
    const res = await page.request.get('/');
    const xfo = res.headers()['x-frame-options'] ?? '';
    expect(xfo.toUpperCase()).not.toBe('DENY');
  });

  test('response headers do not block framing with frame-ancestors none', async ({ page }) => {
    const res = await page.request.get('/');
    const csp = res.headers()['content-security-policy'] ?? '';
    expect(csp.toLowerCase()).not.toContain("frame-ancestors 'none'");
  });
});
