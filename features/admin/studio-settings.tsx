'use client';
import { Download, GripVertical, Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { exportCatalog, importCatalog } from '@/domain/studio-transfer';
import type { Studio, Settings as StoreSettings } from '@/domain/studio';
import type { Save } from './studio-groups';
import { ConfirmDialog, FileDropzone } from './studio-ui';
import { Select } from './studio-controls';
import { DatePicker } from './studio-date';
import css from './studio.module.css';
export function Settings({ data, save }: { data: Studio; save: Save }) {
  const [v, set] = useState<StoreSettings>(
    () =>
      JSON.parse(sessionStorage.getItem('tinyme:settings-draft') ?? 'null') ??
      structuredClone(data.settings),
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
  const [pendingImport, prepareImport] = useState<ReturnType<typeof importCatalog> | null>(null);
  const dirty = JSON.stringify(v) !== JSON.stringify(data.settings);
  const today = new Date().toLocaleDateString('sv-SE');
  const options = [
    ['all', 'Весь магазин'],
    ...data.categories.map((c) => ['category:' + c.id, 'Категория · ' + c.name]),
    ...data.collections.map((c) => ['collection:' + c.id, 'Коллекция · ' + c.name]),
    ...data.items.map((i) => ['item:' + i.id, 'Вещь · ' + i.name]),
  ];
  return (
    <>
      <div className={css.settingsLayout}>
        <nav className={css.settingsNav} aria-label="Настройки магазина">
          {[
            ['economy', 'Экономика'],
            ['store', 'Магазин'],
            ['discounts', 'Скидки'],
            ['transfer', 'Данные'],
          ].map(([id, label]) => (
            <a key={id} href={'#' + id}>
              {label}
            </a>
          ))}
        </nav>
        <div>
          <form
            className={css.settingsForm}
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
            <section id="economy" className={css.settingPanel}>
              <h2>Экономика</h2>
              {(
                [
                  ['startingCoins', 'Стартовые монеты'],
                  ['reward', 'Монет за минуту активности'],
                  ['newDays', 'Дней в новинках'],
                ] as const
              ).map(([k, n]) => (
                <label key={k}>
                  <span>
                    {n}
                    <small>
                      {k === 'startingCoins'
                        ? 'Баланс новой комнаты'
                        : k === 'reward'
                          ? 'Начисление за активную минуту'
                          : 'Срок отметки «Новинка»'}
                    </small>
                  </span>
                  <span className={css.stepper}>
                    <button
                      type="button"
                      aria-label={'Уменьшить: ' + n}
                      disabled={v[k] <= 0}
                      onClick={() => set({ ...v, [k]: v[k] - 1 })}
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      aria-label={n}
                      required
                      type="number"
                      min={0}
                      max={1000000}
                      value={v[k]}
                      onChange={(e) => set({ ...v, [k]: Number(e.target.value) })}
                    />
                    <small>{k === 'newDays' ? 'дней' : 'монет'}</small>
                    <button
                      type="button"
                      aria-label={'Увеличить: ' + n}
                      disabled={v[k] >= 1000000}
                      onClick={() => set({ ...v, [k]: v[k] + 1 })}
                    >
                      <Plus size={14} />
                    </button>
                  </span>
                </label>
              ))}
              <label className={css.check}>
                <input
                  type="checkbox"
                  role="switch"
                  checked={v.showNew}
                  onChange={(e) => set({ ...v, showNew: e.target.checked })}
                />
                Показывать новинки
              </label>
            </section>
            <section id="store" className={css.settingPanel}>
              <h2>Порядок блоков</h2>
              {v.blocks.map((b, n) => (
                <div
                  key={b}
                  className={css.row}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', b)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const blocks = [...v.blocks];
                    const source = blocks.findIndex((x) => x === e.dataTransfer.getData('text/plain'));
                    if (source < 0) return;
                    blocks.splice(n, 0, blocks.splice(source, 1)[0]);
                    set({ ...v, blocks });
                  }}
                >
                  <GripVertical size={16} />
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
                    Выше
                  </button>
                </div>
              ))}
            </section>
            <section id="discounts" className={css.settingPanel}>
              <h2>Скидки</h2>
              {v.discounts.map((d, n) => (
                <div className={css.row} key={n}>
                  <strong>
                    {options.find(([id]) => id === d.target)?.[1]} · −{d.percent}%
                  </strong>
                  <small>
                    {d.endsAt && d.endsAt < today
                      ? 'Истекла'
                      : d.startsAt && d.startsAt > today
                        ? 'Запланирована'
                        : 'Активна'}
                  </small>
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
                <Select value={scope} onChange={(e) => target(e.target.value)}>
                  {options.map(([id, n]) => (
                    <option value={id} key={id}>
                      {n}
                    </option>
                  ))}
                </Select>
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
                  С<DatePicker value={from} onChange={(date) => start(date)} />
                </label>
                <label>
                  По
                  <DatePicker min={from} value={until} onChange={(date) => end(date)} />
                </label>
                <button
                  type="button"
                  disabled={percent < 1 || percent > 99 || (!!until && until < from)}
                  onClick={() =>
                    set({
                      ...v,
                      discounts: [
                        ...v.discounts,
                        { target: scope, percent, startsAt: from, endsAt: until },
                      ],
                    })
                  }
                >
                  Добавить скидку
                </button>
              </div>
            </section>
            {dirty && (
              <footer className={css.saveBar}>
                <span>Есть несохранённые изменения</span>
                <button
                  type="button"
                  onClick={() => {
                    set(structuredClone(data.settings));
                    sessionStorage.removeItem('tinyme:settings-draft');
                  }}
                >
                  Отмена
                </button>
                <button data-primary="true">Сохранить настройки</button>
              </footer>
            )}
          </form>
          <div id="transfer" className={css.box}>
            <h2>Перенос каталога</h2>
            <div className={css.exports}>
              <button onClick={() => download(false)}>
                <Download size={18} />
                <span>
                  Экспорт JSON<small>Копия каталога для переноса</small>
                </span>
              </button>
              <button onClick={() => download(true)}>
                <Download size={18} />
                <span>
                  Экспорт CSV<small>Таблица для редактирования</small>
                </span>
              </button>
            </div>
            <FileDropzone
              label="Импортировать JSON или CSV"
              accept=".json,.csv"
              multiple={false}
              onFiles={async ([file]) => {
                const next = importCatalog(await file.text(), file.name.toLowerCase().endsWith('.csv'));
                prepareImport(next);
              }}
            />
          </div>
          {pendingImport && (
            <ConfirmDialog
              title="Заменить каталог?"
              action="Заменить"
              close={() => prepareImport(null)}
              confirm={async () => {
                if (
                  await save('Импортирован каталог', (s) => {
                    s.items = pendingImport.items;
                    s.categories = pendingImport.categories;
                    s.collections = pendingImport.collections;
                  })
                )
                  prepareImport(null);
              }}
            >
              <p>Вещей в файле · {pendingImport.items.length}</p>
            </ConfirmDialog>
          )}
        </div>
      </div>
    </>
  );
}
