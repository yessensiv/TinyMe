'use client';
import { useMemo, useSyncExternalStore } from 'react';
import { currentLocalAccount, localAuthEvent, sessionKey, type LocalAccount } from './local-auth';
function subscribe(callback: () => void) {
  window.addEventListener(localAuthEvent, callback); window.addEventListener('storage', callback);
  return () => { window.removeEventListener(localAuthEvent, callback); window.removeEventListener('storage', callback); };
}
function snapshot() {
  try { return JSON.stringify({ account: currentLocalAccount(localStorage, sessionStorage), error: '' }); }
  catch { return JSON.stringify({ account: null, error: 'Локальное хранилище аккаунтов недоступно.' }); }
}
const serverSnapshot = () => '';
export function useLocalAccount() {
  const value = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return useMemo(() => value ? { ...JSON.parse(value) as { account: LocalAccount | null; error: string }, ready: true }
    : { account: null, error: '', ready: false }, [value]);
}
export function localSignOut() { sessionStorage.removeItem(sessionKey); window.dispatchEvent(new Event(localAuthEvent)); }
