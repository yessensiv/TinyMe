'use client';
import { useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import css from './studio.module.css';

function iso(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}
export function DatePicker({
  value = '',
  min = '',
  onChange,
}: {
  value?: string;
  min?: string;
  onChange: (value: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [month, setMonth] = useState(new Date());
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  function choose(day: string) {
    onChange(day);
    dialog.current?.close();
  }
  useEffect(() => {
    const el = dialog.current;
    return () => el?.close();
  }, []);
  return (
    <span className={css.dateControl}>
      <button
        type="button"
        onClick={() => {
          setMonth(new Date((value || min || iso(new Date())) + 'T12:00:00'));
          dialog.current?.showModal();
        }}
      >
        <CalendarDays size={16} />
        {value ? value.split('-').reverse().join('.') : 'Выбрать дату'}
      </button>
      <dialog ref={dialog} className={css.calendar} aria-label="Выбор даты">
        <header>
          <button
            type="button"
            aria-label="Предыдущий месяц"
            onClick={() => setMonth(new Date(first.getFullYear(), first.getMonth() - 1, 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <strong>{first.toLocaleDateString('ru', { month: 'long', year: 'numeric' })}</strong>
          <button
            type="button"
            aria-label="Следующий месяц"
            onClick={() => setMonth(new Date(first.getFullYear(), first.getMonth() + 1, 1))}
          >
            <ChevronRight size={16} />
          </button>
        </header>
        <span className={css.days}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
            <small key={d}>{d}</small>
          ))}
          {Array.from({ length: days }, (_, i) => {
            const day = iso(new Date(first.getFullYear(), first.getMonth(), i + 1));
            return (
              <button
                type="button"
                key={day}
                disabled={day < min}
                style={i === 0 ? { gridColumnStart: ((first.getDay() + 6) % 7) + 1 } : undefined}
                aria-pressed={day === value}
                onClick={() => choose(day)}
              >
                {i + 1}
              </button>
            );
          })}
        </span>
        <footer>
          {[0, 7, 30].map((n) => {
            const d = new Date();
            d.setDate(d.getDate() + n);
            const day = iso(d);
            return (
              <button type="button" key={n} disabled={day < min} onClick={() => choose(day)}>
                {n ? '+' + n + ' дней' : 'Сегодня'}
              </button>
            );
          })}
          <button type="button" onClick={() => choose('')}>
            Очистить
          </button>
          <button type="button" onClick={() => dialog.current?.close()}>
            Закрыть
          </button>
        </footer>
      </dialog>
    </span>
  );
}
