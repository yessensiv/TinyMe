'use client';
import { useId, useState, type ComponentProps, type ReactNode } from 'react';
import css from './studio.module.css';

export function Button(props: ComponentProps<'button'>) {
  return <button {...props} />;
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
  return <select {...props} />;
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
