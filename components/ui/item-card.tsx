import { Coin } from "./icon";
import { PixelItem } from "./pixel-item";
import { demoActivity, type CatalogItem } from "@/config/demo";
type Props = { item: CatalogItem; mode: "shop"; owned: number } | { item: CatalogItem; mode: "inventory"; placed: boolean; starter: boolean };
export function ItemCard(props: Props) {
  const { item } = props;
  const shortage = Math.max(0, item.price - demoActivity.balance);
  return <article className="overflow-hidden rounded-2xl border border-line bg-surface">
    <div className="relative flex h-40 items-center justify-center sm:h-44" style={{ backgroundColor: item.color }}><PixelItem kind={item.illustration} className="size-32"/><span className="absolute top-3 right-3 rounded-md bg-white/80 px-2 py-1 text-[10px] font-medium text-muted">{item.width} × {item.depth}</span>{props.mode === "inventory" && <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-forest">{props.placed ? "В комнате" : "В хранилище"}</span>}</div>
    <div className="p-4 sm:p-5"><p className="text-[11px] text-muted">{item.category}</p><h2 className="mt-1 min-h-12 text-sm font-semibold leading-6 sm:text-base">{item.title}</h2>
      {props.mode === "shop" ? <><div className="mt-2 flex flex-wrap items-center justify-between gap-2"><span className="flex items-center gap-2 text-base font-semibold"><Coin/>{item.price}</span><span className="text-xs text-muted">У вас: {props.owned}</span></div><button disabled className="prototype-button mt-4 w-full">{shortage ? `Не хватает ${shortage} монет` : "Купить"}</button></> : <><p className="mt-2 text-xs text-muted">{props.starter ? "Стартовый набор" : "Из магазина"}</p><button disabled className="prototype-button mt-4 w-full">{props.placed ? "Найти в комнате" : "Разместить"}</button></>}
    </div>
  </article>;
}
