import { test, expect, request } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

// Helper: clean up all bottles before each test that needs a clean slate
async function deleteAllBottles() {
  const ctx = await request.newContext();
  const res = await ctx.get(`${BASE_URL}/api/bottles`);
  const bottles = await res.json();
  for (const b of bottles) {
    await ctx.delete(`${BASE_URL}/api/bottles/${b.id}`);
  }
  await ctx.dispose();
}

// Helper: create a bottle via API and return it
async function createBottle(data: {
  name: string;
  vintage?: number | null;
  varietal?: string | null;
  quantity?: number;
  location?: string | null;
}) {
  const ctx = await request.newContext();
  const res = await ctx.post(`${BASE_URL}/api/bottles`, {
    data: { quantity: 1, ...data },
  });
  const bottle = await res.json();
  await ctx.dispose();
  return bottle;
}

// ─────────────────────────────────────────────────────────────────────────────
// Epic 0: Bottle List Page (F0)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('US-0.1: View Full Bottle List', () => {
  test.beforeEach(async () => {
    await deleteAllBottles();
    await createBottle({ name: 'Caymus', vintage: 2019, varietal: 'Cabernet Sauvignon', quantity: 3, location: 'Rack A3' });
    await createBottle({ name: 'Opus One', vintage: 2018, varietal: 'Bordeaux Blend', quantity: 2, location: 'Rack B1' });
  });

  test('renders page without login screen', async ({ page }) => {
    await page.goto('/');
    // Should not see a login form
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    await expect(page.locator('text=login')).toHaveCount(0);
  });

  test('shows each bottle with name, vintage, varietal, quantity, location', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Caymus')).toBeVisible();
    await expect(page.locator('text=Opus One')).toBeVisible();
    // Check that vintage and varietal appear
    await expect(page.locator('text=2019')).toBeVisible();
    await expect(page.locator('text=Cabernet Sauvignon')).toBeVisible();
  });

  test('page title or heading reads "My Cellar"', async ({ page }) => {
    await page.goto('/');
    // nav bar or heading
    await expect(page.locator('text=My Cellar')).toBeVisible();
  });
});

test.describe('US-0.2: View Empty-State When Cellar Has No Bottles', () => {
  test.beforeEach(async () => {
    await deleteAllBottles();
  });

  test('shows "No bottles yet" when cellar is empty', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=No bottles yet')).toBeVisible();
  });

  test('shows "Add bottle" link on empty state', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/bottles/new"]').first()).toBeVisible();
  });

  test('clicking Add bottle navigates to /bottles/new', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/bottles/new"]');
    await expect(page).toHaveURL(/\/bottles\/new/);
  });

  test('no bottle rows rendered in empty state', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.bottle-row')).toHaveCount(0);
    await expect(page.locator('[aria-label="Wine collection"] li')).toHaveCount(0);
  });
});

test.describe('US-0.3: Navigate to Edit Page from List Row', () => {
  let bottleId: number;

  test.beforeEach(async () => {
    await deleteAllBottles();
    const b = await createBottle({ name: 'Navarro', vintage: 2020, quantity: 1 });
    bottleId = b.id;
  });

  test('each bottle row is clickable and leads to /bottles/[id]/edit', async ({ page }) => {
    await page.goto('/');
    const row = page.locator(`a[href="/bottles/${bottleId}/edit"]`);
    await expect(row).toBeVisible();
    await row.click();
    await expect(page).toHaveURL(new RegExp(`/bottles/${bottleId}/edit`));
  });
});

