// Демонстрационные данные UI первой недели, без сохранения и экономики.
export type ItemKind = "plant" | "lamp" | "shelf" | "armchair" | "sofa" | "sculpture" | "bed" | "desk" | "chair";
export interface CatalogItem {
  id: string;
  title: string;
  category: string;
  width: number;
  depth: number;
  price: number;
  purchasable: boolean;
  illustration: ItemKind;
  color: string;
}
export const catalog: CatalogItem[] = [
  { id: "plant-small", title: "Растение", category: "Растения", width: 1, depth: 1, price: 5, purchasable: true, illustration: "plant", color: "#edf1e6" },
  { id: "lamp-floor", title: "Торшер", category: "Освещение", width: 1, depth: 1, price: 10, purchasable: true, illustration: "lamp", color: "#f6efdf" },
  { id: "shelf-low", title: "Низкий стеллаж", category: "Мебель", width: 2, depth: 1, price: 20, purchasable: true, illustration: "shelf", color: "#eee9e2" },
  { id: "armchair", title: "Кресло", category: "Мебель", width: 2, depth: 2, price: 30, purchasable: true, illustration: "armchair", color: "#e9ede5" },
  { id: "sofa", title: "Диван", category: "Мебель", width: 3, depth: 2, price: 60, purchasable: true, illustration: "sofa", color: "#ece9f0" },
  { id: "sculpture", title: "Декоративная фигурка", category: "Декор", width: 1, depth: 1, price: 15, purchasable: true, illustration: "sculpture", color: "#f3e9e2" },
  { id: "bed", title: "Кровать", category: "Мебель", width: 3, depth: 2, price: 0, purchasable: false, illustration: "bed", color: "#e9ede5" },
  { id: "desk", title: "Стол", category: "Мебель", width: 2, depth: 1, price: 0, purchasable: false, illustration: "desk", color: "#eee9e2" },
  { id: "chair", title: "Стул", category: "Мебель", width: 1, depth: 1, price: 0, purchasable: false, illustration: "chair", color: "#f6efdf" },
];
export const demoInventory = [
  { id: "starter-bed", catalogId: "bed", source: "starter" },
  { id: "starter-desk", catalogId: "desk", source: "starter" },
  { id: "starter-chair", catalogId: "chair", source: "starter" },
  { id: "demo-plant", catalogId: "plant-small", source: "purchase" },
  { id: "demo-lamp", catalogId: "lamp-floor", source: "purchase" },
  { id: "demo-sculpture", catalogId: "sculpture", source: "purchase" },
] as const;
export const demoRoom = {
  width: 12, depth: 8,
  placements: [
    { inventoryItemId: "starter-bed", x: 1, y: 1 },
    { inventoryItemId: "starter-desk", x: 8, y: 1 },
    { inventoryItemId: "starter-chair", x: 8, y: 3 },
    { inventoryItemId: "demo-plant", x: 10, y: 1 },
  ],
};
export const demoActivity = { balance: 42, session: "14:36", total: "1 ч 12 мин", secondsToCoin: 24 };
export const categories = ["Мебель", "Растения", "Освещение", "Декор"];
