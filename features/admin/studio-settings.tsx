'use client';
import { useEffect, useState } from 'react';
import { exportCatalog, importCatalog } from '@/domain/studio-transfer';
import type { Studio, Settings as StoreSettings } from '@/domain/studio';
import type { Save } from './studio-groups';
import { FileDropzone } from './studio-ui';
import css from './studio.module.css';
export function Settings({ data, save }: { data: Studio; save: Save }) {
  const [v, set] = useState<StoreSettings>(
    () =>
      JSON.parse(sessionStorage.getItem('tinyme:settings-draft') ?? 'null') ?? structuredClone(data.settings),
  );
  const [scope, target] = useState('all'),
    [percent, discount] = useState(10),
    [from, start] = useState(''),
    [until, end] = useState('');
  useEffect(() => {
    if (JSON.stringify(v) === JSON.stringify(data.settings)) return;
    sessionStorage.setItem('tinyme:settings-draft', JSON.stringify(v));
    const before = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', before);
    return () => window.removeEventListener('beforeunload', before);
  }, [v, data.settings]);
  function download(csv: boolean) {
    const url = URL.createObjectURL(
      new Blob([exportCatalog(data, csv)], { type: csv ? 'text/csv' : 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tinyme-catalog.' + (csv ? 'csv' : 'json');
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const options = [
    ['all', 'Весь магазин'],
    ...data.categories.map((c) => ['category:' + c.id, 'Категория · ' + c.name]),
    ...data.collections.map((c) => ['collection:' + c.id, 'Коллекция · ' + c.name]),
    ...data.items.map((i) => ['item:' + i.id, 'Вещь · ' + i.name]),
  ];
  return (
    <>
      <form
        className={css.box}
        onSubmit={async (e) => {
          e.preventDefault();
          if (
            await save('Обновлены настройки магазина', (s) => {
              s.settings = v;
            })
          )
            sessionStorage.removeItem('tinyme:settings-draft');
        }}
      >
        <h2>Экономика</h2>
        {(
          [
            ['startingCoins', 'Стартовые монеты'],
            ['reward', 'Монет за минуту активности'],
            ['newDays', 'Дней в новинках'],
          ] as const
        ).map(([k, n]) => (
          <label key={k}>
            {n}
            <input
              required
              type="number"
              min={0}
              max={1000000}
              value={v[k]}
              onChange={(e) => set({ ...v, [k]: Number(e.target.value) })}
            />
          </label>
        ))}
        <label className={css.check}>
          <input
            type="checkbox"
            checked={v.showNew}
            onChange={(e) => set({ ...v, showNew: e.target.checked })}
          />
          Показывать новинки
        </label>
        <h2>Порядок блоков</h2>
        {v.blocks.map((b, n) => (
          <div key={b} className={css.row}>
            <strong>{b}</strong>
            <button
              type="button"
              disabled={!n}
              aria-label={'Выше ' + b}
              onClick={() => {
                const blocks = [...v.blocks];
                [blocks[n - 1], blocks[n]] = [blocks[n], blocks[n - 1]];
                set({ ...v, blocks });
              }}
            >
              ↑
            </button>
          </div>
        ))}
        <h2>Скидки</h2>
        {v.discounts.map((d, n) => (
          <div className={css.row} key={n}>
            <strong>
              {options.find(([id]) => id === d.target)?.[1]} · −{d.percent}%
            </strong>
            <button
              type="button"
              onClick={() => set({ ...v, discounts: v.discounts.filter((_, k) => k !== n) })}
            >
              Убрать
            </button>
          </div>
        ))}
        <label>
          Применить к
          <select value={scope} onChange={(e) => target(e.target.value)}>
            {options.map(([id, n]) => (
              <option value={id} key={id}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <div className={css.toolbar}>
          <label>
            Скидка, %
            <input
              type="number"
              min={1}
              max={99}
              value={percent}
              onChange={(e) => discount(+e.target.value)}
            />
          </label>
          <label>
            С<input type="date" value={from} onChange={(e) => start(e.target.value)} />
          </label>
          <label>
            По
            <input type="date" min={from} value={until} onChange={(e) => end(e.target.value)} />
          </label>
          <button
            type="button"
            disabled={percent < 1 || percent > 99 || (!!until && until < from)}
            onClick={() =>
              set({
                ...v,
                discounts: [...v.discounts, { target: scope, percent, startsAt: from, endsAt: until }],
              })
            }
          >
            Добавить скидку
          </button>
        </div>
        <button data-primary="true">Сохранить настройки</button>
      </form>
      <div className={css.box}>
        <h2>Перенос каталога</h2>
        <div className={css.toolbar}>
          <button onClick={() => download(false)}>Скачать JSON</button>
          <button onClick={() => download(true)}>Скачать CSV</button>
        </div>
        <FileDropzone
          label="Импортировать JSON или CSV"
          accept=".json,.csv"
          multiple={false}
          onFiles={async ([file]) => {
            const next = importCatalog(await file.text(), file.name.toLowerCase().endsWith('.csv'));
            if (confirm('Заменить каталог? Вещей в файле: ' + next.items.length))
              await save('Импортирован каталог', (s) => {
                s.items = next.items;
                s.categories = next.categories;
                s.collections = next.collections;
              });
          }}
        />
      </div>
    </>
  );
}