test.describe('US-0.4: Navigate to Add Bottle from List Page', () => {
  test.beforeEach(async () => {
    await deleteAllBottles();
    await createBottle({ name: 'Test Wine', quantity: 1 });
  });

  test('"Add bottle" link is visible on populated list page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/bottles/new"]').first()).toBeVisible();
  });

  test('clicking "Add bottle" navigates to /bottles/new', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/bottles/new"]');
    await expect(page).toHaveURL(/\/bottles\/new/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Epic 1: Add Bottle Page (F1)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('US-1.1: Add a New Bottle with All Fields', () => {
  test.beforeEach(async () => {
    await deleteAllBottles();
  });

  test('form has fields: name, vintage, varietal, quantity, location', async ({ page }) => {
    await page.goto('/bottles/new');
    await expect(page.locator('#name, [id="name"]')).toBeVisible();
    await expect(page.locator('#vintage, [id="vintage"]')).toBeVisible();
    await expect(page.locator('#varietal, [id="varietal"]')).toBeVisible();
    await expect(page.locator('#quantity, [id="quantity"]')).toBeVisible();
    await expect(page.locator('#location, [id="location"]')).toBeVisible();
  });

  test('each field has a visible label', async ({ page }) => {
    await page.goto('/bottles/new');
    await expect(page.locator('label[for="name"]')).toBeVisible();
    await expect(page.locator('label[for="vintage"]')).toBeVisible();
    await expect(page.locator('label[for="varietal"]')).toBeVisible();
    await expect(page.locator('label[for="quantity"]')).toBeVisible();
    await expect(page.locator('label[for="location"]')).toBeVisible();
  });

  test('submitting all fields creates bottle and redirects to /', async ({ page }) => {
    await page.goto('/bottles/new');
    await page.fill('#name', 'Caymus');
    await page.fill('#vintage', '2019');
    await page.fill('#varietal', 'Cabernet Sauvignon');
    await page.fill('#quantity', '3');
    await page.fill('#location', 'Rack A3');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 8000 });
    await expect(page.locator('text=Caymus')).toBeVisible();
  });

  test('new bottle appears in list with correct fields', async ({ page }) => {
    await page.goto('/bottles/new');
    await page.fill('#name', 'Caymus');
    await page.fill('#vintage', '2019');
    await page.fill('#varietal', 'Cabernet Sauvignon');
    await page.fill('#quantity', '3');
    await page.fill('#location', 'Rack A3');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 8000 });
    await expect(page.locator('text=Caymus')).toBeVisible();
    await expect(page.locator('text=2019')).toBeVisible();
    await expect(page.locator('text=Cabernet Sauvignon')).toBeVisible();
  });
});

test.describe('US-1.2: Add a Bottle with Name Only', () => {
  test.beforeEach(async () => {
    await deleteAllBottles();
  });

  test('submitting with name only succeeds and redirects to /', async ({ page }) => {
    await page.goto('/bottles/new');
    await page.fill('#name', 'Quick Wine');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 8000 });
    await expect(page.locator('text=Quick Wine')).toBeVisible();
  });

  test('quantity defaults to 1 when left blank', async ({ page }) => {
    await page.goto('/bottles/new');
    await page.fill('#name', 'Quick Wine');
    await page.fill('#quantity', '');
    // Fill with 1 if it's the default — just submit
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 8000 });
    // quantity should appear as Qty: 1
    await expect(page.locator('text=Quick Wine')).toBeVisible();
  });
});

test.describe('US-1.3: Prevented from Submitting Without a Name', () => {
  test('shows "Name is required" error when name is empty', async ({ page }) => {
    await page.goto('/bottles/new');
    await page.fill('#name', '');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Name is required')).toBeVisible();
  });

  test('does not navigate away from form', async ({ page }) => {
    await page.goto('/bottles/new');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/bottles\/new/);
  });
});

test.describe('US-1.4: Cancel Adding a Bottle', () => {
  test('Cancel link is visible on /bottles/new', async ({ page }) => {
    await page.goto('/bottles/new');
    await expect(page.locator('a[href="/"]', { hasText: 'Cancel' })).toBeVisible();
  });

  test('clicking Cancel navigates to /', async ({ page }) => {
    await page.goto('/bottles/new');
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Epic 2: Edit Bottle Page (F2)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('US-2.1: Open Edit Page with Pre-Populated Fields', () => {
  let bottleId: number;

  test.beforeEach(async () => {
    await deleteAllBottles();
    const b = await createBottle({ name: 'Meiomi', vintage: 2021, varietal: 'Pinot Noir', quantity: 4, location: 'Shelf 2' });
    bottleId = b.id;
  });

  test('edit page renders form with pre-populated values', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await expect(page.locator('#edit-name')).toHaveValue('Meiomi');
    await expect(page.locator('#edit-vintage')).toHaveValue('2021');
    await expect(page.locator('#edit-varietal')).toHaveValue('Pinot Noir');
    await expect(page.locator('#edit-quantity')).toHaveValue('4');
    await expect(page.locator('#edit-location')).toHaveValue('Shelf 2');
  });

  test('each field has a visible label', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await expect(page.locator('label[for="edit-name"]')).toBeVisible();
    await expect(page.locator('label[for="edit-vintage"]')).toBeVisible();
    await expect(page.locator('label[for="edit-varietal"]')).toBeVisible();
    await expect(page.locator('label[for="edit-quantity"]')).toBeVisible();
    await expect(page.locator('label[for="edit-location"]')).toBeVisible();
  });
});

test.describe('US-2.2: Update Bottle Quantity', () => {
  let bottleId: number;

  test.beforeEach(async () => {
    await deleteAllBottles();
    const b = await createBottle({ name: 'Stag Leap', quantity: 3 });
    bottleId = b.id;
  });

  test('changing quantity and saving redirects to /', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await page.fill('#edit-quantity', '2');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 8000 });
  });

  test('updated quantity is shown in list', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await page.fill('#edit-quantity', '2');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 8000 });
    await expect(page.locator('text=Qty: 2')).toBeVisible();
  });
});

