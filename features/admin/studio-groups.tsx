'use client';
import Image from 'next/image';
import FurniturePreview from '@/components/FurniturePreview';
import { Layers } from 'lucide-react';
import { useEffect, useState } from 'react';
import { browserId } from '@/lib/browser-id';
import {
  groupBase,
  makeCollection,
  removeGroup,
  type Studio,
  type Category,
  type Collection,
} from '@/domain/studio';
import { prepareWorkshopImage } from '@/lib/workshop-image';
import { Drawer, EmptyState, FileDropzone, ConfirmDialog } from './studio-ui';
import css from './studio.module.css';
export type Save = (label: string, change: (s: Studio) => void) => Promise<boolean>;
type Props = { data: Studio; save: Save; type: 'categories' | 'collections' };
export function Groups({ data, save, type }: Props) {
  const [undo,setUndo]=useState<{group:Category|Collection;ids:string[];to:string}|null>(null);
  const categories = type === 'categories';
  const [edited, setEdited] = useState<Category | Collection | null>(null),
    [removing, setRemoving] = useState(''),
    [target, setTarget] = useState('');
  const [search, setSearch] = useState(''),
    [members, setMembers] = useState<string[]>([]),
    [drag, setDrag] = useState('');
  const groups = [...data[type]].sort((a, b) => a.order - b.order);
  const key = categories ? 'categoryId' : 'collectionId';
  const count = (id: string) => data.items.filter((i) => i[key] === id).length;
  const [original, setOriginal] = useState(''),
    [draftKey, setDraftKey] = useState('');
  const modified = !!edited && JSON.stringify([edited, members]) !== original;
  useEffect(() => {
    if (modified && draftKey) {
      try {
        sessionStorage.setItem(draftKey, JSON.stringify([edited, members]));
      } catch {
        /* Saving the form still works. */
      }
    }
  }, [modified, draftKey, edited, members]);
  function cancel() {
    if (!modified || confirm('Закрыть редактор и оставить черновик?')) setEdited(null);
  }
  const existing = groups.some((g) => g.id === edited?.id);
  function edit(group: Category | Collection) {
    const memberIds = data.items
      .filter((i) => i.collectionId === group.id)
      .sort((a, b) => (a.collectionOrder ?? a.order) - (b.collectionOrder ?? b.order))
      .map((i) => i.id);
    const key = 'tinyme:form:' + type + ':' + (groups.some((g) => g.id === group.id) ? group.id : 'new');
    const initial = JSON.stringify([group, memberIds]);
    setOriginal(initial);
    setDraftKey(key);
    const [draft, ids] = JSON.parse(sessionStorage.getItem(key) ?? initial);
    setEdited({ ...draft, id: group.id, slug: group.slug });
    setMembers(ids);
    setSearch('');
  }
  function move(id: string, to: string) {
    if (id === to) return;
    void save('Изменён порядок групп', (s) => {
      const sorted = [...s[type]].sort((a, b) => a.order - b.order);
      const from = sorted.findIndex((g) => g.id === id),
        dest = sorted.findIndex((g) => g.id === to);
      if (from < 0 || dest < 0) return;
      sorted.splice(dest, 0, sorted.splice(from, 1)[0]);
      sorted.forEach((g, n) => (g.order = n));
    });
  }
  return (
    <>
      <button
        data-primary="true"
        onClick={() => {
          const id = browserId();
          edit(
            categories
              ? { ...groupBase(id, '', groups.length), icon: '◆', color: '#ebbd9c' }
              : makeCollection(id, '', groups.length),
          );
        }}
      >
        {categories ? 'Новая категория' : 'Новая коллекция'}
      </button>
      {!groups.length && <EmptyState>Здесь появятся коллекции магазина.</EmptyState>}
      <div className={categories ? undefined : css.collectionGrid}>
        {groups.map((g, n) => (
          <article
            key={g.id}
            className={categories ? css.row : css.collectionCard}
            draggable
            onDragStart={() => setDrag(g.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => move(drag, g.id)}
          >
            {'color' in g && <span style={{ color: g.color }}>{g.icon}</span>}
            {'cover' in g && (
              <div className={css.cover}>
                {g.cover ? (
                  <Image unoptimized src={g.cover} alt="" width={240} height={140} />
                ) : count(g.id) ? (
                  data.items
                    .filter((i) => i.collectionId === g.id)
                    .slice(0, 2)
                    .map((i) => (
                      <FurniturePreview key={i.id} product={{ ...i, category: '', image: i.images[0] }} />
                    ))
                ) : (
                  <Layers size={32} aria-hidden="true" />
                )}
              </div>
            )}
            {categories ? (
              <input
                key={g.name}
                aria-label={'Название категории ' + g.name}
                defaultValue={g.name}
                maxLength={100}
                onBlur={(e) => {
                  const value = e.currentTarget.value.trim();
                  if (value && value !== g.name)
                    void save('Переименована категория ' + g.name, (s) => {
                      const current = s.categories.find((c) => c.id === g.id);
                      if (
                        s.categories.some(
                          (c) => c.id !== g.id && c.name.toLocaleLowerCase() === value.toLocaleLowerCase(),
                        )
                      )
                        throw Error('Такое название уже используется.');
                      if (current) current.name = value;
                    });
                  else e.currentTarget.value = g.name;
                }}
              />
            ) : (
              <strong>{g.name}</strong>
            )}
            <small>Вещей · {count(g.id)}</small>
            <button
              aria-label={'Переместить выше ' + g.name}
              disabled={!n}
              onClick={() => move(g.id, groups[n - 1].id)}
            >
              ↑
            </button>
            <button
              onClick={() =>
                void save('Изменена видимость ' + g.name, (s) => {
                  const current = s[type].find((c) => c.id === g.id);
                  if (current) current.isVisible = !current.isVisible;
                })
              }
            >
              {g.isVisible ? 'Скрыть' : 'Показать'}
            </button>
            <button onClick={() => edit(g)}>Изменить</button>
            <button
              onClick={() => {
                setRemoving(g.id);
                setTarget('');
              }}
            >
              Удалить
            </button>
          </article>
        ))}
      </div>
      {undo&&<div role="status" className={css.undo}>Удалена группа «{undo.group.name}» <button onClick={async()=>{
        if(await save('Восстановлена группа «'+undo.group.name+'»',s=>{
          const list:(Category|Collection)[]=s[type];
          if(list.some(g=>g.id===undo.group.id||g.name===undo.group.name))throw Error('Группа уже существует.');
          list.push(undo.group);
          s.items.forEach(i=>{if(undo.ids.includes(i.id)&&i[key]===undo.to)i[key]=undo.group.id;});
        }))setUndo(null);
      }}>Отменить</button><button aria-label="Закрыть" onClick={()=>setUndo(null)}>×</button></div>}
      {removing && (
        <ConfirmDialog
          disabled={!!count(removing) && !target}
          confirm={async () => {
            const group=groups.find(g=>g.id===removing);
            if(!group)return;
            const ids=data.items.filter(i=>i[key]===removing).map(i=>i.id);
            if(await save('Удалена группа «'+group.name+'»',s=>removeGroup(s,type,removing,target))){setUndo({group,ids,to:target});setRemoving('');}
          }}
          title={'Удаление · ' + groups.find((g) => g.id === removing)?.name}
          close={() => setRemoving('')}
        >
          <p>Вещей в группе · {count(removing)}</p>
          {count(removing) > 0 && (
            <label>
              Куда перенести вещи
              <select value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="">Выбери группу</option>
                {groups
                  .filter((g) => g.id !== removing)
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
              </select>
            </label>
          )}
        </ConfirmDialog>
      )}
      {edited && (
        <Drawer
          title={
            categories
              ? existing
                ? 'Редактирование категории'
                : 'Новая категория'
              : existing
                ? 'Редактирование коллекции'
                : 'Новая коллекция'
          }
          close={cancel}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                await save('Сохранена группа «' + edited.name + '»', (s) => {
                  if (
                    !edited.name.trim() ||
                    s[type].some(
                      (g) => g.id !== edited.id && g.name.toLowerCase() === edited.name.trim().toLowerCase(),
                    )
                  )
                    throw Error('Укажи уникальное название.');
                  const list: (Category | Collection)[] = categories ? s.categories : s.collections;
                  const index = list.findIndex((g) => g.id === edited.id);
                  if (index < 0) list.push(edited);
                  else list[index] = edited;
                  if (!categories)
                    s.items.forEach((i) => {
                      if (members.includes(i.id)) {
                        i.collectionId = edited.id;
                        i.collectionOrder = members.indexOf(i.id);
                      } else if (i.collectionId === edited.id) i.collectionId = null;
                    });
                })
              ) {
                sessionStorage.removeItem(draftKey);
                setEdited(null);
              }
            }}
          >
            <fieldset>
              <label>
                Название
                <input
                  required
                  maxLength={100}
                  value={edited.name}
                  onChange={(e) => setEdited({ ...edited, name: e.target.value })}
                />
              </label>
              {'icon' in edited ? (
                <>
                  <label>
                    Иконка
                    <input
                      maxLength={8}
                      value={edited.icon}
                      onChange={(e) => setEdited({ ...edited, icon: e.target.value })}
                    />
                  </label>
                  <label>
                    Цвет
                    <input
                      type="color"
                      value={edited.color}
                      onChange={(e) => setEdited({ ...edited, color: e.target.value })}
                    />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Описание
                    <textarea
                      value={edited.description}
                      onChange={(e) => setEdited({ ...edited, description: e.target.value })}
                    />
                  </label>
                  <FileDropzone
                    label="Выбрать обложку"
                    accept="image/png,image/jpeg,image/webp"
                    multiple={false}
                    onFiles={async (files) =>
                      setEdited({ ...edited, cover: await prepareWorkshopImage(files[0]) })
                    }
                  />
                  {edited.cover && (
                    <Image unoptimized src={edited.cover} alt="Обложка" width={120} height={120} />
                  )}
                  <label>
                    Начало
                    <input
                      type="date"
                      value={edited.startsAt}
                      onChange={(e) => setEdited({ ...edited, startsAt: e.target.value })}
                    />
                  </label>
                  <label>
                    Окончание
                    <input
                      type="date"
                      min={edited.startsAt}
                      value={edited.endsAt}
                      onChange={(e) => setEdited({ ...edited, endsAt: e.target.value })}
                    />
                  </label>
                  <div>
                    <strong>Порядок вещей</strong>
                    {members.map((id, n) => (
                      <div className={css.row} key={id}>
                        <span>{data.items.find((i) => i.id === id)?.name}</span>
                        <button
                          type="button"
                          disabled={!n}
                          aria-label={'Выше ' + (data.items.find((i) => i.id === id)?.name ?? '')}
                          onClick={() => {
                            const v = [...members];
                            [v[n - 1], v[n]] = [v[n], v[n - 1]];
                            setMembers(v);
                          }}
                        >
                          ↑
                        </button>
                      </div>
                    ))}
                  </div>
                  <label>
                    Найти вещь
                    <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </label>
                  {data.items
                    .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
                    .map((i) => (
                      <label className={css.check} key={i.id}>
                        <input
                          type="checkbox"
                          checked={members.includes(i.id)}
                          onChange={(e) =>
                            setMembers(
                              e.target.checked ? [...members, i.id] : members.filter((v) => v !== i.id),
                            )
                          }
                        />
                        {i.name}
                      </label>
                    ))}
                </>
              )}
              <label className={css.check}>
                <input
                  type="checkbox"
                  checked={edited.isVisible}
                  onChange={(e) => setEdited({ ...edited, isVisible: e.target.checked })}
                />
                Показывать в магазине
              </label>
            </fieldset>
            <footer>
              <button type="button" onClick={cancel}>
                Отмена
              </button>
              <button data-primary="true">Сохранить</button>
            </footer>
          </form>
        </Drawer>
      )}
    </>
  );
}
