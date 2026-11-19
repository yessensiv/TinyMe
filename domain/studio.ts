import { catalog as demo } from '../config/demo';
import { catalog, type Product } from './model';
import { parseWorkshop, type WorkshopItem } from './workshop';
import { workshopProduct, workshopStorageKey, workshopCatalogEvent } from './workshop-catalog';
import { shopDescriptions } from './shop-content';

export type Group = { id: string; slug: string; name: string; order: number; isVisible: boolean };
export type Category = Group & { icon: string; color: string };
export type Collection = Group & { description: string; cover: string; startsAt: string; endsAt: string };
export type Item = Omit<Product, 'category' | 'collection' | 'image'> & {
  categoryId: string;
  collectionId: string | null;
  collectionOrder?: number;
  description: string;
  images: string[];
  tags: string[];
  isNew: boolean;
  recommended: boolean;
  limited: boolean;
  isPublished: boolean;
  isArchived: boolean;
  createdAt: string;
  order: number;
};
export type Discount = { target: string; percent: number; startsAt: string; endsAt: string };
export type Settings = {
  startingCoins: number;
  reward: number;
  showNew: boolean;
  newDays: number;
  discounts: Discount[];
  blocks: string[];
};
export type Studio = {
  version: 2;
  categories: Category[];
  collections: Collection[];
  items: Item[];
  settings: Settings;
  history: { actor: string; action: string; at: string }[];
  playlists: { id: string; name: string; cover: string; order: number }[];
};
export const studioKey = 'tinyme:workshop:v2';
export function groupBase(id: string, name: string, order: number): Group {
  return { id, slug: id, name, order, isVisible: true };
}
export const makeCollection = (id: string, name: string, order: number): Collection => ({
  ...groupBase(id, name, order),
  description: '',
  cover: '',
  startsAt: '',
  endsAt: '',
});
export function migrateStudio(raw: string | null): Studio {
  const legacy = raw ? parseWorkshop(raw) : { items: demo as WorkshopItem[], collections: [] };
  const categories: Category[] = [];
  const collections: Collection[] = [
    makeCollection('gaming', 'Игровая коллекция', 0),
    makeCollection('quiet-evening', 'Тихий вечер', 1),
  ];
  const groupIds = new Map<string, string>();
  for (const group of legacy.collections) {
    let id = group.id;
    while (collections.some((c) => c.id === id)) id = 'legacy-' + id;
    groupIds.set(group.id, id);
    collections.push({
      ...makeCollection(id, group.title, collections.length),
      description: group.description,
    });
  }
  function convert(p: Product, index: number): Item {
    const { category, collection, image, ...product } = p;
    const name = category === 'Освещение' ? 'Свет' : category;
    let group = categories.find((c) => c.name === name);
    if (!group) {
      const id = 'category-' + encodeURIComponent(name);
      group = { ...groupBase(id, name, categories.length), icon: '◆', color: '#eeb592' };
      categories.push(group);
    }
    return {
      ...product,
      categoryId: group.id,
      collectionId: collection ?? null,
      description: shopDescriptions[p.id] ?? '',
      images: image ? [image] : [],
      tags: [],
      isNew: false,
      recommended: false,
      limited: false,
      isPublished: true,
      isArchived: false,
      createdAt: '',
      order: index,
    };
  }
  const items = catalog.map(convert);
  for (const old of legacy.items) {
    const item = convert(workshopProduct(old), items.length);
    items.push({
      ...item,
      description: old.description ?? '',
      images: old.images ?? [],
      isPublished: old.purchasable,
      collectionId: old.collectionId ? (groupIds.get(old.collectionId) ?? null) : null,
    });
  }
  return {
    version: 2,
    categories,
    collections,
    items,
    history: [],
    playlists: [],
    settings: {
      startingCoins: 0,
      reward: 1,
      showNew: true,
      newDays: 14,
      discounts: [],
      blocks: ['Каталог', 'Коллекции', 'Новинки'],
    },
  };
}
export function readStudio(storage: Pick<Storage, 'getItem'>): Studio {
  const raw = storage.getItem(studioKey);
  if (!raw) return migrateStudio(storage.getItem(workshopStorageKey));
  const data = JSON.parse(raw) as Studio;
  if (
    data.version !== 2 ||
    !Array.isArray(data.items) ||
    !Array.isArray(data.categories) ||
    !Array.isArray(data.collections)
  )
    throw Error('Повреждён каталог мастерской');
  return data;
}
export function dated(start: string, end: string, today: string) {
  return (!start || start <= today) && (!end || end >= today);
}
export function studioProducts(s: Studio, publicOnly = true, now = new Date()) {
  const today = now.toLocaleDateString('sv-SE');
  return s.items.flatMap((i) => {
    const category = s.categories.find((c) => c.id === i.categoryId);
    const group = s.collections.find((c) => c.id === i.collectionId);
    if (
      publicOnly &&
      (!i.isPublished ||
        i.isArchived ||
        !category?.isVisible ||
        (group && (!group.isVisible || !dated(group.startsAt, group.endsAt, today))))
    )
      return [];
    const target = ['all', 'item:' + i.id, 'category:' + i.categoryId, 'collection:' + i.collectionId];
    const percent = Math.max(
      0,
      ...s.settings.discounts
        .filter((d) => target.includes(d.target) && dated(d.startsAt, d.endsAt, today))
        .map((d) => d.percent),
    );
    const fresh = i.createdAt && now.getTime() - Date.parse(i.createdAt) < s.settings.newDays * 86400000;
    return [
      {
        ...i,
        category: category?.name ?? 'Без категории',
        collection:
          i.collectionId === 'gaming'
            ? ('gaming' as const)
            : i.collectionId === 'quiet-evening'
              ? ('quiet-evening' as const)
              : undefined,
        collectionTitle: group?.name,
        image: i.images[0],
        price: percent ? Math.max(1, Math.round(i.price * (1 - percent / 100))) : i.price,
        oldPrice: percent ? i.price : undefined,
        isNew: s.settings.showNew && Boolean(i.isNew || fresh),
      },
    ];
  });
}
export async function editStudio(actor: string, action: string, change: (s: Studio) => void) {
  function save() {
    const s = readStudio(localStorage);
    change(s);
    s.history.unshift({ actor, action, at: new Date().toISOString() });
    localStorage.setItem(studioKey, JSON.stringify(s));
    window.dispatchEvent(new Event(workshopCatalogEvent));
  }
  if (navigator.locks) await navigator.locks.request(studioKey, save);
  else save();
}
export function removeGroup(s: Studio, type: 'categories' | 'collections', id: string, replacement: string) {
  const key = type === 'categories' ? 'categoryId' : 'collectionId';
  const used = s.items.filter((i) => i[key] === id);
  if (used.length && (!replacement || replacement === id || !s[type].some((g) => g.id === replacement)))
    throw Error('Выбери другую группу для переноса вещей.');
  used.forEach((i) => {
    i[key] = replacement;
  });
  if (type === 'categories') s.categories = s.categories.filter((g) => g.id !== id);
  else s.collections = s.collections.filter((g) => g.id !== id);
}
