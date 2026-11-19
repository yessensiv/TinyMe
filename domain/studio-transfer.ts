import { catalog } from './model';
import { validWorkshopImage } from './workshop';
import type { Studio } from './studio';
export type Transfer = Pick<Studio, 'version' | 'items' | 'categories' | 'collections'>;
export function exportCatalog(s: Studio, csv = false) {
  const data: Transfer = { version: 2, categories: s.categories, collections: s.collections, items: s.items };
  if (!csv) return JSON.stringify(data, null, 2);
  const lines = ['тип,данные'];
  for (const type of ['categories', 'collections', 'items'] as const)
    for (const row of data[type]) lines.push(type + ',"' + JSON.stringify(row).replaceAll('"', '""') + '"');
  return lines.join('\r\n');
}
export function importCatalog(raw: string, csv = false): Transfer {
  let data: Transfer;
  if (csv) {
    data = { version: 2, categories: [], collections: [], items: [] };
    const [header, ...lines] = raw
      .replace(/^\uFEFF/, '')
      .trimEnd()
      .split(/\r?\n/);
    if (header !== 'тип,данные') throw Error('Неверный заголовок CSV.');
    for (const line of lines) {
      const match = /^(categories|collections|items),"(.*)"$/.exec(line);
      if (!match) throw Error('Повреждена строка CSV.');
      data[match[1] as 'items'].push(JSON.parse(match[2].replaceAll('""', '"')));
    }
  } else data = JSON.parse(raw);
  if (!data || data.version !== 2) throw Error('Нужен каталог версии 2.');
  for (const type of ['categories', 'collections', 'items'] as const) {
    if (
      !Array.isArray(data[type]) ||
      data[type].some(
        (x) =>
          !x ||
          typeof x.name !== 'string' ||
          !x.name.trim() ||
          typeof x.id !== 'string' ||
          !x.id ||
          !Number.isFinite(x.order),
      ) ||
      new Set(data[type].map((x) => x.id)).size !== data[type].length
    )
      throw Error('Проверь названия и идентификаторы записей.');
  }
  for (const c of [...data.categories, ...data.collections])
    if (typeof c.slug !== 'string' || !c.slug || typeof c.isVisible !== 'boolean')
      throw Error('Неверные параметры группы.');
  for (const c of data.categories)
    if (!/^#[0-9a-f]{6}$/i.test(c.color) || typeof c.icon !== 'string')
      throw Error('Неверное оформление категории.');
  for (const c of data.collections)
    if (
      typeof c.description !== 'string' ||
      typeof c.startsAt !== 'string' ||
      typeof c.endsAt !== 'string' ||
      (c.cover !== '' && !validWorkshopImage(c.cover))
    )
      throw Error('Неверные параметры коллекции.');
  for (const i of data.items)
    if (
      (!i.id.startsWith('workshop:') && !catalog.some((p) => p.id === i.id)) ||
      !/^#[0-9a-f]{6}$/i.test(i.color) ||
      i.name.length > 100 ||
      typeof i.createdAt !== 'string' ||
      !data.categories.some((c) => c.id === i.categoryId) ||
      (i.collectionId !== null && !data.collections.some((c) => c.id === i.collectionId)) ||
      !Number.isInteger(i.price) ||
      i.price < (i.isPublished ? 1 : 0) ||
      i.price > 1000000 ||
      !Array.isArray(i.images) ||
      i.images.length > 4 ||
      !i.images.every(validWorkshopImage) ||
      !Array.isArray(i.tags) ||
      !i.tags.every((t) => typeof t === 'string') ||
      typeof i.description !== 'string' ||
      typeof i.isPublished !== 'boolean' ||
      typeof i.isArchived !== 'boolean' ||
      !Number.isInteger(i.w) ||
      !Number.isInteger(i.h) ||
      i.w < 1 ||
      i.h < 1 ||
      i.w > 12 ||
      i.h > 8 ||
      !['floor', 'wall', 'rug'].includes(i.surface) ||
      ![
        'desk',
        'chair',
        'bed',
        'lamp',
        'plant',
        'rug',
        'shelf',
        'art',
        'sofa',
        'record',
        'armchair',
        'coffee-table',
        'dresser',
        'ottoman',
        'vase',
        'books',
        'collectible',
      ].includes(i.kind)
    )
      throw Error('Проверь параметры и связи вещи «' + i.name + '».');
  return data;
}
