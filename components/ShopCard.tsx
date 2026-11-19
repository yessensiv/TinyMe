import type { ReactNode } from 'react';
import { Coins } from 'lucide-react';
import type { Product } from '@/domain/model';
import FurniturePreview from './FurniturePreview';

type CardProduct = Product & {
  collectionTitle?: string;
  isNew?: boolean;
  recommended?: boolean;
  limited?: boolean;
  oldPrice?: number;
};
export default function ShopCard({
  product,
  title,
  favorite,
  purchase,
  owned,
}: {
  product: CardProduct;
  title?: ReactNode;
  favorite?: ReactNode;
  purchase?: ReactNode;
  owned?: number;
}) {
  return (
    <article className="product-card">
      <div className="product-image">
        <div className="shop-card-preview" aria-hidden="true">
          <FurniturePreview product={product} />
        </div>
        {favorite}
        <span className="size-badge tabular-nums">
          {product.w} × {product.h}
        </span>
      </div>
      <div className="shop-taxonomy">
        <span>{product.category}</span>
        {product.collectionTitle && <span>{product.collectionTitle}</span>}
        {product.isNew && <span>Новинка</span>}
        {product.recommended && <span>Рекомендуем</span>}
        {product.limited && <span>Лимитированная</span>}
      </div>
      <h2>{title ?? product.name}</h2>
      {owned !== undefined && <small className="owned-count tabular-nums">У тебя: {owned} шт.</small>}
      <div className="product-bottom tabular-nums">
        <span>
          <Coins size={16} aria-label="Монет" />
          {product.oldPrice && <del>{product.oldPrice}</del>} {product.price}
        </span>
        {purchase}
      </div>
    </article>
  );
}
