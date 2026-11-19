'use client';
import { useEffect, useState } from 'react';
import { readStudio, studioKey, type Studio } from '@/domain/studio';
import { workshopCatalogEvent, workshopStorageKey } from '@/domain/workshop-catalog';

export function useStudio() {
  const [data, setData] = useState<Studio | null>(null),
    [error, setError] = useState('');
  useEffect(() => {
    function refresh() {
      try {
        setData(readStudio(localStorage));
        setError('');
      } catch {
        setError('Не удалось прочитать мастерскую. Исходные данные сохранены.');
      }
    }
    function storage(e: StorageEvent) {
      if (!e.key || e.key === studioKey || e.key === workshopStorageKey) refresh();
    }
    refresh();
    window.addEventListener('storage', storage);
    window.addEventListener(workshopCatalogEvent, refresh);
    return () => {
      window.removeEventListener('storage', storage);
      window.removeEventListener(workshopCatalogEvent, refresh);
    };
  }, []);
  return { data, error };
}
