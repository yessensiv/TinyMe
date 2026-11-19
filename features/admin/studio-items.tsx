'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { browserId } from '@/lib/browser-id';
import { prepareWorkshopImage } from '@/lib/workshop-image';
import FurniturePreview from '@/components/FurniturePreview';
import ShopCard from '@/components/ShopCard';
import { studioProducts, type Item, type Studio } from '@/domain/studio';
import type { Save } from './studio-groups';
import { ConfirmDialog, Drawer, EmptyState, FileDropzone } from './studio-ui';
import { ActionMenu, Button, Input, Select, DataTable, Badge } from './studio-controls';
import css from './studio.module.css';
const shapes = {
  desk: 'Стол',
  chair: 'Стул',
  bed: 'Кровать',
  lamp: 'Светильник',
  plant: 'Растение',
  rug: 'Ковёр',
  shelf: 'Полка',
  art: 'Картина',
  sofa: 'Диван',
  record: 'Пластинка',
  armchair: 'Кресло',
  'coffee-table': 'Журнальный стол',
  dresser: 'Комод',
  ottoman: 'Пуф',
  vase: 'Ваза',
  books: 'Книги',
  collectible: 'Фигурка',
};
function ItemEditor({
  data,
  initial,
  save,
  close,
}: {
  data: Studio;
  initial: Item;
  save: Save;
  close: () => void;
}) {
  const existing = data.items.some((i) => i.id === initial.id);
  const key = 'tinyme:studio:draft:' + (existing ? initial.id : 'new');
  const [item, set] = useState<Item>(() => {
    try {
      return { ...initial, ...JSON.parse(sessionStorage.getItem(key) ?? '{}'), id: initial.id };
    } catch {
      return initial;
    }
  });
  const dirty = JSON.stringify(item) !== JSON.stringify(initial);
  const [warning, setWarning] = useState('');
  useEffect(() => {
    if (!dirty) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(item));
    } catch {
      queueMicrotask(() => setWarning('Для черновика не хватает места. Сохрани изменения вручную.'));
    }
    const before = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', before);
    return () => window.removeEventListener('beforeunload', before);
  }, [item, dirty, key]);
  function cancel() {
    if (!dirty || confirm('Закрыть редактор? Черновик останется в этом браузере.')) close();
  }
  const field = <K extends keyof Item>(key: K, value: Item[K]) =>
    set((old) => ({ ...old, [key]: value }));
  return (
    <Drawer title={existing ? 'Редактирование вещи' : 'Новая вещь'} close={cancel}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!item.name.trim() || !item.categoryId || item.price <= 0) {
            setWarning('Укажи название, категорию и положительную цену.');
            return;
          }
          if (
            await save('Сохранена вещь «' + item.name + '»', (s) => {
              if (
                !s.categories.some((c) => c.id === item.categoryId) ||
                (item.collectionId && !s.collections.some((c) => c.id === item.collectionId))
              )
                throw Error('Группа изменилась. Выбери другую.');
              const before = s.items.findIndex((i) => i.id === item.id);
              if (before < 0) s.items.push(item);
              else s.items[before] = item;
            })
          ) {
            sessionStorage.removeItem(key);
            close();
          }
        }}
      >
        <fieldset>
          <legend>Основное</legend>
          <label>
            Название
            <Input
              autoFocus
              required
              maxLength={100}
              value={item.name}
              onChange={(e) => field('name', e.target.value)}
            />
          </label>
          <label>
            Описание
            <textarea value={item.description} onChange={(e) => field('description', e.target.value)} />
          </label>
          <label>
            Категория
            <Select
              required
              value={item.categoryId}
              onChange={(e) => field('categoryId', e.target.value)}
            >
              <option value="">Выбрать</option>
              {data.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </label>
          <label>
            Коллекция
            <Select
              value={item.collectionId ?? ''}
              onChange={(e) => field('collectionId', e.target.value || null)}
            >
              <option value="">Без коллекции</option>
              {data.collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </label>
          <label>
            Теги через запятую
            <Input
              value={item.tags.join(',')}
              onChange={(e) => field('tags', e.target.value.split(','))}
            />
          </label>
        </fieldset>
        <fieldset>
          <legend>Изображения</legend>
          <FileDropzone
            label="Перетащить или выбрать изображения"
            accept="image/png,image/jpeg,image/webp"
            onFiles={async (files) => {
              if (item.images.length + files.length > 4)
                throw Error('Можно выбрать до четырёх изображений.');
              field('images', [...item.images, ...(await Promise.all(files.map(prepareWorkshopImage)))]);
            }}
          />
          {item.images.map((url, n) => (
            <div className={css.row} key={n}>
              <Image unoptimized src={url} width="64" height="64" alt={'Изображение ' + (n + 1)} />
              <Button
                type="button"
                disabled={!n}
                onClick={() => {
                  const order = [...item.images];
                  [order[n - 1], order[n]] = [order[n], order[n - 1]];
                  field('images', order);
                }}
              >
                Выше
              </Button>
              <Button
                type="button"
                onClick={() =>
                  field(
                    'images',
                    item.images.filter((_, k) => k !== n),
                  )
                }
              >
                Удалить
              </Button>
            </div>
          ))}
        </fieldset>
        <fieldset>
          <legend>Цена и скидка</legend>
          <label>
            Цена в монетах
            <Input
              required
              type="number"
              min={1}
              max={1000000}
              value={item.price}
              onChange={(e) => field('price', Number(e.target.value))}
            />
          </label>
          <small>Скидки на вещи и группы задаются в настройках магазина.</small>
        </fieldset>
        <fieldset>
          <legend>Размещение в комнате</legend>
          <label>
            Форма
            <Select value={item.kind} onChange={(e) => field('kind', e.target.value as Item['kind'])}>
              {Object.entries(shapes).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </Select>
          </label>
          {(['w', 'h'] as const).map((k) => (
            <label key={k}>
              {k === 'w' ? 'Ширина' : 'Глубина'}
              <Input
                type="number"
                required
                min={1}
                max={k === 'w' ? 12 : 8}
                value={item[k]}
                onChange={(e) => field(k, Number(e.target.value))}
              />
            </label>
          ))}
          <label>
            Поверхность
            <Select
              value={item.surface}
              onChange={(e) => field('surface', e.target.value as Item['surface'])}
            >
              <option value="floor">Пол</option>
              <option value="wall">Стена</option>
              <option value="rug">Под мебелью</option>
            </Select>
          </label>
          <label>
            Порядок
            <Input
              type="number"
              min={0}
              value={item.order}
              onChange={(e) => field('order', +e.target.value)}
            />
          </label>
          <label>
            Цвет
            <Input type="color" value={item.color} onChange={(e) => field('color', e.target.value)} />
          </label>
        </fieldset>
        <fieldset>
          <legend>Публикация</legend>
          {(
            [
              ['isPublished', 'Опубликовать'],
              ['isNew', 'Новинка'],
              ['recommended', 'Рекомендуем'],
              ['limited', 'Лимитированная'],
            ] as const
          ).map(([k, label]) => (
            <label className={css.check} key={k}>
              <Input
                type="checkbox"
                role="switch"
                checked={item[k]}
                onChange={(e) => field(k, e.target.checked)}
              />
              {label}
            </label>
          ))}
        </fieldset>
        <h3>Как в магазине</h3>
        <ShopCard product={studioProducts({ ...data, items: [item] }, false)[0]} />
        {warning && <p role="alert">{warning}</p>}
        <footer>
          <Button type="button" onClick={cancel}>
            Отмена
          </Button>
          <Button data-primary="true">Сохранить</Button>
        </footer>
      </form>
    </Drawer>
  );
}
export function Items({
  data,
  save,
  statusFilter,
  createOnOpen,
  itemId,
  issue,
}: {
  createOnOpen: boolean;
  itemId: string | null;
  issue: string;
  data: Studio;
  save: Save;
  statusFilter: string;
}) {
  const [editor, setEditor] = useState<Item | null>(data.items.find((i) => i.id === itemId) ?? null),
    [q, search] = useState(''),
    [category, cat] = useState(''),
    [collection, coll] = useState(''),
    [status, setStatus] = useState(statusFilter),
    [sort, setSort] = useState('order');
  const [low, min] = useState(''),
    [high, max] = useState(''),
    [page, paginate] = useState(0),
    [table, setTable] = useState(false),
    [ids, select] = useState<string[]>([]),
    [action, choose] = useState('publish'),
    [value, setValue] = useState('');
  const [restore, setRestore] = useState<Item[]>([]),
    searchRef = useRef<HTMLInputElement>(null);
  const [priceItem, priceEdit] = useState<Item | null>(null);
  const [deleting, confirmDelete] = useState(false);
  const opened = useRef(false);
  const create = () =>
    setEditor({
      id: 'workshop:' + browserId(),
      name: '',
      description: '',
      price: 10,
      w: 1,
      h: 1,
      kind: 'plant',
      surface: 'floor',
      categoryId: data.categories[0]?.id ?? '',
      collectionId: null,
      color: '#b4c99c',
      images: [],
      tags: [],
      isPublished: false,
      isArchived: false,
      isNew: false,
      recommended: false,
      limited: false,
      order: Math.max(0, ...data.items.map((i) => i.order)) + 1,
      createdAt: new Date().toISOString(),
    });
  useEffect(() => {
    if (createOnOpen && !opened.current) {
      opened.current = true;
      create();
    }
    function keys(e: KeyboardEvent) {
      if (
        editor ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        (e.target as HTMLElement).closest('input,textarea,select,button,dialog')
      )
        return;
      if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        create();
      }
    }
    window.addEventListener('keydown', keys);
    return () => window.removeEventListener('keydown', keys);
  });
  const matches = data.items
    .filter(
      (i) =>
        (issue !== 'image' || !i.images.length) &&
        (issue !== 'description' || !i.description) &&
        (issue !== 'category' || !data.categories.some((c) => c.id === i.categoryId)) &&
        i.name.toLowerCase().includes(q.toLowerCase()) &&
        (!category || i.categoryId === category) &&
        (!collection || i.collectionId === collection) &&
        (!low || i.price >= Number(low)) &&
        (!high || i.price <= Number(high)) &&
        (!status ||
          (status === 'archived'
            ? i.isArchived
            : !i.isArchived && i.isPublished === (status === 'published'))),
    )
    .sort((a, b) =>
      sort === 'name-desc'
        ? b.name.localeCompare(a.name, 'ru')
        : sort === 'price-desc'
          ? b.price - a.price
          : sort === 'name'
            ? a.name.localeCompare(b.name, 'ru')
            : sort === 'price'
              ? a.price - b.price
              : sort === 'new'
                ? b.createdAt.localeCompare(a.createdAt)
                : a.order - b.order,
    );
  const last = Math.max(0, Math.ceil(matches.length / 16) - 1),
    current = Math.min(page, last),
    rows = matches.slice(current * 16, current * 16 + 16);
  function toggle(id: string) {
    select(ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id]);
  }
  async function bulk() {
    const snapshot = data.items.filter((i) => ids.includes(i.id));
    if (
      await save('Изменены вещи · ' + snapshot.length, (s) => {
        const targets = s.items.filter((i) => ids.includes(i.id));
        if (
          (action === 'category' && !s.categories.some((c) => c.id === value)) ||
          (action === 'collection' && !s.collections.some((c) => c.id === value))
        )
          throw Error('Выбери группу.');
        if (action === 'price' && (!value || !Number.isFinite(Number(value)) || Number(value) <= -100))
          throw Error('Введи процент больше −100.');
        switch (action) {
          case 'category':
            targets.forEach((i) => (i.categoryId = value));
            break;
          case 'collection':
            targets.forEach((i) => (i.collectionId = value));
            break;
          case 'publish':
          case 'hide':
            targets.forEach((i) => {
              if (action === 'publish' && i.price <= 0)
                throw Error('Перед публикацией задай положительную цену.');
              i.isArchived = false;
              i.isPublished = action === 'publish';
            });
            break;
          case 'price':
            targets.forEach((i) => {
              const price = Math.max(1, Math.round(i.price * (1 + Number(value) / 100)));
              if (price > 1000000) throw Error('Цена превышает 1 000 000 монет.');
              i.price = price;
            });
            break;
          case 'archive':
            targets.forEach((i) => (i.isArchived = true));
            break;
          case 'delete':
            s.items = s.items.filter((i) => !ids.includes(i.id));
            break;
        }
      })
    ) {
      if (['archive', 'delete'].includes(action)) setRestore(snapshot);
      select([]);
    }
  }
  function publish(i: Item) {
    void save('Изменена публикация ' + i.name, (s) => {
      const x = s.items.find((x) => x.id === i.id)!;
      if (!x.isPublished && x.price <= 0) throw Error('Перед публикацией задай положительную цену.');
      x.isPublished = x.isArchived || !x.isPublished;
      x.isArchived = false;
    });
  }
  function actions(i: Item) {
    return (
      <div className={css.actions}>
        <Button aria-label={'Изменить цену ' + i.name} onClick={() => priceEdit(i)}>
          {i.price} ◈
        </Button>
        <ActionMenu label={'Действия: ' + i.name}>
          <Button onClick={() => setEditor(i)}>Изменить</Button>
          <Button
            aria-label={'Дублировать ' + i.name}
            onClick={() =>
              setEditor({
                ...i,
                id: 'workshop:' + browserId(),
                name: i.name + ' (копия)',
                isPublished: false,
                createdAt: new Date().toISOString(),
              })
            }
          >
            Копия
          </Button>
          <Button onClick={() => publish(i)}>
            {i.isArchived || !i.isPublished ? 'Опубликовать' : 'Скрыть'}
          </Button>
        </ActionMenu>
      </div>
    );
  }
  return (
    <>
      <div className={css.toolbar}>
        <Button data-primary="true" onClick={create}>
          Новая вещь
        </Button>
        <div className={css.segment}>
          <Button aria-pressed={!table} onClick={() => setTable(false)}>
            Сетка
          </Button>
          <Button aria-pressed={table} onClick={() => setTable(true)}>
            Таблица
          </Button>
        </div>
        <Input
          ref={searchRef}
          type="search"
          aria-label="Поиск вещей"
          placeholder="Найти вещь"
          value={q}
          onChange={(e) => {
            search(e.target.value);
            paginate(0);
          }}
        />
      </div>
      <div className={css.toolbar}>
        <Select aria-label="Категория" value={category} onChange={(e) => cat(e.target.value)}>
          <option value="">Все категории</option>
          {data.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select aria-label="Коллекция" value={collection} onChange={(e) => coll(e.target.value)}>
          <option value="">Все коллекции</option>
          {data.collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select aria-label="Статус" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Все статусы</option>
          <option value="published">Опубликовано</option>
          <option value="draft">Черновики</option>
          <option value="archived">Архив</option>
        </Select>
        <Input
          aria-label="Цена от"
          type="number"
          min={0}
          placeholder="Цена от"
          value={low}
          onChange={(e) => min(e.target.value)}
        />
        <Input
          aria-label="Цена до"
          type="number"
          min={0}
          placeholder="Цена до"
          value={high}
          onChange={(e) => max(e.target.value)}
        />
        <Select aria-label="Сортировка" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="order">Ручной порядок</option>
          <option value="name">Название</option>
          <option value="price">Цена по возрастанию</option>
          <option value="price-desc">Цена по убыванию</option>
          <option value="name-desc">Название Я–А</option>
          <option value="new">Сначала новые</option>
        </Select>
      </div>
      {ids.length > 0 && (
        <div className={css.bulkBar}>
          <strong>Выбрано · {ids.length}</strong>
          <Select
            aria-label="Массовое действие"
            value={action}
            onChange={(e) => {
              choose(e.target.value);
              setValue('');
            }}
          >
            {Object.entries({
              publish: 'Опубликовать',
              hide: 'В черновики',
              archive: 'Архивировать',
              category: 'Сменить категорию',
              collection: 'В коллекцию',
              price: 'Изменить цену (%)',
              delete: 'Удалить',
            }).map(([k, n]) => (
              <option key={k} value={k}>
                {n}
              </option>
            ))}
          </Select>
          {['category', 'collection'].includes(action) && (
            <Select
              aria-label="Группа назначения"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            >
              <option value="">Выбери группу</option>
              {(action === 'category' ? data.categories : data.collections).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          )}
          {action === 'price' && (
            <Input
              aria-label="Процент"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          )}
          <Button onClick={() => (action === 'delete' ? confirmDelete(true) : void bulk())}>
            Применить
          </Button>
        </div>
      )}
      {restore.length > 0 && (
        <div role="status" className={css.undo}>
          Изменено вещей · {restore.length}
          <Button
            onClick={async () => {
              if (
                await save('Отменено удаление или архивирование', (s) => {
                  for (const i of restore) {
                    const current = s.items.find((x) => x.id === i.id);
                    if (current) current.isArchived = i.isArchived;
                    else s.items.push(i);
                  }
                })
              )
                setRestore([]);
            }}
          >
            Отменить
          </Button>
          <Button aria-label="Закрыть" onClick={() => setRestore([])}>
            ×
          </Button>
        </div>
      )}
      {table ? (
        <DataTable>
          <thead>
            <tr>
              <th>Выбор</th>
              <th>
                <Button onClick={() => setSort(sort === 'name' ? 'name-desc' : 'name')}>
                  Название {sort === 'name-desc' ? '↓' : '↑'}
                </Button>
              </th>
              <th>
                <Button onClick={() => setSort(sort === 'price' ? 'price-desc' : 'price')}>
                  Цена {sort === 'price-desc' ? '↓' : '↑'}
                </Button>
              </th>
              <th>Публикация</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i.id}>
                <td>
                  <Input
                    type="checkbox"
                    aria-label={'Выбрать ' + i.name}
                    checked={ids.includes(i.id)}
                    onChange={() => toggle(i.id)}
                  />
                </td>
                <td>
                  <div className={css.tableItem}>
                    <FurniturePreview product={{ ...i, category: '', image: i.images[0] }} />
                    {i.name}
                  </div>
                </td>
                <td>{i.price} ◈</td>
                <td>
                  <button
                    role="switch"
                    className={css.switcher}
                    aria-label={'Опубликовать ' + i.name}
                    aria-checked={i.isPublished && !i.isArchived}
                    onClick={() => publish(i)}
                  >
                    <i />
                  </button>
                </td>
                <td>{actions(i)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      ) : (
        <div className={css.grid}>
          {rows.map((i) => (
            <article className={css.card} key={i.id}>
              <label className={css.check}>
                <Input type="checkbox" checked={ids.includes(i.id)} onChange={() => toggle(i.id)} />
                Выбрать
              </label>
              <div className={css.art}>
                <FurniturePreview product={{ ...i, category: '', image: i.images[0] }} />
              </div>
              <Badge>
                {data.categories.find((c) => c.id === i.categoryId)?.name ?? 'Без категории'}
              </Badge>
              {i.collectionId && (
                <Badge>{data.collections.find((c) => c.id === i.collectionId)?.name}</Badge>
              )}
              <span
                className={css.status}
                data-tone={i.isArchived ? 'archive' : i.isPublished ? 'success' : 'draft'}
              >
                {i.isArchived ? 'Архив' : i.isPublished ? 'Опубликовано' : 'Черновик'}
              </span>
              <h3>{i.name}</h3>
              {actions(i)}
            </article>
          ))}
        </div>
      )}
      {!rows.length && (
        <EmptyState>
          Ничего не найдено.{' '}
          <Button
            onClick={() => {
              search('');
              cat('');
              coll('');
              setStatus('');
              min('');
              max('');
              if (issue) window.location.assign('/admin/items');
            }}
          >
            Сбросить фильтры
          </Button>
        </EmptyState>
      )}
      <div className={css.toolbar}>
        <Button disabled={!current} onClick={() => paginate(current - 1)}>
          Назад
        </Button>
        {current + 1} / {last + 1}
        <Button disabled={current >= last} onClick={() => paginate(current + 1)}>
          Далее
        </Button>
      </div>
      {deleting && (
        <ConfirmDialog
          title="Удалить выбранные вещи?"
          close={() => confirmDelete(false)}
          confirm={() => {
            confirmDelete(false);
            void bulk();
          }}
        >
          <p>Выбрано вещей · {ids.length}</p>
        </ConfirmDialog>
      )}
      {priceItem && (
        <Drawer title={'Цена · ' + priceItem.name} close={() => priceEdit(null)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const price = Number(new FormData(e.currentTarget).get('price'));
              if (
                await save('Изменена цена ' + priceItem.name, (s) => {
                  const item = s.items.find((i) => i.id === priceItem.id);
                  if (!item) throw Error('Вещь больше недоступна');
                  item.price = price;
                })
              )
                priceEdit(null);
            }}
          >
            <label>
              Цена в монетах
              <Input
                required
                name="price"
                type="number"
                defaultValue={priceItem.price}
                min={1}
                max={1000000}
              />
            </label>
            <footer>
              <Button type="button" onClick={() => priceEdit(null)}>
                Отмена
              </Button>
              <Button data-primary="true">Сохранить</Button>
            </footer>
          </form>
        </Drawer>
      )}
      {editor && <ItemEditor data={data} initial={editor} save={save} close={() => setEditor(null)} />}
    </>
  );
}
