'use client';
import { Suspense } from 'react';
import { StudioPage } from './studio-page';

export function AdminPanel() {
  return <Suspense><StudioPage section="overview"/></Suspense>;
}
