'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { localSignOut } from '@/lib/use-local-account';

export default function SignOutButton({ className }: { className: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function signOut() {
    setPending(true);
    try {
      await localSignOut();
      router.replace('/login');
    } catch {
      setPending(false);
      window.alert('Не удалось выйти. Попробуйте снова.');
    }
  }
  return (
    <button type="button" className={className} disabled={pending} onClick={signOut}>
      <LogOut size={16} aria-hidden="true"/> {pending ? 'Выходим…' : 'Выйти из аккаунта'}
    </button>
  );
}
