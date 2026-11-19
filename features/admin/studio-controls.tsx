'use client';
import {
  Children,
  isValidElement,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { MoreHorizontal } from 'lucide-react';
import css from './studio.module.css';

export function Button({
  variant,
  size = 'md',
  loading,
  children,
  ...props
}: ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}) {
  return (
    <button
      data-variant={variant}
      data-size={size}
      {...props}
      disabled={loading || props.disabled}
      aria-busy={loading}
    >
      {loading && <span className={css.spinner} />}
      {children}
    </button>
  );
}
export function IconButton({ label, ...props }: ComponentProps<'button'> & { label: string }) {
  return <Button type="button" title={label} aria-label={label} {...props} />;
}
export function Input({ onInvalid, onChange, ...props }: ComponentProps<'input'>) {
  const [error, setError] = useState(''),
    id = useId();
  return (
    <>
      <input
        {...props}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? id : props['aria-describedby']}
        onInvalid={(e) => {
          const input = e.currentTarget;
          const message = input.validity.valueMissing
            ? 'Заполни это поле.'
            : input.validity.rangeUnderflow
              ? 'Минимум · ' + input.min
              : input.validity.rangeOverflow
                ? 'Максимум · ' + input.max
                : 'Проверь введённое значение.';
          input.setCustomValidity(message);
          setError(message);
          onInvalid?.(e);
        }}
        onChange={(e) => {
          e.currentTarget.setCustomValidity('');
          setError('');
          onChange?.(e);
        }}
      />
      {error && (
        <small id={id} role="alert">
          {error}
        </small>
      )}
    </>
  );
}
export function Select(props: ComponentProps<'select'>) {
  const dialog = useRef<HTMLDialogElement>(null);
  const native = useRef<HTMLSelectElement>(null);
  const [query, search] = useState('');
  const options = Children.toArray(props.children).filter((el) =>
    isValidElement<{ value: string; children: ReactNode }>(el),
  );
  const current = options.find((el) => String(el.props.value) === String(props.value));
  return (
    <span className={css.selectWrap}>
      <select
        {...props}
        ref={native}
        tabIndex={-1}
        aria-hidden="true"
        className={css.nativeProxy}
        onInvalid={(e) => {
          e.preventDefault();
          dialog.current?.showModal();
        }}
      />
      <button
        type="button"
        disabled={props.disabled}
        aria-label={props['aria-label']}
        aria-haspopup="dialog"
        onClick={() => {
          search('');
          dialog.current?.showModal();
        }}
      >
        {current?.props.children ?? 'Выбрать'} <span aria-hidden="true">⌄</span>
      </button>
      <dialog ref={dialog} className={css.picker} aria-label={props['aria-label'] || 'Выбор значения'}>
        <input
          type="search"
          aria-label="Поиск варианта"
          placeholder="Найти вариант"
          value={query}
          onChange={(e) => search(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
        />
        <div
          onKeyDown={(e) => {
            const list = Array.from(e.currentTarget.querySelectorAll('button'));
            const i = list.indexOf(document.activeElement as HTMLButtonElement);
            if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
              e.preventDefault();
              list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]?.focus();
            }
          }}
        >
          {options
            .filter((el) => String(el.props.children).toLowerCase().includes(query.toLowerCase()))
            .map((el) => (
              <button
                key={String(el.props.value)}
                type="button"
                aria-pressed={el === current}
                onClick={() => {
                  if (native.current) {
                    native.current.value = String(el.props.value);
                    native.current.dispatchEvent(new Event('change', { bubbles: true }));
                  }
                  dialog.current?.close();
                }}
              >
                {el.props.children}
              </button>
            ))}
        </div>
        <button type="button" onClick={() => dialog.current?.close()}>
          Закрыть
        </button>
      </dialog>
    </span>
  );
}
export function Tabs({
  value,
  options,
  change,
}: {
  value: string;
  options: { id: string; label: string }[];
  change: (id: string) => void;
}) {
  return (
    <div role="group" aria-label="Раздел музыки" className={css.toolbar}>
      {options.map((o) => (
        <Button
          key={o.id}
          aria-pressed={value === o.id}
          data-primary={value === o.id}
          onClick={() => change(o.id)}
        >
          {o.label}
        </Button>
      ))}
    </div>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  return <span className={css.badge}>{children}</span>;
}
export function Toast({ children, close }: { children: ReactNode; close: () => void }) {
  return (
    <div className={css.toast} role="status">
      {children}{' '}
      <IconButton label="Закрыть уведомление" onClick={close}>
        ×
      </IconButton>
    </div>
  );
}
export function DataTable({ children }: { children: ReactNode }) {
  return (
    <div className={css.table}>
      <table>{children}</table>
    </div>
  );
}

export function ActionMenu({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details
      className={css.more}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.open = false;
      }}
      onKeyDown={(e) => {
        const el = e.currentTarget;
        if (e.key === 'Escape') {
          el.open = false;
          el.querySelector('summary')?.focus();
        }
        if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
          e.preventDefault();
          el.open = true;
          const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
          const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
          buttons[(i + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length]?.focus();
        }
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) e.currentTarget.open = false;
      }}
    >
      <summary aria-label={label}>
        <MoreHorizontal size={18} />
      </summary>
      <div>{children}</div>
    </details>
  );
}
