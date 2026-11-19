'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { browserId } from '@/lib/browser-id';
import {
  assignWorkshopPlaylist,
  inspectWorkshopAudio,
  loadWorkshopTracks,
  saveWorkshopTrack,
  workshopAudio,
  workshopMusicEvent,
  type WorkshopTrack,
} from '@/lib/workshop-music';
import { prepareWorkshopImage } from '@/lib/workshop-image';
import type { Studio } from '@/domain/studio';
import type { Save } from './studio-groups';
import { Drawer, FileDropzone } from './studio-ui';
import { Tabs } from './studio-controls';
import css from './studio.module.css';
export function useTracks() {
  const [tracks, set] = useState<WorkshopTrack[]>([]),
    [error, fail] = useState('');
  useEffect(() => {
    let live = true;
    const read = () =>
      void loadWorkshopTracks()
        .then((v) => {
          if (live) set(v);
        })
        .catch(() => {
          if (live) fail('Не удалось загрузить музыкальную библиотеку.');
        });
    read();
    window.addEventListener(workshopMusicEvent, read);
    return () => {
      live = false;
      window.removeEventListener(workshopMusicEvent, read);
    };
  }, []);
  return { tracks, error };
}
function Player({ id }: { id: string }) {
  const [src, set] = useState('');
  useEffect(() => {
    let live = true,
      url = '';
    void workshopAudio(id).then((file) => {
      if (live && file) {
        url = URL.createObjectURL(file);
        set(url);
      }
    });
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);
  return src ? (
    <audio
      controls
      preload="none"
      src={src}
      aria-label="Предпрослушивание трека"
      style={{ maxWidth: '100%' }}
    />
  ) : null;
}
export function Music({ data, save }: { data: Studio; save: Save }) {
  const { tracks, error } = useTracks(),
    [tab, choose] = useState('tracks'),
    [progress, setProgress] = useState(''),
    [ids, select] = useState<string[]>([]),
    [playlist, assign] = useState(''),
    [edited, edit] = useState<WorkshopTrack | null>(null),
    [playing, play] = useState(''),
    [trackSource, setSource] = useState<WorkshopTrack | null>(null);
  const [newList, list] = useState(false),
    [listId, setListId] = useState(''),
    [name, setName] = useState(''),
    [cover, setCover] = useState('');
  const listKey = 'tinyme:playlist-draft:' + (listId || 'new');
  function openList(id = '') {
    setListId(id);
    const current = data.playlists.find((l) => l.id === id);
    const draft = JSON.parse(sessionStorage.getItem('tinyme:playlist-draft:' + (id || 'new')) ?? 'null');
    setName(draft?.name ?? current?.name ?? '');
    setCover(draft?.cover ?? current?.cover ?? '');
    list(true);
  }
  useEffect(() => {
    if (newList) {
      try {
        sessionStorage.setItem(listKey, JSON.stringify({ name, cover }));
      } catch {
        queueMicrotask(() => setProgress('Недостаточно места для черновика плейлиста.'));
      }
    }
  }, [newList, listKey, name, cover]);
  function closeList() {
    const current = data.playlists.find((l) => l.id === listId);
    if (
      (name === (current?.name ?? '') && cover === (current?.cover ?? '')) ||
      confirm('Закрыть плейлист и оставить черновик?')
    )
      list(false);
  }
  function openTrack(t: WorkshopTrack) {
    setSource(t);
    edit({ ...t, ...JSON.parse(sessionStorage.getItem('tinyme:track-draft:' + t.id) ?? '{}'), id: t.id });
  }
  function closeTrack() {
    if (
      JSON.stringify(edited) === JSON.stringify(trackSource) ||
      confirm('Закрыть трек и оставить черновик?')
    )
      edit(null);
  }
  useEffect(() => {
    if (edited && JSON.stringify(edited) !== JSON.stringify(trackSource))
      sessionStorage.setItem('tinyme:track-draft:' + edited.id, JSON.stringify(edited));
  }, [edited, trackSource]);
  async function write(t: WorkshopTrack) {
    await saveWorkshopTrack(t);
  }
  async function upload(files: File[]) {
    try {
      for (const [n, f] of files.entries()) {
        setProgress('Загрузка ' + (n + 1) + ' из ' + files.length + ' · ' + f.name);
        const seconds = await inspectWorkshopAudio(f);
        const t = {
          id: 'workshop-track:' + browserId(),
          title: f.name.replace(/\.[^.]+$/, ''),
          artist: '',
          genre: 'Эмбиент',
          description: '',
          color: '#cc9d89',
          duration: Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0'),
          seconds,
          size: f.size,
          isPublished: false,
          playlistId: null,
        };
        await saveWorkshopTrack(t, f);
        await save('Загружен трек «' + t.title + '»', () => {});
      }
    } finally {
      setProgress('');
    }
  }
  return (
    <>
      <Tabs
        value={tab}
        change={choose}
        options={[
          { id: 'tracks', label: 'Треки · ' + tracks.length },
          { id: 'lists', label: 'Плейлисты · ' + data.playlists.length },
        ]}
      />
      {error && <p role="alert">{error}</p>}
      {tab === 'tracks' ? (
        <>
          <section className={css.audioUpload}>
            <div className={css.record} aria-hidden="true" />
            <div>
              <h2>{tracks.length ? 'Добавить музыку' : 'Загрузи первый трек'}</h2>
              <p>Перетащи MP3, WAV или OGG в область загрузки. Можно выбрать несколько файлов сразу.</p>
              <FileDropzone label="Выбрать аудиофайлы" accept=".mp3,.wav,.ogg" onFiles={upload} />
            </div>
          </section>
          <p role="status">{progress}</p>
          <h2>Библиотека треков</h2>
          {!tracks.length && <p>Загруженные треки появятся здесь как черновики. Прослушай трек и открой «Изменить», чтобы опубликовать его в комнате.</p>}
          {!!ids.length && (
            <div className={css.toolbar}>
              <select
                aria-label="Назначить плейлист"
                value={playlist}
                onChange={(e) => assign(e.target.value)}
              >
                <option value="">Без плейлиста</option>
                {data.playlists.map((l) => (
                  <option value={l.id} key={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <button
                onClick={async () => {
                  try {
                    await assignWorkshopPlaylist(ids, playlist || null);
                    await save('Назначен плейлист для треков', () => {});
                    select([]);
                  } catch {
                    setProgress('Не удалось назначить плейлист. Повтори попытку.');
                  }
                }}
              >
                Применить к выбранным
              </button>
            </div>
          )}
          {tracks.map((t) => (
            <article className={css.row} key={t.id}>
              <input
                type="checkbox"
                aria-label={'Выбрать ' + t.title}
                checked={ids.includes(t.id)}
                onChange={(e) => select(e.target.checked ? [...ids, t.id] : ids.filter((id) => id !== t.id))}
              />
              <strong>{t.title}</strong>
              <small>
                {t.duration} · {(t.size / 1048576).toFixed(1)} МБ ·{' '}
                {t.isPublished === false ? 'Черновик' : 'Опубликовано'}
              </small>
              <button onClick={() => play(playing === t.id ? '' : t.id)}>{playing === t.id ? 'Закрыть плеер' : 'Прослушать'}</button>
              <button onClick={() => openTrack(t)}>Изменить</button>
              {playing === t.id && <Player id={t.id} />}
            </article>
          ))}
        </>
      ) : (
        <>
          <div className={css.playlistIntro}><h2>{data.playlists.length ? "Мои плейлисты" : "Создай первый плейлист"}</h2><p>Собери музыку для одного настроения. Добавить треки можно во вкладке «Треки».</p><button data-primary="true" onClick={() => openList()}>Создать плейлист</button></div>
          {data.playlists.map((l) => (
            <div className={css.row} key={l.id}>
              {l.cover && <Image unoptimized src={l.cover} width={48} height={48} alt="" />}
              <strong>{l.name}</strong>Треков · {tracks.filter((t) => t.playlistId === l.id).length}
              <button onClick={() => openList(l.id)}>Изменить</button>
            </div>
          ))}
        </>
      )}
      {newList && (
        <Drawer title={listId ? 'Редактирование плейлиста' : 'Новый плейлист'} close={closeList}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                await save('Сохранён плейлист «' + name + '»', (s) => {
                  const current = s.playlists.find((l) => l.id === listId);
                  if (current) {
                    current.name = name.trim();
                    current.cover = cover;
                  } else
                    s.playlists.push({
                      id: browserId(),
                      name: name.trim(),
                      cover,
                      order: s.playlists.length,
                    });
                })
              ) {
                sessionStorage.removeItem(listKey);
                list(false);
                setName('');
                setCover('');
              }
            }}
          >
            <fieldset>
              <label>
                Название
                <input required value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <FileDropzone
                label="Выбрать обложку"
                accept="image/*"
                multiple={false}
                onFiles={async (files) => setCover(await prepareWorkshopImage(files[0]))}
              />
            </fieldset>
            <footer>
              <button type="button" onClick={closeList}>
                Отмена
              </button>
              <button>Сохранить</button>
            </footer>
          </form>
        </Drawer>
      )}
      {edited && (
        <Drawer title="Редактирование трека" close={closeTrack}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await write(edited);
                await save('Изменён трек «' + edited.title + '»', () => {});
                sessionStorage.removeItem('tinyme:track-draft:' + edited.id);
                edit(null);
              } catch {
                setProgress('Не удалось сохранить трек.');
              }
            }}
          >
            <fieldset>
              {(
                [
                  ['title', 'Название'],
                  ['artist', 'Исполнитель'],
                  ['genre', 'Жанр'],
                  ['description', 'Описание'],
                  ['color', 'Цвет превью'],
                ] as const
              ).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    type={key === 'color' ? 'color' : 'text'}
                    required={key === 'title'}
                    value={edited[key]}
                    onChange={(e) => edit({ ...edited, [key]: e.target.value })}
                  />
                </label>
              ))}
              <Player id={edited.id} />
              <label className={css.check}>
                <input
                  type="checkbox"
                  checked={edited.isPublished !== false}
                  onChange={(e) => edit({ ...edited, isPublished: e.target.checked })}
                />
                Опубликовать
              </label>
            </fieldset>
            <footer>
              <button type="button" onClick={closeTrack}>
                Отмена
              </button>
              <button>Сохранить</button>
            </footer>
          </form>
        </Drawer>
      )}
    </>
  );
}
