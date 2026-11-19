'use client';
import { useState } from 'react';
import Link from 'next/link';
import RoomDock from '@/components/RoomDock';
import { useSearchParams } from 'next/navigation';
import { DoorOpen, LayoutDashboard, Armchair, Shapes, Layers, Music2, Settings2 } from 'lucide-react';
import { useLocalAccount } from '@/lib/use-local-account';
import { useStudio } from '@/lib/use-studio';
import { editStudio } from '@/domain/studio';
import { Groups, type Save } from './studio-groups';
import { Items } from './studio-items';
import { Music, useTracks } from './studio-music';
import { Settings } from './studio-settings';
import { Toast } from './studio-controls';
import css from './studio.module.css';
const pages = {
  overview: ['Обзор', LayoutDashboard],
  items: ['Каталог вещей', Armchair],
  categories: ['Категории', Shapes],
  collections: ['Коллекции', Layers],
  music: ['Музыка', Music2],
  settings: ['Настройки', Settings2],
} as const;
export type Section = keyof typeof pages;
export function StudioPage({ section }: { section: Section }) {
  const { data, error } = useStudio(),
    { account } = useLocalAccount(),
    { tracks } = useTracks(),
    [notice, setNotice] = useState(''),
    [menu, setMenu] = useState(false);
  const query = useSearchParams();
  const save: Save = async (label, change) => {
    try {
      if (account?.role !== 'admin') throw Error('Нужен аккаунт администратора.');
      await editStudio(account.name, label, change);
      setNotice(label);
      return true;
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Не удалось сохранить изменения.');
      return false;
    }
  };
  return (
    <><main className={css.shell}>
      <button
        className={css.menu}
        aria-expanded={menu}
        aria-controls="studio-nav"
        onClick={() => setMenu(!menu)}
      >
        Разделы мастерской
      </button>
      <nav id="studio-nav" data-open={menu} className={css.nav} aria-label="Разделы мастерской">
        <Link href="/room">
          <DoorOpen size={20} />
          tiny me.
        </Link>
        {Object.entries(pages).map(([key, [label, Icon]]) => (
          <Link
            key={key}
            aria-current={section === key ? 'page' : undefined}
            href={key === 'overview' ? '/admin' : '/admin/' + key}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <section className={css.content}>
        <h1>{pages[section][0]}</h1>
        {error && <p role="alert">{error}</p>}
        {!data ? (
          <div className={css.skeleton} role="status" aria-label="Открываем мастерскую">
            <i />
            <i />
            <i />
          </div>
        ) : (
          <>
            {section === 'overview' && (
              <>
                <div className={css.grid}>
                  {[
                    ['Вещи', data.items.length, 'items'],
                    [
                      'Опубликовано',
                      data.items.filter((i) => i.isPublished && !i.isArchived).length,
                      'items?status=published',
                    ],
                    [
                      'Черновики',
                      data.items.filter((i) => !i.isPublished && !i.isArchived).length,
                      'items?status=draft',
                    ],
                    ['Категории', data.categories.length, 'categories'],
                    ['Коллекции', data.collections.length, 'collections'],
                    ['Треки', tracks.length, 'music'],
                  ].map(([n, count, to]) => (
                    <Link className={css.stat} key={n} href={'/admin/' + to}>
                      <span>{n}</span>
                      <strong>{count}</strong>
                    </Link>
                  ))}
                </div>
                <div className={css.box}>
                  <h2>Требует внимания</h2>
                  {(
                    [
                      ['Без изображения', data.items.filter((i) => !i.images.length)],
                      ['Без описания', data.items.filter((i) => !i.description)],
                      [
                        'Без категории',
                        data.items.filter((i) => !data.categories.some((c) => c.id === i.categoryId)),
                      ],
                      [
                        'Пустые коллекции',
                        data.collections.filter((c) => !data.items.some((i) => i.collectionId === c.id)),
                      ],
                    ] as const
                  ).map(([n, list]) => (
                    <details key={n}>
                      <summary>
                        {n} · {list.length}
                      </summary>
                      <p>{list.map((i) => i.name).join(', ') || 'Всё в порядке'}</p>
                    </details>
                  ))}
                </div>
                <div className={css.box}>
                  <h2>Последние изменения</h2>
                  {data.history.slice(0, 15).map((e, n) => (
                    <div key={n}>
                      <strong>{e.action}</strong>
                      <small>
                        {' '}
                        · {e.actor} · {new Date(e.at).toLocaleString('ru')}
                      </small>
                    </div>
                  ))}
                  {!data.history.length && <p>Здесь появится история изменений мастерской.</p>}
                </div>
              </>
            )}
            {(section === 'categories' || section === 'collections') && (
              <Groups key={section} data={data} save={save} type={section} />
            )}
            {section === 'items' && (
              <Items data={data} save={save} statusFilter={query.get('status') ?? ''} />
            )}
            {section === 'music' && <Music data={data} save={save} />}
            {section === 'settings' && <Settings data={data} save={save} />}
          </>
        )}
      </section>
      {notice && <Toast close={() => setNotice('')}>{notice}</Toast>}
    </main><RoomDock active="admin" /></>
  );
}
