import { games, type Game } from './gaming-collection';
import type { Product } from './model';

export const shopPath = '/shop';
const cardPrefix = 'shop-card-';

export type ShopFilters = {
  collection?:string; newOnly?:boolean;
  search: string;
  category: string;
  game: Game | '';
  sort: 'price' | 'price-desc' | 'name' | 'order';
  affordableOnly: boolean;
  favoritesOnly: boolean;
};

export const defaultShopFilters: ShopFilters = {
  search: '', category: '', game: '', sort: 'price', affordableOnly: false, favoritesOnly: false,
};

export function matchesShopFilters(product: Product, filters: ShopFilters, balance: number, favorites: ReadonlySet<string> | null) {
  if (filters.affordableOnly && product.price > balance) return false;
  if (filters.favoritesOnly && !favorites?.has(product.id)) return false;
  if (filters.category === 'new') return !!product.collection;
  if (filters.category === 'gaming') return product.collection === 'gaming' && (!filters.game || product.game === filters.game);
  return !filters.category || product.category === filters.category;
}

export function shopProductPath(id: string) {
  return `${shopPath}/${encodeURIComponent(id)}`;
}

export function readShopFilters(params: URLSearchParams): ShopFilters {
  const category = params.get('category') ?? '';
  const sort = params.get('sort');
  return {
    search: params.get('q') ?? '',
    category,
    ...(params.get('collection')?{collection:params.get('collection')!}:{}),
    ...(params.get('new')==='1'?{newOnly:true}:{}),
    game: category === 'gaming' || params.get('collection')==='gaming' ? games.find(game => game === params.get('game')) ?? '' : '',
    sort: sort === 'order' || sort === 'name' || sort === 'price-desc' ? sort : 'price',
    affordableOnly: params.get('affordable') === '1',
    favoritesOnly: params.get('favorites') === '1',
  };
}

export function shopCardId(productId: string) {
  return cardPrefix + encodeURIComponent(productId);
}

export function shopCardTarget(hash: string) {
  try {
    const target = decodeURIComponent(hash.slice(1));
    return target.startsWith(cardPrefix) ? target : undefined;
  } catch {
    return undefined;
  }
}

export function shopHref(filters: ShopFilters, productId?: string, returnTo?: string) {
  const params = new URLSearchParams();
  if (filters.search) params.set('q', filters.search);
  if (filters.category) params.set('category', filters.category);
  if(filters.collection)params.set('collection',filters.collection);
  if(filters.newOnly)params.set('new','1');
  if ((filters.collection==='gaming'||filters.category === 'gaming') && filters.game) params.set('game', filters.game);
  if (filters.sort !== 'price') params.set('sort', filters.sort);
  if (filters.affordableOnly) params.set('affordable', '1');
  if (filters.favoritesOnly) params.set('favorites', '1');
  const path = productId === undefined ? shopPath : shopProductPath(productId);
  const hash = productId === undefined && returnTo !== undefined ? `#${encodeURIComponent(shopCardId(returnTo))}` : '';
  return path + (params.size ? `?${params}` : '') + hash;
}

export function isShopPath(path: string) {
  return path === shopPath || /^\/shop\/(?:[\w.!~*'():-]|%[\da-f]{2})+$/i.test(path);
}

export function shopProductId(path: string) {
  if (path === shopPath || !isShopPath(path)) return undefined;
  try {
    return decodeURIComponent(path.slice(shopPath.length + 1));
  } catch {
    return undefined;
  }
}
