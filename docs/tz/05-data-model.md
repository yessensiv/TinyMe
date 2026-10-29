# 5. Модель данных

## Сущности

| Сущность | Поля |
|---|---|
| Profile | id, displayName, createdAt, locale |
| ActivityState | totalActiveMs, accountedMinutes |
| Wallet | balance |
| CatalogItem | id, title, category, price, width, depth, sprite, purchasable |
| InventoryItem | id, catalogId, acquiredAt, source: starter/purchase, purchaseId? |
| Purchase | id, catalogId, inventoryItemId, pricePaid, createdAt |
| Room | id, width: 12, depth: 8, wallThemeId, floorThemeId, placements |
| Placement | inventoryItemId, x, y |
| Preferences | soundEnabled, reducedMotion, onboardingCompleted |
| AppState | schemaVersion, revision, profile, activity, wallet, inventory, purchases, room, preferences |

Каталог и стартовая схема комнаты поставляются с приложением. В сохранении лежат ссылки на каталог; историческая цена покупки хранится отдельно и не меняется при будущей смене цен.

## Правила целостности

- Все ID уникальны; inventoryItemId ссылается на существующую копию.
- Каждая копия ссылается на известный catalogId.
- Покупка и её копия взаимно связаны; для стартовых предметов purchaseId отсутствует.
- У одной покупки ровно одна копия, у одной копии не более одной покупки.
- totalActiveMs — неотрицательное целое число; accountedMinutes = floor(totalActiveMs / 60000).
- Сумма заработанных монет равна accountedMinutes.
- balance = accountedMinutes − сумма pricePaid всех покупок; balance ≥ 0.
- Стартовые предметы не создают расходы и не начисляют монеты.
- Остаток минуты вычисляется как totalActiveMs % 60000 и отдельно не хранится.
- Координаты целые; footprints внутри комнаты и не пересекаются.
- Одна копия встречается в placements не более одного раза.
- «Размещён/свободен» вычисляется из placements, не дублируется в инвентаре.
- revision увеличивается на каждую подтверждённую запись.

## Временные данные

В памяти находятся время текущей сессии, опорная монотонная отметка, статус активности, владелец блокировки, выбранная копия и предпросмотр позиции. Они не восстанавливаются как активный таймер после перезагрузки.

Даты событий — ISO 8601 UTC. Календарное время служит подписям и не участвует в заработке.

## Импорт и миграции

Полный снимок содержит schemaVersion. Валидатор проверяет все инварианты до замены состояния. Поддерживаемые старые схемы последовательно мигрируют. Документ ТЗ 2.0 не задаёт номер схемы хранения: первая реализованная схема начинается с 1. Миграция данных старой концепции XP не требуется: она в репозитории не реализована.