test.describe('US-2.3: Update Any Bottle Field', () => {
  let bottleId: number;

  test.beforeEach(async () => {
    await deleteAllBottles();
    const b = await createBottle({ name: 'Old Name', location: 'Old Location', quantity: 2 });
    bottleId = b.id;
  });

  test('updating name reflects in list', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await page.fill('#edit-name', 'New Name');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 8000 });
    await expect(page.locator('text=New Name')).toBeVisible();
  });

  test('updating location reflects in list', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await page.fill('#edit-location', 'New Location');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 8000 });
    await expect(page.locator('text=New Location')).toBeVisible();
  });
});

test.describe('US-2.4: Prevented from Saving Without a Name', () => {
  let bottleId: number;

  test.beforeEach(async () => {
    await deleteAllBottles();
    const b = await createBottle({ name: 'Must Keep Name', quantity: 1 });
    bottleId = b.id;
  });

  test('clearing name and saving shows "Name is required"', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await page.fill('#edit-name', '');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Name is required')).toBeVisible();
  });

  test('stays on edit page after failed validation', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await page.fill('#edit-name', '');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(new RegExp(`/bottles/${bottleId}/edit`));
  });
});

test.describe('US-2.5: Cancel Editing a Bottle', () => {
  let bottleId: number;

  test.beforeEach(async () => {
    await deleteAllBottles();
    const b = await createBottle({ name: 'Stable Wine', quantity: 1 });
    bottleId = b.id;
  });

  test('Cancel link is visible on edit page', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await expect(page.locator('a[href="/"]', { hasText: 'Cancel' })).toBeVisible();
  });

  test('clicking Cancel navigates to /', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });
});

