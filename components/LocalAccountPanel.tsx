'use client';
import { useRouter } from 'next/navigation';
import { localSignOut, useLocalAccount } from '@/lib/use-local-account';
export default function LocalAccountPanel() {
  const { account } = useLocalAccount(); const router = useRouter();
  if (!account) return null;
  return <section className="settings-card"><h2>{account.name}</h2><p>{account.email}</p><p>{account.role === 'admin' ? 'Администратор · мастерская доступна' : 'Пользователь · комната и развитие'}</p><p>Локальный аккаунт этого браузера. Комната, музыка и прогресс пока общие для его локальных аккаунтов.</p><button className="button secondary" onClick={() => { localSignOut(); router.replace('/login'); }}>Выйти из аккаунта</button></section>;
}
