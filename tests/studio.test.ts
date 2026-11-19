import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalog as legacy } from '../config/demo';
import { migrateStudio, removeGroup, studioProducts } from '../domain/studio';
test('migration preserves workshop ids, images, collections and merges lighting aliases', () => {
  const s = migrateStudio(
    JSON.stringify({
      version: 1,
      items: [{ ...legacy[1], collectionId: 'gaming' }],
      collections: [{ id: 'gaming', title: 'Свой набор', description: '' }],
    }),
  );
  const lamp = s.items.find((i) => i.id === 'workshop:' + legacy[1].id)!;
  const group = s.categories.find((c) => c.id === lamp.categoryId)!;
  assert.equal(group.name, 'Свет');
  assert.equal(s.categories.filter((c) => ['Свет', 'Освещение'].includes(c.name)).length, 1);
  assert.equal(studioProducts(s).find((p) => p.id === lamp.id)?.collectionTitle, 'Свой набор');
  const slug = group.slug;
  group.name = 'Освещение';
  assert.equal(group.slug, slug);
  assert.equal(studioProducts(s).find((p) => p.id === lamp.id)?.category, 'Освещение');
  assert.throws(() => removeGroup(s, 'categories', group.id, ''));
  const target = s.categories.find((c) => c !== group)!;
  removeGroup(s, 'categories', group.id, target.id);
  assert.equal(lamp.categoryId, target.id);
  target.isVisible = false;
  assert.ok(!studioProducts(s).some((p) => p.id === lamp.id));
});
import { exportCatalog, importCatalog } from '../domain/studio-transfer';
import { buyWorkshopProduct } from '../domain/workshop-catalog';
import { initialRoom, productOf } from '../domain/model';
test('transfer formats round-trip non-ASCII names, commas, quotes, images and unpublished starter furniture', () => {
  const studio = migrateStudio(null);
  studio.items[0].description = 'Строка, "один"\nСтрока два';
  for (const csv of [false, true]) {
    const copy = importCatalog(exportCatalog(studio, csv), csv);
    assert.deepEqual(copy.items, studio.items);
    assert.deepEqual(copy.collections, studio.collections);
    assert.deepEqual(copy.categories, studio.categories);
  }
});
test('sale dates, group visibility and archived items agree with the shop purchase price', () => {
  const s = migrateStudio(null);
  const i = s.items.find((i) => i.id.startsWith('workshop:') && i.price === 10)!;
  s.settings.discounts = [
    { target: 'category:' + i.categoryId, percent: 50, startsAt: '2026-10-01', endsAt: '2026-11-20' },
  ];
  const today = new Date('2026-11-19T12:00:00Z'),
    p = studioProducts(s, true, today).find((p) => p.id === i.id)!;
  assert.equal(p.price, 5);
  const bought = buyWorkshopProduct({ ...initialRoom(), balance: 20 }, p, 'owned');
  assert.equal(bought.balance, 15);
  i.isArchived = true;
  assert.ok(!studioProducts(s, true, today).some((p) => p.id === i.id));
  assert.equal(productOf(bought.items.at(-1)!).id, i.id);
  i.isArchived = false;
  assert.equal(studioProducts(s, true, new Date('2026-12-01')).find((p) => p.id === i.id)?.price, 10);
});
