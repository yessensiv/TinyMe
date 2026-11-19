import { browserId } from '@/lib/browser-id';
import { openDB } from 'idb';
import type { MusicState, Track } from './music-storage';

export type WorkshopTrack = { playlistId?:string|null; isPublished?:boolean; id: string; title: string; artist: string; genre: string; description: string; color: string; duration: string; seconds: number; size: number };
export const workshopMusicEvent = 'tinyme:workshop-music';
const db = () => openDB('tinyme-workshop-music', 1, { upgrade(d) { d.createObjectStore('tracks'); d.createObjectStore('files'); } });
export async function loadWorkshopTracks(): Promise<WorkshopTrack[]> { return (await db()).getAll('tracks'); }
export async function workshopAudio(id: string): Promise<Blob | undefined> { return (await db()).get('files', id); }
export async function assignWorkshopPlaylist(ids:string[],playlistId:string|null){
  const database=await db();
  const tx=database.transaction('tracks','readwrite');
  for(const id of ids){
    const track=await tx.store.get(id);
    if(track)await tx.store.put({...track,playlistId},id);
  }
  await tx.done;
  notifyWorkshopMusic();
}
function notifyWorkshopMusic(){
  window.dispatchEvent(new Event(workshopMusicEvent));
  try { localStorage.setItem(workshopMusicEvent,browserId()); } catch { /* The current tab still receives the event. */ }
}
export async function saveWorkshopTrack(track: WorkshopTrack, file?: Blob) {
  const database = await db();
  const tx = database.transaction(['tracks', 'files'], 'readwrite');
  if (file) await tx.objectStore('files').put(file, track.id);
  else if (!await tx.objectStore('files').get(track.id)) { tx.abort(); throw Error('Выберите аудиофайл для трека.'); }
  await tx.objectStore('tracks').put(track, track.id);
  await tx.done;
  notifyWorkshopMusic();
}
export function mergeWorkshopMusic(state: MusicState, published: WorkshopTrack[], groups:{id:string;name:string;order:number}[]=[]): MusicState {
  const tracks: Track[] = published.filter(t=>t.isPublished!==false).map(t => ({id:t.id,title:t.title,duration:t.seconds,size:t.size,workshop:true}));
  const ids = new Set(tracks.map(t => t.id));
  const removed = new Set(state.tracks.filter(t => t.workshop && !ids.has(t.id)).map(t => t.id));
  return {...state, tracks:[...state.tracks.filter(t => !t.workshop), ...tracks],
    currentId:removed.has(state.currentId)?'builtin-evening':state.currentId,
    playlists:[...state.playlists.filter(p=>!p.id.startsWith('workshop-playlist:')).map(p => ({...p,trackIds:[...new Set([...p.trackIds.filter(id => !removed.has(id)), ...(p.id==='all'?[...ids]:[])])]})),
      ...[...groups].sort((a,b)=>a.order-b.order).map(p=>({id:'workshop-playlist:'+p.id,name:p.name,trackIds:published.filter(t=>t.isPublished!==false&&t.playlistId===p.id).map(t=>t.id)}))]};
}
export async function inspectWorkshopAudio(file: File): Promise<number> {
  if (!/\.(mp3|wav|ogg)$/i.test(file.name) || !file.size || file.size > 50 * 1024 * 1024) throw Error('Выберите MP3, WAV или OGG размером до 50 МБ.');
  const context = new AudioContext();
  try {
    const audio = await context.decodeAudioData(await file.arrayBuffer());
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) throw Error('EMPTY_AUDIO');
    return audio.duration;
  } catch { throw Error('Не удалось прочитать аудио. Проверьте файл и его формат.'); }
  finally { await context.close(); }
}
