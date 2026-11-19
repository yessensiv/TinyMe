import {Suspense} from 'react';
import LocalAccess from '@/components/LocalAccess';
import {StudioPage} from '@/features/admin/studio-page';

export default function Page() {
  return <LocalAccess admin><Suspense><StudioPage section="music"/></Suspense></LocalAccess>;
}
