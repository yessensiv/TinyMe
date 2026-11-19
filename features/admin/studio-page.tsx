'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import theme from './studio-theme.module.css';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CircleCheck,
  TriangleAlert,
  Search,
  Menu,
  PanelLeftClose,
  Grip,
  Plus,
  Pencil,
  Trash2,
  ArrowUpRight,
  DoorOpen,
  LayoutDashboard,
  Armchair,
  Shapes,
  Layers,
  Music2,
  Settings2,
} from 'lucide-react';
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
function relativeTime(at: string) {
  const seconds = Math.round((new Date(at).getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' });
  if (Math.abs(seconds) < 60) return 'Только что';
  if (Math.abs(seconds) < 3600) return formatter.format(Math.round(seconds / 60), 'minute');
  if (Math.abs(seconds) < 86400) return formatter.format(Math.round(seconds / 3600), 'hour');
  return formatter.format(Math.round(seconds / 86400), 'day');
}
function dayLabel(at: string) {
  const date = new Date(at);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === new Date().toDateString()
    ? 'Сегодня'
    : date.toDateString() === yesterday.toDateString()
      ? 'Вчера'
      : date.toLocaleDateString('ru', { day: 'numeric', month: 'long' });
}
export type Section = keyof typeof pages;
export function StudioPage({ section }: { section: Section }) {
  const { data, error } = useStudio(),
    { account } = useLocalAccount(),
    { tracks } = useTracks(),
    [notice, setNotice] = useState(''),
    [menu, setMenu] = useState(false);
  const query = useSearchParams();
  const router = useRouter();
  const [compact, collapse] = useState(false);
  const [term, search] = useState('');
  const palette = useRef<HTMLDialogElement>(null);
  const descriptions = {
    overview: 'Состояние магазина и последние действия команды.',
    items: 'Вещи, цены и публикации магазина.',
    categories: 'Названия, порядок и видимость разделов магазина.',
    collections: 'Состав и оформление тематических подборок.',
    music: 'Треки и плейлисты для комнаты.',
    settings: 'Экономика комнаты и настройки витрины.',
  };
  function openPalette() {
    search('');
    palette.current?.showModal();
  }
  useEffect(() => {
    collapse(localStorage.getItem('tinyme:compact-sidebar') === '1');
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (!document.querySelector('dialog[open]')) openPalette();
      }
      const typing = (e.target as HTMLElement).closest(
        'input,textarea,select,[contenteditable=true],dialog',
      );
      if (!typing && section !== 'items' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === '/') {
          e.preventDefault();
          openPalette();
        }
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          router.push('/admin/items?new=1');
        }
      }
      if (e.key === 'Escape') setMenu(false);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [section, router]);
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
    <main className={[theme.frame, "shop-palette"].join(" ")} data-compact={compact}>
      {menu && (
        <button className={theme.scrim} aria-label="Закрыть меню" onClick={() => setMenu(false)} />
      )}
      <nav id="studio-nav" className={theme.rail} data-open={menu} aria-label="Разделы мастерской">
        <Link className={theme.brand} href="/admin" aria-label="Мастерская TinyMe">
          <Grip />
          <span>tiny me.</span>
        </Link>
        {Object.entries(pages).map(([key, [label, Icon]]) => (
          <div key={key}>
            {(key === 'items' || key === 'settings') && (
              <div className={theme.group}>{key === 'items' ? 'Контент' : 'Система'}</div>
            )}
            <Link
              onClick={() => setMenu(false)}
              title={label}
              aria-label={label}
              aria-current={section === key ? 'page' : undefined}
              href={key === 'overview' ? '/admin' : '/admin/' + key}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          </div>
        ))}
        <div className={theme.foot}>
          <button
            className={theme.collapse}
            title="Свернуть или развернуть меню"
            aria-label="Свернуть или развернуть меню"
            onClick={() => {
              collapse(!compact);
              localStorage.setItem('tinyme:compact-sidebar', compact ? '0' : '1');
            }}
          >
            <PanelLeftClose size={18} />
            <span>Свернуть меню</span>
          </button>
          <Link href="/room" aria-label="В комнату">
            <DoorOpen size={18} />
            <span>В комнату ↗</span>
          </Link>
          <div className={theme.profile}>
            <b>{account?.name?.slice(0, 1).toUpperCase() || 'А'}</b>
            <span>{account?.name || 'Администратор'}</span>
          </div>
        </div>
      </nav>
      <div className={theme.work} inert={menu || undefined}>
        <header className={theme.bar}>
          <button
            className={theme.hamburger}
            aria-label="Разделы мастерской"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Menu size={18} />
          </button>
          <small>Мастерская</small>
          <span aria-hidden="true">/</span>
          {pages[section][0]}
          <button className={theme.command} onClick={openPalette} aria-label="Поиск и команды">
            <Search size={16} />
            <span>Поиск и команды</span>
            <kbd>⌘ / Ctrl K</kbd>
          </button>
        </header>
        <section className={css.shell}>
          <div className={css.content}>
            <h1>{pages[section][0]}</h1>
            <p className={css.subtitle}>{descriptions[section]}</p>
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
                    <div className={css.metrics}>
                      {[
                        ['Вещи', data.items.length, 'items'],

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
                          <span className={css.metricLabel}>
                            {n === 'Вещи' ? (
                              <Armchair />
                            ) : n === 'Категории' ? (
                              <Shapes />
                            ) : n === 'Коллекции' ? (
                              <Layers />
                            ) : n === 'Треки' ? (
                              <Music2 />
                            ) : (
                              <LayoutDashboard />
                            )}
                            {n}
                          </span>
                          <strong>{count}</strong>
                          {n === 'Вещи' && (
                            <small>
                              Опубликовано ·{' '}
                              {data.items.filter((i) => i.isPublished && !i.isArchived).length}
                            </small>
                          )}
                        </Link>
                      ))}
                    </div>
                    <div className={css.dashboardPanels}>
                      <div className={css.box}>
                        <h2>Требует внимания</h2>
                        {(
                          [
                            ['Без изображения', data.items.filter((i) => !i.images.length)],
                            ['Без описания', data.items.filter((i) => !i.description)],
                            [
                              'Без категории',
                              data.items.filter(
                                (i) => !data.categories.some((c) => c.id === i.categoryId),
                              ),
                            ],
                            [
                              'Пустые коллекции',
                              data.collections.filter(
                                (c) => !data.items.some((i) => i.collectionId === c.id),
                              ),
                            ],
                          ] as const
                        ).map(([n, list], index) => (
                          <div key={n} className={css.attention}>
                            {list.length ? <TriangleAlert size={16} /> : <CircleCheck size={16} />}
                            <span>{n}</span>
                            {list.length ? (
                              <>
                                <b>{list.length}</b>
                                <Link
                                  href={
                                    index === 3
                                      ? '/admin/collections?empty=1'
                                      : '/admin/items?issue=' +
                                        ['image', 'description', 'category'][index]
                                  }
                                >
                                  Исправить →
                                </Link>
                              </>
                            ) : (
                              <small>Всё в порядке</small>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className={css.box}>
                        <h2>Последние изменения</h2>
                        {data.history.slice(0, 15).map((e, n) => (
                          <div key={n} className={css.event}>
                            {(n === 0 ||
                              new Date(data.history[n - 1].at).toDateString() !==
                                new Date(e.at).toDateString()) && <h3>{dayLabel(e.at)}</h3>}
                            {/удален|удалён|архив/i.test(e.action) ? (
                              <Trash2 className={css.removed} />
                            ) : /создан|добавлен|загружен/i.test(e.action) ? (
                              <Plus className={css.created} />
                            ) : (
                              <Pencil />
                            )}
                            <strong>{e.action}</strong>
                            <small title={new Date(e.at).toLocaleString('ru')}>
                              {e.actor.toLowerCase() === 'admin' ? 'Администратор' : e.actor} ·{' '}
                              {relativeTime(e.at)}
                            </small>
                          </div>
                        ))}
                        {!data.history.length && <p>Здесь появится история изменений мастерской.</p>}
                      </div>
                    </div>
                  </>
                )}
                {(section === 'categories' || section === 'collections') && (
                  <Groups
                    key={section}
                    data={data}
                    save={save}
                    type={section}
                    onlyEmpty={query.get('empty') === '1'}
                  />
                )}
                {section === 'items' && (
                  <Items
                    key={query.toString()}
                    itemId={query.get('item')}
                    createOnOpen={query.get('new') === '1'}
                    issue={query.get('issue') || ''}
                    data={data}
                    save={save}
                    statusFilter={query.get('status') ?? ''}
                  />
                )}
                {section === 'music' && <Music data={data} save={save} />}
                {section === 'settings' && <Settings data={data} save={save} />}
              </>
            )}
          </div>
        </section>
      </div>
      {notice && <Toast close={() => setNotice('')}>{notice}</Toast>}
      <dialog
        onKeyDown={(e) => {
          const links = Array.from(e.currentTarget.querySelectorAll('a'));
          const idx = links.indexOf(document.activeElement as HTMLAnchorElement);
          if (['ArrowDown', 'ArrowUp'].includes(e.key) && links.length) {
            e.preventDefault();
            links[(idx + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length].focus();
          } else if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
            e.preventDefault();
            links[0]?.click();
          }
        }}
        ref={palette}
        className={css.palette}
        aria-label="Поиск и команды"
      >
        <input
          type="search"
          placeholder="Раздел, команда или вещь"
          aria-label="Искать в мастерской"
          value={term}
          onChange={(e) => search(e.target.value)}
        />
        {[
          ...Object.entries(pages).map(([k, [label]]) => [
            label,
            k === 'overview' ? '/admin' : '/admin/' + k,
          ]),
          ['Новая вещь', '/admin/items?new=1'],
          ...(term.trim()
            ? (data?.items || []).map((i) => [i.name, '/admin/items?item=' + encodeURIComponent(i.id)])
            : []),
        ]
          .filter(([label]) => label.toLowerCase().includes(term.toLowerCase()))
          .slice(0, 15)
          .map(([label, url]) => (
            <Link key={url} href={url} onClick={() => palette.current?.close()}>
              {label}
              <ArrowUpRight size={16} />
            </Link>
          ))}
        <button type="button" onClick={() => palette.current?.close()}>
          Закрыть
        </button>
      </dialog>
    </main>
  );
}
