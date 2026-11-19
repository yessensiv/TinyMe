'use client';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { UploadCloud, X, PackageOpen } from 'lucide-react';
import css from './studio.module.css';
export function Drawer({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    heading = useId();
  useEffect(() => {
    const el = ref.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  return (
    <dialog
      aria-labelledby={heading}
      ref={ref}
      className={css.drawer}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <header>
        <h2 id={heading}>{title}</h2>
        <button type="button" aria-label="Закрыть панель" onClick={close}>
          <X size={18} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function FileDropzone({
  label,
  accept,
  multiple = true,
  onFiles,
}: {
  label: string;
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => Promise<void>;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function take(files: File[]) {
    if (busy || !files.length) return;
    setBusy(true);
    setError('');
    try {
      if (!multiple && files.length !== 1) throw Error('Выбери один файл.');
      await onFiles(files);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить файлы');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className={css.drop}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void take(Array.from(e.dataTransfer.files));
      }}
    >
      <input
        ref={ref}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          void take(Array.from(e.target.files ?? []));
          e.target.value = '';
        }}
      />
      <button type="button" disabled={busy} onClick={() => ref.current?.click()}>
        <UploadCloud size={18} />
        {busy ? 'Обрабатываем файлы…' : label}
      </button>
      {busy && <progress aria-label="Обработка файлов" />}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className={css.empty}>
      <PackageOpen size={26} aria-hidden="true" />
      {children}
    </div>
  );
}

export function ConfirmDialog({
  title,
  children,
  confirm,
  close,
  disabled = false,
}: {
  title: string;
  children: ReactNode;
  confirm: () => void;
  close: () => void;
  disabled?: boolean;
}) {
  return (
    <Drawer title={title} close={close}>
      {children}
      <footer>
        <button type="button" onClick={close}>
          Отмена
        </button>
        <button type="button" disabled={disabled} onClick={confirm}>
          Удалить
        </button>
      </footer>
    </Drawer>
  );
}
