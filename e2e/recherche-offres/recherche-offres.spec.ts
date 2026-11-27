import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Lucas Dupont', exact: true }).click();
  await page.getByRole('navigation', { name: 'Navigation principale' })
    .getByRole('link', { name: 'Offres', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Offres de stage' })).toBeVisible();
  await expect(page.getByText('4 offres', { exact: true })).toBeVisible();
});

test('Scénario 1 — recherche insensible à la casse et aux espaces, limitée aux offres publiées', async ({ page }) => {
  await page.getByRole('searchbox', { name: 'Rechercher par titre' }).fill('  APPLICATION  ');

  await expect(page.getByText('1 offre', { exact: true })).toBeVisible();
  const table = page.getByRole('table');
  await expect(table.getByRole('row')).toHaveCount(2);
  const offer = table.getByRole('row').filter({ hasText: 'Application React de gestion de flotte' });
  await expect(offer).toBeVisible();
  await expect(offer.getByRole('cell', { name: 'Publiée', exact: true })).toBeVisible();
  await expect(page.getByText("Migration d'une application vers le cloud", { exact: true })).toHaveCount(0);
});

test('Scénario 2 — aucune offre visible, puis retour des offres publiées', async ({ page }) => {
  const search = page.getByRole('searchbox', { name: 'Rechercher par titre' });
  await search.fill('portail');

  await expect(page.getByText('Aucune offre ne correspond à la recherche.', { exact: true })).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
  await expect(page.getByText('Refonte du portail client', { exact: true })).toHaveCount(0);

  await search.clear();
  await expect(page.getByText('4 offres', { exact: true })).toBeVisible();
  const table = page.getByRole('table');
  await expect(table.getByRole('row')).toHaveCount(5);
  await expect(table.getByRole('cell', { name: 'Application React de gestion de flotte', exact: true })).toBeVisible();
  await expect(table.getByRole('cell', { name: 'API REST de facturation', exact: true })).toBeVisible();
  await expect(table.getByRole('cell', { name: 'Tableau de bord de qualité des données', exact: true })).toBeVisible();
  await expect(table.getByRole('cell', { name: 'Assistant conversationnel interne', exact: true })).toBeVisible();
});