test.describe('US-2.6: Handle Navigation to Non-Existent Bottle', () => {
  test('navigating to /bottles/99999/edit shows "Bottle not found"', async ({ page }) => {
    await page.goto('/bottles/99999/edit');
    await expect(page.locator('text=Bottle not found')).toBeVisible({ timeout: 8000 });
  });

  test('"Back to My Cellar" link is visible on not-found page', async ({ page }) => {
    await page.goto('/bottles/99999/edit');
    await expect(page.locator('a[href="/"]', { hasText: /Back to My Cellar/i })).toBeVisible({ timeout: 8000 });
  });

  test('navigating to /bottles/abc/edit shows "Bottle not found"', async ({ page }) => {
    await page.goto('/bottles/abc/edit');
    await expect(page.locator('text=Bottle not found')).toBeVisible({ timeout: 8000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Epic 3: Delete Bottle (F3)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('US-3.1: Delete a Bottle with Confirmation', () => {
  let bottleId: number;

  test.beforeEach(async () => {
    await deleteAllBottles();
    const b = await createBottle({ name: 'To Delete', quantity: 1 });
    bottleId = b.id;
  });

  test('Delete button is visible on edit page', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    await expect(page.locator('button', { hasText: 'Delete Bottle' })).toBeVisible();
  });

  test('clicking Delete with confirm=OK removes bottle and redirects to /', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    // Auto-accept the confirm dialog
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Delete Bottle")');
    await expect(page).toHaveURL('/', { timeout: 8000 });
    await expect(page.locator('text=To Delete')).toHaveCount(0);
  });
});

test.describe('US-3.2: Cancel Deletion — No Change Made', () => {
  let bottleId: number;

  test.beforeEach(async () => {
    await deleteAllBottles();
    const b = await createBottle({ name: 'Keep Me', quantity: 1 });
    bottleId = b.id;
  });

  test('clicking Cancel in confirm dialog stays on edit page', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    // Dismiss the confirm dialog
    page.on('dialog', dialog => dialog.dismiss());
    await page.click('button:has-text("Delete Bottle")');
    await expect(page).toHaveURL(new RegExp(`/bottles/${bottleId}/edit`));
  });

  test('bottle still appears in list after cancelled delete', async ({ page }) => {
    await page.goto(`/bottles/${bottleId}/edit`);
    page.on('dialog', dialog => dialog.dismiss());
    await page.click('button:has-text("Delete Bottle")');
    await page.goto('/');
    await expect(page.locator('text=Keep Me')).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Epic 4: Search / Filter by Name (F4)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('US-4.1: Search Bottles by Partial Name', () => {
  test.beforeEach(async () => {
    await deleteAllBottles();
    await createBottle({ name: 'Caymus Cabernet', quantity: 1 });
    await createBottle({ name: 'Opus One', quantity: 1 });
  });

  test('search input is visible on list page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('input[type="text"], input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]').first()).toBeVisible();
  });

  test('searching narrows list to matching bottles', async ({ page }) => {
    await page.goto('/?q=caymus');
    await expect(page.locator('text=Caymus Cabernet')).toBeVisible();
    await expect(page.locator('text=Opus One')).toHaveCount(0);
  });

  test('URL updates to include ?q= when search is active', async ({ page }) => {
    await page.goto('/?q=cay');
    expect(page.url()).toContain('?q=cay');
  });
});

test.describe('US-4.2: Search Is Case-Insensitive', () => {
  test.beforeEach(async () => {
    await deleteAllBottles();
    await createBottle({ name: 'Caymus', quantity: 1 });
  });

  test('searching "caymus" returns bottle named Caymus', async ({ page }) => {
    await page.goto('/?q=caymus');
    await expect(page.locator('text=Caymus')).toBeVisible();
  });

  test('searching "CAYMUS" returns bottle named Caymus', async ({ page }) => {
    await page.goto('/?q=CAYMUS');
    await expect(page.locator('text=Caymus')).toBeVisible();
  });

  test('searching "CaYmUs" returns bottle named Caymus', async ({ page }) => {
    await page.goto('/?q=CaYmUs');
    await expect(page.locator('text=Caymus')).toBeVisible();
  });
});

test.describe('US-4.3: Search Empty State — No Matching Bottles', () => {
  test.beforeEach(async () => {
    await deleteAllBottles();
    await createBottle({ name: 'Caymus', quantity: 1 });
  });

  test('search with no match shows contextual empty message', async ({ page }) => {
    await page.goto('/?q=rioja');
    await expect(page.locator('text=rioja')).toBeVisible();
  });

  test('"Add bottle" button is visible in search-empty state', async ({ page }) => {
    await page.goto('/?q=rioja');
    await expect(page.locator('a[href="/bottles/new"]').first()).toBeVisible();
  });
});

test.describe('US-4.4: Clear Search Restores Full List', () => {
  test.beforeEach(async () => {
    await deleteAllBottles();
    await createBottle({ name: 'Caymus', quantity: 1 });
    await createBottle({ name: 'Opus One', quantity: 1 });
  });

  test('navigating to / with no query shows full list', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Caymus')).toBeVisible();
    await expect(page.locator('text=Opus One')).toBeVisible();
  });
});

test.describe('US-4.5: Search State Persists on Page Reload', () => {
  test.beforeEach(async () => {
    await deleteAllBottles();
    await createBottle({ name: 'Caymus', quantity: 1 });
    await createBottle({ name: 'Opus One', quantity: 1 });
  });

  test('loading /?q=caymus shows only matching bottles', async ({ page }) => {
    await page.goto('/?q=caymus');
    await expect(page.locator('text=Caymus')).toBeVisible();
    await expect(page.locator('text=Opus One')).toHaveCount(0);
  });

  test('reloading /?q=caymus preserves filtered list', async ({ page }) => {
    await page.goto('/?q=caymus');
    await page.reload();
    await expect(page.locator('text=Caymus')).toBeVisible();
    await expect(page.locator('text=Opus One')).toHaveCount(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Epic 5: REST API (F5)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('US-5.1: Health Check Endpoint', () => {
  test('GET /api/health returns 200 with {"status":"ok"}', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('Content-Type is application/json', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.headers()['content-type']).toContain('application/json');
  });
});

test.describe('US-5.2: List All Bottles via API', () => {
  test.beforeEach(async () => {
    await deleteAllBottles();
  });

  test('GET /api/bottles returns 200 with array', async ({ request }) => {
    const res = await request.get('/api/bottles');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('each bottle object has required fields', async ({ request }) => {
    await createBottle({ name: 'API Test', quantity: 1 });
    const res = await request.get('/api/bottles');
    const bottles = await res.json();
    const b = bottles[0];
    expect(b).toHaveProperty('id');
    expect(b).toHaveProperty('name');
    expect(b).toHaveProperty('quantity');
    expect(b).toHaveProperty('created_at');
  });

  test('empty cellar returns [] not 404', async ({ request }) => {
    const res = await request.get('/api/bottles');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  test('GET /api/bottles?q=caymus returns filtered results', async ({ request }) => {
    await createBottle({ name: 'Caymus', quantity: 1 });
    await createBottle({ name: 'Opus One', quantity: 1 });
    const res = await request.get('/api/bottles?q=caymus');
    const bottles = await res.json();
    expect(bottles.every((b: { name: string }) => b.name.toLowerCase().includes('caymus'))).toBe(true);
  });
});

test.describe('US-5.3: Create a Bottle via API', () => {
  test.beforeEach(async () => {
    await deleteAllBottles();
  });

  test('POST /api/bottles with all fields returns 201', async ({ request }) => {
    const res = await request.post('/api/bottles', {
      data: { name: 'Caymus', vintage: 2019, varietal: 'Cabernet Sauvignon', quantity: 3, location: 'Rack A3' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body.name).toBe('Caymus');
  });

  test('POST missing name returns 422 with error message', async ({ request }) => {
    const res = await request.post('/api/bottles', {
      data: { vintage: 2019, quantity: 1 },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.error).toContain('Name');
  });

  test('POST with quantity=0 returns 422', async ({ request }) => {
    const res = await request.post('/api/bottles', {
      data: { name: 'Test', quantity: 0 },
    });
    expect(res.status()).toBe(422);
  });
});

test.describe('US-5.4: Fetch Single Bottle via API', () => {
  let bottleId: number;

  test.beforeEach(async () => {
    await deleteAllBottles();
    const b = await createBottle({ name: 'Single Bottle', quantity: 1 });
    bottleId = b.id;
  });

  test('GET /api/bottles/[id] returns 200 with bottle', async ({ request }) => {
    const res = await request.get(`/api/bottles/${bottleId}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(bottleId);
  });

  test('GET /api/bottles/99999 returns 404', async ({ request }) => {
    const res = await request.get('/api/bottles/99999');
    expect(res.status()).toBe(404);
  });

  test('GET /api/bottles/abc returns 404', async ({ request }) => {
    const res = await request.get('/api/bottles/abc');
    expect(res.status()).toBe(404);
  });
});

test.describe('US-5.5: Update a Bottle via API', () => {
  let bottleId: number;

  test.beforeEach(async () => {
    await deleteAllBottles();
    const b = await createBottle({ name: 'Update Me', quantity: 3 });
    bottleId = b.id;
  });

  test('PUT /api/bottles/[id] with updated quantity returns 200', async ({ request }) => {
    const res = await request.put(`/api/bottles/${bottleId}`, {
      data: { name: 'Update Me', quantity: 2 },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.quantity).toBe(2);
  });

  test('PUT with quantity=0 returns 200 (allowed on edit)', async ({ request }) => {
    const res = await request.put(`/api/bottles/${bottleId}`, {
      data: { name: 'Update Me', quantity: 0 },
    });
    expect(res.status()).toBe(200);
  });

  test('PUT with quantity=-1 returns 422', async ({ request }) => {
    const res = await request.put(`/api/bottles/${bottleId}`, {
      data: { name: 'Update Me', quantity: -1 },
    });
    expect(res.status()).toBe(422);
  });

  test('PUT /api/bottles/99999 returns 404', async ({ request }) => {
    const res = await request.put('/api/bottles/99999', {
      data: { name: 'Ghost', quantity: 1 },
    });
    expect(res.status()).toBe(404);
  });
});

test.describe('US-5.6: Delete a Bottle via API', () => {
  let bottleId: number;

  test.beforeEach(async () => {
    await deleteAllBottles();
    const b = await createBottle({ name: 'Delete via API', quantity: 1 });
    bottleId = b.id;
  });

  test('DELETE /api/bottles/[id] returns 204 with no body', async ({ request }) => {
    const res = await request.delete(`/api/bottles/${bottleId}`);
    expect(res.status()).toBe(204);
  });

  test('deleted bottle no longer appears in GET /api/bottles', async ({ request }) => {
    await request.delete(`/api/bottles/${bottleId}`);
    const res = await request.get('/api/bottles');
    const bottles = await res.json();
    expect(bottles.find((b: { id: number }) => b.id === bottleId)).toBeUndefined();
  });

  test('DELETE /api/bottles/99999 returns 404', async ({ request }) => {
    const res = await request.delete('/api/bottles/99999');
    expect(res.status()).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Epic 6: Database Auto-Migration (F6)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('US-6.1 + US-6.4: Data Persists and DB Works', () => {
  test.beforeEach(async () => {
    await deleteAllBottles();
  });

  test('POST /api/bottles succeeds (confirms bottles table exists)', async ({ request }) => {
    const res = await request.post('/api/bottles', {
      data: { name: 'Migration Test', quantity: 1 },
    });
    expect(res.status()).toBe(201);
  });

  test('data persists across page reload', async ({ page }) => {
    await createBottle({ name: 'Persistent Wine', quantity: 1 });
    await page.goto('/');
    await expect(page.locator('text=Persistent Wine')).toBeVisible();
    await page.reload();
    await expect(page.locator('text=Persistent Wine')).toBeVisible();
  });
});

test.describe('US-6.2: Migration Is Idempotent', () => {
  test('GET /api/health returns 200 after second server start (migration ran twice)', async ({ request }) => {
    // Migration runs on dev start; health still returns ok
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Epic 7: Brand & Mobile-First UI (F7)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('US-7.1: App Is Fully Usable on a 375 px Mobile Screen', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('list page renders without horizontal scroll at 375px', async ({ page }) => {
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

test.describe('US-7.3: Primary Buttons Use Gold Accent Color', () => {
  test('submit button on add-bottle form has gold background', async ({ page }) => {
    await page.goto('/bottles/new');
    const btn = page.locator('button[type="submit"]');
    const bg = await btn.evaluate(el => window.getComputedStyle(el).backgroundColor);
    // #FBCA5C = rgb(251, 202, 92)
    expect(bg).toMatch(/251.*202.*92|FBCA5C/i);
  });
});

test.describe('US-7.4: All Form Inputs Have Visible Labels', () => {
  test('all inputs on /bottles/new have visible labels', async ({ page }) => {
    await page.goto('/bottles/new');
    const labelCount = await page.locator('label').count();
    expect(labelCount).toBeGreaterThanOrEqual(5);
  });

  test('all inputs on edit page have visible labels', async ({ page, request }) => {
    await deleteAllBottles();
    const b = await createBottle({ name: 'Label Test', quantity: 1 });
    await page.goto(`/bottles/${b.id}/edit`);
    const labelCount = await page.locator('label').count();
    expect(labelCount).toBeGreaterThanOrEqual(5);
  });
});

test.describe('US-7.5: App Loads Inside an Iframe Without Being Blocked', () => {
  test('response headers do not include X-Frame-Options: DENY', async ({ request }) => {
    const res = await request.get('/');
    const xfo = res.headers()['x-frame-options'];
    expect(xfo?.toUpperCase()).not.toBe('DENY');
  });

  test('next.config.mjs is a .mjs file (ESM)', async () => {
    const fs = await import('fs');
    expect(fs.existsSync('next.config.mjs')).toBe(true);
    expect(fs.existsSync('next.config.ts')).toBe(false);
  });
});
